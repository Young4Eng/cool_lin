import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeBody } from "../src/text/normalize.js";
import { splitQuote } from "../src/text/quote.js";
import { splitSentences } from "../src/text/sentences.js";
import { detectSensitive } from "../src/text/sensitive.js";
import { createFingerprintKey, messageFingerprint } from "../src/text/fingerprint.js";
import { buildTitle, titleColumnIsUsable } from "../src/title.js";
import { stripTagBrackets } from "../src/text/phrase.js";
import { readSignals } from "../src/classify/classify.js";

test("정규화 — CRLF와 연속 공백을 정리하고 줄 구조는 남긴다", () => {
  const out = normalizeBody("첫째 줄\r\n\r\n\r\n둘째    줄\r\n");
  assert.equal(out, "첫째 줄\n\n둘째 줄");
});

test("정규화 — 보이지 않는 제어·bidi 문자를 없앤다", () => {
  assert.equal(normalizeBody("안녕‮haha​하세요"), "안녕haha하세요");
});

test("인용문 분리 — 인용 이후는 판단에서 뺀다", () => {
  const { current, quoted, quotedOnly } = splitQuote(
    "9월 2일 협의회 참석 부탁드립니다.\n홍길동님이 보낸글 >>2026/08/27 11:00:00\n이전 내용입니다",
  );
  assert.equal(current, "9월 2일 협의회 참석 부탁드립니다.");
  assert.ok(quoted.startsWith("홍길동님이 보낸글"));
  assert.equal(quotedOnly, false);
});

test("인용문 분리 — 인용문만 있으면 표시한다", () => {
  const { quotedOnly } = splitQuote("홍길동님이 보낸글 >>2026/08/27 11:00:00\n이전 내용");
  assert.equal(quotedOnly, true);
});

test("문장 나누기 — 줄바꿈이 우선 경계다", () => {
  const s = splitSentences("8월 28일 회의입니다.\n장소는 강당입니다.");
  assert.equal(s.length, 2);
  assert.equal(s[0]!.text, "8월 28일 회의입니다.");
});

test("문장 나누기 — 숫자 뒤 마침표에서는 자르지 않는다", () => {
  const s = splitSentences("9.2. 까지 제출해 주세요");
  assert.equal(s.length, 1);
});

test("민감정보 — 주민등록번호는 격리 대상", () => {
  const r = detectSensitive("등록번호는 990101-1234567 입니다");
  assert.equal(r.quarantine, true);
  assert.ok(r.masked.includes("[주민번호]"));
  assert.ok(!r.masked.includes("990101"));
});

test("민감정보 — 값이 붙은 비밀번호만 격리한다", () => {
  assert.equal(detectSensitive("비밀번호는 school2026 입니다").quarantine, true);
  // 단어만 나오면 격리하지 않는다.
  assert.equal(detectSensitive("비밀번호를 잊으신 분은 문의 주세요").quarantine, false);
});

test("민감정보 — 날짜와 전화번호를 계좌번호로 오해하지 않는다", () => {
  const date = detectSensitive("2026-08-24 회의 결과입니다");
  assert.ok(!date.hits.some((h) => h.kind === "계좌번호"));
  assert.equal(date.quarantine, false);

  const phone = detectSensitive("연락처 010-9094-8756 입니다");
  assert.ok(!phone.hits.some((h) => h.kind === "계좌번호"));
  assert.ok(phone.hits.some((h) => h.kind === "전화번호"));
  assert.equal(phone.quarantine, false);
});

test("민감정보 — 내선 3자리는 전화번호로 보지 않는다", () => {
  const r = detectSensitive("융합정보부(내선 114)로 연락 바랍니다");
  assert.ok(!r.hits.some((h) => h.kind === "전화번호"));
});

test("지문 — 같은 쪽지는 같은 값, 다른 본문은 다른 값", () => {
  const key = createFingerprintKey();
  const base = { direction: "received", counterpart: "교무부장", sentAt: "2026/08/27 09:00:00 (목)" };
  const a = messageFingerprint(key, { ...base, body: "8월 28일 회의입니다." });
  // 띄어쓰기·문장부호 흔들림은 흡수한다.
  const b = messageFingerprint(key, { ...base, body: "8월 28일  회의입니다" });
  const c = messageFingerprint(key, { ...base, body: "9월 2일 회의입니다." });
  assert.equal(a, b);
  assert.notEqual(a, c);
});

test("제목 — 본문 첫 줄이 잘린 제목 열은 쓰지 않는다", () => {
  const body = "안녕하세요 담임선생님, 교무부입니다. 학급함에 동의서를 넣어두었습니다.";
  assert.equal(titleColumnIsUsable("안녕하세요 담임선생님, 교무부입니다. 학급함에", body), false);
  assert.equal(titleColumnIsUsable("교무회의 안내", body), true);
});

test("제목 — 문장을 통째로 잘라 온 값은 제목이 아니다", () => {
  assert.equal(titleColumnIsUsable("일정 초안입니다", "다른 본문"), false);
});

test("제목 — 행사 이름을 그대로 살린다", () => {
  const sentence = "8월 28일(금) 15:20 강당에서 2학기 교무회의가 있습니다";
  const signals = readSignals(sentence, sentence, {});
  const title = buildTitle({
    titleColumn: "안녕하세요 선생님, 8월 28일",
    body: sentence,
    sentence,
    signals,
    classification: "OFFICIAL_EVENT",
  });
  assert.equal(title, "2학기 교무회의");
});

