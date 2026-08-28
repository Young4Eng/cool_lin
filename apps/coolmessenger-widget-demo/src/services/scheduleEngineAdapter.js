// 규칙 엔진(@cool-lin/schedule-engine) → 위젯 일정 객체 어댑터
//
// 엔진은 쪽지에서 «후보(Candidate)»를 뽑아 주고, 이 파일은 그걸 위젯이 쓰는
// { title, date, time, category, priority, location, ... } 모양으로 옮긴다.
// 규칙 자체는 여기서 손대지 않는다. 규칙을 고칠 일이 있으면
// packages/schedule-engine 쪽을 고쳐야 두 곳이 갈라지지 않는다.

import { extractFromMessage } from '@cool-lin/schedule-engine/browser';

// 최초 실행에서 교사가 고르는 역할 태그. 지금은 데모 기본값을 쓴다.
// 이름·학교명·연락처는 받지 않는다.
export const DEFAULT_ROLE = {
  homeroom: true,
  grades: [2],
  interests: ['연수', '평가'],
};

// 엔진 분류 → 위젯 카테고리
// 위젯 카테고리: 학사일정 / 공문마감 / 회의 / 교무 / 시험 / 업무
function toCategory(candidate) {
  if (candidate.candidateType === 'DEADLINE') return '공문마감';
  if (candidate.candidateType === 'URGENT_NOTICE') return '교무';

  const words = candidate.keywords.join(' ');
  if (/고사|시험|평가/.test(words)) return '시험';
  if (/회의|협의회/.test(words)) return '회의';
  if (/방학|개학|의식행사|졸업|입학/.test(words)) return '학사일정';

  if (candidate.candidateType === 'OFFICIAL_EVENT') return '학사일정';
  return '업무';
}

function toPriority(candidate) {
  if (candidate.candidateType === 'DEADLINE') return 'urgent';
  if (candidate.confidenceBand === '높음') return 'high';
  if (candidate.candidateType === 'OFFICIAL_EVENT') return 'high';
  return 'medium';
}

// 엔진은 "2026-08-28T15:20" 또는 "2026-08-28" 을 준다.
// 시간대 표시가 없는 한국 시각이므로 new Date() 로 파싱하지 않고 문자열을 그대로 자른다.
function splitDateTime(candidate) {
  const value = candidate.dueAt || candidate.startAt || '';
  const [date, time] = value.split('T');
  // 시각을 모르면 비워 둔다. 00:00 이나 23:59 를 지어내지 않는다.
  return { date: date || '', time: candidate.timePrecision === 'exact' ? (time || '') : '' };
}

// 왜 이 일정이 잡혔는지 사람이 읽을 수 있게 적는다.
// 쪽지 원문은 넣지 않는다.
function toDescription(candidate) {
  const lines = [];

  if (candidate.periodStart) {
    const range =
      candidate.periodEnd && candidate.periodEnd !== candidate.periodStart
        ? `${candidate.periodStart}~${candidate.periodEnd}교시`
        : `${candidate.periodStart}교시`;
    lines.push(`${range} · 시간 미설정 (학교 교시표를 등록하면 시각으로 바뀝니다)`);
  }
  if (candidate.endAt) lines.push(`종료 ${candidate.endAt}`);
  if (candidate.targetText) lines.push(`대상 ${candidate.targetText}`);
  if (candidate.ambiguityFlags.length > 0) {
    lines.push(`⚠ 확인 필요: ${candidate.ambiguityFlags.join(', ')}`);
  }
  if (!candidate.autoRegisterEligible && candidate.autoRegisterBlockers.length > 0) {
    lines.push(`자동등록 보류: ${candidate.autoRegisterBlockers.join(' / ')}`);
  }
  lines.push(`판단 근거: ${candidate.reasoning.join(' · ')}`);

  return lines.join('\n');
}

function toEvent(candidate) {
  const { date, time } = splitDateTime(candidate);
  if (!date) return null;

  return {
    id: `ev-ai-${candidate.id}`,
    title: candidate.proposedTitle,
    date,
    time,
    category: toCategory(candidate),
    priority: toPriority(candidate),
    location: candidate.location || '',
    description: toDescription(candidate),
    fromAi: true,
    confidence: candidate.confidence,

    // 엔진이 준 판단 정보. 위젯이 «검토 필요» 표시를 붙이는 데 쓸 수 있다.
    confidenceBand: candidate.confidenceBand,
    candidateType: candidate.candidateType,
    ambiguityFlags: candidate.ambiguityFlags,
    autoRegisterEligible: candidate.autoRegisterEligible,
    autoRegisterBlockers: candidate.autoRegisterBlockers,
    keywords: candidate.keywords,
    sourceGroupId: candidate.sourceGroupId,
    // description에도 "판단 근거: ..."로 접혀 들어가지만, 위젯의 "왜 이렇게
    // 판단했나요?" 펼침 UI가 문장 목록을 따로 필요로 해서 배열째로도 넘긴다.
    reasoning: candidate.reasoning,
  };
}

/**
 * 쪽지 한 건에서 일정을 모두 뽑는다.
 *
 * @param {{ bodyHtml?: string, body?: string, subject?: string, timestamp?: string }} message
 * @param {{ role?: object, now?: Date|null, includePast?: boolean, minBand?: '높음'|'검토 필요'|'낮음' }} [options]
 * @returns {Array<object>} 위젯 일정 객체 배열
 */
export function extractEventsFromMessage(message, options = {}) {
  const body = message.bodyHtml ?? message.body ?? '';
  if (!body) return [];

  // 기준 시각은 «쪽지를 받은 날»이다. 「모레까지」가 며칠인지가 여기서 갈린다.
  const sentAt = message.timestamp || message.dateLabel || '';
  if (!sentAt) return [];

  const candidates = extractFromMessage(
    { subject: message.subject, body, html: Boolean(message.bodyHtml), sentAt },
    {
      role: options.role ?? DEFAULT_ROLE,
      now: options.now ?? null,
      includePast: options.includePast ?? true,
    },
  );

  // 신뢰도가 낮은 후보까지 한꺼번에 넣으면 캘린더가 지저분해진다.
  // 기본은 다 주고, 일괄 등록처럼 사람이 하나씩 보지 않는 경로에서만 걸러 쓴다.
  const order = { 낮음: 0, '검토 필요': 1, 높음: 2 };
  const floor = order[options.minBand ?? '낮음'];

  return candidates
    .filter((c) => order[c.confidenceBand] >= floor)
    .map(toEvent)
    .filter(Boolean);
}

/** 가장 확실한 일정 하나만 필요할 때 */
export function extractBestEventFromMessage(message, options = {}) {
  const events = extractEventsFromMessage(message, options);
  if (events.length === 0) return null;
  return events.reduce((best, e) => (e.confidence > best.confidence ? e : best), events[0]);
}
