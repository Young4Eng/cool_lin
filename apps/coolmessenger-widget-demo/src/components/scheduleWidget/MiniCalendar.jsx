import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MiniCalendar({
  events = [],
  selectedDate,
  onSelectDate,
}) {
  // Current view year & month (default Aug 2026)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 1-indexed (8 = August)

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

  // Days in month calculation
  const firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay();
  const totalDays = new Date(currentYear, currentMonth, 0).getDate();

  const prevMonthDays = new Date(currentYear, currentMonth - 1, 0).getDate();

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Build grid dates
  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarCells.push({
      day: prevMonthDays - i,
      month: currentMonth - 1,
      year: currentYear,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    calendarCells.push({
      day: i,
      month: currentMonth,
      year: currentYear,
      isCurrentMonth: true,
    });
  }

  // Next month leading days (fill up to 35 or 42)
  const remainingCells = (calendarCells.length % 7 === 0) ? 0 : 7 - (calendarCells.length % 7);
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({
      day: i,
      month: currentMonth + 1,
      year: currentYear,
      isCurrentMonth: false,
    });
  }

  // Format date to YYYY-MM-DD
  const formatCellDate = (cell) => {
    const m = String(cell.month).padStart(2, '0');
    const d = String(cell.day).padStart(2, '0');
    return `${cell.year}-${m}-${d}`;
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-2.5 shadow-2xs select-none">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-slate-800 text-[13px]">
          {currentYear}년 {currentMonth}월
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 hover:bg-slate-100 rounded text-slate-600"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => {
              setCurrentYear(2026);
              setCurrentMonth(8);
              onSelectDate('2026-08-28');
            }}
            className="text-[10.5px] px-1.5 py-0.5 rounded bg-cool-50 text-cool-700 font-semibold hover:bg-cool-100"
          >
            오늘
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 hover:bg-slate-100 rounded text-slate-600"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold mb-1">
        {daysOfWeek.map((dw, i) => (
          <span
            key={dw}
            className={i === 0 ? 'text-rose-500' : i === 6 ? 'text-blue-500' : 'text-slate-500'}
          >
            {dw}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarCells.map((cell, idx) => {
          const dateStr = formatCellDate(cell);
          const isSelected = selectedDate === dateStr;
          const isToday = dateStr === '2026-08-28';
          const dayEvents = events.filter(e => e.date === dateStr);
          const hasAiEvent = dayEvents.some(e => e.fromAi);

          const isSunday = idx % 7 === 0;
          const isSaturday = idx % 7 === 6;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectDate(selectedDate === dateStr ? null : dateStr)}
              className={`h-7 flex flex-col items-center justify-center rounded text-[11.5px] relative transition-all ${
                !cell.isCurrentMonth
                  ? 'text-slate-300'
                  : isSelected
                  ? 'bg-cool-600 text-white font-bold shadow-xs'
                  : isToday
                  ? 'bg-sky-100 text-cool-800 font-bold border border-cool-300'
                  : 'hover:bg-slate-100 text-slate-700'
              } ${isSunday && cell.isCurrentMonth && !isSelected ? 'text-rose-600' : ''} ${
                isSaturday && cell.isCurrentMonth && !isSelected ? 'text-blue-600' : ''
              }`}
            >
              <span>{cell.day}</span>
              {/* Event Dots */}
              {dayEvents.length > 0 && (
                <div className="flex items-center gap-0.5 absolute bottom-0.5">
                  {hasAiEvent ? (
                    <span className={`size-1 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-purple-500 animate-pulse'}`} />
                  ) : (
                    <span className={`size-1 rounded-full ${isSelected ? 'bg-white' : 'bg-cool-500'}`} />
                  )}
                  {dayEvents.length > 1 && (
                    <span className={`size-1 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`} />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
