import type { AmbiguityFlag, Classification, DateMention, RelationType } from "../types.js";
import { diffDays, startOfDay, type Civil } from "../dates/civil.js";
import {
  ACK_ONLY,
  ACTION_TERMS,
  CHAT_TERMS,
  CONDUCT_VERBS,
  DEADLINE_TERMS,
  EVENT_TERMS,
  LOCATION_TERMS,
  OBLIGATION_ALL_STAFF,
  OBLIGATION_MUST,
  OPTIONAL_TERMS,
  RECURRENCE_CLEAR,
  RECURRENCE_VAGUE,
  RELATION_TERMS,
  TARGET_GRADE,
  TARGET_HOMEROOM,
  URGENT_TERMS,
} from "./lexicon.js";
import { dropParticle, nounsBefore } from "../text/phrase.js";

/** 최초 실행에서 받는 역할 태그. 이름·학교명은 받지 않는다 (PRD 7.1A). */
export interface UserRole {
  /** 담임인가 */
  homeroom?: boolean;
  /** 담당 학년 */
  grades?: number[];
  /** 보직 여부 */
  hasPosition?: boolean;
  /** 담당 부서·업무 (예: "교무", "생활안전") */
  departments?: string[];
  /** 관심 공지 (예: "연수", "평가") */
  interests?: string[];
}

export interface SentenceSignals {
  /** 사용자가 해야 할 행동 */
  action: { label: string; weight: number } | null;
  /** 학교 행사 명사 */
  event: { label: string; weight: number } | null;
  isDeadline: boolean;
  isOptional: boolean;
  isUrgent: boolean;
  relation: RelationType;
  recurrenceRule: string | null;
  recurrenceVague: boolean;
  location: string | null;
  target: string | null;
  /** 행사 이름은 없지만 «실시합니다» 같은 서술어로 행사임을 알 수 있는가 */
  conductsEvent: boolean;
  /** 이 문장 밖(쪽지 다른 곳)에 선택 참여 표현이 있는가 */
  optionalNearby: boolean;
  /** 전 교직원·필수 표현이 있는가 */
  allStaff: boolean;
  /** 사용자 역할과 맞는가 */
  matchesRole: boolean;
  /** 캘린더에 넣을 핵심 일정 단어 */
  keywords: string[];
}

export interface ClassifyInput {
  /** 판단 대상 문장 */
  sentence: string;
  /** 쪽지 전체 본문. 대상·의무 표현은 문장 밖에 있는 경우가 많다. */
  body: string;
  /** 이 문장에서 뽑은 날짜들 */
  dates: DateMention[];
  /** 쪽지 발송일 */
  sentAt: Civil;
  role: UserRole;
  /** 민감정보로 격리된 쪽지인가 */
  quarantined: boolean;
}

export interface ClassifyResult {
  classification: Classification;
  confidence: number;
  band: "높음" | "검토 필요" | "낮음";
  reasoning: string[];
  signals: SentenceSignals;
}

interface LexiconEntry {
  term: RegExp;
  label: string;
  weight: number;
}

/** 사전에서 가장 무거운 항목 하나를 고른다. */
const firstMatch = (text: string, table: LexiconEntry[]): LexiconEntry | null => {
  let best: LexiconEntry | null = null;
  for (const entry of table) {
    if (!entry.term.test(text)) continue;
    if (best === null || entry.weight > best.weight) best = entry;
  }
  return best;
};

/** 행사 이름 앞에 붙은 수식어까지 살려 «2학기 교무회의» 같은 덩어리를 만든다. */
function eventPhrase(sentence: string, entry: LexiconEntry): string | null {
  const m = sentence.match(new RegExp(entry.term.source));
  if (m?.index === undefined) return null;

  // 제목과 같은 명사 판정을 쓴다 (src/text/phrase.ts).
  // 조사를 떼지 않으면 «상황을 점검» 처럼 조사가 남은 제목이 된다.
  const modifiers = nounsBefore(sentence, m.index, 2).map(dropParticle);
  const phrase = [...modifiers, m[0].trim()].join(" ").replace(/\s+/g, " ").trim();
  return phrase.length >= 2 && phrase.length <= 20 ? phrase : null;
}

