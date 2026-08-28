import React, { useEffect, useState } from 'react';
import { Calendar, CheckSquare, Sparkles, RefreshCw, Radio, ClipboardCheck } from 'lucide-react';
import MiniCalendar from '../scheduleWidget/MiniCalendar';
import EventList from '../scheduleWidget/EventList';
import TodoList from '../scheduleWidget/TodoList';
import { PenguinIcon } from '../common/Icons';
import {
  loadStoredSchedule, saveStoredSchedule,
  loadStoredTodos, saveStoredTodos,
} from '../../services/storageService';
import { subscribeAiEventAdded } from '../../utils/widgetSync';

// Same review-eligibility rule as ScheduleWidget.jsx — kept in sync manually
// since this file renders in a fully separate popup window/bundle.
function needsReview(event) {
  return event.fromAi && event.autoRegisterEligible === false && !event.reviewed;
}

// Standalone desktop widget — rendered into its own popup window
// (widget.html / widget-main.jsx), separate from the main CoolMessenger
// virtual-desktop window. It reads/writes the SAME localStorage keys as
// the main app, so any schedule the local AI extracts from a 쪽지 in the
// main window shows up here automatically (via the `storage` event), and
// anything the teacher does here (check off a todo, delete an event)
// flows back to the main app the same way.

