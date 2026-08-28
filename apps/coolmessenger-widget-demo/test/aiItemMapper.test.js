import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  itemToEvent,
  parseItemDateTime,
  eventsFromIngestPayload,
} from '../src/services/aiItemMapper.js';

test('itemToEvent maps title, when/due, source_title, fromAi', () => {
  const ev = itemToEvent(
    {
      title: '교무회의',
      when: '2026-08-28T15:00',
      due: '',
      source_sheet: '받은메시지',
      source_title: '회의 안내',
    },
    0,
  );
  assert.ok(ev);
  assert.equal(ev.title, '교무회의');
  assert.equal(ev.date, '2026-08-28');
  assert.equal(ev.time, '15:00');
  assert.equal(ev.fromAi, true);
  assert.match(ev.description, /회의 안내/);
  assert.equal(ev.autoRegisterEligible, true);
});

test('itemToEvent prefers due date over when', () => {
  const ev = itemToEvent({
    title: '특근매식비 제출',
    when: '2026-08-27',
    due: '2026-08-28 16:00',
    source_title: '특근 안내',
  });
  assert.equal(ev.date, '2026-08-28');
  assert.equal(ev.time, '16:00');
});

test('itemToEvent parses Korean dates', () => {
  const ev = itemToEvent({
    title: '생활지도',
    when: '9월 1일 12시 40분',
    due: '',
    source_title: '순번 안내',
  });
  assert.equal(ev.date, '2026-09-01');
  assert.equal(ev.time, '12:40');
});

test('itemToEvent returns null without a date', () => {
  assert.equal(itemToEvent({ title: '제목만', when: '', due: '' }), null);
  assert.equal(itemToEvent({ title: '', when: '2026-08-28', due: '' }), null);
});

test('parseItemDateTime handles ISO and slash dates', () => {
  assert.deepEqual(parseItemDateTime('2026/08/28 09:32:21'), {
    date: '2026-08-28',
    time: '09:32',
  });
  assert.deepEqual(parseItemDateTime(''), { date: '', time: '' });
});

test('eventsFromIngestPayload prefers items and falls back to candidates', () => {
  const mapCandidate = (c) => ({ title: c.proposedTitle, date: '2026-08-28', fromAi: true });

  const fromItems = eventsFromIngestPayload(
    {
      items: [{ title: 'AI 일정', when: '2026-08-29', due: '', source_title: '공문' }],
      candidates: [{ proposedTitle: '규칙 후보' }],
    },
    mapCandidate,
  );
  assert.equal(fromItems.source, 'items');
  assert.equal(fromItems.events.length, 1);
  assert.equal(fromItems.events[0].title, 'AI 일정');

  const fromCandidates = eventsFromIngestPayload(
    {
      items: [],
      candidates: [{ proposedTitle: '규칙 후보' }],
    },
    mapCandidate,
  );
  assert.equal(fromCandidates.source, 'candidates');
  assert.equal(fromCandidates.events[0].title, '규칙 후보');

  const emptyItemsUnmapped = eventsFromIngestPayload(
    { items: [{ title: '날짜 없음', when: '', due: '' }], candidates: [{ proposedTitle: '규칙 후보' }] },
    mapCandidate,
  );
  assert.equal(emptyItemsUnmapped.source, 'candidates');
});
