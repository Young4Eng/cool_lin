/**
 * 추출 과정 추적기.
 *
 *   npx tsx scripts/trace.ts              # 합성 golden set (안전)
 *   npx tsx scripts/trace.ts --real       # 실제 coolexcel 파일
 *
 * 한 쪽지가 «어떤 문장에서 무엇을 보고» 할 일이 됐는지 단계별로 보여준다.
 * 규칙을 설명하거나 오판을 파헤칠 때 쓴다.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { extractMessages } from "../src/adapters/columns.js";
import { parseWorkbook } from "../src/adapters/workbook.js";
import { classifySentence, readSignals } from "../src/classify/classify.js";
import { civil, toISO } from "../src/dates/civil.js";
import { extractDates } from "../src/dates/resolve.js";
import { parseSentAt } from "../src/dates/sentAt.js";
import { normalizeBody } from "../src/text/normalize.js";
import { splitQuote } from "../src/text/quote.js";
import { detectSensitive } from "../src/text/sensitive.js";
import { splitSentences } from "../src/text/sentences.js";
import { buildTitle } from "../src/title.js";

const useReal = process.argv.includes("--real");
const role = { homeroom: true, grades: [2], interests: ["연수", "평가"] };

interface Input {
  id: string;
  sentAtRaw: string;
  titleColumn: string;
  body: string;
}

const inputs: Input[] = [];

if (useReal) {
  const dir = path.resolve("../../coolexcel");
  const seen = new Set<string>();
  for (const name of (await readdir(dir)).filter((f) => /\.xlsx?$/i.test(f))) {
    const wb = await parseWorkbook(path.join(dir, name));
    for (const m of extractMessages(wb.sheets).messages) {
      const key = m.counterpart + m.sentAtRaw + m.body.slice(0, 100);
      if (seen.has(key)) continue;
      seen.add(key);
      inputs.push({ id: m.origin.sheet + ":" + m.origin.row, sentAtRaw: m.sentAtRaw, titleColumn: m.title, body: m.body });
    }
  }
} else {
  const golden = JSON.parse(await readFile(path.resolve("fixtures/golden.json"), "utf8")) as {
    cases: Array<{ id: string; note: string; sentAt: string; title: string; body: string }>;
  };
  for (const c of golden.cases) {
    inputs.push({ id: `${c.id} — ${c.note}`, sentAtRaw: c.sentAt, titleColumn: c.title, body: c.body });
  }
}

const line = (s = "") => console.log(s);
let traced = 0;

for (const input of inputs) {
  const sentAt = parseSentAt(input.sentAtRaw);
  if (sentAt === null) continue;

  const normalized = normalizeBody(input.body);
  const { current, quotedOnly } = splitQuote(normalized);
  const sensitive = detectSensitive(current);
  const sentences = splitSentences(sensitive.masked);

  // 날짜가 하나도 없는 쪽지는 실제 데이터에서 57.7%다. 추적에서도 건너뛴다.
  const hasAnyDate = sentences.some((s) => extractDates(s.text, { sentAt }).length > 0);
  if (!hasAnyDate && !quotedOnly && !sensitive.quarantine) continue;

  traced += 1;
  if (useReal && traced > 12) break;

  line();
  line("═".repeat(78));
  line(`쪽지 ${input.id}`);
  line(`발송일시  ${input.sentAtRaw}  →  기준 시각 ${toISO(sentAt)}`);
  line(`제목 열   "${input.titleColumn.slice(0, 50)}"`);
  line("─".repeat(78));

  if (quotedOnly) {
    line("  ⟶ 인용문만 있어 후보를 만들지 않습니다.");
    continue;
  }
  if (sensitive.quarantine) {
    const kinds = [...new Set(sensitive.hits.map((h) => h.kind))].join(", ");
    line(`  ⟶ 민감정보(${kinds})가 있어 격리합니다. 후보를 만들지 않습니다.`);
    continue;
  }

  for (const sentence of sentences) {
    const dates = extractDates(sentence.text, { sentAt });
    if (dates.length === 0) continue;

    const signals = readSignals(sentence.text, sensitive.masked, role);
    const verdict = classifySentence({
      sentence: sentence.text,
      body: sensitive.masked,
      dates,
      sentAt,
      role,
      quarantined: false,
    });

    line();
    line(`  문장  "${sentence.text.slice(0, 70)}"`);
    line(`  ├ ① 언제      ${dates.map((d) => `${d.startAt}${d.endAt ? "~" + d.endAt : ""} ← "${d.text}" (${d.rule})`).join(" / ")}`);
    if (dates.some((d) => d.flags.length > 0)) {
      line(`  │            ⚠ ${[...new Set(dates.flatMap((d) => d.flags))].join(", ")}`);
    }
    line(`  ├ ② 무엇을    행동 ${signals.action?.label ?? "—"}   행사 ${signals.event?.label ?? (signals.conductsEvent ? "(실시 서술어)" : "—")}`);
    line(`  ├ ③ 누가      ${signals.target ?? "—"}${signals.allStaff ? "  [의무]" : ""}${signals.matchesRole ? "  [내 역할]" : ""}`);
    line(`  ├ ④ 어디서    ${signals.location ?? "—"}`);
    line(`  ├ ⑤ 분류      ${verdict.classification}  신뢰도 ${verdict.band}(${verdict.confidence})`);
    line(`  ├ ⑥ 핵심어    [${signals.keywords.join(", ")}]`);
    const title = buildTitle({
      titleColumn: input.titleColumn,
      body: sensitive.masked,
      sentence: sentence.text,
      signals,
      classification: verdict.classification,
    });
    line(`  └ ⑦ 제목      "${title}"`);
  }
}

line();
line(`추적한 쪽지 ${traced}건`);
