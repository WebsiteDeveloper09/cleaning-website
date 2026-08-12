'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
export const AdminDashboard: React.FC = () => {
  const {
    bookings,
    cleaners,
    conflicts,
    assignCleanerToBooking,
  } = useApp();

  const [selectedBookingForReassign, setSelectedBookingForReassign] = useState<string | null>(null);
  const [targetCleanerId, setTargetCleanerId] = useState<string>('');
  const [reassignError, setReassignError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Stats calculation
  const totalRevenue = bookings.reduce((sum, b) => (b.status === 'completed' ? sum + b.totalAmount : sum), 0);
  const pendingAssignCount = bookings.filter((b) => b.status === 'pending').length;
  const activeJobsCount = bookings.filter((b) => b.status === 'assigned' || b.status === 'en_route' || b.status === 'in_progress').length;

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
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

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-2xl glass-panel p-6 border border-purple-500/20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">Operations Command Center</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Admin Access
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Monitor real-time cleaning operations, cleaner schedules, revenue metrics, and resolve scheduling conflicts.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-5 border border-gray-800">
          <div className="text-xs uppercase font-semibold text-gray-400">Gross Revenue</div>
          <div className="text-3xl font-black text-emerald-400 mt-2">${totalRevenue}</div>
          <div className="text-[11px] text-gray-500 mt-1">From completed cleaning services</div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-gray-800">
          <div className="text-xs uppercase font-semibold text-gray-400">Active Jobs</div>
          <div className="text-3xl font-black text-cyan-400 mt-2">{activeJobsCount}</div>
          <div className="text-[11px] text-gray-500 mt-1">En route or currently in progress</div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-gray-800">
          <div className="text-xs uppercase font-semibold text-gray-400">Pending Assignment</div>
          <div className="text-3xl font-black text-amber-400 mt-2">{pendingAssignCount}</div>
          <div className="text-[11px] text-gray-500 mt-1">Requires cleaner match</div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-gray-800">
          <div className="text-xs uppercase font-semibold text-gray-400">Conflict Alerts</div>
          <div className="text-3xl font-black text-rose-400 mt-2">{conflicts.length}</div>
          <div className="text-[11px] text-gray-500 mt-1">Overlap or slot mismatch warnings</div>
        </div>
      </div>

      {/* Conflicts & Alerts Section */}
      {conflicts.length > 0 && (
        <div className="rounded-2xl glass-panel p-5 border border-rose-500/30 space-y-3">
          <h2 className="text-sm font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2">
            <span>⚠️ Scheduling Conflict Detector</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-200 text-xs">
              {conflicts.length} Active Alerts
            </span>
          </h2>
          <div className="space-y-2">
            {conflicts.map((conf) => (
              <div
                key={conf.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 gap-2 text-xs"
              >
                <div>
                  <span className="font-bold text-white">Booking #{conf.bookingId}:</span>{' '}
                  <span className="text-rose-300">{conf.reason}</span>
                </div>

                <button
                  onClick={() => {
                    setSelectedBookingForReassign(conf.bookingId);
                    setReassignError(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-500 transition-all flex-shrink-0"
                >
                  Resolve / Reassign Cleaner
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cleaner Roster */}
      <div className="rounded-2xl glass-card p-6 border border-gray-800 space-y-4">
        <h2 className="text-lg font-bold text-white">Cleaner Staff Roster</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cleaners.map((cl) => {
            const clActiveBookings = bookings.filter(
              (b) => b.cleanerId === cl.id && b.status !== 'completed' && b.status !== 'cancelled'
            );

            return (
              <div key={cl.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-900/60 border border-gray-800">
                <div className="flex items-center gap-3">
                  <img src={cl.avatar} alt={cl.name} className="h-11 w-11 rounded-full object-cover border border-purple-500/40" />
                  <div>
                    <div className="font-bold text-white text-sm">{cl.name}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-2">
                      <span className="text-amber-400">★ {cl.rating}</span>
                      <span>• {cl.completedJobsCount} jobs done</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-cyan-400 block">{clActiveBookings.length} Active Jobs</span>
                  <span className="text-[10px] text-gray-500">{cl.phone}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* All Bookings Operations Table */}
      <div className="rounded-2xl glass-card p-6 border border-gray-800 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">System Bookings Ledger</h2>
            <p className="text-xs text-gray-400">Manage all customer requests, clean assignments, and status overrides</p>
          </div>

          {/* Filter Status */}
          <div className="flex flex-wrap gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800">
            {['all', 'pending', 'assigned', 'in_progress', 'completed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-900/80 text-gray-400 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Client</th>
                <th className="p-3">Service</th>
                <th className="p-3">Date & Slot</th>
                <th className="p-3">Assigned Cleaner</th>
                <th className="p-3">Status</th>
                <th className="p-3">Amount</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-900/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-emerald-400">{b.id}</td>
                  <td className="p-3">
                    <div className="font-semibold text-white">{b.customerName}</div>
                    <div className="text-[10px] text-gray-500">{b.address}</div>
                  </td>
                  <td className="p-3 font-medium text-gray-200">{b.serviceName}</td>
                  <td className="p-3">
                    <div>{b.date}</div>
                    <div className="text-[10px] text-gray-500">{b.timeSlot}</div>
                  </td>
                  <td className="p-3">
                    {b.cleanerName ? (
                      <span className="font-semibold text-cyan-300">{b.cleanerName}</span>
                    ) : (
                      <span className="text-amber-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      b.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                      b.status === 'in_progress' ? 'bg-cyan-500/20 text-cyan-300' :
                      b.status === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {b.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-white">${b.totalAmount}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedBookingForReassign(b.id);
                        setTargetCleanerId(b.cleanerId || cleaners[0].id);
                        setReassignError(null);
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-gray-800 hover:bg-purple-600 hover:text-white transition-all text-gray-300"
                    >
                      Assign / Change
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Reassignment Modal */}
      {selectedBookingForReassign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-purple-500/40 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Reassign Cleaner for #{selectedBookingForReassign}</h3>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase font-semibold">Select Cleaner</label>
              <select
                value={targetCleanerId}
                onChange={(e) => setTargetCleanerId(e.target.value)}
                className="w-full rounded-xl bg-gray-900 border border-gray-700 p-3 text-xs text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="">-- Choose Cleaner --</option>
                {cleaners.map((cl) => (
                  <option key={cl.id} value={cl.id}>
                    {cl.name} (★ {cl.rating})
                  </option>
                ))}
              </select>
            </div>

            {reassignError && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
                ⚠️ {reassignError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBookingForReassign(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReassignSubmit}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-500 shadow-md shadow-purple-600/20"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
