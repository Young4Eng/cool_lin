import React, { useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { fetchFreshFromCoolMessenger, fetchFromLatestDownload } from '../../services/realIngestClient';

/**
 * 교사가 누르는 한 버튼: 실제 쿨메신저에서 어제~오늘 쪽지를 받아
 * 로컬 AI 일정 → 캘린더. 쿨메신저 창은 그대로 둔다.
 */
export default function CoolMessengerIngestBar({ onAddEvent, compact = false }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null);

  const run = async (mode) => {
    setBusy(true);
    setNote({ kind: 'busy', text: '쪽지를 가져오고 로컬 AI로 일정을 정리하는 중… 최대 4분 정도 걸릴 수 있어요.' });
    try {
      const result = mode === 'fresh' ? await fetchFreshFromCoolMessenger() : await fetchFromLatestDownload();
      if (onAddEvent) {
        result.events.forEach((event) => onAddEvent(event, { silent: true }));
      }
      const aiDown = result.ai && result.ai.ok === false;
      const text = aiDown
        ? `일정 ${result.events.length}건을 넣었습니다. 로컬 AI는 잠시 꺼져 있어 규칙 엔진 결과입니다.`
        : `일정 ${result.events.length}건을 캘린더에 반영했습니다.`;
      setNote({ kind: 'ok', text });
    } catch (e) {
      setNote({ kind: 'err', text: e.message || '가져오기에 실패했습니다. 쿨메신저가 열려 있는지 확인해 주세요.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-2'}>
      <button
        type="button"
        onClick={() => run('fresh')}
        disabled={busy}
        className="w-full flex items-center justify-center gap-1.5 bg-cool-600 hover:bg-cool-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-3 py-1.5 rounded-lg text-[11px] shadow-sm"
        title="쿨메신저는 그대로 두고, 어제~오늘 쪽지를 받아 일정을 캘린더에 넣습니다"
      >
        {busy ? <RefreshCw size={12} className="animate-spin" /> : <Download size={12} />}
        {busy ? '가져오는 중…' : '어제~오늘 쪽지 가져오기'}
      </button>
      {!compact && (
        <button
          type="button"
          onClick={() => run('latest')}
          disabled={busy}
          className="w-full flex items-center justify-center gap-1 text-cool-700 hover:text-cool-900 disabled:opacity-50 text-[10.5px] font-semibold"
          title="이미 받아 둔 최신 파일에서 다시 추출"
        >
          최근 받은 파일로 다시 정리
        </button>
      )}
      {note && (
        <p
          className={`text-[10.5px] leading-snug ${
            note.kind === 'err' ? 'text-rose-600' : note.kind === 'busy' ? 'text-slate-500' : 'text-emerald-700'
          }`}
        >
          {note.text}
        </p>
      )}
    </div>
  );
}
