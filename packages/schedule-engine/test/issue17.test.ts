import assert from "node:assert/strict";
import { test } from "node:test";
import { extractFromMessage } from "../src/browser.js";
import { ACTION_TERMS } from "../src/classify/lexicon.js";

/** 이슈 #17 예시. 발송일 2026-08-27 (목) */
const SENT = "2026/08/27 08:21:00 (목)";
const NOW = new Date(Date.UTC(2026, 7, 27, 8, 21));

function run(body: string) {
  return extractFromMessage({ body, sentAt: SENT, subject: "" }, { now: NOW, includePast: true });
}

function whenOf(c: { startAt: string | null; dueAt: string | null }) {
  return c.dueAt ?? c.startAt;
}

test("올려 주세요 · 넣어 주세요 는 행동 사전에서 잡힌다", () => {
  assert.ok(ACTION_TERMS.some((a) => a.term.test("학년게시판에 반별로 올려 주세요")));
  assert.ok(ACTION_TERMS.some((a) => a.term.test("제출함에 넣어 주세요")));
  assert.ok(ACTION_TERMS.some((a) => a.term.test("알려 주세요")), "알려 주 기존 규칙은 유지");
});

test("A. 기한이 다음 줄 — 종례 전까지를 앞 지시에 붙인다", () => {
  const body = `안녕하세요. 교무부입니다.

2학기 학급 환경 구성 점검 체크리스트를 공유합니다. 교실 게시물·사물함 명찰·화재대피도가 부착되어 있는지 확인 부탁드립니다.

8월 28일(금) 종례 전까지

이상입니다.`;
  const cs = run(body);
  const hit = cs.find((c) => (c.dueAt ?? c.startAt)?.startsWith("2026-08-28T16:00"));
  assert.ok(hit, `8/28 16:00 후보가 있어야 한다: ${JSON.stringify(cs.map((c) => ({ t: c.proposedTitle, when: whenOf(c), type: c.candidateType, flags: c.ambiguityFlags })))}`);
  assert.equal(hit!.autoRegisterEligible, false);
  assert.ok(hit!.ambiguityFlags.includes("일과 시각 추정"));
  assert.equal(hit!.candidateType, "DEADLINE");
});

test("B. 오늘 종례 전 · 올려 주세요", () => {
  const body = `2학년 담임 선생님들, 남유나입니다.

동의서 미제출은 오늘 종례 전 학년게시판에 반별로 올려 주세요. 2-3은 어제 5명으로 알고 있습니다.`;
  const cs = run(body);
  const hit = cs.find((c) => (c.dueAt ?? c.startAt)?.startsWith("2026-08-27T16:00"));
  assert.ok(hit, `오늘 16:00 후보가 있어야 한다: ${JSON.stringify(cs.map((c) => ({ t: c.proposedTitle, when: whenOf(c), action: c.actionText })))}`);
  assert.equal(hit!.autoRegisterEligible, false);
  assert.ok(hit!.actionText === "게시" || hit!.actionText === "제출");
});

test("C. 이번 주 목요일 검진 + 당일 안내·게시", () => {
  const body = `보건실입니다.

이번 주 목요일 1학년 건강검진이 진행됩니다. 2학년 미검자 명단도 함께 송부하오니 해당 학생 가정에 안내 부탁드립니다.

검진 당일 체육복 착용, 공복 유지 안내 포스터를 학급 게시판에 붙여 주세요.`;
  const cs = run(body);
  const event = cs.find((c) => c.candidateType === "OFFICIAL_EVENT" && (c.startAt ?? "").startsWith("2026-08-27"));
  assert.ok(event, `목요일 검진 행사가 있어야 한다: ${JSON.stringify(cs.map((c) => ({ t: c.proposedTitle, type: c.candidateType, when: whenOf(c) })))}`);

  const guide = cs.find((c) => c.actionText === "안내");
  const poster = cs.find((c) => c.actionText === "게시");
  assert.ok(guide, "안내 부탁드립니다 → 할 일");
  assert.ok(poster, "붙여 주세요 → 할 일");
  assert.ok(guide!.ambiguityFlags.includes("날짜 없이 요청만 적힘"));
  assert.equal(guide!.autoRegisterEligible, false);
  assert.equal(poster!.autoRegisterEligible, false);
});

