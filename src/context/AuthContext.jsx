import React, { createContext, useContext, useState, useEffect } from 'react';
import { SYSTEM_ACCOUNTS } from '../types';

const AuthContext = createContext();

const AUTH_STORAGE_KEY = 'findit_current_user_v2';
const REGISTERED_USERS_KEY = 'findit_registered_users_v2';

export const AuthProvider = ({ children }) => {
  // Registered users persistent list (initialized with official system accounts)
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem(REGISTERED_USERS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return SYSTEM_ACCOUNTS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
  }, [registeredUsers]);

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

    if (!cleanId || !cleanPass) {
      return { success: false, message: 'Please enter both your email/username and password.' };
    }

    const matched = registeredUsers.find(
      (acc) =>
        (acc.username?.toLowerCase() === cleanId || acc.email?.toLowerCase() === cleanId) &&
        acc.password === cleanPass
    );

    if (matched) {
      setCurrentUser(matched);
      return { success: true, user: matched };
    }

    return {
      success: false,
      message: 'Invalid email or password. Please check your credentials or create a new account.',
    };
  };

  const signup = ({ name, email, phone, password }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanName || !cleanEmail || !cleanPass) {
      return { success: false, message: 'Please fill in all required fields (Name, Email, Password).' };
    }

    const existing = registeredUsers.find(
      (u) => u.email?.toLowerCase() === cleanEmail || u.username?.toLowerCase() === cleanEmail.split('@')[0]
    );

    if (existing) {
      return { success: false, message: 'An account with this email already exists. Please log in.' };
    }

    const newUser = {
      id: `user-${Date.now()}`,
      username: cleanEmail.split('@')[0],
      password: cleanPass,
      name: cleanName,
      email: cleanEmail,
      phone: (phone || '').trim(),
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanName)}`,
      joinedDate: new Date().toISOString().split('T')[0],
      verified: true,
    };

    setRegisteredUsers((prev) => [newUser, ...prev]);
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
