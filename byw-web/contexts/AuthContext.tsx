'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ApiError, setCurrentAccessToken } from '@/lib/api';
import {
  type AuthUser,
  type RegistroInput,
  fetchMe,
  login as loginApi,
  registro as registroApi,
} from '@/lib/auth-api';
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from '@/lib/auth-storage';

interface AuthContextValue {
  user: AuthUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegistroInput) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function applyToken(token: string | null): void {
  setCurrentAccessToken(token);
  if (token) {
    setStoredToken(token);
  } else {
    clearStoredToken();
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    applyToken(null);
    setUser(null);
  }, []);

  const loadSession = useCallback(async (token: string) => {
    applyToken(token);
    const profile = await fetchMe(token);
    setUser(profile);
  }, []);

  const refreshSession = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      clearSession();
      return;
    }

    try {
      await loadSession(token);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSession();
        return;
      }
      throw error;
    }
  }, [clearSession, loadSession]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const token = getStoredToken();
      if (!token) {
        if (!cancelled) {
          setIsLoading(false);
        }
        return;
      }

      try {
        await loadSession(token);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearSession();
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [clearSession, loadSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { accessToken } = await loginApi(email, password);
      await loadSession(accessToken);
    },
    [loadSession],
  );

  const register = useCallback(async (data: RegistroInput) => {
    await registroApi(data);
  }, []);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAdmin: user?.role === 'admin',
      isLoading,
      login,
      register,
      logout,
      refreshSession,
    }),
    [user, isLoading, login, register, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
