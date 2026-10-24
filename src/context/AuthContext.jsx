import React, { createContext, useContext, useState, useEffect } from 'react';
import { SYSTEM_ACCOUNTS } from '../types';

const AuthContext = createContext();

const AUTH_STORAGE_KEY = 'findit_current_user_v2';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    // Start with null so user logs in, or restore previous session
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  const login = (identifier, password) => {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // Check against official system accounts
    const matched = SYSTEM_ACCOUNTS.find(
      (acc) =>
        (acc.username.toLowerCase() === cleanId || acc.email.toLowerCase() === cleanId) &&
        acc.password === cleanPass
    );

    if (matched) {
      setCurrentUser(matched);
      return { success: true, user: matched };
    }

    return {
      success: false,
      message: 'Invalid login credentials. Please use an authorized ID and password (e.g. ID: admin1, Pass: admin1).',
    };
  };

  const signup = ({ name, email, phone }) => {
    const newUser = {
      id: `user-${Date.now()}`,
      username: email.split('@')[0],
      name,
      email,
      phone: phone || '',
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      joinedDate: new Date().toISOString().split('T')[0],
      verified: true,
    };
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        login,
        signup,
        logout,
        isAdmin,
        systemAccounts: SYSTEM_ACCOUNTS,
        demoUsers: SYSTEM_ACCOUNTS,
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
