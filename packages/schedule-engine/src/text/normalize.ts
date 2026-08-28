/**
 * 본문 정규화.
 *
 * DB·화면에 넣기 전에 제어문자와 bidi override를 없애고 줄바꿈·공백을 정리한다 (PRD 6장).
 * 원문의 «줄 구조»는 일정 추출에 쓰이므로 줄바꿈 자체는 보존한다.
 */

/** 눈에 보이지 않으면서 텍스트 방향을 뒤집는 문자들. 표시·비교 모두에서 제거한다. */
const BIDI_AND_CONTROL =
  // eslint-disable-next-line no-control-regex
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;

export function normalizeBody(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(BIDI_AND_CONTROL, "")
    .replace(/\u00A0/g, " ")
    // 줄 안의 연속 공백만 줄인다. 줄바꿈은 건드리지 않는다.
    .replace(/[ \t]+/g, " ")
    // 빈 줄이 3줄 이상 이어지면 2줄로 줄인다.
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}

/** 비교용으로 공백을 전부 없앤 형태 */
export function squash(s: string): string {
  return s.replace(/\s+/g, "");
}
