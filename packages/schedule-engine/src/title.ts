import type { SentenceSignals } from "./classify/classify.js";
import { ACTION_TERMS, TITLE_JUNK } from "./classify/lexicon.js";
import { squash } from "./text/normalize.js";
import { dropParticle, nounsBefore, stripTagBrackets } from "./text/phrase.js";

/**
 * 캘린더에 넣을 제목 만들기 (기술계획서 7.3).
 *
 * 쿨메신저의 «제목» 열은 대개 본문 첫 줄이 잘린 값이다. 실제 데이터에서 71.2%가 본문
 * 첫 부분과 같았고 87.5%가 24자 이상으로 잘려 있었으며 22.2%는 인사말로 시작했다.
 * 그대로 쓰면 캘린더에 "안녕하세요 담임선생님, 교무부 최은지입니다. 학급함에" 가 박힌다.
 *
 * 순서: ① 제목 열이 진짜 제목 같으면 그대로 ② 행사 이름 ③ «무엇을 + 무엇 한다» ④ 분류 이름
 *
 * 원칙은 «틀린 긴 제목보다 짧고 맞는 제목». 캘린더 한 칸에서 읽히지 않는 값은
 * 아무것도 안 쓴 것보다 나쁘다.
 */

const CLASSIFICATION_NAMES: Record<string, string> = {
  OFFICIAL_EVENT: "학교 일정",
  PERSONAL_TASK: "처리할 일",
  DEADLINE: "제출 마감",
  OPTIONAL_EVENT: "신청 안내",
  REFERENCE_NOTICE: "참고 공지",
  URGENT_NOTICE: "긴급 공지",
};

/** 캘린더 한 칸에서 잘리지 않고 읽히는 길이 */
const MAX_TITLE_CHARS = 22;

/** 문장을 통째로 잘라 온 티가 나는 값. 끝에 있든 중간에 있든 제목으로 쓰지 않는다. */
const SENTENCE_LIKE = /(?:입니다|합니다|습니다|하세요|해요|됩니다|드립니다|바랍니다|주세요|십시오)/;

/**
 * 받는 사람을 부르는 말. 이것만 남은 제목은 캘린더에서 아무 뜻이 없고,
 * 개인을 가리키는 값이 그대로 노출된다.
 */
const ADDRESSEE_ONLY = /^[가-힣]{0,6}\s*(?:선생님|부장님|실장님|교장|교감|원장|과장님|님)[\s~!.,]*$/;

/** 시각·범위 조각이 든 제목은 첫 줄이 잘려 온 것이다. */
const CLOCK_FRAGMENT = /\d{1,2}\s*:\s*\d{2}|~\s*\d/;

/**
 * 쿨메신저가 제목 열을 자르는 길이.
 *
 * 실제 파일에서 서로 다른 제목 3,003건 중 2,562건(85%)이 정확히 29~30자였다.
 * 즉 이 길이에 닿은 제목은 뒤가 잘려 있다고 봐야 한다.
 */
const EXPORT_TRUNCATION_BAND: readonly number[] = [29, 30];

/** 사람·직책을 가리키는 말. 잘라 쓴 제목에 남으면 개인이 캘린더에 노출된다. */
const HONORIFIC = /선생님|부장님|실장님|교장|교감|원장|과장님|[가-힣]{2,4}님/;

/** 제목 열을 그대로 써도 되는지 본다. */
export function titleColumnIsUsable(title: string, body: string): boolean {
  const raw = title.trim();

  // 잘림 판정은 «꼬리표를 벗기기 전» 길이로 해야 한다.
  // "[행정실 안내] 2026. 2분기 초과근무 운영실태 점" 은 원본이 30자로 잘린 값인데,
  // 꼬리표를 벗기면 21자가 되어 길이 관문을 통과해 버린다.
  //
  // 딱 29~30자일 때만 «잘렸다»고 본다. 그보다 긴 제목은 자르는 곳을 지나쳤다는 뜻이라
  // 온전한 제목이다(쿨메신저 내보내기가 아닌 다른 경로로 들어온 쪽지가 그렇다).
  if (EXPORT_TRUNCATION_BAND.includes(raw.length)) return false;

  const t = stripTagBrackets(raw);
  if (t.length < 2 || t.length > MAX_TITLE_CHARS) return false;
  // 낱자모(«ᄋ»)나 기호만 남은 값은 제목이 아니다.
  if (!/[가-힣A-Za-z0-9]{2}/.test(t)) return false;
  if (TITLE_JUNK.some((r) => r.test(t))) return false;
  if (SENTENCE_LIKE.test(t)) return false;
  if (ADDRESSEE_ONLY.test(t)) return false;
  if (CLOCK_FRAGMENT.test(t)) return false;

  // 본문 첫 부분을 그대로 잘라 온 값이면 제목이 아니다.
  // 꼬리표를 벗기기 전후 둘 다로 견줘 본다. 본문에도 꼬리표가 그대로 붙어 있기 때문이다.
  const bodyKey = squash(body);
  for (const candidate of [raw, t]) {
    const key = squash(candidate);
    if (key.length >= 8 && bodyKey.startsWith(key.slice(0, 12))) return false;
  }
  return true;
}

