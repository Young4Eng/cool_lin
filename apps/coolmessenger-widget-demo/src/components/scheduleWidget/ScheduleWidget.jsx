import React, { useState } from 'react';
import {
  Calendar, CheckSquare, Plus, Sparkles, Pin, ClipboardCheck,
  ChevronDown, ChevronUp, MonitorUp
} from 'lucide-react';
import MiniCalendar from './MiniCalendar';
import CoolMessengerIngestBar from './CoolMessengerIngestBar';
import EventList from './EventList';
import TodoList from './TodoList';
import EventEditorModal from './EventEditorModal';
import WindowFrame from '../desktop/WindowFrame';
import { openDesktopWidget } from '../../utils/desktopWidgetLauncher';
import { getWidgetAutoStart, setWidgetAutoStart } from '../../utils/widgetAutoStart';

// An AI-extracted event needs review when the extractor itself flagged it
// as not safe to silently auto-register (see localAiService.js /
// packages/schedule-engine's Candidate.autoRegisterEligible contract).
// Events from before this field existed, or added manually, are treated
// as already-trusted so old data doesn't suddenly pile into 검토함.
function needsReview(event) {
  return event.fromAi && event.autoRegisterEligible === false && !event.reviewed;
}

export default function ScheduleWidget({
  isOpen,
  isMinimized,
  zIndex,
  onFocus,
  onMinimize,
  onMaximize,
  onClose,
  events = [],
  todos = [],
  onAddEvent,
  onDeleteEvent,
  onApproveEvent,
  onAddToGoogleCalendar,
  onToggleTodo,
  onAddTodo,
  onDeleteTodo,
  onOpenMessage,
  onOpenAiAssistant,
}) {
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'review' | 'todo'
  const [selectedDate, setSelectedDate] = useState('2026-08-28');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [autoStart, setAutoStart] = useState(getWidgetAutoStart);

  if (!isOpen || isMinimized) return null;

  const aiEventsCount = events.filter(e => e.fromAi).length;
  const reviewEvents = events.filter(needsReview);
  const calendarEvents = events.filter(e => !needsReview(e));

  return (
    <>
      <WindowFrame
        id="schedule-widget"
        title="학사일정 & 스마트 업무 위젯"
        icon={<Calendar size={15} className="text-white" />}
        isOpen={isOpen}
        isMinimized={isMinimized}
        zIndex={zIndex}
        onFocus={onFocus}
        onClose={onClose}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        width={380}
        height={640}
        minWidth={320}
        minHeight={400}
        defaultPosition={{ x: window.innerWidth ? window.innerWidth - 410 : 700, y: 40 }}
        headerStyle="widget"
        customHeaderRight={
          <div className="flex items-center gap-1 mr-1">
            <button
              type="button"
              onClick={() => openDesktopWidget()}
              className="p-1 hover:bg-white/20 rounded text-white"
              title="바탕화면 위젯으로 분리 (별도 창으로 PC에 항상 띄우기)"
            >
              <MonitorUp size={13} />
            </button>
            <button
              type="button"
              onClick={() => {
                const next = !autoStart;
                setAutoStart(next);
                setWidgetAutoStart(next);
              }}
              className={`p-1 rounded text-white ${autoStart ? 'bg-white/25' : 'hover:bg-white/20'}`}
              title={
                autoStart
                  ? '켜짐: 앱을 다시 열 때마다 위젯 자동 실행 (클릭하면 끄기)'
                  : '꺼짐: 위젯 자동 실행 안 함 (클릭하면 켜기)'
              }
            >
              <Pin size={13} className={autoStart ? 'fill-white' : ''} />
            </button>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="p-1 hover:bg-white/20 rounded text-white"
              title="새 일정 추가"
            >
              <Plus size={13} />
            </button>
            <button
              type="button"
              onClick={() => setIsCompact(!isCompact)}
              className="p-1 hover:bg-white/20 rounded text-white"
              title={isCompact ? '확장 보기' : '간소화 보기'}
            >
              {isCompact ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
            </button>
          </div>
        }
      >
        {/* Widget Tab Header */}
        <div className="bg-slate-100 border-b border-slate-200 px-2 pt-1 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`px-2.5 py-1.5 font-bold rounded-t-md transition-colors flex items-center gap-1 ${
                activeTab === 'calendar'
                  ? 'bg-white text-cool-700 shadow-2xs border-t-2 border-cool-600'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Calendar size={13} /> 캘린더
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('review')}
              className={`relative px-2.5 py-1.5 font-bold rounded-t-md transition-colors flex items-center gap-1 ${
                activeTab === 'review'
                  ? 'bg-white text-amber-700 shadow-2xs border-t-2 border-amber-500'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
              title="AI가 확신하지 못해 확인이 필요한 일정"
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
              className={`px-2.5 py-1.5 font-bold rounded-t-md transition-colors flex items-center gap-1 ${
                activeTab === 'todo'
                  ? 'bg-white text-cool-700 shadow-2xs border-t-2 border-cool-600'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <CheckSquare size={13} /> 할 일 ({todos.filter(t => !t.completed).length})
            </button>
          </div>

          {/* AI Extract Status Pill */}
          <button
            type="button"
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full text-[10.5px] font-semibold mb-1 shadow-2xs cursor-pointer"
            title="로컬 AI가 쪽지에서 추출한 일정 개수"
          >
            <Sparkles size={11} className="text-purple-600" />
            <span>AI 연동 ({aiEventsCount})</span>
          </button>
        </div>

        {/* Widget Body */}
        <div className="flex-1 flex flex-col min-h-0 p-3 bg-slate-50/40 gap-2.5 overflow-hidden">
          {activeTab === 'calendar' && (
            <>
              {/* Mini Calendar (Collapsible in compact mode) */}
              <CoolMessengerIngestBar onAddEvent={onAddEvent} compact={isCompact} />

              {!isCompact && (
                <MiniCalendar
                  events={calendarEvents}
                  selectedDate={selectedDate}
                  onSelectDate={(d) => setSelectedDate(d)}
                />
              )}

              {/* Event Timeline List */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between pb-1.5 text-slate-700">
                  <span className="font-bold text-[12px]">
                    {selectedDate ? `${selectedDate} 일정` : '전체 학사/업무 일정'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="text-[11px] font-semibold text-cool-600 hover:text-cool-800 flex items-center gap-0.5"
                  >
                    <Plus size={12} /> 추가
                  </button>
                </div>

                <EventList
                  events={calendarEvents}
                  selectedDate={selectedDate}
                  onDeleteEvent={onDeleteEvent}
                  onOpenMessageFromEvent={onOpenMessage}
                  onAddToGoogleCalendar={onAddToGoogleCalendar}
                  mode="calendar"
                />
              </div>
            </>
          )}

          {activeTab === 'review' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="pb-1.5 text-[11px] text-slate-500">
                로컬 AI가 자동으로 캘린더에 넣기엔 확신이 부족했던 일정입니다. 확인 후 반영해 주세요.
              </div>
              <EventList
                events={reviewEvents}
                selectedDate={null}
                onDeleteEvent={onDeleteEvent}
                onOpenMessageFromEvent={onOpenMessage}
                onApproveEvent={onApproveEvent}
                mode="review"
              />
            </div>
          )}

          {/* 메인 앱의 할 일 탭에는 일정을 섞지 않는다 — 여기서는 캘린더가 바로 옆에 있다.
              섞는 것은 탭 하나로 오가야 하는 바탕화면 위젯에서만 값어치가 있다.
              그래서 kind 는 항상 'todo' 이고, 그대로 흘려보낸다. */}
          {activeTab === 'todo' && (
            <TodoList
              todos={todos}
              onToggleItem={(_kind, id) => onToggleTodo(id)}
              onAddTodo={onAddTodo}
              onDeleteItem={(_kind, id) => onDeleteTodo(id)}
              onOpenMessage={onOpenMessage}
            />
          )}
        </div>

        {/* Widget Bottom Status Bar */}
        <div className="bg-slate-100 border-t border-slate-200 px-3 py-1 flex items-center justify-between text-[11px] text-slate-500 select-none">
          <span>오늘: 2026년 8월 28일 (금)</span>
          <span className="text-cool-600 font-medium">로컬 AI 활성화됨</span>
        </div>
      </WindowFrame>

      {/* Add Event Modal */}
      <EventEditorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={onAddEvent}
        initialDate={selectedDate || '2026-08-28'}
      />
    </>
  );
}
