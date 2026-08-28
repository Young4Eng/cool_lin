// Ollama ingest items {title, when, due, source_sheet, source_title}
// → 위젯 캘린더 일정 객체. 규칙 엔진 Candidate 매핑(scheduleEngineAdapter)과
// 별개로, 모델이 준 짧은 제목·날짜만 옮긴다.

const DEFAULT_YEAR = 2026;

function pad2(n) {
  return String(n).padStart(2, '0');
}

/**
 * when/due 원문을 캘린더 date + time 으로 자른다.
 * 시간대가 없는 한국 시각이므로 Date 파싱은 쓰지 않는다.
 */
export function parseItemDateTime(value) {
  if (typeof value !== 'string') return { date: '', time: '' };
  const s = value.trim();
  if (!s) return { date: '', time: '' };

  let m = s.match(
    /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[T\s]+(\d{1,2}):(\d{2})(?::\d{2})?)?/,
  );
  if (m) {
    return {
      date: `${m[1]}-${pad2(m[2])}-${pad2(m[3])}`,
      time: m[4] != null ? `${pad2(m[4])}:${m[5]}` : '',
    };
  }

  m = s.match(
    /(?:(\d{4})\s*년\s*)?(\d{1,2})\s*월\s*(\d{1,2})\s*일(?:\s*(\d{1,2})\s*시(?:\s*(\d{1,2})\s*분)?)?/,
  );
  if (m) {
    const year = m[1] || String(DEFAULT_YEAR);
    const time =
      m[4] != null ? `${pad2(m[4])}:${pad2(m[5] ?? '0')}` : '';
    return { date: `${year}-${pad2(m[2])}-${pad2(m[3])}`, time };
  }

  return { date: '', time: '' };
}

function slugId(title, index) {
  const slug = String(title || 'item')
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24);
  return `ev-ai-item-${index}-${slug || 'x'}`;
}

/**
 * @param {{ title?: string, when?: string, due?: string, source_sheet?: string, source_title?: string }} item
 * @param {number} [index]
 * @returns {object | null}
 */
export function itemToEvent(item, index = 0) {
  if (!item || typeof item !== 'object') return null;
  const title = typeof item.title === 'string' ? item.title.trim() : '';
  if (!title) return null;

  const due = parseItemDateTime(item.due);
  const when = parseItemDateTime(item.when);
  const date = due.date || when.date;
  if (!date) return null;
  const time = due.date ? due.time : when.time;

  const lines = [];
  if (item.source_title) lines.push(`원쪽지: ${item.source_title}`);
  if (item.source_sheet) lines.push(`시트: ${item.source_sheet}`);
  if (item.when && item.due && item.when !== item.due) {
    lines.push(`시작 ${item.when} · 마감 ${item.due}`);
  }

  return {
    id: slugId(title, index),
    title,
    date,
    time,
    category: '업무',
    priority: due.date ? 'high' : 'medium',
    location: '',
    description: lines.join('\n'),
    fromAi: true,
    autoRegisterEligible: true,
    sourceSheet: item.source_sheet || '',
    sourceTitle: item.source_title || '',
  };
}

/**
 * items 가 하나라도 일정으로 바뀌면 그걸 쓰고, 비면 candidates 폴백.
 * mapCandidate 는 위젯의 candidateToEvent 를 넘긴다 (테스트에서는 stub).
 */
export function eventsFromIngestPayload(data, mapCandidate = () => null) {
  const items = Array.isArray(data?.items) ? data.items : [];
  const fromItems = items.map((it, i) => itemToEvent(it, i)).filter(Boolean);
  if (fromItems.length > 0) {
    return { events: fromItems, source: 'items' };
  }
  const candidates = Array.isArray(data?.candidates) ? data.candidates : [];
  return {
    events: candidates.map(mapCandidate).filter(Boolean),
    source: 'candidates',
  };
}
