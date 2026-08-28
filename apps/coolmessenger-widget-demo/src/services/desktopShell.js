// 데스크톱(Tauri) 셸에서만 되는 것들.
// 브라우저에서 열었을 때는 조용히 «없음»으로 답하고 아무 일도 하지 않는다.

const CHOICE_KEY = 'cool_widget_autostart_choice_v1';

export function inDesktopShell() {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

async function invoke(cmd, args) {
  const { invoke: call } = await import('@tauri-apps/api/core');
  return call(cmd, args);
}

/** 지금 부팅 자동 실행이 켜져 있는가. 브라우저에서는 항상 false. */
export async function getAutostart() {
  if (!inDesktopShell()) return false;
  try {
    return await invoke('autostart_status');
  } catch {
    return false;
  }
}

/** 사용자가 스위치를 직접 만졌는지. 만진 적이 있으면 그 선택을 이기지 않는다 (기술계획서 7.9). */
export function userChoseAutostart() {
  try {
    return localStorage.getItem(CHOICE_KEY) !== null;
  } catch {
    return false;
  }
}

export async function setAutostart(enabled, { byUser = true } = {}) {
  if (!inDesktopShell()) return false;
  try {
    if (byUser) localStorage.setItem(CHOICE_KEY, String(enabled));
  } catch {}
  try {
    return await invoke('autostart_set', { enabled });
  } catch {
    return false;
  }
}

/**
 * 「위젯을 켜면 부팅 등록도 함께 켠다」 (기술계획서 7.9).
 *
 * 위젯을 쓰는 사람의 기대는 «컴퓨터를 켜면 위젯이 있다» 이다. 설정 화면 어딘가의 스위치를
 * 찾아 켜야만 그렇게 된다면 그것 자체가 설계 실패다. 다만 사용자가 스위치를 직접 끈 적이
 * 있으면 그 선택을 되돌리지 않는다.
 */
export async function ensureAutostartOnFirstRun() {
  if (!inDesktopShell()) return false;
  if (userChoseAutostart()) return getAutostart();
  const already = await getAutostart();
  if (already) return true;
  return setAutostart(true, { byUser: false });
}

/**
 * 쿨메신저 창을 조작하는 동안 위젯을 잠깐 숨긴다.
 *
 * 위젯은 «항상 위»라 그대로 두면 메신저 툴바를 가리고, 버튼을 누른 직후에는 포그라운드도
 * 쥐고 있어 자동화가 메신저를 앞으로 꺼내지 못한다. 실패해도 반드시 다시 보이게 한다 —
 * 숨은 채로 남으면 사용자가 위젯을 되찾을 방법이 없다.
 */
export async function withWidgetHidden(run) {
  if (!inDesktopShell()) return run();
  try {
    await invoke('set_widget_visible', { visible: false });
  } catch {}
  try {
    return await run();
  } finally {
    try {
      await invoke('set_widget_visible', { visible: true });
    } catch {}
  }
}
