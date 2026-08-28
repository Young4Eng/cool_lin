import React, { useState } from 'react';
import { Paperclip, Search, Eye, Download } from 'lucide-react';
import WindowFrame from '../desktop/WindowFrame';
import FilePreviewModal from './FilePreviewModal';
import { SCHOOL_MEMBERS } from '../../data/initialData';

// One place to see every attachment across every 쪽지, instead of hunting
// through messages one by one. ("첨부파일 한 번에 보는 공간")
export default function AttachmentHub({
  isOpen,
  isMinimized,
  zIndex,
  onFocus,
  onMinimize,
  onMaximize,
  onClose,
  messages = [],
  onOpenMessage,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [previewFile, setPreviewFile] = useState(null);

  if (!isOpen || isMinimized) return null;

  const memberMap = Object.fromEntries(SCHOOL_MEMBERS.map(m => [m.id, m]));

  const allAttachments = messages.flatMap(msg =>
    (msg.attachments || []).map(att => ({ ...att, messageId: msg.id, subject: msg.subject, fromId: msg.fromId, dateLabel: msg.dateLabel }))
  );

  const filtered = allAttachments.filter(a =>
    !searchQuery.trim() || a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <WindowFrame
        id="attachment-hub"
        title={`첨부파일함 (${allAttachments.length}개)`}
        icon={<Paperclip size={15} className="text-white" />}
        isOpen={isOpen}
        isMinimized={isMinimized}
        zIndex={zIndex}
        onFocus={onFocus}
        onClose={onClose}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        width={520}
        height={520}
        minWidth={380}
        minHeight={320}
        defaultPosition={{ x: 260, y: 90 }}
        headerStyle="widget"
      >
        <div className="p-2.5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="파일명으로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded pl-2 pr-7 py-1.5 text-[11.5px] outline-none focus:border-cool-500"
            />
            <Search size={13} className="absolute right-2 top-2 text-slate-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-white text-xs">
          {filtered.map((att, i) => {
            const sender = memberMap[att.fromId];
            return (
              <div
                key={`${att.messageId}-${i}`}
                className="flex items-center justify-between bg-slate-50 hover:bg-cool-50/60 border border-slate-200 rounded-lg p-2.5 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-1 rounded uppercase shrink-0">
                    {att.ext || 'FILE'}
                  </span>
                  <div className="min-w-0">
                    <div className="font-medium text-slate-800 text-[11.5px] truncate">{att.name}</div>
                    <div className="text-[10.5px] text-slate-400 truncate">
                      {sender ? sender.name : '교직원'} · {att.dateLabel?.split(' ')[0]} · {att.size}
                      {' · '}
                      <button
                        type="button"
                        onClick={() => onOpenMessage && onOpenMessage(att.messageId)}
                        className="text-cool-600 hover:underline"
                      >
                        원문: {att.subject}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewFile(att)}
                    className="p-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-slate-600"
                    title="미리보기"
                  >
                    <Eye size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => alert(`[다운로드 완료] ${att.name} 파일이 저장되었습니다.`)}
                    className="p-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-slate-600"
                    title="다운로드"
                  >
                    <Download size={13} />
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-xs">첨부파일이 없습니다.</div>
          )}
        </div>
      </WindowFrame>

      <FilePreviewModal isOpen={!!previewFile} onClose={() => setPreviewFile(null)} file={previewFile} />
    </>
  );
}
