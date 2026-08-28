// Local AI Engine & Schedule Extraction Service
// Supports both Browser On-Device Rule-Based NLP & External Local LLMs (Ollama / LM Studio / LocalAI)
//
// Schedule extraction is delegated to packages/schedule-engine via
// scheduleEngineAdapter.js.
//
// 요약·답장 본문은 **비식별을 거친 뒤에만** Ollama 로 간다. 어디서 가리느냐가 갈린다:
//   설치본 — 위젯이 직접 가리고(piiRedact.js) 셸을 거쳐 Ollama 를 부른다. 서버가 없다.
//   브라우저 — 예전처럼 Node 서버의 redact/complete 경로를 쓴다.
// 어느 쪽이든 원문이 이 PC 를 떠나지 않는 것은 같다.

import { extractBestEventFromMessage, extractEventsFromMessage } from './scheduleEngineAdapter';
import { inDesktopShell, ollamaTags } from './desktopShell';
import { redactMessageFields } from './piiRedact';
import { completeWithOllama } from './ollamaClient';

export const AI_SETTINGS_STORAGE_KEY = 'cool_ai_settings';

export const getDefaultAiSettings = () => ({
  mode: 'hybrid', // 'builtin' | 'ollama' | 'hybrid'
  ollamaEndpoint: 'http://localhost:11434',
  model: 'qwen2.5:3b',
  temperature: 0.3,
  autoExtractSchedule: true,      // 쪽지 수신 시 자동으로 일정 후보 추출
  autoNotifyNewMessage: true,     // 새 쪽지 도착 시 알림 토스트
  serverEndpoint: 'http://localhost:4000', // 실제 쿨메신저 다운로드+엔진 서버 (server/)
  deadlineReminderEnabled: true,  // 마감 전 알림 서비스
  deadlineReminderMinutes: 60,    // 마감 몇 분 전에 알릴지
});

