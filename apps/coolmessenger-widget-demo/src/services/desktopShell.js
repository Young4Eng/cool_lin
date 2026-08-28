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
    // 창을 숨기라고 시킨 것과 화면에서 실제로 사라지는 것은 다르다. 곧바로 자동화를
    // 시작하면 화면에는 아직 위젯이 남아 있어 메신저 단추 대신 위젯이 찍힌다.
    await new Promise((r) => setTimeout(r, 450));
  } catch {}
  try {
    return await run();
  } finally {
    try {
      await invoke('set_widget_visible', { visible: true });
    } catch {}
  }
}

/** 바탕화면의 가장 최근 쿨메신저 내보내기 파일. 없으면 null. */
export async function readLatestExport() {
  if (!inDesktopShell()) return null;
  try {
    return await invoke('read_latest_export');
  } catch {
    return null;
  }
}

/**
 * 쿨메신저 창을 조작해 새로 내려받는다.
 * 파이썬을 셸이 직접 부른다 — Node 서버를 거치지 않는다.
 */
export async function runMessengerDownload(period) {
  const line = await invoke('run_messenger_download', {
    start: period?.start ?? null,
    end: period?.end ?? null,
  });
  let data;
  try {
    data = JSON.parse(line);
  } catch {
    throw new Error('쿨메신저 조작 결과를 읽지 못했습니다.');
  }
  if (data.ok === false) throw new Error(data.error || '쿨메신저에서 받지 못했습니다.');
  return data;
}
