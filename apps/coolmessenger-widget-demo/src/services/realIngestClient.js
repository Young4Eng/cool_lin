import { candidateToEvent } from './scheduleEngineAdapter';
import { getAiSettings } from './localAiService';
import { eventsFromIngestPayload, itemToEvent } from './aiItemMapper';
import { inDesktopShell, readLatestExport, runMessengerDownload, withWidgetHidden } from './desktopShell';
import { eventsFromExport, parseExportXml } from './localExport';
import { redactSheets } from './piiRedact';
import { extractItemsWithOllama } from './ollamaClient';

const INGEST_TIMEOUT_MS = 240000;
const LATEST_TIMEOUT_MS = 160000;

function serverBase() {
  const settings = getAiSettings();
  return (settings.serverEndpoint || 'http://localhost:4000').replace(/\/$/, '');
}

async function postJson(path, { timeoutMs = INGEST_TIMEOUT_MS, body } = {}) {
  const res = await fetch(`${serverBase()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? '{}' : JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || `서버 요청 실패 (HTTP ${res.status})`);
  }
  return data;
}

export async function fetchFreshFromCoolMessenger(period) {
  // 설치본에는 Node 서버가 없다. 셸이 파이썬을 직접 부르고, 해석은 위젯이 한다.
  if (inDesktopShell()) {
    // 쿨메신저 창을 조작하는 동안 위젯이 비켜 준다. 여기 두면 이 함수를 부르는
    // 모든 화면(팀원의 가져오기 막대 포함)이 같은 보호를 받는다.
    await withWidgetHidden(() => runMessengerDownload(period));
    return fromLocalFile('내려받은 파일을 찾지 못했습니다.');
  }
  const body =
    period?.start && period?.end ? { startDate: period.start, endDate: period.end } : {};
  const data = await postJson('/api/ingest', { timeoutMs: INGEST_TIMEOUT_MS, body });
  return toResult(data);
}

export async function fetchFromLatestDownload() {
  if (inDesktopShell()) {
    return fromLocalFile('아직 내려받은 쪽지가 없습니다. 「가져오기」를 눌러 주세요.');
  }
  const data = await postJson('/api/open-latest', { timeoutMs: LATEST_TIMEOUT_MS });
  return toResult(data);
}

/**
 * 바탕화면의 최신 내보내기 파일에서 바로 뽑는다 (서버 없음).
 *
 * 규칙 엔진이 먼저 뽑고, 로컬 AI 가 켜져 있으면 **거기에 더한다.**
 *
 * 서버 경로는 items 가 하나라도 나오면 규칙 엔진 결과를 통째로 대신했다
 * (aiItemMapper.eventsFromIngestPayload). 설치본에서 그대로 따라 하면 Ollama 를 깐
 * PC 에서만 캘린더가 텅 비게 된다 — 모델이 준 항목은 규칙으로 확인한 것이 아니라
 * 전부 검토함으로 가기 때문이다. 「로컬 AI 를 깔았더니 일정이 사라졌다」는 설명할 수
 * 없는 동작이다. 그래서 여기서는 대신하지 않고 «규칙 엔진이 놓친 것»만 보탠다.
 *
 * 원문은 이 함수 밖으로 나가지 않는다. 모델에게는 비식별한 시트만 간다 (piiRedact.js).
 */
async function fromLocalFile(emptyMessage) {
  const file = await readLatestExport();
  if (!file) throw new Error(emptyMessage);

  const events = eventsFromExport(file.text);
  const settings = getAiSettings();

  // 「내장 규칙만」으로 두었으면 모델을 부르지 않는다.
  if (settings.mode === 'builtin') {
    return { file: file.path, stats: null, events, source: 'candidates', items: [], ai: null };
  }

  // parseExportXml 은 시트를 [{name, rows}] 로 준다. 비식별기는 {이름: rows} 를 받는다.
  let sheets = {};
  try {
    for (const sheet of parseExportXml(file.text)) sheets[sheet.name] = sheet.rows;
  } catch {
    sheets = {};
  }

  const { sheets: redacted } = redactSheets(sheets);
  const ai = await extractItemsWithOllama(redacted, settings);

  const extra = ai.items.map((item, i) => itemToEvent(item, i)).filter(Boolean);
  const merged = [...events, ...mergeAiItems(events, extra)];

  return {
    file: file.path,
    stats: null,
    events: merged,
    // 모델이 실제로 무언가 보탰을 때만 「로컬 AI」로 표시한다.
    source: extra.length > 0 ? 'items' : 'candidates',
    items: ai.items,
    ai: { ok: ai.ok, model: ai.model, ...(ai.error ? { error: ai.error } : {}) },
  };
}

/** 규칙 엔진이 이미 잡은 것과 겹치는 모델 항목을 덜어 낸다. */
function mergeAiItems(engineEvents, aiEvents) {
  const squash = (t) => String(t || '').replace(/\s+/g, '');
  const byDate = new Map();
  for (const e of engineEvents) {
    if (!byDate.has(e.date)) byDate.set(e.date, []);
    byDate.get(e.date).push(squash(e.title));
  }
  return aiEvents.filter((item) => {
    const titles = byDate.get(item.date);
    if (!titles) return true;
    const t = squash(item.title);
    // 제목이 서로를 품으면 같은 일정으로 본다 — 모델은 같은 일을 짧게 줄여 쓴다.
    return !titles.some((x) => x && t && (x.includes(t) || t.includes(x)));
  });
}

// 후보 하나가 «어느 쪽지에서 나왔는지» 되찾는다.
//
// 엔진은 일부러 쪽지 원문을 후보에 담지 않는다(개인정보). 대신 `messageSentAt` 과
// `counterpart` 를 **원문 그대로** 넘겨 주므로, 같은 응답에 들어 있는 시트 행과 맞추면
// 원문을 찾을 수 있다. 한 사람이 같은 «초»에 두 통을 보내지는 않는다.
//
// 로컬 AI 가 준 항목(items)에는 그 두 값이 없고 `source_title`(원쪽지 제목)만 있어서
// 제목으로도 찾을 수 있게 색인을 둘로 만든다.
function buildSourceIndex(sheets) {
  const byMessage = new Map();
  const byTitle = new Map();
  if (!sheets || typeof sheets !== 'object') return { byMessage, byTitle };

  for (const [sheetName, rows] of Object.entries(sheets)) {
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      const sentAt = row['날짜/시간'];
      const who = row['보낸사람'] ?? row['받은사람'];
      if (!sentAt || !who) continue;
      const source = {
        sheet: sheetName,
        kind: row['구분'] ?? '',
        from: who,
        subject: row['제목'] ?? '',
        sentAt,
        body: row['내용'] ?? '',
        attachment: row['첨부파일'] ?? '',
      };
      byMessage.set(`${sentAt}|${who}`, source);
      if (source.subject && !byTitle.has(source.subject)) byTitle.set(source.subject, source);
    }
  }
  return { byMessage, byTitle };
}

export function toResult(data) {
  const { byMessage, byTitle } = buildSourceIndex(data.sheets);

  // 규칙 엔진 후보 → 일정. 옮기면서 원문을 함께 달아 둔다.
  // 목록에서 더블클릭하면 이 원문을 그대로 띄운다.
  const mapCandidate = (candidate) => {
    const event = candidateToEvent(candidate);
    if (!event) return null;
    const source = byMessage.get(`${candidate.messageSentAt}|${candidate.counterpart}`);
    return source ? { ...event, source } : event;
  };

  const mapped = eventsFromIngestPayload(data, mapCandidate);

  // 로컬 AI 항목은 원쪽지 «제목»으로 원문을 찾는다.
  const events = mapped.events.map((event) =>
    event.source || !event.sourceTitle
      ? event
      : { ...event, source: byTitle.get(event.sourceTitle) ?? undefined },
  );

  return {
    file: typeof data.file === 'string' ? data.file : null,
    stats: data.extraction?.stats ?? null,
    events,
    // 「무엇으로 뽑았나」 — 'items'(로컬 AI) 또는 'candidates'(규칙 엔진)
    source: mapped.source,
    items: Array.isArray(data.items) ? data.items : [],
    ai: data.ai ?? null,
  };
}

export async function isServerReachable() {
  try {
    const res = await fetch(`${serverBase()}/api/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
