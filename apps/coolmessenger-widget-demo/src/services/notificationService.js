// In-app notification bus. Deliberately centralizes the "is this kind of
// notification currently allowed?" check in ONE place (notify()) instead of
// scattering settings checks across every call site — that scatter is
// exactly how a "turn notifications off in settings and they still pop up"
// bug happens (some call site forgets to check). Every caller in the app
// should go through notify(); nothing should render a toast directly.

import { getAiSettings } from './localAiService';

let listeners = [];
let idCounter = 0;

export function subscribeNotifications(callback) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

// kind: 'newMessage' | 'deadline' | 'ai' | 'system'
// 'system' always shows (e.g. explicit user-triggered actions) — everything
// else is gated by the matching AI settings toggle.
export function notify({ kind = 'system', title, message, icon = null, onClick = null }) {
  const settings = getAiSettings();

  if (kind === 'newMessage' && !settings.autoNotifyNewMessage) return null;
  if (kind === 'deadline' && !settings.deadlineReminderEnabled) return null;
  // 'ai' and 'system' notifications aren't tied to a specific on/off switch.

  const toast = {
    id: 'ntf-' + Date.now() + '-' + (idCounter++),
    kind,
    title,
    message,
    icon,
    onClick,
    createdAt: Date.now(),
  };
  listeners.forEach((l) => l(toast));
  return toast;
}
