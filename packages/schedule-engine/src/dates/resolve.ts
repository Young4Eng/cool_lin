import type { AmbiguityFlag, DateMention, TimePrecision } from "../types.js";
import {
  addDays,
  civil,
  day,
  diffDays,
  isValidYmd,
  month1,
  startOfDay,
  toISO,
  weekday,
  year,
  WEEKDAY_NAMES,
  type Civil,
} from "./civil.js";

/**
 * 한국어 날짜·시각 표현을 절대 날짜로 바꾼다.
 *
 * 기준 시각은 언제나 **쪽지 발송일**이다. "내일", "모레", "금요일까지"는 모두 발송일을
 * 기준으로 해석한다 (기술계획서 7.4).
 *
 * 규칙의 우선순위는 실제 쪽지 3,236건 분석 결과의 빈도를 따른다 (scripts/analyze.ts):
 *   N월 N일 15.3% > 날짜+요일 10.0% > N/N 7.9% > 오늘 13.8% > 요일만 6.9% > 내일 6.4%
 * "요일만 적힘"이 "모레"보다 70배 흔하므로 요일 단독 표현을 절대 빠뜨리면 안 된다.
 */

/** 학교별 교시 시각표. 설정돼 있을 때만 교시를 시각으로 바꾼다 (PRD 7.1). */
export type PeriodTable = Record<number, { start: [number, number]; end: [number, number] }>;

/**
 * 학교 일과의 «시점» 이름과 그 시각.
 *
 * 「점심 전까지」·「종례 전」처럼 시계 시각 대신 일과를 가리키는 말이 실제 쪽지에 흔하다.
 * 교시와 달리 이 말들은 학교가 달라도 크게 어긋나지 않아 기본값을 둔다. 다만 정확한 시각은
 * 여전히 학교마다 다르므로 «일과 시각 추정» 표시를 붙여 사람이 한 번 보게 한다
 * (그대로 캘린더에 들어가면 30분 틀린 마감이 조용히 박힌다).
 */
export type DayLandmarkTable = Record<string, [number, number]>;

export const DEFAULT_DAY_LANDMARKS: DayLandmarkTable = {
  조회: [8, 30],
  점심: [12, 0],
  종례: [16, 0],
  퇴근: [16, 30],
};

export interface ResolveOptions {
  /** 쪽지 발송일시. 모든 상대 표현의 기준점 */
  sentAt: Civil;
  /** 학교 교시표. 없으면 교시를 시각으로 바꾸지 않고 교시 번호만 보존한다. */
  periodTable?: PeriodTable | null;
  /** 학교 일과 시점표. 주지 않으면 `DEFAULT_DAY_LANDMARKS` 를 쓴다. */
  dayLandmarks?: DayLandmarkTable | null;
  /** 발송일에서 이만큼 벗어난 날짜는 «날짜 범위 벗어남»으로 본다. */
  maxDaysBefore?: number;
  maxDaysAfter?: number;
}

interface Span {
  start: number;
  end: number;
}

interface TimeHit extends Span {
  hour?: number;
  minute?: number;
  periodStart?: number;
  periodEnd?: number;
  flags: AmbiguityFlag[];
}

interface DateHit extends Span {
  date: Civil;
  endDate?: Civil;
  flags: AmbiguityFlag[];
  rule: string;
}

const WEEKDAY_INDEX: Record<string, number> = { 일: 0, 월: 1, 화: 2, 수: 3, 목: 4, 금: 5, 토: 6 };

function overlaps(a: Span, taken: Span[]): boolean {
  return taken.some((t) => a.start < t.end && t.start < a.end);
}

/* ────────────────────────────── 시각·교시 ────────────────────────────── */

