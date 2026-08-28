// Sync bridge between the main CoolMessenger app window and the standalone
// desktop calendar widget window (opened separately via window.open).
//
// Two channels are used together so the widget behaves like a real,
// always-live PC widget rather than a page that needs a manual refresh:
//
// 1. localStorage + the native `storage` event — the browser fires this
//    automatically in every OTHER same-origin window/tab whenever
//    localStorage changes here. This is what keeps events/todos in sync
//    in both directions (main window <-> widget window), with no server.
// 2. BroadcastChannel — an instant, same-origin pub/sub channel used only
//    to push a lightweight "AI just organized a new schedule item" nudge
//    so the widget can show a toast the moment the local AI finishes,
//    instead of waiting on the user to notice the calendar changed.

export const WIDGET_SYNC_CHANNEL = 'cool_widget_sync_v1';

let channel = null;
function getChannel() {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return null;
  if (!channel) {
    try {
      channel = new BroadcastChannel(WIDGET_SYNC_CHANNEL);
    } catch (e) {
      channel = null;
    }
  }
  return channel;
}

// Called from the main app right after the local AI adds an event.
export function notifyAiEventAdded(event) {
  const ch = getChannel();
  if (!ch) return;
  try {
    ch.postMessage({ type: 'ai-event-added', event, at: Date.now() });
  } catch (e) {
    // ignore — falls back silently to the storage-event sync path
  }
}

// Subscribe to AI-added-event nudges. Returns an unsubscribe function.
export function subscribeAiEventAdded(callback) {
  const ch = getChannel();
  if (!ch) return () => {};
  const handler = (msg) => {
    if (msg?.data?.type === 'ai-event-added') callback(msg.data.event);
  };
  ch.addEventListener('message', handler);
  return () => ch.removeEventListener('message', handler);
}
