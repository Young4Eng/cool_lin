import { candidateToEvent } from './scheduleEngineAdapter';
import { getAiSettings } from './localAiService';
import { eventsFromIngestPayload } from './aiItemMapper';

const INGEST_TIMEOUT_MS = 240000;
const LATEST_TIMEOUT_MS = 160000;

function serverBase() {
  const settings = getAiSettings();
  return (settings.serverEndpoint || 'http://localhost:4000').replace(/\/$/, '');
}

async function postJson(path, { timeoutMs = INGEST_TIMEOUT_MS } = {}) {
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

export async function fetchFreshFromCoolMessenger() {
  const data = await postJson('/api/ingest', { timeoutMs: INGEST_TIMEOUT_MS });
  return toResult(data);
}

export async function fetchFromLatestDownload() {
  const data = await postJson('/api/open-latest', { timeoutMs: LATEST_TIMEOUT_MS });
  return toResult(data);
}

export function toResult(data) {
  const mapped = eventsFromIngestPayload(data, candidateToEvent);
  return {
    file: typeof data.file === 'string' ? data.file : null,
    stats: data.extraction?.stats ?? null,
    events: mapped.events,
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