/** N교시 / N~N교시 */
function findPeriods(text: string, table: PeriodTable | null | undefined): TimeHit[] {
  const hits: TimeHit[] = [];
  for (const m of text.matchAll(/(\d)\s*(?:교시)?\s*[~\-–]\s*(\d)\s*교시|(\d)\s*교시/g)) {
    const a = m[1] ?? m[3];
    const b = m[2];
    if (a === undefined) continue;
    const ps = Number(a);
    const pe = b === undefined ? ps : Number(b);
    if (ps < 1 || ps > 12 || pe < ps || pe > 12) continue;

    const hit: TimeHit = {
      start: m.index,
      end: m.index + m[0].length,
      periodStart: ps,
      periodEnd: pe,
      flags: [],
    };
    const slot = table?.[ps];
    if (slot) {
      hit.hour = slot.start[0];
      hit.minute = slot.start[1];
    } else {
      // 교시 번호를 전국 공통 시각으로 추정하지 않는다 (PRD 7.1).
      hit.flags.push("교시표 미설정");
    }
    hits.push(hit);
  }
  return hits;
}

/**
 * 「점심 전까지」·「종례 전」처럼 일과 시점으로 적은 마감.
 *
 * 실제 쪽지에서 시계 시각만큼이나 흔하다 — 교사끼리는 「12시」보다 「점심 전」이라고 쓴다.
 * 「전」이나 「까지」가 붙었을 때만 잡는다. 그냥 「점심 급식 메뉴」 같은 말까지 시각으로
 * 바꾸면 엉뚱한 마감이 생긴다.
 */
function findDayLandmarks(text: string, table: DayLandmarkTable): TimeHit[] {
  const names = Object.keys(table);
  if (names.length === 0) return [];

  const hits: TimeHit[] = [];
  const pattern = new RegExp(`(${names.join("|")})\\s*(?:시간)?\\s*(?:이?전|까지)`, "g");
  for (const m of text.matchAll(pattern)) {
    const slot = table[m[1] as string];
    if (!slot) continue;
    hits.push({
      start: m.index,
      end: m.index + m[0].length,
      hour: slot[0],
      minute: slot[1],
      flags: ["일과 시각 추정"],
    });
  }
  return hits;
}

/** HH:MM / 오전·오후 N시 N분 / N시 반 */
function findClockTimes(text: string): TimeHit[] {
  const hits: TimeHit[] = [];
  const taken: Span[] = [];

  // 1) 15:20, 9:00
  for (const m of text.matchAll(/(?<![\d:])([01]?\d|2[0-3])\s*:\s*([0-5]\d)(?![\d:])/g)) {
    const h = Number(m[1]);
    const mi = Number(m[2]);
    const span = { start: m.index, end: m.index + m[0].length };
    taken.push(span);
    hits.push({ ...span, hour: h, minute: mi, flags: [] });
  }

  // 2) (오전|오후)? N시 (N분|반)?
  for (const m of text.matchAll(/(오전|오후|아침|저녁|밤)?\s*(\d{1,2})\s*시\s*(?:(\d{1,2})\s*분|(반))?/g)) {
    const span = { start: m.index, end: m.index + m[0].length };
    if (overlaps(span, taken)) continue;

    let h = Number(m[2]);
    if (h > 24) continue;
    const mi = m[3] !== undefined ? Number(m[3]) : m[4] !== undefined ? 30 : 0;
    if (mi > 59) continue;

    const meridiem = m[1];
    const flags: AmbiguityFlag[] = [];
    if (meridiem === "오후" || meridiem === "저녁" || meridiem === "밤") {
      if (h < 12) h += 12;
    } else if (meridiem === "오전" || meridiem === "아침") {
      if (h === 12) h = 0;
    } else if (h >= 1 && h <= 7) {
      // 오전·오후 없이 1~7시면 어느 쪽인지 알 수 없다 (기술계획서 7.4).
      // 학교 일과 기준으로 오후일 확률이 높지만 임의 확정하지 않고 표시만 남긴다.
      h += 12;
      flags.push("오전·오후 불명확");
    }
    if (h > 23) continue;

    taken.push(span);
    hits.push({ ...span, hour: h, minute: mi, flags });
  }

  return hits;
}

/* ────────────────────────────── 날짜 ────────────────────────────── */

/**
 * 연도가 생략된 월·일을 절대 날짜로 만든다.
 * 발송일보다 반년 이상 과거로 계산되면 학사연도가 넘어간 것으로 보고 다음 해로 민다.
 */
