/** YYYYMMDD 기간 검사. 잘못된 값은 추출 API를 호출하지 않는다. */

const MSG_FORMAT = '날짜는 8자리 숫자(YYYYMMDD)로 입력해 주세요.';
const MSG_INVALID = '존재하지 않는 날짜입니다. YYYYMMDD 형식으로 다시 입력해 주세요.';
const MSG_BOTH = '시작 날짜와 끝 날짜를 모두 8자리(YYYYMMDD)로 입력해 주세요.';
const MSG_ORDER = '시작 날짜가 끝 날짜보다 늦을 수 없습니다.';

function lastDayOfMonth(year, month1) {
  return new Date(Date.UTC(year, month1, 0)).getUTCDate();
}

function isValidYmdParts(year, month1, day) {
  if (!Number.isInteger(year) || !Number.isInteger(month1) || !Number.isInteger(day)) return false;
  if (year < 1900 || year > 2100) return false;
  if (month1 < 1 || month1 > 12) return false;
  if (day < 1 || day > lastDayOfMonth(year, month1)) return false;
  return true;
}

export function parseYmd(raw) {
  if (typeof raw !== 'string') {
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

export function parsePeriod(startRaw, endRaw) {
  const startS = (startRaw ?? '').trim();
  const endS = (endRaw ?? '').trim();
  if (startS === '' || endS === '') {
    return { ok: false, error: MSG_BOTH };
  }
  const start = parseYmd(startS);
  if (!start.ok) return start;
  const end = parseYmd(endS);
  if (!end.ok) return end;
  if (start.ymd > end.ymd) {
    return { ok: false, error: MSG_ORDER };
  }
  return { ok: true, start: start.ymd, end: end.ymd };
}

export function localYmd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

export function yesterdayAndToday() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 1);
  return { start: localYmd(start), end: localYmd(end) };
}
