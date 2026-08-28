/**
 * 캘린더 제목에 쓸 수 있는 «명사구»인지 가리는 규칙.
 *
 * 제목은 사람이 캘린더 칸에서 읽는 값이라, 문장에서 아무 말이나 끌어오면
 * 「후 학년부에서 일괄 수합하여 제출」, 「교무부장님이 잘 안내」, 「혹시 참 신청」
 * 같은 게 그대로 박힌다. 그래서 앞말을 붙일 때마다 이 검사를 통과해야 한다.
 *
 * 제목(title.ts)과 핵심어(classify.ts)가 같은 기준을 쓰도록 여기 한 벌만 둔다.
 */

/** 목적어 자리에 오면 안 되는 부사·접속사·지시어 */
export const STOPWORDS = new Set([
  "그리고", "또한", "다만", "하지만", "그래서", "그러니", "따라서", "아울러", "특히", "혹시",
  "각각", "모두", "함께", "미리", "먼저", "다시", "반드시", "빠짐없이", "관련", "일괄",
  "위해", "위하여", "대해", "대하여", "다음", "아래", "해당", "이번", "저희", "우리",
  "아직", "이미", "바로", "직접", "그냥", "정말", "너무", "매우", "가장", "조금",
  "이후", "이전", "동시에", "경우", "때문", "정도", "가능", "필요", "참고", "확인",
  // 숫자가 떨어져 나가 홀로 남은 단위. «교시 동아리» 같은 제목을 막는다.
  "교시", "요일", "학기", "학년", "회차", "시간", "기간",
]);

/** 날짜·시각 조각. 캘린더 칸이 이미 날짜를 보여주므로 제목에 또 들어가면 안 된다. */
const DATE_FRAGMENT =
  /\d\s*(?:월|일|시|분|교시|주|차|학기)|[월화수목금토일]\s*요일|오늘|내일|모레|글피|금일|명일|익일|오전|오후|이번\s*주|다음\s*주|매주|매일|\d{1,2}:\d{2}/;

/** 뒤에 붙으면 목적어가 아니라 다른 성분임을 알려 주는 조사 */
const NON_OBJECT_PARTICLE = /(?:에서|에게|부터|까지|으로|로|에|께서|께|한테|처럼|보다|만큼|마다)$/;

/** 떼어내도 되는 조사. 뗀 뒤에도 두 글자 이상 남을 때만 뗀다. */
const OBJECT_PARTICLE = /(?:을|를|은|는|이|가|의|과|와|도|만)$/;

/** 용언 활용형. 「수합하여」, 「진행된」, 「꽂아」 같은 말은 명사가 아니다. */
const VERB_ENDING =
  /(?:하여|해서|하고|하며|하실|하신|되어|되고|된|던|하니|하오니|도록|려고|면서|어서|아서|고자)$|(?:[아어여오우이하되])는$|(?:해드리|해주|드리|시키|주시)$/;

/** 한 어절이 제목에 붙일 만한 명사인가. */
export function isNounLike(word: string): boolean {
  const w = word.trim();
  if (w.length === 0) return false;

  // «2학기», «1학년», «3차» 는 뜻이 있는 수식어다.
  if (/^\d{1,2}(?:학기|학년|차)$/.test(w)) return true;

  // 한 글자짜리는 「참」, 「잘」, 「후」, 「전」처럼 조각이거나 부사일 때가 대부분이다.
  if (w.length < 2) return false;

  if (STOPWORDS.has(w)) return false;
  if (DATE_FRAGMENT.test(w)) return false;
  if (NON_OBJECT_PARTICLE.test(w)) return false;
  if (VERB_ENDING.test(w)) return false;

  // 한글·영문·숫자로만 이루어진 말만 받는다. 괄호·따옴표가 섞이면 잘린 조각이다.
  return /^[가-힣A-Za-z0-9][가-힣A-Za-z0-9·]*$/.test(w);
}

/** 목적어 뒤 조사를 뗀다. 「회의」의 «의»처럼 낱말의 일부를 조사로 오해하지 않는다. */
export function dropParticle(word: string): string {
  const stripped = word.replace(OBJECT_PARTICLE, "");
  return stripped.length >= 2 ? stripped : word;
}

/**
 * 어떤 위치의 바로 앞에서부터 거꾸로 명사만 골라 붙인다.
 * 명사가 아닌 말을 만나면 즉시 멈춘다. 최대 `limit` 어절.
 */
export function nounsBefore(text: string, index: number, limit = 2): string[] {
  const before = text.slice(0, index).trim();
  if (before.length === 0) return [];

  const words = before.split(/\s+/);
  const picked: string[] = [];
  for (let i = words.length - 1; i >= 0 && picked.length < limit; i--) {
    const word = words[i]!;
    if (!isNounLike(word)) break;
    picked.unshift(word);
  }
  return picked;
}

/**
 * 제목 앞뒤의 꼬리표 괄호를 벗긴다.
 *   «[안내] AI 선도학교 수요 조사» → «AI 선도학교 수요 조사»
 *   «<8월 6일 시간표 변경 안내>»   → «8월 6일 시간표 변경 안내»
 *   «(중요!!) 교과 선생님들께»      → «교과 선생님들께»
 */
export function stripTagBrackets(title: string): string {
  // «６월» 같은 전각 문자를 반각으로 맞춘다. 그러지 않으면 숫자로 인식되지 않는다.
  let t = title.normalize("NFKC").trim();

  // 전체가 한 쌍의 괄호로 감싸여 있으면 벗긴다.
  // 안쪽에 «(화)» 같은 다른 괄호가 있어도 바깥 껍질은 벗긴다.
  const wrapped = t.match(/^([[<({【])\s*(.+?)\s*[\]>)}】]$/);
  const opener = wrapped?.[1];
  const inner = wrapped?.[2];
  if (opener !== undefined && inner !== undefined && !inner.includes(opener)) {
    t = inner.trim();
  }

  // 앞에 붙은 짧은 꼬리표를 뗀다. 내용이 길면 제목의 일부일 수 있으므로 남긴다.
  t = t.replace(/^[[<({【]\s*[^\]>)}】]{1,8}\s*[\]>)}】]\s*/, "").trim();

  // 남은 글머리 기호 정리
  return t.replace(/^[\s\-–—·•*|:]+/, "").trim();
}
