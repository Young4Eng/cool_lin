import type { SentenceSignals } from "./classify/classify.js";
import { ACTION_TERMS, TITLE_JUNK } from "./classify/lexicon.js";
import { squash } from "./text/normalize.js";

/**
 * 캘린더에 넣을 제목 만들기 (기술계획서 7.3).
 *
 * 쿨메신저의 «제목» 열은 대개 본문 첫 줄이 잘린 값이다. 실제 데이터에서 71.2%가 본문
 * 첫 부분과 같았고 87.5%가 24자 이상으로 잘려 있었으며 22.2%는 인사말로 시작했다.
 * 그대로 쓰면 캘린더에 "안녕하세요 담임선생님, 교무부 최은지입니다. 학급함에" 가 박힌다.
 *
 * 순서: ① 제목 열이 진짜 제목 같으면 그대로 ② 본문에서 «무엇을 + 무엇 한다» ③ 분류 이름
 */

const CLASSIFICATION_NAMES: Record<string, string> = {
  OFFICIAL_EVENT: "학교 일정",
  PERSONAL_TASK: "처리할 일",
  DEADLINE: "제출 마감",
  OPTIONAL_EVENT: "신청 안내",
  REFERENCE_NOTICE: "참고 공지",
  URGENT_NOTICE: "긴급 공지",
};

/** 문장을 통째로 잘라 온 티가 나는 값. 제목으로 쓰지 않는다. */
const SENTENCE_LIKE = /(?:입니다|합니다|습니다|하세요|해요|됩니다|드립니다|바랍니다|주세요)[.!?]?$/;

/** 제목 열을 그대로 써도 되는지 본다. */
export function titleColumnIsUsable(title: string, body: string): boolean {
  const t = title.trim();
  if (t.length === 0 || t.length >= 24) return false;
  if (TITLE_JUNK.some((r) => r.test(t))) return false;
  if (SENTENCE_LIKE.test(t)) return false;
  // 본문 첫 부분을 그대로 잘라 온 값이면 제목이 아니다.
  if (squash(body).startsWith(squash(t).slice(0, 12)) && squash(t).length >= 8) return false;
  return true;
}

/**
 * 목적어 자리에 오면 안 되는 말. 접속사·부사를 떼지 않으면
 * "그리고 참석" 같은 제목이 만들어진다.
 */
const OBJECT_STOPWORDS = [
  "그리고", "또한", "또", "다만", "하지만", "그래서", "그러니", "따라서", "아울러", "특히",
  "각각", "모두", "함께", "미리", "먼저", "다시", "꼭", "반드시", "빠짐없이", "관련",
  "위해", "위하여", "대해", "대하여", "다음", "아래", "해당", "이번", "저희", "우리",
];

/** 캘린더에 어울리는 짧은 명사구로 다듬는다. */
function tidy(phrase: string): string {
  return (
    phrase
      // 글머리 기호와 번호 매김만 떼고, "2학기"의 2 같은 뜻 있는 숫자는 남긴다.
      .replace(/^[\s\-·•*[\](){}]+/, "")
      .replace(/^\d+[.)]\s*/, "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * 목적어 뒤 조사를 뗀다.
 * "회의"의 «의»처럼 낱말의 일부인 글자를 조사로 착각하지 않도록 두 글자 이상 남을 때만 뗀다.
 */
function dropParticle(word: string): string {
  const stripped = word.replace(/(?:을|를|은|는|이|가|에게|에서|으로|로)$/, "");
  return stripped.length >= 2 ? stripped : word;
}

/**
 * 날짜·시각·장소 부스러기. 목적어에 섞이면 "부를 금요일 점심 전까지 체육관 앞 제출" 같은
 * 제목이 나온다. 이런 조각을 만나면 거기서 앞을 끊는다.
 */
const NOT_AN_OBJECT =
  /^(?:\d|[월화수목금토일]요일|오늘|내일|모레|명일|금일|오전|오후|점심|종례|조례|방과|이번|다음|매주|매일|각|전|앞|뒤|위|아래|까지|전까지|중|내)/;

/** 행동 앞에 놓인 목적어를 찾아 "출석부 제출" 같은 덩어리를 만든다. */
function objectBeforeAction(sentence: string): string | null {
  for (const entry of ACTION_TERMS) {
    const re = new RegExp(`([가-힣A-Za-z0-9][가-힣A-Za-z0-9 ·]{1,24}?)\\s*(?:을|를)?\\s*(?:${entry.term.source})`);
    const m = sentence.match(re);
    const captured = m?.[1];
    if (captured === undefined) continue;

    // 행동 바로 앞의 어절부터 거꾸로 최대 4개만 본다. 문장 앞쪽까지 끌어오면
    // 관계 없는 말이 제목에 섞인다.
    const words = tidy(captured).split(" ").filter((w) => w.length > 0);
    const picked: string[] = [];
    for (let i = words.length - 1; i >= 0 && picked.length < 4; i--) {
      const word = words[i]!;
      if (NOT_AN_OBJECT.test(word) || OBJECT_STOPWORDS.includes(word)) break;
      picked.unshift(word);
    }
    if (picked.length === 0) continue;

    const object = dropParticle(picked.join(" "));

    // "제출함에"의 "제출"처럼 우연한 일치나 두 글자 미만은 제목이 되지 못하게 막는다.
    if (object.length < 2) continue;
    if (TITLE_JUNK.some((r) => r.test(object))) continue;
    if (OBJECT_STOPWORDS.includes(object)) continue;
    return `${object} ${entry.label}`;
  }
  return null;
}

export function buildTitle(args: {
  titleColumn: string;
  body: string;
  sentence: string;
  signals: SentenceSignals;
  classification: string;
}): string {
  const { titleColumn, body, sentence, signals, classification } = args;

  if (titleColumnIsUsable(titleColumn, body)) return titleColumn.trim();

  // 행사 이름이 잡혔으면 그게 가장 좋은 제목이다.
  const eventPhrase = signals.keywords.find((k) => k.length >= 2 && !TITLE_JUNK.some((r) => r.test(k)));
  if (signals.event !== null && eventPhrase !== undefined) {
    return tidy(eventPhrase);
  }

  // "무엇을 + 무엇 한다"는 이 문장 안에서만 찾는다. 본문 전체로 넓히면 다른 문장의
  // 목적어가 딸려 와 엉뚱한 제목이 된다.
  const object = objectBeforeAction(sentence);
  if (object !== null) return object;

  if (eventPhrase !== undefined) return tidy(eventPhrase);

  return CLASSIFICATION_NAMES[classification] ?? "확인 필요";
}
