import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, test } from "node:test";
import {
  decryptPiiToken,
  decryptString,
  loadEncryptedPiiMap,
  loadOrCreateKey,
  persistEncryptedPiiMap,
  piiKeyPath,
  piiMapPath,
} from "../src/encrypt.js";
import { withExtractAndAi } from "../src/ingestPipeline.js";
import { buildLocalAiPrompt, runLocalAiIngest, type Sheets } from "../src/localAi.js";
import { redactSheets } from "../src/redact.js";

const RAW_TEACHER = "\uCD5C\uC740\uC9C0";
const RAW_STUDENT = "\uAE40\uBBFC\uC900";
const RAW_EMAIL = "teacher@school.kr";
const RAW_PHONE = "010-1234-5678";
const RAW_NAMES = [RAW_TEACHER, RAW_STUDENT, RAW_EMAIL, RAW_PHONE];

function sampleSheets(): Sheets {
  return {
    "\uBC1B\uC740\uBA54\uC2DC\uC9C0": [
      {
        "\uBCF4\uB0B8\uC0AC\uB78C": RAW_TEACHER,
        "\uBC1B\uC740\uC0AC\uB78C": RAW_STUDENT,
        "\uC81C\uBAA9": "\uC0C1\uB2F4 \uC77C\uC815 \uC548\uB0B4",
        "\uB0A0\uC9DC/\uC2DC\uAC04": "2026-08-28 09:00",
        "\uB0B4\uC6A9": `${RAW_STUDENT} \uD559\uC0DD \uC0C1\uB2F4\uC744 \uB0B4\uC77C \uC624\uD6C4 3\uC2DC\uC5D0 \uC9C4\uD589\uD569\uB2C8\uB2E4. \uBB38\uC758\uB294 ${RAW_EMAIL} \uB610\uB294 ${RAW_PHONE} \uB85C \uC8FC\uC138\uC694.`,
        "\uCCA8\uBD80\uD30C\uC77C": "",
      },
    ],
  };
}

function isolatedPiiDir(): string {
  const dir = mkdtempSync(path.join(os.tmpdir(), "cool-lin-pii-"));
  process.env.COOL_LIN_PII_DIR = dir;
  return dir;
}

const dirs: string[] = [];

