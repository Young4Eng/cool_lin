/** YYYYMMDD 기간 검사. 잘못된 값은 추출 파이프라인에 넘기지 않는다. */

export type YmdOk = { ok: true; ymd: string; year: number; month: number; day: number };
export type YmdErr = { ok: false; error: string };
export type YmdResult = YmdOk | YmdErr;

export type PeriodOk = { ok: true; start?: string; end?: string };
export type PeriodResult = PeriodOk | YmdErr;

const MSG_FORMAT = "날짜는 8자리 숫자(YYYYMMDD)로 입력해 주세요.";
const MSG_INVALID = "존재하지 않는 날짜입니다. YYYYMMDD 형식으로 다시 입력해 주세요.";
const MSG_BOTH = "시작 날짜와 끝 날짜를 모두 8자리(YYYYMMDD)로 입력해 주세요.";
const MSG_ORDER = "시작 날짜가 끝 날짜보다 늦을 수 없습니다.";

export function lastDayOfMonth(year: number, month1: number): number {
  return new Date(Date.UTC(year, month1, 0)).getUTCDate();
}

export function isValidYmdParts(year: number, month1: number, day: number): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month1) || !Number.isInteger(day)) return false;
  if (year < 1900 || year > 2100) return false;
  if (month1 < 1 || month1 > 12) return false;
  if (day < 1 || day > lastDayOfMonth(year, month1)) return false;
  return true;
}

export function parseYmd(raw: unknown): YmdResult {
  if (typeof raw === "number" && Number.isInteger(raw)) {
    raw = String(raw);
  }
  if (typeof raw !== "string") {
    return { ok: false, error: MSG_FORMAT };
  }
  const s = raw.trim();
  if (!/^\d{8}$/.test(s)) {
    return { ok: false, error: MSG_FORMAT };
  }
  const year = Number(s.slice(0, 4));
  const month = Number(s.slice(4, 6));
  const day = Number(s.slice(6, 8));
  if (!isValidYmdParts(year, month, day)) {
    return { ok: false, error: MSG_INVALID };
  }
  return { ok: true, ymd: s, year, month, day };
}

function pickStr(body: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = body[k];
    if (typeof v === "string") return v.trim();
    if (typeof v === "number" && Number.isInteger(v)) return String(v);
  }
  return "";
}

/**
 * POST /api/ingest 본문의 기간.
 * 둘 다 비면 기본값(어제~오늘)을 쓰므로 start/end 를 생략한다.
 */
export function parseIngestPeriod(body: unknown): PeriodResult {
  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: true };
  }
  const startRaw = pickStr(body as Record<string, unknown>, "startDate", "start");
  const endRaw = pickStr(body as Record<string, unknown>, "endDate", "end");
  if (startRaw === "" && endRaw === "") {
    return { ok: true };
  }
  if (startRaw === "" || endRaw === "") {
    return { ok: false, error: MSG_BOTH };
  }
  const start = parseYmd(startRaw);
  if (!start.ok) return start;
  const end = parseYmd(endRaw);
  if (!end.ok) return end;
  if (start.ymd > end.ymd) {
    return { ok: false, error: MSG_ORDER };
  }
  return { ok: true, start: start.ymd, end: end.ymd };
}
