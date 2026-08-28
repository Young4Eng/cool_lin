import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  attachmentDaysLeft,
  attachmentNotice,
  parseSentDate,
  ATTACHMENT_KEEP_DAYS,
} from '../src/utils/attachmentExpiry.js';

const NOW = new Date(2026, 7, 29); // 2026-08-29

const withSource = (over = {}) => ({
  id: 'ev-1',
  title: '동의서 취합',
  date: '2026-08-30',
  source: {
    from: '최은지',
    subject: '동의서',
    sentAt: '2026/08/26 17:05:09',
    attachment: '가정통신문.hwp',
    body: '',
    ...over,
  },
});

test('받은 날로부터 보름을 센다', () => {
  // 8/26 + 15일 = 9/10, 오늘 8/29 → 12일 남음
  assert.equal(attachmentDaysLeft(withSource(), NOW), 12);
});

test('첨부가 없으면 아무것도 세지 않는다', () => {
  assert.equal(attachmentDaysLeft(withSource({ attachment: '' }), NOW), null);
  assert.equal(attachmentNotice(withSource({ attachment: '' }), NOW), null);
});

test('원문이 없는 일정도 조용히 넘어간다', () => {
  assert.equal(attachmentDaysLeft({ id: 'x', title: '수동 등록' }, NOW), null);
});

test('받은 시각을 읽을 수 없으면 세지 않는다', () => {
  assert.equal(attachmentDaysLeft(withSource({ sentAt: '알 수 없음' }), NOW), null);
  assert.equal(parseSentDate(undefined), null);
});

test('마지막 날은 0, 지난 뒤에는 음수', () => {
  const lastDay = new Date(2026, 8, 10); // 8/26 + 15
  assert.equal(attachmentDaysLeft(withSource(), lastDay), 0);
  assert.equal(attachmentDaysLeft(withSource(), new Date(2026, 8, 12)), -2);
});

test('남은 기간에 따라 말과 색이 달라진다', () => {
  assert.deepEqual(attachmentNotice(withSource(), NOW), {
    text: '첨부 12일 남음',
    tone: 'normal',
    days: 12,
  });
  assert.equal(attachmentNotice(withSource(), new Date(2026, 8, 8)).tone, 'urgent');
  assert.equal(attachmentNotice(withSource(), new Date(2026, 8, 10)).text, '첨부 오늘까지');
  assert.equal(attachmentNotice(withSource(), new Date(2026, 8, 12)).text, '첨부 기한 지남');
});

test('날짜 구분자가 - 나 . 여도 읽는다', () => {
  for (const sentAt of ['2026-08-26 17:05', '2026.08.26', '2026/8/26 9:00']) {
    assert.equal(attachmentDaysLeft(withSource({ sentAt }), NOW), 12, sentAt);
  }
});

test('보관 기간은 한 곳에서만 정한다', () => {
  assert.equal(ATTACHMENT_KEEP_DAYS, 15);
});
