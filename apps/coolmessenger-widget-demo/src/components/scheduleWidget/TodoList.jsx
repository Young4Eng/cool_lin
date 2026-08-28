import React, { useCallback, useState } from 'react';
import { Plus, Check, Trash2, Link, Star, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { pinnedSorted, pinOrderBetween, splitByDone } from '../../utils/listOrdering';
import { useDragReorder } from '../../utils/useDragReorder';

export default function TodoList({
  todos = [],
  onToggleTodo,
  onAddTodo,
  onDeleteTodo,
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

  const canDrag = !!onReorder;

  const commitDrag = useCallback(
    (id, target) => {
      const pinned = pinnedSorted(todos).filter((t) => t.id !== id);
      let order;
      if (target.toPinnedEnd) {
        const last = pinned[pinned.length - 1];
        order = pinOrderBetween(last ? last.pinOrder : null, null);
      } else {
        const idx = pinned.findIndex((t) => t.id === target.targetId);
        if (idx === -1) {
          const last = pinned[pinned.length - 1];
          order = pinOrderBetween(last ? last.pinOrder : null, null);
        } else {
          const before = idx > 0 ? pinned[idx - 1] : null;
          order = pinOrderBetween(before ? before.pinOrder : null, pinned[idx].pinOrder);
        }
      }
      onReorder(id, order);
    },
    [todos, onReorder],
  );

  const { draggingId, overId, onHandlePointerDown } = useDragReorder(commitDrag);

  const { open, done } = splitByDone(todos);
  const pinned = pinnedSorted(open);
  const pinnedIds = new Set(pinned.map((t) => t.id));
  const rest = open.filter((t) => !pinnedIds.has(t.id));

  const row = (todo) => (
    <div
      key={todo.id}
      data-reorder-id={todo.id}
      onClick={() => onToggleTodo(todo.id)}
      className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
        draggingId === todo.id ? 'opacity-50' : ''
      } ${
        overId === todo.id
          ? 'border-slate-900 border-dashed'
          : todo.completed
            ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-70'
            : 'bg-white border-slate-200 hover:border-cool-300 text-slate-800'
      }`}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {canDrag && !todo.completed && (
          <span
            onPointerDown={onHandlePointerDown(todo.id)}
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
            todo.completed
              ? 'bg-cool-600 border-cool-600 text-white'
              : 'border-slate-300 bg-white'
          }`}
        >
          {todo.completed && <Check size={11} />}
        </div>

        <div className="min-w-0 flex-1">
          <span className={`text-[12px] block truncate ${todo.completed ? 'line-through' : 'font-medium'}`}>
            {todo.text}
          </span>
          <span className="text-[10.5px] text-slate-400">
            기한: {todo.dueDate}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
        {onToggleStar && !todo.completed && (
          <button
            type="button"
            onClick={() => onToggleStar(todo.id)}
            className="p-1 text-slate-300 hover:bg-slate-100 rounded"
            title={todo.starred ? '중요 표시 해제' : '중요 표시 (맨 위로 고정)'}
          >
            <Star size={13} className={todo.starred ? 'fill-amber-400 text-amber-400' : ''} />
          </button>
        )}
        {todo.linkedMessageId && onOpenMessage && (
          <button
            type="button"
            onClick={() => onOpenMessage(todo.linkedMessageId)}
            className="text-cool-600 hover:text-cool-800 p-1"
            title="연동된 쪽지 보기"
          >
            <Link size={12} />
          </button>
        )}
        <button
          type="button"
          onClick={() => onDeleteTodo(todo.id)}
          className="text-slate-300 hover:text-rose-500 p-1"
          title="삭제"
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

        {todos.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-xs">
            등록된 할 일이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