test("D. 금요일 점심 전까지 · 넣어 주세요", () => {
  const body = `스포츠클럽 담당입니다.

8월분 스포츠클럽 출석부를 금요일 점심 전까지 체육관 앞 제출함에 넣어 주세요. 미제출 학급은 시수 인정에 문제가 생길 수 있습니다.`;
  const cs = run(body);
  const hit = cs.find((c) => (c.dueAt ?? c.startAt)?.startsWith("2026-08-28T12:00"));
  assert.ok(hit, `금 12:00 후보가 있어야 한다: ${JSON.stringify(cs.map((c) => ({ t: c.proposedTitle, when: whenOf(c), flags: c.ambiguityFlags, loc: c.location })))}`);
  assert.equal(hit!.autoRegisterEligible, false);
  assert.ok(hit!.ambiguityFlags.includes("요일만 적힘"));
  assert.ok(hit!.ambiguityFlags.includes("일과 시각 추정"));
  assert.ok(hit!.location === "체육관" || (hit!.location ?? "").includes("체육관"));
});

test("E. 게시해 주세요는 당일, 오류 시 연락은 제외", () => {
  const body = `2026학년도 2학기 확정 시간표가 나이스에 반영되었습니다. 학급 시간표를 출력하여 교실 앞면과 교무실에 게시해 주세요.

오류 발견 시 융합정보부(내선 114)로 연락 바랍니다.`;
  const cs = run(body);
  const post = cs.find((c) => c.actionText === "게시");
  assert.ok(post, `게시 후보가 있어야 한다: ${JSON.stringify(cs.map((c) => ({ t: c.proposedTitle, action: c.actionText, when: whenOf(c) })))}`);
  assert.ok(post!.ambiguityFlags.includes("날짜 없이 요청만 적힘"));
  assert.equal(post!.autoRegisterEligible, false);
  assert.equal(
    cs.some((c) => (c.proposedTitle + (c.actionText ?? "") + c.reasoning.join("")).includes("연락")),
    false,
    "조건문 연락 바랍니다는 할 일이 아니다",
  );
});

test("F. 다음 줄이 교시면 지시의 마감으로 빼앗지 않는다", () => {
  const body = `확인 부탁드립니다.

내일 5교시입니다.`;
  const cs = run(body);
  const stolen = cs.filter((c) => (c.dueAt ?? c.startAt ?? "").startsWith("2026-08-28") && c.candidateType === "DEADLINE");
  assert.equal(
    stolen.length,
    0,
    `확인 부탁이 내일 5교시를 마감으로 가져가면 안 된다: ${JSON.stringify(cs.map((c) => ({ t: c.proposedTitle, type: c.candidateType, when: whenOf(c), flags: c.ambiguityFlags })))}`,
  );
  const request = cs.find((c) => c.actionText === "확인");
  if (request) {
    assert.ok(request.ambiguityFlags.includes("날짜 없이 요청만 적힘"));
    assert.equal(request.autoRegisterEligible, false);
  }
});

test("G. 모레까지 제출은 분명한 일정까지에서 자동등록", () => {
  const body = "모레까지 학급 명렬표를 제출해 주시기 바랍니다.";
  const cs = run(body);
  const hit = cs.find((c) => (c.dueAt ?? c.startAt ?? "").startsWith("2026-08-29"));
  assert.ok(hit, `모레(8/29) 후보가 있어야 한다: ${JSON.stringify(cs.map((c) => ({ t: c.proposedTitle, when: whenOf(c), type: c.candidateType, flags: c.ambiguityFlags, auto: c.autoRegisterEligible })))}`);
  assert.equal(hit!.candidateType, "DEADLINE");
  assert.deepEqual(hit!.ambiguityFlags, []);
  assert.equal(hit!.autoRegisterEligible, true);
});

test("H. 다음 주 월요일 회의는 분명한 일정까지에서 자동등록", () => {
  const body = "다음 주 월요일 부장 회의가 있습니다.";
  const cs = run(body);
  const hit = cs.find((c) => (c.startAt ?? "").startsWith("2026-08-31"));
  assert.ok(hit, `다음 주 월요일(8/31) 후보가 있어야 한다: ${JSON.stringify(cs.map((c) => ({ t: c.proposedTitle, when: whenOf(c), type: c.candidateType, flags: c.ambiguityFlags, auto: c.autoRegisterEligible })))}`);
  assert.equal(hit!.candidateType, "OFFICIAL_EVENT");
  assert.deepEqual(hit!.ambiguityFlags, []);
  assert.equal(hit!.autoRegisterEligible, true);
});
