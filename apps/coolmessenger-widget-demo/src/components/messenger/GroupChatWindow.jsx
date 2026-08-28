import React, { useState } from 'react';
import { Send, Paperclip, Smile, Users2, Plus } from 'lucide-react';
import WindowFrame from '../desktop/WindowFrame';
import { SCHOOL_MEMBERS } from '../../data/initialData';

const CURRENT_USER_ID = 'p-seojun';

// Multi-person real-time chat — separate from the 1:1 ChatWindow since group
// membership management (누구랑 채팅할지 고르기) needs its own UI.
export default function GroupChatWindow({
  isOpen,
  isMinimized,
  zIndex,
  onFocus,
  onMinimize,
  onMaximize,
  onClose,
  groupChats = {},
  activeGroupId,
  onSelectGroup,
  onSendGroupMessage,
  onCreateGroup,
}) {
  const [inputText, setInputText] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMemberIds, setNewGroupMemberIds] = useState([CURRENT_USER_ID]);

  if (!isOpen || isMinimized) return null;

  const memberMap = Object.fromEntries(SCHOOL_MEMBERS.map(m => [m.id, m]));
  const groupList = Object.values(groupChats);
  const activeGroup = groupChats[activeGroupId];

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeGroupId) return;
    onSendGroupMessage(activeGroupId, {
      id: 'gc-' + Date.now(),
      senderId: CURRENT_USER_ID,
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setInputText('');
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim() || newGroupMemberIds.length < 2) {
      alert('그룹 이름과 2명 이상의 참여자를 선택해 주세요.');
      return;
    }
    const id = 'g-' + Date.now();
    onCreateGroup({ id, name: newGroupName.trim(), memberIds: newGroupMemberIds, messages: [] });
    setIsCreating(false);
    setNewGroupName('');
    setNewGroupMemberIds([CURRENT_USER_ID]);
  };

  return (
    <WindowFrame
      id="group-chat"
      title="여러 명 실시간 채팅"
      icon={<Users2 size={15} className="text-white" />}
      isOpen={isOpen}
      isMinimized={isMinimized}
      zIndex={zIndex}
      onFocus={onFocus}
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      width={560}
      height={520}
      minWidth={420}
      minHeight={360}
      defaultPosition={{ x: 240, y: 80 }}
      headerStyle="widget"
    >
      <div className="flex-1 flex min-h-0">
        {/* Group list sidebar */}
        <div className="w-[170px] border-r border-slate-200 bg-slate-50 flex flex-col min-h-0">
          <div className="p-2 border-b border-slate-200">
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center justify-center gap-1 bg-cool-600 hover:bg-cool-700 text-white text-[11px] font-semibold py-1.5 rounded"
            >
              <Plus size={12} /> 새 그룹
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {groupList.map(g => (
              <button
                key={g.id}
                type="button"
                onClick={() => onSelectGroup(g.id)}
                className={`w-full text-left px-2.5 py-2 border-b border-slate-100 text-[11.5px] transition-colors ${
                  g.id === activeGroupId ? 'bg-cool-100 text-cool-900 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="truncate">{g.name}</div>
                <div className="text-[10px] text-slate-400">{g.memberIds.length}명</div>
              </button>
            ))}
            {groupList.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-[10.5px] px-2">그룹이 없습니다.<br />새 그룹을 만들어보세요.</div>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-h-0">
          {isCreating ? (
            <div className="flex-1 flex flex-col p-3 gap-2 overflow-y-auto text-xs">
              <div className="font-bold text-slate-800">새 그룹 채팅 만들기</div>
              <input
                type="text"
                placeholder="그룹 이름 (예: 2학년 담임 단톡)"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="border border-slate-300 rounded px-2 py-1.5 outline-none focus:border-cool-500"
              />
              <div className="text-slate-600 font-medium">참여자 선택</div>
              <div className="flex-1 overflow-y-auto border border-slate-200 rounded p-1.5 space-y-0.5">
                {SCHOOL_MEMBERS.map(m => (
                  <label key={m.id} className="flex items-center gap-1.5 px-1 py-0.5 rounded hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newGroupMemberIds.includes(m.id)}
                      disabled={m.id === CURRENT_USER_ID}
                      onChange={() => setNewGroupMemberIds(prev =>
                        prev.includes(m.id) ? prev.filter(x => x !== m.id) : [...prev, m.id]
                      )}
                      className="w-3.5 h-3.5"
                    />
                    <span>{m.name} ({m.title})</span>
                  </label>
                ))}
              </div>
              <div className="flex items-center gap-1.5 justify-end pt-1">
                <button type="button" onClick={() => setIsCreating(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded font-medium">취소</button>
                <button type="button" onClick={handleCreateGroup} className="bg-cool-600 hover:bg-cool-700 text-white px-3 py-1.5 rounded font-bold">만들기</button>
              </div>
            </div>
          ) : activeGroup ? (
            <>
              <div className="bg-cool-50 border-b border-cool-100 px-3 py-2 text-xs select-none">
                <div className="font-bold text-slate-800 text-[12.5px]">{activeGroup.name}</div>
                <div className="text-[10.5px] text-slate-500 truncate">
                  {activeGroup.memberIds.map(id => memberMap[id]?.name).filter(Boolean).join(', ')}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50 text-xs">
                {(activeGroup.messages || []).map(msg => {
                  const isMe = msg.senderId === CURRENT_USER_ID;
                  const senderName = memberMap[msg.senderId]?.name || '알 수 없음';
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {!isMe && <span className="text-[10px] text-slate-500 mb-0.5 px-1">{senderName}</span>}
                      <div
                        className={`max-w-[75%] p-2.5 rounded-xl whitespace-pre-line text-[11.5px] leading-relaxed shadow-2xs ${
                          isMe ? 'bg-cool-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9.5px] text-slate-400 mt-0.5 px-1">{msg.time}</span>
                    </div>
                  );
                })}
                {(!activeGroup.messages || activeGroup.messages.length === 0) && (
                  <div className="text-center py-12 text-slate-400 text-xs">대화 내용이 없습니다.</div>
                )}
              </div>

              <form onSubmit={handleSend} className="p-2 border-t border-slate-200 bg-white flex items-center gap-1.5">
                <button type="button" className="p-1 text-slate-400 hover:text-slate-600" title="파일 첨부">
                  <Paperclip size={14} />
                </button>
                <button type="button" className="p-1 text-slate-400 hover:text-slate-600" title="이모티콘">
                  <Smile size={14} />
                </button>
                <input
                  type="text"
                  placeholder="메시지를 입력하세요"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none focus:border-cool-500"
                />
                <button type="submit" className="bg-cool-600 hover:bg-cool-700 text-white px-3 py-1.5 rounded font-medium text-xs flex items-center justify-center">
                  <Send size={14} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
              왼쪽에서 그룹을 선택하거나 새 그룹을 만들어보세요.
            </div>
          )}
        </div>
      </div>
    </WindowFrame>
  );
}
