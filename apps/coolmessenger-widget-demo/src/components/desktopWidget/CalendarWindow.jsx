import React, { useCallback, useEffect, useState } from 'react';
import { Minimize2 } from 'lucide-react';
import BigCalendar from '../scheduleWidget/BigCalendar';
import EventEditorModal from '../scheduleWidget/EventEditorModal';
import SourceMessageModal from './SourceMessageModal';
import {
  loadStoredSchedule, saveStoredSchedule,
  loadStoredTodos, saveStoredTodos,
} from '../../services/storageService';
import { closeCalendarWindow } from '../../services/desktopShell';

// 「캘린더 크게 보기」 창.
//
// 위젯을 대신하는 화면이 아니라 **따로 열리는 창**이다. 예전에는 위젯 안에서 화면을
// 바꿔치기했는데, 그러면 캘린더를 보는 동안 위젯이 사라져 «항상 떠 있는 일정판»이라는
// 위젯의 존재 이유가 없어졌다. 이제 둘은 같은 localStorage 를 보며 나란히 떠 있는다.

function needsReview(event) {
  return event.fromAi && event.autoRegisterEligible === false && !event.reviewed;
}

export default function CalendarWindow() {
  const [events, setEvents] = useState(loadStoredSchedule);
  const [todos, setTodos] = useState(loadStoredTodos);
  const [selectedDate, setSelectedDate] = useState(null);
  const [sourceEvent, setSourceEvent] = useState(null);
  const [addDate, setAddDate] = useState(null);

  // 위젯 쪽에서 일정을 바꾸면 바로 따라간다.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'cool_schedule_v1') setEvents(loadStoredSchedule());
      if (e.key === 'cool_todos_v1') setTodos(loadStoredTodos());
    };
    const onFocus = () => {
      setEvents(loadStoredSchedule());
      setTodos(loadStoredTodos());
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const addEvent = useCallback((event) => {
    setEvents((prev) => {
      const exists = prev.some((e) => e.date === event.date && e.title === event.title);
      const next = exists ? prev : [event, ...prev];
      if (!exists) saveStoredSchedule(next);
      return next;
    });
  }, []);

  const toggleTodoCompleted = useCallback((id) => {
    setTodos((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
      saveStoredTodos(next);
      return next;
    });
  }, []);

  // 접기 — 이 창만 닫는다. 위젯은 그대로 떠 있다.
  const collapse = () => closeCalendarWindow();

  const calendarEvents = events.filter((e) => !needsReview(e));

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-white font-sans text-slate-900">
      <button
        type="button"
        onClick={collapse}
        title="캘린더 접기 (위젯만 남기기)"
        aria-label="캘린더 접기"
        className="absolute right-3 top-2.5 z-30 flex items-center gap-1 rounded-md border border-[#E5E4E0] bg-white px-2 py-1 text-[11px] font-medium text-[#5B5550] shadow-sm hover:bg-[#F8F8F5] hover:text-[#1D1715]"
      >
        <Minimize2 size={11} />
        접기
      </button>

      <BigCalendar
        events={calendarEvents}
        todos={todos}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onOpenSource={setSourceEvent}
        onAddEvent={setAddDate}
        onToggleTodo={toggleTodoCompleted}
      />

      {sourceEvent && (
        <SourceMessageModal event={sourceEvent} onClose={() => setSourceEvent(null)} />
      )}

      <EventEditorModal
        key={addDate}
        isOpen={addDate !== null}
        onClose={() => setAddDate(null)}
        onSave={addEvent}
        initialDate={addDate ?? undefined}
      />
    </div>
  );
}
