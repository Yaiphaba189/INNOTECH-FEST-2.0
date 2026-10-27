'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, UserRole } from '@/types';
import { api, DEMO_USERS, markAuthReady } from '@/lib/api-client';

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, pass: string) => Promise<AuthUser>;
  register: (payload: {
    phone_number: string;
    full_name: string;
    password: string;
    role: UserRole;
    preferred_language?: string;
  }) => Promise<AuthUser>;
  logout: () => void;
  switchDemoRole: (targetRole: UserRole) => Promise<AuthUser>;
  isAuthModalOpen: boolean;
  openAuthModal: (initialTab?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  authModalTab: 'login' | 'signup';
}

export const DEFAULT_DEMO_FARMER: AuthUser = {
  id: 'usr-farmer-tombi-001',
  phone_number: '+919862000001',
  full_name: 'Tombi Singh',
  role: 'farmer',
  preferred_language: 'en',
};

export const DEFAULT_DEMO_TOKEN = 'mock-jwt-farmer-tombi-001';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // Starts true so guarded pages wait for the stored session to be restored before deciding to redirect.
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');

  // Initialize the session. A stored real JWT is reused; otherwise (first visit, or a leftover
  // simulated 'mock-' token that the API rejects with 401) sign in the demo account against the
  // backend so the UI shows live data. If the backend is down, api.auth.login falls back to a
  // simulated session and the app keeps working offline.
  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      try {
        const storedUserRaw = localStorage.getItem('harvestlink_user_active');
        const storedToken = localStorage.getItem('harvestlink_token_active');
        const storedUser: AuthUser | null = storedUserRaw ? JSON.parse(storedUserRaw) : null;

        // Simulated tokens ('mock-', 'demo-token-') are never accepted by the API; real ones are
        // checked with the backend so an expired or foreign token is replaced instead of causing 401s.
        const simulated = !!storedToken && (storedToken.startsWith('mock-') || storedToken.startsWith('demo-token-'));
        const tokenState = storedToken && !simulated ? await api.auth.checkToken(storedToken) : 'invalid';

        if (storedUser && storedToken && tokenState !== 'invalid') {
          if (!cancelled) {
            setUser(storedUser);
            setToken(storedToken);
          }
          return;
        }

        // Signed out (or never signed in): stay logged out; the user signs in or uses quick demo login.
        if (!storedUser) return;

        const demo = storedUser ? Object.values(DEMO_USERS).find((u) => u.phone === storedUser.phone_number) : null;
        const phone = demo?.phone ?? DEFAULT_DEMO_FARMER.phone_number;
        const pass = demo?.pass ?? 'innotech2026';
        const res = await api.auth.login(phone, pass);
        if (!cancelled) {
          setUser(res.user);
          setToken(res.access_token);
        }
      } catch (err) {
        console.warn('Error hydrating auth state:', err);
      } finally {
        markAuthReady();
        if (!cancelled) setIsLoading(false);
      }
    };
    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (phone: string, pass: string): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const authRes = await api.auth.login(phone, pass);
      setUser(authRes.user);
      setToken(authRes.access_token);
      setIsAuthModalOpen(false);
      return authRes.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: {
    phone_number: string;
    full_name: string;
    password: string;
    role: UserRole;
    preferred_language?: string;
  }): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const authRes = await api.auth.register(payload);
      setUser(authRes.user);
      setToken(authRes.access_token);
      setIsAuthModalOpen(false);
      return authRes.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('harvestlink_user_active');
      localStorage.removeItem('harvestlink_token_active');
    }
  };

  const switchDemoRole = async (targetRole: UserRole): Promise<AuthUser> => {
    const demo = DEMO_USERS[targetRole] || DEMO_USERS.farmer;
    return await login(demo.phone, demo.pass);
  };

  const openAuthModal = (initialTab: 'login' | 'signup' = 'login') => {
    setAuthModalTab(initialTab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const role: UserRole = user?.role || 'farmer';
  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        switchDemoRole,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalTab,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
