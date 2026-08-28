/**
 * 자동 정리 슬롯 판정.
 *
 * 시각이 되면 「실행」이 아니라 「확인을 띄울지」만 결정한다.
 * 추출/정리는 사용자가 동의한 뒤에만 호출부가 진행한다.
 */

export type AutoRow = {
  id: string;
  /** "HH:MM" 24시간제 */
  time: string;
  enabled: boolean;
  /** 0=일 … 6=토 */
  weekdays: number[];
};

export type PromptDecision = {
  row: AutoRow;
  slotKey: string;
};

export function isValidTime(t: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
}

export function localYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

export function localHm(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function slotKey(ymd: string, rowId: string, time: string): string {
  return `${ymd}|${rowId}|${time}`;
}

/**
 * 지금 확인을 띄울 슬롯 하나. 없으면 null.
 * 실행 지시(run)를 반환하지 않는다 — 확인 없이 돌리지 않기 위해서다.
 */
export function nextPromptDecision(
  now: Date,
  rows: AutoRow[],
  handled: ReadonlySet<string>,
): PromptDecision | null {
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

export function markSlotHandled(handled: ReadonlySet<string>, key: string): Set<string> {
  const next = new Set(handled);
  next.add(key);
  return next;
}