function inferYear(mo: number, d: number, sentAt: Civil): { date: Civil; flags: AmbiguityFlag[] } {
  const flags: AmbiguityFlag[] = [];
  let y = year(sentAt);
  if (!isValidYmd(y, mo, d)) {
    // 2월 30일 같은 값. 그대로 두면 다른 달로 넘어가므로 무효 처리한다.
    return { date: civil(y, mo, Math.min(d, 28)), flags: ["날짜 범위 벗어남"] };
  }
  let date = civil(y, mo, d);
  if (diffDays(date, sentAt) < -180) {
    y += 1;
    date = civil(y, mo, d);
    flags.push("연도 생략");
  }
  return { date, flags };
}

/** 날짜 뒤에 붙은 (요일) 또는 " 요일"을 검증한다. */
function verifyWeekday(text: string, after: number, date: Civil): { flags: AmbiguityFlag[]; consumed: number } {
  const tail = text.slice(after, after + 8);
  const m = tail.match(/^\s*\(?\s*([일월화수목금토])\s*(?:요일)?\s*\)?/);
  if (!m) return { flags: [], consumed: 0 };

  const nameChar = m[1];
  if (nameChar === undefined) return { flags: [], consumed: 0 };
  const expected = WEEKDAY_INDEX[nameChar];
  if (expected === undefined) return { flags: [], consumed: 0 };

  // 날짜와 요일이 함께 적혔는데 서로 맞지 않으면 자동등록하지 않는다 (PRD 7.1).
  const flags: AmbiguityFlag[] = weekday(date) === expected ? [] : ["날짜·요일 불일치"];
  return { flags, consumed: m[0].length };
}

function findAbsoluteDates(text: string, sentAt: Civil, taken: Span[]): DateHit[] {
  const hits: DateHit[] = [];

  const push = (hit: DateHit) => {
    if (overlaps(hit, taken)) return;
    taken.push({ start: hit.start, end: hit.end });
    hits.push(hit);
  };

  // 1) 기간: 8월 3일~8월 5일 / 8/11~8/13 / 8월 3일~5일
  for (const m of text.matchAll(
    /(\d{1,2})\s*[월/.]\s*(\d{1,2})\s*일?\s*[~∼\-–]\s*(?:(\d{1,2})\s*[월/.]\s*)?(\d{1,2})\s*일?(?![\d시분:])/g,
  )) {
    const m1v = Number(m[1]);
    const d1v = Number(m[2]);
    const m2v = m[3] !== undefined ? Number(m[3]) : m1v;
    const d2v = Number(m[4]);
    if (m1v < 1 || m1v > 12 || d1v < 1 || d1v > 31 || m2v < 1 || m2v > 12 || d2v < 1 || d2v > 31) continue;

    const a = inferYear(m1v, d1v, sentAt);
    const b = inferYear(m2v, d2v, a.date);
    if (b.date.getTime() < a.date.getTime()) continue;

    push({
      start: m.index,
      end: m.index + m[0].length,
      date: a.date,
      endDate: b.date,
      flags: [...new Set([...a.flags, ...b.flags])],
      rule: "range",
    });
  }

  // 2) 2026-08-27 / 2026.8.27 / 2026/08/27
  for (const m of text.matchAll(/(\d{4})\s*[-./]\s*(\d{1,2})\s*[-./]\s*(\d{1,2})\.?/g)) {
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (!isValidYmd(y, mo, d)) continue;
    const date = civil(y, mo, d);
    const wd = verifyWeekday(text, m.index + m[0].length, date);
    push({
      start: m.index,
      end: m.index + m[0].length + wd.consumed,
      date,
      flags: wd.flags,
      rule: "ymd",
    });
  }

  // 3) (2026년) 8월 27일 (목)  ← 가장 흔한 형태
  for (const m of text.matchAll(/(?:(\d{4})\s*년\s*)?(\d{1,2})\s*월\s*(\d{1,2})\s*일/g)) {
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (mo < 1 || mo > 12 || d < 1 || d > 31) continue;

    let date: Civil;
    let flags: AmbiguityFlag[];
    if (m[1] !== undefined) {
      const y = Number(m[1]);
      if (!isValidYmd(y, mo, d)) continue;
      date = civil(y, mo, d);
      flags = [];
    } else {
      if (!isValidYmd(year(sentAt), mo, d)) continue;
      const inferred = inferYear(mo, d, sentAt);
      date = inferred.date;
      flags = inferred.flags;
    }
    const wd = verifyWeekday(text, m.index + m[0].length, date);
    push({
      start: m.index,
      end: m.index + m[0].length + wd.consumed,
      date,
      flags: [...flags, ...wd.flags],
      rule: "month-day",
    });
  }

  // 4) 8/27  — 시각(15:20)이나 분수와 헷갈리지 않도록 앞뒤를 막는다.
  for (const m of text.matchAll(/(?<![\d:/.])(\d{1,2})\s*\/\s*(\d{1,2})(?![\d:/])/g)) {
    const mo = Number(m[1]);
    const d = Number(m[2]);
    if (mo < 1 || mo > 12 || d < 1 || d > 31) continue;
    const inferred = inferYear(mo, d, sentAt);
    const wd = verifyWeekday(text, m.index + m[0].length, inferred.date);
    push({
      start: m.index,
      end: m.index + m[0].length + wd.consumed,
      date: inferred.date,
      flags: [...inferred.flags, ...wd.flags],
      rule: "slash",
    });
  }

  // 5) 9.2. / 8.25.  — 공문에서 쓰는 점 표기. 끝점이 있어야 인정한다.
  for (const m of text.matchAll(/(?<![\d.])(\d{1,2})\s*\.\s*(\d{1,2})\s*\.(?!\d)/g)) {
    const mo = Number(m[1]);
    const d = Number(m[2]);
    if (mo < 1 || mo > 12 || d < 1 || d > 31) continue;
    const inferred = inferYear(mo, d, sentAt);
    const wd = verifyWeekday(text, m.index + m[0].length, inferred.date);
    push({
      start: m.index,
      end: m.index + m[0].length + wd.consumed,
      date: inferred.date,
      flags: [...inferred.flags, ...wd.flags],
      rule: "dotted",
    });
  }

  return hits;
}

