import React, { useState } from 'react';
import { Send, Paperclip, Smile, Sparkles } from 'lucide-react';
import WindowFrame from '../desktop/WindowFrame';
import { UserStatusIcon } from '../common/Icons';

export default function ChatWindow({
  isOpen,
  isMinimized,
  zIndex,
  onFocus,
  onMinimize,
  onMaximize,
  onClose,
  targetMember,
  chatHistory = [],
  onSendMessage,
}) {
  const [inputText, setInputText] = useState('');

  if (!isOpen || isMinimized || !targetMember) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(targetMember.id, {
      id: 'c-' + Date.now(),
      senderId: 'p-seojun',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    });
    setInputText('');
  };

  return (
    <WindowFrame
      id={`chat-${targetMember.id}`}
      title={`${targetMember.name}(${targetMember.title}, ${targetMember.ext})`}
      icon={<UserStatusIcon status={targetMember.status} size={15} />}
      isOpen={isOpen}
      isMinimized={isMinimized}
      zIndex={zIndex}
      onFocus={onFocus}
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      width={400}
      height={520}
      minWidth={320}
      minHeight={380}
      defaultPosition={{ x: 220, y: 100 }}
      headerStyle="default"
    >
      {/* Target Member Header Info */}
      <div className="bg-cool-50 border-b border-cool-100 px-3 py-2 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-2">
          <div className="bg-white p-1 rounded-full border border-cool-200">
            <UserStatusIcon status={targetMember.status} size={18} />
          </div>
          <div>
            <div className="font-bold text-slate-800 text-[12.5px]">{targetMember.name} 선생님</div>
            <div className="text-[10.5px] text-slate-500">{targetMember.department} | 내선 {targetMember.ext} | {targetMember.room}</div>
          </div>
        </div>
        <span className="text-[10.5px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-medium">
          수신가능
        </span>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50 text-xs">
        {chatHistory.map((chat) => (
          <div
            key={chat.id}
            className={`flex flex-col ${chat.isMe ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[80%] p-2.5 rounded-xl whitespace-pre-line text-[11.5px] leading-relaxed shadow-2xs ${
                chat.isMe
                  ? 'bg-cool-600 text-white rounded-br-none'
                  : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'
              }`}
            >
              {chat.text}
            </div>
            <span className="text-[9.5px] text-slate-400 mt-0.5 px-1">{chat.time}</span>
          </div>
        ))}

        {chatHistory.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-xs">
            대화 내용이 없습니다. 메시지를 보내 대화를 시작해보세요.
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-2 border-t border-slate-200 bg-white">
        <div className="flex items-center gap-1 mb-1 text-slate-400">
          <button type="button" className="p-1 hover:text-slate-600 rounded" title="파일 첨부">
            <Paperclip size={14} />
          </button>
          <button type="button" className="p-1 hover:text-slate-600 rounded" title="이모티콘">
            <Smile size={14} />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <textarea
            rows={2}
            placeholder="메시지를 입력하세요 (Enter로 전송)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            className="flex-1 border border-slate-300 rounded p-1.5 text-xs outline-none focus:border-cool-500 resize-none font-sans"
          />
          <button
            type="submit"
            className="bg-cool-600 hover:bg-cool-700 text-white px-3 py-2 rounded h-full font-medium text-xs self-stretch flex items-center justify-center transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </form>
    </WindowFrame>
  );
}
