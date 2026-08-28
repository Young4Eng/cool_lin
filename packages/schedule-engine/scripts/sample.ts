/**
 * 위젯(역할 2)에 넘길 출력 견본을 만든다.
 *
 *   npx tsx scripts/sample.ts
 *
 * 합성 golden set으로 만들기 때문에 실제 개인정보가 들어가지 않는다.
 * 결과는 fixtures/sample-output.json 에 쓰이고 저장소에 커밋해도 안전하다.
 * 위젯 쪽에서는 실제 파일 없이도 이 파일만으로 화면을 붙여 볼 수 있다.
 */
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { civil } from "../src/dates/civil.js";
import { runPipeline } from "../src/pipeline.js";
import { loadGolden, writeGoldenWorkbook } from "./_golden-workbook.js";

const golden = await loadGolden();
const ref = golden.referenceDate;
const now = civil(Number(ref.slice(0, 4)), Number(ref.slice(5, 7)), Number(ref.slice(8, 10)));

const dir = await mkdtemp(path.join(tmpdir(), "cool-lin-sample-"));
try {
  const file = await writeGoldenWorkbook(path.join(dir, "sample.xls"), golden.cases);

  const result = await runPipeline([file], {
    now,
    windowDays: 30,
    role: { homeroom: true, grades: [1, 2], interests: ["연수", "평가"] },
  });

  const payload = {
    $comment:
      "위젯 연동용 출력 견본. 합성 golden set으로 만들어 실제 개인정보가 없다. " +
      "startAt/endAt/dueAt 에는 시간대 표시가 없으며 Asia/Seoul 벽시계 값이다.",
    generatedAt: new Date().toISOString(),
    referenceDate: ref,
    role: { homeroom: true, grades: [1, 2], interests: ["연수", "평가"] },
    stats: result.stats,
    candidates: result.candidates,
  };

  const out = path.resolve("fixtures/sample-output.json");
  await writeFile(out, JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(`fixtures/sample-output.json — 후보 ${result.candidates.length}건을 저장했습니다.`);
  for (const c of result.candidates) {
    console.log(`  ${(c.dueAt ?? c.startAt ?? "?").padEnd(17)} ${c.candidateType.padEnd(17)} ${c.proposedTitle}`);
  }
} finally {
  await rm(dir, { recursive: true, force: true });
}
