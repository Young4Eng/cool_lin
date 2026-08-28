import React, { useState } from 'react';
import {
  Calendar, CheckSquare, Plus, Sparkles, Pin,
  ChevronDown, ChevronUp, RefreshCw, X, Sliders, MonitorUp
} from 'lucide-react';
import MiniCalendar from './MiniCalendar';
import EventList from './EventList';
import TodoList from './TodoList';
import EventEditorModal from './EventEditorModal';
import WindowFrame from '../desktop/WindowFrame';
import { openDesktopWidget } from '../../utils/desktopWidgetLauncher';
import { getWidgetAutoStart, setWidgetAutoStart } from '../../utils/widgetAutoStart';

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
  onToggleTodo,
  onAddTodo,
  onDeleteTodo,
  onOpenMessage,
  onOpenAiAssistant,
}) {
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'todo' | 'ai_insights'
  const [selectedDate, setSelectedDate] = useState('2026-08-28');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [autoStart, setAutoStart] = useState(getWidgetAutoStart);

  if (!isOpen || isMinimized) return null;

  const aiEventsCount = events.filter(e => e.fromAi).length;

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
        height={620}
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
              {!isCompact && (
                <MiniCalendar
                  events={events}
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
                  events={events}
                  selectedDate={selectedDate}
                  onDeleteEvent={onDeleteEvent}
                  onOpenMessageFromEvent={onOpenMessage}
                />
              </div>
            </>
          )}

          {activeTab === 'todo' && (
            <TodoList
              todos={todos}
              onToggleTodo={onToggleTodo}
              onAddTodo={onAddTodo}
              onDeleteTodo={onDeleteTodo}
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
