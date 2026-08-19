'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const { customerLogin, customerRegister } = useApp();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500)); // small UX delay
    const result = customerLogin(loginEmail, loginPassword);
    setLoading(false);
    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'Login failed.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (regPassword !== regConfirm) {
      setError('Passwords do not match.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = customerRegister(regName, regEmail, regPassword, regPhone);
    setLoading(false);
    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'Registration failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      {/* Card */}
      <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/30"
        style={{ background: 'linear-gradient(135deg, #0f172a 60%, #052e16 100%)' }}>

        {/* Decorative glow */}
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative p-8">
          {/* Logo + Close */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
                <span className="text-xl">✨</span>
              </div>
              <div>
                <div className="text-base font-black text-white leading-none">SparklePro</div>
                <div className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">Premium Cleaning</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
            >
              ✕
            </button>
          </div>

          {/* Tab Toggle */}
          <div className="flex rounded-xl bg-gray-900/80 border border-gray-800 p-1 mb-6">
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all capitalize ${
                  tab === t
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t === 'login' ? '🔑 Log In' : '🆕 Create Account'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-xl bg-rose-500/15 border border-rose-500/40 px-4 py-3 text-xs font-semibold text-rose-300 flex items-center gap-2">
              <span>⚠️</span><span>{error}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-3 pr-10 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs">
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-black text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <><span className="h-4 w-4 rounded-full border-2 border-slate-950/30 border-t-slate-950 animate-spin" />Signing in...</>
                ) : '🔑 Log In to My Account'}
              </button>

              <p className="text-center text-xs text-gray-500">
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => { setTab('register'); setError(''); }}
                  className="text-emerald-400 font-bold hover:underline">
                  Create one free →
                </button>
              </p>
            </form>
          )}

          {/* REGISTER FORM */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full rounded-xl bg-gray-900 border border-gray-700 px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="08012345678"
                    className="w-full rounded-xl bg-gray-900 border border-gray-700 px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl bg-gray-900 border border-gray-700 px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full rounded-xl bg-gray-900 border border-gray-700 px-3.5 py-2.5 pr-9 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs">
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full rounded-xl bg-gray-900 border border-gray-700 px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-black text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
              >
                {loading ? (
                  <><span className="h-4 w-4 rounded-full border-2 border-slate-950/30 border-t-slate-950 animate-spin" />Creating account...</>
                ) : '🆕 Create My Free Account'}
              </button>

              <p className="text-center text-xs text-gray-500">
                Already have an account?{' '}
                <button type="button" onClick={() => { setTab('login'); setError(''); }}
                  className="text-emerald-400 font-bold hover:underline">
                  Log in →
                </button>
              </p>

              <p className="text-center text-[10px] text-gray-600 leading-relaxed">
                Your account is private. Only you can see your bookings.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
