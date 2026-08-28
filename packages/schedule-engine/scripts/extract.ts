/**
 * 파이프라인을 실제 파일에 돌려 일정 후보를 뽑는다.
 *
 *   npx tsx scripts/extract.ts [폴더] [--today=2026-08-28] [--window=14] [--json=out.json]
 *                              [--level=분명한 일정까지|아주 확실한 것만]
 *
 * --level 은 자동 등록 기준 단계다 (기술계획서 7.6). 안전 조건은 단계와 무관하게 그대로이고
 * 바뀌는 것은 신뢰도 문턱 하나뿐이다.
 *
 * --json 으로 저장한 파일은 위젯(역할 2)이 그대로 읽을 수 있는 계약 형태다.
 */
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { runPipeline } from "../src/pipeline.js";
import { civil } from "../src/dates/civil.js";
import {
  DEFAULT_AUTO_REGISTER_LEVEL,
  isAutoRegisterLevel,
  type AutoRegisterLevel,
} from "../src/policy/autoRegister.js";
import type { Candidate } from "../src/types.js";

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith("--"));
const flag = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];

const dir = path.resolve(positional[0] ?? "../../coolexcel");
const files = (await readdir(dir)).filter((f) => /\.xlsx?$/i.test(f)).map((f) => path.join(dir, f));

const levelFlag = flag("level");
let autoRegisterLevel: AutoRegisterLevel = DEFAULT_AUTO_REGISTER_LEVEL;
if (levelFlag !== undefined) {
  if (!isAutoRegisterLevel(levelFlag)) {
    console.error(`--level 값이 «아주 확실한 것만» 또는 «분명한 일정까지» 가 아닙니다: ${levelFlag}`);
    process.exit(1);
  }
  autoRegisterLevel = levelFlag;
}

const todayFlag = flag("today");
const now = todayFlag
  ? civil(Number(todayFlag.slice(0, 4)), Number(todayFlag.slice(5, 7)), Number(todayFlag.slice(8, 10)))
  : new Date();

const result = await runPipeline(files, {
  now,
  windowDays: Number(flag("window") ?? 14),
  // 데모용 역할 태그. 실제 앱에서는 최초 실행 화면에서 사용자가 고른다.
  role: { homeroom: true, grades: [2], interests: ["연수", "평가"] },
  autoRegisterLevel,
});

const s = result.stats;
console.log("── 처리 통계 ──────────────────────────────────────────────");
console.log(`  파일 ${s.filesRead}개에서 행 ${s.rowsRead}건 읽음`);
console.log(`  가져오기 기간 밖   ${s.outOfWindow}`);
console.log(`  인용문만 있음      ${s.quotedOnly}`);
console.log(`  중복 쪽지          ${s.duplicates}`);
console.log(`  같은 일정 합침     ${s.mergedCandidates}`);
console.log(`  민감정보로 격리    ${s.quarantined}`);
console.log(`  실제 처리한 쪽지   ${s.messagesProcessed}`);
console.log(`  일정 날짜가 지남   ${s.pastDate}`);
console.log(`  후보 없음          ${s.noDate}`);
console.log(`  ▶ 후보 ${s.candidates}건 (자동등록 가능 ${s.autoRegisterEligible}건 · 기준 「${autoRegisterLevel}」)`);

const byType = new Map<string, number>();
const byBand = new Map<string, number>();
for (const c of result.candidates) {
  byType.set(c.candidateType, (byType.get(c.candidateType) ?? 0) + 1);
  byBand.set(c.confidenceBand, (byBand.get(c.confidenceBand) ?? 0) + 1);
}
console.log("\n── 분류별 ─────────────────────────────────────────────────");
for (const [k, v] of [...byType].sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(18)} ${v}`);
console.log("\n── 신뢰도 ─────────────────────────────────────────────────");
for (const k of ["높음", "검토 필요", "낮음"]) console.log(`  ${k.padEnd(18)} ${byBand.get(k) ?? 0}`);

const flagCounts = new Map<string, number>();
for (const c of result.candidates) for (const f of c.ambiguityFlags) flagCounts.set(f, (flagCounts.get(f) ?? 0) + 1);
if (flagCounts.size > 0) {
  console.log("\n── 확인 필요 표시 ─────────────────────────────────────────");
  for (const [k, v] of [...flagCounts].sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(18)} ${v}`);
}

const show = (c: Candidate) => {
  const when = c.dueAt ?? c.startAt ?? "?";
  const range = c.endAt ? ` ~ ${c.endAt}` : "";
  const period = c.periodStart ? ` (${c.periodStart}${c.periodEnd !== c.periodStart ? `~${c.periodEnd}` : ""}교시)` : "";
  const marks = c.ambiguityFlags.length > 0 ? `  ⚠ ${c.ambiguityFlags.join(", ")}` : "";
  console.log(`  ${when}${range}${period}  [${c.candidateType}] ${c.proposedTitle}`);
  console.log(
    `     신뢰도 ${c.confidenceBand}(${c.confidence})  핵심어 [${c.keywords.join(", ")}]` +
      (c.location ? `  장소 ${c.location}` : "") +
      (c.targetText ? `  대상 ${c.targetText}` : "") +
      marks,
  );
  console.log(`     근거: ${c.reasoning.join(" · ")}`);
  if (!c.autoRegisterEligible) console.log(`     자동등록 보류: ${c.autoRegisterBlockers.join(" / ")}`);
};

console.log("\n── 자동등록 가능한 후보 ───────────────────────────────────");
const auto = result.candidates.filter((c) => c.autoRegisterEligible);
if (auto.length === 0) console.log("  (없음)");
for (const c of auto.slice(0, 20)) show(c);

console.log("\n── 확인이 필요한 후보 (상위 15) ───────────────────────────");
for (const c of result.candidates.filter((c) => !c.autoRegisterEligible).sort((a, b) => b.confidence - a.confidence).slice(0, 15)) {
  show(c);
}

const out = flag("json");
if (out) {
  const payload = {
    generatedAt: new Date().toISOString(),
    stats: result.stats,
    candidates: result.candidates,
  };
  await writeFile(path.resolve(out), JSON.stringify(payload, null, 2), "utf8");
  console.log(`\n${out} 에 후보 ${result.candidates.length}건을 저장했습니다.`);
}
