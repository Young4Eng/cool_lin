import { randomUUID } from "node:crypto";
import { extractMessages } from "./adapters/columns.js";
import { parseWorkbook } from "./adapters/workbook.js";
import { band, classifySentence, type UserRole } from "./classify/classify.js";
import { diffDays, startOfDay, type Civil } from "./dates/civil.js";
import { extractDates, type PeriodTable } from "./dates/resolve.js";
import { parseSentAt } from "./dates/sentAt.js";
import { createFingerprintKey, messageFingerprint, scheduleFingerprint } from "./text/fingerprint.js";
import { normalizeBody } from "./text/normalize.js";
import { splitQuote } from "./text/quote.js";
import { detectSensitive } from "./text/sensitive.js";
import { splitSentences } from "./text/sentences.js";
import { buildTitle } from "./title.js";
import type { Candidate, DateMention } from "./types.js";

/**
 * 가져오기 파이프라인.
 *
 * 순서를 바꾸면 안 된다 (기술계획서 7.2). 특히 **중복 제거가 마스킹보다 먼저**다.
 *
 *   1. 인용문 분리   2. 지문으로 중복 제거   3. 민감정보 탐지·마스킹
 *   4. 문장 나누기   5. 날짜·시각 추출        6. 문장 단위 분류·점수
 *   7. 관계 판정     8. 후보 확정
 */

export interface PipelineOptions {
  /** 최초 가져오기 기본값은 발송일 기준 최근 14일이다 (PRD 6장). */
  windowDays?: number;
  /** «오늘»의 기준. 지정하지 않으면 실행 시각 */
  now?: Civil;
  role?: UserRole;
  periodTable?: PeriodTable | null;
  /** 한 번에 만들 수 있는 후보 수 상한 (PRD 6장) */
  maxCandidates?: number;
  fingerprintKey?: Buffer;
}

export interface PipelineStats {
  filesRead: number;
  rowsRead: number;
  /** 가져오기 기간 밖이라 읽지 않은 쪽지 */
  outOfWindow: number;
  /** 인용문만 있어 건너뛴 쪽지 */
  quotedOnly: number;
  /** 같은 쪽지가 여러 파일에 겹쳐 걸러진 수 */
  duplicates: number;
  /** 서로 다른 쪽지·문장에서 같은 일정이 나와 합쳐진 수 */
  mergedCandidates: number;
  /** 민감정보로 격리한 쪽지 */
  quarantined: number;
  /** 날짜 표현이 없어 후보가 되지 못한 쪽지 */
  noDate: number;
  /** 일정 날짜가 이미 지나 후보에서 뺀 수 */
  pastDate: number;
  messagesProcessed: number;
  candidates: number;
  autoRegisterEligible: number;
}

export interface PipelineResult {
  candidates: Candidate[];
  stats: PipelineStats;
  /** 헤더에서 알아보지 못해 무시한 열 */
  ignoredColumns: string[];
}

/** 자동등록 안전 조건 (PRD 9장). 하나라도 걸리면 후보함에 남긴다. */
function checkAutoRegister(
  candidate: Omit<Candidate, "autoRegisterEligible" | "autoRegisterBlockers">,
  isOptional: boolean,
  matchesRole: boolean,
  now: Civil,
): string[] {
  const blockers: string[] = [];
  // 마감 후보는 날짜가 startAt 이 아니라 dueAt 에 들어간다. 둘 다 봐야 한다.
  const when = candidate.startAt ?? candidate.dueAt;
  const start = new Date(when === null ? "" : when.length === 10 ? when + "T00:00Z" : when + "Z");

  if (when === null || Number.isNaN(start.getTime())) {
    blockers.push("날짜가 없음");
  } else if (diffDays(start, startOfDay(now)) < 0) {
    blockers.push("이미 지난 날짜");
  }

  const official =
    candidate.candidateType === "OFFICIAL_EVENT" ||
    candidate.candidateType === "DEADLINE" ||
    candidate.candidateType === "PERSONAL_TASK";
  if (!official) blockers.push("공식 일정·내 마감이 아님");

  if (isOptional) blockers.push("희망자 대상 표현");
  if (candidate.ambiguityFlags.length > 0) blockers.push(`확인 필요: ${candidate.ambiguityFlags.join(", ")}`);
  if (candidate.relationType !== "new") blockers.push("변경·취소 제안");
  if (!matchesRole) blockers.push("나와 관련 있다고 보기 어려움");

  return blockers;
}

