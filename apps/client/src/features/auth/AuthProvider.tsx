import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { registerRefreshHandler } from '../../services/api/client';
import {
  clearAuthentication,
  getMe,
  hasPendingLogout,
  login as loginRequest,
  logout as logoutRequest,
  markLogoutPending,
  refreshSession,
  register as registerRequest,
} from './api';
import type { LoginValues, RegisterValues } from './schemas';
import type { AuthStatus, SafeUser } from './types';

interface AuthContextValue {
  status: AuthStatus;
  user: SafeUser | null;
  notice: string | null;
  login(values: LoginValues): Promise<void>;
  register(values: RegisterValues): Promise<void>;
  logout(): Promise<void>;
  retryBootstrap(): Promise<void>;
  retryLogout(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const meKey = ['auth', 'me'] as const;

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>('bootstrapping');
  const [user, setUser] = useState<SafeUser | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const generation = useRef(0);

  const bootstrap = useCallback(async () => {
    const operation = ++generation.current;
    setStatus('bootstrapping');
    setUser(null);
    try {
      if (await hasPendingLogout()) {
        if (operation !== generation.current) return;
        setStatus('logout-error');
        return;
      }
      const refreshed = await refreshSession();
      if (operation !== generation.current) return;
      if (!refreshed) {
        setStatus('unauthenticated');
        return;
      }
      const current = await queryClient.fetchQuery({
        queryKey: meKey,
        queryFn: getMe,
        retry: false,
      });
      if (operation !== generation.current) return;
      setUser(current);
      setNotice(null);
      setStatus('authenticated');
    } catch {
      if (operation !== generation.current) return;
      setStatus('bootstrap-error');
    }
  }, [queryClient]);

  useEffect(() => {
    registerRefreshHandler(async () => {
      const refreshed = await refreshSession();
      if (!refreshed) {
        await clearAuthentication();
        queryClient.removeQueries({ queryKey: meKey });
        setUser(null);
        setNotice('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        setStatus('unauthenticated');
      }
      return refreshed;
    });
    const bootstrapTask = setTimeout(() => void bootstrap(), 0);
    return () => {
      clearTimeout(bootstrapTask);
      registerRefreshHandler(null);
    };
  }, [bootstrap, queryClient]);

  const login = useCallback(
    async (values: LoginValues) => {
      const operation = ++generation.current;
      setNotice(null);
      const current = await loginRequest(values);
      if (operation !== generation.current) return;
      queryClient.setQueryData(meKey, current);
      setUser(current);
      setNotice(null);
      setStatus('authenticated');
    },
    [queryClient],
  );

  const register = useCallback(
    async (values: RegisterValues) => {
      const operation = ++generation.current;
      const current = await registerRequest(values);
      if (operation !== generation.current) return;
      queryClient.setQueryData(meKey, current);
      setUser(current);
      setNotice(null);
      setStatus('authenticated');
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    const operation = ++generation.current;
    setUser(null);
    setStatus('logging-out');
    try {
      await markLogoutPending();
      await logoutRequest();
      if (operation !== generation.current) return;
      queryClient.removeQueries({ queryKey: meKey });
      setNotice('Đã đăng xuất.');
      setStatus('unauthenticated');
    } catch {
      if (operation !== generation.current) return;
      setStatus('logout-error');
    }
  }, [queryClient]);

  const retryLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      notice,
      login,
      register,
      logout,
      retryBootstrap: bootstrap,
      retryLogout,
    }),
    [bootstrap, login, logout, notice, register, retryLogout, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
