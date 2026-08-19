'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { BookingStatus, PAYMENT_ACCOUNT_DETAILS } from '@/lib/types';


interface CustomerDashboardProps {
  onOpenBooking: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onOpenBooking }) => {
  const { bookings, currentUser, updateBookingStatus, updatePaymentStatus, cleaners, customerLogout } = useApp();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [paymentModalBookingId, setPaymentModalBookingId] = useState<string | null>(null);
  const [modalRefText, setModalRefText] = useState<string>('');
  const [copiedAccount, setCopiedAccount] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(false);

  const customerBookings = bookings.filter((b) => b.customerId === currentUser.id);

  const activeBookings = customerBookings.filter(
    (b) => b.status !== 'completed' && b.status !== 'cancelled'
  );
  const completedBookings = customerBookings.filter(
    (b) => b.status === 'completed' || b.status === 'cancelled'
  );

  const displayedBookings = (
    filter === 'all'
      ? customerBookings
      : filter === 'active'
      ? activeBookings
      : completedBookings
  ).slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


  const handleSavePaymentReference = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentModalBookingId) {
      updatePaymentStatus(paymentModalBookingId, 'pending', modalRefText.trim());
      setJustSaved(true);
      setTimeout(() => {
        setJustSaved(false);
        setPaymentModalBookingId(null);
        setModalRefText('');
      }, 2200);
    }
  };

  const getPaymentStep = (b: typeof customerBookings[0]) => {
    if (b.paymentStatus === 'verified' || b.paymentStatus === 'paid') return 3;
    if (b.paymentStatus === 'pending' && b.paymentReference) return 2;
    return 1;
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Matching Cleaner</span>;
      case 'assigned':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">Cleaner Assigned</span>;
      case 'en_route':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse">Cleaner En Route</span>;
      case 'in_progress':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">Cleaning In Progress</span>;
      case 'completed':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400">✓ Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">Cancelled</span>;
    }
  };

  const getProgressWidth = (status: BookingStatus) => {
    switch (status) {
      case 'pending': return '15%';
      case 'assigned': return '40%';
      case 'en_route': return '65%';
      case 'in_progress': return '85%';
      case 'completed': return '100%';
      default: return '0%';
    }
  };

  const selectedBookingForModal = bookings.find((b) => b.id === paymentModalBookingId);

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-2xl glass-panel p-6 border border-emerald-500/20">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="h-12 w-12 rounded-full object-cover border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/20"
          />
          <div>
            <h1 className="text-2xl font-black text-white">Welcome back, {currentUser.name}!</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {currentUser.email} &bull; Private account
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenBooking}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Schedule New Cleaning
          </button>
          <button
            onClick={customerLogout}
            className="rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-sm font-semibold text-gray-300 hover:text-white hover:border-gray-600 transition-all flex items-center gap-2"
            title="Log out of your account"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Compact Payment Account Banner */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-900/80 border border-emerald-500/30 px-4 py-3">
        <span className="text-emerald-400 text-sm shrink-0">💳</span>
        <span className="text-xs text-gray-400 font-semibold shrink-0">Official Transfer Account:</span>
        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold text-emerald-300 shrink-0">{PAYMENT_ACCOUNT_DETAILS.bankName}</span>
        <span className="font-mono font-black text-emerald-400 text-sm tracking-wider shrink-0">{PAYMENT_ACCOUNT_DETAILS.accountNumber}</span>
        <span className="text-xs text-gray-300 uppercase font-semibold shrink-0">{PAYMENT_ACCOUNT_DETAILS.accountName}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(PAYMENT_ACCOUNT_DETAILS.accountNumber); setCopiedAccount(true); setTimeout(() => setCopiedAccount(false), 2000); }}
          className={`ml-auto px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
            copiedAccount ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
          }`}
        >
          {copiedAccount ? '✓ Copied!' : '📋 Copy Account No.'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5 border border-gray-800">
          <div className="text-xs uppercase font-semibold tracking-wider text-gray-400">Active Bookings</div>
          <div className="text-3xl font-black text-emerald-400 mt-2">{activeBookings.length}</div>
          <div className="text-[11px] text-gray-500 mt-1">Currently scheduled or in progress</div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-gray-800">
          <div className="text-xs uppercase font-semibold tracking-wider text-gray-400">Completed Sessions</div>
          <div className="text-3xl font-black text-teal-400 mt-2">{completedBookings.length}</div>
          <div className="text-[11px] text-gray-500 mt-1">Total cleanings completed</div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-gray-800">
          <div className="text-xs uppercase font-semibold tracking-wider text-gray-400">Total Cleaning Hours Saved</div>
          <div className="text-3xl font-black text-cyan-400 mt-2">
            {completedBookings.length * 3 + activeBookings.length * 3.5} hrs
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Time saved for your busy schedule</div>
        </div>
      </div>

      {/* My Booking History Section */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="rounded-2xl glass-panel border border-gray-800 p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-base">📋</span>
                My Booking History
              </h2>
              <p className="text-xs text-gray-400 mt-1 ml-12">
                {customerBookings.length === 0
                  ? 'You have no bookings yet. Schedule your first clean!'
                  : `${customerBookings.length} total booking${customerBookings.length !== 1 ? 's' : ''} — ${activeBookings.length} active, ${completedBookings.length} completed`}
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 bg-gray-950/80 p-1 rounded-xl border border-gray-800 shrink-0">
              {([
                { key: 'all', label: 'All', count: customerBookings.length },
                { key: 'active', label: 'Active', count: activeBookings.length },
                { key: 'completed', label: 'Completed', count: completedBookings.length },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    filter === tab.key
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    filter === tab.key ? 'bg-emerald-500/30 text-emerald-200' : 'bg-gray-800 text-gray-500'
                  }`}>{tab.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {displayedBookings.length === 0 ? (
          <div className="text-center py-16 rounded-2xl glass-panel border border-gray-800 border-dashed">
            <div className="text-5xl mb-4">🧹</div>
            <div className="text-white font-bold text-base mb-1">
              {filter === 'active' ? 'No active bookings right now' :
               filter === 'completed' ? 'No completed bookings yet' :
               'No bookings yet'}
            </div>
            <div className="text-gray-500 text-sm mb-5">
              {filter === 'active'
                ? 'All your cleanings are completed or cancelled.'
                : filter === 'completed'
                ? 'Completed cleanings will appear here.'
                : 'Book your first professional home clean today!'}
            </div>
            <button
              onClick={onOpenBooking}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-emerald-500/30"
            >
              ✨ Schedule a Cleaning
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {displayedBookings.map((b) => {
              const cleanerInfo = cleaners.find((c) => c.id === b.cleanerId);
              const paymentStep = getPaymentStep(b);
              const isVerified = paymentStep === 3;
              const isPending = paymentStep === 2;
              const needsPayment = paymentStep === 1;

              return (
                <div
                  key={b.id}
                  className={`rounded-2xl glass-card p-6 border transition-all space-y-4 ${
                    isVerified ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10' :
                    isPending  ? 'border-blue-500/40' : 'border-gray-800'
                  }`}
                >
                  {/* ✅ PAYMENT CONFIRMED BANNER */}
                  {isVerified && (
                    <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/50 px-4 py-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-slate-950 text-lg font-black shadow-lg shadow-emerald-500/40">✓</div>
                      <div>
                        <div className="text-sm font-extrabold text-emerald-300">Payment Confirmed! 🎉</div>
                        <div className="text-[11px] text-emerald-400/80">
                          Your transfer to {PAYMENT_ACCOUNT_DETAILS.bankName} has been verified by our team.{b.paymentReference && ` Ref: ${b.paymentReference}`}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ⏳ AWAITING VERIFICATION BANNER */}
                  {isPending && (
                    <div className="flex items-center gap-3 rounded-xl bg-blue-500/10 border border-blue-500/40 px-4 py-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-base animate-pulse">⏳</div>
                      <div>
                        <div className="text-sm font-extrabold text-blue-300">Proof Submitted — Awaiting Verification</div>
                        <div className="text-[11px] text-blue-400/80">
                          We received your reference: <span className="font-mono font-bold text-blue-200">{b.paymentReference}</span>. Our team will verify within a few hours.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 🏦 ACTION REQUIRED ALERT */}
                  {needsPayment && b.status !== 'cancelled' && (
                    <div className="flex items-center gap-3 rounded-xl bg-amber-500/10 border border-amber-500/40 px-4 py-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/20 border border-amber-400/40 text-base">🏦</div>
                      <div className="flex-1">
                        <div className="text-sm font-extrabold text-amber-300">Action Required: Transfer Payment</div>
                        <div className="text-[11px] text-amber-400/80">
                          Transfer <strong className="text-amber-200">₦{b.totalAmount?.toLocaleString()}</strong> to{' '}
                          <strong className="text-amber-200">{PAYMENT_ACCOUNT_DETAILS.bankName} · {PAYMENT_ACCOUNT_DETAILS.accountNumber}</strong>,
                          then click <em>"Submit Payment Proof"</em> below.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-800/80 pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-white">{b.serviceName}</span>
                        <span className="text-xs font-mono text-gray-500">#{b.id}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{b.bedrooms} Bed • {b.bathrooms} Bath • {b.address}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {getStatusBadge(b.status)}
                      <span className="text-xl font-black text-emerald-400">₦{b.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Payment Step Tracker */}
                  <div className="rounded-xl bg-gray-900/50 border border-gray-800/60 p-4">
                    <div className="text-[10px] uppercase font-bold text-gray-500 mb-3 tracking-wider">Payment Status</div>
                    <div className="flex items-center gap-1">
                      {[
                        { label: 'Transfer Sent', icon: '🏦', step: 1 },
                        { label: 'Proof Submitted', icon: '📋', step: 2 },
                        { label: 'Confirmed ✓', icon: '✅', step: 3 },
                      ].map((item, idx) => (
                        <React.Fragment key={item.step}>
                          <div className="flex flex-col items-center gap-1 flex-1 text-center">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm transition-all ${
                              paymentStep >= item.step
                                ? item.step === 3 ? 'border-emerald-400 bg-emerald-500/30 text-emerald-300 shadow-lg shadow-emerald-500/20'
                                  : 'border-emerald-500/70 bg-emerald-500/20 text-emerald-300'
                                : 'border-gray-700 bg-gray-900 text-gray-600'
                            }`}>
                              {item.icon}
                            </div>
                            <span className={`text-[10px] font-semibold leading-tight ${
                              paymentStep >= item.step ? (item.step === 3 ? 'text-emerald-300' : 'text-gray-300') : 'text-gray-600'
                            }`}>{item.label}</span>
                          </div>
                          {idx < 2 && (
                            <div className={`flex-1 h-0.5 -mt-4 rounded-full transition-all ${paymentStep > item.step ? 'bg-emerald-500/50' : 'bg-gray-800'}`} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Cleaning Progress Bar */}
                  {b.status !== 'cancelled' && (
                    <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800/60 space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-gray-400">
                        <span className={b.status === 'pending' ? 'text-amber-300 font-bold' : ''}>1. Request</span>
                        <span className={b.status === 'assigned' ? 'text-blue-300 font-bold' : ''}>2. Assigned</span>
                        <span className={b.status === 'en_route' ? 'text-cyan-300 font-bold' : ''}>3. En Route</span>
                        <span className={b.status === 'in_progress' ? 'text-emerald-300 font-bold' : ''}>4. Cleaning</span>
                        <span className={b.status === 'completed' ? 'text-emerald-400 font-bold' : ''}>5. Done</span>
                      </div>
                      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-500" style={{ width: getProgressWidth(b.status) }} />
                      </div>
                    </div>
                  )}

                  {/* Cleaner & Booking Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="flex items-center gap-3 bg-gray-900/40 p-3 rounded-xl border border-gray-800">
                      {cleanerInfo ? (
                        <>
                          <img src={cleanerInfo.avatar} alt={cleanerInfo.name} className="h-10 w-10 rounded-full object-cover border border-emerald-500/40" />
                          <div>
                            <div className="font-bold text-white">{cleanerInfo.name}</div>
                            <div className="text-gray-400 text-[11px] flex items-center gap-2">
                              <span>★ {cleanerInfo.rating} Rating</span><span>• {cleanerInfo.phone}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-400 italic">Matching optimal cleaner for your area...</div>
                      )}
                    </div>
                    <div className="bg-gray-900/40 p-3 rounded-xl border border-gray-800 space-y-1">
                      <div><span className="text-gray-500">Date:</span> <strong className="text-gray-200">{b.date}</strong></div>
                      <div><span className="text-gray-500">Time:</span> <strong className="text-gray-200">{b.timeSlot}</strong></div>
                      {b.paymentReference && (
                        <div><span className="text-gray-500">Your Ref:</span> <span className="font-mono text-emerald-300">{b.paymentReference}</span></div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-800/80">
                    <div className="flex flex-wrap gap-2">
                      {!isVerified && b.status !== 'cancelled' && (
                        <button
                          onClick={() => { setPaymentModalBookingId(b.id); setModalRefText(b.paymentReference || ''); }}
                          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md ${
                            isPending
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30'
                              : 'bg-gradient-to-r from-amber-500/80 to-orange-500/80 text-slate-950 hover:brightness-110 shadow-amber-500/20'
                          }`}
                        >
                          <span>{isPending ? '✏️' : '💳'}</span>
                          <span>{isPending ? 'Update Payment Proof' : 'Submit Payment Proof'}</span>
                        </button>
                      )}
                      {isVerified && (
                        <div className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-2">
                          <span>✓</span><span>Payment Fully Confirmed</span>
                        </div>
                      )}
                    </div>
                    {b.status !== 'completed' && b.status !== 'cancelled' && (
                      <button onClick={() => updateBookingStatus(b.id, 'cancelled')} className="px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all">
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Proof Modal */}
      {paymentModalBookingId && selectedBookingForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-emerald-500/40 p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">📋 Submit Payment Proof</h3>
                <p className="text-xs text-gray-400">Booking #{selectedBookingForModal.id} • Total: ₦{selectedBookingForModal.totalAmount?.toLocaleString()}</p>
              </div>
              <button onClick={() => setPaymentModalBookingId(null)} className="text-gray-400 hover:text-white p-1">✕</button>
            </div>

            {/* Account Box */}
            <div className="rounded-xl bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-950 border border-emerald-500/40 p-4 space-y-3">
              <div className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Transfer to this account:</div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Bank:</span>
                <span className="font-extrabold text-emerald-300 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/40">{PAYMENT_ACCOUNT_DETAILS.bankName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Account Number:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-emerald-400 text-base tracking-wider">{PAYMENT_ACCOUNT_DETAILS.accountNumber}</span>
                  <button type="button" onClick={() => { navigator.clipboard.writeText(PAYMENT_ACCOUNT_DETAILS.accountNumber); setCopiedAccount(true); setTimeout(() => setCopiedAccount(false), 2000); }}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      copiedAccount ? 'bg-emerald-500 text-slate-950' : 'bg-gray-800 text-emerald-400 hover:bg-gray-700 border border-emerald-500/30'
                    }`}>
                    {copiedAccount ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Account Name:</span>
                <span className="font-bold text-white uppercase tracking-wide">{PAYMENT_ACCOUNT_DETAILS.accountName}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-800">
                <span className="text-gray-400">Amount to Transfer:</span>
                <span className="font-black text-emerald-400 text-base">₦{selectedBookingForModal.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            {/* Success State */}
            {justSaved ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-slate-950 text-3xl shadow-xl shadow-emerald-500/40 animate-bounce">✓</div>
                <div className="text-base font-extrabold text-emerald-300">Reference Submitted!</div>
                <div className="text-xs text-gray-400">Our team will verify your payment and confirm within a few hours. Your booking card will update automatically.</div>
              </div>
            ) : (
              <form onSubmit={handleSavePaymentReference} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">Your OPay Transaction ID / Sender Name:</label>
                  <input
                    type="text"
                    value={modalRefText}
                    onChange={(e) => setModalRefText(e.target.value)}
                    placeholder="e.g. OPY20241105-ABC123 or John Doe"
                    className="w-full rounded-xl bg-gray-900 border border-gray-700 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    required
                  />
                  <p className="mt-1 text-[11px] text-gray-500">Find this in your OPay app under Transaction History.</p>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
                  <button type="button" onClick={() => setPaymentModalBookingId(null)} className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white">Close</button>
                  <button type="submit" className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-500/20">
                    Submit Proof ✓
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
