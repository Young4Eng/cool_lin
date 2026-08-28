/**
 * 자동 등록 정책 (기술계획서 7.6 · PRD 9장).
 *
 * 규칙이 두 벌로 갈라지지 않도록 **여기 한 곳**에만 둔다.
 * `pipeline.ts`(파일 → 후보)와 `browser.ts`(쪽지 한 건 → 후보) 둘 다 이 모듈을 부른다.
 *
 * 정책은 두 부분으로 나뉜다.
 *
 *   1. 안전 조건 — 단계와 무관하게 절대 움직이지 않는다. 하나라도 걸리면 사람이 확인한다.
 *   2. 신뢰도 문턱 — 사용자가 고르는 단계가 바꾸는 것은 이것 하나뿐이다.
 */
import type { SentenceSignals } from "../classify/classify.js";
import { diffDays, startOfDay, type Civil } from "../dates/civil.js";
import type { AmbiguityFlag, Classification, DateMention, RelationType } from "../types.js";

/** 등록 기준 단계. 사용자가 설정에서 고른다 (기술계획서 7.6). */
export type AutoRegisterLevel = "아주 확실한 것만" | "분명한 일정까지";

/** 기본값. `아주 확실한 것만`은 실제 쪽지에서 거의 발동하지 않는다 (PRD 9장). */
export const DEFAULT_AUTO_REGISTER_LEVEL: AutoRegisterLevel = "분명한 일정까지";

export const AUTO_REGISTER_LEVELS: readonly AutoRegisterLevel[] = [
  "아주 확실한 것만",
  "분명한 일정까지",
];

/**
 * 단계가 바꾸는 유일한 값.
 *
 * 안전 조건을 모두 통과한 후보의 점수는 구조적으로 0.72 아래로 내려갈 수 없다 —
 * 날짜만 0.26 + 행사/행동 0.26 + 대상 0.12 + 기본 0.08 = 0.72.
 * 예전에는 `분명한 일정까지`가 0이어서 이 0.72짜리가 전부 캘린더로 바로 들어갔다.
 * 그런데 0.72는 «날짜만 적혀 있고, 내가 할 일이라는 표현도 없고, 대상도 안 적힌» 후보다.
 * 딱 사람이 한 번 봐야 하는 것이다.
 *
 * 0.8 로 올려 그런 후보를 검토함으로 보낸다. 일정을 놓치는 쪽이 한 번 더 확인하는 쪽보다
 * 손해가 크므로, 애매하면 자동 등록하지 않는다. 0.8 을 넘으려면 둘 중 하나는 있어야 한다.
 *
 *   · 대상이 분명하다 (전 교직원 0.28 / 내 역할과 맞음 0.2)
 *   · 시각까지 적혀 있고(0.34) 내가 할 일이거나 학교 행사다
 *
 * 검토함에 있어도 사라지지 않는다 — 「캘린더에 반영」 한 번이면 옮겨진다.
 */
export const AUTO_REGISTER_THRESHOLD: Record<AutoRegisterLevel, number> = {
  "아주 확실한 것만": 0.9,
  "분명한 일정까지": 0.8,
};

export function isAutoRegisterLevel(value: unknown): value is AutoRegisterLevel {
  return AUTO_REGISTER_LEVELS.includes(value as AutoRegisterLevel);
}

/**
 * 후보에 붙일 모호 표시를 모은다 (기술계획서 7.4).
 *
 * 날짜 해석에서 나온 표시에 **문장을 봐야 알 수 있는 것**을 더한다.
 * 점수 계산은 날짜 쪽 표시만 쓰므로(7.2 식) 여기서 더한 표시는 점수를 깎지 않고
 * 「사람이 확인한다」는 판단에만 쓰인다.
 */
export function ambiguityFlagsFor(date: DateMention, signals: SentenceSignals): AmbiguityFlag[] {
  const flags: AmbiguityFlag[] = [...date.flags];

  const add = (flag: AmbiguityFlag) => {
    if (!flags.includes(flag)) flags.push(flag);
  };

  if (signals.recurrenceVague) add("반복 주기 불명확");

  // 변경·취소 안내인데 **어떤 일정을 가리키는지** 문장 안에 이름이 없으면 사람이 골라야 한다.
  //   「8월 31일 예정이던 부장 회의는 취소되었습니다」 → 회의 이름이 있다. 표시하지 않는다.
  //   「8월 31일 예정된 건은 취소되었습니다」          → 무엇을 취소할지 알 수 없다.
  if (
    (signals.relation === "update" || signals.relation === "cancel") &&
    signals.event === null &&
    signals.action === null
  ) {
    add("변경 대상 불명확");
  }

  return flags;
}

