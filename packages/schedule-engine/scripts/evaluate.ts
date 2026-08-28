/**
 * golden set 회귀 평가.
 *
 *   npx tsx scripts/evaluate.ts
 *
 * fixtures/golden.json 을 SpreadsheetML 워크북으로 만들어 파이프라인 전체를 통과시킨다.
 * 파서까지 함께 검증하기 위해서다. 기준 미달이면 종료 코드 1로 끝난다 (PRD 17장).
 */
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { runPipeline } from "../src/pipeline.js";
import { civil } from "../src/dates/civil.js";
import type { Candidate } from "../src/types.js";
import { loadGolden, writeGoldenWorkbook } from "./_golden-workbook.js";

interface GoldenCase {
  id: string;
  note: string;
  sentAt: string;
  counterpart: string;
  title: string;
  body: string;
  expect: {
    type?: string | null;
    startAt?: string;
    endAt?: string;
    dueAt?: string;
    periodStart?: number;
    periodEnd?: number;
    flags?: string[];
    autoRegister?: boolean;
    quarantine?: boolean;
    relationType?: string;
    candidateCount?: number;
  };
}

const golden = (await loadGolden()) as unknown as { referenceDate: string; cases: GoldenCase[] };

const dir = await mkdtemp(path.join(tmpdir(), "cool-lin-golden-"));

const ref = golden.referenceDate;
const now = civil(Number(ref.slice(0, 4)), Number(ref.slice(5, 7)), Number(ref.slice(8, 10)));

// 케이스별로 따로 돌려야 «어느 쪽지에서 나온 후보인가»를 딱 맞출 수 있다.
// 한 번에 돌리면 중복 제거가 케이스 사이에 걸쳐 작동한다.
const results = new Map<string, Candidate[]>();
for (const c of golden.cases) {
  const one = await writeGoldenWorkbook(path.join(dir, `${c.id}.xls`), [c]);
  const result = await runPipeline([one], {
    now,
    windowDays: 30,
    role: { homeroom: true, grades: [1, 2], interests: ["연수", "평가"] },
  });
  results.set(c.id, result.candidates);
}

interface Failure {
  id: string;
  note: string;
  reason: string;
}

const failures: Failure[] = [];
let checks = 0;
let passed = 0;

const check = (c: GoldenCase, ok: boolean, reason: string) => {
  checks += 1;
  if (ok) passed += 1;
  else failures.push({ id: c.id, note: c.note, reason });
};

// 품질 지표 (PRD 17장)
let officialProposed = 0;
let officialCorrect = 0;
let chatCases = 0;
let chatFalsePositives = 0;
let sensitiveCases = 0;
let sensitiveCaught = 0;

for (const c of golden.cases) {
  const got = results.get(c.id) ?? [];
  const e = c.expect;
  const whenOf = (x: Candidate) => x.dueAt ?? x.startAt ?? "";

  if (e.quarantine === true) {
    sensitiveCases += 1;
    const caught = got.length === 0;
    if (caught) sensitiveCaught += 1;
    check(c, caught, `민감정보 쪽지인데 후보 ${got.length}건이 만들어졌습니다`);
    continue;
  }

  if (e.type === null && e.candidateCount === undefined) {
    chatCases += 1;
    if (got.length > 0) chatFalsePositives += 1;
    check(c, got.length === 0, `후보가 생기면 안 되는데 ${got.length}건 생겼습니다: ${got.map((g) => g.proposedTitle).join(", ")}`);
    continue;
  }

  if (e.candidateCount !== undefined) {
    check(c, got.length === e.candidateCount, `후보 ${e.candidateCount}건을 기대했으나 ${got.length}건`);
  }

  if (got.length === 0) {
    check(c, false, "후보가 하나도 만들어지지 않았습니다");
    continue;
  }

  const expectedWhen = e.dueAt ?? e.startAt;
  const match =
    expectedWhen === undefined ? got[0]! : (got.find((g) => whenOf(g) === expectedWhen) ?? got[0]!);

  if (expectedWhen !== undefined) {
    check(c, whenOf(match) === expectedWhen, `날짜 기대 ${expectedWhen}, 실제 ${whenOf(match)}`);
  }
  if (e.endAt !== undefined) {
    check(c, match.endAt === e.endAt, `종료일 기대 ${e.endAt}, 실제 ${match.endAt}`);
  }
  if (e.periodStart !== undefined) {
    check(c, match.periodStart === e.periodStart, `시작 교시 기대 ${e.periodStart}, 실제 ${match.periodStart}`);
  }
  if (e.periodEnd !== undefined) {
    check(c, match.periodEnd === e.periodEnd, `종료 교시 기대 ${e.periodEnd}, 실제 ${match.periodEnd}`);
  }
  if (e.type !== undefined && e.type !== null) {
    const ok = match.candidateType === e.type;
    check(c, ok, `분류 기대 ${e.type}, 실제 ${match.candidateType}`);
    if (e.type === "OFFICIAL_EVENT" || e.type === "DEADLINE" || e.type === "PERSONAL_TASK") {
      officialProposed += 1;
      if (ok) officialCorrect += 1;
    }
  }
  if (e.flags !== undefined) {
    const got_ = [...match.ambiguityFlags].sort();
    const want = [...e.flags].sort();
    check(c, JSON.stringify(got_) === JSON.stringify(want), `확인 표시 기대 [${want}], 실제 [${got_}]`);
  }
  if (e.relationType !== undefined) {
    check(c, match.relationType === e.relationType, `관계 기대 ${e.relationType}, 실제 ${match.relationType}`);
  }
  if (e.autoRegister !== undefined) {
    check(
      c,
      match.autoRegisterEligible === e.autoRegister,
      `자동등록 기대 ${e.autoRegister}, 실제 ${match.autoRegisterEligible}` +
        (match.autoRegisterBlockers.length > 0 ? ` (${match.autoRegisterBlockers.join(" / ")})` : ""),
    );
  }
}

await rm(dir, { recursive: true, force: true });

const pct = (a: number, b: number) => (b === 0 ? "—" : `${((a / b) * 100).toFixed(1)}%`);

console.log(`golden set ${golden.cases.length}건 · 검사 ${checks}개 중 ${passed}개 통과 (${pct(passed, checks)})\n`);
console.log("── 품질 지표 (PRD 17장) ───────────────────────────────────");
console.log(`  공식 일정 Precision   ${pct(officialCorrect, officialProposed)}  (목표 95% 이상)`);
console.log(`  민감정보 격리 Recall  ${pct(sensitiveCaught, sensitiveCases)}  (목표 99% 이상)`);
console.log(`  잡담 오탐률           ${pct(chatFalsePositives, chatCases)}  (목표 3% 미만)`);

if (failures.length > 0) {
  console.log(`\n── 실패 ${failures.length}건 ──────────────────────────────────────`);
  for (const f of failures) {
    console.log(`  [${f.id}] ${f.note}`);
    console.log(`     ${f.reason}`);
  }
  process.exitCode = 1;
} else {
  console.log("\n모든 검사를 통과했습니다.");
}
