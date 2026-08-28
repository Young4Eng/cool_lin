import React, { useState } from 'react';
import { Users, Inbox, Calendar, Sparkles, ChevronLeft, Star, Paperclip } from 'lucide-react';
import { PenguinIcon, UserStatusIcon } from '../common/Icons';
import OrgTree from '../messenger/OrgTree';
import MessageDetail from '../messageBox/MessageDetail';
import MiniCalendar from '../scheduleWidget/MiniCalendar';
import EventList from '../scheduleWidget/EventList';
import TodoList from '../scheduleWidget/TodoList';
import { SCHOOL_MEMBERS, CURRENT_USER } from '../../data/initialData';

// A from-scratch mobile layout, not a squeezed copy of the desktop window
// manager — floating draggable windows don't translate to a phone screen,
// so this reuses the same underlying list/detail/calendar components in a
// single full-screen, bottom-tab-bar shell instead.
// ("쿨메신저 집에서도 볼 수 있게" → responsive web, opened from any phone
// browser; a true native app is a different, much bigger project.)
export default function MobileShell({
  messages,
  events,
  todos,
  onOpenCompose,
  onOpenChat,
  onAddEventToSchedule,
  onApproveEvent,
  onDeleteEvent,
  onToggleTodo,
  onAddTodo,
  onDeleteTodo,
  onDeleteMessage,
  onToggleStar,
  onArchiveMessage,
  onUnarchiveMessage,
  onMarkUnread,
  onOpenComposeReply,
}) {
  const [tab, setTab] = useState('org'); // 'org' | 'inbox' | 'calendar' | 'ai'
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [calendarTab, setCalendarTab] = useState('calendar');

  const memberMap = Object.fromEntries(SCHOOL_MEMBERS.map(m => [m.id, m]));
  const inboxMessages = messages.filter(m => m.folder === 'inbox');
  const selectedMessage = messages.find(m => m.id === selectedMessageId);
  const unreadCount = inboxMessages.filter(m => m.unread).length;

  const needsReview = (e) => e.fromAi && e.autoRegisterEligible === false && !e.reviewed;
  const reviewEvents = events.filter(needsReview);
  const calendarEvents = events.filter(e => !needsReview(e));

  return (
    <div className="h-screen w-screen flex flex-col bg-white font-sans text-sm overflow-hidden">
      {/* Top bar */}
      <div className="cool-gradient-blue text-white px-3 py-2.5 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          <PenguinIcon size={22} />
          <span className="font-bold text-[14px]">CoolMessenger</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <UserStatusIcon status={CURRENT_USER.status} size={14} />
          <span>{CURRENT_USER.avatarText}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {tab === 'org' && (
          <OrgTree
            searchQuery=""
            selectedMemberIds={[]}
            onToggleSelectMember={() => {}}
            onOpenChat={onOpenChat}
            onOpenCompose={(ids) => onOpenCompose(ids)}
          />
        )}

        {tab === 'inbox' && (
          selectedMessage ? (
            <div className="h-full flex flex-col min-h-0">
              <button
                type="button"
                onClick={() => setSelectedMessageId(null)}
                className="flex items-center gap-1 px-3 py-2 text-cool-700 font-semibold text-[12.5px] border-b border-slate-200 shrink-0"
              >
                <ChevronLeft size={16} /> 목록으로
              </button>
              <div className="flex-1 min-h-0">
                <MessageDetail
                  message={selectedMessage}
                  sender={memberMap[selectedMessage.fromId]}
                  onAddEventToSchedule={onAddEventToSchedule}
                  onOpenComposeReply={onOpenComposeReply}
                  onDeleteMessage={(id) => { onDeleteMessage(id); setSelectedMessageId(null); }}
                  onArchiveMessage={onArchiveMessage}
                  onUnarchiveMessage={onUnarchiveMessage}
                  onMarkUnread={onMarkUnread}
                />
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto divide-y divide-slate-100">
              {inboxMessages.map(msg => {
                const sender = memberMap[msg.fromId];
                return (
                  <button
                    key={msg.id}
                    type="button"
                    onClick={() => setSelectedMessageId(msg.id)}
                    className={`w-full text-left px-3 py-3 flex items-start gap-2 ${msg.unread ? 'bg-blue-50/50' : ''}`}
                  >
                    <Star size={14} className={msg.starred ? 'fill-amber-400 text-amber-400 mt-0.5 shrink-0' : 'text-slate-300 mt-0.5 shrink-0'} />
                    <div className="min-w-0 flex-1">
                      <div className={`text-[12.5px] truncate ${msg.unread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {msg.subject}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {sender ? sender.name : '교직원'} · {msg.dateLabel}
                      </div>
                    </div>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <Paperclip size={12} className="text-slate-400 mt-1 shrink-0" />
                    )}
                  </button>
                );
              })}
              {inboxMessages.length === 0 && (
                <div className="text-center py-16 text-slate-400 text-xs">받은 메시지가 없습니다.</div>
              )}
            </div>
          )
        )}

        {tab === 'calendar' && (
          <div className="h-full flex flex-col min-h-0">
            <div className="flex items-center gap-1 px-2 pt-2 shrink-0">
              {[
                { id: 'calendar', label: '캘린더' },
                { id: 'review', label: `검토함 (${reviewEvents.length})` },
                { id: 'todo', label: '할 일' },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setCalendarTab(t.id)}
                  className={`px-3 py-1.5 rounded-t-md text-[12px] font-bold ${
                    calendarTab === t.id ? 'bg-cool-100 text-cool-800' : 'text-slate-500'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5">
              {calendarTab === 'calendar' && (
                <>
                  <MiniCalendar events={calendarEvents} selectedDate={null} onSelectDate={() => {}} />
                  <EventList events={calendarEvents} selectedDate={null} onDeleteEvent={onDeleteEvent} mode="calendar" />
                </>
              )}
              {calendarTab === 'review' && (
                <EventList events={reviewEvents} selectedDate={null} onDeleteEvent={onDeleteEvent} onApproveEvent={onApproveEvent} mode="review" />
              )}
              {calendarTab === 'todo' && (
                <TodoList todos={todos} onToggleTodo={onToggleTodo} onAddTodo={onAddTodo} onDeleteTodo={onDeleteTodo} />
              )}
            </div>
          </div>
        )}

        {tab === 'ai' && (
          <div className="h-full overflow-y-auto p-3 space-y-3">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl p-3 shadow-md">
              <div className="font-bold text-[13px] flex items-center gap-1.5">
                <Sparkles size={15} className="text-amber-300" /> Cool-AI 스마트 비서
              </div>
              <p className="text-[11.5px] text-purple-100 mt-1">
                온디바이스 로컬 AI가 쪽지에서 일정을 자동으로 정리하고 있습니다. 자세한 대화·브리핑은 PC에서 이용해주세요 — 폰에서는 요약만 빠르게 확인하는 용도입니다.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3">
              <div className="font-bold text-slate-800 text-[12.5px] mb-2">오늘의 요약</div>
              <div className="text-[11.5px] text-slate-600 space-y-1">
                <div>📨 안 읽은 쪽지 {unreadCount}건</div>
                <div>📅 캘린더 등록 일정 {calendarEvents.length}건</div>
                <div>🕵️ 검토 필요 일정 {reviewEvents.length}건</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom tab bar */}
      <div className="flex items-stretch border-t border-slate-200 bg-white shrink-0 select-none">
        {[
          { id: 'org', label: '조직도', icon: Users },
          { id: 'inbox', label: '쪽지', icon: Inbox, badge: unreadCount },
          { id: 'calendar', label: '캘린더', icon: Calendar },
          { id: 'ai', label: 'AI', icon: Sparkles },
        ].map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => { setTab(t.id); setSelectedMessageId(null); }}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 relative ${active ? 'text-cool-600' : 'text-slate-400'}`}
            >
              <Icon size={19} />
              <span className="text-[10px] font-medium">{t.label}</span>
              {!!t.badge && (
                <span className="absolute top-1 right-1/4 bg-red-500 text-white text-[9px] font-bold size-3.5 rounded-full flex items-center justify-center">
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
