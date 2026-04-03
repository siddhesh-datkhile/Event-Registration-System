import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getCurrentUser, isLoggedIn, saveTokens, clearTokens } from '../api/auth';

interface UserPayload {
  id: number;
  roles: string[];
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserPayload | null;
  login: (token: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(isLoggedIn());
  const [user, setUser] = useState<UserPayload | null>(getCurrentUser());

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(isLoggedIn());
      setUser(getCurrentUser());
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const login = (token: string, refreshToken: string) => {
    saveTokens(token, refreshToken);
    // Immediately reflect auth change in state for tests
    setIsAuthenticated(true);
    setUser(getCurrentUser());
  };

  const logout = () => {
    clearTokens();
    // Immediately clear auth state for tests
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
