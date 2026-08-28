/**
 * 벽시계(civil) 시각 도우미.
 *
 * 이 앱은 Asia/Seoul 하나만 다루고 원본에도 시간대 표기가 없다. 실행 PC의 시간대가
 * 결과를 바꾸면 안 되므로, 내부 계산은 전부 UTC 기준 Date로 하고 표시도 UTC getter로만
 * 읽는다. 즉 Date를 «시간대 없는 달력 값»의 그릇으로만 쓴다.
 */

export type Civil = Date;

export function civil(year: number, month1: number, day: number, hour = 0, minute = 0): Civil {
  return new Date(Date.UTC(year, month1 - 1, day, hour, minute, 0, 0));
}

export const year = (d: Civil) => d.getUTCFullYear();
export const month1 = (d: Civil) => d.getUTCMonth() + 1;
export const day = (d: Civil) => d.getUTCDate();
export const hour = (d: Civil) => d.getUTCHours();
export const minute = (d: Civil) => d.getUTCMinutes();
/** 0=일 … 6=토 */
export const weekday = (d: Civil) => d.getUTCDay();

export function addDays(d: Civil, days: number): Civil {
  return new Date(d.getTime() + days * 86_400_000);
}

export function startOfDay(d: Civil): Civil {
  return civil(year(d), month1(d), day(d));
}

export function sameDay(a: Civil, b: Civil): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function diffDays(a: Civil, b: Civil): number {
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86_400_000);
}

const pad = (n: number, w = 2) => String(n).padStart(w, "0");

/** "2026-08-27T15:20" — 시간대 접미사를 붙이지 않는다. */
export function toISO(d: Civil, withTime = true): string {
  const date = `${pad(year(d), 4)}-${pad(month1(d))}-${pad(day(d))}`;
  return withTime ? `${date}T${pad(hour(d))}:${pad(minute(d))}` : date;
}

export const WEEKDAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"] as const;

/** 해당 달의 마지막 날 */
export function lastDayOfMonth(y: number, m1: number): number {
  return new Date(Date.UTC(y, m1, 0)).getUTCDate();
}

export function isValidYmd(y: number, m1: number, d: number): boolean {
  return m1 >= 1 && m1 <= 12 && d >= 1 && d <= lastDayOfMonth(y, m1);
}
