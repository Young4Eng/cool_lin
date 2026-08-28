import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import type { Request, Response } from "express";
import { previewSheets, redactMessageFields, redactSheets, type MessageRow } from "./redact.js";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:3b";
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS ?? 120000);
const MAX_MESSAGES = 40;
const MAX_BODY_CHARS = 800;

export type Sheets = Record<string, MessageRow[]>;

export interface IngestBody {
  ok?: unknown;
  file?: unknown;
  sheets?: unknown;
  [key: string]: unknown;
}

export interface ExtractedItem {
  title: string;
  when: string;
  due: string;
  source_sheet: string;
  source_title: string;
}

function isRow(v: unknown): v is MessageRow {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  return Object.values(v as Record<string, unknown>).every(
    (x) => x == null || typeof x === "string" || typeof x === "number",
  );
}

function toRow(v: MessageRow): MessageRow {
  const row: MessageRow = {};
  for (const [k, val] of Object.entries(v)) {
    row[k] = val == null ? "" : String(val);
  }
  return row;
}

function asSheets(value: unknown): Sheets | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const out: Sheets = {};
  let any = false;
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (!Array.isArray(v)) continue;
    if (!v.every(isRow)) continue;
    out[k] = v.map((row) => toRow(row));
    any = true;
  }
  return any ? out : null;
}

function sheetRowCount(sheets: Sheets): number {
  return Object.values(sheets).reduce((n, rows) => n + rows.length, 0);
}

export function parseIngestBody(body: unknown): { file?: string; sheets: Sheets } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { sheets: {} };
  }
  const b = body as IngestBody;
  const file = typeof b.file === "string" && b.file.trim() ? b.file.trim() : undefined;
  const nested = asSheets(b.sheets);
  if (nested) return { file, sheets: nested };

  const { ok: _ok, file: _f, ...rest } = b;
  const own = asSheets(rest);
  return { file, sheets: own ?? {} };
}

function isCoolmsgXls(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^coolmsg_.*\.xls$/i.test(base);
}

function pythonCmd(): { cmd: string; prefix: string[] } {
  if (process.platform === "win32") {
    return { cmd: "py", prefix: ["-3"] };
  }
  return { cmd: "python3", prefix: [] };
}

export function parseXlsFile(filePath: string, pythonDir: string): Promise<Sheets> {
  const { cmd, prefix } = pythonCmd();
  const code =
    "import json,sys; from parser import parse_xls; print(json.dumps(parse_xls(sys.argv[1]), ensure_ascii=False))";
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, [...prefix, "-c", code, filePath], {
      cwd: pythonDir,
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("xls 파싱이 너무 오래 걸렸습니다."));
    }, 20000);
    child.stdout.on("data", (d) => {
      stdout += d.toString("utf8");
    });
    child.stderr.on("data", (d) => {
      stderr += d.toString("utf8");
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      try {
        const data = JSON.parse(stdout.trim().split(/\r?\n/).filter(Boolean).pop() ?? "") as {
          sheets?: unknown;
        };
        const sheets = asSheets(data.sheets);
        if (!sheets) throw new Error("empty");
        resolve(sheets);
      } catch {
        reject(new Error(stderr.trim() || `python exited ${code ?? "?"}`));
      }
    });
  });
}

export function buildLocalAiPrompt(sheets: Sheets): string {
  const messages: {
    sheet: string;
    제목: string;
    상대: string;
    날짜: string;
    내용: string;
  }[] = [];
  for (const [sheet, rows] of Object.entries(sheets)) {
    for (const row of rows) {
      if (messages.length >= MAX_MESSAGES) break;
      const body = (row["내용"] ?? "").slice(0, MAX_BODY_CHARS);
      messages.push({
        sheet,
        제목: row["제목"] ?? "",
        상대: row["보낸사람"] || row["받은사람"] || "",
        날짜: row["날짜/시간"] ?? "",
        내용: body,
      });
    }
  }
  return [
    "학교 교실 메신저 쪽지에서 일정·할 일 후보만 추출하세요.",
    "이미 가명 처리된 텍스트입니다. 개인정보를 복원하지 마세요.",
    "JSON 객체 하나만 출력하세요. 스키마:",
    '{"items":[{"title":"짧은 일정/할 일 제목","when":"시작 시각 또는 빈 문자열","due":"마감 시각 또는 빈 문자열","source_sheet":"시트 이름","source_title":"원쪽지 제목"}]}',
    "후보가 없으면 {\"items\":[]} 을 반환하세요.",
    "when/due 는 쪽지에 나온 날짜·시각을 그대로 쓰세요. 없으면 빈 문자열.",
    "",
    "쪽지 목록:",
    JSON.stringify(messages, null, 0),
  ].join("\n");
}

function asItem(v: unknown): ExtractedItem | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const o = v as Record<string, unknown>;
  const title = typeof o.title === "string" ? o.title.trim() : "";
  if (!title) return null;
  return {
    title,
    when: typeof o.when === "string" ? o.when : "",
    due: typeof o.due === "string" ? o.due : "",
    source_sheet: typeof o.source_sheet === "string" ? o.source_sheet : "",
    source_title: typeof o.source_title === "string" ? o.source_title : "",
  };
}

