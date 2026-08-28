import React, { useCallback, useMemo, useState } from 'react';
import { Clock, MapPin, Trash2, CheckCircle2, ChevronDown, ChevronUp, Star, Check, GripVertical } from 'lucide-react';
import { eventSummary } from '../../utils/summarizeMessage';
import { pinnedSorted, pinOrderBetween, splitByDone } from '../../utils/listOrdering';
import { useDragReorder } from '../../utils/useDragReorder';

// 카드에는 «무엇을 · 언제 · 무슨 내용» 셋만 둔다.
//
// 예전에는 분류·AI·신뢰도·확인표시·판단근거·원문안내가 카드마다 줄줄이 붙어 있었다.
// 위젯은 흘깃 보는 자리라 그 줄들은 정작 알고 싶은 «무슨 얘기냐»를 밀어냈다.
// 엔진이 어떻게 판단했는지는 검토함에서만 보여 준다.
//
// 「할 일」도 여기 섞여 나온다(mode="calendar" 이고 todos 가 오면). 별도 배열을
// 만들어 동기화하는 대신, 할 일 탭이 쓰는 바로 그 객체를 카드로만 다르게 그린다 —
// 그래서 완료 체크는 어디서 눌러도 항상 같은 상태를 가리킨다.

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
        ? 'bg-[#1D1715] text-white'
        : days > 0
          ? 'bg-[#F0EFEB] text-[#5B5550]'
          : 'bg-[#F8F8F5] text-[#A8A29B]';
  return (
    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${tone}`}>
      {label}
    </span>
  );
}

function ItemCard({
  item,
  mode,
  onDeleteEvent,
  onOpenSource,
  onApproveEvent,
  onToggleTodo,
  onToggleStar,
  onHandlePointerDown,
  isDragging,
  isDragOver,
}) {
  const [expanded, setExpanded] = useState(false);
  const isTodo = item.kind === 'todo';
  const days = dDay(item.date);
  const flags = item.ambiguityFlags ?? [];
  const summary = isTodo ? '' : eventSummary(item);

  return (
    <article
      data-reorder-id={item.id}
      onDoubleClick={() => !isTodo && onOpenSource?.(item)}
      title={!isTodo && item.source ? '더블클릭 — 쪽지 원문 보기' : undefined}
      className={`group rounded-lg border bg-white px-3 py-2.5 transition-colors ${
        isDragging ? 'opacity-50' : ''
      } ${
        isDragOver
          ? 'border-[#1D1715] border-dashed'
          : days === 0 && !item.completed
            ? 'border-[#D6D3CC]'
            : 'border-[#E5E4E0]'
      } ${onOpenSource && !isTodo ? 'hover:border-[#C9C5BD] hover:bg-[#FCFCFA]' : ''}`}
    >
      <div className="flex items-start gap-2">
        {onHandlePointerDown && (
          <span
            onPointerDown={onHandlePointerDown(item.id)}
            style={{ touchAction: 'none' }}
            className="mt-0.5 shrink-0 cursor-grab text-[#C9C5BD] hover:text-[#5B5550] active:cursor-grabbing"
            title="끌어서 순서 바꾸기"
          >
            <GripVertical size={13} />
          </span>
        )}

        {isTodo && (
          <button
            type="button"
            onClick={() => onToggleTodo?.(item.id)}
            className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition-colors ${
              item.completed ? 'border-[#1D1715] bg-[#1D1715] text-white' : 'border-[#C9C5BD] bg-white'
            }`}
            aria-label={item.completed ? '완료 취소' : '완료로 표시'}
          >
            {item.completed && <Check size={11} />}
          </button>
        )}

        {/* 제목이 가장 크고 굵다 — 흘깃 볼 때 이것만 읽힌다 */}
        <h3
          className={`min-w-0 flex-1 text-[13px] font-semibold leading-snug ${
            item.completed ? 'text-[#A8A29B] line-through' : 'text-[#1D1715]'
          }`}
        >
          {item.title}
        </h3>

        {onToggleStar && !item.completed && (
          <button
            type="button"
            onClick={() => onToggleStar(item.kind, item.id)}
            className="shrink-0 rounded p-0.5 text-[#C9C5BD] hover:bg-[#F0EFEB]"
            title={item.starred ? '중요 표시 해제' : '중요 표시 (맨 위로 고정)'}
            aria-label={item.starred ? '중요 표시 해제' : '중요 표시'}
          >
            <Star size={13} className={item.starred ? 'fill-amber-400 text-amber-400' : ''} />
          </button>
        )}

        {!isTodo && <DDayLabel days={days} />}
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 pl-0.5 text-[11px] text-[#7A736C]">
        <span className="flex items-center gap-1 tabular-nums">
          <Clock size={10.5} className="text-[#A8A29B]" />
          {item.date}
          {item.time ? ` ${item.time}` : ''}
        </span>
        {item.location && (
          <span className="flex min-w-0 items-center gap-1">
            <MapPin size={10.5} className="shrink-0 text-[#A8A29B]" />
            <span className="truncate">{item.location}</span>
          </span>
        )}
      </div>

      {/* 무슨 내용인지 — 원문에서 인사말을 걷어낸 첫 문장 */}
      {summary && (
        <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-relaxed text-[#5B5550]">{summary}</p>
      )}

      {/* 검토함에서만: 왜 자동으로 넣지 않았는지 */}
      {mode === 'review' && (
        <div className="mt-2 border-t border-[#EFEEEA] pt-2">
          {flags.length > 0 && (
            <p className="mb-1 text-[10.5px] leading-relaxed text-amber-700">
              확인 필요 — {flags.join(' · ')}
            </p>
          )}
          {item.autoRegisterBlockers?.length > 0 && (
            <p className="mb-1.5 text-[10.5px] leading-relaxed text-[#7A736C]">
              자동 등록하지 않은 이유 — {item.autoRegisterBlockers.join(' · ')}
            </p>
          )}
          {item.reasoning?.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="mb-1.5 flex items-center gap-0.5 text-[10.5px] font-medium text-[#7A736C] hover:text-[#1D1715]"
              >
                {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                판단 근거
              </button>
              {expanded && (
                <ul className="mb-1.5 list-disc space-y-0.5 pl-4 text-[10.5px] leading-relaxed text-[#7A736C]">
                  {item.reasoning.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
            </>
          )}
          <button
            type="button"
            onClick={() => onApproveEvent?.(item.id)}
            className="flex w-full items-center justify-center gap-1 rounded-md bg-[#1D1715] py-1.5 text-[11px] font-semibold text-white hover:bg-[#3A322D]"
          >
            <CheckCircle2 size={12} /> 캘린더에 반영
          </button>
        </div>
      )}

      {/* 삭제는 평소에 숨겨 둔다 — 흘깃 보는 화면에 위험한 버튼을 상시 노출하지 않는다 */}
      {!isTodo && (
        <div className="mt-1 flex justify-end">
          <button
            type="button"
            onClick={() => onDeleteEvent?.(item.id)}
            className="rounded p-0.5 text-[#C9C5BD] opacity-0 transition-opacity hover:text-rose-600 focus:opacity-100 group-hover:opacity-100"
            title="이 일정 삭제"
            aria-label={`${item.title} 삭제`}
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </article>
  );
}

function Scroller({ children }) {
  return <div className="flex-1 space-y-1.5 overflow-y-auto pr-0.5 select-none">{children}</div>;
}

function Empty({ children }) {
  return (
    <div className="px-2 py-10 text-center text-[11.5px] leading-relaxed text-[#A8A29B]">{children}</div>
  );
}

export default function EventList({
  events = [],
  todos,
  selectedDate,
  onDeleteEvent,
  onOpenSource,
  onApproveEvent,
  onToggleTodo,
  onToggleStar,
  onReorder,
  mode = 'calendar', // 'calendar' | 'review'
}) {
  const [showPast, setShowPast] = useState(false);
  const [showDone, setShowDone] = useState(false);

  // 할 일도 섞어서 하나의 흐름으로 보여 준다 — mode="calendar" 이고 todos 가 왔을 때만.
  const combined = useMemo(() => {
    const eventItems = events.map((e) => ({ ...e, kind: 'event' }));
    if (mode !== 'calendar' || !todos) return eventItems;
    const todoItems = todos.map((t) => ({
      kind: 'todo',
      id: t.id,
      title: t.text,
      date: t.dueDate,
      time: '',
      completed: t.completed,
      starred: t.starred,
      pinOrder: t.pinOrder,
      priority: t.priority,
    }));
    return [...eventItems, ...todoItems];
  }, [events, todos, mode]);

  const canDrag = mode === 'calendar' && !!onReorder;

  const commitDrag = useCallback(
    (id, target) => {
      const dragged = combined.find((it) => it.id === id);
      if (!dragged) return;
      const pinned = pinnedSorted(combined).filter((it) => it.id !== id);

      let order;
      if (target.toPinnedEnd) {
        const last = pinned[pinned.length - 1];
        order = pinOrderBetween(last ? last.pinOrder : null, null);
      } else {
        const idx = pinned.findIndex((it) => it.id === target.targetId);
        if (idx === -1) {
          // 고정 영역 밖의 카드 위에 놓았다 — 고정 목록 맨 끝으로 보낸다.
          const last = pinned[pinned.length - 1];
          order = pinOrderBetween(last ? last.pinOrder : null, null);
        } else {
          const before = idx > 0 ? pinned[idx - 1] : null;
          order = pinOrderBetween(before ? before.pinOrder : null, pinned[idx].pinOrder);
        }
      }
      onReorder(dragged.kind, id, order);
    },
    [combined, onReorder],
  );

  const { draggingId, overId, onHandlePointerDown } = useDragReorder(commitDrag);

  const card = (item) => (
    <ItemCard
      key={item.id}
      item={item}
      mode={mode}
      onHandlePointerDown={canDrag && !item.completed ? onHandlePointerDown : null}
      isDragging={draggingId === item.id}
      isDragOver={overId === item.id}
      onDeleteEvent={onDeleteEvent}
      onOpenSource={onOpenSource}
      onApproveEvent={onApproveEvent}
      onToggleTodo={onToggleTodo}
      onToggleStar={onToggleStar}
    />
  );

  const pinnedZone = (pinned) => {
    if (pinned.length === 0 && !draggingId) return null;
    return (
      <div data-reorder-zone="pinned" className="mb-1.5 space-y-1.5">
        <div className="flex items-center gap-1 px-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-600">
          <Star size={10} className="fill-amber-400 text-amber-400" /> 중요 표시
        </div>
        {pinned.length === 0 ? (
          <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/50 px-3 py-3 text-center text-[10.5px] text-amber-700">
            여기로 끌어오거나 별표를 눌러 고정하세요
          </div>
        ) : (
          pinned.map(card)
        )}
      </div>
    );
  };

  // 완료한 것은 어느 목록에서든 맨 아래로 내려 접어 둔다.
  const doneGroup = (done) =>
    done.length > 0 && (
      <>
        <button
          type="button"
          onClick={() => setShowDone(!showDone)}
          className="flex w-full items-center justify-center gap-1 rounded-md py-1.5 text-[10.5px] text-[#A8A29B] hover:bg-[#F8F8F5] hover:text-[#5B5550]"
        >
          {showDone ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          완료 {done.length}건
        </button>
        {showDone && done.map(card)}
      </>
    );

  const byTime = (a, b) =>
    `${a.date} ${a.time || '00:00'}`.localeCompare(`${b.date} ${b.time || '00:00'}`);

  // 날짜를 고른 경우에는 그 날 것만, 지났든 아니든 그대로 보여 준다.
  if (selectedDate) {
    const forDate = combined.filter((it) => it.date === selectedDate).sort(byTime);
    const { open, done } = splitByDone(forDate);
    const pinned = pinnedSorted(open);
    const pinnedIds = new Set(pinned.map((it) => it.id));
    const rest = open.filter((it) => !pinnedIds.has(it.id));
    return (
      <Scroller>
        {pinnedZone(pinned)}
        {rest.length === 0 && pinned.length === 0 && done.length === 0 ? (
          <Empty>이 날에는 일정이 없습니다.</Empty>
        ) : (
          rest.map(card)
        )}
        {doneGroup(done)}
      </Scroller>
    );
  }

  const sorted = [...combined].sort(byTime);
  const { open, done } = splitByDone(sorted);
  const pinned = pinnedSorted(open);
  const pinnedIds = new Set(pinned.map((it) => it.id));
  const unpinned = open.filter((it) => !pinnedIds.has(it.id));

  // 「다가오는 일정」이라고 써 놓고 지난 것을 맨 위에 두면 안 된다.
  // 흘깃 보는 화면이라 맨 위 두세 줄이 전부다. 지난 일정은 접어 둔다.
  const past = [];
  const upcoming = [];
  for (const it of unpinned) {
    const d = dDay(it.date);
    if (d !== null && d < 0) past.push(it);
    else upcoming.push(it);
  }

  if (upcoming.length === 0 && past.length === 0 && pinned.length === 0 && done.length === 0) {
    return (
      <Scroller>
        <Empty>{mode === 'review' ? '검토할 일정이 없습니다.' : '표시할 일정이 없습니다.'}</Empty>
      </Scroller>
    );
  }

  return (
    <Scroller>
      {pinnedZone(pinned)}

      {upcoming.length > 0
        ? upcoming.map(card)
        : pinned.length === 0 && past.length === 0 && <Empty>다가오는 일정이 없습니다.</Empty>}

      {past.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setShowPast(!showPast)}
            className="flex w-full items-center justify-center gap-1 rounded-md py-1.5 text-[10.5px] text-[#A8A29B] hover:bg-[#F8F8F5] hover:text-[#5B5550]"
          >
            {showPast ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            지난 일정 {past.length}건
          </button>
          {showPast && past.slice().reverse().map(card)}
        </>
      )}

      {doneGroup(done)}
    </Scroller>
  );
}
