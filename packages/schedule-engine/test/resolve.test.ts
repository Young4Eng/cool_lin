import assert from "node:assert/strict";
import { test } from "node:test";
import { civil } from "../src/dates/civil.js";
import { extractDates } from "../src/dates/resolve.js";
import { parseSentAt } from "../src/dates/sentAt.js";

/** 기준 발송일: 2026-08-27 (목) 08:21 */
const SENT = civil(2026, 8, 27, 8, 21);

function first(text: string, sentAt = SENT) {
  const [m] = extractDates(text, { sentAt });
  assert.ok(m, `날짜를 찾지 못했습니다: ${text}`);
  return m;
}

function none(text: string, sentAt = SENT) {
  return extractDates(text, { sentAt });
}

test("발송일시 파싱 — 꼬리 요일 괄호를 뗀다", () => {
  const d = parseSentAt("2026/08/24 09:32:21 (월)");
  assert.ok(d);
  assert.equal(d.getUTCFullYear(), 2026);
  assert.equal(d.getUTCMonth() + 1, 8);
  assert.equal(d.getUTCDate(), 24);
  assert.equal(d.getUTCHours(), 9);
  assert.equal(d.getUTCMinutes(), 32);
});

test("발송일시 파싱 — 엑셀 일련번호", () => {
  const d = parseSentAt("46265");
  assert.ok(d);
  assert.equal(d.getUTCFullYear(), 2026);
});

test("오늘 / 내일 / 모레 / 글피 — 발송일 기준", () => {
  assert.equal(first("오늘 회의가 있습니다").startAt, "2026-08-27");
  assert.equal(first("내일 제출해 주세요").startAt, "2026-08-28");
  assert.equal(first("모레까지 부탁드립니다").startAt, "2026-08-29");
  assert.equal(first("글피 행사입니다").startAt, "2026-08-30");
});

test("모레는 발송일이 다르면 결과도 달라진다", () => {
  const m = first("모레까지 제출", civil(2026, 8, 31));
  assert.equal(m.startAt, "2026-09-02");
});

test("N월 N일 — 가장 흔한 형태", () => {
  const m = first("8월 28일 교무회의가 있습니다");
  assert.equal(m.startAt, "2026-08-28");
  assert.equal(m.rule, "month-day");
  assert.deepEqual(m.flags, []);
});

test("날짜+요일이 맞으면 통과, 틀리면 «날짜·요일 불일치»", () => {
  // 2026-08-27은 실제로 목요일
  assert.deepEqual(first("8월 27일(목)까지 제출").flags, []);
  assert.deepEqual(first("8월 27일(금)까지 제출").flags, ["날짜·요일 불일치"]);
});

test("날짜에 딸린 요일은 별도 일정으로 중복 추출하지 않는다", () => {
  const ms = none("8월 27일 목요일 회의");
  assert.equal(ms.length, 1, "일정은 하나여야 한다");
  assert.equal(ms[0]!.startAt, "2026-08-27");
});

test("요일만 적힘 — 발송일 이후 가장 가까운 그 요일", () => {
  // 발송일 목요일 → 다가오는 금요일은 8/28
  const fri = first("금요일까지 제출 부탁드립니다");
  assert.equal(fri.startAt, "2026-08-28");
  assert.deepEqual(fri.flags, ["요일만 적힘"]);

  // 발송일이 목요일이므로 다가오는 화요일은 다음 주 9/1
  const tue = first("화요일 창체 시간에 진행합니다");
  assert.equal(tue.startAt, "2026-09-01");
});

test("요일만 적힘 — 같은 요일이면 당일로 본다", () => {
  assert.equal(first("목요일 종례 후 모이겠습니다").startAt, "2026-08-27");
});

test("이번 주 / 다음 주 + 요일", () => {
  assert.equal(first("이번 주 금요일 회의").startAt, "2026-08-28");
  assert.equal(first("다음 주 월요일까지").startAt, "2026-08-31");
  assert.equal(first("담주 화요일 협의회").startAt, "2026-09-01");
});