export default function DesktopCalendarWidget() {
  const [events, setEvents] = useState(loadStoredSchedule);
  const [todos, setTodos] = useState(loadStoredTodos);
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(null);
  const [now, setNow] = useState(new Date());
  const [lastSyncedAt, setLastSyncedAt] = useState(new Date());
  const [aiToast, setAiToast] = useState(null);

  // Live clock, widget-style
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  // Cross-window sync: main app window <-> this widget window.
  // The `storage` event fires here automatically whenever the OTHER
  // same-origin window writes to localStorage (and vice versa) — no
  // server, no polling needed.
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'cool_schedule_v1') {
        setEvents(loadStoredSchedule());
        setLastSyncedAt(new Date());
      }
      if (e.key === 'cool_todos_v1') {
        setTodos(loadStoredTodos());
        setLastSyncedAt(new Date());
      }
    };
    window.addEventListener('storage', handleStorage);
    // Also re-check on focus, in case events fired while the window was backgrounded
    const handleFocus = () => {
      setEvents(loadStoredSchedule());
      setTodos(loadStoredTodos());
      setLastSyncedAt(new Date());
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Instant "AI just organized a schedule" nudge (separate from the
  // storage-event sync above, which still runs and keeps data correct
  // even if this channel is unavailable).
  useEffect(() => {
    return subscribeAiEventAdded((event) => {
      setEvents(loadStoredSchedule());
      setLastSyncedAt(new Date());
      setAiToast(event);
      const timer = setTimeout(() => setAiToast(null), 6000);
      return () => clearTimeout(timer);
    });
  }, []);

  const persistEvents = (next) => {
    setEvents(next);
    saveStoredSchedule(next);
    setLastSyncedAt(new Date());
  };
  const persistTodos = (next) => {
    setTodos(next);
    saveStoredTodos(next);
    setLastSyncedAt(new Date());
  };

  const handleDeleteEvent = (id) => persistEvents(events.filter(e => e.id !== id));
  const handleApproveEvent = (id) =>
    persistEvents(events.map(e => (e.id === id ? { ...e, reviewed: true } : e)));
  const handleToggleTodo = (id) =>
    persistTodos(todos.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  const handleAddTodo = (newTodo) => persistTodos([newTodo, ...todos]);
  const handleDeleteTodo = (id) => persistTodos(todos.filter(t => t.id !== id));

  const handleManualRefresh = () => {
    setEvents(loadStoredSchedule());
    setTodos(loadStoredTodos());
    setLastSyncedAt(new Date());
  };

  const timeLabel = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  const syncedLabel = lastSyncedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const reviewEvents = events.filter(needsReview);
  const calendarEvents = events.filter(e => !needsReview(e));

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 font-sans text-xs overflow-hidden">
      {/* Widget "card" — fills the popup window to read as a standalone widget */}
      <div className="flex-1 flex flex-col min-h-0 bg-white shadow-widget">
        {/* Header */}
        <div className="cool-gradient-blue text-white px-3 py-2.5 flex items-center justify-between select-none shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-xs shrink-0">
              <Calendar size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-[13px] leading-tight truncate">쿨린 캘린더 위젯</div>
              <div className="flex items-center gap-1 text-[10px] text-sky-100">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse-slow shrink-0" />
                <span>쿨메신저 실시간 연동 중</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[13px] font-bold tabular-nums">{timeLabel}</span>
            <button
              type="button"
              onClick={handleManualRefresh}
              className="p-1 hover:bg-white/20 rounded text-white"
              title="지금 새로고침"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* AI new-event toast */}
        {aiToast && (
          <div className="mx-2 mt-2 shrink-0 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg px-2.5 py-2 shadow-md flex items-start gap-2 animate-widget-toast-in">
            <Sparkles size={14} className="text-amber-300 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <div className="font-bold text-[11px]">AI가 새 일정을 정리했습니다</div>
              <div className="text-[10.5px] text-purple-100 truncate">{aiToast.title}</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-2 pt-1.5 flex items-center gap-1 text-xs select-none shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-1.5 font-bold rounded-t-md transition-colors flex items-center gap-1 ${
              activeTab === 'calendar'
                ? 'bg-white text-cool-700 shadow-2xs border-t-2 border-cool-600'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Calendar size={13} /> 캘린더·일정
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('review')}
            className={`relative px-3 py-1.5 font-bold rounded-t-md transition-colors flex items-center gap-1 ${
              activeTab === 'review'
                ? 'bg-white text-amber-700 shadow-2xs border-t-2 border-amber-500'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <ClipboardCheck size={13} /> 검토함
            {reviewEvents.length > 0 && (
              <span className="bg-amber-500 text-white text-[9.5px] font-bold size-3.5 rounded-full flex items-center justify-center">
                {reviewEvents.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('todo')}
            className={`px-3 py-1.5 font-bold rounded-t-md transition-colors flex items-center gap-1 ${
              activeTab === 'todo'
                ? 'bg-white text-cool-700 shadow-2xs border-t-2 border-cool-600'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <CheckSquare size={13} /> 할 일 ({todos.filter(t => !t.completed).length})
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col min-h-0 p-3 bg-slate-50/40 gap-2.5 overflow-hidden">
          {activeTab === 'calendar' && (
            <>
              <MiniCalendar
                events={calendarEvents}
                selectedDate={selectedDate}
                onSelectDate={(d) => setSelectedDate(d)}
              />
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between pb-1.5 text-slate-700">
                  <span className="font-bold text-[12px]">
                    {selectedDate ? `${selectedDate} 일정` : '전체 학사/업무 일정'}
                  </span>
                </div>
                <EventList
                  events={calendarEvents}
                  selectedDate={selectedDate}
                  onDeleteEvent={handleDeleteEvent}
                  mode="calendar"
                />
              </div>
            </>
          )}

          {activeTab === 'review' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="pb-1.5 text-[11px] text-slate-500">
                로컬 AI가 확신하지 못했던 일정입니다. 확인 후 반영해 주세요.
              </div>
              <EventList
                events={reviewEvents}
                selectedDate={null}
                onDeleteEvent={handleDeleteEvent}
                onApproveEvent={handleApproveEvent}
                mode="review"
              />
            </div>
          )}

          {activeTab === 'todo' && (
            <TodoList
              todos={todos}
              onToggleTodo={handleToggleTodo}
              onAddTodo={handleAddTodo}
              onDeleteTodo={handleDeleteTodo}
            />
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-3 py-1.5 flex items-center justify-between text-[10px] text-slate-500 select-none shrink-0">
          <div className="flex items-center gap-1">
            <PenguinIcon size={11} />
            <span>쿨린 로컬 AI 연동</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Radio size={10} />
            <span>마지막 동기화 {syncedLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
