'use client';

import React, { useState } from 'react';
import { useApp, TIME_SLOTS } from '@/context/AppContext';
import { PAYMENT_ACCOUNT_DETAILS } from '@/lib/types';

interface BookingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({ isOpen, onClose, onSuccess }) => {
  const { services, addons, cleaners, createBooking, currentUser, checkSlotConflict } = useApp();

  const [step, setStep] = useState<number>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0].id);
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [date, setDate] = useState<string>(() =>
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState<string>(TIME_SLOTS[0]);
  const [address, setAddress] = useState<string>('Plot 14, Admiralty Way, Lekki Phase 1, Lagos');
  const [phone, setPhone] = useState<string>(currentUser.phone || '+234 803 123 4567');
  const [notes, setNotes] = useState<string>('');
  const [selectedCleanerId, setSelectedCleanerId] = useState<string>('');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [copiedAccount, setCopiedAccount] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentService = services.find((s) => s.id === selectedServiceId) || services[0];

  // Price Calculation Logic
  const roomCost = (bedrooms - 1) * 5000 + (bathrooms - 1) * 4000;
  const addonCost = selectedAddons.reduce((sum, addonId) => {
    const item = addons.find((a) => a.id === addonId);
    return sum + (item ? item.price : 0);
  }, 0);
  const totalAmount = Math.max(currentService.basePrice + roomCost + addonCost, 20000);

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  const handleCleanerSelect = (cleanerId: string) => {
    setSelectedCleanerId(cleanerId);
    if (cleanerId) {
      const conflict = checkSlotConflict(cleanerId, date, timeSlot);
      setConflictWarning(conflict);
    } else {
      setConflictWarning(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCleanerId) {
      const conflict = checkSlotConflict(selectedCleanerId, date, timeSlot);
      if (conflict) {
        setConflictWarning(conflict);
        return;
      }
    }

    const newBooking = createBooking({
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerPhone: phone,
      address,
      serviceId: currentService.id,
      serviceName: currentService.name,
      bedrooms,
      bathrooms,
      addons: selectedAddons,
      date,
      timeSlot,
      totalAmount,
      cleanerId: selectedCleanerId || undefined,
      notes,
      paymentMethod: 'Bank Transfer (OPAY)',
      paymentAccount: `${PAYMENT_ACCOUNT_DETAILS.bankName} - ${PAYMENT_ACCOUNT_DETAILS.accountNumber} (${PAYMENT_ACCOUNT_DETAILS.accountName})`,
      paymentReference: paymentReference.trim() || undefined,
      paymentStatus: 'pending',
    });

    onSuccess(newBooking.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl glass-panel border border-gray-700/60 shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/60 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-sm">
                {step}
              </span>
              Book Cleaning Service
            </h2>
            <p className="text-xs text-gray-400">Step {step} of 4 — {
              step === 1 ? 'Select Cleaning Service' :
              step === 2 ? 'Customize Home Details & Addons' :
              step === 3 ? 'Choose Date, Slot & Cleaner' : 'Review & Confirm'
            }</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-gray-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          
          {/* STEP 1: Select Service */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Choose Service Package</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((srv) => {
                  const isSelected = selectedServiceId === srv.id;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedServiceId(srv.id)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/80 ring-1 ring-emerald-500 shadow-lg shadow-emerald-500/10'
                          : 'bg-gray-900/50 border-gray-800 hover:border-gray-700 hover:bg-gray-800/40'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-white text-base">{srv.name}</span>
                        <span className="text-emerald-400 font-extrabold text-lg">₦{srv.basePrice.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed mb-3">{srv.description}</p>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500">
                        <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Est. {srv.estimatedHours} Hours</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Room Counts & Extras */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Rooms counter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-900/60 p-4 rounded-xl border border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-bold text-white">Bedrooms</label>
                    <p className="text-xs text-gray-400">+₦5,000 per extra room</p>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-800 p-1.5 rounded-lg border border-gray-700">
                    <button
                      type="button"
                      onClick={() => setBedrooms(Math.max(1, bedrooms - 1))}
                      className="h-7 w-7 rounded bg-gray-700 text-white font-bold hover:bg-gray-600"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-bold text-emerald-400 text-sm">{bedrooms}</span>
                    <button
                      type="button"
                      onClick={() => setBedrooms(bedrooms + 1)}
                      className="h-7 w-7 rounded bg-gray-700 text-white font-bold hover:bg-gray-600"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-bold text-white">Bathrooms</label>
                    <p className="text-xs text-gray-400">+₦4,000 per extra bath</p>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-800 p-1.5 rounded-lg border border-gray-700">
                    <button
                      type="button"
                      onClick={() => setBathrooms(Math.max(1, bathrooms - 1))}
                      className="h-7 w-7 rounded bg-gray-700 text-white font-bold hover:bg-gray-600"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-bold text-emerald-400 text-sm">{bathrooms}</span>
                    <button
                      type="button"
                      onClick={() => setBathrooms(bathrooms + 1)}
                      className="h-7 w-7 rounded bg-gray-700 text-white font-bold hover:bg-gray-600"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Addons Selection */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">Optional Add-ons</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {addons.map((ad) => {
                    const isChecked = selectedAddons.includes(ad.id);
                    return (
                      <div
                        key={ad.id}
                        onClick={() => toggleAddon(ad.id)}
                        className={`cursor-pointer rounded-xl p-3 border text-left transition-all ${
                          isChecked
                            ? 'bg-emerald-500/15 border-emerald-500/60 text-white'
                            : 'bg-gray-900/40 border-gray-800 text-gray-400 hover:border-gray-700'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-semibold">{ad.name}</span>
                          <span className="text-emerald-400 text-xs font-bold">+₦{ad.price.toLocaleString()}</span>
                        </div>
                        <span className="text-[10px] text-gray-500">{isChecked ? '✓ Added' : '+ Add'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Date, Time & Cleaner Choice */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Select Date</label>
                  <input
                    type="date"
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      setDate(e.target.value);
                      if (selectedCleanerId) handleCleanerSelect(selectedCleanerId);
                    }}
                    className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Time Slot</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => {
                      setTimeSlot(e.target.value);
                      if (selectedCleanerId) handleCleanerSelect(selectedCleanerId);
                    }}
                    className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preferred Cleaner Assignment */}
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">
                  Preferred Cleaner (Optional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => handleCleanerSelect('')}
                    className={`cursor-pointer rounded-xl p-3 border text-center transition-all ${
                      !selectedCleanerId
                        ? 'bg-emerald-500/15 border-emerald-500 text-white font-bold'
                        : 'bg-gray-900/40 border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <div className="text-xs font-bold">Auto Assign</div>
                    <div className="text-[10px] text-gray-500">Best Available Match</div>
                  </div>

                  {cleaners.map((cl) => {
                    const isSelected = selectedCleanerId === cl.id;
                    const conflict = checkSlotConflict(cl.id, date, timeSlot);
                    return (
                      <div
                        key={cl.id}
                        onClick={() => !conflict && handleCleanerSelect(cl.id)}
                        className={`cursor-pointer rounded-xl p-3 border transition-all ${
                          conflict
                            ? 'opacity-40 bg-gray-900/20 border-gray-800 cursor-not-allowed'
                            : isSelected
                            ? 'bg-emerald-500/15 border-emerald-500 text-white'
                            : 'bg-gray-900/40 border-gray-800 text-gray-300 hover:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <img src={cl.avatar} alt={cl.name} className="h-6 w-6 rounded-full object-cover" />
                          <span className="text-xs font-semibold truncate">{cl.name}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-yellow-400">★ {cl.rating}</span>
                          <span className={conflict ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                            {conflict ? 'Unavailable' : 'Available'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {conflictWarning && (
                  <div className="mt-3 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300 flex items-start gap-2">
                    <svg className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{conflictWarning}</span>
                  </div>
                )}
              </div>

              {/* Address & Phone */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Cleaning Location Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    placeholder="Full street address & unit number"
                    className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Payment Confirmation */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-xl bg-gray-900/80 p-4 border border-gray-800 space-y-3">
                <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                  <div>
                    <span className="text-lg font-bold text-white">{currentService.name}</span>
                    <p className="text-xs text-gray-400">{bedrooms} Bed • {bathrooms} Bath</p>
                  </div>
                  <span className="text-2xl font-black text-emerald-400">₦{totalAmount.toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                  <div><span className="text-gray-500">Date:</span> {date}</div>
                  <div><span className="text-gray-500">Time:</span> {timeSlot}</div>
                  <div className="col-span-2"><span className="text-gray-500">Address:</span> {address}</div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Cleaner:</span>{' '}
                    <span className="text-emerald-400 font-semibold">
                      {selectedCleanerId
                        ? cleaners.find((c) => c.id === selectedCleanerId)?.name
                        : 'Auto Match Algorithm'}
                    </span>
                  </div>
                </div>

                {selectedAddons.length > 0 && (
                  <div className="pt-2 border-t border-gray-800 text-xs">
                    <span className="text-gray-500">Selected Addons:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedAddons.map((adId) => {
                        const ad = addons.find((a) => a.id === adId);
                        return (
                          <span key={adId} className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-emerald-300 font-medium">
                            + {ad?.name} (₦{ad?.price?.toLocaleString()})
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* OPAY Payment Account Details Box */}
              <div className="rounded-xl bg-gradient-to-br from-emerald-950/40 via-gray-900 to-slate-900 border border-emerald-500/50 p-4 space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                      💳
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Payment Account (Bank Transfer)
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Official Account
                  </span>
                </div>

                <div className="bg-gray-950/80 rounded-xl p-3.5 border border-emerald-500/20 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">Bank Name:</span>
                    <span className="font-extrabold text-white text-xs tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-500/40">
                      {PAYMENT_ACCOUNT_DETAILS.bankName}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">Account Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-emerald-400 text-base tracking-wider">
                        {PAYMENT_ACCOUNT_DETAILS.accountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(PAYMENT_ACCOUNT_DETAILS.accountNumber);
                          setCopiedAccount(true);
                          setTimeout(() => setCopiedAccount(false), 2000);
                        }}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 ${
                          copiedAccount
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                            : 'bg-gray-800 text-emerald-400 hover:bg-gray-700 border border-emerald-500/30'
                        }`}
                      >
                        {copiedAccount ? '✓ Copied' : '📋 Copy'}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">Account Name:</span>
                    <span className="font-bold text-white uppercase tracking-wide">
                      {PAYMENT_ACCOUNT_DETAILS.accountName}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                    Transfer Sender Name or Transaction Reference (Optional)
                  </label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="e.g., OPAY / Session Ref or Sender Name"
                    className="w-full rounded-xl bg-gray-900 border border-gray-700 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Special Entry Instructions or Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Key code, gate pin, pet warnings..."
                  className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-gray-800 bg-gray-900/80 px-6 py-4">
          <div>
            <span className="text-xs text-gray-400">Total Price:</span>
            <div className="text-xl font-bold text-emerald-400">₦{totalAmount.toLocaleString()}</div>
          </div>

          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="rounded-xl border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-800"
              >
                Back
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2 text-sm font-bold text-slate-950 hover:brightness-110 transition-all shadow-lg shadow-emerald-500/20"
              >
                Confirm & Book Now
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
