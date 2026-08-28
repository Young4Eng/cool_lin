import React, { useState } from 'react';
import { Clock, MapPin, Trash2, CheckCircle2, ChevronDown, ChevronUp, Mail } from 'lucide-react';

// 카드 하나에 색을 여러 개 쓰지 않는다.
//
// 예전에는 분류·AI·신뢰도·확인표시·D-Day 가 저마다 색 배지를 달고 있어서, 한 화면에
// 색이 여섯 가지씩 떴다. 교사가 위젯을 흘깃 볼 때 필요한 것은 «무엇을 언제»이지
// 배지 색이 아니다. 위계는 색이 아니라 **크기와 굵기**로 만들고, 색은 오늘/지남처럼
// 정말 다른 상태에만 쓴다.

/** 로컬 자정 기준으로 날짜 차이를 센다. 위젯은 매일 켜져 있으므로 오늘은 «진짜 오늘»이다. */
export function dDay(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  return Math.round((target - today) / 86400000);
}

function DDayLabel({ days }) {
  if (days === null) return null;
  const label = days === 0 ? '오늘' : days > 0 ? `D-${days}` : `${-days}일 지남`;
  const tone =
    days === 0
      ? 'bg-rose-600 text-white'
      : days > 0 && days <= 3
        ? 'bg-slate-900 text-white'
        : days > 0
          ? 'bg-slate-100 text-slate-600'
          : 'bg-slate-50 text-slate-400';
  return (
    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${tone}`}>
      {label}
    </span>
  );
}

function EventCard({ event, mode, onDeleteEvent, onOpenSource, onApproveEvent }) {
  const [expanded, setExpanded] = useState(false);
  const days = dDay(event.date);
  const flags = event.ambiguityFlags ?? [];

  return (
    <article
      onDoubleClick={() => onOpenSource?.(event)}
      title={event.source ? '더블클릭 — 쪽지 원문 보기' : undefined}
      className={`group rounded-lg border bg-white px-3 py-2.5 transition-colors ${
        days === 0 ? 'border-slate-300' : 'border-slate-200'
      } ${onOpenSource ? 'hover:border-slate-300 hover:bg-slate-50/60' : ''}`}
    >
      {/* 제목이 가장 크고 굵다 — 흘깃 볼 때 이것만 읽힌다 */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 text-[13px] font-semibold leading-snug text-slate-900">{event.title}</h3>
        <DDayLabel days={days} />
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
        <span className="flex items-center gap-1 tabular-nums">
          <Clock size={10.5} className="text-slate-400" />
          {event.date}
          {event.time ? ` ${event.time}` : ''}
        </span>
        {event.location && (
          <span className="flex min-w-0 items-center gap-1">
            <MapPin size={10.5} className="shrink-0 text-slate-400" />
            <span className="truncate">{event.location}</span>
          </span>
        )}
      </div>

      {/* 분류·출처는 조용한 한 줄로 */}
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-400">
        <span className="font-medium">{event.category || '업무'}</span>
        {event.fromAi && (
          <>
            <span aria-hidden>·</span>
            <span>쪽지에서 자동 추출</span>
          </>
        )}
        {event.confidenceBand && event.confidenceBand !== '높음' && (
          <>
            <span aria-hidden>·</span>
            <span className="text-amber-600">신뢰도 {event.confidenceBand}</span>
          </>
        )}
        {event.source && (
          <>
            <span aria-hidden>·</span>
            <span className="flex items-center gap-0.5 group-hover:text-slate-600">
              <Mail size={9} /> 더블클릭 원문
            </span>
          </>
        )}
      </div>

      {flags.length > 0 && (
        <p className="mt-1.5 text-[10.5px] leading-relaxed text-amber-700">
          확인 필요 — {flags.join(' · ')}
        </p>
      )}

      {event.reasoning?.length > 0 && (
        <div className="mt-1.5">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-0.5 text-[10.5px] font-medium text-slate-500 hover:text-slate-800"
          >
            {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            판단 근거
          </button>
          {expanded && (
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[10.5px] leading-relaxed text-slate-500">
              {event.reasoning.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {mode === 'review' && (
        <div className="mt-2 border-t border-slate-100 pt-2">
          {event.autoRegisterBlockers?.length > 0 && (
            <p className="mb-1.5 text-[10.5px] leading-relaxed text-slate-500">
              자동 등록하지 않은 이유 — {event.autoRegisterBlockers.join(' · ')}
            </p>
          )}
          <button
            type="button"
            onClick={() => onApproveEvent?.(event.id)}
            className="flex w-full items-center justify-center gap-1 rounded-md bg-slate-900 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-700"
          >
            <CheckCircle2 size={12} /> 캘린더에 반영
          </button>
        </div>
      )}

      {/* 삭제는 평소에 숨겨 둔다 — 흘깃 보는 화면에 위험한 버튼을 상시 노출하지 않는다 */}
      <div className="mt-1 flex justify-end">
        <button
          type="button"
          onClick={() => onDeleteEvent?.(event.id)}
          className="rounded p-0.5 text-slate-300 opacity-0 transition-opacity hover:text-rose-600 focus:opacity-100 group-hover:opacity-100"
          title="이 일정 삭제"
          aria-label={`${event.title} 삭제`}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </article>
  );
}

function Scroller({ children }) {
  return <div className="flex-1 space-y-1.5 overflow-y-auto pr-0.5 select-none">{children}</div>;
}

function Empty({ children }) {
  return (
    <div className="px-2 py-10 text-center text-[11.5px] leading-relaxed text-slate-400">{children}</div>
  );
}

export default function EventList({
  events = [],
  selectedDate,
  onDeleteEvent,
  onOpenSource,
  onApproveEvent,
  mode = 'calendar', // 'calendar' | 'review'
}) {
  const [showPast, setShowPast] = useState(false);

  const sorted = [...events].sort((a, b) =>
    `${a.date} ${a.time || '00:00'}`.localeCompare(`${b.date} ${b.time || '00:00'}`),
  );

  const card = (e) => (
    <EventCard
      key={e.id}
      event={e}
      mode={mode}
      onDeleteEvent={onDeleteEvent}
      onOpenSource={onOpenSource}
      onApproveEvent={onApproveEvent}
    />
  );

  // 날짜를 고른 경우에는 그 날 것만, 지났든 아니든 그대로 보여 준다.
  if (selectedDate) {
    const forDate = sorted.filter((e) => e.date === selectedDate);
    return (
      <Scroller>
        {forDate.length === 0 ? <Empty>이 날에는 일정이 없습니다.</Empty> : forDate.map(card)}
      </Scroller>
    );
  }

  // 「다가오는 일정」이라고 써 놓고 지난 것을 맨 위에 두면 안 된다.
  // 흘깃 보는 화면이라 맨 위 두세 줄이 전부다. 지난 일정은 접어 둔다.
  const past = [];
  const upcoming = [];
  for (const e of sorted) {
    const d = dDay(e.date);
    if (d !== null && d < 0) past.push(e);
    else upcoming.push(e);
  }

  if (upcoming.length === 0 && past.length === 0) {
    return (
      <Scroller>
        <Empty>{mode === 'review' ? '검토할 일정이 없습니다.' : '표시할 일정이 없습니다.'}</Empty>
      </Scroller>
    );
  }

  return (
    <Scroller>
      {upcoming.length > 0 ? upcoming.map(card) : <Empty>다가오는 일정이 없습니다.</Empty>}

      {past.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setShowPast(!showPast)}
            className="flex w-full items-center justify-center gap-1 rounded-md py-1.5 text-[10.5px] text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          >
            {showPast ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            지난 일정 {past.length}건
          </button>
          {showPast && past.slice().reverse().map(card)}
        </>
      )}
    </Scroller>
  );
}
