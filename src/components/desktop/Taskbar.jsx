import React, { useState, useEffect } from 'react';
import {
  Search, LayoutGrid, Folder, Calendar, MessageSquare,
  Sparkles, Bell, Wifi, Volume2, ShieldCheck, ChevronUp, MonitorUp
} from 'lucide-react';
import { PenguinIcon } from '../common/Icons';
import { openDesktopWidget } from '../../utils/desktopWidgetLauncher';

export default function Taskbar({
  activeWindows = {},
  unreadCount = 0,
  onToggleWindow,
  onOpenApp,
}) {
  const [currentTime, setCurrentTime] = useState({
    time: '오후 6:18',
    date: '2026-08-28'
  });
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const period = hours >= 12 ? '오후' : '오전';
      const formattedHour = hours % 12 === 0 ? 12 : hours % 12;
      
      setCurrentTime({
        time: `${period} ${formattedHour}:${minutes}`,
        date: '2026-08-28'
      });
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <footer className="fixed bottom-0 left-0 right-0 h-12 bg-white/80 backdrop-blur-xl border-t border-slate-300/80 z-[200] flex items-center justify-between px-3 select-none text-slate-800 shadow-win">
        {/* Left/Center Application Icons */}
        <div className="flex items-center gap-1">
          {/* Windows Start Button */}
          <button
            type="button"
            onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
            className="grid size-9 place-items-center rounded hover:bg-black/5 active:scale-95 transition-all"
            title="시작"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <rect x="0" y="0" width="8" height="8" fill="#f35325" />
              <rect x="10" y="0" width="8" height="8" fill="#81bc06" />
              <rect x="0" y="10" width="8" height="8" fill="#05a6f0" />
              <rect x="10" y="10" width="8" height="8" fill="#ffba08" />
            </svg>
          </button>

          {/* Search Button */}
          <button
            type="button"
            onClick={() => onOpenApp('messenger')}
            className="grid size-9 place-items-center rounded hover:bg-black/5 text-cool-600 transition-colors"
            title="검색"
          >
            <Search size={18} />
          </button>

          {/* Widgets Button (Schedule Widget Toggle) */}
          <button
            type="button"
            onClick={() => onToggleWindow('schedule')}
            className={`grid size-9 place-items-center rounded hover:bg-black/5 transition-all relative ${
              activeWindows.schedule?.isOpen ? 'bg-black/10' : ''
            }`}
            title="학사일정 & 캘린더 위젯"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <rect x="1" y="1" width="7" height="7" rx="1.5" fill="#1f6fe5" />
              <rect x="10" y="1" width="7" height="4" rx="1.5" fill="#5b9cff" />
              <rect x="10" y="7" width="7" height="4" rx="1.5" fill="#7fb3ff" />
              <rect x="1" y="10" width="7" height="7" rx="1.5" fill="#3b82f6" />
            </svg>
            {activeWindows.schedule?.isOpen && (
              <span className="absolute bottom-0.5 left-3 right-3 h-[2px] bg-cool-600 rounded-full" />
            )}
          </button>

          {/* File Explorer Icon */}
          <button
            type="button"
            onClick={() => onOpenApp('messageBox')}
            className="grid size-9 place-items-center rounded hover:bg-black/5"
            title="메시지 및 파일 탐색기"
          >
            <svg width="20" height="16" viewBox="0 0 20 16" aria-hidden="true">
              <path d="M0 3.5A2 2 0 0 1 2 1.5h5l2 2h9a2 2 0 0 1 2 2V13a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3.5z" fill="#f8c147" />
              <path d="M0 6h20v7a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6z" fill="#ffcd5e" />
            </svg>
          </button>

          {/* CoolMessenger Main Icon */}
          <button
            type="button"
            onClick={() => onToggleWindow('messenger')}
            className={`relative grid size-9 place-items-center rounded hover:bg-black/5 transition-all ${
              activeWindows.messenger?.isOpen ? 'bg-cool-100/80 shadow-2xs' : ''
            }`}
            title="CoolMessenger GENTOO"
          >
            <PenguinIcon size={24} />
            {activeWindows.messenger?.isOpen && (
              <span className="absolute bottom-0.5 left-2.5 right-2.5 h-[2px] bg-cool-600 rounded-full" />
            )}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white font-bold text-[9px] size-3.5 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* MessageBox Window Icon */}
          <button
            type="button"
            onClick={() => onToggleWindow('messageBox')}
            className={`relative grid size-9 place-items-center rounded hover:bg-black/5 transition-all ${
              activeWindows.messageBox?.isOpen ? 'bg-cool-100/80 shadow-2xs' : ''
            }`}
            title="메시지 관리함"
          >
            <MessageSquare size={19} className="text-cool-600" />
            {activeWindows.messageBox?.isOpen && (
              <span className="absolute bottom-0.5 left-2.5 right-2.5 h-[2px] bg-cool-600 rounded-full" />
            )}
          </button>

          {/* AI Assistant Icon */}
          <button
            type="button"
            onClick={() => onToggleWindow('aiAssistant')}
            className={`relative grid size-9 place-items-center rounded hover:bg-purple-100/80 text-purple-700 transition-all ${
              activeWindows.aiAssistant?.isOpen ? 'bg-purple-100 shadow-2xs' : ''
            }`}
            title="쿨-AI 스마트 비서"
          >
            <Sparkles size={19} className="animate-spin-slow" />
            {activeWindows.aiAssistant?.isOpen && (
              <span className="absolute bottom-0.5 left-2.5 right-2.5 h-[2px] bg-purple-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Right System Tray */}
        <div className="flex items-center gap-2.5 pr-1 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <button
              type="button"
              onClick={() => onOpenApp('messenger')}
              className="p-1 hover:bg-black/5 rounded"
              title="쿨메신저 트레이 (2-3 김서준 - 수신가능)"
            >
              <PenguinIcon size={16} />
            </button>
            <button
              type="button"
              onClick={() => openDesktopWidget()}
              className="p-1 hover:bg-black/5 rounded text-cool-700"
              title="캘린더 위젯을 바탕화면에 별도 창으로 띄우기"
            >
              <MonitorUp size={14} />
            </button>
            <Wifi size={14} className="text-slate-600" />
            <Volume2 size={14} className="text-slate-600" />
          </div>

          <div className="h-4 w-[1px] bg-slate-300 mx-0.5" />

          <span className="text-[12px] font-semibold text-slate-700">가</span>

          <div
            onClick={() => onToggleWindow('schedule')}
            className="text-right text-[11px] leading-tight text-slate-800 tabular-nums cursor-pointer hover:bg-black/5 px-1.5 py-1 rounded transition-colors"
            title="달력 및 일정 보기"
          >
            <div>{currentTime.time}</div>
            <div className="text-[10px] text-slate-500">{currentTime.date}</div>
          </div>
        </div>
      </footer>

      {/* Start Menu Overlay */}
      {isStartMenuOpen && (
        <div
          onClick={() => setIsStartMenuOpen(false)}
          className="fixed inset-0 z-[190]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-14 left-3 w-80 bg-white/95 backdrop-blur-xl rounded-xl border border-slate-300 shadow-2xl p-4 animate-scale-up select-none font-sans text-xs"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="bg-cool-100 p-1.5 rounded-full ring-2 ring-cool-300">
                <PenguinIcon size={36} variant="avatar" />
              </div>
              <div>
                <div className="font-bold text-[13px] text-slate-900">김서준 선생님</div>
                <div className="text-[11px] text-slate-500">한빛중학교 2학년 3반 담임 (내선 132)</div>
              </div>
            </div>

            <div className="py-3 space-y-1">
              <div className="text-[10.5px] font-semibold text-slate-400 px-2 uppercase tracking-wider mb-1">
                고정된 교무 앱
              </div>
              <button
                type="button"
                onClick={() => { onOpenApp('messenger'); setIsStartMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-cool-50 text-slate-800 font-medium transition-colors"
              >
                <PenguinIcon size={20} />
                <span>CoolMessenger GENTOO</span>
              </button>
              <button
                type="button"
                onClick={() => { onOpenApp('messageBox'); setIsStartMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-cool-50 text-slate-800 font-medium transition-colors"
              >
                <MessageSquare size={18} className="text-cool-600" />
                <span>메시지 관리함</span>
              </button>
              <button
                type="button"
                onClick={() => { onOpenApp('schedule'); setIsStartMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-cool-50 text-slate-800 font-medium transition-colors"
              >
                <Calendar size={18} className="text-blue-600" />
                <span>학사일정 & 캘린더 위젯</span>
              </button>
              <button
                type="button"
                onClick={() => { onOpenApp('aiAssistant'); setIsStartMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-purple-50 text-purple-800 font-medium transition-colors"
              >
                <Sparkles size={18} className="text-purple-600" />
                <span>Cool-AI 스마트 비서</span>
              </button>
              <button
                type="button"
                onClick={() => { openDesktopWidget(); setIsStartMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-cool-50 text-slate-800 font-medium transition-colors"
              >
                <MonitorUp size={18} className="text-cool-600" />
                <span>캘린더 위젯 바탕화면에 띄우기</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
