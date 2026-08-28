import React, { useEffect, useRef } from 'react';
import { X, Paperclip } from 'lucide-react';

// 일정 목록에서 더블클릭하면 뜨는 «쪽지 원문» 창.
//
// 원문은 **믿을 수 없는 평문**이다 (packages/schedule-engine/README 2장).
// 절대 HTML 로 렌더링하지 않는다 — 아래는 전부 텍스트 노드로만 들어간다.

export default function SourceMessageModal({ event, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!event) return null;
  const source = event.source;

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col bg-slate-900/30 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        className="mt-auto flex max-h-[86%] flex-col rounded-t-xl border-t border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="쪽지 원문"
      >
        {/* 머리 — 색이 아니라 크기·굵기로 위계를 만든다 */}
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-4 py-3">
          <div className="min-w-0">
            <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">쪽지 원문</div>
            <div className="mt-0.5 truncate text-[13px] font-semibold text-slate-900">
              {source?.subject || event.title}
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="닫기"
          >
            <X size={15} />
          </button>
        </div>

        {source ? (
          <>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-b border-slate-100 px-4 py-2.5 text-[11px]">
              <dt className="text-slate-400">보낸사람</dt>
              <dd className="truncate text-slate-700">{source.from}</dd>
              <dt className="text-slate-400">받은시각</dt>
              <dd className="tabular-nums text-slate-700">{source.sentAt}</dd>
              {source.attachment ? (
                <>
                  <dt className="text-slate-400">첨부</dt>
                  <dd className="flex min-w-0 items-center gap-1 text-slate-700">
                    <Paperclip size={10} className="shrink-0 text-slate-400" />
                    <span className="truncate">{source.attachment}</span>
                  </dd>
                </>
              ) : null}
            </dl>

            {/* 본문 — 줄바꿈만 살리고 서식은 넣지 않는다 */}
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              <p className="whitespace-pre-wrap break-words text-[12px] leading-relaxed text-slate-800">
                {source.body || '(본문이 비어 있습니다)'}
              </p>
            </div>
          </>
        ) : (
          <div className="px-4 py-6 text-center text-[11.5px] leading-relaxed text-slate-500">
            이 일정에는 연결된 쪽지 원문이 없습니다.
            <br />
            <span className="text-slate-400">
              쿨메신저에서 «가져오기»로 만든 일정에만 원문이 붙습니다.
            </span>
          </div>
        )}

        <div className="border-t border-slate-100 px-4 py-2 text-[10.5px] text-slate-400">
          이 일정: {event.title} · {event.date} {event.time}
        </div>
      </div>
    </div>
  );
}
