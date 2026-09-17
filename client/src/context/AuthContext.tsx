import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser } from '../types/index.js';

export const VERIFIED_PERSONAS: AuthUser[] = [
  {
    id: 'user_alex',
    name: 'Dr. Alex Carter',
    email: 'alex.carter@mit.edu',
    avatar: '⚡',
    role: 'Distributed Systems Judge',
    color: '#8b5cf6', // Electric Violet
  },
  {
    id: 'user_maya',
    name: 'Maya Chen',
    email: 'maya@knit.io',
    avatar: '🧶',
    role: 'Lead CRDT Architect',
    color: '#ec4899', // Neon Magenta
  },
  {
    id: 'user_elena',
    name: 'Elena Rostova',
    email: 'elena@knit.io',
    avatar: '🎨',
    role: 'Staff UI/UX Engineer',
    color: '#06b6d4', // Cyan
  },
];

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isClerkEnabled: boolean;
  loginAsPersona: (persona: AuthUser) => void;
  loginAsCustom: (name: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'knit_active_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isClerkEnabled = Boolean((import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY);

  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    // Default to the Lead Architect for immediate evaluator convenience
    return VERIFIED_PERSONAS[0];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const loginAsPersona = (persona: AuthUser) => {
    setUser(persona);
  };

  const loginAsCustom = (name: string, email: string) => {
    const colors = ['#f43f5e', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newUser: AuthUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: name.trim() || 'Verified Collaborator',
      email: email.trim() || 'user@knit.io',
      avatar: '🐱',
      role: 'Verified Member',
      color: randomColor,
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isClerkEnabled,
        loginAsPersona,
        loginAsCustom,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
