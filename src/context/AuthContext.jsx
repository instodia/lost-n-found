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

  const login = async (identifier, password) => {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanId || !cleanPass) {
      return { success: false, message: 'Please enter both your email/username and password.' };
    }

    // 1. First attempt Cloud Login via MongoDB Atlas
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId, password: cleanPass }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const userObj = { ...data.user, id: data.user._id || data.user.id };
          setCurrentUser(userObj);
          return { success: true, user: userObj };
        }
      }
    } catch (apiErr) {
      console.warn('Cloud login fetch error, trying local:', apiErr);
    }

    // 2. Fallback to local registered users or system accounts (offline/fallback)
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

  const signup = async ({ name, email, phone, password }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanName || !cleanEmail || !cleanPass) {
      return { success: false, message: 'Please fill in all required fields (Name, Email, Password).' };
    }

    // 1. Attempt Cloud Signup via MongoDB Atlas
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, email: cleanEmail, phone, password: cleanPass }),
      });
      if (res.ok) {
        const savedUser = await res.json();
        const userObj = { ...savedUser, id: savedUser._id || savedUser.id };
        setRegisteredUsers((prev) => [userObj, ...prev.filter((u) => u.email !== cleanEmail)]);
        setCurrentUser(userObj);
        return { success: true, user: userObj };
      } else {
        const errJson = await res.json().catch(() => ({}));
        if (errJson.error && errJson.error.includes('already exists')) {
          return { success: false, message: errJson.error };
        }
      }
    } catch (apiErr) {
      console.warn('Cloud signup fetch error, saving locally:', apiErr);
    }

    // 2. Fallback to localStorage
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
