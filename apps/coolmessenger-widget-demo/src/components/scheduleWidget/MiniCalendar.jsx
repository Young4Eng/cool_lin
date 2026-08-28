import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// 달력 모양은 naemo.ai 의 출결 달력을 참고했다.
//
//   · 차가운 회색 대신 따뜻한 종이색 (#F8F8F5 바탕, #E5E4E0 선, #1D1715 글자)
//   · 칸 사이를 띄우지 않고 0.8px 헤어라인으로 «격자»를 만든다
//   · 주말 칸은 절반 폭 — 좁은 위젯에서 평일에 자리를 몰아 준다
//   · 요일 머리는 작고 굵게, 색이 아니라 굵기로 구분
//
// 그대로 베끼지 않은 것: 참고한 달력은 칸 안에 항목 이름을 넣지만, 이 위젯은 폭이
// 380px 라 평일 한 칸이 50px 남짓이다. 글자를 넣으면 다 잘린다. 그래서 칸에는 점만
// 두고 «무슨 내용인지»는 아래 목록 카드가 맡는다.

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const iso = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

export default function MiniCalendar({ events = [], selectedDate, onSelectDate }) {
  const today = useMemo(() => new Date(), []);
  const todayStr = iso(today.getFullYear(), today.getMonth() + 1, today.getDate());

  // 처음 열면 «이번 달»이다. 예전에는 2026년 8월이 박혀 있었다.
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

  // 날짜별 일정 수
  const counts = useMemo(() => {
    const map = new Map();
    for (const e of events) map.set(e.date, (map.get(e.date) ?? 0) + 1);
    return map;
  }, [events]);

  // 주말을 좁게 — 좁은 위젯에서 평일에 자리를 몰아 준다
  const columns = 'grid-cols-[0.62fr_1fr_1fr_1fr_1fr_1fr_0.62fr]';

  return (
    <div className="select-none overflow-hidden rounded-lg border border-[#E5E4E0] bg-white">
      <div className="flex items-center justify-between border-b border-[#E5E4E0] bg-[#F8F8F5] px-2.5 py-1.5">
        <span className="text-[12px] font-semibold tabular-nums text-[#1D1715]">
          {view.year}년 {view.month}월
        </span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => move(-1)}
            className="rounded p-1 text-[#7A736C] hover:bg-[#EFEEEA]"
            aria-label="이전 달"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            type="button"
            onClick={() => {
              setView({ year: today.getFullYear(), month: today.getMonth() + 1 });
              onSelectDate(null);
            }}
            className="rounded px-1.5 py-0.5 text-[10.5px] font-medium text-[#5B5550] hover:bg-[#EFEEEA]"
          >
            오늘
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            className="rounded p-1 text-[#7A736C] hover:bg-[#EFEEEA]"
            aria-label="다음 달"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      <div className={`grid ${columns} border-b border-[#E5E4E0] bg-[#F8F8F5]`}>
        {WEEKDAYS.map((w) => (
          <span
            key={w}
            className="py-1 text-center text-[10px] font-semibold tracking-wider text-[#8E8880]"
          >
            {w}
          </span>
        ))}
      </div>

      <div className={`grid ${columns}`}>
        {cells.map((cell, i) => {
          const count = counts.get(cell.date) ?? 0;
          const isToday = cell.date === todayStr;
          const isSelected = selectedDate === cell.date;
          const lastRow = i >= cells.length - 7;
          const lastCol = i % 7 === 6;

          return (
            <button
              key={cell.date + i}
              type="button"
              onClick={() => onSelectDate(isSelected ? null : cell.date)}
              className={`relative flex h-[30px] flex-col items-center justify-center text-[11px] tabular-nums transition-colors ${
                lastRow ? '' : 'border-b'
              } ${lastCol ? '' : 'border-r'} border-[#EFEEEA] ${
                isSelected
                  ? 'bg-[#1D1715] font-semibold text-white'
                  : isToday
                    ? 'bg-[#FDECEC] font-semibold text-[#B42318]'
                    : cell.inMonth
                      ? 'text-[#3A322D] hover:bg-[#F8F8F5]'
                      : 'text-[#C9C5BD]'
              }`}
            >
              <span className="leading-none">{cell.day}</span>
              {count > 0 && (
                <span className="absolute bottom-[3px] flex items-center gap-[2px]">
                  {Array.from({ length: Math.min(count, 3) }).map((_, k) => (
                    <span
                      key={k}
                      className={`h-[3px] w-[3px] rounded-full ${
                        isSelected ? 'bg-white/80' : isToday ? 'bg-[#B42318]' : 'bg-[#A8A29B]'
                      }`}
                    />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
