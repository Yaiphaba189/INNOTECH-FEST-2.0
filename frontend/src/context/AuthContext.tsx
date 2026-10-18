'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, UserRole } from '@/types';
import { api, DEMO_USERS } from '@/lib/api-client';

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');

  // Initialize active user from localStorage or fallback to default farmer demo
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('harvestlink_user_active');
        const storedToken = localStorage.getItem('harvestlink_token_active');

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          setIsLoading(false);
          return;
        }

        // Unauthenticated by default until user signs in or creates an account
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.warn('Error hydrating auth state:', err);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
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
