import React, { useState, useEffect } from 'react';
import { Settings, Bot, CheckCircle2, AlertCircle, RefreshCw, Cpu, Server, MonitorCog } from 'lucide-react';
import { getAiSettings, saveAiSettings, testOllamaConnection } from '../../services/localAiService';
import { isServerReachable } from '../../services/realIngestClient';

export default function AiSettingsModal({ isOpen, onClose }) {
  const [settings, setSettings] = useState(getAiSettings());
  const [testStatus, setTestStatus] = useState(null); // { ok: boolean, message: string }
  const [isTesting, setIsTesting] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [serverTestStatus, setServerTestStatus] = useState(null);
  const [isTestingServer, setIsTestingServer] = useState(false);

  const handleTestServer = async () => {
    setIsTestingServer(true);
    setServerTestStatus(null);
    const ok = await isServerReachable();
    setIsTestingServer(false);
    setServerTestStatus(
      ok
        ? { ok: true, message: '연결 성공! 실제 쿨메신저 다운로드 서버가 응답합니다.' }
        : { ok: false, message: '서버에 연결할 수 없습니다. server/ (npm run dev:server)가 켜져 있는지 확인하세요.' }
    );
  };

  useEffect(() => {
    if (isOpen) {
      setSettings(getAiSettings());
      setTestStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveAiSettings(settings);
    alert('로컬 AI 설정이 저장되었습니다.');
    onClose();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestStatus(null);
    const result = await testOllamaConnection(settings.ollamaEndpoint);
    setIsTesting(false);
    if (result.ok) {
      setTestStatus({
        ok: true,
        message: `연결 성공! 발견된 모델: ${result.models.join(', ') || '기본'}`
      });
      setAvailableModels(result.models);
      if (result.models.length > 0 && !result.models.includes(settings.model)) {
        setSettings(prev => ({ ...prev, model: result.models[0] }));
      }
    } else {
      setTestStatus({
        ok: false,
        message: result.error || '로컬 LLM 서버에 연결할 수 없습니다.'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[120] flex items-center justify-center select-none font-sans text-xs">
      <div className="bg-white rounded-lg border border-slate-300 shadow-2xl w-[460px] overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold">
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-cool-400" />
            <span>로컬 AI & 온디바이스 엔진 설정</span>
          </div>
          <button type="button" onClick={onClose} className="hover:text-slate-300">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-slate-700">
          {/* Operation Mode */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">AI 엔진 동작 모드</label>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`flex items-start gap-2 p-2.5 rounded border cursor-pointer transition-all ${
                  settings.mode === 'hybrid' || settings.mode === 'builtin'
                    ? 'border-cool-500 bg-cool-50/50 text-cool-950 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="aiMode"
                  checked={settings.mode === 'hybrid' || settings.mode === 'builtin'}
                  onChange={() => setSettings(prev => ({ ...prev, mode: 'hybrid' }))}
                  className="mt-0.5"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <Cpu size={13} className="text-cool-600" />
                    <span>브라우저 내장 NLP / 하이브리드</span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 font-normal mt-0.5">
                    별도 서버 없이 브라우저에서 즉시 초고속 일정 추출 및 요약
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-2 p-2.5 rounded border cursor-pointer transition-all ${
                  settings.mode === 'ollama'
                    ? 'border-cool-500 bg-cool-50/50 text-cool-950 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="aiMode"
                  checked={settings.mode === 'ollama'}
                  onChange={() => setSettings(prev => ({ ...prev, mode: 'ollama' }))}
                  className="mt-0.5"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <Server size={13} className="text-purple-600" />
                    <span>로컬 LLM (Ollama) 전용</span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 font-normal mt-0.5">
                    내 PC의 Ollama/LM Studio 대형언어모델 직접 통신
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Real CoolMessenger download+engine server */}
          <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                <MonitorCog size={13} className="text-cool-600" />
                실제 쿨메신저 연동 서버 URL
              </label>
              <button
                type="button"
                onClick={handleTestServer}
                disabled={isTestingServer}
                className="flex items-center gap-1 bg-white hover:bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 disabled:opacity-50"
              >
                <RefreshCw size={11} className={isTestingServer ? 'animate-spin' : ''} />
                <span>연결 테스트</span>
              </button>
            </div>
            <p className="text-[10.5px] text-slate-500 -mt-1">
              쿨메신저 창에서 .xls를 자동으로 내려받아 규칙 엔진으로 일정을 추출하는 server/ 주소입니다.
            </p>
            <input
              type="text"
              value={settings.serverEndpoint}
              onChange={(e) => setSettings(prev => ({ ...prev, serverEndpoint: e.target.value }))}
              placeholder="http://localhost:4000"
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 outline-none font-mono text-[11.5px]"
            />
            {serverTestStatus && (
              <div
                className={`p-2 rounded flex items-start gap-1.5 text-[11px] ${
                  serverTestStatus.ok ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {serverTestStatus.ok ? <CheckCircle2 size={14} className="text-green-600 shrink-0 mt-0.5" /> : <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />}
                <span className="leading-snug">{serverTestStatus.message}</span>
              </div>
            )}
          </div>

          {/* Ollama Endpoint */}
          <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-800">로컬 LLM 엔드포인트 URL</label>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex items-center gap-1 bg-white hover:bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 disabled:opacity-50"
              >
                <RefreshCw size={11} className={isTesting ? 'animate-spin' : ''} />
                <span>연결 테스트</span>
              </button>
            </div>

            <input
              type="text"
              value={settings.ollamaEndpoint}
              onChange={(e) => setSettings(prev => ({ ...prev, ollamaEndpoint: e.target.value }))}
              placeholder="http://localhost:11434"
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 outline-none font-mono text-[11.5px]"
            />

            {/* Test Status Banner */}
            {testStatus && (
              <div
                className={`p-2 rounded flex items-start gap-1.5 text-[11px] ${
                  testStatus.ok ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {testStatus.ok ? <CheckCircle2 size={14} className="text-green-600 shrink-0 mt-0.5" /> : <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />}
                <span className="leading-snug">{testStatus.message}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-slate-600 font-medium mb-1">모델 이름</label>
                <input
                  type="text"
                  value={settings.model}
                  onChange={(e) => setSettings(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="llama3:latest"
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 outline-none font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">생성 다양성 (Temp)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={settings.temperature}
                  onChange={(e) => setSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 outline-none text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Automation Switches */}
          <div className="space-y-1 pt-1">
            <label className="flex items-center justify-between p-2 rounded hover:bg-slate-50 cursor-pointer">
              <div>
                <span className="font-semibold block text-slate-800">쪽지 수신 시 일정 자동 감지</span>
                <span className="text-[10.5px] text-slate-500">본문 속 마감일/회의 일정을 파악하여 캘린더에 연동 대기 (메신저가 쌓이지 않도록 자동 처리)</span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoExtractSchedule}
                onChange={(e) => setSettings(prev => ({ ...prev, autoExtractSchedule: e.target.checked }))}
                className="w-4 h-4 text-cool-600 rounded shrink-0 ml-2"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded hover:bg-slate-50 cursor-pointer">
              <div>
                <span className="font-semibold block text-slate-800">새 쪽지 알림</span>
                <span className="text-[10.5px] text-slate-500">새 쪽지가 도착하면 화면에 알림을 표시합니다</span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoNotifyNewMessage}
                onChange={(e) => setSettings(prev => ({ ...prev, autoNotifyNewMessage: e.target.checked }))}
                className="w-4 h-4 text-cool-600 rounded shrink-0 ml-2"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded hover:bg-slate-50 cursor-pointer">
              <div>
                <span className="font-semibold block text-slate-800">마감 전 알림</span>
                <span className="text-[10.5px] text-slate-500">
                  마감{' '}
                  <input
                    type="number"
                    min={5}
                    step={5}
                    disabled={!settings.deadlineReminderEnabled}
                    value={settings.deadlineReminderMinutes}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setSettings(prev => ({ ...prev, deadlineReminderMinutes: Math.max(5, parseInt(e.target.value, 10) || 5) }))}
                    className="w-12 border border-slate-300 rounded px-1 text-center disabled:opacity-40"
                  />
                  {' '}분 전에 알려줍니다
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.deadlineReminderEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, deadlineReminderEnabled: e.target.checked }))}
                className="w-4 h-4 text-cool-600 rounded shrink-0 ml-2"
              />
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded font-medium"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-cool-600 hover:bg-cool-700 text-white px-4 py-1.5 rounded font-bold"
            >
              설정 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
