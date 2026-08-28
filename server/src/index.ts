import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { runPipeline, type Candidate, type UserRole } from "@cool-lin/schedule-engine";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);
const pythonDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../python");

/**
 * 로컬 AI 주소.
 *
 * 예전에는 이 서버 자신(127.0.0.1:4000)을 가리키고 있었는데 그 경로가 없어서
 * 매번 실패하고 조용히 묻혔다. 지금은 환경변수로 받고, 값이 없으면 아예 보내지 않는다.
 */
const LOCAL_AI_INGEST = process.env.LOCAL_AI_INGEST ?? "";

/** 최초 실행에서 교사가 고르는 역할 태그. 이름·학교명은 받지 않는다. */
const DEFAULT_ROLE: UserRole = { homeroom: true, grades: [2], interests: ["연수", "평가"] };

app.use(cors());
app.use(express.json());

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

/**
 * 로컬 AI에 넘긴다.
 *
 * 원문 행이 아니라 **마스킹을 지난 구조화 후보만** 보낸다 (PRD 7장 신뢰 경계).
 * 주소가 설정돼 있지 않으면 아무것도 하지 않는다.
 */
async function forwardToLocalAi(candidates: Candidate[]): Promise<void> {
  if (LOCAL_AI_INGEST === "" || candidates.length === 0) return;
  try {
    await fetch(LOCAL_AI_INGEST, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidates }),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    // 로컬 AI가 꺼져 있어도 추출은 성공으로 둔다.
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, at: new Date().toISOString() });
});

/** 내려받기 → 일정 후보 추출까지 한 번에. 응답 모양은 기존 그대로 두고 candidates 만 더한다. */
async function handleIngest(mode: "ingest" | "latest", res: express.Response, failStatus: number) {
  try {
    const data = await runIngest(mode);
    if (!data.ok) {
      res.status(failStatus).json(data);
      return;
    }

    const file = typeof data.file === "string" ? data.file : "";
    const extracted = file === "" ? { candidates: [], stats: null, error: "파일 경로가 없습니다." } : await extractCandidates(file);

    res.status(200).json({
      ...data,
      candidates: extracted.candidates,
      extraction: { count: extracted.candidates.length, stats: extracted.stats, error: extracted.error ?? null },
    });
    void forwardToLocalAi(extracted.candidates);
  } catch (e) {
    res.status(400).json({ ok: false, error: e instanceof Error ? e.message : String(e), steps: [] });
  }
}

app.post("/api/ingest", (_req, res) => void handleIngest("ingest", res, 400));
app.post("/api/open-latest", (_req, res) => void handleIngest("latest", res, 404));

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