function parseModelJson(raw: string): ExtractedItem[] {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) text = fence[1].trim();
  const start = text.search(/[\[{]/);
  if (start > 0) text = text.slice(start);
  const parsed: unknown = JSON.parse(text);
  if (Array.isArray(parsed)) {
    return parsed.map(asItem).filter((x): x is ExtractedItem => x != null);
  }
  if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    const list = obj.items ?? obj.candidates ?? obj.events;
    if (Array.isArray(list)) {
      return list.map(asItem).filter((x): x is ExtractedItem => x != null);
    }
    const one = asItem(parsed);
    return one ? [one] : [];
  }
  return [];
}

async function callOllama(prompt: string, opts: { json?: boolean } = {}): Promise<{ model: string; raw: string }> {
  const url = `${OLLAMA_URL.replace(/\/$/, "")}/api/chat`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      ...(opts.json === false ? {} : { format: "json" }),
      messages: [
        {
          role: "system",
          content:
            opts.json === false
              ? "You help Korean teachers with classroom messenger notes. Reply in Korean only. Do not restore personal data."
              : "You extract classroom schedule and task candidates. Reply with JSON only.",
        },
        { role: "user", content: prompt },
      ],
      options: { temperature: opts.json === false ? 0.3 : 0.1, num_predict: 1024 },
    }),
    signal: AbortSignal.timeout(OLLAMA_TIMEOUT_MS),
  });
  if (!res.ok) {
    const err = new Error(`Ollama HTTP ${res.status}`) as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  const data = (await res.json()) as {
    model?: string;
    message?: { content?: string };
    response?: string;
  };
  const raw = data.message?.content ?? data.response ?? "";
  return { model: data.model ?? OLLAMA_MODEL, raw };
}

function ollamaUnavailable(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { name?: string; code?: string; cause?: { code?: string }; status?: number };
  if (e.name === "TimeoutError" || e.name === "AbortError") return true;
  const code = e.code ?? e.cause?.code;
  if (code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "ECONNRESET") return true;
  if (typeof e.status === "number" && e.status >= 500) return true;
  if (e.status === 404) return true;
  return false;
}

