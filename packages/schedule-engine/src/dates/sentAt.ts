import { civil, isValidYmd, type Civil } from "./civil.js";

/**
 * 날짜/시간 열을 해석한다.
 *
 * 쿨메신저 문자열은 `2026/08/24 09:32:21 (월)` 형태로 꼬리에 요일 괄호가 붙는다.
 * 이걸 먼저 떼지 않으면 표준 파서가 실패한다 (기술계획서 7.1).
 * 엑셀 일련번호(숫자)와 ISO 문자열도 함께 받는다.
 */

/** 엑셀 1900 날짜 체계 기준점. 1900년 윤년 버그까지 감안한 통상 보정값. */
const EXCEL_EPOCH_UTC = Date.UTC(1899, 11, 30);

export function parseSentAt(raw: string): Civil | null {
  const text = raw.trim();
  if (text.length === 0) return null;

  // 1) 엑셀 일련번호
  if (/^\d+(\.\d+)?$/.test(text)) {
    const serial = Number.parseFloat(text);
    // 1900년 이전이나 2200년 이후로 계산되는 값은 신뢰하지 않는다.
    if (serial < 1 || serial > 120_000) return null;
    return new Date(EXCEL_EPOCH_UTC + Math.round(serial * 86_400_000));
  }

  // 2) 꼬리 요일 괄호를 먼저 뗀다.
  const stripped = text.replace(/\s*\([일월화수목금토]\)\s*$/, "").trim();

  const m = stripped.match(
    /^(\d{4})[./-](\d{1,2})[./-](\d{1,2})(?:[T\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/,
  );
  if (!m) return null;

  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!isValidYmd(y, mo, d)) return null;

  const hh = m[4] === undefined ? 0 : Number(m[4]);
  const mi = m[5] === undefined ? 0 : Number(m[5]);
  if (hh > 23 || mi > 59) return null;

  return civil(y, mo, d, hh, mi);
}
