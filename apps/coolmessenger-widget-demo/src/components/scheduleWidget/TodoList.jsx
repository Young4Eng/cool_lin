import React, { useState } from 'react';
import { Plus, Check, Trash2, Link } from 'lucide-react';

export default function TodoList({
  todos = [],
  onToggleTodo,
  onAddTodo,
  onDeleteTodo,
  onOpenMessage,
}) {
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoDate, setNewTodoDate] = useState('2026-08-28');

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
        {todos.map(todo => (
          <div
            key={todo.id}
            onClick={() => onToggleTodo(todo.id)}
            className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
              todo.completed
                ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-70'
                : 'bg-white border-slate-200 hover:border-cool-300 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
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
        ))}

        {todos.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-xs">
            등록된 할 일이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
