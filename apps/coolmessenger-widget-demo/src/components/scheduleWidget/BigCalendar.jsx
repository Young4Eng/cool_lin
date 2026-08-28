import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

// 확장(큰 화면) 모드에서만 쓰는 달력. naemo.ai 의 학사일정 달력 페이지를 참고했다.
//
// MiniCalendar 는 위젯 폭(380px)이 좁아 칸에 점만 찍지만, 이 달력은 넓은 창에서만
// 켜지므로 그 제약이 없다 — naemo.ai 처럼 칸 안에 일정 제목을 그대로 보여 준다.

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const iso = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

// 분류별 점 색 — 카드 자체에는 분류 이름을 적지 않고 점 하나로만 구분한다.
const CATEGORY_DOT = {
  학사일정: '#2563EB',
  공문마감: '#DC2626',
  회의: '#7C3AED',
  교무: '#D97706',
  시험: '#DB2777',
  업무: '#64748B',
};

function dotColor(event) {
  return CATEGORY_DOT[event.category] || '#8E8880';
}

export default function BigCalendar({
  events = [],
  todos = [],
  selectedDate,
  onSelectDate,
  onOpenSource,
  onAddEvent,
  onToggleTodo,
}) {
  const today = useMemo(() => new Date(), []);
  const todayStr = iso(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() + 1 });

  const move = (delta) => {
    setView(({ year, month }) => {
      const m = month + delta;
      if (m < 1) return { year: year - 1, month: 12 };
      if (m > 12) return { year: year + 1, month: 1 };
      return { year, month: m };
    });
  };

  const cells = useMemo(() => {
    const { year, month } = view;
    const firstDay = new Date(year, month - 1, 1).getDay();
    const total = new Date(year, month, 0).getDate();
    const prevTotal = new Date(year, month - 1, 0).getDate();
    const out = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const m = month === 1 ? 12 : month - 1;
      const y = month === 1 ? year - 1 : year;
      out.push({ date: iso(y, m, prevTotal - i), day: prevTotal - i, inMonth: false });
    }
    for (let d = 1; d <= total; d++) {
      out.push({ date: iso(year, month, d), day: d, inMonth: true });
    }
    while (out.length % 7 !== 0) {
      const d = out.length - firstDay - total + 1;
      const m = month === 12 ? 1 : month + 1;
      const y = month === 12 ? year + 1 : year;
      out.push({ date: iso(y, m, d), day: d, inMonth: false });
    }
    return out;
  }, [view]);

  // 일정과 할 일을 한 칸 안에 함께 놓는다. 완료한 것은 그 날 칸에서도 맨 아래다.
  const byDate = useMemo(() => {
    const all = [
      ...events.map((e) => ({ ...e, kind: 'event' })),
      ...todos.map((t) => ({
        kind: 'todo',
        id: t.id,
        title: t.text,
        date: t.dueDate,
        completed: t.completed,
        // 별표는 할 일에도 붙는다. 여기서 빠뜨리면 달력에서만 강조가 사라진다.
        starred: t.starred,
        category: '업무',
      })),
    ];
    const map = new Map();
    for (const item of all) {
      const list = map.get(item.date) ?? [];
      list.push(item);
      map.set(item.date, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => Number(!!a.completed) - Number(!!b.completed));
    }
    return map;
  }, [events, todos]);

  const rows = cells.length / 7;

  return (
    <div className="flex h-full min-h-0 flex-col bg-white select-none">
      <div className="flex shrink-0 items-center justify-center gap-3 border-b border-[#E5E4E0] bg-[#F8F8F5] px-3 py-2.5">
        <button
          type="button"
          onClick={() => move(-1)}
          className="rounded p-1 text-[#7A736C] hover:bg-[#EFEEEA]"
          aria-label="이전 달"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="min-w-[104px] text-center text-[15px] font-semibold tabular-nums text-[#1D1715]">
          {view.year}년 {view.month}월
        </span>
        <button
          type="button"
          onClick={() => move(1)}
          className="rounded p-1 text-[#7A736C] hover:bg-[#EFEEEA]"
          aria-label="다음 달"
        >
          <ChevronRight size={16} />
        </button>
        <button
          type="button"
          onClick={() => {
            setView({ year: today.getFullYear(), month: today.getMonth() + 1 });
            onSelectDate?.(null);
          }}
          className="ml-1 rounded px-2 py-1 text-[11px] font-medium text-[#5B5550] hover:bg-[#EFEEEA]"
        >
          오늘
        </button>
      </div>

      <div className="grid shrink-0 grid-cols-7 border-b border-[#E5E4E0] bg-[#F8F8F5]">
        {WEEKDAYS.map((w) => (
          <span
            key={w}
            className="py-1.5 text-center text-[11px] font-semibold tracking-wider text-[#8E8880]"
          >
            {w}
          </span>
        ))}
      </div>

      <div
        className="grid min-h-0 flex-1 grid-cols-7"
        style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}
      >
        {cells.map((cell, i) => {
          const dayEvents = byDate.get(cell.date) ?? [];
          const isToday = cell.date === todayStr;
          const isSelected = selectedDate === cell.date;
          const lastRow = i >= cells.length - 7;
          const lastCol = i % 7 === 6;
          const shown = dayEvents.slice(0, 3);
          const extra = dayEvents.length - shown.length;

          return (
            <div
              key={cell.date + i}
              onClick={() => onSelectDate?.(isSelected ? null : cell.date)}
              className={`group relative flex min-h-0 flex-col gap-0.5 overflow-hidden px-1.5 py-1 text-left transition-colors ${
                lastRow ? '' : 'border-b'
              } ${lastCol ? '' : 'border-r'} border-[#EFEEEA] ${
                isSelected ? 'bg-[#FBFAF8]' : cell.inMonth ? 'hover:bg-[#FCFCFA]' : 'bg-[#FBFBFA]'
              }`}
            >
              <div className="flex shrink-0 items-center justify-between">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] tabular-nums ${
                    isToday
                      ? 'bg-[#B42318] font-semibold text-white'
                      : cell.inMonth
                        ? 'font-medium text-[#3A322D]'
                        : 'text-[#C9C5BD]'
                  }`}
                >
                  {cell.day}
                </span>
                {onAddEvent && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddEvent(cell.date);
                    }}
                    className="rounded p-0.5 text-[#C9C5BD] opacity-0 transition-opacity hover:bg-[#EFEEEA] hover:text-[#3A322D] group-hover:opacity-100"
                    title="이 날짜에 일정 추가"
                    aria-label={`${cell.date} 일정 추가`}
                  >
                    <Plus size={11} />
                  </button>
                )}
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden">
                {shown.map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (ev.kind === 'todo') onToggleTodo?.(ev.id);
                      else onOpenSource?.(ev);
                    }}
                    title={ev.kind === 'todo' ? `${ev.title} — 눌러서 완료 표시` : ev.title}
                    className={`flex items-center gap-1 truncate rounded px-1 py-[1.5px] text-left text-[10px] leading-tight hover:bg-[#E5E4E0] ${
                      ev.completed
                        ? 'bg-[#F8F8F5] text-[#A8A29B] line-through'
                        : ev.starred
                          ? 'bg-[#FEF3C7] font-semibold text-[#B42318]'
                          : 'bg-[#F0EFEB] text-[#3A322D]'
                    }`}
                  >
                    <span
                      className="h-[5px] w-[5px] shrink-0 rounded-full"
                      style={{
                        backgroundColor: ev.completed
                          ? '#C9C5BD'
                          : ev.starred
                            ? '#B42318'
                            : dotColor(ev),
                      }}
                    />
                    {/* 별표로 중요 표시한 일정은 빨간 글씨에 노란 음영을 깔아 한눈에 띄게 한다.
                        칸이 좁아 별 아이콘을 넣으면 제목이 그만큼 잘리므로 색으로만 알린다. */}
                    <span className={`truncate ${ev.starred && !ev.completed ? 'bg-[#FDE68A] px-0.5' : ''}`}>
                      {ev.title}
                    </span>
                  </button>
                ))}
                {extra > 0 && (
                  <span className="px-1 text-[9.5px] font-medium text-[#A8A29B]">+{extra}개 더</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
