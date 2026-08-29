/**
 * 문장 목록에 날짜를 붙인다.
 *
 * pipeline.ts 와 browser.ts 가 같은 규칙을 쓰도록 여기 한곳에만 둔다.
 *
 * 1) 문장 안에서 날짜·일과 시점을 뽑는다.
 * 2) 날짜가 없는 «해 주세요» 문장이면, 같은 쪽지에서 뒤에 오는
 *    날짜만 있는 줄(예: `8월 28일(금) 종례 전까지`)을 그 지시의 마감으로 붙인다.
 * 3) 그래도 날짜가 없으면 발송일을 마감으로 쓰되 «날짜 없이 요청만 적힘»을 붙인다.
 */
import type { DateMention } from "../types.js";
import { ACTION_TERMS, CONDUCT_VERBS, EVENT_TERMS, REQUEST_ENDINGS } from "../classify/lexicon.js";
import type { Civil } from "./civil.js";
import { extractDates, sendDayRequestMention, type PeriodTable } from "./resolve.js";

export function isDirectiveRequest(text: string): boolean {
  return REQUEST_ENDINGS.test(text) && ACTION_TERMS.some((a) => a.term.test(text));
}

/** 행동·행사·실시 서술어가 없어, 기한만 적힌 줄로 본다. */
export function isDateOnlyFragment(text: string): boolean {
  return (
    !ACTION_TERMS.some((a) => a.term.test(text)) &&
    !EVENT_TERMS.some((a) => a.term.test(text)) &&
    !CONDUCT_VERBS.test(text)
  );
}

export function resolveSentenceDates(
  sentences: readonly { text: string }[],
  options: { sentAt: Civil; periodTable?: PeriodTable | null },
): Array<{ index: number; dates: DateMention[]; boundSource: string | null }> {
  const { sentAt, periodTable } = options;
  const consumed = new Set<number>();
  const out: Array<{ index: number; dates: DateMention[]; boundSource: string | null }> = [];

  for (let i = 0; i < sentences.length; i++) {
    if (consumed.has(i)) continue;
    const text = sentences[i]!.text;
    let dates = extractDates(text, { sentAt, periodTable });

    let boundSource: string | null = null;
    if (dates.length === 0) {
      if (!isDirectiveRequest(text)) continue;
      for (let j = i + 1; j < sentences.length; j++) {
        if (consumed.has(j)) continue;
        const later = sentences[j]!.text;
        const laterDates = extractDates(later, { sentAt, periodTable });
        if (laterDates.length === 0) continue;
        if (!isDateOnlyFragment(later)) continue;
        dates = laterDates;
        consumed.add(j);
        boundSource = later;
        break;
      }
      if (boundSource === null) dates = [sendDayRequestMention(sentAt)];
    }

    out.push({ index: i, dates, boundSource });
  }

  return out;
}
