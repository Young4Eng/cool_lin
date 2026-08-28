/**
 * 규칙 도출용 분석기.
 *
 * 실제 쿨메신저 내보내기를 훑어 "어떤 날짜 표현이 얼마나 자주 나오는가", "어떤 행동 단어가
 * 일정과 붙어 다니는가" 를 센다. 여기서 나온 빈도가 src/classify/lexicon.ts 의 근거다.
 *
 * 원문은 화면에 통계로만 나오고 파일로 쓰지 않는다.
 */
import { readdir } from "node:fs/promises";
import path from "node:path";
import { extractMessages } from "../src/adapters/columns.js";
import { parseWorkbook } from "../src/adapters/workbook.js";
import { normalizeBody } from "../src/text/normalize.js";
import { splitQuote } from "../src/text/quote.js";
import { parseSentAt } from "../src/dates/sentAt.js";
import { toISO } from "../src/dates/civil.js";

const dir = path.resolve(process.argv[2] ?? "../../coolexcel");
const files = (await readdir(dir)).filter((f) => /\.xlsx?$/i.test(f));

interface Doc {
  body: string;
  title: string;
  counterpart: string;
  direction: "received" | "sent";
  sentAt: string | null;
  quotedOnly: boolean;
}

const seen = new Set<string>();
const docs: Doc[] = [];
let unparsedDate = 0;

for (const name of files) {
  const wb = await parseWorkbook(path.join(dir, name));
  for (const m of extractMessages(wb.sheets).messages) {
    const body = normalizeBody(m.body);
    const { current, quotedOnly } = splitQuote(body);
    const sent = parseSentAt(m.sentAtRaw);
    if (sent === null && m.sentAtRaw.trim().length > 0) unparsedDate += 1;
    // 파일이 여러 번 내보내져 같은 쪽지가 겹치므로 여기서 한 번 걸러 센다.
    const key = m.direction + "|" + m.counterpart + "|" + m.sentAtRaw + "|" + current.slice(0, 200);
    if (seen.has(key)) continue;
    seen.add(key);
    docs.push({
      body: current,
      title: m.title,
      counterpart: m.counterpart,
      direction: m.direction,
      sentAt: sent ? toISO(sent) : null,
      quotedOnly,
    });
  }
}

const line = (s = "") => console.log(s);
const rule = (t: string) => {
  line();
  line("== " + t + " " + "=".repeat(Math.max(0, 62 - t.length)));
};

const recvCount = docs.filter((d) => d.direction === "received").length;
line(
  "파일 " + files.length + "개 · 중복 제거 후 쪽지 " + docs.length +
    "건 (받은 " + recvCount + " / 보낸 " + (docs.length - recvCount) + ")",
);
line(
  "발송일시 파싱 실패 " + unparsedDate + "건 · 인용문만 있는 쪽지 " +
    docs.filter((d) => d.quotedOnly).length + "건",
);

const corpus = docs.map((d) => d.body);

/** 패턴이 몇 건의 쪽지에 나오는지(문서 빈도)와 예시를 센다. */
function count(name: string, re: RegExp) {
  const flags = re.flags.includes("g") ? re.flags : re.flags + "g";
  let dcount = 0;
  let hits = 0;
  const samples: string[] = [];
  for (const body of corpus) {
    const ms = [...body.matchAll(new RegExp(re.source, flags))];
    if (ms.length === 0) continue;
    dcount += 1;
    hits += ms.length;
    if (samples.length < 3) samples.push(ms[0]![0].replace(/\n/g, " ").slice(0, 26));
  }
  return { name, docs: dcount, hits, samples };
}

function report(title: string, entries: Array<[string, RegExp]>) {
  rule(title);
  const rows = entries.map(([n, re]) => count(n, re)).sort((a, b) => b.docs - a.docs);
  for (const r of rows) {
    if (r.docs === 0) continue;
    const pct = ((r.docs / corpus.length) * 100).toFixed(1);
    line(
      "  " + r.name.padEnd(20) +
        " 쪽지 " + String(r.docs).padStart(4) + "건 (" + pct.padStart(5) + "%)" +
        "  총 " + String(r.hits).padStart(4) + "회   예: " + r.samples.join(" / "),
    );
  }
}

