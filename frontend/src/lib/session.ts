const SESSION_KEY = 'adk-career-session';

export interface SessionState {
  userId: number | null;
  userName?: string;
  userEmail?: string;
}

export function loadSession(): SessionState {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return { userId: null };
  }

  try {
    return JSON.parse(raw) as SessionState;
  } catch {
    return { userId: null };
  }
}

export function saveSession(state: SessionState) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(state));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
