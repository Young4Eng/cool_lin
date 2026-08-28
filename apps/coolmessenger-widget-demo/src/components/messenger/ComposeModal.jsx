import React, { useState } from 'react';
import { Send, Paperclip, Sparkles, Image as ImageIcon, ChevronDown, Trash2, Plus, CalendarCheck } from 'lucide-react';
import { SCHOOL_MEMBERS } from '../../data/initialData';
import { loadStoredQuickPhrases, saveStoredQuickPhrases } from '../../services/storageService';
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
  const [photos, setPhotos] = useState([]); // { id, name, caption, side: 'left'|'right' }
  const [photoLayout, setPhotoLayout] = useState('stack'); // 'stack' | 'side-by-side'
  const [isPolishing, setIsPolishing] = useState(false);
  const [linkToCalendar, setLinkToCalendar] = useState(false);
  const [quickPhrases, setQuickPhrases] = useState(loadStoredQuickPhrases);
  const [isQuickPhraseOpen, setIsQuickPhraseOpen] = useState(false);
  const [newPhraseLabel, setNewPhraseLabel] = useState('');
  const [newPhraseText, setNewPhraseText] = useState('');

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!subject.trim() || toMemberIds.length === 0) {
      alert('받는 사람과 제목을 입력해 주세요.');
      return;
    }

    const photoHtml = photos.length > 0
      ? `<div style="display:flex; ${photoLayout === 'side-by-side' ? 'flex-direction:row; gap:8px;' : 'flex-direction:column; gap:6px;'} margin:8px 0;">` +
        photos.map(p => `
          <figure style="margin:0; ${photoLayout === 'side-by-side' ? 'flex:1;' : ''}">
            <div style="background:#e2e8f0; border:1px dashed #94a3b8; border-radius:6px; height:90px; display:flex; align-items:center; justify-content:center; color:#64748b; font-size:11px;">🖼 ${p.name}</div>
            ${p.caption ? `<figcaption style="font-size:10.5px; color:#64748b; margin-top:2px;">${p.caption}</figcaption>` : ''}
          </figure>
        `).join('') +
        `</div>`
      : '';

    const newMsg = {
      id: 'm-' + Date.now(),
      folder: 'sent',
      fromId: 'p-seojun',
      toIds: toMemberIds,
      ccIds: [],
      subject: subject.trim(),
      preview: bodyText.substring(0, 50),
      bodyHtml: `<p>${bodyText.replace(/\n/g, '<br/>')}</p>${photoHtml}`,
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
      linkToCalendar,
    };

    onSendMessage(newMsg);
    confetti({ particleCount: 50, spread: 45 });
    alert('쪽지가 성공적으로 발송되었습니다.' + (linkToCalendar ? '\n(캘린더 연동 표시가 함께 전달됩니다)' : ''));
    onClose();
  };

  const handleAddSampleAttachment = () => {
    setAttachments(prev => [
      ...prev,
      { name: '2026-2학기_2-3반_동의서_취합본.hwp', size: '32 KB', ext: 'hwp' }
    ]);
  };

  const handleAddSamplePhoto = () => {
    if (photos.length >= 2) {
      alert('사진은 최대 2장까지 나란히 배치할 수 있습니다.');
      return;
    }
    setPhotos(prev => [
      ...prev,
      { id: 'ph-' + Date.now(), name: `사진_${prev.length + 1}.jpg`, caption: '' }
    ]);
  };

  const handleUpdatePhotoCaption = (id, caption) => {
    setPhotos(prev => prev.map(p => (p.id === id ? { ...p, caption } : p)));
  };

  const handleRemovePhoto = (id) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleInsertPhrase = (phrase) => {
    setBodyText(prev => (prev ? `${prev}\n${phrase.text}` : phrase.text));
    setIsQuickPhraseOpen(false);
  };

  const handleSaveNewPhrase = () => {
    if (!newPhraseLabel.trim() || !newPhraseText.trim()) return;
    const next = [
      ...quickPhrases,
      { id: 'qp-' + Date.now(), label: newPhraseLabel.trim(), text: newPhraseText.trim() },
    ];
    setQuickPhrases(next);
    saveStoredQuickPhrases(next);
    setNewPhraseLabel('');
    setNewPhraseText('');
  };

  const handleDeletePhrase = (id) => {
    const next = quickPhrases.filter(p => p.id !== id);
    setQuickPhrases(next);
    saveStoredQuickPhrases(next);
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
      <div className="bg-white rounded-lg border border-slate-300 shadow-2xl w-[540px] max-h-[90vh] overflow-y-auto animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-gradient-to-r from-cool-600 to-cool-700 text-white font-bold sticky top-0 z-10">
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
              <div className="flex items-center gap-1.5 relative">
                <button
                  type="button"
                  onClick={() => setIsQuickPhraseOpen(!isQuickPhraseOpen)}
                  className="flex items-center gap-1 text-[11px] text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-medium transition-colors"
                >
                  <span>💬 자주 쓰는 멘트</span>
                  <ChevronDown size={11} />
                </button>
                <button
                  type="button"
                  onClick={handlePolishAiText}
                  disabled={isPolishing}
                  className="flex items-center gap-1 text-[11px] text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2 py-0.5 rounded font-medium transition-colors"
                >
                  <Sparkles size={11} className="text-purple-600" />
                  <span>AI 공문/쪽지 정중한 서식 완성</span>
                </button>

                {isQuickPhraseOpen && (
                  <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-lg border border-slate-200 shadow-xl p-2 z-20 text-slate-700">
                    <div className="text-[10.5px] font-semibold text-slate-500 mb-1 px-1">자주 쓰는 멘트 (클릭하여 삽입)</div>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {quickPhrases.map(p => (
                        <div key={p.id} className="flex items-center gap-1 group">
                          <button
                            type="button"
                            onClick={() => handleInsertPhrase(p)}
                            className="flex-1 text-left bg-slate-50 hover:bg-cool-50 border border-slate-200 hover:border-cool-300 rounded px-2 py-1 text-[11px]"
                          >
                            <span className="font-semibold block">{p.label}</span>
                            <span className="text-slate-500 line-clamp-1">{p.text}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePhrase(p.id)}
                            className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 shrink-0"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      {quickPhrases.length === 0 && (
                        <div className="text-center py-3 text-slate-400 text-[10.5px]">저장된 멘트가 없습니다.</div>
                      )}
                    </div>
                    <div className="border-t border-slate-100 mt-2 pt-2 space-y-1">
                      <input
                        type="text"
                        placeholder="멘트 이름 (예: 수업자료 전달)"
                        value={newPhraseLabel}
                        onChange={(e) => setNewPhraseLabel(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2 py-1 text-[11px] outline-none"
                      />
                      <textarea
                        rows={2}
                        placeholder="자주 쓰는 문구 입력"
                        value={newPhraseText}
                        onChange={(e) => setNewPhraseText(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2 py-1 text-[11px] outline-none resize-none"
                      />
                      <button
                        type="button"
                        onClick={handleSaveNewPhrase}
                        className="w-full flex items-center justify-center gap-1 bg-cool-600 hover:bg-cool-700 text-white rounded py-1 text-[11px] font-semibold"
                      >
                        <Plus size={11} /> 새 멘트 저장
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <textarea
              rows={6}
              required
              placeholder="전달하실 공지 및 업무 내용을 입력하세요."
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              className="w-full border border-slate-300 rounded p-2.5 outline-none focus:border-cool-500 text-[12px] leading-relaxed resize-none"
            />
          </div>

          {/* Photos (side-by-side layout + captions) */}
          <div className="border border-slate-200 bg-slate-50 rounded p-2 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <ImageIcon size={13} />
                <span>사진 첨부 ({photos.length}/2)</span>
              </div>
              <div className="flex items-center gap-1.5">
                {photos.length === 2 && (
                  <div className="flex items-center bg-white border border-slate-300 rounded overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setPhotoLayout('stack')}
                      className={`px-2 py-0.5 text-[10.5px] ${photoLayout === 'stack' ? 'bg-cool-600 text-white' : 'text-slate-600'}`}
                    >
                      세로 나열
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoLayout('side-by-side')}
                      className={`px-2 py-0.5 text-[10.5px] ${photoLayout === 'side-by-side' ? 'bg-cool-600 text-white' : 'text-slate-600'}`}
                    >
                      나란히 배치
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleAddSamplePhoto}
                  className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]"
                >
                  사진추가
                </button>
              </div>
            </div>

            {photos.length > 0 && (
              <div className={`flex gap-2 ${photoLayout === 'side-by-side' ? 'flex-row' : 'flex-col'}`}>
                {photos.map(p => (
                  <div key={p.id} className={`bg-white border border-slate-200 rounded p-1.5 ${photoLayout === 'side-by-side' ? 'flex-1' : ''}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="h-14 w-full bg-slate-100 border border-dashed border-slate-300 rounded flex items-center justify-center text-slate-400 text-[10.5px]">
                        🖼 {p.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="사진 설명 입력 (예: 8/28 급식 메뉴표)"
                        value={p.caption}
                        onChange={(e) => handleUpdatePhotoCaption(p.id, e.target.value)}
                        className="flex-1 border border-slate-200 rounded px-1.5 py-0.5 text-[10.5px] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(p.id)}
                        className="text-slate-300 hover:text-rose-500 shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attachments */}
          <div className="border border-slate-200 bg-slate-50 rounded p-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-600 flex-wrap">
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
              className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] shrink-0"
            >
              파일추가
            </button>
          </div>

          {/* Calendar link flag */}
          <label className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded p-2 cursor-pointer">
            <input
              type="checkbox"
              checked={linkToCalendar}
              onChange={(e) => setLinkToCalendar(e.target.checked)}
              className="w-4 h-4 text-cool-600 rounded"
            />
            <CalendarCheck size={14} className="text-sky-600" />
            <span className="text-sky-900 font-medium">이 쪽지는 일정/마감이 포함되어 있어요 (받는 분 캘린더 자동 연동에 우선 반영)</span>
          </label>

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
