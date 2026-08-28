import test from 'node:test';
import assert from 'node:assert/strict';
import { dedupeEvents, dedupeTodos } from '../src/utils/dedupeItems.js';

const ev = (over) => ({
  id: `ev-${Math.random()}`,
  sourceGroupId: 'msg-1',
  title: '제출',
  date: '2026-08-28',
  time: '',
  confidence: 0.7,
  ...over,
});

test('같은 쪽지·같은 날짜면 하나만 남는다', () => {
  // 「행정정보공유 동의서」 한 통에서 「제출」과 「동의서 제출」이 함께 나왔다.
  const kept = dedupeEvents([ev({ title: '제출' }), ev({ title: '동의서 제출' })]);
  assert.equal(kept.length, 1);
  // 같은 신뢰도면 더 자세한 제목을 남긴다.
  assert.equal(kept[0].title, '동의서 제출');
});

test('신뢰도가 높은 쪽을 남긴다', () => {
  const kept = dedupeEvents([
    ev({ title: '안내', confidence: 0.72 }),
    ev({ title: '검진', confidence: 0.84 }),
  ]);
  assert.deepEqual(kept.map((e) => e.title), ['검진']);
});

test('사람이 만진 항목은 신뢰도가 낮아도 남는다', () => {
  const kept = dedupeEvents([
    ev({ title: '검진', confidence: 0.84 }),
    ev({ title: '안내', confidence: 0.5, googleCalendarAddedAt: '2026-08-29T00:00:00Z' }),
  ]);
  assert.deepEqual(kept.map((e) => e.title), ['안내']);
});

test('날짜나 시각이 다르면 다른 일정이다', () => {
  const kept = dedupeEvents([
    ev({ title: '검진', date: '2026-08-27' }),
    ev({ title: '검진', date: '2026-08-28' }),
    ev({ title: '회의', date: '2026-08-28', time: '15:20' }),
  ]);
  assert.equal(kept.length, 3);
});

test('쪽지가 다르면 제목·날짜가 같아도 남긴다', () => {
  const kept = dedupeEvents([ev({ sourceGroupId: 'msg-1' }), ev({ sourceGroupId: 'msg-2' })]);
  assert.equal(kept.length, 2);
});

test('손으로 만든 일정은 제목까지 같아야 중복이다', () => {
  const own = { id: 'ev-user-1', title: '학년 회의', date: '2026-09-01', time: '10:00' };
  const kept = dedupeEvents([own, { ...own, id: 'ev-user-2' }, { ...own, id: 'ev-user-3', title: '학부모 상담' }]);
  assert.equal(kept.length, 2);
});

test('원래 순서를 지킨다', () => {
  const kept = dedupeEvents([
    ev({ title: 'A', date: '2026-08-01' }),
    ev({ title: 'B', date: '2026-08-02' }),
    ev({ title: 'B2', date: '2026-08-02', confidence: 0.9 }),
    ev({ title: 'C', date: '2026-08-03' }),
  ]);
  assert.deepEqual(kept.map((e) => e.title), ['A', 'B2', 'C']);
});

test('할 일은 내용·기한이 같으면 하나만 남고, 완료 표시한 쪽을 남긴다', () => {
  const kept = dedupeTodos([
    { id: 't1', text: '출석부 제출', dueDate: '2026-08-28' },
    { id: 't2', text: '출석부 제출', dueDate: '2026-08-28', completed: true },
    { id: 't3', text: '출석부 제출', dueDate: '2026-09-01' },
  ]);
  assert.equal(kept.length, 2);
  assert.equal(kept.find((t) => t.dueDate === '2026-08-28').id, 't2');
});

test('배열이 아니면 빈 목록을 돌려준다', () => {
  assert.deepEqual(dedupeEvents(null), []);
  assert.deepEqual(dedupeTodos(undefined), []);
});
