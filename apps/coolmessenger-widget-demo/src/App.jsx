import React, { useState, useEffect } from 'react';
import Desktop from './components/desktop/Desktop';
import Taskbar from './components/desktop/Taskbar';
import CoolMessengerMain from './components/messenger/CoolMessengerMain';
import MessageBoxWindow from './components/messageBox/MessageBoxWindow';
import AttachmentHub from './components/messageBox/AttachmentHub';
import ScheduleWidget from './components/scheduleWidget/ScheduleWidget';
import AiAssistantWindow from './components/aiAssistant/AiAssistantWindow';
import AiSettingsModal from './components/aiAssistant/AiSettingsModal';
import ChatWindow from './components/messenger/ChatWindow';
import GroupChatWindow from './components/messenger/GroupChatWindow';
import ComposeModal from './components/messenger/ComposeModal';
import NotificationCenter from './components/common/NotificationCenter';
import MobileShell from './components/mobile/MobileShell';

import {
  loadStoredMessages, saveStoredMessages,
  loadStoredSchedule, saveStoredSchedule,
  loadStoredTodos, saveStoredTodos,
  loadStoredChats, saveStoredChats,
  loadStoredGroupChats, saveStoredGroupChats,
  loadStoredIdSet, saveStoredIdSet, AI_PROCESSED_IDS_KEY, REMINDED_EVENT_IDS_KEY,
} from './services/storageService';
import { SCHOOL_MEMBERS } from './data/initialData';
import { notifyAiEventAdded } from './utils/widgetSync';
import { openDesktopWidget } from './utils/desktopWidgetLauncher';
import { getWidgetAutoStart } from './utils/widgetAutoStart';
import { extractScheduleFromText, getAiSettings } from './services/localAiService';
import { notify } from './services/notificationService';
import { useIsMobile } from './hooks/useIsMobile';

