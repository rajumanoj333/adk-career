import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { loadSession, saveSession, type SessionState } from '../lib/session';

interface AppContextValue {
  session: SessionState;
  setSession: (next: SessionState) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<SessionState>(() => loadSession());

  const setSession = (next: SessionState) => {
    setSessionState(next);
    saveSession(next);
  };

  const value = useMemo(() => ({ session, setSession }), [session]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }

  return context;
}
