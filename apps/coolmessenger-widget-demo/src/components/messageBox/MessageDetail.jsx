import React, { useState } from 'react';
import { 
  Sparkles, CalendarPlus, FileText, Reply, Forward, Printer, Trash2, 
  Paperclip, CheckCircle2, Bot, AlertCircle, Copy
} from 'lucide-react';
import { generateAiSummary, generateSmartReply, extractScheduleFromText } from '../../services/localAiService';
import confetti from 'canvas-confetti';

export default function MessageDetail({
  message,
  sender,
  onAddEventToSchedule,
  onOpenComposeReply,
  onDeleteMessage,
}) {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryText, setSummaryText] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedEvent, setExtractedEvent] = useState(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  if (!message) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs bg-slate-50">
        <FileText size={36} className="mb-2 text-slate-300" />
        <span>목록에서 메시지를 선택해 주세요.</span>
      </div>
    );
  }

  // 1. AI Schedule Extraction & Direct Calendar Widget Link
  const handleExtractAndRegisterSchedule = () => {
    setIsExtracting(true);
    setTimeout(() => {
      // 기준 시각은 쪽지를 받은 날이다. 이걸 넘기지 않으면 «모레»를 계산할 수 없다.
      const event = extractScheduleFromText(message.bodyHtml, message.subject, message.timestamp);
      setExtractedEvent(event);
      setIsExtracting(false);

      if (event && onAddEventToSchedule) {
        onAddEventToSchedule(event);
        setRegisteredSuccess(true);
        confetti({ particleCount: 50, spread: 45, origin: { y: 0.7 } });
        setTimeout(() => setRegisteredSuccess(false), 4000);
      }
    }, 400);
  };

  // 2. AI 3-line Summary
  const handleGenerateSummary = async () => {
    setIsSummarizing(true);
    const summary = await generateAiSummary(message);
    setSummaryText(summary);
    setIsSummarizing(false);
  };

  // 3. AI Smart Reply
  const handleSmartReply = async (type = 'accept') => {
    const replyText = await generateSmartReply(message, type);
    if (onOpenComposeReply) {
      onOpenComposeReply({
        toMembers: sender ? [sender] : [],
        subject: `[답장] ${message.subject}`,
        initialBody: replyText,
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white font-sans text-xs select-text">
      {/* 1. Header Metadata Section */}
      <div className="border-b border-slate-200 bg-slate-50/50 p-3 space-y-2 select-none">
        <div className="grid grid-cols-[70px_1fr] gap-1 items-baseline">
          <span className="font-bold text-slate-700">제 목</span>
          <span className="font-semibold text-slate-900 text-[13px]">{message.subject}</span>
        </div>

        <div className="grid grid-cols-[70px_1fr] gap-1 items-center">
          <span className="font-medium text-slate-600">보낸사람</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-800 font-medium">
              {sender ? `${sender.name}(${sender.department},${sender.ext})` : '교직원'}
            </span>
            <span className="text-slate-400 text-[11px]">({message.dateLabel})</span>
          </div>
        </div>

        <div className="grid grid-cols-[70px_1fr] gap-1 items-center">
          <span className="font-medium text-slate-600">받는사람</span>
          <span className="text-slate-700">김서준(2학년생활지도1,132)(김서준) {message.isGroup ? '외 교직원' : ''}</span>
        </div>
      </div>

      {/* 2. AI Smart Action Toolbar (핵심 기능: 로컬 AI 분석 및 캘린더 위젯 연동) */}
      <div className="bg-gradient-to-r from-sky-50 via-indigo-50/40 to-slate-50 border-b border-sky-200/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 text-[11px] font-bold text-cool-700 bg-white px-2 py-0.5 rounded border border-cool-200 shadow-2xs">
            <Bot size={13} className="text-cool-600" /> 로컬 AI 스마트 기능
          </span>

          <button
            type="button"
            onClick={handleExtractAndRegisterSchedule}
            disabled={isExtracting}
            className="flex items-center gap-1 bg-cool-600 hover:bg-cool-700 text-white font-semibold px-2.5 py-1 rounded text-[11px] transition-colors shadow-2xs"
            title="본문의 마감일 및 일정을 자동 분석하여 일정 관리 위젯에 등록합니다."
          >
            <CalendarPlus size={13} />
            <span>{isExtracting ? 'AI 일정 분석 중...' : '⚡ AI 일정 추출 & 위젯 등록'}</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateSummary}
            disabled={isSummarizing}
            className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium px-2 py-1 rounded text-[11px] transition-colors"
          >
            <Sparkles size={12} className="text-amber-500" />
            <span>{isSummarizing ? '요약 중...' : '📝 AI 3줄 요약'}</span>
          </button>
        </div>

        {/* Smart Reply Buttons */}
        <div className="flex items-center gap-1">
          <span className="text-[10.5px] text-slate-500">원클릭 AI 답장:</span>
          <button
            type="button"
            onClick={() => handleSmartReply('accept')}
            className="bg-white hover:bg-cool-50 text-cool-800 border border-cool-200 px-2 py-0.5 rounded text-[10.5px] font-medium"
          >
            수락/확인
          </button>
          <button
            type="button"
            onClick={() => handleSmartReply('done')}
            className="bg-white hover:bg-cool-50 text-cool-800 border border-cool-200 px-2 py-0.5 rounded text-[10.5px] font-medium"
          >
            일정등록완료
          </button>
        </div>
      </div>

      {/* Success Notification Banner when Registered to Calendar */}
      {registeredSuccess && (
        <div className="bg-green-50 border-b border-green-200 px-3 py-1.5 flex items-center justify-between text-green-800 text-[11.5px] animate-fade-in select-none">
          <div className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 size={15} className="text-green-600" />
            <span>[연동 완료] 본문 속 일정이 <b>일정 관리 위젯</b> 및 캘린더에 성공적으로 등록되었습니다!</span>
          </div>
          <span className="text-[11px] text-green-700 font-semibold underline cursor-pointer">
            위젯에서 확인
          </span>
        </div>
      )}

      {/* AI Summary Banner */}
      {summaryText && (
        <div className="bg-amber-50/80 border-b border-amber-200 p-2.5 text-[11.5px] text-slate-800 animate-fade-in select-none">
          <div className="flex items-start justify-between">
            <div className="whitespace-pre-line font-mono text-[11px] leading-relaxed text-slate-700">
              {summaryText}
            </div>
            <button
              onClick={() => setSummaryText(null)}
              className="text-slate-400 hover:text-slate-600 text-xs ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 3. Message Body Editor Header Bar */}
      <div className="bg-slate-100 border-b border-slate-200 px-3 py-1 flex items-center justify-between select-none">
        <span className="font-semibold text-slate-700 text-[11.5px]">본문내용 (쿨에디터)</span>
        <div className="flex items-center gap-3 text-[11px] text-slate-600">
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-3 h-3 rounded" />
            <span>기본 (100%)</span>
          </label>
          <select className="border border-slate-300 rounded bg-white px-1 py-0.5 text-[10.5px]">
            <option>확대/축소</option>
            <option>120%</option>
            <option>100%</option>
            <option>80%</option>
          </select>
        </div>
      </div>

      {/* 4. Body Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 leading-relaxed text-slate-800 bg-white text-[12.5px]">
        <div
          dangerouslySetInnerHTML={{ __html: message.bodyHtml }}
          className="prose prose-sm max-w-none font-sans"
        />

        {/* Attachments Section */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-200 select-none">
            <div className="flex items-center gap-1 font-semibold text-slate-700 mb-2">
              <Paperclip size={14} className="text-cool-600" />
              <span>첨부파일 ({message.attachments.length}개)</span>
            </div>
            <div className="space-y-1.5">
              {message.attachments.map((att, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-slate-50 hover:bg-cool-50 border border-slate-200 rounded p-2 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                      {att.ext || 'FILE'}
                    </span>
                    <span className="font-medium text-slate-800 text-[11.5px]">{att.name}</span>
                    <span className="text-slate-400 text-[10.5px]">({att.size})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(`[다운로드 완료] ${att.name} 파일이 저장되었습니다.`)}
                    className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 px-2.5 py-1 rounded text-[11px] font-medium"
                  >
                    다운로드
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Bottom Action Bar */}
      <div className="border-t border-slate-200 bg-slate-50 p-2 flex items-center justify-between select-none">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onOpenComposeReply({ toMembers: sender ? [sender] : [], subject: `[답장] ${message.subject}` })}
            className="flex items-center gap-1 bg-cool-600 hover:bg-cool-700 text-white px-3 py-1 rounded font-medium text-[11.5px]"
          >
            <Reply size={13} /> 답장
          </button>
          <button
            type="button"
            onClick={() => onOpenComposeReply({ subject: `[전달] ${message.subject}`, initialBody: message.bodyHtml.replace(/<[^>]*>/g, '') })}
            className="flex items-center gap-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 px-2.5 py-1 rounded font-medium text-[11.5px]"
          >
            <Forward size={13} /> 전달
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 px-2 py-1 rounded text-[11.5px]"
          >
            <Printer size={13} /> 인쇄
          </button>
        </div>

        <button
          type="button"
          onClick={() => onDeleteMessage(message.id)}
          className="flex items-center gap-1 text-slate-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 text-[11.5px]"
        >
          <Trash2 size={13} /> 삭제
        </button>
      </div>
    </div>
  );
}
