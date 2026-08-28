import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildGoogleCalendarUrl,
  buildDatesParam,
  markEventAdded,
} from '../src/utils/googleCalendar.js';

const SAMPLE = {
  id: 'ev-02',
  title: '행정정보공유 동의서 취합 교무부 제출',
  date: '2026-08-27',
  time: '17:00',
  category: '공문마감',
  location: '교무부',
  description: '최은지 교무부장님 쪽지 요청 (1. 제출유무목록표, 2. 사전동의서)',
};

test('timed event maps title, dates, tz, location, details', () => {
  const url = new URL(buildGoogleCalendarUrl(SAMPLE));
  assert.equal(url.origin + url.pathname, 'https://calendar.google.com/calendar/render');
  assert.equal(url.searchParams.get('action'), 'TEMPLATE');
  assert.equal(url.searchParams.get('text'), SAMPLE.title);
  assert.equal(url.searchParams.get('dates'), '20260827T170000/20260827T180000');
  assert.equal(url.searchParams.get('ctz'), 'Asia/Seoul');
  assert.equal(url.searchParams.get('location'), '교무부');
  assert.equal(
    url.searchParams.get('details'),
    '[공문마감]\n최은지 교무부장님 쪽지 요청 (1. 제출유무목록표, 2. 사전동의서)',
  );
});

test('missing time becomes all-day (end exclusive)', () => {
  const url = new URL(buildGoogleCalendarUrl({
    title: '2학기 개학식',
    date: '2026-08-24',
  }));
  assert.equal(url.searchParams.get('dates'), '20260824/20260825');
});

test('end time rolls over midnight', () => {
  assert.equal(
    buildDatesParam({ date: '2026-08-31', time: '23:30' }),
    '20260831T233000/20260901T003000',
  );
});

test('HH:mm:ss is accepted', () => {
  assert.equal(
    buildDatesParam({ date: '2026-09-01', time: '12:40:00' }),
    '20260901T124000/20260901T134000',
  );
});

test('rejects bad title or date', () => {
  assert.throws(() => buildGoogleCalendarUrl({ date: '2026-08-27' }), /title/);
  assert.throws(() => buildGoogleCalendarUrl({ title: 'x', date: '20260827' }), /date/);
});

test('markEventAdded stamps ISO time and keeps other fields', () => {
  const at = new Date('2026-08-29T00:00:00.000Z');
  const next = markEventAdded(SAMPLE, at);
  assert.equal(next.googleCalendarAddedAt, '2026-08-29T00:00:00.000Z');
  assert.equal(next.title, SAMPLE.title);
  assert.notEqual(next, SAMPLE);
});

test('omits empty optional fields', () => {
  const url = new URL(buildGoogleCalendarUrl({ title: '회의', date: '2026-08-31', time: '16:00' }));
  assert.equal(url.searchParams.get('location'), null);
  assert.equal(url.searchParams.get('details'), null);
});