/** 발송일 이후(오늘 포함 여부는 inclusive로 정함) 가장 가까운 해당 요일 */
function nextWeekday(from: Civil, target: number, includeToday: boolean): Civil {
  const base = startOfDay(from);
  let delta = (target - weekday(base) + 7) % 7;
  if (delta === 0 && !includeToday) delta = 7;
  return addDays(base, delta);
}

function findRelativeDates(text: string, sentAt: Civil, taken: Span[]): DateHit[] {
  const hits: DateHit[] = [];
  const base = startOfDay(sentAt);

  const push = (hit: DateHit) => {
    if (overlaps(hit, taken)) return;
    taken.push({ start: hit.start, end: hit.end });
    hits.push(hit);
  };

  // 1) 이번 주 / 다음 주 + 요일  (요일 단독보다 먼저 잡아야 한다)
  for (const m of text.matchAll(/(이번|금|다음|담|차)\s*주\s*([일월화수목금토])\s*요일/g)) {
    const wordRaw = m[1];
    const dayCharRaw = m[2];
    if (wordRaw === undefined || dayCharRaw === undefined) continue;
    const target = WEEKDAY_INDEX[dayCharRaw];
    if (target === undefined) continue;

    const thisWeek = m[1] === "이번" || m[1] === "금";
    // 발송일이 속한 주(월요일 시작)를 기준으로 잡는다.
    const mondayOffset = (weekday(base) + 6) % 7;
    const monday = addDays(base, -mondayOffset);
    const weekStart = thisWeek ? monday : addDays(monday, 7);
    const offset = (target + 6) % 7; // 월=0 … 일=6
    push({
      start: m.index,
      end: m.index + m[0].length,
      date: addDays(weekStart, offset),
      flags: [],
      rule: thisWeek ? "this-week-weekday" : "next-week-weekday",
    });
  }

  // 2) 오늘 / 금일 / 내일 / 명일 / 모레 / 글피
  const OFFSETS: Array<[RegExp, number, string]> = [
    [/오늘|금일|당일/g, 0, "today"],
    [/내일|명일|익일/g, 1, "tomorrow"],
    [/모레|내일모레|내일 모레/g, 2, "day-after-tomorrow"],
    [/글피/g, 3, "three-days-later"],
    [/어제|전일/g, -1, "yesterday"],
  ];
  for (const [re, offset, rule] of OFFSETS) {
    for (const m of text.matchAll(re)) {
      push({
        start: m.index,
        end: m.index + m[0].length,
        date: addDays(base, offset),
        flags: [],
        rule,
      });
    }
  }

  // 3) 요일만 적힘 — 학교 쪽지에서 가장 흔한 마감 표현이다 (기술계획서 8.10).
  //    발송일 이후 가장 가까운 그 요일로 보고, 반드시 «요일만 적힘»을 붙인다.
  for (const m of text.matchAll(/(?<![\d)])\s*([일월화수목금토])\s*요일/g)) {
    const dayCharRaw = m[1];
    if (dayCharRaw === undefined) continue;
    const target = WEEKDAY_INDEX[dayCharRaw];
    if (target === undefined) continue;
    const span = { start: m.index, end: m.index + m[0].length };
    if (overlaps(span, taken)) continue; // 이미 날짜에 딸린 요일 표기면 건너뛴다

    push({
      ...span,
      date: nextWeekday(base, target, true),
      flags: ["요일만 적힘"],
      rule: "weekday-only",
    });
  }

  // 4) 이번 주 / 다음 주 (요일 없이) — 주 단위 범위로 본다.
  for (const m of text.matchAll(/(이번|금|다음|담|차)\s*주(?!\s*[일월화수목금토]\s*요일)/g)) {
    const span = { start: m.index, end: m.index + m[0].length };
    if (overlaps(span, taken)) continue;
    const thisWeek = m[1] === "이번" || m[1] === "금";
    const mondayOffset = (weekday(base) + 6) % 7;
    const monday = addDays(base, -mondayOffset);
    const weekStart = thisWeek ? monday : addDays(monday, 7);
    push({
      ...span,
      date: weekStart,
      endDate: addDays(weekStart, 4),
      flags: ["종료일 불명확"],
      rule: thisWeek ? "this-week" : "next-week",
    });
  }

  return hits;
}