test("N/N 표기", () => {
  assert.equal(first("9/16 현장체험학습").startAt, "2026-09-16");
});

test("HH:MM 은 날짜로 잘못 잡히지 않는다", () => {
  const ms = none("15:20 강당에서 교무회의");
  assert.equal(ms.length, 1);
  assert.equal(ms[0]!.rule, "time-only-assumed-send-day");
  assert.equal(ms[0]!.startAt, "2026-08-27T15:20");
});

test("날짜 + 시각 결합", () => {
  const m = first("8월 28일(금) 15:20 강당에서 2학기 교무회의가 있습니다");
  assert.equal(m.startAt, "2026-08-28T15:20");
  assert.equal(m.precision, "exact");
});

test("오전·오후 없는 1~7시는 «오전·오후 불명확»", () => {
  const m = first("8월 28일 3시에 모이겠습니다");
  assert.equal(m.startAt, "2026-08-28T15:00");
  assert.ok(m.flags.includes("오전·오후 불명확"));

  const pm = first("8월 28일 오후 3시 30분에 모이겠습니다");
  assert.equal(pm.startAt, "2026-08-28T15:30");
  assert.deepEqual(pm.flags, []);
});

test("교시는 시각으로 추정하지 않고 번호를 보존한다", () => {
  const m = first("내일 5~6교시 계기교육을 실시합니다");
  assert.equal(m.startAt, "2026-08-28");
  assert.equal(m.periodStart, 5);
  assert.equal(m.periodEnd, 6);
  assert.ok(m.flags.includes("교시표 미설정"));
});

test("교시표가 설정되면 시각으로 바꾼다", () => {
  const [m] = extractDates("내일 5교시 수업 공개", {
    sentAt: SENT,
    periodTable: { 5: { start: [13, 10], end: [13, 50] } },
  });
  assert.ok(m);
  assert.equal(m.startAt, "2026-08-28T13:10");
  assert.ok(!m.flags.includes("교시표 미설정"));
});

test("기간 표기", () => {
  const m = first("9월 1일~9월 3일 지필평가");
  assert.equal(m.startAt, "2026-09-01");
  assert.equal(m.endAt, "2026-09-03");

  const short = first("8/11~8/13 연수");
  assert.equal(short.startAt, "2026-08-11");
  assert.equal(short.endAt, "2026-08-13");
});

test("연도 생략 — 해가 바뀌면 다음 해로 보고 표시를 남긴다", () => {
  const m = first("1월 5일 개학식");
  assert.equal(m.startAt, "2027-01-05");
  assert.ok(m.flags.includes("연도 생략"));
});

test("연도가 적혀 있으면 그대로 쓴다", () => {
  const m = first("2026-09-16 현장체험학습");
  assert.equal(m.startAt, "2026-09-16");
  assert.deepEqual(m.flags, []);
});

test("공문식 점 표기 9.2.", () => {
  assert.equal(first("9.2. 까지 제출").startAt, "2026-09-02");
});

test("한 문장에 날짜가 여럿이면 각각 뽑는다", () => {
  const ms = none("8월 28일 교무회의, 9월 2일 학년협의회");
  assert.equal(ms.length, 2);
  assert.equal(ms[0]!.startAt, "2026-08-28");
  assert.equal(ms[1]!.startAt, "2026-09-02");
});

test("날짜가 없으면 아무것도 만들지 않는다", () => {
  assert.equal(none("감사합니다. 좋은 하루 되세요.").length, 0);
  assert.equal(none("전자칠판 계정은 일괄 초기화했습니다.").length, 0);
});

test("전화번호는 날짜로 잡히지 않는다", () => {
  assert.equal(none("연락처는 010-9094-8756 입니다").length, 0);
});

test("내선번호·학번은 날짜로 잡히지 않는다", () => {
  assert.equal(none("융합정보부(내선 114)로 연락 바랍니다").length, 0);
  assert.equal(none("10514 학생 서류입니다").length, 0);
});
