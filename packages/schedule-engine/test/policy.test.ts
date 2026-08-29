/**
 * 자동 등록 정책 (기술계획서 7.6 · PRD 9장).
 *
 * 기술계획서 7.6은 «두 단계가 실제로 다르게 동작하는지 같은 파일 하나로 반드시 테스트한다»고
 * 못박아 두었다. 단계를 나눠 놓고 결과가 같다면 단계를 나눈 의미가 없기 때문이다.
 * 그래서 이 파일의 첫 테스트는 워크북 **하나**를 만들어 두 단계로 각각 돌린다.
 */
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { readSignals, scoreCandidate, type SentenceSignals } from "../src/classify/classify.js";
import { civil } from "../src/dates/civil.js";
import { extractDates } from "../src/dates/resolve.js";
import { runPipeline } from "../src/pipeline.js";
import {
  ambiguityFlagsFor,
  AUTO_REGISTER_LEVELS,
  AUTO_REGISTER_THRESHOLD,
  CLEAR_RELATIVE_DATE_RULES,
  DEFAULT_AUTO_REGISTER_LEVEL,
  evaluateAutoRegister,
  isAutoRegisterLevel,
  relatedToUser,
  type AutoRegisterInput,
} from "../src/policy/autoRegister.js";
import { writeGoldenWorkbook, type GoldenCase } from "../scripts/_golden-workbook.js";
import type { DateMention } from "../src/types.js";

const TODAY = civil(2026, 8, 28);
const ROLE = { homeroom: true, grades: [1, 2] };

/** 합성 쪽지 두 건. 점수가 1.00 인 것과 0.80 인 것을 일부러 하나씩 담는다. */
const CASES: GoldenCase[] = [
  {
    id: "auto-hi",
    note: "시각까지 분명 + 내가 할 일 + 전 교직원 필수 → 0.90 이상",
    sentAt: "2026/08/28 09:00:00 (금)",
    counterpart: "교무부장",
    title: "출석부 제출 안내",
    body: "8월 31일(월) 15:20까지 전 교직원 필수로 출석부를 제출해 주시기 바랍니다.",
    expect: {},
  },
  {
    id: "auto-mid",
    note: "날짜만 + 학교 행사 + 내 학년 → 0.80. 안전 조건은 다 통과한다",
    sentAt: "2026/08/28 09:00:00 (금)",
    counterpart: "연구부장",
    title: "협의회 안내",
    body: "9월 2일 2학년 학년 협의회가 있습니다.",
    expect: {},
  },
];

