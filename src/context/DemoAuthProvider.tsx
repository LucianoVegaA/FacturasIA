
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback }
from 'react';
import { useRouter } from 'next/navigation';

interface DemoUser {
  name: string;
}

interface DemoAuthContextType {
  isDemoAuthenticated: boolean;
  demoUser: DemoUser | null;
  loginDemo: () => void;
  logoutDemo: () => void;
  loading: boolean;
}

const DemoAuthContext = createContext<DemoAuthContextType | undefined>(undefined);

const DEMO_AUTH_STORAGE_KEY = 'demoUserAuthenticated';
const DEMO_USER_STORAGE_KEY = 'demoUserDetails';

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [isDemoAuthenticated, setIsDemoAuthenticated] = useState<boolean>(false);
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(DEMO_AUTH_STORAGE_KEY);
      const storedUser = localStorage.getItem(DEMO_USER_STORAGE_KEY);
      if (storedAuth === 'true') {
        setIsDemoAuthenticated(true);
        if (storedUser) {
          setDemoUser(JSON.parse(storedUser));
        } else {
          // Default demo user if not found in storage (e.g., from older version)
          setDemoUser({ name: 'Demo User' });
        }
      }
    } catch (error) {
      console.error("Error reading demo auth state from localStorage", error);
    }
    setLoading(false);
  }, []);

  const loginDemo = useCallback(() => {
    const user: DemoUser = { name: 'Demo User' };
    setIsDemoAuthenticated(true);
    setDemoUser(user);
    try {
      localStorage.setItem(DEMO_AUTH_STORAGE_KEY, 'true');
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Error writing demo auth state to localStorage", error);
    }
    router.push('/dashboard');
  }, [router]);

  const logoutDemo = useCallback(() => {
    setIsDemoAuthenticated(false);
    setDemoUser(null);
    try {
      localStorage.removeItem(DEMO_AUTH_STORAGE_KEY);
      localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    } catch (error) {
      console.error("Error removing demo auth state from localStorage", error);
    }
    router.push('/');
  }, [router]);

  return (
    <DemoAuthContext.Provider value={{ isDemoAuthenticated, demoUser, loginDemo, logoutDemo, loading }}>
      {children}
    </DemoAuthContext.Provider>
  );
}

export function useDemoAuth() {
  const context = useContext(DemoAuthContext);
  if (context === undefined) {
    throw new Error('useDemoAuth must be used within a DemoAuthProvider');
  }
  return context;
}
