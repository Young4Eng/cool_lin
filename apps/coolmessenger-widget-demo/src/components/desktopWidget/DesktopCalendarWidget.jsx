import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarDays, CheckSquare, ClipboardCheck, Download, Power } from 'lucide-react';
import MiniCalendar from '../scheduleWidget/MiniCalendar';
import CoolMessengerIngestBar from '../scheduleWidget/CoolMessengerIngestBar';
import EventList from '../scheduleWidget/EventList';
import TodoList from '../scheduleWidget/TodoList';
import SourceMessageModal from './SourceMessageModal';
import {
  loadStoredSchedule, saveStoredSchedule,
  loadStoredTodos, saveStoredTodos,
} from '../../services/storageService';
import { subscribeAiEventAdded } from '../../utils/widgetSync';
import { ingestOnce } from '../../services/widgetIngest';
import { ensureAutostartOnFirstRun, inDesktopShell, setAutostart } from '../../services/desktopShell';

// 바탕화면 일정 위젯 — 설치본에서는 이 창 하나만 뜬다.
//
// 그래서 «메인 앱이 넣어 준 걸 읽기만» 하던 예전 구조로는 안 된다. 쿨메신저에서
// 가져오는 일도 이 창이 직접 한다 (services/widgetIngest.js).

function needsReview(event) {
  return event.fromAi && event.autoRegisterEligible === false && !event.reviewed;
}

/** 켜자마자 한 번, 그 뒤로는 10분마다 조용히 다시 읽는다. */
const AUTO_REFRESH_MS = 10 * 60 * 1000;

