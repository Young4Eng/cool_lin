// 설치본에서 로컬 Ollama 를 부르는 길.
//
// 여기로 오는 텍스트는 **이미 비식별된 것만이다** (services/piiRedact.js). 이 파일은
// 「무엇을 물어볼까」와 「답을 어떻게 읽을까」만 맡고, 실제 HTTP 는 셸(Rust)이 친다.
//
// 왜 셸이 치는가. 웹뷰에서 곧장 fetch 하면 Ollama 가 막는다 — 브라우저 요청에는
// `Origin` 헤더가 붙고 Ollama 는 `OLLAMA_ORIGINS` 에 없는 곳을 거절하는데, 설치본의
// origin 은 `http://tauri.localhost` 다. 그대로 두면 교사가 환경변수를 손대야만 로컬
// AI 가 도는 프로그램이 된다. 셸에서 부르면 Origin 이 없어 기본 설치 그대로 동작한다.
//
// 프롬프트와 응답 해석은 서버(server/src/localAi.ts)와 **같은 것을 쓴다.** 갈라지면
// 「서버로 볼 때와 설치본으로 볼 때 뽑히는 일정이 다르다」가 된다.

import { ollamaChat } from './desktopShell';

/** 한 번에 모델에게 보여 줄 쪽지 수와 본문 길이. 3b 모델의 맥락 창에 맞춘 값이다. */
const MAX_MESSAGES = 40;
const MAX_BODY_CHARS = 800;

/**
 * 비식별된 시트를 「일정 후보를 뽑아 달라」는 프롬프트로 만든다.
 * @param {Record<string, Array<Record<string,string>>>} sheets 비식별을 마친 시트
 */
export function buildIngestPrompt(sheets) {
  const messages = [];
  for (const [sheet, rows] of Object.entries(sheets ?? {})) {
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      if (messages.length >= MAX_MESSAGES) break;
      messages.push({
        sheet,
        제목: row['제목'] ?? '',
        상대: row['보낸사람'] || row['받은사람'] || '',
        날짜: row['날짜/시간'] ?? '',
        내용: (row['내용'] ?? '').slice(0, MAX_BODY_CHARS),
      });
    }
  }
  return [
    '학교 교실 메신저 쪽지에서 일정·할 일 후보만 추출하세요.',
    '이미 가명 처리된 텍스트입니다. 개인정보를 복원하지 마세요.',
    'JSON 객체 하나만 출력하세요. 스키마:',
    '{"items":[{"title":"짧은 일정/할 일 제목","when":"시작 시각 또는 빈 문자열","due":"마감 시각 또는 빈 문자열","source_sheet":"시트 이름","source_title":"원쪽지 제목"}]}',
    '후보가 없으면 {"items":[]} 을 반환하세요.',
    'when/due 는 쪽지에 나온 날짜·시각을 그대로 쓰세요. 없으면 빈 문자열.',
    '',
    '쪽지 목록:',
    JSON.stringify(messages),
  ].join('\n');
}

function asItem(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
  const title = typeof v.title === 'string' ? v.title.trim() : '';
  if (!title) return null;
  return {
    title,
    when: typeof v.when === 'string' ? v.when : '',
    due: typeof v.due === 'string' ? v.due : '',
    source_sheet: typeof v.source_sheet === 'string' ? v.source_sheet : '',
    source_title: typeof v.source_title === 'string' ? v.source_title : '',
  };
}

/**
 * 모델 응답에서 items 배열을 건져낸다.
 *
 * `format: "json"` 을 줘도 3b 급 모델은 ```json 울타리를 두르거나 앞에 한 줄 붙이는
 * 일이 잦다. 그 정도는 여기서 받아 준다 — 대신 못 읽으면 던진다. 조용히 빈 배열을
 * 돌려주면 「로컬 AI 가 아무것도 못 찾았다」와 구별되지 않는다.
 */
export function parseModelJson(raw) {
  let text = String(raw ?? '').trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) text = fence[1].trim();
  const start = text.search(/[[{]/);
  if (start > 0) text = text.slice(start);

  const parsed = JSON.parse(text);
  if (Array.isArray(parsed)) return parsed.map(asItem).filter(Boolean);
  if (parsed && typeof parsed === 'object') {
    const list = parsed.items ?? parsed.candidates ?? parsed.events;
    if (Array.isArray(list)) return list.map(asItem).filter(Boolean);
    const one = asItem(parsed);
    return one ? [one] : [];
  }
  return [];
}

/**
 * 비식별된 시트에서 로컬 AI 가 본 일정 후보(items)를 받는다.
 *
 * **Ollama 가 없거나 느려도 던지지 않는다.** 로컬 AI 는 «있으면 더 좋은» 층이고,
 * 없을 때 규칙 엔진 결과까지 같이 날려 버리면 가져오기 자체가 실패한다.
 *
 * @returns {Promise<{items: object[], model: string, ok: boolean, error?: string}>}
 */
export async function extractItemsWithOllama(sheets, settings) {
  const model = settings?.model || 'qwen2.5:3b';
  const endpoint = settings?.ollamaEndpoint || 'http://localhost:11434';
  try {
    const raw = await ollamaChat({
      endpoint,
      model,
      system: 'You extract classroom schedule and task candidates. Reply with JSON only.',
      prompt: buildIngestPrompt(sheets),
      jsonMode: true,
      temperature: 0.1,
    });
    try {
      return { ok: true, items: parseModelJson(raw), model };
    } catch {
      return { ok: true, items: [], model, error: '모델 응답을 JSON으로 해석하지 못했습니다.' };
    }
  } catch (e) {
    return { ok: false, items: [], model, error: e?.message || '로컬 Ollama에 연결할 수 없습니다.' };
  }
}

/**
 * 비식별된 쪽지 한 통으로 요약이나 답장을 받는다. 실패하면 null — 부르는 쪽이
 * 내장 문안으로 넘어간다.
 */
export async function completeWithOllama({ kind, replyType, subject, body }, settings) {
  const prompt =
    kind === 'reply'
      ? [
          '학교 메신저에서 다음 쪽지에 대한 교사용 정중하고 간결한 답장을 한국어로 작성하세요.',
          `답장 유형: ${replyType || 'accept'}`,
          '이미 가명 처리된 텍스트입니다. 개인정보를 복원하지 마세요.',
          `쪽지 제목: ${subject}`,
          `본문: ${body}`,
        ].join('\n')
      : [
          '다음은 학교 교직원 간의 메신저 쪽지 내용입니다. 핵심 내용을 3가지 항목으로 명확하게 한국어로 요약해 주세요.',
          '이미 가명 처리된 텍스트입니다. 개인정보를 복원하지 마세요.',
          `제목: ${subject}`,
          `본문: ${body}`,
          '',
          '형식:',
          '1. 발신 목적:',
          '2. 핵심 요구사항:',
          '3. 마감 기한 및 후속 조치:',
        ].join('\n');

  const raw = await ollamaChat({
    endpoint: settings?.ollamaEndpoint || 'http://localhost:11434',
    model: settings?.model || 'qwen2.5:3b',
    system:
      'You help Korean teachers with classroom messenger notes. Reply in Korean only. Do not restore personal data.',
    prompt,
    jsonMode: false,
    temperature: typeof settings?.temperature === 'number' ? settings.temperature : 0.3,
  });
  const text = String(raw ?? '').trim();
  return text || null;
}
