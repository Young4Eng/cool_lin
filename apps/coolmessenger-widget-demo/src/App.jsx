import React, { useState, useEffect } from 'react';
import Desktop from './components/desktop/Desktop';
import Taskbar from './components/desktop/Taskbar';
import CoolMessengerMain from './components/messenger/CoolMessengerMain';
import MessageBoxWindow from './components/messageBox/MessageBoxWindow';
import ScheduleWidget from './components/scheduleWidget/ScheduleWidget';
import AiAssistantWindow from './components/aiAssistant/AiAssistantWindow';
import AiSettingsModal from './components/aiAssistant/AiSettingsModal';
import ChatWindow from './components/messenger/ChatWindow';
import ComposeModal from './components/messenger/ComposeModal';

import {
  loadStoredMessages, saveStoredMessages,
  loadStoredSchedule, saveStoredSchedule,
  loadStoredTodos, saveStoredTodos,
  loadStoredChats, saveStoredChats
} from './services/storageService';
import { SCHOOL_MEMBERS } from './data/initialData';
import { notifyAiEventAdded } from './utils/widgetSync';
import { openDesktopWidget } from './utils/desktopWidgetLauncher';
import { getWidgetAutoStart } from './utils/widgetAutoStart';

export default function App() {
  // Global App States
  const [messages, setMessages] = useState(loadStoredMessages);
  const [events, setEvents] = useState(loadStoredSchedule);
  const [todos, setTodos] = useState(loadStoredTodos);
  const [chats, setChats] = useState(loadStoredChats);

  // Sync to localStorage
  useEffect(() => saveStoredMessages(messages), [messages]);
  useEffect(() => saveStoredSchedule(events), [events]);
  useEffect(() => saveStoredTodos(todos), [todos]);
  useEffect(() => saveStoredChats(chats), [chats]);

  // Two-way sync with the standalone desktop calendar widget window
  // (widget.html, opened via window.open). Since it's a separate window
  // reading/writing the same localStorage keys, the browser's `storage`
  // event fires here automatically whenever the widget window changes
  // schedule/todo data (e.g. checking off a to-do), and we pick it up.
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'cool_schedule_v1') setEvents(loadStoredSchedule());
      if (e.key === 'cool_todos_v1') setTodos(loadStoredTodos());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Auto-open the standalone desktop calendar widget window whenever the
  // app itself starts (e.g. the teacher's PC restarts and they reopen
  // CoolMessenger) — this is what makes the widget "come back on its own"
  // instead of needing a manual click every time.
  //
  // Caveat this can't get around: a browser only allows window.open() to
  // run with no click at all once the user has allowed pop-ups for this
  // site (one-time, in the browser's site settings) — otherwise it's
  // silently blocked. We detect that and show a one-time hint rather than
  // failing without explanation.
  const [showWidgetBlockedHint, setShowWidgetBlockedHint] = useState(false);
  useEffect(() => {
    if (!getWidgetAutoStart()) return;
    const popup = openDesktopWidget();
    if (!popup || popup.closed) {
      setShowWidgetBlockedHint(true);
    }
  }, []);

  // Window Management & Z-Index
  const [topZ, setTopZ] = useState(50);
  const [windows, setWindows] = useState({
    messenger: { isOpen: true, isMinimized: false, isMaximized: false, zIndex: 30 },
    messageBox: { isOpen: true, isMinimized: false, isMaximized: false, zIndex: 35 },
    schedule: { isOpen: true, isMinimized: false, isMaximized: false, zIndex: 40 },
    aiAssistant: { isOpen: false, isMinimized: false, isMaximized: false, zIndex: 45 },
  });

  // Active 1:1 Chat Windows (by member ID)
  const [activeChatMemberId, setActiveChatMemberId] = useState(null);
  // Compose Modal State
  const [composeModalState, setComposeModalState] = useState({ isOpen: false, data: {} });
  // AI Settings Modal State
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);

  const bringToFront = (winKey) => {
    const nextZ = topZ + 1;
    setTopZ(nextZ);
    setWindows(prev => ({
      ...prev,
      [winKey]: {
        ...prev[winKey],
        isOpen: true,
        isMinimized: false,
        zIndex: nextZ
      }
    }));
  };

  const toggleWindow = (winKey) => {
    const current = windows[winKey];
    if (!current || !current.isOpen) {
      bringToFront(winKey);
    } else if (current.isMinimized) {
      bringToFront(winKey);
    } else {
      // Minimize
      setWindows(prev => ({
        ...prev,
        [winKey]: { ...prev[winKey], isMinimized: true }
      }));
    }
  };

  const closeWindow = (winKey) => {
    setWindows(prev => ({
      ...prev,
      [winKey]: { ...prev[winKey], isOpen: false }
    }));
  };

  const minimizeWindow = (winKey) => {
    setWindows(prev => ({
      ...prev,
      [winKey]: { ...prev[winKey], isMinimized: true }
    }));
  };

  const maximizeWindow = (winKey) => {
    setWindows(prev => ({
      ...prev,
      [winKey]: { ...prev[winKey], isMaximized: !prev[winKey].isMaximized }
    }));
  };

  // --- Handlers ---
  // 1. Add AI Extracted Event to Schedule Widget
  const handleAddEvent = (newEvent) => {
    setEvents(prev => {
      // Prevent duplicate title on same date
      const exists = prev.some(e => e.date === newEvent.date && e.title === newEvent.title);
      if (exists) return prev;
      return [newEvent, ...prev];
    });

    // Also add to Todo list if urgent
    if (newEvent.priority === 'urgent' || newEvent.priority === 'high') {
      setTodos(prev => {
        const exists = prev.some(t => t.text === newEvent.title);
        if (exists) return prev;
        return [
          {
            id: 'todo-' + Date.now(),
            text: newEvent.title,
            dueDate: newEvent.date,
            completed: false,
            priority: newEvent.priority,
            linkedMessageId: newEvent.sourceMessageId
          },
          ...prev
        ];
      });
    }

    // Ensure schedule widget is visible and brought to front
    bringToFront('schedule');

    // Nudge the standalone desktop calendar widget window (if open) so it
    // can show an instant "AI가 새 일정을 정리했습니다" toast, on top of
    // the storage-event sync that keeps its data correct either way.
    if (newEvent.fromAi) {
      notifyAiEventAdded(newEvent);
    }
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
  };

  // 2. Todos
  const handleToggleTodo = (todoId) => {
    setTodos(prev => prev.map(t => t.id === todoId ? { ...t, completed: !t.completed } : t));
  };

  const handleAddTodo = (newTodo) => {
    setTodos(prev => [newTodo, ...prev]);
  };

  const handleDeleteTodo = (todoId) => {
    setTodos(prev => prev.filter(t => t.id !== todoId));
  };

  // 3. Messages & Compose
  const handleToggleStar = (msgId) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, starred: !m.starred } : m));
  };

  const handleDeleteMessage = (msgId) => {
    setMessages(prev => prev.filter(m => m.id !== msgId));
  };

  const handleSendNewMessage = (msg) => {
    setMessages(prev => [msg, ...prev]);
  };

  const handleOpenCompose = (memberIds = [], initialSubject = '', initialBody = '') => {
    const toMembers = memberIds.map(id => SCHOOL_MEMBERS.find(m => m.id === id)).filter(Boolean);
    setComposeModalState({
      isOpen: true,
      data: { toMembers, subject: initialSubject, initialBody }
    });
  };

  // 4. Chats
  const handleOpenChat = (memberId) => {
    setActiveChatMemberId(memberId);
  };

  const handleSendChatMessage = (targetMemberId, chatObj) => {
    setChats(prev => ({
      ...prev,
      [targetMemberId]: [...(prev[targetMemberId] || []), chatObj]
    }));
  };

  const unreadMessagesCount = messages.filter(m => m.unread).length;
  const activeChatMember = SCHOOL_MEMBERS.find(m => m.id === activeChatMemberId);

  return (
    <Desktop onOpenApp={(appKey) => bringToFront(appKey)}>
      {/* Desktop-widget auto-start hint — shown only when the browser
          silently blocked the automatic window.open() above */}
      {showWidgetBlockedHint && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[150] w-[420px] max-w-[92vw] bg-white border border-amber-300 rounded-xl shadow-win px-3.5 py-3 text-xs animate-scale-up">
          <div className="flex items-start gap-2.5">
            <span className="text-lg leading-none shrink-0">📌</span>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-800 mb-0.5">캘린더 위젯 자동 실행이 차단되었습니다</div>
              <p className="text-slate-600 leading-relaxed">
                브라우저 팝업 차단으로 인해 위젯이 자동으로 뜨지 못했어요. 아래에서 지금 여신 뒤,
                주소창의 팝업 차단 아이콘에서 <b>이 사이트의 팝업 허용</b>을 켜두시면
                다음부터는 PC를 껐다 켜도 위젯이 자동으로 뜹니다.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => { openDesktopWidget(); setShowWidgetBlockedHint(false); }}
                  className="bg-cool-600 hover:bg-cool-700 text-white font-semibold px-3 py-1.5 rounded-lg text-[11px]"
                >
                  지금 위젯 열기
                </button>
                <button
                  type="button"
                  onClick={() => setShowWidgetBlockedHint(false)}
                  className="text-slate-500 hover:text-slate-700 font-medium px-2 py-1.5 text-[11px]"
                >
                  나중에
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. CoolMessenger GENTOO Main Window */}
      <CoolMessengerMain
        isOpen={windows.messenger.isOpen}
        isMinimized={windows.messenger.isMinimized}
        zIndex={windows.messenger.zIndex}
        onFocus={() => bringToFront('messenger')}
        onMinimize={() => minimizeWindow('messenger')}
        onMaximize={() => maximizeWindow('messenger')}
        onClose={() => closeWindow('messenger')}
        unreadCount={unreadMessagesCount}
        onOpenMessageBox={() => bringToFront('messageBox')}
        onOpenScheduleWidget={() => bringToFront('schedule')}
        onOpenAiAssistant={() => bringToFront('aiAssistant')}
        onOpenAiSettings={() => setIsAiSettingsOpen(true)}
        onOpenChat={handleOpenChat}
        onOpenCompose={(ids) => handleOpenCompose(ids)}
        onOpenDownloadModal={() => {
          bringToFront('messageBox');
        }}
      />

      {/* 2. Message Box Window (첨부 1번 이미지 완벽 재현) */}
      <MessageBoxWindow
        isOpen={windows.messageBox.isOpen}
        isMinimized={windows.messageBox.isMinimized}
        zIndex={windows.messageBox.zIndex}
        onFocus={() => bringToFront('messageBox')}
        onMinimize={() => minimizeWindow('messageBox')}
        onMaximize={() => maximizeWindow('messageBox')}
        onClose={() => closeWindow('messageBox')}
        messages={messages}
        onAddEventToSchedule={handleAddEvent}
        onOpenComposeReply={({ toMembers, subject, initialBody }) => {
          setComposeModalState({
            isOpen: true,
            data: { toMembers, subject, initialBody }
          });
        }}
        onDeleteMessage={handleDeleteMessage}
        onToggleStar={handleToggleStar}
      />

      {/* 3. Schedule & Calendar Floating Widget (일정 관리 위젯) */}
      <ScheduleWidget
        isOpen={windows.schedule.isOpen}
        isMinimized={windows.schedule.isMinimized}
        zIndex={windows.schedule.zIndex}
        onFocus={() => bringToFront('schedule')}
        onMinimize={() => minimizeWindow('schedule')}
        onMaximize={() => maximizeWindow('schedule')}
        onClose={() => closeWindow('schedule')}
        events={events}
        todos={todos}
        onAddEvent={handleAddEvent}
        onDeleteEvent={handleDeleteEvent}
        onToggleTodo={handleToggleTodo}
        onAddTodo={handleAddTodo}
        onDeleteTodo={handleDeleteTodo}
        onOpenMessage={(msgId) => {
          bringToFront('messageBox');
        }}
        onOpenAiAssistant={() => bringToFront('aiAssistant')}
      />

      {/* 4. Cool-AI Assistant Window (로컬 AI 스마트 비서) */}
      <AiAssistantWindow
        isOpen={windows.aiAssistant.isOpen}
        isMinimized={windows.aiAssistant.isMinimized}
        zIndex={windows.aiAssistant.zIndex}
        onFocus={() => bringToFront('aiAssistant')}
        onMinimize={() => minimizeWindow('aiAssistant')}
        onMaximize={() => maximizeWindow('aiAssistant')}
        onClose={() => closeWindow('aiAssistant')}
        messages={messages}
        events={events}
        todos={todos}
        onAddEvent={handleAddEvent}
        onOpenAiSettings={() => setIsAiSettingsOpen(true)}
        onOpenMessage={(msgId) => {
          bringToFront('messageBox');
        }}
        onOpenScheduleWidget={() => bringToFront('schedule')}
      />

      {/* 5. 1:1 Live Chat Window */}
      {activeChatMember && (
        <ChatWindow
          isOpen={!!activeChatMemberId}
          isMinimized={false}
          zIndex={topZ + 5}
          onFocus={() => setTopZ(prev => prev + 1)}
          onClose={() => setActiveChatMemberId(null)}
          targetMember={activeChatMember}
          chatHistory={chats[activeChatMemberId] || []}
          onSendMessage={handleSendChatMessage}
        />
      )}

      {/* 6. Compose Message Modal */}
      <ComposeModal
        isOpen={composeModalState.isOpen}
        onClose={() => setComposeModalState({ isOpen: false, data: {} })}
        initialData={composeModalState.data}
        onSendMessage={handleSendNewMessage}
      />

      {/* 7. Local AI Settings Modal */}
      <AiSettingsModal
        isOpen={isAiSettingsOpen}
        onClose={() => setIsAiSettingsOpen(false)}
      />

      {/* 8. Windows 11 Taskbar */}
      <Taskbar
        activeWindows={windows}
        unreadCount={unreadMessagesCount}
        onToggleWindow={toggleWindow}
        onOpenApp={(appKey) => bringToFront(appKey)}
      />
    </Desktop>
  );
}
