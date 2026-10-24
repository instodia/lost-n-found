import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SYSTEM_ACCOUNTS } from '../../types';
import { X, ShieldCheck, KeyRound, LogIn, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, signup } = useAuth();
  const { addToast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isSignUp) {
      if (!name || !identifier) {
        setErrorMsg('Please provide your name and email address.');
        return;
      }
      signup({ name, email: identifier, phone });
      addToast({ title: 'Account Registered', message: `Welcome to FindIt, ${name}!`, type: 'success' });
      onClose();
    } else {
      if (!identifier || !password) {
        setErrorMsg('Please enter both User ID/Email and Password.');
        return;
      }
      const res = login(identifier, password);
      if (res.success) {
        addToast({
          title: 'Logged In Successfully',
          message: `Welcome back, ${res.user.name} (${res.user.role.toUpperCase()})`,
          type: 'success',
        });
        onClose();
      } else {
        setErrorMsg(res.message || 'Invalid credentials');
      }
    }
  };

  const handleFillCredentials = (account) => {
    setIdentifier(account.username);
    setPassword(account.password);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg p-6 sm:p-8 bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 mb-3 border border-brand-200">
            {isSignUp ? <UserPlus className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {isSignUp ? 'Create your FindIt account' : 'FindIt Portal Authentication'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isSignUp
              ? 'Join our community to safely report items and claim belongings.'
              : 'Sign in to access your reports, manage ownership claims, or enter admin portal.'}
          </p>
        </div>

        {/* 5 Authorized System Login Credentials Helper */}
        {!isSignUp && (
          <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <KeyRound className="w-4 h-4 text-brand-600" /> Authorized System Accounts (5)
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Click to fill</span>
            </div>

            <div className="space-y-1.5">
              {SYSTEM_ACCOUNTS.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs hover:border-brand-400 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        acc.role === 'admin'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-indigo-50 text-brand-700 border border-brand-200'
                      }`}
                    >
                      {acc.role.toUpperCase()}
                    </span>
                    <span className="font-semibold text-slate-800">
                      ID: <code className="text-brand-600 font-bold">{acc.username}</code>
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">
                      Pass: <code className="text-slate-800 font-bold">{acc.password}</code>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFillCredentials(acc)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-brand-600 hover:text-white bg-brand-50 hover:bg-brand-600 transition-colors"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. David Miller"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isSignUp ? 'Email Address' : 'User ID or Email'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={isSignUp ? 'you@findit.com' : 'e.g. admin1 or user1'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone (Confidential for handover)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-md shadow-brand-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] mt-2"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle sign in / sign up */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
            }}
            className="text-xs text-brand-600 hover:underline font-semibold"
          >
            {isSignUp
              ? 'Already registered? Sign in with existing ID'
              : "Need a new account? Register here"}
          </button>
        </div>
      </div>
    </div>
  );
};
