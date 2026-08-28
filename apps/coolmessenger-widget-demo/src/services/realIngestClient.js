import { candidateToEvent } from './scheduleEngineAdapter';
import { getAiSettings } from './localAiService';
import { eventsFromIngestPayload } from './aiItemMapper';
import { inDesktopShell, readLatestExport, runMessengerDownload, withWidgetHidden } from './desktopShell';
import { eventsFromExport } from './localExport';

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
 * 로컬 AI(items) 는 서버가 붙여 주던 것이라 이 경로에는 없다. 규칙 엔진 결과만 나오며,
 * 그건 `source: 'candidates'` 로 알린다 — 화면이 「로컬 AI 는 꺼져 있습니다」라고
 * 말할 수 있어야 하기 때문이다.
 */
async function fromLocalFile(emptyMessage) {
  const file = await readLatestExport();
  if (!file) throw new Error(emptyMessage);
  return {
    file: file.path,
    stats: null,
    events: eventsFromExport(file.text),
    source: 'candidates',
    items: [],
    ai: null,
  };
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
