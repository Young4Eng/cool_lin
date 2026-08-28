import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);
const pythonDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../python");

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

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, at: new Date().toISOString() });
});

app.post("/api/ingest", async (_req, res) => {
  try {
    const data = await runIngest("ingest");
    res.status(data.ok ? 200 : 400).json(data);
  } catch (e) {
    res.status(400).json({ ok: false, error: e instanceof Error ? e.message : String(e), steps: [] });
  }
});

app.post("/api/open-latest", async (_req, res) => {
  try {
    const data = await runIngest("latest");
    res.status(data.ok ? 200 : 404).json(data);
  } catch (e) {
    res.status(400).json({ ok: false, error: e instanceof Error ? e.message : String(e), steps: [] });
  }
});

app.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});
