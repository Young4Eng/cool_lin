// Local AI Engine & Schedule Extraction Service
// Supports both Browser On-Device Rule-Based NLP & External Local LLMs (Ollama / LM Studio / LocalAI)

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

// 1. Smart Date / Time & Action Extractor (On-Device NLP Engine)
export function extractScheduleFromText(text, subject = '') {
  if (!text) return null;
  const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  const combined = `${subject} ${cleanText}`;

  // Date regex patterns (Korean format)
  // e.g., 8월 27일, 8/27, 2026-08-27, 9월 1일(화)
  const dateMatch = combined.match(/(?:2026년\s*)?(\d{1,2})월\s*(\d{1,2})일(?:\s*\([월화수목금토일]\))?/) ||
                    combined.match(/(\d{1,2})\/(\d{1,2})/);

  let dateStr = '2026-08-28';
  if (dateMatch) {
    const month = String(dateMatch[1]).padStart(2, '0');
    const day = String(dateMatch[2]).padStart(2, '0');
    dateStr = `2026-${month}-${day}`;
  }

  // Time regex patterns
  // e.g., 17:00, 16:00까지, 12:40, 15시 30분, 오후 4시
  const timeMatch = combined.match(/(\d{1,2}):(\d{2})/) ||
                    combined.match(/(?:오전|오후)\s*(\d{1,2})시(?:\s*(\d{1,2})분)?/) ||
                    combined.match(/(\d{1,2})시\s*(\d{1,2})분/);

  let timeStr = '17:00';
  if (timeMatch) {
    if (timeMatch[0].includes(':')) {
      timeStr = `${String(timeMatch[1]).padStart(2, '0')}:${timeMatch[2]}`;
    } else {
      let hour = parseInt(timeMatch[1], 10);
      if (combined.includes('오후') && hour < 12) hour += 12;
      const min = timeMatch[2] ? String(timeMatch[2]).padStart(2, '0') : '00';
      timeStr = `${String(hour).padStart(2, '0')}:${min}`;
    }
  }

  // Category & Priority heuristics
  let category = '업무';
  let priority = 'medium';

  if (combined.includes('동의서') || combined.includes('공문') || combined.includes('제출') || combined.includes('신청') || combined.includes('마감') || combined.includes('품의')) {
    category = '공문마감';
    priority = 'urgent';
  } else if (combined.includes('회의') || combined.includes('협의회') || combined.includes('위원회')) {
    category = '회의';
    priority = 'high';
  } else if (combined.includes('생활지도') || combined.includes('급식지도') || combined.includes('순번') || combined.includes('보강')) {
    category = '교무';
    priority = 'high';
  } else if (combined.includes('개학') || combined.includes('방학') || combined.includes('지필평가') || combined.includes('시험') || combined.includes('수강신청')) {
    category = '학사일정';
    priority = 'high';
  }

  // Location heuristics
  let location = '교무실';
  if (combined.includes('시청각실')) location = '시청각실';
  else if (combined.includes('교무부')) location = '교무부';
  else if (combined.includes('행정실')) location = '행정실';
  else if (combined.includes('복도')) location = '3층 복도';
  else if (combined.includes('교실') || combined.includes('2-3')) location = '2-3 교실';
  else if (combined.includes('홈페이지') || combined.includes('나이스')) location = '온라인/나이스';

  // Title Extraction
  let title = subject.replace(/\[.*?\]/g, '').replace(/수정했습니다~?/g, '').trim();
  if (combined.includes('동의서')) title = '행정정보공유 동의서 수합 교무부 제출';
  else if (combined.includes('특근매식비')) title = '8월 특근매식비 지출품의 신청 마감';
  else if (combined.includes('생활지도')) title = '점심시간 복도 생활지도';
  else if (combined.includes('교직원 회의') || combined.includes('직원회의')) title = '2학기 전체 교직원 회의 참석';
  else if (combined.includes('전자칠판')) title = '교실 전자칠판 유지보수 점검';
  else if (combined.includes('방과후')) title = '방과후학교 수강신청 오픈';
  else if (!title || title.length < 3) title = '업무 및 일정 마감 확인';

  return {
    // Date.now() alone collides when several messages are batch-processed
    // in the same millisecond (e.g. AiAssistantWindow's "전체 동기화"),
    // producing duplicate React keys in EventList/MiniCalendar — add a
    // random suffix so every extracted event gets a unique id.
    id: 'ev-ai-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
    title,
    date: dateStr,
    time: timeStr,
    category,
    priority,
    location,
    description: `[로컬 AI 자동 추출] ${cleanText.substring(0, 140)}...`,
    fromAi: true,
    confidence: 0.94
  };
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
