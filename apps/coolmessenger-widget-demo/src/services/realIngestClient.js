// Client for the REAL data pipeline, as opposed to this app's built-in
// simulated CoolMessenger messages:
//
//   실제 쿨메신저 창 (server/python/automator.py, pyautogui)
//     → .xls 자동 다운로드
//     → packages/schedule-engine (server/src/index.ts: runPipeline)
//     → Candidate[] 반환 + (fire-and-forget) 로컬 Ollama 2차 분석 (#5)
//
// server/ is the only thing that can drive the real CoolMessenger window
// and read the filesystem, so the widget talks to it over HTTP rather than
// re-implementing any of that in the browser. See ENGINE.md and
// server/README-ish comments in index.ts for the endpoint contracts.

import { candidateToEvent } from './scheduleEngineAdapter';
import { getAiSettings } from './localAiService';

function serverBase() {
  const settings = getAiSettings();
  return (settings.serverEndpoint || 'http://localhost:4000').replace(/\/$/, '');
}

async function postJson(path, { timeoutMs = 95000 } = {}) {
  const res = await fetch(`${serverBase()}${path}`, {
    method: 'POST',
    signal: AbortSignal.timeout(timeoutMs),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || `서버 요청 실패 (HTTP ${res.status})`);
  }
  return data;
}

/**
 * 실제 쿨메신저에서 지금 바로 새로 다운로드해서 일정 후보를 뽑는다.
 * 쿨메신저 창을 실제로 조작하므로(90초 타임아웃) 시간이 좀 걸릴 수 있다.
 */
export async function fetchFreshFromCoolMessenger() {
  const data = await postJson('/api/ingest');
  return toResult(data);
}

/** 이미 내려받아 열려 있는 최신 파일에서 다시 뽑는다 (다운로드 재시도 없음, 빠름). */
export async function fetchFromLatestDownload() {
  const data = await postJson('/api/open-latest', { timeoutMs: 20000 });
  return toResult(data);
}

// 후보 하나가 «어느 쪽지에서 나왔는지» 되찾는다.
//
// 엔진은 일부러 쪽지 원문을 후보에 담지 않는다(개인정보). 대신 `messageSentAt` 과
// `counterpart` 를 **원문 그대로** 넘겨 주므로, 같은 응답에 들어 있는 시트 행과 맞추면
// 원문을 찾을 수 있다. 한 사람이 같은 «초»에 두 통을 보내지는 않는다.
function buildSourceIndex(sheets) {
  const index = new Map();
  if (!sheets || typeof sheets !== 'object') return index;

  for (const [sheetName, rows] of Object.entries(sheets)) {
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      const sentAt = row['날짜/시간'];
      const who = row['보낸사람'] ?? row['받은사람'];
      if (!sentAt || !who) continue;
      index.set(`${sentAt}|${who}`, {
        sheet: sheetName,
        kind: row['구분'] ?? '',
        from: who,
        subject: row['제목'] ?? '',
        sentAt,
        body: row['내용'] ?? '',
        attachment: row['첨부파일'] ?? '',
      });
    }
  }
  return index;
}

function toResult(data) {
  const candidates = Array.isArray(data.candidates) ? data.candidates : [];
  const sources = buildSourceIndex(data.sheets);

  const events = candidates
    .map((candidate) => {
      const event = candidateToEvent(candidate);
      if (!event) return null;
      // 목록에서 더블클릭하면 이 원문을 그대로 띄운다.
      const source = sources.get(`${candidate.messageSentAt}|${candidate.counterpart}`);
      return source ? { ...event, source } : event;
    })
    .filter(Boolean);

  return {
    file: typeof data.file === 'string' ? data.file : null,
    stats: data.extraction?.stats ?? null,
    events,
  };
}

/** 서버(및 쿨메신저 자동화 브리지)가 지금 떠 있는지 가볍게 확인한다. */
export async function isServerReachable() {
  try {
    const res = await fetch(`${serverBase()}/api/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
