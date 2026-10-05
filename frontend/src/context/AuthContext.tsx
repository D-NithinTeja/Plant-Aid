import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { User, TokenResponse, TwoFactorChallengeResponse } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<TwoFactorChallengeResponse>;
  verify2FA: (sessionId: string, otpCode: string) => Promise<TokenResponse>;
  resendOTP: (sessionId: string) => Promise<TwoFactorChallengeResponse>;
  register: (name: string, email: string, password: string, phone?: string | null) => Promise<User>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('plant_aid_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('plant_aid_token'));
  const [loading, setLoading] = useState<boolean>(true);

  // Hydrate user profile on initial mount if token exists
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await api.get<User>('/api/auth/me');
          setUser(res.data);
          localStorage.setItem('plant_aid_user', JSON.stringify(res.data));
        } catch {
          setToken(null);
          setUser(null);
          localStorage.removeItem('plant_aid_token');
          localStorage.removeItem('plant_aid_user');
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  // Initiate login: returns 2FA challenge response containing session_id
  const login = async (identifier: string, password: string): Promise<TwoFactorChallengeResponse> => {
    const payload = identifier.includes('@')
      ? { email_address: identifier, password }
      : { phone_number: identifier, password };

    const res = await api.post<TwoFactorChallengeResponse>('/api/auth/login', payload);
    return res.data;
  };

  // Resend 2FA verification OTP
  const resendOTP = async (sessionId: string): Promise<TwoFactorChallengeResponse> => {
    const res = await api.post<TwoFactorChallengeResponse>('/api/auth/resend-otp', {
      session_id: sessionId,
    });
    return res.data;
  };

  // Complete 2FA challenge with OTP code
  const verify2FA = async (sessionId: string, otpCode: string): Promise<TokenResponse> => {
    const res = await api.post<TokenResponse>('/api/auth/verify-2fa', {
      session_id: sessionId,
      otp_code: otpCode.trim(),
    });

    const { access_token, user_id, user_name, email_address } = res.data;
    const userData: User = { id: user_id, user_name, email_address };

    setToken(access_token);
    setUser(userData);
    localStorage.setItem('plant_aid_token', access_token);
    localStorage.setItem('plant_aid_user', JSON.stringify(userData));

    return res.data;
  };

  // Register new account
  const register = async (name: string, email: string, password: string, phone?: string | null): Promise<User> => {
    const payload = {
      user_name: name,
      email_address: email,
      password: password,
      phone_number: phone || null,
    };
    const res = await api.post<User>('/api/auth/register', payload);
    return res.data;
  };

  // Logout
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('plant_aid_token');
    localStorage.removeItem('plant_aid_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        verify2FA,
        resendOTP,
        register,
        logout,
        setUser,
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
