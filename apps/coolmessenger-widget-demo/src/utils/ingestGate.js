// 「가져오기」를 한 번이라도 눌렀는가.
//
// 위젯은 켜질 때와 10분마다 바탕화면의 최신 내보내기 파일을 스스로 읽는다. 쓰던 사람에게는
// 그게 맞다 — 자동 내려받기가 새 파일을 놓고 가면 위젯이 알아서 반영한다.
//
// 그런데 **새로 설치한 직후**에는 그러면 안 된다. 바탕화면에 예전 `coolmsg_*.xls` 가
// 남아 있으면 사용자가 아무것도 누르지 않았는데 일정·검토·할 일이 채워진 채로 시작한다.
// 처음 켠 사람은 그게 어디서 왔는지 알 수 없고, 지워도 다음에 켜면 또 생긴다.
//
// 그래서 «사람이 한 번 누르기 전까지는 아무것도 읽지 않는다». 한 번 누른 뒤부터
// 자동 갱신이 돈다.

const KEY = 'cool_lin_ingest_started_v1';

export function hasIngestStarted() {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    // 저장소를 못 읽으면 «아직 안 눌렀다»로 본다. 저절로 채우는 쪽이 더 나쁘다.
    return false;
  }
}

export function markIngestStarted() {
  try {
    localStorage.setItem(KEY, '1');
  } catch {
    /* 저장 못 해도 이번 실행은 그대로 진행한다 */
  }
}
