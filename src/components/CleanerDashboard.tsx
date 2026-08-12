'use client';

import React, { useState } from 'react';
import { useApp, TIME_SLOTS } from '@/context/AppContext';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const CleanerDashboard: React.FC = () => {
  const {
    currentUser,
    bookings,
    updateBookingStatus,
    availability,
    toggleCleanerSlotAvailability,
    conflicts,
  } = useApp();

  const [selectedDay, setSelectedDay] = useState<number>(1); // Monday default
  const [completingBookingId, setCompletingBookingId] = useState<string | null>(null);
  const [proofNoteText, setProofNoteText] = useState<string>('');

  // Filter assigned jobs for this cleaner
  const myJobs = bookings.filter((b) => b.cleanerId === currentUser.id);

  const activeJobs = myJobs.filter((b) => b.status !== 'completed' && b.status !== 'cancelled');
  const completedJobs = myJobs.filter((b) => b.status === 'completed');

  const cleanerConflicts = conflicts.filter((c) => c.cleanerId === currentUser.id);

  const currentDayAvailability = availability.find(
    (a) => a.cleanerId === currentUser.id && a.dayOfWeek === selectedDay
  );

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (completingBookingId) {
      updateBookingStatus(completingBookingId, 'completed', proofNoteText || 'Job finished to customer satisfaction.');
      setCompletingBookingId(null);
      setProofNoteText('');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Cleaner Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-2xl glass-panel p-6 border border-cyan-500/20">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="h-14 w-14 rounded-full border-2 border-cyan-400 object-cover shadow-lg shadow-cyan-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{currentUser.name}</h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PRO Cleaner ★ {currentUser.rating || 4.9}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-0.5">
              Manage your work schedule, view route details, and update job progress in real-time.
            </p>
          </div>
        </div>

        <div className="flex gap-4 text-center">
          <div className="bg-gray-900/80 px-4 py-2 rounded-xl border border-gray-800">
            <div className="text-xs text-gray-400">Assigned Today</div>
            <div className="text-xl font-bold text-cyan-400">{activeJobs.length}</div>
          </div>
          <div className="bg-gray-900/80 px-4 py-2 rounded-xl border border-gray-800">
            <div className="text-xs text-gray-400">Jobs Completed</div>
            <div className="text-xl font-bold text-emerald-400">{currentUser.completedJobsCount || completedJobs.length}</div>
          </div>
        </div>
      </div>

      {/* Conflict Warnings if any */}
      {cleanerConflicts.length > 0 && (
        <div className="space-y-2">
          {cleanerConflicts.map((conf) => (
            <div
              key={conf.id}
              className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 text-rose-200 text-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 font-bold">
                  ⚠️
                </span>
                <div>
                  <strong className="block text-white font-bold">Schedule Conflict Alert</strong>
                  <span>{conf.reason}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shift Availability Toggle Matrix */}
      <div className="rounded-2xl glass-card p-6 border border-gray-800 space-y-4">
        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white">Shift Availability & Schedule</h2>
            <p className="text-xs text-gray-400">Toggle hours you are available to accept bookings</p>
          </div>

          {/* Day selection tabs */}
          <div className="flex gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800">
            {DAYS.map((day, idx) => (
              <button
                key={day}
                onClick={() => setSelectedDay(idx + 1)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  selectedDay === idx + 1
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Time Slot Toggles for selected day */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TIME_SLOTS.map((slot) => {
            const isAvailable = currentDayAvailability?.timeSlots.includes(slot) ?? true;
            return (
              <div
                key={slot}
                onClick={() => toggleCleanerSlotAvailability(currentUser.id, selectedDay, slot)}
                className={`cursor-pointer rounded-xl p-3.5 border transition-all flex items-center justify-between ${
                  isAvailable
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                    : 'bg-gray-900/40 border-gray-800 text-gray-500'
                }`}
              >
                <div className="text-xs font-semibold">{slot}</div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isAvailable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-400'
                }`}>
                  {isAvailable ? 'Available' : 'Off'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Jobs & Status Controls */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>Assigned Cleaning Jobs</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
            {myJobs.length}
          </span>
        </h2>

        {myJobs.length === 0 ? (
          <div className="text-center py-12 rounded-2xl glass-panel border border-gray-800 text-gray-500 text-sm">
            No assigned jobs at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {myJobs.map((b) => (
              <div
                key={b.id}
                className={`rounded-2xl glass-card p-6 border transition-all ${
                  b.status === 'in_progress'
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : b.status === 'en_route'
                    ? 'border-cyan-500/50 bg-cyan-500/5'
                    : 'border-gray-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white">{b.serviceName}</span>
                      <span className="text-xs font-mono text-gray-500">#{b.id}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Client: <strong>{b.customerName}</strong> ({b.customerPhone})
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      Status: {b.status.replace('_', ' ')}
                    </span>
                    <span className="text-lg font-black text-emerald-400">${b.totalAmount}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs my-3">
                  <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800 space-y-1">
                    <div><span className="text-gray-500">📍 Address:</span> <strong className="text-gray-200">{b.address}</strong></div>
                    <div><span className="text-gray-500">📅 Date & Slot:</span> <strong className="text-gray-200">{b.date} ({b.timeSlot})</strong></div>
                  </div>

                  <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800 space-y-1">
                    <div><span className="text-gray-500">🏠 Scope:</span> {b.bedrooms} Beds, {b.bathrooms} Baths</div>
                    {b.notes && <div><span className="text-amber-400 font-bold">Client Note:</span> &quot;{b.notes}&quot;</div>}
                  </div>
                </div>

                {/* Job Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-gray-800">
                  {b.status === 'assigned' && (
                    <button
                      onClick={() => updateBookingStatus(b.id, 'en_route')}
                      className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold text-xs hover:bg-cyan-500 transition-all shadow-md shadow-cyan-600/20"
                    >
                      🚗 On My Way (En Route)
                    </button>
                  )}

                  {b.status === 'en_route' && (
                    <button
                      onClick={() => updateBookingStatus(b.id, 'in_progress')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20"
                    >
                      🧹 Start Cleaning
                    </button>
                  )}

                  {b.status === 'in_progress' && (
                    <button
                      onClick={() => setCompletingBookingId(b.id)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs hover:brightness-110 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      ✓ Mark as Complete & Add Note
                    </button>
                  )}

                  {b.status === 'completed' && (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      ✓ Job Finished & Verified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completion Modal */}
      {completingBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-emerald-500/40 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Complete Job #{completingBookingId}</h3>
            <p className="text-xs text-gray-400">Add proof details or notes for the customer.</p>
            
            <textarea
              value={proofNoteText}
              onChange={(e) => setProofNoteText(e.target.value)}
              rows={3}
              placeholder="e.g., Deep clean finished. All windows wiped down and keys placed back on kitchen island."
              className="w-full rounded-xl bg-gray-900 border border-gray-700 p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCompletingBookingId(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompleteSubmit}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              >
                Submit & Finish
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
