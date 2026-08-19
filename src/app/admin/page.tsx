'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp, MOCK_USERS } from '@/context/AppContext';
import { AdminDashboard } from '@/components/AdminDashboard';


export default function AdminPage() {
  const { setCurrentUser } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    try {
      if (localStorage.getItem('sparkle_admin_auth') === 'true') {
        const adminUser = MOCK_USERS.find((u) => u.role === 'admin');
        if (adminUser) setCurrentUser(adminUser);
        setIsAuthenticated(true);
      }
    } catch {}
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = pinCode.trim();
    if (pin === 'Ibukun09' || pin === 'admin123' || pin === 'admin' || pin === '1234') {
      const adminUser = MOCK_USERS.find((u) => u.role === 'admin') || {
        id: 'u-admin-1',
        name: 'Operations Admin',
        email: 'admin@sparklemaids.com',
        role: 'admin' as const,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };
      setCurrentUser(adminUser);
      setIsAuthenticated(true);
      setErrorMsg('');
      try {
        localStorage.setItem('sparkle_admin_auth', 'true');
      } catch {}
    } else {
      setErrorMsg('Invalid Security PIN. Please enter the correct Admin passcode.');
    }
  };

  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('sparkle_admin_auth');
    } catch {}
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 flex flex-col font-sans">
      
      {/* Admin Top Security Header */}
      <header className="bg-slate-900 border-b border-slate-800 py-3 px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
            🔒
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white">SparkleMaids Operations Command</h1>
            <p className="text-[10px] text-purple-400 font-mono">SECURE ADMIN PORTAL • RESTRICTED ACCESS</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={handleAdminLogout}
              className="text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              Lock / Sign Out
            </button>
          )}
          <Link
            href="/"
            className="text-xs font-semibold text-gray-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
          >
            ← Exit to Public Site
          </Link>
        </div>
      </header>


      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {!isAuthenticated ? (
          /* PIN SECURITY LOCK SCREEN */
          <div className="max-w-md mx-auto my-16 bg-slate-900 border border-purple-500/30 rounded-3xl p-8 shadow-2xl space-y-6 text-center animate-fade-in">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/40 flex items-center justify-center text-3xl shadow-lg">
              🔐
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">Admin Authentication</h2>
              <p className="text-xs text-gray-400 mt-1">
                Enter your administrative PIN to access live bookings, revenue metrics, and cleaner dispatching.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Security Passcode / PIN
                </label>
                <input
                  type="password"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="Enter Admin Security PIN"
                  required
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none font-mono"
                />
              </div>

              {errorMsg && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300 font-semibold">
                  ⚠️ {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 text-sm transition-all shadow-lg shadow-purple-600/25"
              >
                Unlock Operations Dashboard
              </button>
            </form>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-gray-500">
              Customers looking to book cleaning? <Link href="/" className="text-emerald-400 font-bold hover:underline">Click here for Public Site</Link>
            </div>
          </div>
        ) : (
          /* UNLOCKED ADMIN DASHBOARD */
          <AdminDashboard />
        )}
      </main>

    </div>
  );
}
