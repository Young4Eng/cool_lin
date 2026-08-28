// 메신저 없이도 위젯이 일정을 보여 주도록, 바탕화면에 씨앗 `coolmsg_*.xls` 를 만든다.
//
// 데모 키트용이다. 심사장 PC 에 쿨메신저(목업)를 깔지 못했거나 네트워크가 없어도
// 「가져오기」 대신 이 파일 하나로 위젯이 채워진다 — 셸의 `read_latest_export` 가
// 바탕화면에서 가장 최근 `coolmsg_*.xls` 를 읽기 때문이다.
//
// 내용은 `packages/schedule-engine/fixtures/golden.json` 을 쓴다. 그 파일은 첫 줄에
// 적혀 있듯 **합성 데이터**다 — 실제 데이터에서 관찰된 표현 분포만 본떠 새로 쓴 것이고
// 사람 이름·학교명·연락처는 전부 가공값이다. `coolexcel/` 의 실제 내보내기는 절대
// 쓰지 않는다 (PRD 22장).
//
// **날짜는 주 단위로 민다.** golden set 은 2026-08-28 을 기준으로 쓰였는데, 그날이
// 지나면 일정이 전부 과거가 되어 자동 등록되지 않는다 — 데모에서 캘린더가 텅 빈 채
// 검토함만 차게 된다. 7의 배수로 밀면 「8월 28일(금)」의 **요일이 그대로 맞는다.**
//
//   node scripts/make-seed-xls.mjs                 → 바탕화면에, 오늘 기준으로 밀어서
//   node scripts/make-seed-xls.mjs --out <폴더>    → 다른 곳에 만든다
//   node scripts/make-seed-xls.mjs --shift-weeks 0 → 밀지 않고 원본 날짜 그대로

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const GOLDEN = path.join(ROOT, 'packages', 'schedule-engine', 'fixtures', 'golden.json');

const HEADERS = ['구분', '보낸사람', '받은사람', '제목', '내용', '날짜/시간', '첨부파일'];

