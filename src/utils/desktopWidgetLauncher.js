// Opens the standalone calendar widget as its own borderless-ish popup
// window, separate from the main CoolMessenger app window — this is what
// lets it behave like a small widget living on the teacher's desktop
// instead of a tab/window buried inside the app.

const WIDGET_WINDOW_NAME = 'coolCalendarWidget';

export function openDesktopWidget() {
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
