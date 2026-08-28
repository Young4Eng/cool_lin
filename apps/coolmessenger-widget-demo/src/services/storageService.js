// LocalStorage Persistence for CoolMessenger State

import { INITIAL_MESSAGES, INITIAL_CHATS, INITIAL_QUICK_PHRASES, INITIAL_GROUP_CHATS } from '../data/initialData';

const KEYS = {
  MESSAGES: 'cool_messages_v1',
  SCHEDULE: 'cool_schedule_v1',
  TODOS: 'cool_todos_v1',
  CHATS: 'cool_chats_v1',
  USER_STATUS: 'cool_user_status_v1',
  WIDGET_CONFIG: 'cool_widget_config_v1',
  QUICK_PHRASES: 'cool_quick_phrases_v1',
  GROUP_CHATS: 'cool_group_chats_v1',
  AI_PROCESSED_IDS: 'cool_ai_processed_ids_v1',
  REMINDED_EVENT_IDS: 'cool_reminded_event_ids_v1',
};

export function loadStoredMessages() {
  try {
    const data = localStorage.getItem(KEYS.MESSAGES);
    return data ? JSON.parse(data) : INITIAL_MESSAGES;
  } catch (e) {
    return INITIAL_MESSAGES;
  }
}

export function saveStoredMessages(messages) {
  try {
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(messages));
  } catch (e) {}
}

// 예전 데모 씨앗 데이터의 id. 코드에서는 지웠지만, 그 전에 한 번이라도 켠 PC 에는
// localStorage 에 그대로 남아 있다 — 설치본을 새로 깔아도 저장소는 지워지지 않는다.
// 그래서 읽을 때마다 걸러낸다. 사용자가 직접 만든 일정은 id 가 `ev-user-...`,
// 가져오기로 만든 것은 `ev-ai-...` 라 여기 걸리지 않는다.
const DEMO_EVENT_IDS = new Set([
  'ev-01', 'ev-02', 'ev-03', 'ev-04', 'ev-05', 'ev-06', 'ev-07', 'ev-08',
]);
const DEMO_TODO_IDS = new Set([
  'todo-01', 'todo-02', 'todo-03', 'todo-04', 'todo-05',
]);

/** 남아 있던 데모 항목을 걸러내고, 실제로 지워졌으면 저장소도 정리한다. */
function withoutDemoRows(list, demoIds, storageKey) {
  if (!Array.isArray(list)) return [];
  const kept = list.filter((it) => !demoIds.has(it?.id));
  if (kept.length !== list.length) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(kept));
    } catch (e) {}
  }
  return kept;
}

// 위젯은 실제 쿨메신저 가져오기로 채운다 — 더미 학사일정으로 시작하지 않는다.
export function loadStoredSchedule() {
  try {
    const data = localStorage.getItem(KEYS.SCHEDULE);
    return data ? withoutDemoRows(JSON.parse(data), DEMO_EVENT_IDS, KEYS.SCHEDULE) : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredSchedule(events) {
  try {
    localStorage.setItem(KEYS.SCHEDULE, JSON.stringify(events));
  } catch (e) {}
}

export function loadStoredTodos() {
  try {
    const data = localStorage.getItem(KEYS.TODOS);
    return data ? withoutDemoRows(JSON.parse(data), DEMO_TODO_IDS, KEYS.TODOS) : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredTodos(todos) {
  try {
    localStorage.setItem(KEYS.TODOS, JSON.stringify(todos));
  } catch (e) {}
}

export function loadStoredChats() {
  try {
    const data = localStorage.getItem(KEYS.CHATS);
    return data ? JSON.parse(data) : INITIAL_CHATS;
  } catch (e) {
    return INITIAL_CHATS;
  }
}

export function saveStoredChats(chats) {
  try {
    localStorage.setItem(KEYS.CHATS, JSON.stringify(chats));
  } catch (e) {}
}

// 자주 쓰는 멘트 (자동텍스트입력 기능) — G-ONE의 "AI 대화 초안"과 유사한
// 목적: 매번 똑같이 쓰는 문장을 저장해뒀다가 작성창에서 바로 삽입.
export function loadStoredQuickPhrases() {
  try {
    const data = localStorage.getItem(KEYS.QUICK_PHRASES);
    return data ? JSON.parse(data) : INITIAL_QUICK_PHRASES;
  } catch (e) {
    return INITIAL_QUICK_PHRASES;
  }
}

export function saveStoredQuickPhrases(phrases) {
  try {
    localStorage.setItem(KEYS.QUICK_PHRASES, JSON.stringify(phrases));
  } catch (e) {}
}

// 여러 명 실시간 채팅(그룹 채팅) — { [groupId]: { id, name, memberIds, messages } }
export function loadStoredGroupChats() {
  try {
    const data = localStorage.getItem(KEYS.GROUP_CHATS);
    return data ? JSON.parse(data) : INITIAL_GROUP_CHATS;
  } catch (e) {
    return INITIAL_GROUP_CHATS;
  }
}

export function saveStoredGroupChats(groupChats) {
  try {
    localStorage.setItem(KEYS.GROUP_CHATS, JSON.stringify(groupChats));
  } catch (e) {}
}

// Which message ids the "자동 매크로" (auto schedule-extract) has already
// processed, and which event ids have already fired a deadline reminder —
// both persisted so reloading the app doesn't re-notify for the same thing.
export function loadStoredIdSet(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch (e) {
    return new Set();
  }
}

export function saveStoredIdSet(key, idSet) {
  try {
    localStorage.setItem(key, JSON.stringify([...idSet]));
  } catch (e) {}
}

export const AI_PROCESSED_IDS_KEY = KEYS.AI_PROCESSED_IDS;
export const REMINDED_EVENT_IDS_KEY = KEYS.REMINDED_EVENT_IDS;
