/**
 * 브라우저에서 쓰는 진입점.
 *
 * `index.ts` 는 파일을 읽고(node:fs) 지문을 만드는(node:crypto) 부분을 포함하므로
 * 브라우저 번들에 넣을 수 없다. 여기서는 **이미 메모리에 있는 쪽지 한 건**을 받아
 * 일정 후보로 바꾸는 순수한 부분만 노출한다.
 *
 * 규칙은 Node 쪽과 완전히 같은 모듈을 쓴다. 규칙이 두 벌로 갈라지지 않게 하기 위해서다.
 * 갈라지는 것은 «입력을 어디서 얻는가» 뿐이다.
 *
 *   Node    : .xls 파일 → adapters → pipeline
 *   브라우저 : 쪽지 객체 → 이 파일
 */
import { band, classifySentence, type UserRole } from "./classify/classify.js";
import { diffDays, startOfDay, type Civil } from "./dates/civil.js";
import { extractDates, sendDayRequestMention, type PeriodTable } from "./dates/resolve.js";
import { ACTION_TERMS, REQUEST_ENDINGS } from "./classify/lexicon.js";
import { parseSentAt } from "./dates/sentAt.js";
import {
  ambiguityFlagsFor,
  DEFAULT_AUTO_REGISTER_LEVEL,
  evaluateAutoRegister,
  relatedToUser,
  type AutoRegisterLevel,
} from "./policy/autoRegister.js";
import { normalizeBody } from "./text/normalize.js";
import { splitQuote } from "./text/quote.js";
import { detectSensitive } from "./text/sensitive.js";
import { splitSentences } from "./text/sentences.js";
import { buildTitle } from "./title.js";
import type { Candidate } from "./types.js";

export interface BrowserMessage {
  /** 쪽지 제목 열. 없으면 빈 문자열 */
  subject?: string;
  /** 본문. HTML이면 태그를 떼고 넣거나 `html: true` 를 준다 */
  body: string;
  /** 본문이 HTML인가 */
  html?: boolean;
  /** 받은 날짜. "2026-08-26T17:05:09" 또는 "2026/08/26 17:05:09 (수)" */
  sentAt: string;
}

export interface BrowserExtractOptions {
  role?: UserRole;
  periodTable?: PeriodTable | null;
  /** 「오늘」의 기준. 지난 일정을 걸러내는 데 쓴다. 주지 않으면 거르지 않는다. */
  now?: Date | null;
  /** 지난 일정도 후보로 만들 것인가 */
  includePast?: boolean;
  /** 자동 등록 기준 단계 (기술계획서 7.6). 기본값은 «분명한 일정까지» */
  autoRegisterLevel?: AutoRegisterLevel;
}

