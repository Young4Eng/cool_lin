// 쪽지 본문 → 카드에 한 줄로 얹을 «무슨 내용인지».
//
// 위젯 카드는 흘깃 보는 자리다. 분류·신뢰도·판단 근거 같은 «엔진이 어떻게 판단했나»는
// 여기 있을 이유가 없다 (필요하면 검토함에서 본다). 대신 교사가 알고 싶은 것은
// 「그래서 이게 무슨 얘기냐」 하나다.
//
// 요약은 지어내지 않는다. 원문에서 **인사말과 맺음말을 걷어낸 첫 문장**을 그대로 쓴다.
// 없는 말을 만들어 넣으면 원문과 어긋났을 때 확인할 방법이 없다.

/** 내용이 없는 인사말·맺음말 줄 */
const NOISE = [
  /^안녕하[세십]/,
  /^(?:[가-힣]{2,10})(?:부|실|과|팀|담당)입니다[.!]?$/,
  /^[가-힣]{2,4}\s*(?:선생님|부장님|교장|교감)[,\s]*안녕/,
  /^감사합니다/,
  /^고맙습니다/,
  /^수고\s*(?:하세요|하셨|많으)/,
  /^잘\s*부탁/,
  /^부탁\s*드립니다/,
  /^좋은\s*(?:하루|주말|저녁|아침|한\s*주)/,
  /^[-=~*·\s]+$/,
];

const isNoise = (line) => line.length === 0 || NOISE.some((r) => r.test(line));

/** 문장 끝에서 자른다. 없으면 길이로 자른다. */
function clamp(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('다 '), cut.lastIndexOf('요 '));
  return `${(stop > max * 0.5 ? cut.slice(0, stop + 1) : cut).trim()}…`;
}

/**
 * 쪽지 본문에서 요약 한 줄을 만든다.
 *
 * @param {string} body 원문
 * @param {number} max  최대 글자 수
 * @returns {string} 요약. 쓸 만한 줄이 없으면 빈 문자열.
 */
export function summarizeMessage(body, max = 96) {
  if (typeof body !== 'string' || body.trim().length === 0) return '';

  const lines = body
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter((l) => !isNoise(l));

  if (lines.length === 0) return '';

  // 첫 줄이 너무 짧으면(제목 같은 조각) 다음 줄까지 붙인다.
  let text = lines[0];
  if (text.length < 24 && lines[1]) text = `${text} ${lines[1]}`;

  return clamp(text, max);
}

/**
 * 일정 카드에 보여 줄 한 줄.
 * 원문이 있으면 원문에서, 없으면 엔진이 준 대상·장소 정보로 대신한다.
 */
export function eventSummary(event) {
  const fromSource = summarizeMessage(event?.source?.body ?? '');
  if (fromSource) return fromSource;

  const bits = [];
  if (event?.targetText) bits.push(`대상 ${event.targetText}`);
  if (event?.actionText) bits.push(event.actionText);
  return bits.join(' · ');
}
