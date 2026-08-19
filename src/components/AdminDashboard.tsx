'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PAYMENT_ACCOUNT_DETAILS, BookingStatus } from '@/lib/types';

export const AdminDashboard: React.FC = () => {
  const {
    bookings,
    cleaners,
    conflicts,
    registeredCustomers,
    assignCleanerToBooking,
    updatePaymentStatus,
    updateBookingStatus,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'clients' | 'cleaners' | 'finance'>('overview');
  const [selectedBookingForReassign, setSelectedBookingForReassign] = useState<string | null>(null);
  const [targetCleanerId, setTargetCleanerId] = useState<string>('');
  const [reassignError, setReassignError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedAccount, setCopiedAccount] = useState<boolean>(false);
  const [selectedProofNote, setSelectedProofNote] = useState<{ id: string; note?: string; time?: string } | null>(null);

  // Financial calculations
  const totalVerifiedRevenue = bookings
    .filter((b) => b.paymentStatus === 'verified' || b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const pendingPaymentSum = bookings
    .filter((b) => b.paymentStatus === 'pending' && b.status !== 'cancelled')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const activeJobsCount = bookings.filter(
    (b) => b.status === 'assigned' || b.status === 'en_route' || b.status === 'in_progress'
  ).length;

  const completedJobsCount = bookings.filter((b) => b.status === 'completed').length;
  const pendingAssignCount = bookings.filter((b) => b.status === 'pending').length;

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesFilter = statusFilter === 'all' || b.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.paymentReference && b.paymentReference.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForReassign || !targetCleanerId) return;

    const result = assignCleanerToBooking(selectedBookingForReassign, targetCleanerId);
    if (!result.success) {
      setReassignError(result.conflictReason || 'Failed to assign cleaner.');
    } else {
      setSelectedBookingForReassign(null);
      setTargetCleanerId('');
      setReassignError(null);
    }
  };

  // Activity Feed Generator
  const activities = [
    ...bookings.map((b) => ({
      id: `act-book-${b.id}`,
      type: 'booking',
      title: `New Cleaning Scheduled: #${b.id}`,
      desc: `${b.customerName} booked ${b.serviceName} (${b.bedrooms} Bed, ${b.bathrooms} Bath) for ${b.date}`,
      time: b.createdAt ? new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
      badge: b.status,
      icon: '🧹',
    })),
    ...bookings
      .filter((b) => b.paymentReference)
      .map((b) => ({
        id: `act-pay-${b.id}`,
        type: 'payment',
        title: `Payment Reference Submitted: #${b.id}`,
        desc: `${b.customerName} sent OPay Ref: "${b.paymentReference}" for ₦${b.totalAmount.toLocaleString()}`,
        time: 'Pending Verification',
        badge: b.paymentStatus,
        icon: '💳',
      })),
    ...registeredCustomers.map((c) => ({
      id: `act-cust-${c.id}`,
      type: 'client',
      title: `Client Account Created`,
      desc: `${c.name} (${c.email}) registered a private account`,
      time: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Active',
      badge: 'Client',
      icon: '👤',
    })),
  ].slice(0, 12);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Operations Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-3xl glass-panel p-6 border border-purple-500/30 bg-gradient-to-r from-slate-900 via-slate-950 to-purple-950/30 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/25 border border-purple-400/30">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">SparkleMaids Admin Control Center</h1>
              <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                LIVE OPERATIONS
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Live business oversight: monitor client activities, verify OPAY transfers, and manage cleaner staff.
            </p>
          </div>
        </div>

        {/* Quick Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
          {[
            { id: 'overview', label: '📊 Overview & Live Feed', count: undefined },
            { id: 'bookings', label: '📋 Bookings & Ledger', count: bookings.length },
            { id: 'clients', label: '👥 Clients Directory', count: registeredCustomers.length },
            { id: 'cleaners', label: '🧹 Cleaners Team', count: cleaners.length },
            { id: 'finance', label: '💳 OPAY Settlement', count: undefined },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-gray-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Official Settlement Account Callout */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 p-4 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 text-sm">
            🏦
          </span>
          <div className="text-xs">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Company Receiving Account</span>
            <strong className="text-white font-extrabold">{PAYMENT_ACCOUNT_DETAILS.bankName}</strong> &bull;{' '}
            <span className="font-mono text-purple-300 font-bold">{PAYMENT_ACCOUNT_DETAILS.accountNumber}</span> &bull;{' '}
            <span className="text-gray-300">{PAYMENT_ACCOUNT_DETAILS.accountName}</span>
          </div>
        </div>

        <button
          onClick={() => {
            navigator.clipboard.writeText(PAYMENT_ACCOUNT_DETAILS.accountNumber);
            setCopiedAccount(true);
            setTimeout(() => setCopiedAccount(false), 2000);
          }}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            copiedAccount ? 'bg-purple-500 text-white' : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/40'
          }`}
        >
          {copiedAccount ? '✓ Copied' : '📋 Copy Account'}
        </button>
      </div>

      {/* Interactive Key Metrics Grid (Clickable Filters) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Verified Revenue Card */}
        <button
          type="button"
          onClick={() => setActiveTab('finance')}
          className="text-left group glass-card rounded-2xl p-5 border border-emerald-500/30 bg-slate-900/70 hover:bg-slate-900 hover:border-emerald-400/60 hover:shadow-xl hover:shadow-emerald-500/10 transition-all cursor-pointer transform hover:-translate-y-1"
        >
          <div className="flex justify-between items-center text-xs uppercase font-bold text-gray-400">
            <span>Verified Revenue</span>
            <span className="text-emerald-400 text-base group-hover:scale-125 transition-transform">💰</span>
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-2">₦{totalVerifiedRevenue.toLocaleString()}</div>
          <p className="text-[11px] text-gray-400 mt-1">Cleared in OPAY account</p>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-400 group-hover:underline">
            <span>View finance details</span>
            <span>→</span>
          </div>
        </button>

        {/* 2. Awaiting Payment Card */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('bookings');
            setStatusFilter('all');
            setSearchQuery('pending');
          }}
          className="text-left group glass-card rounded-2xl p-5 border border-amber-500/30 bg-slate-900/70 hover:bg-slate-900 hover:border-amber-400/60 hover:shadow-xl hover:shadow-amber-500/10 transition-all cursor-pointer transform hover:-translate-y-1"
        >
          <div className="flex justify-between items-center text-xs uppercase font-bold text-gray-400">
            <span>Awaiting Payment</span>
            <span className="text-amber-400 text-base group-hover:scale-125 transition-transform">⏳</span>
          </div>
          <div className="text-3xl font-black text-amber-400 mt-2">₦{pendingPaymentSum.toLocaleString()}</div>
          <p className="text-[11px] text-gray-400 mt-1">{bookings.filter((b) => b.paymentStatus === 'pending').length} transfers to verify</p>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-amber-400 group-hover:underline">
            <span>Verify transfers now</span>
            <span>→</span>
          </div>
        </button>

        {/* 3. Active Jobs in Field Card */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('bookings');
            setStatusFilter('all');
            setSearchQuery('');
          }}
          className="text-left group glass-card rounded-2xl p-5 border border-blue-500/30 bg-slate-900/70 hover:bg-slate-900 hover:border-blue-400/60 hover:shadow-xl hover:shadow-blue-500/10 transition-all cursor-pointer transform hover:-translate-y-1"
        >
          <div className="flex justify-between items-center text-xs uppercase font-bold text-gray-400">
            <span>Active Jobs in Field</span>
            <span className="text-blue-400 text-base group-hover:scale-125 transition-transform">🧹</span>
          </div>
          <div className="text-3xl font-black text-blue-400 mt-2">{activeJobsCount}</div>
          <p className="text-[11px] text-gray-400 mt-1">{pendingAssignCount} needing cleaner assignment</p>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-blue-400 group-hover:underline">
            <span>Manage bookings ledger</span>
            <span>→</span>
          </div>
        </button>

        {/* 4. Total Registered Clients Card */}
        <button
          type="button"
          onClick={() => setActiveTab('clients')}
          className="text-left group glass-card rounded-2xl p-5 border border-purple-500/30 bg-slate-900/70 hover:bg-slate-900 hover:border-purple-400/60 hover:shadow-xl hover:shadow-purple-500/10 transition-all cursor-pointer transform hover:-translate-y-1"
        >
          <div className="flex justify-between items-center text-xs uppercase font-bold text-gray-400">
            <span>Registered Clients</span>
            <span className="text-purple-400 text-base group-hover:scale-125 transition-transform">👥</span>
          </div>
          <div className="text-3xl font-black text-purple-300 mt-2">{registeredCustomers.length}</div>
          <p className="text-[11px] text-gray-400 mt-1">{completedJobsCount} cleanings fulfilled</p>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-purple-400 group-hover:underline">
            <span>Open client directory</span>
            <span>→</span>
          </div>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. OVERVIEW & LIVE ACTIVITY FEED TAB */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">


          {/* Live Activity Feed Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl glass-panel border border-slate-800 p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Real-Time Activity Feed
                </h3>
                <span className="text-xs text-gray-500">Updated just now</span>
              </div>

              <div className="space-y-3">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-base">
                      {act.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{act.title}</span>
                        <span className="text-[10px] text-gray-500 shrink-0 font-mono">{act.time}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{act.desc}</p>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-800 text-gray-300 border border-slate-700">
                      {act.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions & Staff Health */}
            <div className="space-y-4">
              {/* Conflict Alerts */}
              {conflicts.length > 0 ? (
                <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <span>⚠️</span>
                    <span>Schedule Conflicts Detected ({conflicts.length})</span>
                  </div>
                  {conflicts.map((c) => (
                    <div key={c.id} className="text-xs text-rose-300 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                      {c.reason}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5 flex items-center gap-3">
                  <span className="text-xl">✅</span>
                  <div>
                    <div className="text-xs font-bold text-emerald-300">Clean Dispatch Schedule</div>
                    <div className="text-[11px] text-gray-400">No double bookings or scheduling conflicts.</div>
                  </div>
                </div>
              )}

              {/* Cleaners on Duty */}
              <div className="rounded-2xl glass-panel border border-slate-800 p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Cleaners on Duty</h4>
                <div className="space-y-2">
                  {cleaners.map((cl) => (
                    <div key={cl.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <img src={cl.avatar} alt={cl.name} className="h-8 w-8 rounded-full object-cover border border-purple-500/40" />
                        <div>
                          <div className="text-xs font-bold text-white">{cl.name}</div>
                          <div className="text-[10px] text-gray-400">★ {cl.rating} &bull; {cl.phone}</div>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Available
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. BOOKINGS & PAYMENT VERIFICATION LEDGER TAB */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'bookings' && (
        <div className="rounded-2xl glass-panel border border-slate-800 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">System Bookings Ledger</h2>
              <p className="text-xs text-gray-400 mt-0.5">Manage customer requests, verify OPAY bank transfers, and dispatch cleaners.</p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {['all', 'pending', 'assigned', 'in_progress', 'completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                    statusFilter === st
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client name, booking ID, service, or OPay reference..."
              className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-slate-900 text-gray-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Date & Slot</th>
                  <th className="py-3 px-4">Assigned Cleaner</th>
                  <th className="py-3 px-4">Job Status</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment (OPAY)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-500">
                      No bookings found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => {
                    const isPaid = b.paymentStatus === 'verified' || b.paymentStatus === 'paid';
                    return (
                      <tr key={b.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-purple-400">{b.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{b.customerName}</div>
                          <div className="text-[11px] text-gray-500 truncate max-w-[150px]">{b.address}</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-gray-200">{b.serviceName}</td>
                        <td className="py-3.5 px-4">
                          <div>{b.date}</div>
                          <div className="text-[10px] text-gray-500">{b.timeSlot}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          {b.cleanerName ? (
                            <span className="text-purple-300 font-medium">{b.cleanerName}</span>
                          ) : (
                            <span className="text-amber-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            b.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : b.status === 'in_progress'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : b.status === 'assigned'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-400">₦{b.totalAmount?.toLocaleString()}</td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isPaid
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {isPaid ? '✓ Verified' : '⏳ Pending'}
                            </span>
                            {b.paymentReference && (
                              <div className="text-[10px] font-mono text-purple-300 max-w-[120px] truncate" title={b.paymentReference}>
                                Ref: {b.paymentReference}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          {!isPaid && (
                            <button
                              onClick={() => updatePaymentStatus(b.id, 'verified')}
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-all"
                            >
                              ✓ Mark Paid
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedBookingForReassign(b.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-800 text-gray-300 hover:text-white border border-slate-700 transition-all"
                          >
                            Assign / Change
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. REGISTERED CLIENTS DIRECTORY TAB */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'clients' && (
        <div className="rounded-2xl glass-panel border border-slate-800 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Registered Clients Directory</h2>
              <p className="text-xs text-gray-400 mt-0.5">Private client accounts created on SparkleMaids.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
              {registeredCustomers.length} Total Registered
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {registeredCustomers.map((cust) => {
              const clientBookings = bookings.filter((b) => b.customerId === cust.id);
              const clientSpent = clientBookings
                .filter((b) => b.paymentStatus === 'verified' || b.paymentStatus === 'paid')
                .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

              return (
                <div key={cust.id} className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4 hover:border-purple-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <img
                      src={cust.avatar}
                      alt={cust.name}
                      className="h-12 w-12 rounded-full object-cover border-2 border-purple-500/40"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{cust.name}</h4>
                      <p className="text-xs text-gray-400 truncate">{cust.email}</p>
                      <p className="text-[11px] text-purple-300 font-mono mt-0.5">{cust.phone || 'No phone'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-xs">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-gray-500 block text-[10px] uppercase font-bold">Cleanings</span>
                      <strong className="text-white font-extrabold text-sm">{clientBookings.length}</strong>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-gray-500 block text-[10px] uppercase font-bold">Total Spent</span>
                      <strong className="text-emerald-400 font-extrabold text-sm">₦{clientSpent.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. CLEANERS & ROSTER TAB */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'cleaners' && (
        <div className="rounded-2xl glass-panel border border-slate-800 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Cleaners Team & Schedule</h2>
              <p className="text-xs text-gray-400 mt-0.5">Staff performance ratings and assignment availability.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cleaners.map((cl) => {
              const cleanerJobs = bookings.filter((b) => b.cleanerId === cl.id);
              const activeCount = cleanerJobs.filter((b) => b.status === 'assigned' || b.status === 'in_progress' || b.status === 'en_route').length;
              return (
                <div key={cl.id} className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <img src={cl.avatar} alt={cl.name} className="h-14 w-14 rounded-2xl object-cover border border-purple-500/40" />
                    <div>
                      <h4 className="text-base font-bold text-white">{cl.name}</h4>
                      <div className="text-xs text-yellow-400 font-bold flex items-center gap-1 mt-0.5">
                        <span>★ {cl.rating}</span>
                        <span className="text-gray-400 font-normal">({cl.completedJobsCount || 50}+ jobs done)</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">📞 {cl.phone}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800">
                    <span className="text-gray-400">Current Assigned Jobs:</span>
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {activeCount} active
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. FINANCE & OPAY SETTLEMENT TAB */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'finance' && (
        <div className="rounded-2xl glass-panel border border-slate-800 p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white">OPAY Bank Payment Settlement</h2>
            <p className="text-xs text-gray-400 mt-0.5">Financial breakdown of all client transfer payments.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/30 p-6 space-y-2">
              <span className="text-xs uppercase font-bold text-emerald-400">Total Cleared & Verified</span>
              <div className="text-4xl font-black text-emerald-400">₦{totalVerifiedRevenue.toLocaleString()}</div>
              <p className="text-xs text-gray-400">Verified and deposited to OPAY account: {PAYMENT_ACCOUNT_DETAILS.accountNumber}</p>
            </div>

            <div className="rounded-2xl bg-amber-950/40 border border-amber-500/30 p-6 space-y-2">
              <span className="text-xs uppercase font-bold text-amber-400">Pending Verification</span>
              <div className="text-4xl font-black text-amber-400">₦{pendingPaymentSum.toLocaleString()}</div>
              <p className="text-xs text-gray-400">Clients have submitted references; awaiting your confirmation.</p>
            </div>
          </div>
        </div>
      )}

      {/* Assign Cleaner Modal */}
      {selectedBookingForReassign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-purple-500/40 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Assign Cleaner to Booking</h3>
              <button onClick={() => setSelectedBookingForReassign(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            {reassignError && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300">
                {reassignError}
              </div>
            )}

            <form onSubmit={handleReassignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">Select Cleaner:</label>
                <select
                  value={targetCleanerId}
                  onChange={(e) => setTargetCleanerId(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                  required
                >
                  <option value="">-- Choose an available cleaner --</option>
                  {cleaners.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (★ {c.rating})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForReassign(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:brightness-110 shadow-lg shadow-purple-500/20"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