test("제목 — 목적어에 날짜 부스러기를 섞지 않는다", () => {
  const sentence = "출석부를 금요일 점심 전까지 체육관 앞 제출함에 넣어 주세요";
  const signals = readSignals(sentence, sentence, {});
  const title = buildTitle({
    titleColumn: "",
    body: sentence,
    sentence,
    signals,
    classification: "DEADLINE",
  });
  assert.ok(!title.includes("금요일"), `날짜가 제목에 섞였습니다: ${title}`);
  assert.ok(!title.includes("점심"), `시각이 제목에 섞였습니다: ${title}`);
});

test("제목 — 접속사를 목적어로 삼지 않는다", () => {
  const sentence = "그리고 참석 부탁드립니다";
  const signals = readSignals(sentence, sentence, {});
  const title = buildTitle({ titleColumn: "", body: sentence, sentence, signals, classification: "PERSONAL_TASK" });
  assert.ok(!title.startsWith("그리고"), `접속사가 제목이 됐습니다: ${title}`);
});

test("신호 읽기 — 선택 행사 표현은 다른 문장에 있어도 잡는다", () => {
  const sentence = "9월 4일 직무연수가 있습니다.";
  const body = sentence + "\n희망하시는 선생님께서는 신청해 주세요.";
  assert.equal(readSignals(sentence, body, {}).isOptional, true);
});

test("신호 읽기 — 역할 태그가 맞으면 관련 있다고 본다", () => {
  const sentence = "2학년 담임 선생님께서는 9월 2일 협의회에 참석해 주세요.";
  assert.equal(readSignals(sentence, sentence, { homeroom: true, grades: [2] }).matchesRole, true);
  assert.equal(readSignals(sentence, sentence, { homeroom: false, grades: [3] }).matchesRole, false);
});

/* ── 캘린더 표기 정돈 (scripts/audit-titles.ts 로 실제 데이터에서 찾은 사례) ── */

test("제목 — 꼬리표 괄호를 벗긴다", () => {
  assert.equal(stripTagBrackets("[안내] AI 선도학교 수요 조사"), "AI 선도학교 수요 조사");
  assert.equal(stripTagBrackets("<현장직업체험 사전교육>"), "현장직업체험 사전교육");
  assert.equal(stripTagBrackets("(중요!!) 교과 협의회"), "교과 협의회");
  // 전각 숫자를 반각으로 맞춘다
  assert.equal(stripTagBrackets("６월 자율 연수"), "6월 자율 연수");
});

test("제목 — 내보내기가 30자에서 자른 값은 쓰지 않는다", () => {
  // 꼬리표를 벗기면 21자가 되지만, 원본이 30자라 뒤가 잘려 있다.
  const truncated = "[행정실 안내] 2026. 2분기 초과근무 운영실태 점";
  assert.equal(truncated.length >= 29, true);
  assert.equal(titleColumnIsUsable(truncated, "다른 본문"), false);
});

test("제목 — 받는 사람을 부르는 말만 있으면 쓰지 않는다", () => {
  assert.equal(titleColumnIsUsable("담임선생님", "본문"), false);
  assert.equal(titleColumnIsUsable("부장님~", "본문"), false);
  assert.equal(titleColumnIsUsable("교무회의 안내", "본문"), true);
});

test("제목 — 시각 조각이 든 값은 첫 줄이 잘려 온 것이다", () => {
  assert.equal(titleColumnIsUsable("교장님 오늘 14:30~ 출장", "본문"), false);
});

test("제목 — 낱자모나 기호만 남은 값은 쓰지 않는다", () => {
  assert.equal(titleColumnIsUsable("ᄋ", "본문"), false);
  assert.equal(titleColumnIsUsable("...", "본문"), false);
});

test("제목 — 목적어에 부사·용언·조사가 섞이지 않는다", () => {
  const cases: Array<[string, string[]]> = [
    ["후 학년부에서 일괄 수합하여 제출해 주세요", ["후", "학년부", "일괄", "수합"]],
    ["혹시 참여하실 분은 신청해 주세요", ["혹시"]],
    ["교무부장님이 잘 안내해 주세요", ["잘"]],
    ["번호대로 충전기에 충전선을 꽂아 두도록 안내해 주세요", ["꽂아", "두도록"]],
  ];
  for (const [sentence, forbidden] of cases) {
    const signals = readSignals(sentence, sentence, {});
    const title = buildTitle({ titleColumn: "", body: sentence, sentence, signals, classification: "PERSONAL_TASK" });
    for (const bad of forbidden) {
      assert.ok(!title.includes(bad), `"${bad}" 가 제목에 남았습니다: "${title}"`);
    }
  }
});

test("핵심어 — 수식어의 조사를 뗀다", () => {
  const sentence = "상황을 점검합니다";
  const signals = readSignals(sentence, sentence, {});
  assert.ok(
    !signals.keywords.some((k) => k.includes("상황을")),
    `조사가 남았습니다: ${signals.keywords.join(", ")}`,
  );
});

test("핵심어 — 홀로 남은 단위를 수식어로 쓰지 않는다", () => {
  const sentence = "5교시 동아리 활동이 있습니다";
  const signals = readSignals(sentence, sentence, {});
  assert.ok(
    !signals.keywords.some((k) => k.startsWith("교시")),
    `단위가 앞에 붙었습니다: ${signals.keywords.join(", ")}`,
  );
});

test("핵심어 — 용언 관형형을 수식어로 쓰지 않는다", () => {
  const sentence = "다가오는 학부모 상담 주간입니다";
  const signals = readSignals(sentence, sentence, {});
  assert.ok(
    !signals.keywords.some((k) => k.includes("다가오")),
    `용언이 붙었습니다: ${signals.keywords.join(", ")}`,
  );
});
