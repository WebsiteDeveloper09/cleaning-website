'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { BookingStatus } from '@/lib/types';

interface CustomerDashboardProps {
  onOpenBooking: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onOpenBooking }) => {
  const { bookings, currentUser, updateBookingStatus, cleaners } = useApp();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  const customerBookings = bookings.filter((b) => b.customerId === currentUser.id);

  const activeBookings = customerBookings.filter(
    (b) => b.status !== 'completed' && b.status !== 'cancelled'
  );
  const completedBookings = customerBookings.filter(
    (b) => b.status === 'completed' || b.status === 'cancelled'
  );

  const displayedBookings =
    filter === 'all'
      ? customerBookings
      : filter === 'active'
      ? activeBookings
      : completedBookings;

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

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-2xl glass-panel p-6 border border-emerald-500/20">
        <div>
          <h1 className="text-2xl font-black text-white">Welcome back, {currentUser.name}!</h1>
          <p className="text-sm text-gray-400 mt-1">
            Track your home cleaning progress in real-time or schedule your next deep clean.
          </p>
        </div>

        <button
          onClick={onOpenBooking}
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Schedule New Cleaning
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

      {/* Bookings Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Your Bookings</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
              {customerBookings.length}
            </span>
          </h2>

          <div className="flex gap-1 bg-gray-900/80 p-1 rounded-lg border border-gray-800">
            {(['active', 'completed', 'all'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-all ${
                  filter === tab
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {displayedBookings.length === 0 ? (
          <div className="text-center py-12 rounded-2xl glass-panel border border-gray-800">
            <div className="text-gray-500 text-sm">No bookings found in this category.</div>
            <button
              onClick={onOpenBooking}
              className="mt-3 text-xs font-bold text-emerald-400 hover:underline"
            >
              + Create a new booking
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {displayedBookings.map((b) => {
              const cleanerInfo = cleaners.find((c) => c.id === b.cleanerId);

              return (
                <div
                  key={b.id}
                  className="rounded-2xl glass-card p-6 border border-gray-800 space-y-4 transition-all"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-800/80 pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-white">{b.serviceName}</span>
                        <span className="text-xs font-mono text-gray-500">#{b.id}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {b.bedrooms} Bed • {b.bathrooms} Bath • {b.address}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(b.status)}
                      <span className="text-xl font-black text-emerald-400">${b.totalAmount}</span>
                    </div>
                  </div>

                  {/* Real-time Status Progress Bar */}
                  {b.status !== 'cancelled' && (
                    <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800/60 space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-gray-400">
                        <span className={b.status === 'pending' ? 'text-amber-300 font-bold' : ''}>1. Request Received</span>
                        <span className={b.status === 'assigned' ? 'text-blue-300 font-bold' : ''}>2. Cleaner Assigned</span>
                        <span className={b.status === 'en_route' ? 'text-cyan-300 font-bold' : ''}>3. En Route</span>
                        <span className={b.status === 'in_progress' ? 'text-emerald-300 font-bold' : ''}>4. Cleaning</span>
                        <span className={b.status === 'completed' ? 'text-emerald-400 font-bold' : ''}>5. Done</span>
                      </div>
                      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-500"
                          style={{ width: getProgressWidth(b.status) }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Cleaner Info & Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="flex items-center gap-3 bg-gray-900/40 p-3 rounded-xl border border-gray-800">
                      {cleanerInfo ? (
                        <>
                          <img
                            src={cleanerInfo.avatar}
                            alt={cleanerInfo.name}
                            className="h-10 w-10 rounded-full object-cover border border-emerald-500/40"
                          />
                          <div>
                            <div className="font-bold text-white">{cleanerInfo.name}</div>
                            <div className="text-gray-400 text-[11px] flex items-center gap-2">
                              <span>★ {cleanerInfo.rating} Rating</span>
                              <span>• {cleanerInfo.phone}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-400 italic">
                          Matching optimal cleaner for your area...
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-900/40 p-3 rounded-xl border border-gray-800 space-y-1">
                      <div><span className="text-gray-500">Scheduled Date:</span> <strong className="text-gray-200">{b.date}</strong></div>
                      <div><span className="text-gray-500">Time Window:</span> <strong className="text-gray-200">{b.timeSlot}</strong></div>
                      {b.proofNote && (
                        <div className="pt-1 text-emerald-300 font-medium">
                          <strong>Cleaner Note:</strong> &quot;{b.proofNote}&quot;
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  {b.status !== 'completed' && b.status !== 'cancelled' && (
                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-800/80">
                      <button
                        onClick={() => updateBookingStatus(b.id, 'cancelled')}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