async function runBothLevels() {
  const dir = await mkdtemp(path.join(tmpdir(), "cool-lin-policy-"));
  try {
    // «같은 파일 하나»로 두 단계를 비교한다 (기술계획서 7.6).
    const file = await writeGoldenWorkbook(path.join(dir, "levels.xls"), CASES);
    const common = { now: TODAY, windowDays: 30, role: ROLE };
    const loose = await runPipeline([file], { ...common, autoRegisterLevel: "분명한 일정까지" });
    const strict = await runPipeline([file], { ...common, autoRegisterLevel: "아주 확실한 것만" });
    return { loose, strict };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

const autoTitles = (candidates: { autoRegisterEligible: boolean; proposedTitle: string }[]) =>
  candidates.filter((c) => c.autoRegisterEligible).map((c) => c.proposedTitle).sort();

test("자동등록 단계 — 같은 파일 하나에서 두 단계가 다르게 동작한다 (기술계획서 7.6)", async () => {
  const { loose, strict } = await runBothLevels();

  assert.equal(loose.candidates.length, 2, "두 쪽지 모두 후보가 되어야 한다");
  assert.equal(strict.candidates.length, loose.candidates.length, "단계는 후보 수를 바꾸지 않는다");

  const looseAuto = autoTitles(loose.candidates);
  const strictAuto = autoTitles(strict.candidates);

  assert.deepEqual(looseAuto, ["출석부 제출 안내", "협의회 안내"].sort());
  assert.deepEqual(strictAuto, ["출석부 제출 안내"]);
  assert.notDeepEqual(looseAuto, strictAuto, "단계를 나눈 의미가 없다면 실패해야 한다");
});

test("자동등록 단계 — 막힌 이유에 어느 단계에서 걸렸는지가 적힌다", async () => {
  const { strict } = await runBothLevels();
  const mid = strict.candidates.find((c) => c.proposedTitle === "협의회 안내");
  assert.ok(mid);
  assert.equal(mid.autoRegisterEligible, false);
  assert.deepEqual(mid.autoRegisterBlockers, ["「아주 확실한 것만」 기준에 미치지 못함"]);
});

test("자동등록 단계 — 안전 조건은 단계와 무관하게 그대로다 (PRD 9장)", () => {
  const base: AutoRegisterInput = {
    candidateType: "REFERENCE_NOTICE",
    when: "2026-08-20",
    ambiguityFlags: ["요일만 적힘"],
    relationType: "cancel",
    confidence: 1,
    isOptional: true,
    related: false,
    dateRule: "absolute-md",
  };

  const safety = [
    "공식 일정·내 마감이 아님",
    "희망자 대상 표현",
    "확인 필요: 요일만 적힘",
    "변경·취소 제안",
    "나와 관련 있다고 보기 어려움",
  ];

  for (const level of AUTO_REGISTER_LEVELS) {
    const verdict = evaluateAutoRegister({ ...base, level });
    assert.equal(verdict.eligible, false);
    // 신뢰도 1.0 이라 문턱은 어느 단계에서도 걸리지 않는다. 남는 것은 안전 조건뿐이다.
    assert.deepEqual(verdict.blockers, safety, `단계 ${level} 에서 안전 조건이 달라졌다`);
  }
});

test("자동등록 단계 — 기본값은 «분명한 일정까지»", () => {
  assert.equal(DEFAULT_AUTO_REGISTER_LEVEL, "분명한 일정까지");
  assert.equal(AUTO_REGISTER_THRESHOLD["아주 확실한 것만"], 0.9);
  assert.ok(isAutoRegisterLevel("분명한 일정까지"));
  assert.equal(isAutoRegisterLevel("전부"), false);
});

/**
 * `분명한 일정까지`의 문턱이 0.8 인 근거.
 *
 * 안전 조건을 모두 통과한 후보는 점수 구성상 0.72 아래로 내려갈 수 없다. 그 0.72 짜리는
 * «날짜만 적혀 있고, 내가 할 일이라는 표현도 없고, 대상도 안 적힌» 후보다 — 딱 사람이
 * 한 번 봐야 하는 것이라, 예전처럼 문턱을 0 으로 두면 그대로 캘린더에 들어갔다.
 * 일정을 놓치는 쪽이 한 번 더 확인하는 쪽보다 손해가 크므로 검토함으로 보낸다.
 *
 * 점수 항목의 가중치를 손대면 이 테스트가 먼저 깨진다.
 */
test("자동등록 단계 — 가장 낮은 0.72 짜리는 자동 등록하지 않고 검토함으로 보낸다", () => {
  const date: DateMention = {
    text: "9월 2일",
    index: 0,
    startAt: "2026-09-02",
    precision: "date_only", // 가장 낮은 정밀도 0.26
    flags: [], // 모호 표시가 있으면 안전 조건에서 이미 막힌다
    rule: "absolute-md",
  };

  const bare: SentenceSignals = {
    action: null,
    event: null,
    isDeadline: false,
    isOptional: false, // 선택 표현이면 안전 조건에서 이미 막힌다
    isUrgent: false,
    relation: "new",
    recurrenceRule: null,
    recurrenceVague: false,
    location: null,
    target: null,
    conductsEvent: false,
    optionalNearby: false,
    allStaff: false,
    matchesRole: false,
    targetMismatch: false,
    keywords: [],
  };

  // 자동등록까지 갈 수 있는 분류는 «내가 할 일»(0.30) 또는 «학교 행사»(0.26) 뿐이다.
  // 대상은 아무것도 안 적혀 있을 때가 가장 낮다(0.12) — 그래도 나에게 온 쪽지라 통과한다.
  const worst = scoreCandidate(
    date,
    { ...bare, event: { label: "협의회", weight: 0.9 } },
    civil(2026, 8, 28),
  );
  assert.equal(worst.confidence, 0.72);
  assert.ok(relatedToUser({ ...bare, event: { label: "협의회", weight: 0.9 } }));
  // 안전 조건은 통과하지만 문턱에는 못 미친다 — 사라지지 않고 검토함으로 간다.
  assert.ok(worst.confidence < AUTO_REGISTER_THRESHOLD["분명한 일정까지"]);
  assert.ok(worst.confidence < AUTO_REGISTER_THRESHOLD["아주 확실한 것만"]);

  // 대상이 분명해지면(전 교직원 0.28) 0.88 이 되어 자동 등록된다.
  const clear = scoreCandidate(
    date,
    { ...bare, event: { label: "협의회", weight: 0.9 }, allStaff: true },
    civil(2026, 8, 28),
  );
  assert.equal(clear.confidence, 0.88);
  assert.ok(clear.confidence >= AUTO_REGISTER_THRESHOLD["분명한 일정까지"]);

  // 행동·행사 표현이 없으면(0.10) 점수는 더 낮지만, 그런 후보는 REFERENCE_NOTICE 라
  // «공식 일정·내 마감이 아님»으로 안전 조건에서 먼저 막힌다.
  const notSchedule = scoreCandidate(date, bare, civil(2026, 8, 28));
  assert.ok(notSchedule.confidence < 0.72);
  assert.equal(
    evaluateAutoRegister({
      candidateType: "REFERENCE_NOTICE",
      when: date.startAt,
      ambiguityFlags: [],
      relationType: "new",
      confidence: notSchedule.confidence,
      isOptional: false,
      related: true,
      dateRule: date.rule,
    }).blockers.includes("공식 일정·내 마감이 아님"),
    true,
  );
});

// ── 변경 대상 불명확 (기술계획서 7.4) ──────────────────────────────

function flagsOf(sentence: string) {
  const sentAt = civil(2026, 8, 28, 9, 0);
  const [date] = extractDates(sentence, { sentAt });
  assert.ok(date, `날짜를 찾지 못했습니다: ${sentence}`);
  return ambiguityFlagsFor(date, readSignals(sentence, sentence, ROLE));
}

test("변경 대상 불명확 — 취소할 일정의 이름이 없으면 사람이 골라야 한다", () => {
  assert.ok(flagsOf("8월 31일 예정된 건은 취소되었습니다.").includes("변경 대상 불명확"));
});

test("변경 대상 불명확 — 일정 이름이 적혀 있으면 표시하지 않는다", () => {
  assert.ok(!flagsOf("8월 31일 예정이던 부장 회의는 취소되었습니다.").includes("변경 대상 불명확"));
  assert.ok(!flagsOf("9월 1일 교무회의 시간이 15:20으로 변경되었습니다.").includes("변경 대상 불명확"));
});

test("변경 대상 불명확 — 새 일정에는 붙지 않는다", () => {
  assert.deepEqual(flagsOf("9월 2일 2학년 학년 협의회가 있습니다."), []);
});

test("모호 표시 — 날짜 쪽 표시와 문장 쪽 표시를 한 곳에서 합친다", () => {
  const sentence = "당분간 수요일마다 학년 협의회를 합니다.";
  const flags = flagsOf(sentence);
  assert.ok(flags.includes("요일만 적힘"), `요일만 적힘이 없다: ${flags}`);
  assert.ok(flags.includes("반복 주기 불명확"), `반복 주기 불명확이 없다: ${flags}`);
});

// ── 대상 판정 (PRD 9장 「일정 대상이 사용자와 관련 있다고 판단됨」) ──────────

/** 발송일 2026-08-27 (목). 나는 1·2학년 담임이다. */
function relatedFor(sentence: string, role = ROLE) {
  return relatedToUser(readSignals(sentence, sentence, role));
}

test("대상 판정 — 대상이 아예 안 적혀 있으면 나에게 온 쪽지로 본다", () => {
  assert.equal(relatedFor("모레까지 학급 명렬표를 제출해 주시기 바랍니다."), true);
  assert.equal(relatedFor("내일 건강검진이 진행됩니다."), true);
});

test("대상 판정 — 대상이 적혀 있는데 내가 아니면 사람이 확인한다", () => {
  // 나는 담임이지만 3학년이 아니다. 「담임」 한 갈래가 맞는다고 통과시키면 안 된다.
  assert.equal(relatedFor("내일 3학년 담임 선생님들은 학년 협의회에 참석해 주세요."), false);
  assert.equal(relatedFor("내일 2학년 담임 선생님들은 학년 협의회에 참석해 주세요."), true);
});

test("대상 판정 — 「전 교직원」이면 학년·담임 여부를 따지지 않는다", () => {
  assert.equal(relatedFor("내일 3학년 교실 점검이 있으니 전 교직원 협조 바랍니다."), true);
});

test("대상 판정 — 담임이 아니면 담임 공지는 내 것이 아니다", () => {
  const notHomeroom = { homeroom: false, grades: [] };
  assert.equal(relatedFor("내일 담임 선생님들은 학년 협의회에 참석해 주세요.", notHomeroom), false);
});

test("대상 판정 — 역할 설정이 비어 있으면 대상이 적힌 쪽지는 걸러진다 (기술계획서 8.9)", () => {
  // 역할을 모르면 «3학년 담임»이 나인지 알 수 없다. 사람이 확인하는 쪽이 맞다.
  assert.equal(relatedFor("내일 3학년 담임 선생님들은 협의회에 참석해 주세요.", {}), false);
  // 대상이 아예 안 적힌 쪽지는 역할과 무관하게 나에게 온 것이다.
  assert.equal(relatedFor("내일 건강검진이 진행됩니다.", {}), true);
});

test("자동등록 단계 — 모레·다음 주 월요일은 0.8 문턱을 건너뛴다", () => {
  const bare: SentenceSignals = {
    action: { label: "제출", weight: 1.0 },
    event: null,
    isDeadline: true,
    isOptional: false,
    isUrgent: false,
    relation: "new",
    recurrenceRule: null,
    recurrenceVague: false,
    location: null,
    target: null,
    conductsEvent: false,
    optionalNearby: false,
    allStaff: false,
    matchesRole: false,
    targetMismatch: false,
    keywords: [],
  };
  const more: DateMention = {
    text: "모레까지",
    index: 0,
    startAt: "2026-08-30",
    precision: "date_only",
    flags: [],
    rule: "day-after-tomorrow",
  };
  const scored = scoreCandidate(more, bare, civil(2026, 8, 28));
  assert.ok(scored.confidence < AUTO_REGISTER_THRESHOLD["분명한 일정까지"], String(scored.confidence));
  assert.ok(CLEAR_RELATIVE_DATE_RULES.has("day-after-tomorrow"));
  assert.ok(CLEAR_RELATIVE_DATE_RULES.has("next-week-weekday"));

  const relative = evaluateAutoRegister({
    candidateType: "DEADLINE",
    when: more.startAt,
    ambiguityFlags: [],
    relationType: "new",
    confidence: scored.confidence,
    isOptional: false,
    related: true,
    dateRule: more.rule,
  });
  assert.equal(relative.eligible, true, relative.blockers.join(" / "));

  const calendar = evaluateAutoRegister({
    candidateType: "DEADLINE",
    when: "2026-09-02",
    ambiguityFlags: [],
    relationType: "new",
    confidence: scored.confidence,
    isOptional: false,
    related: true,
    dateRule: "absolute-md",
  });
  assert.equal(calendar.eligible, false);
  assert.ok(calendar.blockers.some((b) => b.includes("기준에 미치지 못함")));

  const strict = evaluateAutoRegister({
    candidateType: "DEADLINE",
    when: more.startAt,
    ambiguityFlags: [],
    relationType: "new",
    confidence: scored.confidence,
    isOptional: false,
    related: true,
    dateRule: more.rule,
    level: "아주 확실한 것만",
  });
  assert.equal(strict.eligible, false);
});
