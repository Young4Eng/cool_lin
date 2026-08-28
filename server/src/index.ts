import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { runPipeline, type Candidate, type UserRole } from "@cool-lin/schedule-engine";
import { withExtractAndAi } from "./ingestPipeline.js";
import {
  handleLocalAiComplete,
  handleLocalAiIngest,
  handleRedact,
  parseIngestBody,
  runLocalAiIngest,
} from "./localAi.js";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);
const pythonDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../python");

/**
 * 로컬 AI ingest 를 끄려면 LOCAL_AI_INGEST 를 빈 문자열로 둔다.
 * 예전에는 HTTP 로 자기 자신에 fire-and-forget 했는데, 위젯이 items 를
 * 같은 응답에서 받아야 해서 지금은 프로세스 안에서 기다린다.
 */
const LOCAL_AI_ENABLED = (process.env.LOCAL_AI_INGEST ?? "on") !== "";

/** 내려받기(~90s) + Ollama(~120s) 를 한 응답에서 기다리므로 HTTP 한도를 넉넉히. */
const INGEST_HTTP_TIMEOUT_MS = 240000;

/** 최초 실행에서 교사가 고르는 역할 태그. 이름·학교명은 받지 않는다. */
const DEFAULT_ROLE: UserRole = { homeroom: true, grades: [2], interests: ["연수", "평가"] };

app.use(cors());
// 쪽지 시트 전체를 그대로 실어 보낼 수 있어 기본 100kb 한도로는 부족하다.
app.use(express.json({ limit: "5mb" }));

function pythonCmd(): { cmd: string; prefix: string[] } {
  if (process.platform === "win32") {
    return { cmd: "py", prefix: ["-3"] };
  }
  return { cmd: "python3", prefix: [] };
}

function runIngest(mode: "ingest" | "latest"): Promise<Record<string, unknown>> {
  const { cmd, prefix } = pythonCmd();
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, [...prefix, "ingest.py", mode], {
      cwd: pythonDir,
      windowsHide: true,
      env: { ...process.env, PYTHONIOENCODING: "utf-8", PYTHONUTF8: "1" },
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("쿨메신저 조작이 너무 오래 걸렸습니다."));
    }, 90000);
    child.stdout.on("data", (d) => {
      stdout += d.toString("utf8");
    });
    child.stderr.on("data", (d) => {
      stderr += d.toString("utf8");
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        reject(new Error("Python이 없습니다. py -3 또는 python3 를 설치해 주세요."));
        return;
      }
      reject(err);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      const line = stdout.trim().split(/\r?\n/).filter(Boolean).pop() ?? "";
      try {
        const data = JSON.parse(line) as Record<string, unknown>;
        resolve(data);
      } catch {
        reject(
          new Error(
            line || stderr.trim() || `python exited ${code ?? "?"}`,
          ),
        );
      }
    });
  });
}

/**
 * 내려받은 파일에서 일정 후보를 뽑는다.
 *
 * 규칙은 packages/schedule-engine 한 곳에만 있다. 위젯도 같은 규칙을 쓰므로
 * «위젯과 서버가 서로 다른 날짜를 말하는» 일이 생기지 않는다.
 */
async function extractCandidates(file: string): Promise<{
  candidates: Candidate[];
  stats: Record<string, number> | null;
  error?: string;
}> {
  try {
    const result = await runPipeline([file], { windowDays: 14, role: DEFAULT_ROLE });
    return { candidates: result.candidates, stats: result.stats as unknown as Record<string, number> };
  } catch (e) {
    // 추출이 실패해도 «내려받기»는 성공한 것이다. 그 사실을 지우지 않는다.
    return { candidates: [], stats: null, error: e instanceof Error ? e.message : String(e) };
  }
}

async function runLocalAiForFile(file: string, sheets?: unknown) {
  if (!LOCAL_AI_ENABLED) {
    return {
      ok: false,
      items: [],
      model: undefined,
      error: "로컬 AI ingest가 꺼져 있습니다.",
    };
  }
  const parsed = parseIngestBody({ file, sheets });
  return runLocalAiIngest({ file: parsed.file ?? file, sheets: parsed.sheets, pythonDir });
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, at: new Date().toISOString() });
});

/** 원문 xls를 로컬 Ollama로 보내기 전에 개인정보를 비식별하고 일정 후보를 뽑는다 (#5). */
app.post("/api/local-ai/ingest", (req, res) => {
  void handleLocalAiIngest(req, res, pythonDir);
});

/** 요약·스마트 답장. 본문은 서버에서 비식별한 뒤에만 Ollama 로 보낸다. pii_map 없음. */
app.post("/api/local-ai/complete", (req, res) => {
  void handleLocalAiComplete(req, res);
});

/** 브라우저가 원문을 Ollama 로 직접 보내지 않도록 비식별 텍스트만 돌려 준다. pii_map 없음. */
app.post("/api/redact", (req, res) => {
  handleRedact(req, res);
});

function stretchTimeout(req: express.Request, res: express.Response) {
  req.setTimeout(INGEST_HTTP_TIMEOUT_MS);
  res.setTimeout(INGEST_HTTP_TIMEOUT_MS);
}

/** 내려받기 → 규칙 엔진 → 로컬 AI items 까지 한 응답. Ollama 가 꺼져도 추출은 200. */
async function handleIngest(mode: "ingest" | "latest", res: express.Response, failStatus: number) {
  try {
    const data = await runIngest(mode);
    if (!data.ok) {
      res.status(failStatus).json(data);
      return;
    }

    const payload = await withExtractAndAi(data, {
      extractCandidates,
      runLocalAi: (file) => runLocalAiForFile(file, data.sheets),
    });
    res.status(200).json(payload);
  } catch (e) {
    res.status(400).json({ ok: false, error: e instanceof Error ? e.message : String(e), steps: [] });
  }
}

app.post("/api/ingest", (req, res) => {
  stretchTimeout(req, res);
  void handleIngest("ingest", res, 400);
});
app.post("/api/open-latest", (req, res) => {
  stretchTimeout(req, res);
  void handleIngest("latest", res, 404);
});

/** 이미 가지고 있는 파일에서 후보만 다시 뽑고 싶을 때 */
app.post("/api/candidates", async (req, res) => {
  const file = typeof req.body?.file === "string" ? req.body.file : "";
  if (file === "") {
    res.status(400).json({ ok: false, error: "file 경로가 필요합니다." });
    return;
  }
  const extracted = await extractCandidates(file);
  if (extracted.error !== undefined) {
    res.status(400).json({ ok: false, error: extracted.error });
    return;
  }
  res.json({ ok: true, candidates: extracted.candidates, stats: extracted.stats });
});

app.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});