/* ────────────────────────────── 합치기 ────────────────────────────── */

/**
 * 날짜에 시각을 붙인다.
 *
 * 교시표가 없는 교시 표현처럼 «시각을 모르는» 경우에는 정밀도만 period로 두고 시각 자리를
 * 비운다. 00:00 이나 23:59 를 임의로 채우지 않는다 (PRD 7.1).
 */
function attachTime(
  date: Civil,
  time: TimeHit | undefined,
): { at: Civil; precision: TimePrecision; hasClock: boolean } {
  if (!time) return { at: startOfDay(date), precision: "date_only", hasClock: false };
  if (time.hour !== undefined) {
    return {
      at: civil(year(date), month1(date), day(date), time.hour, time.minute ?? 0),
      precision: time.periodStart !== undefined ? "period" : "exact",
      hasClock: true,
    };
  }
  return { at: startOfDay(date), precision: "period", hasClock: false };
}

/** 한 문장에서 날짜·시각을 뽑아 절대 날짜 후보로 만든다. */
export function extractDates(sentence: string, options: ResolveOptions): DateMention[] {
  const { sentAt, periodTable = null } = options;
  const landmarkTable = options.dayLandmarks ?? DEFAULT_DAY_LANDMARKS;
  const maxBefore = options.maxDaysBefore ?? 365;
  const maxAfter = options.maxDaysAfter ?? 730;

  const periods = findPeriods(sentence, periodTable);
  const clocks = findClockTimes(sentence);
  // 시계 시각이 우선이다. 「12시(점심 전)까지」처럼 둘 다 적혀 있으면 적힌 숫자를 믿는다.
  const landmarks = findDayLandmarks(sentence, landmarkTable).filter(
    (l) => !overlaps(l, [...periods, ...clocks].map((t) => ({ start: t.start, end: t.end }))),
  );
  const times = [...periods, ...clocks, ...landmarks].sort((a, b) => a.start - b.start);

  // 시각 구간을 먼저 점유해 두어야 "15:20"의 15가 8/15로 잘못 잡히지 않는다.
  const taken: Span[] = times.map((t) => ({ start: t.start, end: t.end }));

  const dates = [
    ...findAbsoluteDates(sentence, sentAt, taken),
    ...findRelativeDates(sentence, sentAt, taken),
  ].sort((a, b) => a.start - b.start);

  const mentions: DateMention[] = [];

  for (const hit of dates) {
    // 날짜에서 가장 가까운 시각을 짝지어 준다.
    let best: TimeHit | undefined;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const t of times) {
      const distance = t.start >= hit.end ? t.start - hit.end : hit.start - t.end;
      if (distance >= 0 && distance < bestDistance) {
        bestDistance = distance;
        best = t;
      }
    }
    // 40자 넘게 떨어진 시각은 다른 일정의 것으로 본다.
    if (bestDistance > 40) best = undefined;

    const { at, precision, hasClock } = attachTime(hit.date, best);
    const flags = new Set<AmbiguityFlag>([...hit.flags, ...(best?.flags ?? [])]);

    const distance = diffDays(at, sentAt);
    if (distance < -maxBefore || distance > maxAfter) flags.add("날짜 범위 벗어남");

    const mention: DateMention = {
      text: sentence.slice(hit.start, hit.end).trim(),
      index: hit.start,
      startAt: toISO(at, hasClock),
      precision,
      flags: [...flags],
      rule: hit.rule,
    };
    if (hit.endDate) mention.endAt = toISO(hit.endDate, false);
    if (best?.periodStart !== undefined) mention.periodStart = best.periodStart;
    if (best?.periodEnd !== undefined) mention.periodEnd = best.periodEnd;

    mentions.push(mention);
  }

  // 날짜 없이 시각만 있는 문장. 날짜를 지어내지 않고 발송일로 두되 호출자가 알 수 있게
  // rule 이름으로 표시한다. (자동등록은 막는다)
  if (mentions.length === 0 && times.length > 0) {
    const first = times[0]!;
    const { at, precision, hasClock } = attachTime(sentAt, first);
    const mention: DateMention = {
      text: sentence.slice(first.start, first.end).trim(),
      index: first.start,
      startAt: toISO(at, hasClock),
      precision,
      flags: [...first.flags],
      rule: "time-only-assumed-send-day",
    };
    if (first.periodStart !== undefined) mention.periodStart = first.periodStart;
    if (first.periodEnd !== undefined) mention.periodEnd = first.periodEnd;
    mentions.push(mention);
  }

  return mentions;
}

