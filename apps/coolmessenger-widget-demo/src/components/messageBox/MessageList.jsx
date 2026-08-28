import React from 'react';
import { Star, Paperclip } from 'lucide-react';
import { SCHOOL_MEMBERS } from '../../data/initialData';

export default function MessageList({
  messages = [],
  selectedMessageId,
  onSelectMessage,
  onToggleStar,
  searchQuery = '',
}) {
  const memberMap = Object.fromEntries(SCHOOL_MEMBERS.map(m => [m.id, m]));

  const filteredMessages = messages.filter(m => {
    if (!searchQuery.trim()) return true;
    const sender = memberMap[m.fromId];
    const senderName = sender ? sender.name : '';
    return (
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      senderName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="w-[380px] border-r border-slate-200 flex flex-col min-h-0 bg-white select-none">
      {/* Table Header */}
      <div className="bg-slate-100 border-b border-slate-200 grid grid-cols-[30px_95px_1fr_95px_30px] items-center text-[11px] font-semibold text-slate-600 py-1.5 px-2">
        <span className="text-center">★</span>
        <span>보낸사람</span>
        <span>제목</span>
        <span>날짜/시간</span>
        <span className="text-center">첨부</span>
      </div>

      {/* Message Rows */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 text-xs">
        {filteredMessages.map(msg => {
          const isSelected = msg.id === selectedMessageId;
          const sender = memberMap[msg.fromId];
          const senderLabel = sender ? `${sender.name}(${sender.department || sender.title})` : '교직원';

          return (
            <div
              key={msg.id}
              onClick={() => onSelectMessage(msg.id)}
              className={`grid grid-cols-[30px_95px_1fr_95px_30px] items-center py-2 px-2 cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-[#1e88e5] text-white'
                  : msg.unread
                  ? 'bg-blue-50/40 text-slate-900 font-semibold hover:bg-slate-50'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {/* Star */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStar(msg.id);
                }}
                className="text-center flex items-center justify-center text-slate-400 hover:text-amber-500"
              >
                <Star
                  size={13}
                  className={msg.starred ? 'fill-amber-400 text-amber-400' : isSelected ? 'text-white/60' : 'text-slate-300'}
                />
              </button>

              {/* Sender */}
              <span className={`truncate text-[11px] pr-1 ${isSelected ? 'text-white' : ''}`}>
                {senderLabel}
              </span>

              {/* Subject */}
              <div className="truncate pr-1">
                <span className={`text-[11.5px] truncate ${isSelected ? 'text-white font-medium' : ''}`}>
                  {msg.subject}
                </span>
              </div>

              {/* Date */}
              <span className={`text-[10px] tabular-nums whitespace-nowrap ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                {msg.dateLabel ? msg.dateLabel.split(' ')[0].replace('2026/', '') + ' ' + msg.dateLabel.split(' ')[1]?.substring(0, 5) : '08/26 17:05'}
              </span>

              {/* Attachment */}
              <div className="flex items-center justify-center">
                {msg.attachments && msg.attachments.length > 0 && (
                  <Paperclip size={12} className={isSelected ? 'text-white' : 'text-slate-400'} />
                )}
              </div>
            </div>
          );
        })}

        {filteredMessages.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-xs">
            메시지가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