/**
 * 이 일정이 나와 관련 있는가 (PRD 9장 「일정 대상이 사용자와 관련 있다고 판단됨」).
 *
 * 쪽지는 애초에 **나에게 온 것**이다. 그래서 대상이 아예 적혀 있지 않으면 나와 관련 있다고
 * 본다 — 「모레까지 학급 명렬표를 제출해 주시기 바랍니다」는 «전 교직원»이라는 말이 없어도
 * 나에게 온 내 일이다.
 *
 * 막아야 하는 것은 «대상이 적혀 있는데 그게 내가 아닌» 경우다. 3학년 담임에게만 해당하는
 * 공지가 1·2학년 담임 캘린더에 저절로 들어가면 안 된다.
 *
 * | 쪽지에 적힌 대상 | 내 역할과 | 판정 |
 * |---|---|---|
 * | `전 교직원`·`필수` | — | 관련 있음 |
 * | `2학년 담임` | 맞음 | 관련 있음 |
 * | `3학년 담임` | 학년이 다름 | **관련 없음 — 사람이 확인** |
 * | `담임` (학년 없음) | 나는 담임 | 관련 있음 |
 * | (아무 대상도 안 적힘) | — | 관련 있음 (나에게 온 쪽지다) |
 */
export function relatedToUser(signals: SentenceSignals): boolean {
  // 「전 교직원」이면 학년·담임 여부를 따지지 않는다.
  if (signals.allStaff) return true;
  // 대상이 적혀 있는데 내가 아니면 여기서 막힌다. 「담임」 한 갈래가 맞더라도
  // 학년이 어긋나면(「3학년 담임」) 막는다.
  if (signals.targetMismatch) return false;
  if (signals.matchesRole) return true;
  return signals.target === null;
}

export interface AutoRegisterInput {
  candidateType: Classification;
  /** 후보의 기준 날짜. 마감은 `startAt`이 아니라 `dueAt`에 들어가므로 둘 다 본 값을 넘긴다. */
  when: string | null;
  ambiguityFlags: readonly AmbiguityFlag[];
  relationType: RelationType;
  confidence: number;
  /** 희망자·신청자 대상 표현이 쪽지에 있는가 */
  isOptional: boolean;
  /** 대상이 나와 관련 있는가 (전 교직원 포함) */
  related: boolean;
  /** 이 날짜를 만든 규칙 이름. 시각만 적혀 발송일을 끌어다 쓴 경우를 막는다. */
  dateRule: string;
  /** 「오늘」의 기준. `null`이면 지난 날짜를 보지 않는다 (브라우저의 `includePast`). */
  now: Civil | null;
  level?: AutoRegisterLevel;
}

export interface AutoRegisterVerdict {
  eligible: boolean;
  blockers: string[];
}

/**
 * 자동 등록해도 되는 후보인지 판정한다.
 *
 * 막힌 이유는 화면에 그대로 보여줄 수 있는 문장으로 돌려준다 (`autoRegisterBlockers`).
 */
export function evaluateAutoRegister(input: AutoRegisterInput): AutoRegisterVerdict {
  const { level = DEFAULT_AUTO_REGISTER_LEVEL } = input;
  const blockers: string[] = [];

  // ── 안전 조건 (단계와 무관) ──────────────────────────────────────
  const when = input.when;
  const at = when === null ? null : new Date(when.length === 10 ? `${when}T00:00Z` : `${when}Z`);
  if (at === null || Number.isNaN(at.getTime())) {
    blockers.push("날짜가 없음");
  } else if (input.now !== null && diffDays(at, startOfDay(input.now)) < 0) {
    blockers.push("이미 지난 날짜");
  }

  const official =
    input.candidateType === "OFFICIAL_EVENT" ||
    input.candidateType === "DEADLINE" ||
    input.candidateType === "PERSONAL_TASK";
  if (!official) blockers.push("공식 일정·내 마감이 아님");

  if (input.isOptional) blockers.push("희망자 대상 표현");
  if (input.ambiguityFlags.length > 0) {
    blockers.push(`확인 필요: ${input.ambiguityFlags.join(", ")}`);
  }
  if (input.relationType !== "new") blockers.push("변경·취소 제안");
  if (!input.related) blockers.push("나와 관련 있다고 보기 어려움");
  if (input.dateRule === "time-only-assumed-send-day") blockers.push("날짜 없이 시각만 적힘");

  // ── 신뢰도 문턱 (단계가 바꾸는 유일한 값) ─────────────────────────
  const threshold = AUTO_REGISTER_THRESHOLD[level];
  if (input.confidence < threshold) {
    blockers.push(`「${level}」 기준에 미치지 못함`);
  }

  return { eligible: blockers.length === 0, blockers };
}