export default function App() {
  const isMobile = useIsMobile();

  // Global App States
  const [messages, setMessages] = useState(loadStoredMessages);
  const [events, setEvents] = useState(loadStoredSchedule);
  const [todos, setTodos] = useState(loadStoredTodos);
  const [chats, setChats] = useState(loadStoredChats);
  const [groupChats, setGroupChats] = useState(loadStoredGroupChats);

  // Sync to localStorage
  useEffect(() => saveStoredMessages(messages), [messages]);
  useEffect(() => saveStoredSchedule(events), [events]);
  useEffect(() => saveStoredTodos(todos), [todos]);
  useEffect(() => saveStoredChats(chats), [chats]);
  useEffect(() => saveStoredGroupChats(groupChats), [groupChats]);

  // "메신저가 안 쌓이게" — 자동 매크로: 새로 도착한(unread) 쪽지를 사람이
  // 일일이 열어 "AI 일정 추출" 버튼을 누르지 않아도, 설정이 켜져 있으면
  // 자동으로 분석해서 캘린더/검토함에 반영하고 알림을 띄운다. 이미 처리한
  // 쪽지 id는 저장해둬서 새로고침해도 같은 알림이 반복되지 않게 한다.
  useEffect(() => {
    const settings = getAiSettings();
    if (!settings.autoExtractSchedule) return;

    const processedIds = loadStoredIdSet(AI_PROCESSED_IDS_KEY);
    const unprocessedUnread = messages.filter(m => m.folder === 'inbox' && m.unread && !processedIds.has(m.id));
    if (unprocessedUnread.length === 0) return;

    unprocessedUnread.forEach(msg => {
      const event = extractScheduleFromText(msg.bodyHtml, msg.subject, {
        senderFlaggedCalendar: !!msg.linkToCalendar,
      });
      if (event) {
        event.sourceMessageId = msg.id;
        handleAddEvent(event, { silent: true });
      }
      processedIds.add(msg.id);

      notify({
        kind: 'newMessage',
        title: '새 쪽지 도착 & 자동 정리 완료',
        message: `"${msg.subject}"${event ? ' — 일정을 자동으로 분석해 캘린더/검토함에 반영했어요.' : ''}`,
      });
    });
    saveStoredIdSet(AI_PROCESSED_IDS_KEY, processedIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // "마감 전 알림 서비스" — 설정된 분(deadlineReminderMinutes) 이내로
  // 다가온 일정을 주기적으로 훑어 한 번씩만 알려준다.
  useEffect(() => {
    const checkDeadlines = () => {
      const settings = getAiSettings();
      if (!settings.deadlineReminderEnabled) return;

      const remindedIds = loadStoredIdSet(REMINDED_EVENT_IDS_KEY);
      const now = new Date();
      let changed = false;

      events.forEach(ev => {
        if (remindedIds.has(ev.id) || !ev.date || !ev.time) return;
        if (ev.fromAi && ev.autoRegisterEligible === false && !ev.reviewed) return; // still in 검토함
        const target = new Date(`${ev.date}T${ev.time}:00`);
        const diffMin = (target - now) / 60000;
        if (diffMin > 0 && diffMin <= settings.deadlineReminderMinutes) {
          notify({
            kind: 'deadline',
            title: `⏰ 마감 ${Math.round(diffMin)}분 전`,
            message: `${ev.title} · ${ev.date} ${ev.time}${ev.location ? ' · ' + ev.location : ''}`,
          });
          remindedIds.add(ev.id);
          changed = true;
        }
      });

      if (changed) saveStoredIdSet(REMINDED_EVENT_IDS_KEY, remindedIds);
    };

    checkDeadlines();
    const timer = setInterval(checkDeadlines, 30000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

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
    attachmentHub: { isOpen: false, isMinimized: false, isMaximized: false, zIndex: 46 },
    groupChat: { isOpen: false, isMinimized: false, isMaximized: false, zIndex: 47 },
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
  // `silent` skips the focus-steal + confetti-adjacent nudges — used by the
  // background auto-macro pass so processing several unread messages at
  // once doesn't yank the window around.
  const handleAddEvent = (newEvent, { silent = false } = {}) => {
    setEvents(prev => {
      // Prevent duplicate title on same date
      const exists = prev.some(e => e.date === newEvent.date && e.title === newEvent.title);
      if (exists) return prev;
      return [newEvent, ...prev];
    });

    // Also add to Todo list if urgent, and eligible for auto-registration
    // (still-under-review AI candidates shouldn't silently become todos too)
    const isTrusted = !newEvent.fromAi || newEvent.autoRegisterEligible !== false;
    if (isTrusted && (newEvent.priority === 'urgent' || newEvent.priority === 'high')) {
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

    if (!silent) {
      // Ensure schedule widget is visible and brought to front
      bringToFront('schedule');
    }

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

  // AI가 확신하지 못해 검토함에 있던 일정을 사람이 확인 후 캘린더에 반영
  const handleApproveEvent = (eventId) => {
    setEvents(prev => prev.map(e => (e.id === eventId ? { ...e, reviewed: true } : e)));
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

  const handleArchiveMessage = (msgId) => {
    setMessages(prev => prev.map(m => (m.id === msgId ? { ...m, folder: 'archived', prevFolder: m.folder } : m)));
  };

  const handleUnarchiveMessage = (msgId) => {
    setMessages(prev => prev.map(m => (m.id === msgId ? { ...m, folder: m.prevFolder || 'inbox' } : m)));
  };

  const handleMarkUnread = (msgId) => {
    setMessages(prev => prev.map(m => (m.id === msgId ? { ...m, unread: true } : m)));
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

  // 5. Group Chat (여러 명 실시간 채팅)
  const [activeGroupChatId, setActiveGroupChatId] = useState(
    () => Object.keys(loadStoredGroupChats())[0] || null
  );

  const handleSendGroupMessage = (groupId, chatObj) => {
    setGroupChats(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        messages: [...(prev[groupId]?.messages || []), chatObj],
      },
    }));
  };

  const handleCreateGroup = (group) => {
    setGroupChats(prev => ({ ...prev, [group.id]: group }));
    setActiveGroupChatId(group.id);
  };

  const unreadMessagesCount = messages.filter(m => m.unread).length;
  const activeChatMember = SCHOOL_MEMBERS.find(m => m.id === activeChatMemberId);

  // On a phone-sized viewport, the desktop window-manager UI (floating,
  // draggable windows) isn't usable — swap in the dedicated mobile shell
  // instead of squeezing the same layout down.
  // ("쿨메신저 집에서도 볼 수 있게" → open the same app on a phone browser)
  if (isMobile) {
    return (
      <>
        <NotificationCenter />
        <MobileShell
          messages={messages}
          events={events}
          todos={todos}
          onOpenCompose={handleOpenCompose}
          onOpenChat={handleOpenChat}
          onAddEventToSchedule={handleAddEvent}
          onApproveEvent={handleApproveEvent}
          onDeleteEvent={handleDeleteEvent}
          onToggleTodo={handleToggleTodo}
          onAddTodo={handleAddTodo}
          onDeleteTodo={handleDeleteTodo}
          onDeleteMessage={handleDeleteMessage}
          onToggleStar={handleToggleStar}
          onArchiveMessage={handleArchiveMessage}
          onUnarchiveMessage={handleUnarchiveMessage}
          onMarkUnread={handleMarkUnread}
          onOpenComposeReply={({ toMembers, subject, initialBody }) =>
            setComposeModalState({ isOpen: true, data: { toMembers, subject, initialBody } })
          }
        />
        <ComposeModal
          isOpen={composeModalState.isOpen}
          onClose={() => setComposeModalState({ isOpen: false, data: {} })}
          initialData={composeModalState.data}
          onSendMessage={handleSendNewMessage}
        />
      </>
    );
  }

  return (
    <Desktop onOpenApp={(appKey) => bringToFront(appKey)}>
      <NotificationCenter />

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
        events={events}
        onOpenMessageBox={() => bringToFront('messageBox')}
        onOpenScheduleWidget={() => bringToFront('schedule')}
        onOpenAiAssistant={() => bringToFront('aiAssistant')}
        onOpenAiSettings={() => setIsAiSettingsOpen(true)}
        onOpenChat={handleOpenChat}
        onOpenCompose={(ids) => handleOpenCompose(ids)}
        onOpenDownloadModal={() => {
          bringToFront('messageBox');
        }}
        onOpenGroupChat={() => bringToFront('groupChat')}
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
        events={events}
        onAddEventToSchedule={handleAddEvent}
        onOpenComposeReply={({ toMembers, subject, initialBody }) => {
          setComposeModalState({
            isOpen: true,
            data: { toMembers, subject, initialBody }
          });
        }}
        onDeleteMessage={handleDeleteMessage}
        onToggleStar={handleToggleStar}
        onArchiveMessage={handleArchiveMessage}
        onUnarchiveMessage={handleUnarchiveMessage}
        onMarkUnread={handleMarkUnread}
        onOpenAttachmentHub={() => bringToFront('attachmentHub')}
      />

      {/* Attachment Hub — 첨부파일 한 번에 보는 공간 */}
      <AttachmentHub
        isOpen={windows.attachmentHub.isOpen}
        isMinimized={windows.attachmentHub.isMinimized}
        zIndex={windows.attachmentHub.zIndex}
        onFocus={() => bringToFront('attachmentHub')}
        onMinimize={() => minimizeWindow('attachmentHub')}
        onMaximize={() => maximizeWindow('attachmentHub')}
        onClose={() => closeWindow('attachmentHub')}
        messages={messages}
        onOpenMessage={() => bringToFront('messageBox')}
      />

      {/* Group Chat — 여러 명 실시간 채팅 */}
      <GroupChatWindow
        isOpen={windows.groupChat.isOpen}
        isMinimized={windows.groupChat.isMinimized}
        zIndex={windows.groupChat.zIndex}
        onFocus={() => bringToFront('groupChat')}
        onMinimize={() => minimizeWindow('groupChat')}
        onMaximize={() => maximizeWindow('groupChat')}
        onClose={() => closeWindow('groupChat')}
        groupChats={groupChats}
        activeGroupId={activeGroupChatId}
        onSelectGroup={setActiveGroupChatId}
        onSendGroupMessage={handleSendGroupMessage}
        onCreateGroup={handleCreateGroup}
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
        onApproveEvent={handleApproveEvent}
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
