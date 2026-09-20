import React, { createContext, useContext, useState, useCallback } from 'react';

export type Page = 'login' | 'dashboard' | 'reports' | 'about' | 'academics';
export type Role = 'admin' | 'user';

interface AuthState {
  isLoggedIn: boolean;
  role: Role | null;
  username: string | null;
}

interface AppContextValue extends AuthState {
  page: Page;
  navigate: (p: Page) => void;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const CREDENTIALS: Record<string, { password: string; role: Role }> = {
  admin: { password: 'admin123', role: 'admin' },
  user:  { password: 'user123',  role: 'user' },
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState<Page>('login');
  const [auth, setAuth] = useState<AuthState>({ isLoggedIn: false, role: null, username: null });

  const navigate = useCallback((p: Page) => setPage(p), []);

  const login = useCallback((username: string, password: string): boolean => {
    const entry = CREDENTIALS[username.toLowerCase()];
    if (entry && entry.password === password) {
      setAuth({ isLoggedIn: true, role: entry.role, username });
      setPage('dashboard');
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setAuth({ isLoggedIn: false, role: null, username: null });
    setPage('login');
  }, []);

  return (
    <AppContext.Provider value={{ ...auth, page, navigate, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
