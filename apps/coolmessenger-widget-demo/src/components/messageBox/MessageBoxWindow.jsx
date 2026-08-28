import React, { useState } from 'react';
import { 
  Search, Download, Trash2, SlidersHorizontal, ChevronDown, 
  Send, RefreshCw, Star, Mail, Inbox
} from 'lucide-react';
import { PenguinIcon } from '../common/Icons';
import MessageList from './MessageList';
import MessageDetail from './MessageDetail';
import DownloadModal from './DownloadModal';
import WindowFrame from '../desktop/WindowFrame';
import { SCHOOL_MEMBERS } from '../../data/initialData';

export default function MessageBoxWindow({
  isOpen,
  isMinimized,
  zIndex,
  onFocus,
  onMinimize,
  onMaximize,
  onClose,
  messages = [],
  onAddEventToSchedule,
  onOpenComposeReply,
  onDeleteMessage,
  onToggleStar,
}) {
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' | 'sent'
  const [selectedMessageId, setSelectedMessageId] = useState(messages[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const memberMap = Object.fromEntries(SCHOOL_MEMBERS.map(m => [m.id, m]));

  const filteredByTab = messages.filter(m => m.folder === activeTab);
  const selectedMessage = messages.find(m => m.id === selectedMessageId) || filteredByTab[0];
  const sender = selectedMessage ? memberMap[selectedMessage.fromId] : null;

  return (
    <>
      <WindowFrame
        id="messagebox"
        title={`메시지 관리함 (${messages.length}개의 받은 메시지)`}
        icon={<PenguinIcon size={16} />}
        isOpen={isOpen}
        isMinimized={isMinimized}
        zIndex={zIndex}
        onFocus={onFocus}
        onClose={onClose}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        width={920}
        height={600}
        minWidth={680}
        minHeight={450}
        defaultPosition={{ x: 120, y: 60 }}
        headerStyle="messagebox"
      >
        {/* 1. Main Navigation Bar (Sky Blue Header) */}
        <div className="bg-[#4aa8dc] px-3 pt-2 pb-0 flex items-center justify-between border-b border-[#3695c8] select-none">
          {/* Tabs */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('inbox');
                const firstInbox = messages.find(m => m.folder === 'inbox');
                if (firstInbox) setSelectedMessageId(firstInbox.id);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-t-md transition-colors ${
                activeTab === 'inbox'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'bg-[#3b92cb] text-white hover:bg-[#3488be]'
              }`}
            >
              받은메시지
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('sent');
                const firstSent = messages.find(m => m.folder === 'sent');
                if (firstSent) setSelectedMessageId(firstSent.id);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-t-md transition-colors ${
                activeTab === 'sent'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'bg-[#3b92cb] text-white hover:bg-[#3488be]'
              }`}
            >
              보낸메시지
            </button>

            <select className="ml-2 bg-[#3b92cb] text-white text-xs px-2 py-1 rounded border border-[#5ab2e6] outline-none">
              <option>전체 메시지</option>
              <option>읽지 않은 메시지</option>
              <option>중요 메시지 (★)</option>
              <option>첨부파일 포함</option>
            </select>
          </div>

          {/* Search & Action Toolbar */}
          <div className="flex items-center gap-1.5 pb-2 text-xs">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="bg-white border border-slate-300 rounded px-1.5 py-1 text-[11px] text-slate-700 outline-none"
            >
              <option value="all">내용</option>
              <option value="subject">제목</option>
              <option value="sender">보낸사람</option>
            </select>

            <div className="relative">
              <input
                type="text"
                placeholder="검색어 입력"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-slate-300 rounded pl-2 pr-6 py-1 text-[11px] text-slate-800 w-36 outline-none focus:w-48 transition-all"
              />
              <Search size={13} className="absolute right-1.5 top-1.5 text-slate-400" />
            </div>

            <button
              type="button"
              className="bg-[#3b92cb] hover:bg-[#3488be] text-white px-2 py-1 rounded text-[11px] font-medium border border-[#5ab2e6]"
            >
              상세검색
            </button>

            <button
              type="button"
              onClick={() => setIsDownloadModalOpen(true)}
              className="bg-[#3b92cb] hover:bg-[#3488be] text-white p-1 rounded border border-[#5ab2e6]"
              title="메시지 기간별 다운로드"
            >
              <Download size={14} />
            </button>

            <button
              type="button"
              onClick={() => {
                if (selectedMessage) onDeleteMessage(selectedMessage.id);
              }}
              className="bg-[#3b92cb] hover:bg-rose-600 text-white p-1 rounded border border-[#5ab2e6]"
              title="메시지 삭제"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* 2. Main Content Split View (List + Detail) */}
        <div className="flex-1 flex min-h-0 bg-white">
          <MessageList
            messages={filteredByTab}
            selectedMessageId={selectedMessage?.id}
            onSelectMessage={(id) => setSelectedMessageId(id)}
            onToggleStar={onToggleStar}
            searchQuery={searchQuery}
          />

          <MessageDetail
            message={selectedMessage}
            sender={sender}
            onAddEventToSchedule={onAddEventToSchedule}
            onOpenComposeReply={onOpenComposeReply}
            onDeleteMessage={onDeleteMessage}
          />
        </div>
      </WindowFrame>

      {/* Message Download Modal */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        totalCount={messages.length}
      />
    </>
  );
}
