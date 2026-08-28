/**
 * 문장 나누기.
 *
 * 학교 쪽지는 줄바꿈이 곧 문장 경계인 경우가 많다(항목 나열, 날짜 한 줄 쓰기).
 * 그래서 줄바꿈을 1순위 경계로 쓰고, 그 안에서만 종결어미로 한 번 더 나눈다.
 * 날짜와 행동이 같은 문장 안에 있어야 짝지을 수 있으므로 지나치게 잘게 쪼개지 않는다.
 */

export interface Sentence {
  text: string;
  /** 본문 전체에서의 시작 위치 */
  offset: number;
  /** 몇 번째 줄에서 나왔는지 */
  line: number;
}

/** 종결어미 뒤에서 자른다. "8월 27일." 처럼 숫자 뒤 마침표는 자르지 않는다. */
const SENTENCE_END = /(?<![0-9])((?:습니다|합니다|입니다|하세요|해요|됩니다|드립니다|바랍니다|주세요)[.!?]?|[.!?])\s+/g;

export function splitSentences(body: string): Sentence[] {
  const out: Sentence[] = [];
  let offset = 0;

  const lines = body.split("\n");
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li] ?? "";
    const trimmedStart = line.length - line.trimStart().length;

    if (line.trim().length === 0) {
      offset += line.length + 1;
      continue;
    }

    let cursor = 0;
    SENTENCE_END.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = SENTENCE_END.exec(line)) !== null) {
      const end = m.index + m[0].length;
      const piece = line.slice(cursor, end).trim();
      if (piece.length > 0) out.push({ text: piece, offset: offset + cursor + trimmedStart, line: li });
      cursor = end;
    }
    const tail = line.slice(cursor).trim();
    if (tail.length > 0) out.push({ text: tail, offset: offset + cursor + trimmedStart, line: li });

    offset += line.length + 1;
  }

  return out;
}
