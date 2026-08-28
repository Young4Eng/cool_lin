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

function toResult(data) {
  const candidates = Array.isArray(data.candidates) ? data.candidates : [];
  return {
    file: typeof data.file === 'string' ? data.file : null,
    stats: data.extraction?.stats ?? null,
    events: candidates.map(candidateToEvent).filter(Boolean),
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