function findTarget(text: string, role: UserRole): { target: string | null; matches: boolean } {
  const targets: string[] = [];
  let matches = false;

  if (OBLIGATION_ALL_STAFF.test(text)) {
    targets.push("전 교직원");
    matches = true;
  }
  if (TARGET_HOMEROOM.test(text)) {
    targets.push("담임");
    if (role.homeroom) matches = true;
  }

  const grades = new Set<number>();
  for (const m of text.matchAll(new RegExp(TARGET_GRADE.source, "g"))) {
    const g = Number(m[1]);
    if (g >= 1 && g <= 6) grades.add(g);
  }
  if (grades.size > 0) {
    targets.push([...grades].sort().map((g) => `${g}학년`).join("·"));
    if (role.grades?.some((g) => grades.has(g))) matches = true;
  }

  if (role.interests?.some((k) => k.length > 0 && text.includes(k))) matches = true;
  if (role.departments?.some((d) => d.length > 0 && text.includes(d))) matches = true;

  return { target: targets.length > 0 ? targets.join(", ") : null, matches };
}

export function readSignals(sentence: string, body: string, role: UserRole): SentenceSignals {
  // 대상·의무 표현은 문장 밖(제목 줄, 맨 끝 서명)에 있는 경우가 많아 본문 전체에서 본다.
  const scope = sentence + "\n" + body;

  const action = firstMatch(sentence, ACTION_TERMS);
  const event = firstMatch(sentence, EVENT_TERMS);

  let relation: RelationType = "new";
  for (const r of RELATION_TERMS) {
    if (r.term.test(sentence)) {
      relation = r.type;
      break;
    }
  }

  let recurrenceRule: string | null = null;
  for (const r of RECURRENCE_CLEAR) {
    if (r.term.test(sentence)) {
      recurrenceRule = r.rule;
      break;
    }
  }
  const recurrenceVague = RECURRENCE_VAGUE.some((r) => r.test(sentence));
  if (recurrenceRule !== null) relation = "recurrence";

  const { target, matches } = findTarget(scope, role);
  const locationMatch = sentence.match(LOCATION_TERMS);

  // 캘린더에 넣을 «핵심 일정 단어».
  // 본문에 실제로 쓰인 말을 먼저 담고, 사전의 분류 이름은 보조로 붙인다.
  // («개학식»이 분류 이름 «의식행사»로 바뀌어 버리면 안 된다)
  const keywords: string[] = [];
  if (event) {
    const phrase = eventPhrase(sentence, event);
    if (phrase !== null) keywords.push(phrase);
    if (!keywords.includes(event.label)) keywords.push(event.label);
  }
  if (action && !keywords.includes(action.label)) keywords.push(action.label);

  return {
    action,
    event,
    isDeadline: DEADLINE_TERMS.some((r) => r.test(sentence)),
    // 선택 참여 표현은 «9월 4일 직무연수가 있습니다 / 희망하시는 분은 신청해 주세요»처럼
    // 다른 문장에 적히는 경우가 많다. 쪽지 전체를 본다.
    isOptional: OPTIONAL_TERMS.some((r) => r.test(scope)),
    optionalNearby: OPTIONAL_TERMS.some((r) => r.test(body)),
    conductsEvent: CONDUCT_VERBS.test(sentence),
    isUrgent: URGENT_TERMS.some((r) => r.test(scope)),
    relation,
    recurrenceRule,
    recurrenceVague,
    location: locationMatch?.[0]?.trim() ?? null,
    target,
    allStaff: OBLIGATION_ALL_STAFF.test(scope) || OBLIGATION_MUST.test(scope),
    matchesRole: matches,
    keywords: [...new Set(keywords)].slice(0, 5),
  };
}

/**
 * 신뢰도 점수 (기술계획서 7.2 공식 그대로).
 *
 *   점수 = 날짜정밀도 + 행동/행사 + 대상적합 + 0.08
 *          - (지난 날짜면 0.25)
 *          - (선택 참여 표현이면 0.15)
 *          - 0.12 × 모호표시 개수
 *
 * 이 값은 통계적 확률이 아니다. 화면에는 «높음 / 검토 필요 / 낮음» 세 단계만 보여준다.
 */
