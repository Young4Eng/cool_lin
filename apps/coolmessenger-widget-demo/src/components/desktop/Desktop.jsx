import React from 'react';
import { PenguinIcon } from '../common/Icons';

export default function Desktop({
  onOpenApp,
  children
}) {
  const desktopIcons = [
    {
      id: 'my-pc',
      label: '내 PC',
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
          <rect x="4" y="6" width="32" height="22" rx="2" fill="#1f6fe5" />
          <rect x="6" y="8" width="28" height="16" fill="#dbeafe" />
          <rect x="16" y="28" width="8" height="3" fill="#cbd5e1" />
          <rect x="10" y="31" width="20" height="2.5" rx="1" fill="#94a3b8" />
        </svg>
      ),
      action: () => onOpenApp('messageBox')
    },
    {
      id: 'trash',
      label: '휴지통',
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
          <rect x="12" y="10" width="16" height="22" rx="1" fill="#94a3b8" />
          <rect x="10" y="8" width="20" height="4" rx="1" fill="#64748b" />
          <path d="M16 16v12M20 16v12M24 16v12" stroke="#e2e8f0" strokeWidth="1.5" />
        </svg>
      ),
      action: () => onOpenApp('messageBox')
    },
    {
      id: 'school-folder',
      label: '한빛중학교',
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
          <path d="M6 14h12l3 3h13v16H6V14z" fill="#fbbf24" />
          <path d="M6 17h28v16H6z" fill="#f59e0b" />
        </svg>
      ),
      action: () => onOpenApp('messenger')
    },
    {
      id: 'cool-messenger',
      label: '쿨메신저',
      icon: <PenguinIcon size={40} />,
      action: () => onOpenApp('messenger')
    },
    {
      id: 'class-material',
      label: '수업자료',
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
          <path d="M6 14h12l3 3h13v16H6V14z" fill="#fbbf24" />
          <path d="M6 17h28v16H6z" fill="#f59e0b" />
        </svg>
      ),
      action: () => onOpenApp('messageBox')
    },
    {
      id: 'grade',
      label: '성적',
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
          <path d="M12 4h12l8 8v22a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#fff" />
          <path d="M24 4v8h8" fill="#e2e8f0" />
          <path d="M24 4l8 8" stroke="#cbd5e1" />
          <path d="M15 20h14M15 25h10" stroke="#3b82f6" strokeWidth="1.6" />
        </svg>
      ),
      action: () => onOpenApp('messageBox')
    },
    {
      id: 'home-letter',
      label: '가정통신문',
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
          <path d="M6 14h12l3 3h13v16H6V14z" fill="#fbbf24" />
          <path d="M6 17h28v16H6z" fill="#f59e0b" />
        </svg>
      ),
      action: () => onOpenApp('messageBox')
    },
    {
      id: 'neis',
      label: '나이스',
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
          <rect width="40" height="40" rx="8" fill="#0f766e" />
          <text x="20" y="25" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">NEIS</text>
        </svg>
      ),
      action: () => onOpenApp('messageBox')
    },
    {
      id: 'schedule-icon',
      label: '학사일정',
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
          <rect x="6" y="8" width="28" height="26" rx="3" fill="#fff" />
          <rect x="6" y="8" width="28" height="8" fill="#e11d48" />
          <text x="20" y="28" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1f2937">28</text>
        </svg>
      ),
      action: () => onOpenApp('schedule')
    },
    {
      id: 'ai-assistant-icon',
      label: '쿨-AI 비서',
      icon: (
        <div className="size-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md">
          <span className="text-sm font-bold tracking-tight">AI</span>
        </div>
      ),
      action: () => onOpenApp('aiAssistant')
    }
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-cover bg-center"
      style={{
        backgroundImage: `radial-gradient(ellipse at top, #3b82f6 0%, #1e3a8a 40%, #0f172a 100%), 
                          url('https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1920&q=80')`,
        backgroundBlendMode: 'soft-light'
      }}
    >
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      {/* Desktop Icons Grid (Top-Left) */}
      <div className="absolute top-3 left-3 z-[10] grid auto-rows-min grid-cols-2 sm:grid-cols-1 gap-x-4 gap-y-3">
        {desktopIcons.map((item) => (
          <button
            key={item.id}
            type="button"
            onDoubleClick={item.action}
            onClick={(e) => {
              // Single click selection style
              e.currentTarget.focus();
            }}
            className="flex w-[76px] flex-col items-center gap-1 rounded-sm p-1 hover:bg-white/20 active:bg-white/30 focus:bg-white/25 focus:ring-1 focus:ring-white/40 transition-all outline-none"
          >
            {item.icon}
            <span className="desk-icon-label">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Render Open Windows */}
      {children}
    </div>
  );
}
