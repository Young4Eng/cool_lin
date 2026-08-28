import React from 'react';
import { Sparkles, Clock, MapPin, Trash2, Calendar, AlertCircle } from 'lucide-react';

export default function EventList({
  events = [],
  selectedDate,
  onDeleteEvent,
  onOpenMessageFromEvent,
}) {
  // Sort events by date & time
  const sortedEvents = [...events].sort((a, b) => {
    const da = `${a.date} ${a.time || '00:00'}`;
    const db = `${b.date} ${b.time || '00:00'}`;
    return da.localeCompare(db);
  });

  const displayEvents = selectedDate
    ? sortedEvents.filter(e => e.date === selectedDate)
    : sortedEvents;

  // Calculate D-Day relative to 2026-08-28
  const getDDay = (targetDateStr) => {
    const today = new Date('2026-08-28T00:00:00');
    const target = new Date(`${targetDateStr}T00:00:00`);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { label: 'D-Day', color: 'bg-rose-500 text-white font-bold' };
    if (diffDays > 0) return { label: `D-${diffDays}`, color: diffDays <= 3 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700' };
    return { label: `D+${Math.abs(diffDays)}`, color: 'bg-slate-100 text-slate-400' };
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case '공문마감': return 'bg-rose-50 text-rose-700 border-rose-200';
      case '회의': return 'bg-amber-50 text-amber-700 border-amber-200';
      case '학사일정': return 'bg-blue-50 text-blue-700 border-blue-200';
      case '교무': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case '시험': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto space-y-2 pr-1 select-none text-xs">
      {selectedDate && (
        <div className="flex items-center justify-between px-1 py-0.5 text-[11px] font-semibold text-cool-700 bg-cool-50 rounded border border-cool-100">
          <span>📅 {selectedDate} 일정 ({displayEvents.length}건)</span>
        </div>
      )}

      {displayEvents.map(event => {
        const dday = getDDay(event.date);

        return (
          <div
            key={event.id}
            className={`p-2.5 rounded-lg border transition-all hover:shadow-xs ${
              event.fromAi
                ? 'bg-gradient-to-r from-purple-50/40 via-white to-sky-50/30 border-purple-200/70'
                : 'bg-white border-slate-200'
            }`}
          >
            {/* Top row: Category, AI badge, D-day, Delete */}
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getCategoryColor(event.category)}`}>
                  {event.category || '업무'}
                </span>

                {event.fromAi && (
                  <span className="flex items-center gap-0.5 bg-purple-100 text-purple-700 border border-purple-200 text-[10px] font-semibold px-1.5 py-0.5 rounded shadow-2xs">
                    <Sparkles size={10} className="text-purple-600 animate-pulse" /> 로컬 AI 연동됨
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${dday.color}`}>
                  {dday.label}
                </span>
                <button
                  type="button"
                  onClick={() => onDeleteEvent(event.id)}
                  className="text-slate-300 hover:text-red-500 p-0.5 rounded"
                  title="일정 삭제"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="font-bold text-slate-800 text-[12px] leading-tight mb-1">
              {event.title}
            </div>

            {/* Time & Location */}
            <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-1">
              <div className="flex items-center gap-1">
                <Clock size={11} className="text-slate-400" />
                <span>{event.date} {event.time}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-1">
                  <MapPin size={11} className="text-slate-400" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>

            {/* Description / Source link */}
            {event.description && (
              <p className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100 line-clamp-2">
                {event.description}
              </p>
            )}

            {event.sourceMessageId && onOpenMessageFromEvent && (
              <button
                type="button"
                onClick={() => onOpenMessageFromEvent(event.sourceMessageId)}
                className="mt-1 text-[10.5px] text-cool-600 hover:text-cool-800 font-semibold underline flex items-center gap-1"
              >
                ✉️ 관련 쪽지 원문 바로가기
              </button>
            )}
          </div>
        );
      })}

      {displayEvents.length === 0 && (
        <div className="text-center py-8 text-slate-400 text-xs">
          등록된 일정이 없습니다.
        </div>
      )}
    </div>
  );
}
