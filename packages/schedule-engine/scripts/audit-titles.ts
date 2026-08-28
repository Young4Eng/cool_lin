/**
 * 캘린더 표기 점검기.
 *
 *   npx tsx scripts/audit-titles.ts [폴더]
 *
 * 캘린더 칸에 실제로 보이는 값(제목·장소·핵심어)만 뽑아, 사람 눈에 거슬릴 만한
 * 찌꺼기가 남았는지 센다. 과거 날짜 필터를 일부러 끄고 돌려서 표본을 최대로 만든다.
 *
 * 원문은 출력하지 않는다. 제목 자체가 원문 조각이므로 이 스크립트의 출력은
 * 화면에서만 보고 파일로 남기지 않는다.
 */
import { readdir } from "node:fs/promises";
import path from "node:path";
import { civil } from "../src/dates/civil.js";
import { runPipeline } from "../src/pipeline.js";
import type { Candidate } from "../src/types.js";

const dir = path.resolve(process.argv[2] ?? "../../coolexcel");
const files = (await readdir(dir)).filter((f) => /\.xlsx?$/i.test(f)).map((f) => path.join(dir, f));

// 기준일을 아주 과거로 두면 «지난 일정» 필터가 걸리지 않아 표본이 최대가 된다.
const result = await runPipeline(files, {
  now: civil(2000, 1, 1),
  windowDays: 99_999,
  maxCandidates: 100_000,
  role: { homeroom: true, grades: [2], interests: ["연수", "평가"] },
});

const cands = result.candidates;
console.log(`후보 ${cands.length}건의 캘린더 표기를 점검합니다.\n`);

interface Smell {
  name: string;
  why: string;
  hit: (c: Candidate) => boolean;
}

const SMELLS: Smell[] = [
  {
    name: "인사말 잔재",
    why: "캘린더에 «안녕하세요 선생님»이 박힌다",
    hit: (c) => /안녕하[세십]|반갑습|수고\s*(하|많)|선생님께서|담임선생님/.test(c.proposedTitle),
  },
  {
    name: "문장 종결어미",
    why: "제목이 아니라 문장을 그대로 잘라 왔다",
    hit: (c) => /(습니다|입니다|합니다|하세요|해요|됩니다|드립니다|바랍니다|주세요|십시오)[.!?]?$/.test(c.proposedTitle),
  },
  {
    name: "날짜·시각 조각",
    why: "캘린더 칸에 이미 날짜가 있는데 제목에 또 들어간다",
    hit: (c) =>
      /\d\s*(월|일|시|분|교시|주)|[월화수목금토일]요일|오늘|내일|모레|금일|명일|오전|오후|\d{1,2}:\d{2}/.test(
        c.proposedTitle,
      ),
  },
  {
    name: "조사로 시작",
    why: "앞이 잘려 나간 조각이다",
    hit: (c) => /^(?:을|를|은|는|이|가|의|에|와|과|로|으로|도|만|까지|부터|에서)\s/.test(c.proposedTitle),
  },
  {
    name: "마스킹 표시 노출",
    why: "«[학번]», «[전화번호]» 가 그대로 보인다",
    hit: (c) => /\[(주민번호|전화번호|계좌번호|비밀번호|학번|상담·건강)\]/.test(c.proposedTitle),
  },
  {
    name: "사람 이름 의심",
    why: "개인 이름이 캘린더에 남는다",
    hit: (c) => /[가-힣]{2,4}\s*(선생님|샘|님|쌤)(?![가-힣])/.test(c.proposedTitle),
  },
  {
    name: "첨부파일명",
    why: "«.hwp», «.pdf» 가 제목에 들어갔다",
    hit: (c) => /\.(hwp|pdf|xlsx?|docx?|pptx?|zip|jpg|png)/i.test(c.proposedTitle),
  },
  {
    name: "특수문자로 시작",
    why: "글머리 기호·괄호가 남았다",
    hit: (c) => /^[^가-힣A-Za-z0-9]/.test(c.proposedTitle),
  },
  {
    name: "괄호 짝 안 맞음",
    why: "잘린 자리에 여는 괄호만 남았다",
    hit: (c) => {
      const open = (c.proposedTitle.match(/[([{]/g) ?? []).length;
      const close = (c.proposedTitle.match(/[)\]}]/g) ?? []).length;
      return open !== close;
    },
  },
  {
    name: "너무 김 (20자 초과)",
    why: "캘린더 한 칸에서 잘려 뒤가 안 보인다",
    hit: (c) => c.proposedTitle.length > 20,
  },
  {
    name: "너무 짧음 (2자 이하)",
    why: "무슨 일인지 알 수 없다",
    hit: (c) => c.proposedTitle.trim().length <= 2,
  },
  {
    name: "내용 없는 일반어 단독",
    why: "«제출»만 있으면 무엇을 제출하는지 모른다",
    hit: (c) => /^(제출|신청|참석|확인|입력|작성|회신|안내|등록|준비|배부|취합|참고 공지|학교 일정|처리할 일|제출 마감|신청 안내|긴급 공지)$/.test(c.proposedTitle.trim()),
  },
  {
    name: "장소가 수상함",
    why: "장소 칸에 엉뚱한 말이 들어갔다",
    hit: (c) => c.location !== null && (c.location.length > 14 || /\d{3,}|습니다|해\s*주/.test(c.location)),
  },
  {
    name: "핵심어에 찌꺼기",
    why: "핵심어에 날짜·용언이 섞였다",
    hit: (c) =>
      c.keywords.some(
        (k) => /\d\s*(월|일|시|분|교시)|[월화수목금토일]요일/.test(k) || /[가-힣]{2,}(된|던|하는|되는)$/.test(k),
      ),
  },
];

const rows = SMELLS.map((s) => {
  const hits = cands.filter(s.hit);
  return { ...s, hits };
}).sort((a, b) => b.hits.length - a.hits.length);

let problems = 0;
for (const r of rows) {
  if (r.hits.length === 0) continue;
  problems += r.hits.length;
  const pct = ((r.hits.length / cands.length) * 100).toFixed(1);
  console.log(`■ ${r.name}  ${r.hits.length}건 (${pct}%)`);
  console.log(`   ${r.why}`);
  const shown = new Set<string>();
  for (const c of r.hits) {
    const key = r.name === "장소가 수상함" ? String(c.location) : r.name === "핵심어에 찌꺼기" ? c.keywords.join("|") : c.proposedTitle;
    if (shown.has(key)) continue;
    shown.add(key);
    if (shown.size > 6) break;
    console.log(`   · "${key}"`);
  }
  console.log();
}

console.log("─".repeat(70));
if (problems === 0) {
  console.log("거슬리는 표기를 찾지 못했습니다.");
} else {
  console.log(`총 ${problems}건의 지적 (후보 ${cands.length}건 중, 중복 계산 포함)`);
}

// 깨끗한 제목이 어떤 모습인지도 함께 본다.
const clean = cands.filter((c) => !SMELLS.some((s) => s.hit(c)));
console.log(`\n지적 없는 후보 ${clean.length}건 (${((clean.length / cands.length) * 100).toFixed(1)}%). 표본:`);
const seen = new Set<string>();
for (const c of clean) {
  if (seen.has(c.proposedTitle)) continue;
  seen.add(c.proposedTitle);
  if (seen.size > 25) break;
  console.log(`   ${c.proposedTitle.padEnd(24)} ${c.location ?? ""}`);
}