/** HTML 쪽지를 평문으로 바꾼다. 태그를 실행하거나 렌더링하지 않는다. */
export function htmlToText(html: string): string {
  return html
    .replace(/<\s*(br|\/p|\/div|\/li|\/tr|\/h[1-6])\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

/** 브라우저에서 쓸 수 있는 id. 암호학적 용도가 아니라 화면 구분용이다. */
function makeId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** 같은 쪽지에서 나온 후보를 묶기 위한 값. 비밀이 아니므로 단순 해시로 충분하다. */
function contentKey(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function asCivil(value: Date): Civil {
  return new Date(
    Date.UTC(value.getFullYear(), value.getMonth(), value.getDate(), value.getHours(), value.getMinutes()),
  );
}

/**
 * 쪽지 한 건에서 일정 후보를 뽑는다.
 *
 * 기준 시각은 `message.sentAt` 이다. 「모레까지」는 이 날짜를 기준으로 계산한다.
 * 민감정보가 보이면 후보를 만들지 않고 빈 배열을 돌려준다.
 */
export function extractFromMessage(
  message: BrowserMessage,
  options: BrowserExtractOptions = {},
): Candidate[] {
  const {
    role = {},
    periodTable = null,
    now = null,
    includePast = false,
    autoRegisterLevel = DEFAULT_AUTO_REGISTER_LEVEL,
  } = options;

  const sentAt = parseSentAt(message.sentAt);
  if (sentAt === null) return [];
  const today = now === null ? null : startOfDay(asCivil(now));

  const raw = message.html === true ? htmlToText(message.body) : message.body;
  const normalized = normalizeBody(raw);

  // 1) 인용문 분리 — 인용문만 있으면 후보를 만들지 않는다.
  const { current, quotedOnly } = splitQuote(normalized);
  if (quotedOnly || current.length === 0) return [];

  // 2) 민감정보 — 격리 대상이면 아무것도 내보내지 않는다.
  const sensitive = detectSensitive(current);
  if (sensitive.quarantine) return [];

  const titleColumn = message.subject ?? "";
  const groupId = contentKey(`${message.sentAt}|${current.slice(0, 200)}`);
  const candidates: Candidate[] = [];
  const seen = new Set<string>();

  for (const sentence of splitSentences(sensitive.masked)) {
    let dates = extractDates(sentence.text, { sentAt, periodTable });

    // 날짜가 없어도 «나에게 시키는» 문장이면 발송일 마감으로 잡는다 (pipeline.ts 와 같은 규칙).
    if (dates.length === 0) {
      const isRequest =
        REQUEST_ENDINGS.test(sentence.text) && ACTION_TERMS.some((a) => a.term.test(sentence.text));
      if (!isRequest) continue;
      dates = [sendDayRequestMention(sentAt)];
    }

    const verdict = classifySentence({
      sentence: sentence.text,
      body: sensitive.masked,
      dates,
      sentAt,
      role,
      quarantined: false,
    });

    if (
      verdict.classification === "ACK_REPLY" ||
      verdict.classification === "PERSONAL_CHAT" ||
      verdict.classification === "SENSITIVE" ||
      verdict.classification === "UNKNOWN"
    ) {
      continue;
    }

    for (const date of dates) {
      if (!includePast && today !== null) {
        const at = new Date(date.startAt.length === 10 ? `${date.startAt}T00:00Z` : `${date.startAt}Z`);
        if (diffDays(at, today) < 0) continue;
      }

      const proposedTitle = buildTitle({
        titleColumn,
        body: sensitive.masked,
        sentence: sentence.text,
        signals: verdict.signals,
        classification: verdict.classification,
      });

      const isDeadline = verdict.classification === "DEADLINE";
      const base: Omit<Candidate, "autoRegisterEligible" | "autoRegisterBlockers"> = {
        id: makeId(),
        messageId: groupId,
        proposedTitle,
        candidateType: verdict.classification,
        startAt: isDeadline ? null : date.startAt,
        endAt: date.endAt ?? null,
        dueAt: isDeadline ? date.startAt : null,
        timePrecision: date.precision,
        periodStart: date.periodStart ?? null,
        periodEnd: date.periodEnd ?? null,
        location: verdict.signals.location,
        actionText: verdict.signals.action?.label ?? null,
        targetText: verdict.signals.target,
        keywords: verdict.signals.keywords,
        reasoning: verdict.reasoning,
        confidence: verdict.confidence,
        confidenceBand: band(verdict.confidence),
        relationType: verdict.signals.relation,
        ambiguityFlags: ambiguityFlagsFor(date, verdict.signals),
        sourceGroupId: groupId,
        messageSentAt: message.sentAt,
        counterpart: "",
      };

      // 한 쪽지 안에서 같은 일정이 여러 문장에 나와도 후보는 하나만 만든다.
      const key = `${base.startAt ?? base.dueAt}|${base.candidateType}|${base.proposedTitle}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const auto = evaluateAutoRegister({
        candidateType: base.candidateType,
        // 마감 후보는 날짜가 startAt 이 아니라 dueAt 에 들어간다. 둘 다 봐야 한다.
        when: base.startAt ?? base.dueAt,
        ambiguityFlags: base.ambiguityFlags,
        relationType: base.relationType,
        confidence: base.confidence,
        isOptional: verdict.signals.isOptional,
        related: relatedToUser(verdict.signals),
        dateRule: date.rule,
        now: today,
        level: autoRegisterLevel,
      });

      candidates.push({
        ...base,
        autoRegisterEligible: auto.eligible,
        autoRegisterBlockers: auto.blockers,
      });
    }
  }

  return candidates;
}

export type { Candidate, UserRole, PeriodTable, AutoRegisterLevel };
export {
  AUTO_REGISTER_LEVELS,
  AUTO_REGISTER_THRESHOLD,
  DEFAULT_AUTO_REGISTER_LEVEL,
  isAutoRegisterLevel,
} from "./policy/autoRegister.js";
export { band } from "./classify/classify.js";
export { extractDates } from "./dates/resolve.js";
export { parseSentAt } from "./dates/sentAt.js";
export { detectSensitive } from "./text/sensitive.js";
export { normalizeBody } from "./text/normalize.js";
