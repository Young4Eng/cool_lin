/** Local-only PII redaction. Tokens are stable within a single request. */

import { persistEncryptedPiiMap } from "./encrypt.js";

export type PiiMap = Record<string, string>;
export type MessageRow = Record<string, string>;

const PERSON_KEYS = ["보낸사람", "받은사람"] as const;
const TEXT_KEYS = ["제목", "내용", "첨부파일"] as const;

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const PHONE_RE = /(?<!\d)(01[016789]|0\d{1,2})[-\s.]?\d{3,4}[-\s.]?\d{4}(?!\d)/g;
const RRN_RE = /(?<!\d)\d{6}\s*-\s*\d{7}(?!\d)/g;
const STUDENT_LABELED_RE = /학번\s*[:：]?\s*[A-Za-z0-9-]{4,12}/g;
const STUDENT_DIGIT_RE = /(?<!\d)[1-6]\d{4}(?!\d)/g;

function looksLikeDate(text: string, index: number, length: number): boolean {
  const around = text.slice(Math.max(0, index - 8), index + length + 8);
  return (
    /\d{4}\s*[-./년]\s*\d{1,2}\s*[-./월]\s*\d{1,2}/.test(around) ||
    /[년월일시분]/.test(around)
  );
}

/**
 * 전화번호꼴로 잡힌 이 자리가 사실은 날짜인가.
 *
 * 전화번호는 `0XX-XXXX-XXXX` 처럼 앞이 0 이고 숫자가 아홉 자리 넘는 모양이라,
 * 한국식 날짜 표기가 이 꼴로 잡히는 경우는 사실상 없다. 그래서 바로 뒤에 붙은
 * 날짜 글자만 본다.
 *
 * 예전에는 `looksLikeDate` 로 앞뒤 여덟 칸을 훑었다. 그러면 「메일」의 «일» 이나
 * 「일정」·「3시」 같은 흔한 낱말에 걸려 그 옆의 전화번호가 통째로 안 가려졌다.
 */
function phoneIsDate(text: string, index: number, length: number): boolean {
  return /^[년월일]/.test(text.slice(index + length, index + length + 1));
}

function nameVariants(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  const variants = new Set<string>();
  variants.add(trimmed);
  const beforeParen = trimmed.split("(")[0]?.trim() ?? "";
  if (/^[가-힣]{2,6}$/.test(beforeParen)) variants.add(beforeParen);
  for (const m of trimmed.matchAll(/[가-힣]{2,4}/g)) {
    if (m[0] === "선생님" || m[0] === "교무부" || m[0] === "행정실") continue;
    variants.add(m[0]);
  }
  return [...variants].sort((a, b) => b.length - a.length);
}

class TokenBook {
  readonly map: PiiMap = {};
  private readonly seen = new Map<string, string>();

  token(kind: string, original: string): string {
    const key = `${kind}\0${original}`;
    const existing = this.seen.get(key);
    if (existing) return existing;
    let n = 1;
    for (const t of Object.keys(this.map)) {
      if (t.startsWith(`${kind}_`)) n += 1;
    }
    const token = `${kind}_${n}`;
    this.map[token] = original;
    this.seen.set(key, token);
    return token;
  }

  alias(kind: string, original: string, token: string): void {
    const key = `${kind}\0${original}`;
    if (this.seen.has(key)) return;
    this.seen.set(key, token);
  }
}

function replaceAllLiteral(haystack: string, needle: string, replacement: string): string {
  if (!needle) return haystack;
  return haystack.split(needle).join(replacement);
}

export function redactSheets(sheets: Record<string, MessageRow[]>): {
  sheets: Record<string, MessageRow[]>;
  pii_tokens: string[];
} {
  const book = new TokenBook();
  const personPlan: { original: string; token: string; variants: string[] }[] = [];

  for (const rows of Object.values(sheets)) {
    for (const row of rows) {
      for (const key of PERSON_KEYS) {
        const raw = row[key];
        if (!raw || !raw.trim()) continue;
        const token = book.token("PERSON", raw.trim());
        for (const v of nameVariants(raw)) {
          book.alias("PERSON", v, token);
        }
        personPlan.push({ original: raw.trim(), token, variants: nameVariants(raw) });
      }
    }
  }

  personPlan.sort((a, b) => b.original.length - a.original.length);

  const out: Record<string, MessageRow[]> = {};
  for (const [sheetName, rows] of Object.entries(sheets)) {
    out[sheetName] = rows.map((row) => {
      const next: MessageRow = { ...row };
      for (const key of PERSON_KEYS) {
        if (next[key]?.trim()) {
          next[key] = book.token("PERSON", next[key].trim());
        }
      }
      for (const key of TEXT_KEYS) {
        if (typeof next[key] !== "string" || !next[key]) continue;
        let text = next[key];
        for (const p of personPlan) {
          for (const v of p.variants) {
            text = replaceAllLiteral(text, v, p.token);
          }
        }
        text = redactPatterns(text, book, key !== "첨부파일");
        next[key] = text;
      }
      return next;
    });
  }

  // Originals never leave this process as plaintext: encrypt at rest, return tokens only.
  persistEncryptedPiiMap(book.map);
  return { sheets: out, pii_tokens: Object.keys(book.map) };
}

function redactPatterns(text: string, book: TokenBook, studentIds: boolean): string {
  let s = text;
  s = s.replace(EMAIL_RE, (m) => book.token("EMAIL", m));
  s = s.replace(RRN_RE, (m) => book.token("RRN", m));
  s = s.replace(PHONE_RE, (m, _g1: string, offset: number) => {
    const digits = m.replace(/\D/g, "");
    if (digits.length < 9) return m;
    if (phoneIsDate(s, offset, m.length)) return m;
    return book.token("PHONE", m);
  });
  s = s.replace(STUDENT_LABELED_RE, (m) => book.token("STUDENT", m));
  if (studentIds) {
    s = s.replace(STUDENT_DIGIT_RE, (m, offset: number) => {
      if (looksLikeDate(s, offset, m.length)) return m;
      return book.token("STUDENT", m);
    });
  }
  return s;
}

export function previewSheets(
  sheets: Record<string, MessageRow[]>,
  perSheet = 5,
  bodyChars = 180,
): { sheet: string; 제목: string; 상대: string; 내용: string }[] {
  const preview: { sheet: string; 제목: string; 상대: string; 내용: string }[] = [];
  for (const [sheet, rows] of Object.entries(sheets)) {
    for (const row of rows.slice(0, perSheet)) {
      const body = row["내용"] ?? "";
      preview.push({
        sheet,
        제목: row["제목"] ?? "",
        상대: row["보낸사람"] || row["받은사람"] || "",
        내용: body.length > bodyChars ? `${body.slice(0, bodyChars)}…` : body,
      });
    }
  }
  return preview;
}

export function redactMessageFields(input: {
  subject?: string;
  body?: string;
  counterpart?: string;
}): { subject: string; body: string; counterpart: string; pii_tokens: string[] } {
  const sheets: Record<string, MessageRow[]> = {
    쪽지: [
      {
        제목: input.subject ?? "",
        내용: input.body ?? "",
        보낸사람: input.counterpart ?? "",
        받은사람: "",
        첨부파일: "",
      },
    ],
  };
  const { sheets: redacted, pii_tokens } = redactSheets(sheets);
  const row = redacted["쪽지"]?.[0] ?? {};
  return {
    subject: row["제목"] ?? "",
    body: row["내용"] ?? "",
    counterpart: row["보낸사람"] ?? "",
    pii_tokens,
  };
}
