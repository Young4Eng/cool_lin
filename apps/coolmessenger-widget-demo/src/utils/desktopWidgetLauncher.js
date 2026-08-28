// Opens the standalone calendar widget as its own borderless-ish popup
// window, separate from the main CoolMessenger app window — this is what
// lets it behave like a small widget living on the teacher's desktop
// instead of a tab/window buried inside the app.

const WIDGET_WINDOW_NAME = 'coolCalendarWidget';

// 데스크톱(Tauri) 셸에서 돌고 있는가.
// 이 셸에서는 위젯 창이 tauri.conf.json 에 미리 선언돼 있어 window.open 이 필요 없다.
// 브라우저에서는 이 값이 false 라 아래 기존 경로가 그대로 쓰인다.
function inDesktopShell() {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export function openDesktopWidget() {
  if (inDesktopShell()) {
    // 미리 만들어 둔 'widget' 창을 보이게 하고 앞으로 가져온다.
    import('@tauri-apps/api/window')
      .then(({ Window }) => Window.getByLabel('widget'))
      .then(async (win) => {
        if (!win) return;
        await win.show();
        await win.unminimize();
        await win.setFocus();
      })
      .catch(() => {});
    // 호출부는 `!popup || popup.closed` 로 «팝업이 막혔나»를 본다 (App.jsx).
    // 데스크톱에서는 막힐 일이 없으므로 그 검사를 통과하는 값을 돌려준다.
    return { closed: false, desktopShell: true };
  }

  const width = 340;
  const height = 580;
  const left = Math.max(0, (window.screen?.availWidth || 1280) - width - 24);
  const top = 24;

  const features = [
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    'resizable=yes',
    'scrollbars=no',
    'status=no',
    'toolbar=no',
    'menubar=no',
    'location=no',
  ].join(',');

  const win = window.open('/widget.html', WIDGET_WINDOW_NAME, features);
  if (win) win.focus();
  return win;
}
