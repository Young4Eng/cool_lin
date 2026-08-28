/** 자동 일정 정리 시각 설정. 시각이 되면 확인만 띄우고, 실행은 동의 후에. */

export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
export const WEEKDAYS_SCHOOL = [1, 2, 3, 4, 5];

const SETTINGS_KEY = 'cool_lin_auto_schedule_v1';
const HANDLED_KEY = 'cool_lin_auto_schedule_handled_v1';

export function isValidTime(t) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
}

export function localYmd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

export function localHm(d) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function slotKey(ymd, rowId, time) {
  return `${ymd}|${rowId}|${time}`;
}

export function newAutoRow(partial = {}) {
  return {
    id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    time: '17:00',
    enabled: true,
    weekdays: [...WEEKDAYS_SCHOOL],
    ...partial,
  };
}

function asRow(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
  if (typeof v.id !== 'string' || v.id === '') return null;
  if (typeof v.time !== 'string' || !isValidTime(v.time)) return null;
  const enabled = v.enabled !== false;
  const weekdays = Array.isArray(v.weekdays)
    ? v.weekdays.filter((n) => typeof n === 'number' && n >= 0 && n <= 6)
    : [...WEEKDAYS_SCHOOL];
  return { id: v.id, time: v.time, enabled, weekdays };
}

export function loadAutoSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { rows: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.rows)) return { rows: [] };
    return { rows: parsed.rows.map(asRow).filter(Boolean) };
  } catch {
    return { rows: [] };
  }
}

export function saveAutoSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ rows: settings.rows }));
  } catch {
    /* ignore */
  }
}

export function loadHandledKeys() {
  try {
    const raw = localStorage.getItem(HANDLED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

export function saveHandledKeys(keys, todayYmd) {
  try {
    const y = Number(todayYmd.slice(0, 4));
    const m = Number(todayYmd.slice(4, 6));
    const d = Number(todayYmd.slice(6, 8));
    const prev = new Date(y, m - 1, d);
    prev.setDate(prev.getDate() - 1);
    const prevKey = localYmd(prev);
    const keep = [...keys].filter((k) => k.startsWith(todayYmd) || k.startsWith(prevKey));
    localStorage.setItem(HANDLED_KEY, JSON.stringify(keep));
  } catch {
    /* ignore */
  }
}

/** 실행하지 않는다. 확인을 띄울 슬롯만 고른다. */
export function nextPromptDecision(now, rows, handled) {
  const ymd = localYmd(now);
  const hm = localHm(now);
  const dow = now.getDay();
  for (const row of rows) {
    if (!row.enabled) continue;
    if (!isValidTime(row.time)) continue;
    if (!row.weekdays.includes(dow)) continue;
    if (row.time !== hm) continue;
    const key = slotKey(ymd, row.id, row.time);
    if (handled.has(key)) continue;
    return { row, slotKey: key };
  }
  return null;
}

export function markSlotHandled(handled, key) {
  const next = new Set(handled);
  next.add(key);
  return next;
}
