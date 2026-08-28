import React, { useState } from 'react';
import {
  Sparkles, Bot, Calendar, Clock, Send, CheckCircle2,
  AlertTriangle, RefreshCw, Settings, FileText, ChevronRight, MonitorUp
} from 'lucide-react';
import WindowFrame from '../desktop/WindowFrame';
import { extractScheduleFromText } from '../../services/localAiService';
import { openDesktopWidget } from '../../utils/desktopWidgetLauncher';
import confetti from 'canvas-confetti';

export default function AiAssistantWindow({
  isOpen,
  isMinimized,
  zIndex,
  onFocus,
  onMinimize,
  onMaximize,
  onClose,
  messages = [],
  events = [],
  todos = [],
  onAddEvent,
  onOpenAiSettings,
  onOpenMessage,
  onOpenScheduleWidget,
}) {
  const [activeTab, setActiveTab] = useState('briefing'); // 'briefing' | 'chat' | 'batch'
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `안녕하세요, 김서준 선생님! 쿨메신저 로컬 AI 스마트 비서입니다.\n오늘(2026년 8월 28일) 처리해야 할 공문 및 다가오는 학사일정을 브리핑해 드릴까요?`,
      time: '오후 6:15'
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || isMinimized) return null;

  // Analysis of upcoming urgent deadlines & notices
  const urgentEvents = events.filter(e => e.priority === 'urgent' || e.priority === 'high');
  const unreadMessages = messages.filter(m => m.unread);

  // Quick Questions
  const quickQuestions = [
    '오늘 마감되는 공문이 뭐야?',
    '내일 학사일정과 지도 순번 알려줘',
    '쪽지에서 일정 일괄 추출해서 등록해줘',
    '2학기 개학 준비 체크리스트 보여줘'
  ];

  const handleSendMessage = (textToSend) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setChatInput('');
    setIsProcessing(true);

    setTimeout(() => {
      let reply = '';
      const q = text.toLowerCase();

      if (q.includes('오늘') || q.includes('마감') || q.includes('공문')) {
        reply = `📋 **[오늘의 공문 및 업무 마감 안내]**\n1. **8월 특근매식비 신청**: 오늘(8/28) 16:00까지 K-에듀파인 품의 마감\n2. **2-3반 전자칠판 유지보수 점검**: 오늘(8/28) 15:30 방과후 방문 예정\n3. **행정정보공유 사전동의서**: 미제출 학생 수합 후 교무부 최은지 부장님께 제출`;
      } else if (q.includes('내일') || q.includes('학사일정') || q.includes('순번') || q.includes('생활지도')) {
        reply = `📅 **[다가오는 학사일정 및 생활지도]**\n- **8월 29일(토)**: 방과후학교 수강신청 오픈 (홈페이지)\n- **8월 31일(월) 16:00**: 2학기 전체 교직원 회의 (시청각실)\n- **9월 1일(화) 12:40**: 점심시간 3층 복도 생활지도 순번 (김서준 선생님)`;
      } else if (q.includes('일괄 추출') || q.includes('추출')) {
        handleBatchSync();
        reply = `✨ 받은 쪽지함의 모든 공문과 안내문을 로컬 AI가 전수 분석하여 일정 관리 위젯에 동기화 완료했습니다!`;
      } else {
        reply = `선생님께서 질문하신 "${text}" 내용과 관련된 학사일정 및 쪽지 데이터를 분석 중입니다. 필요하신 업무 지원(일정 등록, 답장 작성, 공문 요약)이 있으시면 언제든 말씀해 주세요!`;
      }

      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsProcessing(false);
    }, 600);
  };

  // Batch Extract & Sync all messages to schedule
  const handleBatchSync = () => {
    let count = 0;
    messages.forEach(msg => {
      const detected = extractScheduleFromText(msg.bodyHtml, msg.subject);
      if (detected && onAddEvent) {
        onAddEvent(detected);
        count++;
      }
    });
    confetti({ particleCount: 60, spread: 50 });
    alert(`[로컬 AI 완료] 받은 쪽지 중 총 ${count}건의 일정을 성공적으로 분석하여 캘린더 위젯에 등록했습니다!\n(바탕화면 위젯을 열어두셨다면 그쪽에도 실시간으로 반영됩니다.)`);
  };

  return (
    <WindowFrame
      id="ai-assistant"
      title="쿨-AI 스마트 교무 비서 & 일정 연동 허브"
      icon={<Sparkles size={15} className="text-amber-300" />}
      isOpen={isOpen}
      isMinimized={isMinimized}
      zIndex={zIndex}
      onFocus={onFocus}
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      width={560}
      height={640}
      minWidth={440}
      minHeight={450}
      defaultPosition={{ x: 200, y: 50 }}
      customHeaderRight={
        <button
          type="button"
          onClick={onOpenAiSettings}
          className="p-1 hover:bg-slate-200 rounded text-slate-600 mr-1"
          title="로컬 AI 모델 및 엔드포인트 설정"
        >
          <Settings size={13} />
        </button>
      }
    >
      {/* Tab Header */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 text-white px-4 pt-3 pb-0 select-none">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-xs">
              <Bot size={22} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-[14px]">Cool-AI 교무 어시스턴트</div>
              <div className="text-[11px] text-sky-100 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>온디바이스 로컬 AI 엔진 가동 중 (Zero External Leak)</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenAiSettings}
            className="text-[11px] bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded text-white font-medium"
          >
            모델 설정
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('briefing')}
            className={`px-3 py-1.5 font-bold rounded-t-md transition-colors ${
              activeTab === 'briefing' ? 'bg-white text-slate-900 shadow-xs' : 'text-white/80 hover:bg-white/10'
            }`}
          >
            📊 스마트 브리핑
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 font-bold rounded-t-md transition-colors ${
              activeTab === 'chat' ? 'bg-white text-slate-900 shadow-xs' : 'text-white/80 hover:bg-white/10'
            }`}
          >
            💬 교무 AI 대화
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-50 p-3.5 text-xs overflow-hidden">
        {activeTab === 'briefing' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {/* Quick Action Card: 쪽지 일정 일괄 동기화 */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl p-3.5 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-[13px] flex items-center gap-1.5">
                    <Sparkles size={15} className="text-amber-300 animate-spin-slow" />
                    <span>쪽지 일정 일괄 자동 분석 & 위젯 연동</span>
                  </div>
                  <p className="text-[11px] text-purple-100 mt-0.5">
                    수신된 쪽지들의 마감 기한 및 회의 일정을 AI가 캘린더 위젯으로 자동 등록합니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleBatchSync}
                  className="bg-white hover:bg-purple-50 text-purple-800 font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm shrink-0 ml-3"
                >
                  전체 동기화
                </button>
              </div>
              <button
                type="button"
                onClick={() => openDesktopWidget()}
                className="mt-2.5 w-full flex items-center justify-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/25 text-white font-semibold px-3 py-1.5 rounded-lg text-[11px] transition-colors"
              >
                <MonitorUp size={13} />
                동기화된 일정을 PC 바탕화면 위젯에서 실시간으로 보기
              </button>
            </div>

            {/* Urgent Deadlines Widget */}
            <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 text-[12.5px]">
                  <AlertTriangle size={14} className="text-rose-500" />
                  <span>마감 임박 및 중요 학사일정 ({urgentEvents.length}건)</span>
                </span>
                <button
                  type="button"
                  onClick={onOpenScheduleWidget}
                  className="text-cool-600 hover:text-cool-800 font-semibold text-[11px] flex items-center gap-0.5"
                >
                  위젯 열기 <ChevronRight size={12} />
                </button>
              </div>

              <div className="space-y-1.5">
                {urgentEvents.slice(0, 4).map(ev => (
                  <div
                    key={ev.id}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-800 text-[11.5px] block">{ev.title}</span>
                      <span className="text-[10.5px] text-slate-500">일시: {ev.date} {ev.time} | 장소: {ev.location || '교내'}</span>
                    </div>
                    {ev.fromAi && (
                      <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        AI 추출
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Unread Messages AI Summary */}
            <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
              <div className="font-bold text-slate-800 flex items-center gap-1.5 text-[12.5px] mb-2">
                <FileText size={14} className="text-cool-600" />
                <span>미확인 쪽지 ({unreadMessages.length}건) AI 요약 분석</span>
              </div>

              <div className="space-y-1.5">
                {unreadMessages.map(msg => (
                  <div
                    key={msg.id}
                    onClick={() => onOpenMessage(msg.id)}
                    className="p-2 rounded-lg bg-cool-50/50 hover:bg-cool-100/60 border border-cool-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11.5px] font-bold text-slate-800 mb-0.5">
                      <span className="truncate">{msg.subject}</span>
                      <span className="text-[10px] text-slate-400 font-normal shrink-0 ml-1">{msg.dateLabel?.split(' ')[0]}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-1">{msg.preview}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Quick Questions Bar */}
            <div className="p-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto shrink-0 select-none">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  className="bg-white hover:bg-cool-50 border border-slate-200 hover:border-cool-300 text-slate-700 text-[10.5px] px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl whitespace-pre-line text-[11.5px] leading-relaxed shadow-2xs ${
                      msg.sender === 'user'
                        ? 'bg-cool-600 text-white rounded-br-none'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
                </div>
              ))}

              {isProcessing && (
                <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
                  <Bot size={14} className="animate-spin text-cool-600" />
                  <span>로컬 AI가 교무 데이터를 분석하고 답변을 생성하고 있습니다...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="p-2 border-t border-slate-200 bg-slate-50 flex items-center gap-1.5"
            >
              <input
                type="text"
                placeholder="일정, 마감 공문, 서류 작성 관련 질문을 입력하세요..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-[11.5px] outline-none focus:border-cool-500"
              />
              <button
                type="submit"
                className="bg-cool-600 hover:bg-cool-700 text-white p-2 rounded-lg transition-colors"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        )}
      </div>
    </WindowFrame>
  );
}
