// Persisted "open the desktop calendar widget automatically" preference.
//
// Note on what "automatic" can actually mean from a web app: a browser
// will only let JS call window.open() without the user clicking something
// if the user has previously allowed pop-ups for this site. Once that's
// granted (one-time, in the browser's site settings), window.open() calls
// made right when the app loads succeed with no click — which is what
// lets the widget reappear on its own the next time a teacher opens
// CoolMessenger (e.g. after the PC restarts and they reopen the app/tab).
// If pop-ups are still blocked, the browser silently drops the call, so
// App.jsx checks the return value and shows a one-time hint instead of
// failing silently.

const KEY = 'cool_widget_autostart_v1';

export function getWidgetAutoStart() {
  try {
    const raw = localStorage.getItem(KEY);
    // Default ON — most teachers want the widget to just be there.
    return raw === null ? true : raw === 'true';
  } catch (e) {
    return true;
  }
}

export function setWidgetAutoStart(enabled) {
  try {
    localStorage.setItem(KEY, String(enabled));
  } catch (e) {}
}
