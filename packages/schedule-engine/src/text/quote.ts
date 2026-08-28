/**
 * 답장 인용문 분리 (PRD 7.2).
 *
 * `OOO님이 보낸글 >>2026/08/24 12:00:00` 이후는 이전 대화로 보관하되
 * 현재 메시지 판단에서는 제외한다. 현재 본문이 비고 인용문만 남으면 후보를 만들지 않는다.
 */

const QUOTE_MARKERS: RegExp[] = [
  /^.{0,40}?님이\s*보낸\s*글\s*>>/m,
  /^-{2,}\s*원본\s*메시지\s*-{2,}/m,
  /^>{2,}\s*\d{4}[./-]\d{1,2}[./-]\d{1,2}/m,
  /^From:\s/m,
];

export interface QuoteSplit {
  /** 이번에 새로 쓴 부분 */
  current: string;
  /** 인용된 이전 대화 */
  quoted: string;
  /** 현재 본문이 없고 인용문뿐인가 */
  quotedOnly: boolean;
}

export function splitQuote(body: string): QuoteSplit {
  let cut = -1;
  for (const marker of QUOTE_MARKERS) {
    const m = body.match(marker);
    if (m?.index !== undefined && (cut === -1 || m.index < cut)) cut = m.index;
  }

  if (cut === -1) return { current: body, quoted: "", quotedOnly: false };

  const current = body.slice(0, cut).trim();
  const quoted = body.slice(cut).trim();
  return { current, quoted, quotedOnly: current.length === 0 };
}
