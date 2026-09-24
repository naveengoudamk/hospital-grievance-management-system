import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';
import { ApiResponse, AuthResponse, Role, User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCommitteeMember: boolean;
  login: (username: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('hospital_auth_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('hospital_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('hospital_auth_token');
      if (storedToken) {
        try {
          const res = await apiClient.get<ApiResponse<User>>('/api/auth/me');
          setUser(res.data.data);
          localStorage.setItem('hospital_auth_user', JSON.stringify(res.data.data));
        } catch (err) {
          console.warn('Session verification failed, logging out');
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/api/auth/login', {
      username,
      password,
    });
    const authData = res.data.data;
    setToken(authData.token);
    localStorage.setItem('hospital_auth_token', authData.token);

    const userObj: User = {
      id: authData.id,
      username: authData.username,
      fullName: authData.fullName,
      email: authData.email,
      role: authData.role,
      active: true,
      createdAt: '',
      updatedAt: '',
    };
    setUser(userObj);
    localStorage.setItem('hospital_auth_user', JSON.stringify(userObj));
    return authData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('hospital_auth_token');
    localStorage.removeItem('hospital_auth_user');
  };

  const role = user?.role || null;
  const isAuthenticated = !!token && !!user;
  const isAdmin = role === 'ROLE_ADMIN';
  const isCommitteeMember = role === 'ROLE_COMMITTEE_MEMBER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated,
        isAdmin,
        isCommitteeMember,
        login,
        logout,
        loading,
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