afterEach(() => {
  delete process.env.COOL_LIN_PII_DIR;
  while (dirs.length) {
    const dir = dirs.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});

function assertNoRawPii(text: string, label: string): void {
  for (const raw of RAW_NAMES) {
    assert.equal(text.includes(raw), false, `${label} must not contain raw PII`);
  }
}

describe("local PII encryption", { concurrency: false }, () => {
  test("AES-256-GCM roundtrip and 0600-ish key file", () => {
    dirs.push(isolatedPiiDir());
    const key = loadOrCreateKey();
    assert.equal(key.length, 32);
    const again = loadOrCreateKey();
    assert.deepEqual(again, key);
    const keyFile = readFileSync(piiKeyPath());
    assert.equal(keyFile.length, 32);
    assert.equal(Buffer.compare(keyFile, key), 0);
  });

  test("redact keeps PERSON_n for the model and encrypts originals at rest", () => {
    dirs.push(isolatedPiiDir());
    const { sheets, pii_tokens } = redactSheets(sampleSheets());
    const dumped = JSON.stringify(sheets);
    assertNoRawPii(dumped, "redacted sheets");
    assert.equal(sheets["\uBC1B\uC740\uBA54\uC2DC\uC9C0"]?.[0]?.["\uBCF4\uB0B8\uC0AC\uB78C"], "PERSON_1");
    assert.equal(sheets["\uBC1B\uC740\uBA54\uC2DC\uC9C0"]?.[0]?.["\uBC1B\uC740\uC0AC\uB78C"], "PERSON_2");
    assert.match(sheets["\uBC1B\uC740\uBA54\uC2DC\uC9C0"]?.[0]?.["\uB0B4\uC6A9"] ?? "", /PERSON_2/);
    assert.match(sheets["\uBC1B\uC740\uBA54\uC2DC\uC9C0"]?.[0]?.["\uB0B4\uC6A9"] ?? "", /EMAIL_1/);
    assert.match(sheets["\uBC1B\uC740\uBA54\uC2DC\uC9C0"]?.[0]?.["\uB0B4\uC6A9"] ?? "", /PHONE_1/);
    assert.ok(pii_tokens.includes("PERSON_1"));
    assert.ok(pii_tokens.includes("PERSON_2"));
    assert.ok(pii_tokens.includes("EMAIL_1"));
    assert.ok(pii_tokens.includes("PHONE_1"));

    const stored = JSON.parse(readFileSync(piiMapPath(), "utf8")) as Record<string, { iv: string; ciphertext: string; tag: string }>;
    assertNoRawPii(JSON.stringify(stored), "pii-map.json");
    const key = loadOrCreateKey();
    assert.equal(decryptString(stored.PERSON_1, key), RAW_TEACHER);
    assert.equal(decryptString(stored.PERSON_2, key), RAW_STUDENT);
    assert.equal(decryptString(stored.EMAIL_1, key), RAW_EMAIL);
    assert.equal(decryptString(stored.PHONE_1, key), RAW_PHONE);
    assert.equal(decryptPiiToken("PERSON_1"), RAW_TEACHER);
  });

  test("Ollama prompt has PERSON_1 not the raw teacher name, and not ciphertext", () => {
    dirs.push(isolatedPiiDir());
    const { sheets } = redactSheets(sampleSheets());
    const prompt = buildLocalAiPrompt(sheets);
    assertNoRawPii(prompt, "Ollama prompt");
    assert.match(prompt, /PERSON_1/);
    assert.match(prompt, /\uB0B4\uC77C \uC624\uD6C4 3\uC2DC/);
    const map = loadEncryptedPiiMap();
    for (const blob of Object.values(map)) {
      assert.equal(prompt.includes(blob.ciphertext), false, "prompt must not contain ciphertext");
    }
  });

  test("merge/update keeps previous tokens and updates overlapping ones", () => {
    dirs.push(isolatedPiiDir());
    redactSheets(sampleSheets());
    const first = loadEncryptedPiiMap();
    persistEncryptedPiiMap({ PERSON_1: RAW_TEACHER, PHONE_1: "010-9999-0000" });
    const merged = loadEncryptedPiiMap();
    assert.ok(merged.PERSON_2, "PERSON_2 from the first batch must remain");
    assert.ok(merged.EMAIL_1, "EMAIL_1 from the first batch must remain");
    assert.equal(decryptPiiToken("PERSON_1"), RAW_TEACHER);
    assert.equal(decryptPiiToken("PHONE_1"), "010-9999-0000");
    assert.notEqual(merged.PERSON_1.ciphertext, first.PERSON_1.ciphertext);
  });

  test("runLocalAiIngest never sends raw names to Ollama and never returns pii_map values", async () => {
    dirs.push(isolatedPiiDir());
    let captured = "";
    const origFetch = globalThis.fetch;
    globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? "{}")) as {
        messages?: { content?: string }[];
      };
      captured = (body.messages ?? []).map((m) => m.content ?? "").join("\n");
      return new Response(
        JSON.stringify({
          model: "qwen2.5:3b",
          message: {
            content: JSON.stringify({
              items: [
                {
                  title: "\uD559\uC0DD \uC0C1\uB2F4",
                  when: "\uB0B4\uC77C \uC624\uD6C4 3\uC2DC",
                  due: "",
                  source_sheet: "\uBC1B\uC740\uBA54\uC2DC\uC9C0",
                  source_title: "\uC0C1\uB2F4 \uC77C\uC815 \uC548\uB0B4",
                },
              ],
            }),
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }) as typeof fetch;

    try {
      const result = await runLocalAiIngest({ sheets: sampleSheets(), pythonDir: "." });
      assertNoRawPii(captured, "Ollama request body");
      assert.match(captured, /PERSON_1/);
      assert.equal(result.ok, true);
      assert.equal(result.items.length, 1);
      assert.equal(result.items[0]?.title, "\uD559\uC0DD \uC0C1\uB2F4");
      const httpLike = {
        ok: result.ok,
        model: result.model,
        items: result.items,
        redacted_preview: result.redacted_preview,
        pii_tokens: result.pii_tokens,
      };
      const dumped = JSON.stringify(httpLike);
      assertNoRawPii(dumped, "HTTP-like ingest result");
      assert.equal("pii_map" in (result as object), false);
      assert.ok((result.pii_tokens ?? []).includes("PERSON_1"));
      assert.equal(decryptPiiToken("PERSON_1"), RAW_TEACHER);
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  test("ingest pipeline still returns items and only token names for PII", async () => {
    const result = await withExtractAndAi(
      { ok: true, file: "C:\\\\tmp\\\\coolmsg_20260828.xls" },
      {
        extractCandidates: async () => ({ candidates: [], stats: null }),
        runLocalAi: async () => ({
          ok: true,
          items: [
            {
              title: "\uAD50\uBB34\uD68C\uC758",
              when: "2026-08-28T15:00",
              due: "",
              source_sheet: "\uBC1B\uC740\uBA54\uC2DC\uC9C0",
              source_title: "\uD68C\uC758 \uC548\uB0B4",
            },
          ],
          model: "qwen2.5:3b",
          pii_tokens: ["PERSON_1", "EMAIL_1"],
        }),
      },
    );
    assert.deepEqual(result.pii_tokens, ["PERSON_1", "EMAIL_1"]);
    assert.equal((result.items as { title: string }[])[0]?.title, "\uAD50\uBB34\uD68C\uC758");
    assertNoRawPii(JSON.stringify(result), "withExtractAndAi payload");
  });
});
