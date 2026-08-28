import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parsePeriod, parseYmd } from '../src/utils/ymd.js';

test('YYYYMMDD 가 아니면 추출을 부르지 않도록 실패한다', () => {
  assert.equal(parseYmd('2026-08-28').ok, false);
  assert.equal(parseYmd('2026082').ok, false);
  assert.equal(parseYmd('').ok, false);
  assert.equal(parseYmd('20260828').ok, true);
});

test('달력에 없는 날짜는 거절한다', () => {
  assert.equal(parseYmd('20240229').ok, true);
  assert.equal(parseYmd('20250229').ok, false);
  assert.equal(parseYmd('20260832').ok, false);
});

test('기간 한쪽만 있으면 실패한다', () => {
  const r = parsePeriod('20260801', '');
  assert.equal(r.ok, false);
});

test('유효한 시작·끝 범위를 통과한다', () => {
  const r = parsePeriod('20260801', '20260828');
  assert.deepEqual(r, { ok: true, start: '20260801', end: '20260828' });
});
