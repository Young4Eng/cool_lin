import assert from 'node:assert/strict';
import { test } from 'node:test';
import { markSlotHandled, nextPromptDecision, slotKey } from '../src/utils/autoSchedule.js';

const row = {
  id: 'r1',
  time: '17:00',
  enabled: true,
  weekdays: [1, 2, 3, 4, 5],
};

test('시각이 되어도 실행이 아니라 확인(prompt)만 돌려 준다', () => {
  const now = new Date(2026, 7, 28, 17, 0, 5);
  const d = nextPromptDecision(now, [row], new Set());
  assert.ok(d);
  assert.equal(d.row.id, 'r1');
  assert.equal(d.slotKey, slotKey('20260828', 'r1', '17:00'));
  assert.equal('run' in d, false);
});

test('확인 처리 전에는 ingest 를 호출할 근거가 없다', () => {
  const now = new Date(2026, 7, 28, 16, 59, 0);
  assert.equal(nextPromptDecision(now, [row], new Set()), null);
  assert.equal(nextPromptDecision(now, [{ ...row, enabled: false }], new Set()), null);
});

test('건너뛴 슬롯은 같은 분에 다시 묻지 않는다', () => {
  const now = new Date(2026, 7, 28, 17, 0, 50);
  const first = nextPromptDecision(now, [row], new Set());
  const handled = markSlotHandled(new Set(), first.slotKey);
  assert.equal(nextPromptDecision(now, [row], handled), null);
});
