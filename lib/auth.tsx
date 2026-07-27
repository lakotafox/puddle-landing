'use client';

/**
 * Authentication context/provider.
 *
 * Holds the current session (user, employee, employer, roles), restores it
 * from a stored JWT on load, and exposes login / register / logout helpers.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { apiClient, setStoredToken, getStoredToken } from '@/lib/api';
import type {
  LoginRequest,
  MeResponse,
  RegisterEmployerRequest,
} from '@/lib/types';

interface AuthContextValue {
  me: MeResponse | null;
  roles: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  registerEmployer: (data: RegisterEmployerRequest) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: string[]) => boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getStoredToken()) {
      setMe(null);
      setIsLoading(false);
      return;
    }
    try {
      const data = await apiClient.getMe();
      setMe(data);
    } catch {
      // Token invalid/expired — clear it.
      setStoredToken(null);
      setMe(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Restore session on first mount.
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (credentials: LoginRequest) => {
    const token = await apiClient.login(credentials);
    setStoredToken(token.access_token);
    const data = await apiClient.getMe();
    setMe(data);
  }, []);

  const registerEmployer = useCallback(
    async (data: RegisterEmployerRequest) => {
      // Register, then log in with the same credentials to obtain a token.
      await apiClient.registerEmployer(data);
      const token = await apiClient.login({
        email: data.admin_email,
        password: data.password,
      });
      setStoredToken(token.access_token);
      const meData = await apiClient.getMe();
      setMe(meData);
    },
    []
  );

  const logout = useCallback(() => {
    setStoredToken(null);
    setMe(null);
  }, []);

  const hasRole = useCallback(
    (...roles: string[]) => {
      if (!me) return false;
      return roles.some((r) => me.roles.includes(r));
    },
    [me]
  );

  const value: AuthContextValue = {
    me,
    roles: me?.roles ?? [],
    isAuthenticated: me !== null,
    isLoading,
    login,
    registerEmployer,
    logout,
    hasRole,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
