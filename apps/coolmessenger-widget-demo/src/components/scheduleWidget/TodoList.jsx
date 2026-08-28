import React, { useCallback, useMemo, useState } from 'react';
import { Plus, Check, Trash2, Link, Star, GripVertical, ChevronDown, ChevronUp, CalendarDays } from 'lucide-react';
import { pinnedSorted, pinOrderBetween, splitByDone } from '../../utils/listOrdering';
import { useDragReorder } from '../../utils/useDragReorder';

// 할 일 목록.
//
// 쿨메신저에서 가져온 «일정»도 여기 함께 뜬다. 교사가 실제로 하는 일은 «오늘 뭘
// 해치워야 하나» 하나인데, 가져온 일정과 직접 적은 할 일이 서로 다른 탭에 나뉘어
// 있으면 두 곳을 오가며 확인해야 한다.
//
// EventList 가 할 일을 일정 목록에 섞어 그리는 것과 같은 방식이다 — 배열을 따로
// 만들어 동기화하지 않고, 양쪽 탭이 같은 객체를 모양만 달리해 그린다. 그래서 여기서
// 체크하면 일정 목록에서도 곧바로 취소선이 그어지고 맨 아래로 내려간다.

export default function TodoList({
  todos = [],
  events = [],
  onToggleItem,
  onAddTodo,
  onDeleteItem,
  onOpenMessage,
  onToggleStar,
  onReorder,
}) {
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoDate, setNewTodoDate] = useState('2026-08-28');
  const [showDone, setShowDone] = useState(false);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    onAddTodo({
      id: 'todo-' + Date.now(),
      text: newTodoText.trim(),
      dueDate: newTodoDate,
      completed: false,
      priority: 'medium',
    });
    setNewTodoText('');
  };

  // 할 일과 일정을 한 모양으로 맞춘다. kind 로 어느 저장소에 되돌려 쓸지 가른다.
  const items = useMemo(() => {
    const todoItems = todos.map((t) => ({
      kind: 'todo',
      id: t.id,
      text: t.text,
      dueDate: t.dueDate,
      completed: t.completed,
      starred: t.starred,
      pinOrder: t.pinOrder,
      linkedMessageId: t.linkedMessageId,
    }));
    const eventItems = events.map((e) => ({
      kind: 'event',
      id: e.id,
      text: e.title,
      dueDate: e.date,
      time: e.time,
      completed: e.completed,
      starred: e.starred,
      pinOrder: e.pinOrder,
    }));
    return [...todoItems, ...eventItems];
  }, [todos, events]);

  const canDrag = !!onReorder;

  const commitDrag = useCallback(
    (id, target) => {
      const dragged = items.find((it) => it.id === id);
      if (!dragged) return;
      const pinned = pinnedSorted(items).filter((it) => it.id !== id);
      let order;
      if (target.toPinnedEnd) {
        const last = pinned[pinned.length - 1];
        order = pinOrderBetween(last ? last.pinOrder : null, null);
      } else {
        const idx = pinned.findIndex((it) => it.id === target.targetId);
        if (idx === -1) {
          const last = pinned[pinned.length - 1];
          order = pinOrderBetween(last ? last.pinOrder : null, null);
        } else {
          const before = idx > 0 ? pinned[idx - 1] : null;
          order = pinOrderBetween(before ? before.pinOrder : null, pinned[idx].pinOrder);
        }
      }
      onReorder(dragged.kind, id, order);
    },
    [items, onReorder],
  );

  const { draggingId, overId, onHandlePointerDown } = useDragReorder(commitDrag);

  const byDue = (a, b) => String(a.dueDate ?? '').localeCompare(String(b.dueDate ?? ''));
  const sorted = [...items].sort(byDue);
  const { open, done } = splitByDone(sorted);
  const pinned = pinnedSorted(open);
  const pinnedIds = new Set(pinned.map((t) => t.id));
  const rest = open.filter((t) => !pinnedIds.has(t.id));

  const row = (item) => (
    <div
      key={item.id}
      data-reorder-id={item.id}
      onClick={() => onToggleItem?.(item.kind, item.id)}
      className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
        draggingId === item.id ? 'opacity-50' : ''
      } ${
        overId === item.id
          ? 'border-slate-900 border-dashed'
          : item.completed
            ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-70'
            : 'bg-white border-slate-200 hover:border-cool-300 text-slate-800'
      }`}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {canDrag && !item.completed && (
          <span
            onPointerDown={onHandlePointerDown(item.id)}
            onClick={(e) => e.stopPropagation()}
            style={{ touchAction: 'none' }}
            className="shrink-0 cursor-grab text-slate-300 hover:text-slate-500 active:cursor-grabbing"
            title="끌어서 순서 바꾸기"
          >
            <GripVertical size={13} />
          </span>
        )}
        <div
          className={`size-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
            item.completed
              ? 'bg-cool-600 border-cool-600 text-white'
              : 'border-slate-300 bg-white'
          }`}
        >
          {item.completed && <Check size={11} />}
        </div>

        <div className="min-w-0 flex-1">
          <span className={`text-[12px] block truncate ${item.completed ? 'line-through' : 'font-medium'}`}>
            {item.text}
          </span>
          <span className="flex items-center gap-1 text-[10.5px] text-slate-400">
            {/* 가져온 일정인지 직접 적은 할 일인지 한눈에 — 지울 때 되돌리기 어렵기 때문이다 */}
            {item.kind === 'event' && (
              <CalendarDays size={9.5} className="shrink-0" aria-label="일정에서 온 항목" />
            )}
            기한: {item.dueDate}
            {item.kind === 'event' && item.time ? ` ${item.time}` : ''}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
        {onToggleStar && !item.completed && (
          <button
            type="button"
            onClick={() => onToggleStar(item.kind, item.id)}
            className="p-1 text-slate-300 hover:bg-slate-100 rounded"
            title={item.starred ? '중요 표시 해제' : '중요 표시 (맨 위로 고정)'}
          >
            <Star size={13} className={item.starred ? 'fill-amber-400 text-amber-400' : ''} />
          </button>
        )}
        {item.linkedMessageId && onOpenMessage && (
          <button
            type="button"
            onClick={() => onOpenMessage(item.linkedMessageId)}
            className="text-cool-600 hover:text-cool-800 p-1"
            title="연동된 쪽지 보기"
          >
            <Link size={12} />
          </button>
        )}
        <button
          type="button"
          onClick={() => onDeleteItem?.(item.kind, item.id)}
          className="text-slate-300 hover:text-rose-500 p-1"
          title={item.kind === 'event' ? '이 일정 삭제 (캘린더에서도 없어집니다)' : '삭제'}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 select-none text-xs">
      {/* Quick Add Form */}
      <form onSubmit={handleCreate} className="flex items-center gap-1.5 mb-2.5">
        <input
          type="text"
          placeholder="새로운 할 일 입력 (예: 2-3 생기부 점검)"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-[11.5px] outline-none focus:border-cool-500"
        />
        <input
          type="date"
          value={newTodoDate}
          onChange={(e) => setNewTodoDate(e.target.value)}
          className="border border-slate-300 rounded px-1 py-1 text-[10.5px] bg-white outline-none w-28"
        />
        <button
          type="submit"
          className="bg-cool-600 hover:bg-cool-700 text-white p-1 rounded transition-colors"
          title="추가"
        >
          <Plus size={15} />
        </button>
      </form>

      {/* Todo Items */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {(pinned.length > 0 || draggingId) && (
          <div data-reorder-zone="pinned" className="mb-1.5 space-y-1.5">
            <div className="flex items-center gap-1 px-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-600">
              <Star size={10} className="fill-amber-400 text-amber-400" /> 중요 표시
            </div>
            {pinned.length === 0 ? (
              <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/50 px-3 py-3 text-center text-[10.5px] text-amber-700">
                여기로 끌어오거나 별표를 눌러 고정하세요
              </div>
            ) : (
              pinned.map(row)
            )}
          </div>
        )}

        {rest.map(row)}

        {/* 완료한 것은 맨 아래로 내려 접어 둔다 */}
        {done.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => setShowDone(!showDone)}
              className="flex w-full items-center justify-center gap-1 rounded-md py-1.5 text-[10.5px] text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            >
              {showDone ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              완료 {done.length}건
            </button>
            {showDone && done.map(row)}
          </>
        )}

        {items.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-xs">
            등록된 할 일이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
