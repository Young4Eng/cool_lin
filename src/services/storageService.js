// LocalStorage Persistence for CoolMessenger State

import { INITIAL_MESSAGES, INITIAL_SCHEDULE_EVENTS, INITIAL_TODOS, INITIAL_CHATS } from '../data/initialData';

const KEYS = {
  MESSAGES: 'cool_messages_v1',
  SCHEDULE: 'cool_schedule_v1',
  TODOS: 'cool_todos_v1',
  CHATS: 'cool_chats_v1',
  USER_STATUS: 'cool_user_status_v1',
  WIDGET_CONFIG: 'cool_widget_config_v1',
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

export function loadStoredSchedule() {
  try {
    const data = localStorage.getItem(KEYS.SCHEDULE);
    return data ? JSON.parse(data) : INITIAL_SCHEDULE_EVENTS;
  } catch (e) {
    return INITIAL_SCHEDULE_EVENTS;
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
    return data ? JSON.parse(data) : INITIAL_TODOS;
  } catch (e) {
    return INITIAL_TODOS;
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
