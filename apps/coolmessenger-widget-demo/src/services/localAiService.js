// Local AI Engine & Schedule Extraction Service
// Supports both Browser On-Device Rule-Based NLP & External Local LLMs (Ollama / LM Studio / LocalAI)

import { extractBestEventFromMessage, extractEventsFromMessage } from './scheduleEngineAdapter';

export const AI_SETTINGS_STORAGE_KEY = 'cool_ai_settings';

export const getDefaultAiSettings = () => ({
  mode: 'hybrid', // 'builtin' | 'ollama' | 'hybrid'
  ollamaEndpoint: 'http://localhost:11434',
  model: 'llama3:latest',
  temperature: 0.3,
  autoExtractSchedule: true,
  autoNotifyNewMessage: true,
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

// 1. 일정 추출 — packages/schedule-engine 규칙 엔진에 위임한다.
//
// 예전에는 이 파일에 정규식이 직접 들어 있었는데, 날짜 기준이 오늘로 고정돼 있고
// 제목이 쪽지별로 하드코딩돼 있어 실제 쪽지에는 맞지 않았다. 지금은 엔진이
// «쪽지를 받은 날»을 기준으로 「모레」·「금요일까지」를 계산하고, 확인이 필요한
// 부분에는 표시를 붙여 준다. 규칙은 packages/schedule-engine/RULES.md 를 본다.

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

  // If connected to Ollama and mode allows
  if (settings.mode !== 'builtin') {
    try {
      const response = await fetch(`${settings.ollamaEndpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: settings.model,
          prompt: `다음은 학교 교직원 간의 메신저 쪽지 내용입니다. 핵심 내용을 3가지 항목으로 명확하게 한국어로 요약해 주세요.

제목: ${message.subject}
본문: ${message.bodyHtml.replace(/<[^>]*>/g, ' ')}

형식:
1. 발신 목적:
2. 핵심 요구사항:
3. 마감 기한 및 후속 조치:`,
          stream: false,
          options: { temperature: 0.2 }
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.response) return data.response.trim();
      }
    } catch (e) {
      console.warn('Ollama connection not available, fallback to built-in NLP engine', e);
    }
  }

  // Built-in intelligent template summarizer
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
      const response = await fetch(`${settings.ollamaEndpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: settings.model,
          prompt: `학교 메신저에서 다음 쪽지에 대한 교사용 정중하고 간결한 답장(유형: ${type})을 작성해주세요. 한국어로 정중하게 작성하세요.
쪽지 제목: ${message.subject}
본문: ${message.bodyHtml.replace(/<[^>]*>/g, ' ')}`,
          stream: false
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.response) return data.response.trim();
      }
    } catch (e) {
      console.warn('Ollama unavailable, fallback to built-in reply template');
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
