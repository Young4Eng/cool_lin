import React, { useState } from 'react';
import { Send, Paperclip, Sparkles, X, Users } from 'lucide-react';
import { SCHOOL_MEMBERS } from '../../data/initialData';
import confetti from 'canvas-confetti';

export default function ComposeModal({
  isOpen,
  onClose,
  initialData = {},
  onSendMessage,
}) {
  const memberMap = Object.fromEntries(SCHOOL_MEMBERS.map(m => [m.id, m]));

  const [toMemberIds, setToMemberIds] = useState(
    initialData.toMembers ? initialData.toMembers.map(m => m.id) : ['p-eunji']
  );
  const [subject, setSubject] = useState(initialData.subject || '');
  const [bodyText, setBodyText] = useState(initialData.initialBody || '');
  const [attachments, setAttachments] = useState([]);
  const [isPolishing, setIsPolishing] = useState(false);

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!subject.trim() || toMemberIds.length === 0) {
      alert('받는 사람과 제목을 입력해 주세요.');
      return;
    }

    const newMsg = {
      id: 'm-' + Date.now(),
      folder: 'sent',
      fromId: 'p-seojun',
      toIds: toMemberIds,
      ccIds: [],
      subject: subject.trim(),
      preview: bodyText.substring(0, 50),
      bodyHtml: `<p>${bodyText.replace(/\n/g, '<br/>')}</p>`,
      dateLabel: new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/\. /g, '/').replace('.', ''),
      timestamp: new Date().toISOString(),
      attachments: attachments,
      isGroup: toMemberIds.length > 1,
      unread: false,
      starred: false,
    };

    onSendMessage(newMsg);
    confetti({ particleCount: 50, spread: 45 });
    alert('쪽지가 성공적으로 발송되었습니다.');
    onClose();
  };

  const handleAddSampleAttachment = () => {
    setAttachments(prev => [
      ...prev,
      { name: '2026-2학기_2-3반_동의서_취합본.hwp', size: '32 KB', ext: 'hwp' }
    ]);
  };

  const handlePolishAiText = () => {
    setIsPolishing(true);
    setTimeout(() => {
      setBodyText(prev => 
        `안녕하세요 선생님, 2학년 3반 담임 김서준입니다.\n\n` +
        (prev ? `${prev}\n\n` : '') +
        `요청해주신 관련 서류 및 취합 결과를 확인하여 송부드립니다.\n검토 후 추가 요청사항이 있으시면 언제든 연락 부탁드립니다.\n감사합니다!`
      );
      setIsPolishing(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[130] flex items-center justify-center select-none font-sans text-xs">
      <div className="bg-white rounded-lg border border-slate-300 shadow-2xl w-[520px] overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-gradient-to-r from-cool-600 to-cool-700 text-white font-bold">
          <div className="flex items-center gap-1.5">
            <Send size={14} />
            <span>새 쪽지 / 메시지 작성</span>
          </div>
          <button type="button" onClick={onClose} className="hover:text-slate-200">
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSend} className="p-4 space-y-3">
          {/* Receivers */}
          <div className="flex items-center gap-2">
            <span className="w-16 font-semibold text-slate-700">받는사람</span>
            <div className="flex-1 flex flex-wrap items-center gap-1 bg-slate-50 border border-slate-300 rounded p-1 min-h-[32px]">
              {toMemberIds.map(id => {
                const m = memberMap[id];
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 bg-cool-100 text-cool-800 px-2 py-0.5 rounded text-[11px] font-medium"
                  >
                    {m ? `${m.name}(${m.title})` : id}
                    <button
                      type="button"
                      onClick={() => setToMemberIds(prev => prev.filter(x => x !== id))}
                      className="hover:text-rose-600 ml-0.5"
                    >
                      ✕
                    </button>
                  </span>
                );
              })}
              <select
                onChange={(e) => {
                  if (e.target.value && !toMemberIds.includes(e.target.value)) {
                    setToMemberIds(prev => [...prev, e.target.value]);
                  }
                }}
                value=""
                className="bg-transparent border-0 text-[11px] text-slate-500 outline-none cursor-pointer"
              >
                <option value="">+ 교직원 추가</option>
                {SCHOOL_MEMBERS.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.department}, {m.ext})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject */}
          <div className="flex items-center gap-2">
            <span className="w-16 font-semibold text-slate-700">제 목</span>
            <input
              type="text"
              required
              placeholder="쪽지 제목을 입력하세요"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex-1 border border-slate-300 rounded px-2.5 py-1.5 outline-none focus:border-cool-500 font-medium"
            />
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-700">본문 내용</span>
              <button
                type="button"
                onClick={handlePolishAiText}
                disabled={isPolishing}
                className="flex items-center gap-1 text-[11px] text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2 py-0.5 rounded font-medium transition-colors"
              >
                <Sparkles size={11} className="text-purple-600" />
                <span>AI 공문/쪽지 정중한 서식 완성</span>
              </button>
            </div>
            <textarea
              rows={7}
              required
              placeholder="전달하실 공지 및 업무 내용을 입력하세요."
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              className="w-full border border-slate-300 rounded p-2.5 outline-none focus:border-cool-500 text-[12px] leading-relaxed resize-none"
            />
          </div>

          {/* Attachments */}
          <div className="border border-slate-200 bg-slate-50 rounded p-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Paperclip size={13} />
              <span className="font-medium">첨부파일 ({attachments.length}개)</span>
              {attachments.map((a, i) => (
                <span key={i} className="text-[10.5px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                  {a.name}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddSampleAttachment}
              className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]"
            >
              파일추가
            </button>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              className="bg-cool-600 hover:bg-cool-700 text-white px-4 py-1.5 rounded font-bold flex items-center gap-1"
            >
              <Send size={12} /> 발송하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
