// Client-side registry of chat conversations.
//
// The chatbot is anonymous-first: a conversation is just a `sessionId` and its
// messages are already persisted server-side (ChatLog rows, loaded via
// GET /chat/:sessionId). To support "New Chat" + a history list without requiring
// login, we keep a lightweight index of the browser's sessions in localStorage.
// Each entry is metadata only (id/title/timestamps) — never the messages.

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

const SESSIONS_KEY = "chat_sessions";
const ACTIVE_KEY = "chat_active_session";
// The original single-session key, kept so existing conversations aren't lost.
const LEGACY_KEY = "chat_session_id";

export const DEFAULT_SESSION_TITLE = "ການສົນທະນາໃໝ່";

const uuid = () => crypto.randomUUID();

function read(): ChatSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? (arr as ChatSession[]) : [];
  } catch {
    return [];
  }
}

function write(sessions: ChatSession[]): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

/** All sessions, most recently active first. Migrates the legacy single session. */
export function loadSessions(): ChatSession[] {
  let sessions = read();

  if (sessions.length === 0) {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const now = Date.now();
      sessions = [
        { id: legacy, title: DEFAULT_SESSION_TITLE, createdAt: now, updatedAt: now },
      ];
      write(sessions);
    }
  }

  return [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getActiveSessionId(): string | null {
  return localStorage.getItem(ACTIVE_KEY) || localStorage.getItem(LEGACY_KEY);
}

export function setActiveSessionId(id: string): void {
  localStorage.setItem(ACTIVE_KEY, id);
  // Keep the legacy key in sync so anything still reading it stays correct.
  localStorage.setItem(LEGACY_KEY, id);
}

/** Create a fresh conversation and make it active. */
export function createSession(): ChatSession {
  const now = Date.now();
  const session: ChatSession = {
    id: uuid(),
    title: DEFAULT_SESSION_TITLE,
    createdAt: now,
    updatedAt: now,
  };
  write([session, ...read()]);
  setActiveSessionId(session.id);
  return session;
}

/** Guarantee there is an active session to render, creating one if needed. */
export function ensureSession(): ChatSession {
  const sessions = loadSessions();
  const activeId = getActiveSessionId();
  const active = sessions.find((s) => s.id === activeId);
  if (active) return active;
  if (sessions.length > 0) {
    setActiveSessionId(sessions[0].id);
    return sessions[0];
  }
  return createSession();
}

/** Mark a session as just-active (moves it to the top of the history list). */
export function bumpSession(id: string, ts: number = Date.now()): void {
  const sessions = read();
  const idx = sessions.findIndex((s) => s.id === id);
  if (idx === -1) {
    sessions.push({ id, title: DEFAULT_SESSION_TITLE, createdAt: ts, updatedAt: ts });
  } else {
    sessions[idx].updatedAt = Math.max(sessions[idx].updatedAt, ts);
  }
  write(sessions);
}

/**
 * Give a session a real title from its first question — but only if it still has
 * the placeholder title, so a user-loaded old chat is never silently renamed.
 * Does NOT change `updatedAt` (viewing history must not reorder it).
 */
export function renameSessionIfDefault(id: string, rawTitle: string): void {
  const title = rawTitle.trim();
  if (!title) return;
  const sessions = read();
  const idx = sessions.findIndex((s) => s.id === id);
  if (idx === -1) return;
  if (sessions[idx].title && sessions[idx].title !== DEFAULT_SESSION_TITLE) return;
  sessions[idx].title = title.length > 40 ? `${title.slice(0, 40)}…` : title;
  write(sessions);
}

export function deleteSession(id: string): void {
  write(read().filter((s) => s.id !== id));
}
