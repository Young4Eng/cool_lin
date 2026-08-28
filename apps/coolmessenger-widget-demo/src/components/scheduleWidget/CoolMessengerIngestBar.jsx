import React, { useCallback, useEffect, useState } from 'react';
import { Download, RefreshCw, Plus, Clock } from 'lucide-react';
import { fetchFreshFromCoolMessenger, fetchFromLatestDownload } from '../../services/realIngestClient';
import { parsePeriod, yesterdayAndToday } from '../../utils/ymd';
import {
  WEEKDAY_LABELS,
  loadAutoSettings,
  loadHandledKeys,
  markSlotHandled,
  newAutoRow,
  nextPromptDecision,
  saveAutoSettings,
  saveHandledKeys,
} from '../../utils/autoSchedule';

/**
 * 교사가 누르는 일정 정리 막대: 기간 지정 수동 실행 + 시각 예약(확인 후 실행).
 * 실제 추출은 서버 POST /api/ingest → schedule-engine 한 경로만 탄다.
 */
export default function CoolMessengerIngestBar({ onAddEvent, compact = false }) {
  const defaults = yesterdayAndToday();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null);
  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const [manualError, setManualError] = useState(null);
  const [showAuto, setShowAuto] = useState(false);
  const [settings, setSettings] = useState(loadAutoSettings);
  const [handled, setHandled] = useState(loadHandledKeys);
  const [prompt, setPrompt] = useState(null);

  const persistSettings = useCallback((next) => {
    setSettings(next);
    saveAutoSettings(next);
  }, []);

  const persistHandled = useCallback((next) => {
    setHandled(next);
    saveHandledKeys(next, yesterdayAndToday().end);
  }, []);

  const run = async (mode, period) => {
    setBusy(true);
    setManualError(null);
    setNote({ kind: 'busy', text: '쪽지를 가져오고 로컬 AI로 일정을 정리하는 중… 최대 4분 정도 걸릴 수 있어요.' });
    try {
      const result =
        mode === 'latest'
          ? await fetchFromLatestDownload()
          : await fetchFreshFromCoolMessenger(period);
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

  const submitManual = () => {
    const parsed = parsePeriod(startDate, endDate);
    if (!parsed.ok) {
      setManualError(parsed.error);
      setNote(null);
      return;
    }
    void run('fresh', { start: parsed.start, end: parsed.end });
  };

  useEffect(() => {
    const tick = () => {
      if (busy || prompt) return;
      const due = nextPromptDecision(new Date(), settings.rows, handled);
      if (due) setPrompt(due);
    };
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, [busy, handled, prompt, settings.rows]);

  const closePrompt = (shouldRun) => {
    if (!prompt) return;
    persistHandled(markSlotHandled(handled, prompt.slotKey));
    setPrompt(null);
    if (shouldRun) void run('fresh');
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

      <div className="flex items-center gap-1">
        <input
          type="text"
          inputMode="numeric"
          maxLength={8}
          placeholder="시작YYYYMMDD"
          value={startDate}
          disabled={busy}
          onChange={(e) => {
            setStartDate(e.target.value);
            setManualError(null);
          }}
          className="flex-1 min-w-0 border border-slate-300 rounded px-1.5 py-1 text-[10.5px] font-mono"
        />
        <span className="text-[10px] text-slate-400">~</span>
        <input
          type="text"
          inputMode="numeric"
          maxLength={8}
          placeholder="끝YYYYMMDD"
          value={endDate}
          disabled={busy}
          onChange={(e) => {
            setEndDate(e.target.value);
            setManualError(null);
          }}
          className="flex-1 min-w-0 border border-slate-300 rounded px-1.5 py-1 text-[10.5px] font-mono"
        />
        <button
          type="button"
          onClick={submitManual}
          disabled={busy}
          className="shrink-0 bg-white border border-cool-600 text-cool-700 hover:bg-cool-50 disabled:opacity-50 font-bold px-2 py-1 rounded text-[10.5px]"
        >
          기간 정리
        </button>
      </div>
      {manualError && <p className="text-[10.5px] text-rose-600 leading-snug">{manualError}</p>}

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

      <button
        type="button"
        onClick={() => setShowAuto((v) => !v)}
        className="w-full flex items-center justify-center gap-1 text-slate-600 hover:text-cool-800 text-[10.5px] font-semibold"
      >
        <Clock size={11} />
        {showAuto ? '자동 시각 닫기' : '자동 정리 시각 설정'}
      </button>

      {showAuto && (
        <div className="border border-slate-200 rounded-lg p-1.5 bg-white space-y-1.5">
          <p className="text-[10px] text-slate-500 leading-snug">
            시각이 되면 바로 돌리지 않고 실행 여부를 묻습니다. 이 브라우저에 저장됩니다.
          </p>
          {settings.rows.map((row) => (
            <div key={row.id} className="flex flex-col gap-1 border-b border-slate-100 pb-1.5">
              <div className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={row.enabled}
                  onChange={(e) =>
                    persistSettings({
                      rows: settings.rows.map((r) =>
                        r.id === row.id ? { ...r, enabled: e.target.checked } : r,
                      ),
                    })
                  }
                />
                <input
                  type="time"
                  value={row.time}
                  onChange={(e) =>
                    persistSettings({
                      rows: settings.rows.map((r) =>
                        r.id === row.id ? { ...r, time: e.target.value } : r,
                      ),
                    })
                  }
                  className="border border-slate-300 rounded px-1 py-0.5 text-[11px]"
                />
                <button
                  type="button"
                  className="ml-auto text-[10px] text-rose-600"
                  onClick={() => persistSettings({ rows: settings.rows.filter((r) => r.id !== row.id) })}
                >
                  삭제
                </button>
              </div>
              <div className="flex flex-wrap gap-0.5">
                {WEEKDAY_LABELS.map((label, i) => {
                  const on = row.weekdays.includes(i);
                  return (
                    <button
                      key={label}
                      type="button"
                      className={`px-1 py-0.5 rounded text-[10px] ${on ? 'bg-cool-100 text-cool-800 font-bold' : 'text-slate-400'}`}
                      onClick={() => {
                        const weekdays = on
                          ? row.weekdays.filter((d) => d !== i)
                          : [...row.weekdays, i].sort();
                        persistSettings({
                          rows: settings.rows.map((r) => (r.id === row.id ? { ...r, weekdays } : r)),
                        });
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => persistSettings({ rows: [...settings.rows, newAutoRow()] })}
            className="w-full flex items-center justify-center gap-0.5 text-[10.5px] font-semibold text-cool-700"
          >
            <Plus size={11} /> 시각 행 추가
          </button>
        </div>
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

      {prompt && (
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-4 space-y-3">
            <h3 className="font-bold text-sm text-cool-800">지금 일정을 정리할까요?</h3>
            <p className="text-[12px] text-slate-600 leading-snug">
              설정한 시각({prompt.row.time})이 되었습니다. 어제~오늘 쪽지를 받아 캘린더에 반영합니다. 확인 없이
              시작하지 않습니다.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="px-3 py-1.5 text-[12px] font-semibold text-slate-600 border border-slate-300 rounded-lg"
                onClick={() => closePrompt(false)}
              >
                이번에는 건너뛰기
              </button>
              <button
                type="button"
                className="px-3 py-1.5 text-[12px] font-bold text-white bg-cool-600 rounded-lg"
                onClick={() => closePrompt(true)}
              >
                지금 정리
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
