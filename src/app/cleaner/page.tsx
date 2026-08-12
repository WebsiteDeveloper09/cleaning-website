'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp, MOCK_USERS } from '@/context/AppContext';
import { CleanerDashboard } from '@/components/CleanerDashboard';

export default function CleanerPage() {
  const { setCurrentUser } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [staffId, setStaffId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Passcode validation for demo (Cleaner PIN: Ibukun09)
    if (staffId === 'Ibukun09') {
      const cleanerUser = MOCK_USERS.find((u) => u.role === 'cleaner');
      if (cleanerUser) setCurrentUser(cleanerUser);
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Invalid Staff Security Code. Access Denied.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 flex flex-col font-sans">
      
      {/* Cleaner Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 py-3 px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
            🧹
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white">SparkleMaids Staff Portal</h1>
            <p className="text-[10px] text-cyan-400 font-mono">CLEANER SHIFT MANAGEMENT • AUTHORIZED STAFF</p>
          </div>
        </div>

        <Link
          href="/"
          className="text-xs font-semibold text-gray-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
        >
          ← Exit to Public Site
        </Link>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {!isAuthenticated ? (
          /* STAFF SECURITY LOCK SCREEN */
          <div className="max-w-md mx-auto my-16 bg-slate-900 border border-cyan-500/30 rounded-3xl p-8 shadow-2xl space-y-6 text-center animate-fade-in">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center text-3xl shadow-lg">
              🔑
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">Staff Login</h2>
              <p className="text-xs text-gray-400 mt-1">
                Enter your staff passkey to view your assigned cleaning jobs, route details, and schedule availability.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Staff Passkey / ID
                </label>
                <input
                  type="password"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  placeholder="Enter Staff Security Passkey"
                  required
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>

              {errorMsg && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300 font-semibold">
                  ⚠️ {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 text-sm transition-all shadow-lg shadow-cyan-600/25"
              >
                Access Staff Shift Dashboard
              </button>
            </form>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-gray-500">
              Customers looking to book cleaning? <Link href="/" className="text-emerald-400 font-bold hover:underline">Click here for Public Site</Link>
            </div>
          </div>
        ) : (
          /* UNLOCKED CLEANER DASHBOARD */
          <CleanerDashboard />
        )}
      </main>

    </div>
  );
}
