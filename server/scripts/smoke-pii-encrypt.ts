/**
 * Smoke: redact + encrypt sample messenger JSON.
 * Prints pass/fail only — no raw names, no key bytes.
 */
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  decryptPiiToken,
  loadEncryptedPiiMap,
  piiKeyPath,
} from "../src/encrypt.js";
import { buildLocalAiPrompt, runLocalAiIngest, type Sheets } from "../src/localAi.js";
import { redactSheets } from "../src/redact.js";

const RAW_TEACHER = "\uCD5C\uC740\uC9C0";
const RAW_STUDENT = "\uAE40\uBBFC\uC900";

function sample(): Sheets {
  return {
    "\uBC1B\uC740\uBA54\uC2DC\uC9C0": [
      {
        "\uBCF4\uB0B8\uC0AC\uB78C": RAW_TEACHER,
        "\uBC1B\uC740\uC0AC\uB78C": RAW_STUDENT,
        "\uC81C\uBAA9": "\uC0C1\uB2F4 \uC77C\uC815 \uC548\uB0B4",
        "\uB0A0\uC9DC/\uC2DC\uAC04": "2026-08-28 09:00",
        "\uB0B4\uC6A9": `${RAW_STUDENT} \uD559\uC0DD \uC0C1\uB2F4\uC744 \uB0B4\uC77C \uC624\uD6C4 3\uC2DC\uC5D0 \uC9C4\uD589\uD569\uB2C8\uB2E4.`,
        "\uCCA8\uBD80\uD30C\uC77C": "",
      },
    ],
  };
}

function hasRaw(text: string): boolean {
  return text.includes(RAW_TEACHER) || text.includes(RAW_STUDENT);
}

async function main(): Promise<void> {
  const dir = mkdtempSync(path.join(os.tmpdir(), "cool-lin-pii-smoke-"));
  process.env.COOL_LIN_PII_DIR = dir;
  const prodKeyPath = process.platform === "win32"
    ? path.join(process.env.LOCALAPPDATA || "", "cool_lin", "pii.key")
    : path.join(process.env.XDG_DATA_HOME || path.join(os.homedir(), ".local", "share"), "cool_lin", "pii.key");

  let captured = "";
  const origFetch = globalThis.fetch;
  globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body ?? "{}")) as { messages?: { content?: string }[] };
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
    const { sheets } = redactSheets(sample());
    const prompt = buildLocalAiPrompt(sheets);
    const promptHasPerson = prompt.includes("PERSON_1");
    const promptHasRaw = hasRaw(prompt);
    const map = loadEncryptedPiiMap();
    const promptHasCipher = Object.values(map).some((b) => prompt.includes(b.ciphertext));
    const roundtrip = decryptPiiToken("PERSON_1") === RAW_TEACHER;

    const result = await runLocalAiIngest({ sheets: sample(), pythonDir: "." });
    const fetchHasRaw = hasRaw(captured);
    const resultHasRaw = hasRaw(JSON.stringify({
      ok: result.ok,
      items: result.items,
      redacted_preview: result.redacted_preview,
      pii_tokens: result.pii_tokens,
    }));
    const scheduleOk = result.ok && result.items.length === 1;

    const pass =
      promptHasPerson &&
      !promptHasRaw &&
      !promptHasCipher &&
      roundtrip &&
      !fetchHasRaw &&
      captured.includes("PERSON_1") &&
      !resultHasRaw &&
      scheduleOk;

    const lines = [
      `SMOKE: ${pass ? "PASS" : "FAIL"}`,
      `key_path=${prodKeyPath}`,
      `smoke_dir=${dir}`,
      `prompt_has_PERSON_1=${promptHasPerson}`,
      `prompt_has_raw_name=${promptHasRaw}`,
      `prompt_has_ciphertext=${promptHasCipher}`,
      `decrypt_roundtrip=${roundtrip}`,
      `ollama_body_has_raw_name=${fetchHasRaw}`,
      `http_result_has_raw_name=${resultHasRaw}`,
      `schedule_items=${result.items.length}`,
    ];
    console.log(lines.join("\n"));
    if (!pass) process.exitCode = 1;
  } finally {
    globalThis.fetch = origFetch;
    delete process.env.COOL_LIN_PII_DIR;
    rmSync(dir, { recursive: true, force: true });
  }
}

void main();