/**
 * 행동 앞에 놓인 목적어를 찾아 "출석부 제출" 같은 덩어리를 만든다.
 *
 * 행동 «바로 앞»의 명사만 최대 2어절 붙인다. 명사가 아닌 말을 만나면 즉시 멈추므로
 * 「후 학년부에서 일괄 수합하여 제출」 같은 값이 나오지 않는다.
 */
function objectBeforeAction(sentence: string): string | null {
  for (const entry of ACTION_TERMS) {
    const m = sentence.match(new RegExp(entry.term.source));
    if (m?.index === undefined) continue;

    // 행동 바로 앞에 목적격 조사가 붙어 있으면 그것까지 포함해 앞을 본다.
    const head = sentence.slice(0, m.index).replace(/\s*(?:을|를)\s*$/, (s) => s.trimEnd());
    const words = nounsBefore(head, head.length, 2).map(dropParticle).filter((w) => w.length >= 2);
    if (words.length === 0) continue;

    const object = words.join(" ");
    if (TITLE_JUNK.some((r) => r.test(object))) continue;
    return `${object} ${entry.label}`;
  }
  return null;
}

/**
 * 온전하지만 캘린더 칸에 비해 긴 제목을 어절 경계에서 줄인다.
 * 잘린 제목·인사말·본문 첫 줄은 이미 앞에서 걸러졌으므로 여기 오는 값은 진짜 제목이다.
 */
function trimLongTitle(title: string): string | null {
  const words = title.split(/\s+/);
  const out: string[] = [];
  for (const word of words) {
    const next = [...out, word].join(" ");
    if (next.length > MAX_TITLE_CHARS) break;
    out.push(word);
  }
  // 줄이다 만 자리에 «및», «8월» 같은 접속사·날짜 조각이 남으면 떼어낸다.
  while (out.length > 0) {
    const last = out[out.length - 1]!;
    if (/^(?:및|또는|그리고|등|관련|안내|건|외)$/.test(last) || /^\d{1,2}(?:월|일|시|주|차)$/.test(last)) {
      out.pop();
      continue;
    }
    break;
  }

  const trimmed = out.join(" ").trim();
  if (trimmed.length < 4) return null;
  // 줄이다가 «1학년 담임선생님들께» 같은 값이 남으면 쓰지 않는다.
  if (HONORIFIC.test(trimmed)) return null;
  if (TITLE_JUNK.some((r) => r.test(trimmed))) return null;
  return trimmed;
}

/** 길이만 빼고 제목 열이 쓸 만한가 (줄여서라도 쓸 수 있는지 판단할 때) */
function titleColumnIsSound(title: string, body: string): boolean {
  const raw = title.trim();
  if (EXPORT_TRUNCATION_BAND.includes(raw.length)) return false;
  const t = stripTagBrackets(raw);
  if (t.length < 2) return false;
  if (!/[가-힣A-Za-z0-9]{2}/.test(t)) return false;
  if (TITLE_JUNK.some((r) => r.test(t))) return false;
  if (SENTENCE_LIKE.test(t)) return false;
  if (ADDRESSEE_ONLY.test(t)) return false;
  if (CLOCK_FRAGMENT.test(t)) return false;
  const bodyKey = squash(body);
  for (const candidate of [raw, t]) {
    const key = squash(candidate);
    if (key.length >= 8 && bodyKey.startsWith(key.slice(0, 12))) return false;
  }
  return true;
}

export function buildTitle(args: {
  titleColumn: string;
  body: string;
  sentence: string;
  signals: SentenceSignals;
  classification: string;
}): string {
  const { titleColumn, body, sentence, signals, classification } = args;

  if (titleColumnIsUsable(titleColumn, body)) return stripTagBrackets(titleColumn);

  // 행사 이름이 잡혔으면 그게 가장 좋은 제목이다.
  const phrase = signals.keywords.find((k) => k.length >= 2 && !TITLE_JUNK.some((r) => r.test(k)));
  if (signals.event !== null && phrase !== undefined) return phrase;

  // "무엇을 + 무엇 한다"는 이 문장 안에서만 찾는다. 본문 전체로 넓히면 다른 문장의
  // 목적어가 딸려 와 엉뚱한 제목이 된다.
  const object = objectBeforeAction(sentence);
  if (object !== null) return object;

  // 행동은 알겠는데 «무엇을» 하는지 문장에 안 나오면 행동 이름만 남긴다.
  //
  // 제목 열 앞머리에서 명사를 빌려오는 방법을 시험해 봤지만 되돌렸다. 그 자리는
  // «담임선생님», «○○부장님»처럼 받는 사람을 부르는 말일 때가 많아, 실제 데이터에서
  // 사람·직책이 캘린더에 새는 경우가 16건에서 96건으로 늘었다.
  // 「제출」 한 단어는 빈약하지만 거짓이 아니고 남의 정보를 흘리지 않는다.
  if (signals.action !== null) return signals.action.label;

  if (phrase !== undefined) return phrase;

  // 제목 열이 온전한데 캘린더에 비해 길 뿐이라면 어절 경계에서 줄여 쓴다.
  if (titleColumnIsSound(titleColumn, body)) {
    const trimmed = trimLongTitle(stripTagBrackets(titleColumn.trim()));
    if (trimmed !== null) return trimmed;
  }

  return CLASSIFICATION_NAMES[classification] ?? "확인 필요";
}