function ollamaErrorMessage(err: unknown): string {
  const timedOut =
    err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
  if (timedOut) return "로컬 Ollama 응답이 시간 초과되었습니다.";
  if (ollamaUnavailable(err)) return "로컬 Ollama에 연결할 수 없습니다.";
  return "로컬 Ollama 호출에 실패했습니다.";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * 파일 경로(또는 sheets)를 받아 비식별 후 로컬 Ollama에서 items 를 뽑는다.
 * HTTP 가 아니라 /api/ingest 가 같은 응답에 items 를 넣기 위해 직접 호출한다.
 * Ollama 가 꺼져 있어도 throw 하지 않고 ok:false, items:[] 를 돌려 준다.
 * pii_map 은 절대 포함하지 않는다.
 */
export type LocalAiIngestResult = {
  ok: boolean;
  items: ExtractedItem[];
  model: string;
  error?: string;
  warning?: string;
  file?: string | null;
  parsed_from_xls?: boolean;
  redacted_preview?: ReturnType<typeof previewSheets>;
  /** Token names only. Never the original strings. */
  pii_tokens?: string[];
};

export async function runLocalAiIngest(opts: {
  file?: string;
  sheets?: Sheets;
  pythonDir: string;
}): Promise<LocalAiIngestResult> {
  let sheets = opts.sheets ?? {};
  const file = opts.file;
  let parsedFromXls = false;

  if (sheetRowCount(sheets) === 0 && file && isCoolmsgXls(file) && existsSync(file)) {
    try {
      sheets = await parseXlsFile(file, opts.pythonDir);
      parsedFromXls = true;
    } catch {
      return {
        ok: false,
        items: [],
        model: OLLAMA_MODEL,
        error: "xls 파일을 읽지 못했습니다.",
        file: file ?? null,
      };
    }
  }

  if (sheetRowCount(sheets) === 0 && !file) {
    return {
      ok: false,
      items: [],
      model: OLLAMA_MODEL,
      error: "sheets 또는 file 이 필요합니다.",
    };
  }

  const { sheets: redacted, pii_tokens } = redactSheets(sheets);
  const redacted_preview = previewSheets(redacted);

  if (sheetRowCount(redacted) === 0) {
    return {
      ok: true,
      items: [],
      model: OLLAMA_MODEL,
      file: file ?? null,
      parsed_from_xls: parsedFromXls,
      redacted_preview,
      pii_tokens,
    };
  }

  let ollama;
  try {
    ollama = await callOllama(buildLocalAiPrompt(redacted));
  } catch (err) {
    return {
      ok: false,
      items: [],
      model: OLLAMA_MODEL,
      error: ollamaErrorMessage(err),
      file: file ?? null,
      parsed_from_xls: parsedFromXls,
      redacted_preview,
      pii_tokens,
    };
  }

  let items: ExtractedItem[] = [];
  let warning: string | undefined;
  try {
    items = parseModelJson(ollama.raw);
  } catch {
    warning = "모델 응답을 JSON으로 해석하지 못했습니다.";
  }

  return {
    ok: true,
    model: ollama.model,
    items,
    file: file ?? null,
    parsed_from_xls: parsedFromXls,
    redacted_preview,
    pii_tokens,
    ...(warning ? { warning } : {}),
  };
}

export async function handleLocalAiIngest(
  req: Request,
  res: Response,
  pythonDir: string,
): Promise<void> {
  try {
    const parsed = parseIngestBody(req.body);
    const result = await runLocalAiIngest({
      file: parsed.file,
      sheets: parsed.sheets,
      pythonDir,
    });

    if (!result.ok) {
      const isBadInput =
        result.error === "sheets 또는 file 이 필요합니다." ||
        result.error === "xls 파일을 읽지 못했습니다.";
      res.status(isBadInput ? 400 : 503).json({
        ok: false,
        error: result.error,
        model: result.model ?? OLLAMA_MODEL,
      });
      return;
    }

    res.status(200).json({
      ok: true,
      model: result.model,
      items: result.items,
      redacted_preview: result.redacted_preview ?? [],
      pii_tokens: result.pii_tokens ?? [],
      file: result.file ?? null,
      parsed_from_xls: result.parsed_from_xls ?? false,
      ...(result.warning ? { warning: result.warning } : {}),
    });
  } catch {
    res.status(500).json({
      ok: false,
      error: "ingest 처리 중 오류가 났습니다.",
      model: OLLAMA_MODEL,
    });
  }
}

/**
 * 요약·스마트 답장. 본문은 서버에서 비식별한 뒤에만 Ollama 로 보낸다.
 * pii_map 은 응답에 넣지 않는다.
 */
export async function handleLocalAiComplete(req: Request, res: Response): Promise<void> {
  try {
    const kind = req.body?.kind === "reply" ? "reply" : "summary";
    const subject = typeof req.body?.subject === "string" ? req.body.subject : "";
    const bodyRaw =
      typeof req.body?.body === "string"
        ? req.body.body
        : typeof req.body?.bodyHtml === "string"
          ? req.body.bodyHtml
          : "";
    const counterpart = typeof req.body?.counterpart === "string" ? req.body.counterpart : "";
    const replyType = typeof req.body?.replyType === "string" ? req.body.replyType : "accept";

    const redacted = redactMessageFields({
      subject,
      body: stripHtml(bodyRaw),
      counterpart,
    });

    const prompt =
      kind === "reply"
        ? [
            "학교 메신저에서 다음 쪽지에 대한 교사용 정중하고 간결한 답장을 한국어로 작성하세요.",
            `답장 유형: ${replyType}`,
            "이미 가명 처리된 텍스트입니다. 개인정보를 복원하지 마세요.",
            `쪽지 제목: ${redacted.subject}`,
            `본문: ${redacted.body}`,
          ].join("\n")
        : [
            "다음은 학교 교직원 간의 메신저 쪽지 내용입니다. 핵심 내용을 3가지 항목으로 명확하게 한국어로 요약해 주세요.",
            "이미 가명 처리된 텍스트입니다. 개인정보를 복원하지 마세요.",
            `제목: ${redacted.subject}`,
            `본문: ${redacted.body}`,
            "",
            "형식:",
            "1. 발신 목적:",
            "2. 핵심 요구사항:",
            "3. 마감 기한 및 후속 조치:",
          ].join("\n");

    const ollama = await callOllama(prompt, { json: false });
    res.status(200).json({
      ok: true,
      text: ollama.raw.trim(),
      model: ollama.model,
      pii_tokens: redacted.pii_tokens,
    });
  } catch (err) {
    const timedOut =
      err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    res.status(ollamaUnavailable(err) ? 503 : 500).json({
      ok: false,
      error: timedOut
        ? "로컬 Ollama 응답이 시간 초과되었습니다."
        : ollamaUnavailable(err)
          ? "로컬 Ollama에 연결할 수 없습니다."
          : "로컬 AI 요청에 실패했습니다.",
    });
  }
}

/**
 * 브라우저가 원문을 들고 Ollama 로 가지 않도록, 비식별 텍스트만 돌려 준다.
 * pii_map 은 포함하지 않는다.
 */
export function handleRedact(req: Request, res: Response): void {
  const text = typeof req.body?.text === "string" ? req.body.text : "";
  const subject = typeof req.body?.subject === "string" ? req.body.subject : "";
  const counterpart = typeof req.body?.counterpart === "string" ? req.body.counterpart : "";
  const redacted = redactMessageFields({
    subject,
    body: stripHtml(text),
    counterpart,
  });
  res.json({
    ok: true,
    text: redacted.body,
    subject: redacted.subject,
    counterpart: redacted.counterpart,
    pii_tokens: redacted.pii_tokens,
  });
}