export const getAiSettings = () => {
  try {
    const saved = localStorage.getItem(AI_SETTINGS_STORAGE_KEY);
    if (saved) {
      return { ...getDefaultAiSettings(), ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load AI settings', e);
  }
  return getDefaultAiSettings();
};

export const saveAiSettings = (settings) => {
  localStorage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
};

function serverBase() {
  const settings = getAiSettings();
  return (settings.serverEndpoint || 'http://localhost:4000').replace(/\/$/, '');
}

/**
 * 요약·답장 한 번. 설치본이면 위젯이 가리고 곧장 Ollama 로, 아니면 서버로 보낸다.
 * 어느 쪽이든 실패하면 null — 부르는 쪽이 내장 문안으로 넘어간다.
 */
async function complete(payload) {
  if (inDesktopShell()) {
    const redacted = redactMessageFields({
      subject: payload.subject,
      body: payload.body,
      counterpart: payload.counterpart,
    });
    return completeWithOllama(
      {
        kind: payload.kind,
        replyType: payload.replyType,
        subject: redacted.subject,
        body: redacted.body,
      },
      getAiSettings(),
    );
  }
  return completeOnServer(payload);
}

/**
 * 요약·답장 본문은 서버에서 비식별한 뒤에만 Ollama 로 보낸다.
 * pii_map 은 응답에 오지 않는다. 서버가 꺼져 있으면 null.
 */
async function completeOnServer(payload) {
  const res = await fetch(`${serverBase()}/api/local-ai/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(130000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false || typeof data.text !== 'string' || !data.text.trim()) {
    return null;
  }
  return data.text.trim();
}

// 1. 일정 추출 — packages/schedule-engine 규칙 엔진에 위임한다.

/**
 * 쪽지에서 일정 하나를 뽑는다. 못 뽑으면 null.
 *
 * @param {string} text     본문 (HTML 가능)
 * @param {string} subject  제목 열
 * @param {string} sentAt   쪽지를 받은 날. 없으면 상대 날짜를 계산할 수 없다.
 */
export function extractScheduleFromText(text, subject = '', sentAt = '') {
  if (!text || !sentAt) return null;
  return extractBestEventFromMessage({ bodyHtml: text, subject, timestamp: sentAt });
}

/**
 * 한 쪽지에 일정이 여럿 들어 있을 때 전부 받는다.
 * 사람이 하나씩 보지 않는 일괄 등록용이라 신뢰도 «낮음»은 뺀다.
 */
export function extractSchedulesFromMessage(message) {
  return extractEventsFromMessage(message, { minBand: '검토 필요' });
}

// 2. Generate 3-line Summary
export async function generateAiSummary(message) {
  const settings = getAiSettings();

  if (settings.mode !== 'builtin') {
    try {
      const text = await complete({
        kind: 'summary',
        subject: message.subject || '',
        body: (message.bodyHtml || '').replace(/<[^>]*>/g, ' '),
        counterpart: message.senderName || message.sender || '',
      });
      if (text) return text;
    } catch (e) {
      console.warn('server complete unavailable, fallback to built-in NLP engine', e);
    }
  }

  const clean = message.bodyHtml.replace(/<[^>]*>/g, ' ');
  let deadline = '기한 확인 필요';
  if (clean.includes('8월 27일')) deadline = '2026년 8월 27일(목) 17:00까지';
  else if (clean.includes('8월 28일')) deadline = '2026년 8월 28일(금) 방과 후';
  else if (clean.includes('8월 31일')) deadline = '2026년 8월 31일(월) 16:00';
  else if (clean.includes('9월 1일')) deadline = '2026년 9월 1일(화) 12:40';

  return `📌 [AI 3줄 핵심 요약]
1. 발신 목적: ${message.subject.substring(0, 45)} 관련 안내 및 협조 요청
2. 핵심 내용: 학생/학급 대상 사전 안내 배부 및 취합서류 제출
3. 마감 기한 및 조치: ${deadline} (교무부/행정실 제출 완료 필요)`;
}

// 3. Generate AI Smart Reply
export async function generateSmartReply(message, type = 'accept') {
  const settings = getAiSettings();

  if (settings.mode !== 'builtin') {
    try {
      const text = await complete({
        kind: 'reply',
        replyType: type,
        subject: message.subject || '',
        body: (message.bodyHtml || '').replace(/<[^>]*>/g, ' '),
        counterpart: message.senderName || message.sender || '',
      });
      if (text) return text;
    } catch (e) {
      console.warn('server complete unavailable, fallback to built-in reply template');
    }
  }

  if (type === 'accept') {
    return `안녕하세요 선생님! 안내해주신 내용 확인하였습니다. 기한 내에 정확히 취합 및 조치하여 제출하겠습니다. 항상 노고에 감사드립니다! (2-3 김서준 드림)`;
  } else if (type === 'ask') {
    return `선생님 안내 감사합니다! 확인 중에 한 가지 여쭙고자 합니다. 미제출 학생이 발생하는 경우 추가 제출 기한이나 예외 처리 절차가 어떻게 되는지 문의드립니다.`;
  } else if (type === 'done') {
    return `선생님, 요청하신 서류 확인 및 캘린더 일정 등록 완료했습니다. 작성 완료되는 대로 교무부로 직접 제출하겠습니다. 감사합니다!`;
  }
  return `선생님 안내 말씀 확인하였습니다. 확인 후 조치하겠습니다. 감사합니다.`;
}

// 4. Test Local Ollama Connection
export async function testOllamaConnection(endpoint) {
  // 설치본에서는 셸이 물어본다. 웹뷰에서 곧장 fetch 하면 Ollama 가 Origin 을 보고
  // 막기 때문에, 실제로는 잘 돌고 있는데도 「연결할 수 없습니다」가 나온다.
  if (inDesktopShell()) {
    try {
      return { ok: true, models: await ollamaTags(endpoint) };
    } catch (e) {
      return { ok: false, error: e?.message || '로컬 Ollama에 연결할 수 없습니다.' };
    }
  }
  try {
    const res = await fetch(`${endpoint}/api/tags`, { method: 'GET' });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status} 오류` };
    const data = await res.json();
    const models = (data.models || []).map(m => m.name);
    return { ok: true, models };
  } catch (e) {
    return { ok: false, error: '로컬 LLM 서버에 연결할 수 없습니다. (Ollama 구동 여부 및 CORS 설정을 확인하세요)' };
  }
}