export function scoreCandidate(
  date: DateMention,
  signals: SentenceSignals,
  sentAt: Civil,
): { confidence: number; reasoning: string[] } {
  const reasoning: string[] = [];

  const precisionScore = date.precision === "exact" ? 0.34 : date.precision === "period" ? 0.28 : 0.26;
  reasoning.push(
    date.precision === "exact"
      ? "시각까지 분명함"
      : date.precision === "period"
        ? "교시로 적힘"
        : "날짜만 적힘",
  );

  let actionScore = 0.1;
  if (signals.action) {
    actionScore = 0.3;
    reasoning.push(`내가 할 일: ${signals.action.label}`);
  } else if (signals.event) {
    actionScore = 0.26;
    reasoning.push(`학교 행사: ${signals.event.label}`);
  } else if (signals.conductsEvent) {
    actionScore = 0.26;
    reasoning.push("학교에서 실시하는 일정");
  } else {
    reasoning.push("행동·행사 표현이 뚜렷하지 않음");
  }

  let targetScore = 0.12;
  if (signals.allStaff) {
    targetScore = 0.28;
    reasoning.push("전 교직원·필수 대상");
  } else if (signals.matchesRole) {
    targetScore = 0.2;
    reasoning.push(`내 역할과 맞음${signals.target ? ` (${signals.target})` : ""}`);
  }

  let score = precisionScore + actionScore + targetScore + 0.08;

  const startOfDate = new Date(date.startAt.length === 10 ? date.startAt + "T00:00Z" : date.startAt + "Z");
  if (diffDays(startOfDate, startOfDay(sentAt)) < 0) {
    score -= 0.25;
    reasoning.push("이미 지난 날짜");
  }
  if (signals.isOptional) {
    score -= 0.15;
    reasoning.push("희망자·신청자 대상 표현");
  }
  if (date.flags.length > 0) {
    score -= 0.12 * date.flags.length;
    reasoning.push(`확인 필요: ${date.flags.join(", ")}`);
  }

  return { confidence: Math.max(0, Math.min(1, Number(score.toFixed(3)))), reasoning };
}

export function band(confidence: number): "높음" | "검토 필요" | "낮음" {
  if (confidence >= 0.9) return "높음";
  if (confidence >= 0.6) return "검토 필요";
  return "낮음";
}

/**
 * 한 문장을 분류한다. 판정 순서는 PRD 9장을 따른다.
 * 한 쪽지를 하나의 label로 먼저 고정하지 않고 문장 단위로 판단한다.
 */
export function classifySentence(input: ClassifyInput): ClassifyResult {
  const { sentence, body, dates, sentAt, role, quarantined } = input;
  const signals = readSignals(sentence, body, role);

  const decide = (classification: Classification, confidence: number, reasoning: string[]): ClassifyResult => ({
    classification,
    confidence,
    band: band(confidence),
    reasoning,
    signals,
  });

  // 1) 민감정보면 차단
  if (quarantined) {
    return decide("SENSITIVE", 0, ["민감정보가 있어 후보를 만들지 않습니다"]);
  }

  // 2) 단순 확인·인사뿐이면 제외
  const bare = sentence.trim();
  if (ACK_ONLY.test(bare)) {
    return decide("ACK_REPLY", 0, ["단순 확인 답장"]);
  }
  // 인사말뿐인 문장은 «내일도 좋은 하루 보내세요»처럼 날짜가 들어 있어도 일정이 아니다.
  // 날짜가 있다는 이유만으로 일정으로 분류하지 않는다 (PRD 22장).
  const chatty = CHAT_TERMS.some((r) => r.test(sentence));
  if (chatty && signals.action === null && signals.event === null && !signals.conductsEvent) {
    return decide("PERSONAL_CHAT", 0, ["행동·행사 없이 인사말만 있음"]);
  }
  if (dates.length === 0) {
    return decide("UNKNOWN", 0, ["날짜 표현이 없음"]);
  }

  const primary = dates[0]!;
  const { confidence, reasoning } = scoreCandidate(primary, signals, sentAt);

  // 3) 변경·취소는 새 일정이 아니라 기존 일정과의 관계로 본다
  if (signals.relation === "cancel") {
    return decide("OFFICIAL_EVENT", confidence, [...reasoning, "취소 안내로 보입니다"]);
  }
  if (signals.relation === "update") {
    return decide("OFFICIAL_EVENT", confidence, [...reasoning, "변경 안내로 보입니다"]);
  }

  // 4) 긴급 공지는 캘린더보다 즉시 알림에 가깝다
  if (signals.isUrgent && signals.event === null) {
    return decide("URGENT_NOTICE", confidence, [...reasoning, "당일 긴급 공지"]);
  }

  // 5) 사용자 행동 + 기한
  if (signals.action !== null) {
    if (signals.isDeadline) {
      return decide("DEADLINE", confidence, [...reasoning, "기한이 있는 제출·신청"]);
    }
    return decide("PERSONAL_TASK", confidence, [...reasoning, "내가 해야 할 일"]);
  }

  // 6) 선택 표현이 있으면 확인 필요
  if (signals.isOptional) {
    return decide("OPTIONAL_EVENT", confidence, [...reasoning, "희망자 대상이라 확인이 필요합니다"]);
  }

  // 7) 의무 표현·대상·날짜가 분명한 학교 행사
  if (signals.event !== null || signals.conductsEvent) {
    return decide("OFFICIAL_EVENT", confidence, reasoning);
  }

  // 8) 날짜는 있으나 행동·참석 의무가 없음
  return decide("REFERENCE_NOTICE", confidence, [...reasoning, "참고용 안내로 보입니다"]);
}
