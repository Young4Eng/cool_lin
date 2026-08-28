import React, { useEffect, useState, useCallback } from 'react';
import { Bell, Sparkles, AlarmClock, MessageSquare, X } from 'lucide-react';
import { subscribeNotifications } from '../../services/notificationService';

const ICONS = {
  newMessage: MessageSquare,
  deadline: AlarmClock,
  ai: Sparkles,
  system: Bell,
};

const AUTO_DISMISS_MS = 6000;

// Renders every notify() call as a stacked toast, top-right of the screen.
// Mount this once near the root (App.jsx) so it's available everywhere.
export default function NotificationCenter() {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    return subscribeNotifications((toast) => {
      setToasts((prev) => [toast, ...prev].slice(0, 5));
      setTimeout(() => dismiss(toast.id), AUTO_DISMISS_MS);
    });
  }, [dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-3 right-3 z-[250] flex flex-col gap-2 w-[320px] max-w-[90vw] select-none">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.kind] || Bell;
        return (
          <div
            key={toast.id}
            onClick={() => {
              toast.onClick && toast.onClick();
              dismiss(toast.id);
            }}
            className={`bg-white border border-slate-200 rounded-xl shadow-win p-3 flex items-start gap-2.5 animate-widget-toast-in ${
              toast.onClick ? 'cursor-pointer hover:border-cool-300' : ''
            }`}
          >
            <div className="bg-cool-50 text-cool-600 p-1.5 rounded-lg shrink-0">
              <Icon size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-800 text-[12px] leading-tight">{toast.title}</div>
              {toast.message && (
                <div className="text-slate-600 text-[11px] leading-snug mt-0.5">{toast.message}</div>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); dismiss(toast.id); }}
              className="text-slate-300 hover:text-slate-600 shrink-0"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
