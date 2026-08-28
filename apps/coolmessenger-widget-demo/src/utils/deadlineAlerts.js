// 마감이 다가온 일정을 윈도우 알림으로 알린다 — D-3 · D-2 · D-1 · 당일.
//
// 규칙은 여기 한 곳에만 둔다. 「무엇을 언제 띄울지」와 「어떻게 띄울지」를 갈라 놓아야
// 알림 방식(윈도우 알림 / 앱 안 토스트)이 바뀌어도 판단이 흔들리지 않는다.
//
// 한 번 띄운 단계는 다시 띄우지 않는다. 위젯은 하루 종일 켜져 있고 1분마다 확인하므로,
// 기억해 두지 않으면 같은 「D-1」을 하루에 수백 번 띄우게 된다.

const SEEN_KEY = 'cool_deadline_alerts_v1';

/** 알림을 띄우는 단계. 이 값 그대로 «며칠 남았나»와 비교한다. */
export const ALERT_DAYS = [3, 2, 1, 0];

export function loadSeen() {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function saveSeen(seen) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  } catch {}
}

/** 같은 일정의 같은 단계는 한 번만. 일정을 지웠다 되살려도 id 가 같으면 같은 것으로 본다. */
export function alertKey(id, days) {
  return `${id}@D-${days}`;
}

/** 로컬 자정 기준 남은 날짜. 날짜를 못 읽으면 null. */
export function daysUntil(dateStr, now = new Date()) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  return Math.round((target - today) / 86400000);
}

export function alertTitle(days) {
  return days === 0 ? '오늘 마감입니다' : `마감 D-${days}`;
}

export function alertBody(item) {
  const when = item.time ? `${item.date} ${item.time}` : item.date;
  const where = item.location ? ` · ${item.location}` : '';
  return `${item.title}\n${when}${where}`;
}

/**
 * 지금 띄워야 할 알림을 고른다. **띄우지는 않는다** — 무엇을 띄울지만 돌려준다.
 *
 * 완료한 일은 거른다. 이미 끝낸 일로 「내일 마감입니다」가 뜨면 알림 전체를 꺼 버리게 된다.
 *
 * @param {Array} items 일정·할 일을 한 모양으로 맞춘 목록 ({id, title, date, time, location, completed})
 * @param {Set<string>} seen 이미 띄운 단계
 * @returns {{alerts: Array<{key: string, title: string, body: string}>}}
 */
export function pickDeadlineAlerts(items, seen, now = new Date()) {
  const alerts = [];
  for (const item of items) {
    if (!item || item.completed) continue;
    const days = daysUntil(item.date, now);
    if (days === null || !ALERT_DAYS.includes(days)) continue;
    const key = alertKey(item.id, days);
    if (seen.has(key)) continue;
    alerts.push({ key, title: alertTitle(days), body: alertBody(item) });
  }
  return { alerts };
}
