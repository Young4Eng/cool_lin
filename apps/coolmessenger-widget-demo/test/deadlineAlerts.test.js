import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  pickDeadlineAlerts,
  daysUntil,
  alertKey,
  alertTitle,
} from '../src/utils/deadlineAlerts.js';

const NOW = new Date(2026, 7, 29); // 2026-08-29 (로컬 자정)

const item = (over = {}) => ({
  id: 'ev-1',
  title: '교직원 회의',
  date: '2026-08-30',
  time: '16:00',
  location: '시청각실',
  ...over,
});

test('D-3·D-2·D-1·당일에만 알린다', () => {
  const days = ['2026-09-01', '2026-08-31', '2026-08-30', '2026-08-29'];
  for (const date of days) {
    const { alerts } = pickDeadlineAlerts([item({ date })], new Set(), NOW);
    assert.equal(alerts.length, 1, `${date} 는 알려야 한다`);
  }
});

test('D-4 이상 남았거나 이미 지난 일정은 알리지 않는다', () => {
  for (const date of ['2026-09-02', '2026-10-01', '2026-08-28']) {
    const { alerts } = pickDeadlineAlerts([item({ date })], new Set(), NOW);
    assert.equal(alerts.length, 0, `${date} 는 알리지 않아야 한다`);
  }
});

test('이미 띄운 단계는 다시 띄우지 않는다', () => {
  const seen = new Set([alertKey('ev-1', 1)]);
  const { alerts } = pickDeadlineAlerts([item({ date: '2026-08-30' })], seen, NOW);
  assert.equal(alerts.length, 0);
});

test('같은 일정이라도 단계가 바뀌면 다시 띄운다', () => {
  const seen = new Set([alertKey('ev-1', 2)]);
  const { alerts } = pickDeadlineAlerts([item({ date: '2026-08-30' })], seen, NOW);
  assert.equal(alerts.length, 1);
  assert.equal(alerts[0].key, alertKey('ev-1', 1));
});

test('완료한 할 일은 알리지 않는다', () => {
  const { alerts } = pickDeadlineAlerts(
    [item({ date: '2026-08-29', completed: true })],
    new Set(),
    NOW,
  );
  assert.equal(alerts.length, 0);
});

test('당일은 D-0 이 아니라 「오늘 마감입니다」로 알린다', () => {
  const { alerts } = pickDeadlineAlerts([item({ date: '2026-08-29' })], new Set(), NOW);
  assert.equal(alerts[0].title, '오늘 마감입니다');
  assert.equal(alertTitle(2), '마감 D-2');
});

test('알림 본문에 제목·시각·장소가 들어간다', () => {
  const { alerts } = pickDeadlineAlerts([item({ date: '2026-08-30' })], new Set(), NOW);
  assert.match(alerts[0].body, /교직원 회의/);
  assert.match(alerts[0].body, /2026-08-30 16:00/);
  assert.match(alerts[0].body, /시청각실/);
});

test('날짜를 읽을 수 없으면 조용히 건너뛴다', () => {
  assert.equal(daysUntil('없는날짜'), null);
  const { alerts } = pickDeadlineAlerts([item({ date: '' })], new Set(), NOW);
  assert.equal(alerts.length, 0);
});