function xmlEscape(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** SpreadsheetML 2003 한 칸. 줄바꿈은 그대로 둔다 — 쿨메신저 내보내기도 그렇다. */
function cell(value) {
  return `    <Cell><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`;
}

function row(values) {
  return ['   <Row>', ...values.map(cell), '   </Row>'].join('\n');
}

function sheet(name, rows) {
  return [
    ` <Worksheet ss:Name="${xmlEscape(name)}">`,
    '  <Table>',
    row(HEADERS),
    ...rows.map(row),
    '  </Table>',
    ' </Worksheet>',
  ].join('\n');
}

function build(cases) {
  // 받은메시지 / 보낸메시지 두 장. 실제 내보내기와 같은 모양이라야 파서를 그대로 탄다.
  const received = [];
  const sent = [];
  cases.forEach((c, i) => {
    const line = [
      '받은메시지',
      c.counterpart ?? '',
      '김서준(2학년 3반 담임,132)',
      c.title ?? '',
      c.body ?? '',
      c.sentAt ?? '',
      '',
    ];
    // 몇 건은 보낸메시지 쪽에 둔다. 두 시트가 다 차 있어야 위젯의 원문 찾기까지 확인된다.
    if (i % 7 === 6) {
      sent.push(['보낸메시지', '김서준(2학년 3반 담임,132)', c.counterpart ?? '', c.title ?? '', c.body ?? '', c.sentAt ?? '', '']);
    } else {
      received.push(line);
    }
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?mso-application progid="Excel.Sheet"?>',
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"',
    '          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
    sheet('받은메시지', received),
    sheet('보낸메시지', sent),
    '</Workbook>',
    '',
  ].join('\n');
}


// ─── 날짜 밀기 ────────────────────────────────────────────────────────────────

const DAY_MS = 86400000;

function ymd(d) {
  const p = (n) => String(n).padStart(2, '0');
  return [d.getFullYear(), p(d.getMonth() + 1), p(d.getDate())];
}

/** 7의 배수 중, 기준일을 오늘 이후로 보내는 가장 작은 주 수. */
function autoShiftWeeks(referenceDate, today) {
  const ref = new Date(`${referenceDate}T00:00:00`);
  if (Number.isNaN(ref.getTime())) return 0;
  const diffDays = Math.ceil((today - ref) / DAY_MS);
  return diffDays <= 0 ? 0 : Math.ceil(diffDays / 7);
}

/**
 * 쪽지 한 통의 날짜 표기를 전부 같은 만큼 민다.
 *
 * 손대는 것: `2026/08/27`, `08/27`, `9/16`, `8월 28일`.
 * 손대지 않는 것: `(금)` 같은 요일 — 7의 배수로 밀었으므로 그대로 맞다.
 * 「내일」·「모레」 같은 말도 그대로 둔다. 받은 날(sentAt)이 함께 밀리므로 뜻이 유지된다.
 */
function shiftText(text, days, year) {
  if (!days) return text;
  const move = (y, m, d) => {
    const t = new Date(y, m - 1, d);
    t.setDate(t.getDate() + days);
    return t;
  };
  return String(text ?? '')
    .replace(/(\d{4})([-/.])(\d{1,2})[-/.](\d{1,2})/g, (_m, y, sep, mo, d) => {
      const [Y, M, D] = ymd(move(Number(y), Number(mo), Number(d)));
      return `${Y}${sep}${M}${sep}${D}`;
    })
    .replace(/(?<![\d/.])(\d{1,2})\/(\d{1,2})(?![\d/.])/g, (_m, mo, d) => {
      const t = move(year, Number(mo), Number(d));
      const [, M, D] = ymd(t);
      return `${M}/${D}`;
    })
    .replace(/(\d{1,2})\s*월\s*(\d{1,2})\s*일/g, (_m, mo, d) => {
      const t = move(year, Number(mo), Number(d));
      return `${t.getMonth() + 1}월 ${t.getDate()}일`;
    });
}

function desktopDir() {
  const home = process.env.USERPROFILE || os.homedir();
  const onedrive = path.join(home, 'OneDrive', 'Desktop');
  const plain = path.join(home, 'Desktop');
  // OneDrive 를 쓰는 PC 는 바탕화면이 그쪽이다. 셸도 두 곳을 다 본다.
  return existsSync(onedrive) ? onedrive : plain;
}

function stamp(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}_${p(d.getMonth() + 1)}_${p(d.getDate())}.${p(d.getHours())}.${p(d.getMinutes())}.${p(d.getSeconds())}`;
}

function main() {
  const argv = process.argv.slice(2);
  const outIdx = argv.indexOf('--out');
  const outDir = outIdx >= 0 ? path.resolve(argv[outIdx + 1]) : desktopDir();

  if (!existsSync(GOLDEN)) {
    console.error(`golden set 을 찾지 못했습니다: ${GOLDEN}`);
    process.exit(1);
  }
  const golden = JSON.parse(readFileSync(GOLDEN, 'utf8'));
  const raw = Array.isArray(golden.cases) ? golden.cases : [];
  if (raw.length === 0) {
    console.error('golden set 에 쪽지가 없습니다.');
    process.exit(1);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const wIdx = argv.indexOf('--shift-weeks');
  const weeks = wIdx >= 0 ? Number(argv[wIdx + 1]) : autoShiftWeeks(golden.referenceDate, today);
  if (!Number.isFinite(weeks) || weeks < 0) {
    console.error('--shift-weeks 는 0 이상의 정수여야 합니다.');
    process.exit(1);
  }
  const days = weeks * 7;
  const year = Number(String(golden.referenceDate).slice(0, 4)) || today.getFullYear();

  const cases = raw.map((c) => ({
    ...c,
    sentAt: shiftText(c.sentAt, days, year),
    title: shiftText(c.title, days, year),
    body: shiftText(c.body, days, year),
  }));

  mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, `coolmsg_${stamp(new Date())}.xls`);
  // 쿨메신저 내보내기는 BOM 붙은 UTF-8 이다. 읽는 쪽이 BOM 을 떼도록 되어 있으니
  // 씨앗도 똑같이 붙인다 — 형식이 다르면 «데모에서만 되는 파일»이 된다.
  writeFileSync(file, '﻿' + build(cases), 'utf8');

  console.log(`씨앗 파일을 만들었습니다: ${file}`);
  console.log(`  쪽지 ${cases.length}건 (전부 합성 데이터 — golden.json)`);
  console.log(
    days
      ? `  기준일 ${golden.referenceDate} 에서 ${weeks}주(${days}일) 밀었습니다 — 요일은 그대로입니다.`
      : '  날짜는 원본 그대로입니다.',
  );
  console.log('  위젯에서 「가져오기」 대신 새로고침하면 이 파일에서 일정을 뽑습니다.');
}

main();