export default function DesktopCalendarWidget() {
  const [events, setEvents] = useState(loadStoredSchedule);
  const [todos, setTodos] = useState(loadStoredTodos);
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(null);
  const [now, setNow] = useState(new Date());
  const [sourceEvent, setSourceEvent] = useState(null);
  const [autostart, setAutostartState] = useState(false);
  const [showIngest, setShowIngest] = useState(false);

  const [ingest, setIngest] = useState({ state: 'idle', message: '' });
  const runningRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  // 다른 창이 같은 localStorage 를 고치면 바로 따라간다.
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

  useEffect(() => subscribeAiEventAdded(() => setEvents(loadStoredSchedule())), []);

  // 위젯을 켜면 부팅 등록도 함께 켠다 (기술계획서 7.9).
  useEffect(() => {
    let alive = true;
    ensureAutostartOnFirstRun().then((on) => { if (alive) setAutostartState(on); });
    return () => { alive = false; };
  }, []);

  const persistEvents = useCallback((next) => {
    setEvents(next);
    saveStoredSchedule(next);
  }, []);

  const runIngest = useCallback(async (mode) => {
    if (runningRef.current) return;
    runningRef.current = true;
    setIngest({
      state: 'running',
      message: mode === 'fresh' ? '쿨메신저에서 새로 받는 중' : '새 일정 확인 중',
    });

    try {
      const current = loadStoredSchedule();
      // 쿨메신저 창을 실제로 조작하는 동안에는 위젯이 비켜 준다.
      // 「항상 위」인 채로 두면 자동화가 메신저를 앞으로 꺼내지 못한다.
      // 위젯 숨김은 realIngestClient 안으로 옮겼다 — 여기만 감싸면 팀원의 가져오기
      // 막대가 그 보호를 못 받는다.
      const result = await ingestOnce(current, mode);
      if (result.added.length > 0 || result.forReview.length > 0) {
        persistEvents(result.next);
      }
      const parts = [];
      if (result.added.length > 0) parts.push(`일정 ${result.added.length}건 등록`);
      if (result.forReview.length > 0) parts.push(`검토 ${result.forReview.length}건`);
      setIngest({
        state: 'ok',
        message: parts.length > 0 ? parts.join(' · ') : '새로 추가할 일정이 없습니다',
      });
    } catch (err) {
      setIngest({ state: 'error', message: (err && err.message) || '가져오지 못했습니다' });
    } finally {
      runningRef.current = false;
    }
  }, [persistEvents]);

  // 켜자마자 한 번 + 10분마다. 화면을 건드리지 않는 latest 만 자동으로 돈다.
  // 쿨메신저 창을 실제로 조작하는 fresh 는 사람이 누를 때만 한다 — 수업 중에 창이
  // 저절로 앞으로 튀어나오면 안 된다.
  useEffect(() => {
    runIngest('latest');
    const t = setInterval(() => runIngest('latest'), AUTO_REFRESH_MS);
    return () => clearInterval(t);
  }, [runIngest]);

  const persistTodos = (next) => {
    setTodos(next);
    saveStoredTodos(next);
  };

  const handleToggleAutostart = async () => {
    const next = !autostart;
    setAutostartState(await setAutostart(next));
  };

  const reviewEvents = events.filter(needsReview);
  const calendarEvents = events.filter((e) => !needsReview(e));
  const openTodos = todos.filter((t) => !t.completed).length;
  const todayLabel = now.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
  const timeLabel = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

  const tabs = [
    { id: 'calendar', label: '일정', icon: CalendarDays, count: 0 },
    { id: 'review', label: '검토', icon: ClipboardCheck, count: reviewEvents.length },
    { id: 'todo', label: '할 일', icon: CheckSquare, count: openTodos },
  ];

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-white font-sans text-slate-900">
      <header className="shrink-0 select-none border-b border-slate-200 px-4 pt-3.5 pb-3">
        <div className="flex items-baseline justify-between gap-2">
          <h1 className="text-[17px] font-semibold tracking-tight">{todayLabel}</h1>
          <span className="tabular-nums text-[12px] text-slate-400">{timeLabel}</span>
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowIngest((v) => !v)}
            aria-expanded={showIngest}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${
              showIngest
                ? 'bg-[#EFEEEA] text-[#1D1715]'
                : 'bg-[#1D1715] text-white hover:bg-[#3A322D]'
            }`}
          >
            <Download size={12} />
            가져오기
          </button>

          {inDesktopShell() && (
            <button
              type="button"
              onClick={handleToggleAutostart}
              title={autostart ? '컴퓨터를 켜면 위젯이 자동으로 뜹니다' : '부팅 시 자동 실행이 꺼져 있습니다'}
              className={`ml-auto flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1.5 text-[10.5px] font-medium ${
                autostart ? 'bg-slate-50 text-slate-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Power size={11} />
              {autostart ? '부팅 시 자동 실행' : '부팅 실행 꺼짐'}
            </button>
          )}
        </div>

        {ingest.message && (
          <p className={`mt-1.5 text-[10.5px] leading-relaxed ${
            ingest.state === 'error' ? 'text-rose-600' : 'text-slate-400'
          }`}>
            {ingest.message}
          </p>
        )}
      </header>

      <nav className="flex shrink-0 select-none gap-4 border-b border-slate-200 px-4">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`-mb-px flex items-center gap-1.5 border-b-2 py-2 text-[12px] transition-colors ${
              activeTab === id
                ? 'border-slate-900 font-semibold text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon size={13} />
            {label}
            {count > 0 && (
              <span className="rounded-full bg-slate-100 px-1.5 text-[10px] font-semibold tabular-nums text-slate-600">
                {count}
              </span>
            )}
          </button>
        ))}
      </nav>

      <main className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-3 py-3">
        {activeTab === 'calendar' && (
          <>
            {/* 기간 지정 가져오기 · 시각 예약. 서버가 없어도 셸 경로로 돈다.
                평소에는 접어 둔다 — 흘깃 보는 위젯에서 맨 위 자리는 «오늘 무엇이 있나»
                가 가져가야 한다. 「가져오기」를 눌러야 펼쳐진다. */}
            {showIngest && (
            <CoolMessengerIngestBar
              compact
              onAddEvent={(event) => {
                setEvents((prev) => {
                  const exists = prev.some((e) => e.date === event.date && e.title === event.title);
                  const next = exists ? prev : [event, ...prev];
                  if (!exists) saveStoredSchedule(next);
                  return next;
                });
              }}
            />
            )}
            <MiniCalendar
              events={calendarEvents}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex items-baseline justify-between px-0.5 pb-1.5">
                <h2 className="text-[11px] font-medium uppercase tracking-wider text-[#A8A29B]">
                  {selectedDate ? selectedDate : '다가오는 일정'}
                </h2>
                {selectedDate && (
                  <button
                    type="button"
                    onClick={() => setSelectedDate(null)}
                    className="text-[10.5px] text-[#A8A29B] hover:text-[#3A322D]"
                  >
                    전체 보기
                  </button>
                )}
              </div>
              <EventList
                events={calendarEvents}
                selectedDate={selectedDate}
                onDeleteEvent={(id) => persistEvents(events.filter((e) => e.id !== id))}
                onOpenSource={setSourceEvent}
                mode="calendar"
              />
            </div>
          </>
        )}

        {activeTab === 'review' && (
          <div className="flex min-h-0 flex-1 flex-col">
            <p className="px-0.5 pb-2 text-[11px] leading-relaxed text-slate-500">
              규칙이 확신하지 못한 일정입니다. 확인하면 캘린더로 옮깁니다.
            </p>
            <EventList
              events={reviewEvents}
              selectedDate={null}
              onDeleteEvent={(id) => persistEvents(events.filter((e) => e.id !== id))}
              onOpenSource={setSourceEvent}
              onApproveEvent={(id) =>
                persistEvents(events.map((e) => (e.id === id ? { ...e, reviewed: true } : e)))
              }
              mode="review"
            />
          </div>
        )}

        {activeTab === 'todo' && (
          <TodoList
            todos={todos}
            onToggleTodo={(id) => persistTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))}
            onAddTodo={(t) => persistTodos([t, ...todos])}
            onDeleteTodo={(id) => persistTodos(todos.filter((t) => t.id !== id))}
          />
        )}
      </main>

      {sourceEvent && (
        <SourceMessageModal event={sourceEvent} onClose={() => setSourceEvent(null)} />
      )}
    </div>
  );
}
