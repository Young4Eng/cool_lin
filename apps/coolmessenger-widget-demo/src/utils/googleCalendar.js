/**
 * Google Calendar template URL builder.
 *
 * Drop-in target (after repo refresh):
 *   apps/coolmessenger-widget-demo/src/utils/googleCalendar.js
 *
 * Clicking the URL opens Google Calendar's create-event form with
 * fields prefilled. The teacher hits Save there. No OAuth, no API key.
 *
 * Expected event shape (EventList / INITIAL_SCHEDULE_EVENTS):
 *   { title, date: 'YYYY-MM-DD', time?: 'HH:mm', location?, description?, category? }
 */

const TEMPLATE_BASE = 'https://calendar.google.com/calendar/render';
export const GOOGLE_CALENDAR_TZ = 'Asia/Seoul';

export function buildGoogleCalendarUrl(event) {
  if (!event || typeof event.title !== 'string' || !event.title.trim()) {
    throw new Error('title is required');
  }
  if (typeof event.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(event.date)) {
    throw new Error('date must be YYYY-MM-DD');
  }

  const params = new URLSearchParams();
  params.set('action', 'TEMPLATE');
  params.set('text', event.title.trim());
  params.set('dates', buildDatesParam(event));
  params.set('ctz', GOOGLE_CALENDAR_TZ);

  const details = buildDetails(event);
  if (details) params.set('details', details);
  if (event.location) params.set('location', String(event.location));

  return `${TEMPLATE_BASE}?${params.toString()}`;
}

export function buildDatesParam(event) {
  const start = parseCivil(event.date, event.time);
  if (!hasTime(event.time)) {
    const end = addDays(start, 1);
    return `${formatAllDay(start)}/${formatAllDay(end)}`;
  }
  const end = addHours(start, 1);
  return `${formatDateTime(start)}/${formatDateTime(end)}`;
}

export function markEventAdded(event, at = new Date()) {
  return { ...event, googleCalendarAddedAt: at.toISOString() };
}

export function openGoogleCalendar(event) {
  const url = buildGoogleCalendarUrl(event);
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
  return { url, added: markEventAdded(event) };
}

function buildDetails(event) {
  const parts = [];
  if (event.category) parts.push(`[${event.category}]`);
  if (event.description) parts.push(String(event.description));
  return parts.join('\n').trim();
}

function hasTime(time) {
  return typeof time === 'string' && time.trim().length > 0;
}

function parseCivil(dateStr, timeStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  let hh = 0;
  let mm = 0;
  let ss = 0;
  if (hasTime(timeStr)) {
    const parts = timeStr.trim().split(':').map(Number);
    hh = parts[0] || 0;
    mm = parts[1] || 0;
    ss = parts[2] || 0;
  }
  return { y, m, d, hh, mm, ss };
}

function addHours(dt, n) {
  const date = new Date(Date.UTC(dt.y, dt.m - 1, dt.d, dt.hh, dt.mm, dt.ss));
  date.setUTCHours(date.getUTCHours() + n);
  return civilFromUtc(date);
}

function addDays(dt, n) {
  const date = new Date(Date.UTC(dt.y, dt.m - 1, dt.d));
  date.setUTCDate(date.getUTCDate() + n);
  return { ...civilFromUtc(date), hh: 0, mm: 0, ss: 0 };
}

function civilFromUtc(date) {
  return {
    y: date.getUTCFullYear(),
    m: date.getUTCMonth() + 1,
    d: date.getUTCDate(),
    hh: date.getUTCHours(),
    mm: date.getUTCMinutes(),
    ss: date.getUTCSeconds(),
  };
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatDateTime(dt) {
  return `${dt.y}${pad(dt.m)}${pad(dt.d)}T${pad(dt.hh)}${pad(dt.mm)}${pad(dt.ss)}`;
}

function formatAllDay(dt) {
  return `${dt.y}${pad(dt.m)}${pad(dt.d)}`;
}
