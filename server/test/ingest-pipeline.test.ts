import assert from "node:assert/strict";
import { test } from "node:test";
import type { Candidate } from "@cool-lin/schedule-engine";
import { withExtractAndAi } from "../src/ingestPipeline.js";
import type { ExtractedItem } from "../src/localAi.js";

const FILE = "C:\\\\users\\\\teacher\\\\coolmsg_20260828.xls";

const candidate = { id: "c1", proposedTitle: "특근매식비 제출" } as unknown as Candidate;

const item: ExtractedItem = {
  title: "교무회의",
  when: "2026-08-28T15:00",
  due: "",
  source_sheet: "받은메시지",
  source_title: "회의 안내",
};

test("ingest waits for local AI and returns items with extract fields", async () => {
  let extractCalled = false;
  let aiCalled = false;
  let aiFinishedAt = 0;

  const result = await withExtractAndAi(
    { ok: true, file: FILE, sheets: { 받은메시지: [] } },
    {
      extractCandidates: async () => {
        extractCalled = true;
        return { candidates: [candidate], stats: { messages: 4 } };
      },
      runLocalAi: async () => {
        await new Promise((r) => setTimeout(r, 20));
        aiCalled = true;
        aiFinishedAt = Date.now();
        return { ok: true, items: [item], model: "qwen2.5:3b" };
      },
    },
  );

  assert.equal(extractCalled, true);
  assert.equal(aiCalled, true);
  assert.ok(aiFinishedAt > 0, "local AI must finish before the response is built");
  assert.equal(result.ok, true);
  assert.equal(result.file, FILE);
  assert.deepEqual(result.items, [item]);
  assert.equal((result.ai as { ok: boolean }).ok, true);
  assert.equal((result.ai as { model?: string }).model, "qwen2.5:3b");
  assert.equal((result.candidates as Candidate[]).length, 1);
  assert.equal((result.extraction as { count: number }).count, 1);
});

test("Ollama down still returns extract ok with empty items and candidates fallback", async () => {
  const result = await withExtractAndAi(
    { ok: true, file: FILE, sheets: { 받은메시지: [{ 제목: "공문" }] } },
    {
      extractCandidates: async () => ({
        candidates: [candidate],
        stats: { messages: 1 },
      }),
      runLocalAi: async () => ({
        ok: false,
        items: [],
        error: "로컬 Ollama에 연결할 수 없습니다.",
        model: "qwen2.5:3b",
      }),
    },
  );

  assert.equal(result.ok, true);
  assert.deepEqual(result.items, []);
  assert.equal((result.ai as { ok: boolean }).ok, false);
  assert.equal((result.ai as { error?: string }).error, "로컬 Ollama에 연결할 수 없습니다.");
  assert.equal((result.candidates as Candidate[]).length, 1);
  assert.equal((result.extraction as { count: number }).count, 1);
});

test("Ollama throw does not fail the download response", async () => {
  const result = await withExtractAndAi(
    { ok: true, file: FILE },
    {
      extractCandidates: async () => ({ candidates: [candidate], stats: null }),
      runLocalAi: async () => {
        throw new Error("로컬 Ollama 응답이 시간 초과되었습니다.");
      },
    },
  );

  assert.equal(result.ok, true);
  assert.deepEqual(result.items, []);
  assert.equal((result.ai as { ok: boolean }).ok, false);
  assert.match(String((result.ai as { error?: string }).error), /시간 초과/);
  assert.equal((result.candidates as Candidate[]).length, 1);
});
