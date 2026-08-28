import React, { useState } from 'react';
import {
  HelpCircle, Settings, Calendar, MessageSquare, Save,
  Search, ChevronDown, Sparkles, Send, AlarmClock, Users2
} from 'lucide-react';
import { PenguinIcon, UserStatusIcon } from '../common/Icons';
import OrgTree from './OrgTree';
import { CURRENT_USER } from '../../data/initialData';

export default function CoolMessengerMain({
  isOpen,
  isMinimized,
  zIndex,
  onFocus,
  onMinimize,
  onMaximize,
  onClose,
  unreadCount = 0,
  events = [],
  onOpenMessageBox,
  onOpenScheduleWidget,
  onOpenAiAssistant,
  onOpenAiSettings,
  onOpenChat,
  onOpenCompose,
  onOpenDownloadModal,
  onOpenGroupChat,
}) {
  const [activeTab, setActiveTab] = useState('org'); // 'org' | 'notice' | 'survey' | 'memo' | 'link' | 'schedule' | 'talk' | 'sms'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [userStatus, setUserStatus] = useState(CURRENT_USER.status);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  if (!isOpen || isMinimized) return null;

  // Soonest upcoming (not-yet-past) deadline, for the inline strip at the
  // bottom of the messenger window.
  const nowStr = '2026-08-28';
  const upcomingDeadline = [...events]
    .filter(e => e.date >= nowStr && !(e.fromAi && e.autoRegisterEligible === false && !e.reviewed))
    .sort((a, b) => `${a.date} ${a.time || '00:00'}`.localeCompare(`${b.date} ${b.time || '00:00'}`))[0] || null;

  const tabs = [
    { id: 'org', label: '조직도' },
    { id: 'notice', label: '공지' },
    { id: 'survey', label: '설문' },
    { id: 'memo', label: '메모' },
    { id: 'link', label: '링크' },
    { id: 'schedule', label: '학사일정' },
    { id: 'talk', label: '쿨알림톡' },
    { id: 'sms', label: '문자' },
  ];

  const handleToggleSelectMember = (memberId, explicitState) => {
    setSelectedMemberIds(prev => {
      if (explicitState === true) {
        return prev.includes(memberId) ? prev : [...prev, memberId];
      }
      if (explicitState === false) {
        return prev.filter(id => id !== memberId);
      }
      return prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId];
    });
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'online': return '수신가능';
      case 'busy': return '다른용무중';
      case 'away': return '자리비움';
      case 'offline': return '로그아웃';
      default: return '수신가능';
    }
  };

  return (
    <div
      onMouseDown={onFocus}
      style={{ zIndex, left: 300, top: 40, width: 340, height: 680 }}
      className="fixed flex flex-col bg-white rounded-lg shadow-win-active border border-slate-300 overflow-hidden font-sans select-none"
    >
      {/* 1. Titlebar (CoolMessenger GENTOO) */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white border-b border-slate-200 text-xs text-slate-700">
        <div className="flex items-center gap-1.5 font-semibold text-[13px] tracking-tight">
          <PenguinIcon size={18} />
          <span>CoolMessenger GENTOO</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenAiSettings}
            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-cool-600"
            title="AI 및 메신저 환경설정"
          >
            <Settings size={14} />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-slate-100 rounded text-slate-500"
            title="도움말"
          >
            <HelpCircle size={14} />
          </button>
          <button
            type="button"
            onClick={onMinimize}
            className="p-1 hover:bg-slate-100 rounded text-slate-500"
            title="최소화"
          >
            <span className="inline-block w-2.5 h-[1.5px] bg-slate-600 mb-1" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-red-500 hover:text-white rounded text-slate-500"
            title="닫기"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 2. Blue Profile Header Bar (#4aa8dc style) */}
      <div className="bg-gradient-to-b from-[#4da8dc] to-[#3492ca] text-white px-3.5 py-3 relative">
        <div className="flex items-center justify-between">
          {/* Avatar & Profile */}
          <div className="flex items-center gap-2.5">
            <div className="bg-white/20 p-1 rounded-full shadow-inner ring-2 ring-white/30">
              <PenguinIcon size={44} variant="avatar" />
            </div>
            <div>
              <div className="text-[17px] font-bold tracking-tight text-white drop-shadow-sm flex items-center gap-1.5">
                <span>{CURRENT_USER.avatarText}</span>
                <span className="text-xs font-normal opacity-90">({CURRENT_USER.name})</span>
              </div>
              <div className="relative mt-0.5">
                <button
                  type="button"
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="flex items-center gap-1 bg-black/15 hover:bg-black/25 px-2 py-0.5 rounded text-[11px] text-white/95 transition-colors"
                >
                  <span className={`size-1.5 rounded-full ${userStatus === 'online' ? 'bg-green-400' : 'bg-amber-400'}`} />
                  <span>{getStatusLabel(userStatus)}</span>
                  <ChevronDown size={11} />
                </button>

                {isStatusDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1 w-28 bg-white rounded shadow-lg border border-slate-200 py-1 text-slate-800 text-xs z-50">
                    <button
                      onClick={() => { setUserStatus('online'); setIsStatusDropdownOpen(false); }}
                      className="w-full text-left px-3 py-1 hover:bg-cool-50 flex items-center gap-2"
                    >
                      <span className="size-2 rounded-full bg-green-500" /> 수신가능
                    </button>
                    <button
                      onClick={() => { setUserStatus('away'); setIsStatusDropdownOpen(false); }}
                      className="w-full text-left px-3 py-1 hover:bg-cool-50 flex items-center gap-2"
                    >
                      <span className="size-2 rounded-full bg-amber-500" /> 자리비움
                    </button>
                    <button
                      onClick={() => { setUserStatus('busy'); setIsStatusDropdownOpen(false); }}
                      className="w-full text-left px-3 py-1 hover:bg-cool-50 flex items-center gap-2"
                    >
                      <span className="size-2 rounded-full bg-rose-500" /> 다른용무중
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Header Action Icons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenAiAssistant}
              className="relative p-1.5 hover:bg-white/20 rounded-md transition-all text-amber-200 hover:text-white"
              title="쿨-AI 스마트 비서 & 브리핑"
            >
              <Sparkles size={18} className="animate-pulse" />
            </button>
            <button
              type="button"
              onClick={onOpenScheduleWidget}
              className="p-1.5 hover:bg-white/20 rounded-md transition-colors text-white"
              title="일정 관리 위젯 열기"
            >
              <Calendar size={18} />
            </button>
            <button
              type="button"
              onClick={onOpenMessageBox}
              className="relative p-1.5 hover:bg-white/20 rounded-md transition-colors text-white"
              title="메시지 관리함 열기"
            >
              <MessageSquare size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[10px] size-4 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={onOpenDownloadModal}
              className="p-1.5 hover:bg-white/20 rounded-md transition-colors text-white"
              title="메시지 백업/다운로드"
            >
              <Save size={18} />
            </button>
            {onOpenGroupChat && (
              <button
                type="button"
                onClick={onOpenGroupChat}
                className="p-1.5 hover:bg-white/20 rounded-md transition-colors text-white"
                title="여러 명 실시간 그룹 채팅"
              >
                <Users2 size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Search & View Control Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-2 py-1.5 flex items-center gap-1.5 text-xs">
        <select className="bg-white border border-slate-300 rounded px-1 py-1 text-[11px] text-slate-700 outline-none">
          <option>조직도</option>
          <option>즐겨찾기</option>
          <option>그룹</option>
        </select>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="이름(아이디) 또는 그룹명 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded pl-2 pr-6 py-1 text-[11px] text-slate-800 placeholder-slate-400 outline-none focus:border-cool-500"
          />
          <Search size={13} className="absolute right-2 top-2 text-slate-400" />
        </div>
        <select className="bg-white border border-slate-300 rounded px-1 py-1 text-[11px] text-slate-700 outline-none">
          <option>정렬</option>
          <option>직급순</option>
          <option>이름순</option>
          <option>상태순</option>
        </select>
      </div>

      {/* 4. Main Body: Left Vertical Tabs + Right Org Tree */}
      <div className="flex-1 flex min-h-0 bg-white">
        {/* Left Vertical Tabs */}
        <div className="w-[74px] bg-[#edf3f8] border-r border-slate-200 flex flex-col py-1 select-none shrink-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'schedule') onOpenScheduleWidget();
                }}
                className={`py-2 px-1 text-center text-[11.5px] transition-all relative ${
                  isActive
                    ? 'bg-white text-cool-700 font-bold border-y border-slate-200 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-cool-500" />
                )}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          <OrgTree
            searchQuery={searchQuery}
            selectedMemberIds={selectedMemberIds}
            onToggleSelectMember={handleToggleSelectMember}
            onOpenChat={onOpenChat}
            onOpenCompose={onOpenCompose}
          />

          {/* Floating Action Button for Selected Members */}
          {selectedMemberIds.length > 0 && (
            <div className="absolute bottom-2 left-2 right-2 bg-cool-600 text-white rounded-md shadow-lg p-2 flex items-center justify-between text-xs animate-fade-in">
              <span className="font-medium">{selectedMemberIds.length}명 선택됨</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onOpenCompose(selectedMemberIds)}
                  className="bg-white text-cool-700 px-2.5 py-1 rounded font-semibold text-[11px] hover:bg-cool-50 flex items-center gap-1"
                >
                  <Send size={11} /> 쪽지 보내기
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMemberIds([])}
                  className="text-white/80 hover:text-white px-1 py-0.5 text-[10.5px]"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Upcoming Deadline Strip — 메신저 안에서 바로 마감 확인
          ("메신저에 달력 연동 + 마감 기한이 표시돼 보이게") */}
      {upcomingDeadline ? (
        <button
          type="button"
          onClick={onOpenScheduleWidget}
          className="bg-rose-50 hover:bg-rose-100 border-t border-rose-200 px-3 py-1.5 flex items-center justify-between text-[11px] text-rose-800 transition-colors text-left"
        >
          <div className="flex items-center gap-1.5 truncate flex-1">
            <AlarmClock size={13} className="text-rose-500 shrink-0" />
            <span className="font-bold shrink-0">다가오는 마감</span>
            <span className="truncate">{upcomingDeadline.title} · {upcomingDeadline.date} {upcomingDeadline.time}</span>
          </div>
          <span className="text-[10px] font-semibold text-rose-500 shrink-0 ml-2">캘린더 열기 ›</span>
        </button>
      ) : (
        <div className="bg-[#fdfde8] border-t border-[#f0eebc] px-3 py-1.5 flex items-center justify-between text-[11px] text-[#786c12]">
          <div className="truncate flex-1 font-medium">
            <span className="text-[#107040] font-bold mr-1.5">한빛중 연구부</span>
            <span>9월 창의활동, 이렇게 준비 끝!</span>
          </div>
          <span className="text-[10px] text-slate-400 shrink-0 ml-2">광고 · 모의</span>
        </div>
      )}
    </div>
  );
}