report("절대 날짜 표기", [
  ["N월 N일", /\d{1,2}\s*월\s*\d{1,2}\s*일/],
  ["N/N", /(?<![\d:])\d{1,2}\s*\/\s*\d{1,2}(?![\d/])/],
  ["N.N. (점)", /(?<![\d.])\d{1,2}\s*\.\s*\d{1,2}\s*\.(?!\d)/],
  ["YYYY-MM-DD", /\d{4}\s*[-.]\s*\d{1,2}\s*[-.]\s*\d{1,2}/],
  ["날짜+요일 괄호", /\d{1,2}\s*일\s*\(\s*[월화수목금토일]\s*\)/],
  ["기간 물결", /\d{1,2}\s*[월/]\s*\d{1,2}\s*일?\s*~\s*\d{1,2}/],
]);

report("상대 날짜 표기 (발송일 기준 해석 대상)", [
  ["오늘/금일", /오늘|금일/],
  ["내일/명일", /내일|명일/],
  ["모레", /모레/],
  ["글피", /글피/],
  ["이번 주", /이번\s*주/],
  ["다음 주/차주", /다음\s*주|차주|담주/],
  ["이번 달", /이번\s*달|금월/],
  ["다음 달/내달", /다음\s*달|내달|익월/],
  ["요일만", /[월화수목금토일]\s*요일/],
  ["오늘중/금일중", /오늘\s*중|금일\s*중|오늘\s*내|금일\s*내/],
]);

report("시각·교시 표기", [
  ["HH:MM", /(?<!\d)([01]?\d|2[0-3])\s*:\s*[0-5]\d(?!\d)/],
  ["N시 N분", /\d{1,2}\s*시\s*(\d{1,2}\s*분)?/],
  ["오전/오후", /오전|오후/],
  ["N교시", /\d\s*교시/],
  ["N~N교시", /\d\s*[~-]\s*\d\s*교시/],
  ["점심/중식", /점심|중식/],
  ["종례/조례", /종례|조례|아침조회/],
  ["방과후", /방과\s*후/],
]);

report("마감·행동 표현", [
  ["~까지", /까지/],
  ["제출", /제출/],
  ["신청", /신청/],
  ["작성", /작성/],
  ["입력", /입력/],
  ["회신/답장", /회신|답장|알려\s*주/],
  ["확인 요청", /확인\s*(해\s*주|부탁|바랍)/],
  ["안내/공지", /안내\s*(드립|합니다|해\s*주)|공지/],
  ["부탁드립니다", /부탁\s*(드립|합니다|드려)/],
  ["바랍니다", /바랍니다|바람니다/],
  ["준비", /준비\s*(해|부탁|바랍)/],
  ["배부/배포", /배부|배포|나눠\s*주/],
  ["취합", /취합/],
  ["마감", /마감/],
  ["기한", /기한|기일/],
]);

report("행사·회의 명사", [
  ["회의", /회의/],
  ["연수", /연수/],
  ["협의회", /협의회|협의/],
  ["평가", /평가/],
  ["행사", /행사/],
  ["체험학습", /체험\s*학습|현장\s*학습/],
  ["대회", /대회/],
  ["점검", /점검/],
  ["훈련/대피", /훈련|대피|을지/],
  ["상담", /상담/],
  ["검진", /검진/],
  ["시험/고사", /시험|고사|지필/],
  ["방학/개학", /방학|개학|종업|졸업/],
  ["설문", /설문|수요\s*조사/],
]);

report("의무·대상 표현", [
  ["전 교직원", /전\s*교직원|모든\s*(선생님|교사)|교직원\s*전체/],
  ["필수", /필수|의무|반드시|꼭/],
  ["담임", /담임/],
  ["N학년", /[1-6]\s*학년/],
  ["부장", /부장/],
  ["해당 선생님", /해당\s*(선생님|교사|학급)/],
]);

report("선택 행사 표현 (자동등록 차단)", [
  ["희망", /희망/],
  ["관심 있으신", /관심\s*(있으신|있는)/],
  ["신청자", /신청자|신청하신/],
  ["참석하실 분", /참석하실\s*분|참여하실\s*분/],
  ["원하시는", /원하시는|원하는\s*분/],
  ["부담 갖지", /부담\s*(갖지|되지)/],
  ["가능하신 분", /가능하신\s*분/],
]);

report("변경·취소·정정", [
  ["취소", /취소/],
  ["변경", /변경/],
  ["정정", /정정|수정\s*(합니다|안내)/],
  ["연기", /연기/],
  ["재공지", /재\s*공지|다시\s*안내|재안내/],
  ["무시해", /무시해\s*주|무시하시/],
]);

