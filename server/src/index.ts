import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { handleLocalAiIngest } from "./localAi.js";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);
const pythonDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../python");

app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, at: new Date().toISOString() });
});

app.post("/api/local-ai/ingest", (req, res) => {
  void handleLocalAiIngest(req, res, pythonDir);
});

app.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});