export async function runPipeline(files: string[], options: PipelineOptions = {}): Promise<PipelineResult> {
  const {
    windowDays = 14,
    now = new Date(),
    role = {},
    periodTable = null,
    maxCandidates = 1000,
    fingerprintKey = createFingerprintKey(),
  } = options;

  const stats: PipelineStats = {
    filesRead: 0,
    rowsRead: 0,
    outOfWindow: 0,
    quotedOnly: 0,
    duplicates: 0,
    mergedCandidates: 0,
    quarantined: 0,
    noDate: 0,
    pastDate: 0,
    messagesProcessed: 0,
    candidates: 0,
    autoRegisterEligible: 0,
  };

  const ignoredColumns = new Set<string>();
  const seen = new Set<string>();
  // 같은 공지가 재전송되거나 한 쪽지 안에서 같은 일정이 여러 문장에 걸쳐 나와도
  // 후보는 하나만 만든다. 제목 일치만으로 합치지 않고 날짜·유형까지 함께 본다 (PRD 7.3).
  const scheduleSeen = new Set<string>();
  const candidates: Candidate[] = [];

  for (const file of files) {
    const workbook = await parseWorkbook(file);
    stats.filesRead += 1;

    const extracted = extractMessages(workbook.sheets);
    stats.rowsRead += extracted.messages.length;
    for (const c of extracted.ignoredColumns) ignoredColumns.add(c);

    for (const raw of extracted.messages) {
      const sentAt = parseSentAt(raw.sentAtRaw);
      if (sentAt === null) continue;

      // 가져오기 기간: 쪽지 «발송일»이 오래되면 아예 읽지 않는다.
      if (diffDays(startOfDay(now), sentAt) > windowDays) {
        stats.outOfWindow += 1;
        continue;
      }

      const body = normalizeBody(raw.body);

      // 1) 인용문 분리
      const { current, quotedOnly } = splitQuote(body);
      if (quotedOnly || current.length === 0) {
        stats.quotedOnly += 1;
        continue;
      }

      // 2) 중복 제거 — 마스킹 «전» 원문으로 지문을 만든다.
      const fingerprint = messageFingerprint(fingerprintKey, {
        direction: raw.direction,
        counterpart: raw.counterpart,
        sentAt: raw.sentAtRaw,
        body: current,
      });
      if (seen.has(fingerprint)) {
        stats.duplicates += 1;
        continue;
      }
      seen.add(fingerprint);
      stats.messagesProcessed += 1;

      // 3) 민감정보 탐지·마스킹
      const sensitive = detectSensitive(current);
      if (sensitive.quarantine) {
        stats.quarantined += 1;
        continue;
      }

      // 4~6) 문장 나누기 → 날짜 추출 → 문장 단위 분류
      const messageId = fingerprint;
      const sourceGroupId = fingerprint;
      const sentences = splitSentences(sensitive.masked);
      let producedForMessage = 0;

      for (const sentence of sentences) {
        const dates = extractDates(sentence.text, { sentAt, periodTable });
        if (dates.length === 0) continue;

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

        // 한 문장에 날짜가 여럿이면 각각의 후보로 나누되 같은 출처로 묶는다.
        for (const date of dates) {
          if (candidates.length >= maxCandidates) break;

          const startsInPast =
            diffDays(
              new Date(date.startAt.length === 10 ? date.startAt + "T00:00Z" : date.startAt + "Z"),
              startOfDay(now),
            ) < 0;
          // 지난 일정은 후보함에 넣지 않는다 (PRD 6장). 통계에는 남긴다.
          if (startsInPast) {
            stats.pastDate += 1;
            continue;
          }

          const title = buildTitle({
            titleColumn: raw.title,
            body: sensitive.masked,
            sentence: sentence.text,
            signals: verdict.signals,
            classification: verdict.classification,
          });

          const isDeadline = verdict.classification === "DEADLINE";
          const base: Omit<Candidate, "autoRegisterEligible" | "autoRegisterBlockers"> = {
            id: randomUUID(),
            messageId,
            proposedTitle: title,
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
            ambiguityFlags: dateFlags(date, verdict.signals.recurrenceVague),
            sourceGroupId,
            messageSentAt: raw.sentAtRaw,
            counterpart: raw.counterpart,
          };

          const blockers = checkAutoRegister(
            base,
            verdict.signals.isOptional,
            verdict.signals.matchesRole || verdict.signals.allStaff,
            now,
          );
          // 시각을 지어낸 경우도 자동등록을 막는다.
          if (date.rule === "time-only-assumed-send-day") blockers.push("날짜 없이 시각만 적힘");

          const scheduleKey = scheduleFingerprint(fingerprintKey, {
            startAt: base.startAt ?? base.dueAt ?? "",
            endAt: base.endAt,
            title: base.proposedTitle,
            type: base.candidateType,
          });
          if (scheduleSeen.has(scheduleKey)) {
            stats.mergedCandidates += 1;
            producedForMessage += 1;
            continue;
          }
          scheduleSeen.add(scheduleKey);

          const candidate: Candidate = {
            ...base,
            autoRegisterEligible: blockers.length === 0 && verdict.confidence >= 0.6,
            autoRegisterBlockers: blockers,
          };
          candidates.push(candidate);
          producedForMessage += 1;
          if (candidate.autoRegisterEligible) stats.autoRegisterEligible += 1;
        }
      }

      if (producedForMessage === 0) stats.noDate += 1;
    }
  }

  stats.candidates = candidates.length;
  return { candidates, stats, ignoredColumns: [...ignoredColumns] };
}

function dateFlags(date: DateMention, recurrenceVague: boolean) {
  const flags = [...date.flags];
  if (recurrenceVague && !flags.includes("반복 주기 불명확")) flags.push("반복 주기 불명확");
  return flags;
}
