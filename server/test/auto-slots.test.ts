import assert from "node:assert/strict";
import { test } from "node:test";
import {
  markSlotHandled,
  nextPromptDecision,
  slotKey,
  type AutoRow,
} from "../src/autoSlots.js";

const row: AutoRow = {
  id: "r1",
  time: "17:00",
  enabled: true,
  weekdays: [1, 2, 3, 4, 5], // 월~금
};

test("시각이 되어도 실행이 아니라 확인(prompt)만 돌려준다", () => {
  // 2026-08-28 은 금요일
  const now = new Date(2026, 7, 28, 17, 0, 10);
  const d = nextPromptDecision(now, [row], new Set());
  assert.ok(d, "확인 대상이 있어야 한다");
  assert.equal(d!.row.id, "r1");
  assert.equal(d!.slotKey, slotKey("20260828", "r1", "17:00"));
  assert.equal("run" in d!, false);
  assert.equal("execute" in d!, false);
});

test("확인 없이 돌리는 경로가 없다 — 꺼진 행·다른 시각·다른 요일은 idle", () => {
  const friday1700 = new Date(2026, 7, 28, 17, 0, 0);
  assert.equal(nextPromptDecision(friday1700, [{ ...row, enabled: false }], new Set()), null);
  assert.equal(nextPromptDecision(new Date(2026, 7, 28, 16, 59, 0), [row], new Set()), null);
  assert.equal(nextPromptDecision(new Date(2026, 7, 29, 17, 0, 0), [row], new Set()), null); // 토
});

test("한 슬롯을 처리(동의·거부)한 뒤에는 바로 다시 묻지 않는다", () => {
  const now = new Date(2026, 7, 28, 17, 0, 40);
  const first = nextPromptDecision(now, [row], new Set());
  assert.ok(first);
  const handled = markSlotHandled(new Set(), first!.slotKey);
  const again = nextPromptDecision(now, [row], handled);
  assert.equal(again, null);
});

test("거부 후에도 다른 행의 시각은 물을 수 있다", () => {
  const now = new Date(2026, 7, 28, 17, 0, 0);
  const row2: AutoRow = { ...row, id: "r2", time: "17:00" };
  const handled = markSlotHandled(new Set(), slotKey("20260828", "r1", "17:00"));
  const d = nextPromptDecision(now, [row, row2], handled);
  assert.ok(d);
  assert.equal(d!.row.id, "r2");
});
