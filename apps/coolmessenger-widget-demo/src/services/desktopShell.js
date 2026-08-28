// 데스크톱(Tauri) 셸에서만 되는 것들.
// 브라우저에서 열었을 때는 조용히 «없음»으로 답하고 아무 일도 하지 않는다.

const CHOICE_KEY = 'cool_widget_autostart_choice_v1';

export function inDesktopShell() {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/**
 * 시스템 브라우저로 URL을 연다.
 *
 * 설치본(Tauri)에서 window.open 은 막히거나 빈 웹뷰만 뜬다. 그래서 셸이
 * 기본 브라우저를 연다. 브라우저 미리보기에서는 window.open 으로 연다.
 */
export async function openExternalUrl(url) {
  if (typeof url !== 'string' || !url.startsWith('https://')) {
    throw new Error('https URL only');
  }
  if (inDesktopShell()) {
    await invoke('open_url', { url });
    return;
  }
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) throw new Error('브라우저를 열지 못했습니다');
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

// 「캘린더 크게 보기」 창은 위젯과 **별개의 창**이다. 위젯을 덮거나 대신하지 않는다.
//
// 열림 상태를 여기서 따로 기억하지 않는다. 사용자가 창 X 로 닫으면 그 기억이 어긋나
// 「열려 있다고 생각하는데 실제로는 닫힌」 상태가 된다. 위젯 단추는 언제 눌러도
// «열고 앞으로 꺼내기»만 하고, 닫는 일은 캘린더 창의 접기 단추가 맡는다.

/** 브라우저 미리보기에서 window.open 으로 띄운 창. 설치본에서는 쓰지 않는다. */
let calendarPopup = null;

export async function openCalendarWindow() {
  if (inDesktopShell()) {
    try {
      await invoke('set_calendar_open', { open: true });
    } catch {}
    return;
  }
  // 브라우저 미리보기: 새 탭/창으로 띄운다.
  if (calendarPopup && !calendarPopup.closed) {
    calendarPopup.focus();
    return;
  }
  calendarPopup = window.open('/calendar.html', 'cool-calendar', 'width=980,height=720');
}

export async function closeCalendarWindow() {
  if (inDesktopShell()) {
    try {
      await invoke('set_calendar_open', { open: false });
    } catch {}
    return;
  }
  if (calendarPopup && !calendarPopup.closed) {
    calendarPopup.close();
    calendarPopup = null;
  } else {
    // 캘린더 창이 스스로 접기를 누른 경우 — 자기 자신을 닫는다.
    window.close();
  }
}

/**
 * 마감 알림을 화면 오른쪽 아래(윈도우 알림)로 띄운다.
 *
 * 설치본에서는 셸이 운영체제 알림으로 올린다 — 위젯이 가려져 있어도 보여야 한다.
 * 브라우저에서는 웹 알림으로 대신하고, 권한이 없으면 조용히 넘어간다.
 */
export async function showDeadlineNotification(title, body) {
  if (inDesktopShell()) {
    try {
      await invoke('notify_deadline', { title, body });
    } catch {}
    return;
  }
  try {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if (Notification.permission !== 'denied') {
      const granted = await Notification.requestPermission();
      if (granted === 'granted') new Notification(title, { body });
    }
  } catch {}
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