report("반복 표현", [
  ["매주", /매주/],
  ["매월/매달", /매월|매달/],
  ["매일", /매일/],
  ["격주", /격주/],
  ["수시", /수시/],
  ["당분간", /당분간/],
]);

report("잡담·단순확인 (제외 대상)", [
  ["감사합니다", /감사합니다|감사드립니다|고맙습니다/],
  ["네/넵 단독", /^\s*(네+|넵+|예+)[.!~]*\s*$/m],
  ["확인했습니다", /확인했습니다|확인하겠습니다|알겠습니다/],
  ["수고하세요", /수고\s*(하세요|하셨|많으)/],
  ["좋은 하루/주말", /좋은\s*(하루|주말|저녁|아침)/],
  ["축하", /축하/],
]);

report("민감·보안 (격리 대상)", [
  ["주민등록번호형", /\d{6}\s*-\s*[1-4]\d{6}/],
  ["전화번호", /01[016-9][-\s.]?\d{3,4}[-\s.]?\d{4}/],
  ["계좌번호형", /\d{2,6}-\d{2,6}-\d{2,6}/],
  ["비밀번호", /비밀번호|비번|패스워드|password/i],
  ["학번 5자리", /(?<!\d)\d{5}(?!\d)/],
  ["건강/진단", /진단서|병가|치료|우울|자해/],
]);

rule("제목 열 진단 (기술계획서 7.3 근거)");
{
  let truncated = 0;
  let prefixOfBody = 0;
  let greeting = 0;
  const GREET = /^(안녕하세요|안녕하십니까|선생님|반갑습니다|수고)/;
  for (const d of docs) {
    const t = d.title.trim();
    if (t.length === 0) continue;
    if (d.body.replace(/\s+/g, "").startsWith(t.replace(/\s+/g, "").slice(0, 20))) prefixOfBody += 1;
    if (t.length >= 24) truncated += 1;
    if (GREET.test(t)) greeting += 1;
  }
  const n = docs.length;
  const pc = (v: number) => ((v / n) * 100).toFixed(1);
  line("  제목이 본문 첫 부분과 같음     " + prefixOfBody + "건 (" + pc(prefixOfBody) + "%)");
  line("  제목 길이 24자 이상(잘림 의심) " + truncated + "건 (" + pc(truncated) + "%)");
  line("  제목이 인사말로 시작           " + greeting + "건 (" + pc(greeting) + "%)");
}

rule("발신자 역할 (괄호 안 직책) 상위 15");
{
  const roles = new Map<string, number>();
  for (const d of docs) {
    const m = d.counterpart.match(/\(([^,()]+?)(?:,\s*\d+)?\)/);
    const role = m?.[1]?.trim();
    if (role && !/^\d+$/.test(role)) roles.set(role, (roles.get(role) ?? 0) + 1);
  }
  for (const [role, n] of [...roles].sort((a, b) => b[1] - a[1]).slice(0, 15)) {
    line("  " + role.padEnd(16) + String(n).padStart(4) + "건");
  }
}

rule("본문 길이 분포");
{
  const lens = corpus.map((c) => c.length).sort((a, b) => a - b);
  const q = (p: number) => lens[Math.floor(lens.length * p)] ?? 0;
  const short = lens.filter((l) => l < 30).length;
  line(
    "  최소 " + lens[0] + " · 25% " + q(0.25) + " · 중앙 " + q(0.5) +
      " · 75% " + q(0.75) + " · 95% " + q(0.95) + " · 최대 " + lens.at(-1),
  );
  line("  30자 미만 짧은 쪽지 " + short + "건 (" + ((short / lens.length) * 100).toFixed(1) + "%)");
}

rule("날짜 표현이 하나도 없는 쪽지");
{
  const ANY_DATE =
    /\d{1,2}\s*월\s*\d{1,2}\s*일|\d{1,2}\s*\/\s*\d{1,2}|오늘|금일|내일|명일|모레|글피|이번\s*주|다음\s*주|[월화수목금토일]\s*요일|\d\s*교시|\d{1,2}\s*시/;
  const none = corpus.filter((c) => !ANY_DATE.test(c)).length;
  line(
    "  " + none + "건 (" + ((none / corpus.length) * 100).toFixed(1) +
      "%) — 이만큼은 애초에 일정 후보가 될 수 없다",
  );
}