/**
 * 날짜가 한 글자도 없는 «해 주세요» 문장의 마감일.
 *
 * 「학급 게시판에 붙여 주세요」·「가정에 안내 부탁드립니다」처럼 학교 쪽지에는 기한을 적지
 * 않은 지시가 아주 흔하다. 보내는 사람에게는 «받는 즉시»가 당연해 굳이 적지 않는 것이다.
 * 그동안 이런 문장은 날짜가 없다는 이유로 후보조차 되지 못했고, 그래서 교사가 놓쳤다.
 *
 * 발송일을 마감으로 잡되 **지어낸 날짜임을 반드시 표시한다**. 표시가 붙으면 자동 등록이
 * 막혀 검토함으로 간다 — 사람이 「오늘까지가 맞나」를 한 번 보고 넘긴다.
 * 부르는 쪽이 «요청 문장인지»를 판단한다 (pipeline.ts).
 */
export function sendDayRequestMention(sentAt: Civil): DateMention {
  return {
    text: "",
    index: 0,
    startAt: toISO(startOfDay(sentAt), false),
    precision: "date_only",
    flags: ["날짜 없이 요청만 적힘"],
    rule: "request-no-date-assumed-send-day",
  };
}

/** 사람이 읽을 수 있는 요약. 진단 화면과 테스트 출력에 쓴다. */
export function describeMention(m: DateMention): string {
  const wd = WEEKDAY_NAMES[new Date(m.startAt + (m.startAt.length === 10 ? "T00:00" : "") + "Z").getUTCDay()];
  const period = m.periodStart !== undefined ? ` ${m.periodStart}${m.periodEnd !== m.periodStart ? `~${m.periodEnd}` : ""}교시` : "";
  const flags = m.flags.length > 0 ? ` [${m.flags.join(", ")}]` : "";
  return `${m.startAt}(${wd})${period} ← "${m.text}" (${m.rule})${flags}`;
}
