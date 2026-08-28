/** 자동 일정 정리 시각 설정 + 「확인을 띄울지」만 판정 (실행은 UI가 동의 후에). */

export type AutoRow = {
  id: string
  /** "HH:MM" 24시간제 */
  time: string
  enabled: boolean
  /** 0=일 … 6=토 */
  weekdays: number[]
}

export type AutoSettings = { rows: AutoRow[] }

export type PromptDecision = {
  row: AutoRow
  slotKey: string
}

export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const
export const WEEKDAYS_ALL = [0, 1, 2, 3, 4, 5, 6]
export const WEEKDAYS_SCHOOL = [1, 2, 3, 4, 5]

const SETTINGS_KEY = 'cool_lin_auto_schedule_v1'
const HANDLED_KEY = 'cool_lin_auto_schedule_handled_v1'

export function isValidTime(t: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(t)
}

export function localYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

export function localHm(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function slotKey(ymd: string, rowId: string, time: string): string {
  return `${ymd}|${rowId}|${time}`
}

export function newAutoRow(partial?: Partial<AutoRow>): AutoRow {
  return {
    id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    time: '17:00',
    enabled: true,
    weekdays: [...WEEKDAYS_SCHOOL],
    ...partial,
  }
}

function asRow(v: unknown): AutoRow | null {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null
  const o = v as Record<string, unknown>
  if (typeof o.id !== 'string' || o.id === '') return null
  if (typeof o.time !== 'string' || !isValidTime(o.time)) return null
  const enabled = o.enabled !== false
  const weekdays = Array.isArray(o.weekdays)
    ? o.weekdays.filter((n): n is number => typeof n === 'number' && n >= 0 && n <= 6)
    : [...WEEKDAYS_SCHOOL]
  return { id: o.id, time: o.time, enabled, weekdays }
}

export function loadAutoSettings(): AutoSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { rows: [] }
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { rows: [] }
    const rowsUnknown = (parsed as { rows?: unknown }).rows
    if (!Array.isArray(rowsUnknown)) return { rows: [] }
    return { rows: rowsUnknown.map(asRow).filter((r): r is AutoRow => r !== null) }
  } catch {
    return { rows: [] }
  }
}

export function saveAutoSettings(settings: AutoSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ rows: settings.rows }))
  } catch {
    /* quota / private mode */
  }
}

export function loadHandledKeys(): Set<string> {
  try {
    const raw = localStorage.getItem(HANDLED_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as unknown
    if (!Array.isArray(arr)) return new Set()
    return new Set(arr.filter((x): x is string => typeof x === 'string'))
  } catch {
    return new Set()
  }
}

export function saveHandledKeys(keys: Set<string>, todayYmd: string): void {
  try {
    const keep = [...keys].filter((k) => k.startsWith(todayYmd) || k.startsWith(prevYmd(todayYmd)))
    localStorage.setItem(HANDLED_KEY, JSON.stringify(keep))
  } catch {
    /* ignore */
  }
}

function prevYmd(ymd: string): string {
  const y = Number(ymd.slice(0, 4))
  const m = Number(ymd.slice(4, 6))
  const d = Number(ymd.slice(6, 8))
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() - 1)
  return localYmd(dt)
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
  const ymd = localYmd(now)
  const hm = localHm(now)
  const dow = now.getDay()
  for (const row of rows) {
    if (!row.enabled) continue
    if (!isValidTime(row.time)) continue
    if (!row.weekdays.includes(dow)) continue
    if (row.time !== hm) continue
    const key = slotKey(ymd, row.id, row.time)
    if (handled.has(key)) continue
    return { row, slotKey: key }
  }
  return null
}

export function markSlotHandled(handled: ReadonlySet<string>, key: string): Set<string> {
  const next = new Set(handled)
  next.add(key)
  return next
}
