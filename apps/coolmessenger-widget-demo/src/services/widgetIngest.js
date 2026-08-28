// 위젯 단독 가져오기.
//
//   쿨메신저 창 → server/python (내려받기) → schedule-engine → 후보
//     → 자동등록 가능한 것은 캘린더로, 나머지는 검토함으로
//
// 지금까지 이 흐름은 메인 앱(AiAssistantWindow)에만 있었다. 위젯만 띄우는 설치본에서는
// 메인 앱이 없으므로 위젯이 직접 부른다. 규칙은 여전히 엔진 한 곳에만 있다.

import { fetchFreshFromCoolMessenger, fetchFromLatestDownload } from './realIngestClient';

/**
 * 같은 일정인지 판별하는 열쇠.
 *
 * 후보 id 는 매 실행마다 새로 만들어지는 UUID 라 그대로 쓰면 가져올 때마다 같은 일정이
 * 쌓인다. 사람이 «같은 일정»이라고 볼 값들로 열쇠를 만든다.
 */
export function eventKey(event) {
  return [event.date, event.time || '', (event.title || '').trim(), event.category || ''].join('|');
}

/**
 * 새로 뽑은 일정을 기존 목록에 합친다.
 *
 * - 이미 있는 일정은 건너뛴다 (열쇠가 같으면 같은 일정)
 * - 엔진이 «자동등록 가능»이라고 한 것만 캘린더에 바로 넣는다
 * - 나머지는 검토함으로 간다 (`reviewed: false` 로 두면 위젯이 검토함에 보여 준다)
 *
 * 자동등록 판정은 엔진이 이미 내렸다. 여기서 다시 판단하지 않는다.
 */
export function mergeEvents(existing, incoming) {
  const seen = new Set(existing.map(eventKey));
  const added = [];
  const forReview = [];

  for (const event of incoming) {
    const key = eventKey(event);
    if (seen.has(key)) continue;
    seen.add(key);

    if (event.autoRegisterEligible) {
      added.push({ ...event, reviewed: true, addedAt: new Date().toISOString() });
    } else {
      forReview.push({ ...event, reviewed: false, addedAt: new Date().toISOString() });
    }
  }

  return {
    next: [...existing, ...added, ...forReview],
    added,
    forReview,
  };
}

/**
 * 한 번 가져와서 합친 결과를 돌려준다. 저장은 호출한 쪽이 한다.
 *
 * @param {'latest'|'fresh'} mode
 *   `latest` — 이미 내려받아 둔 최신 파일에서 다시 뽑는다. 빠르고 화면을 건드리지 않는다.
 *   `fresh`  — 쿨메신저 창을 실제로 조작해 새로 내려받는다. 10초쯤 걸리고 창이 앞으로 나온다.
 */
export async function ingestOnce(existingEvents, mode = 'latest') {
  // 서버가 있는지 없는지는 realIngestClient 가 알아서 갈라진다.
  // 설치본이면 셸이 파일을 읽고 파이썬을 부르고, 브라우저면 서버에 물어본다.
  const result = mode === 'fresh' ? await fetchFreshFromCoolMessenger() : await fetchFromLatestDownload();
  const merged = mergeEvents(existingEvents, result.events);
  return { ...merged, file: result.file, scanned: result.events.length };
}
