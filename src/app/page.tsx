'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useApp, MOCK_USERS } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { BookingWizard } from '@/components/BookingWizard';
import { CustomerDashboard } from '@/components/CustomerDashboard';
import { CleanerDashboard } from '@/components/CleanerDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AuthModal } from '@/components/AuthModal';
import { PAYMENT_ACCOUNT_DETAILS } from '@/lib/types';

export default function Home() {
  const { currentUser, setCurrentUser, services, isCustomerLoggedIn } = useApp();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'services' | 'about' | 'dashboard'>('home');
  const [bookingSuccessId, setBookingSuccessId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleBookingSuccess = (bookingId: string) => {
    setBookingSuccessId(bookingId);
    setActiveTab('dashboard');
  };

  const handleOpenBooking = () => {
    if (!isCustomerLoggedIn) {
      setShowAuthModal(true);
    } else {
      setIsBookingOpen(true);
    }
  };

  const handleGoToDashboard = () => {
    if (!isCustomerLoggedIn) {
      setShowAuthModal(true);
    } else {
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-gray-100 selection:bg-emerald-500 selection:text-slate-950 font-sans">
      
      {/* Top Header */}
      <Navbar
        onOpenBooking={() => setIsBookingOpen(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Success Notification Banner */}
      {bookingSuccessId && (
        <div className="bg-emerald-500/20 border-b border-emerald-500/40 py-3 px-4 text-center text-sm font-semibold text-emerald-300 flex items-center justify-center gap-2">
          <span>🎉 Booking <strong>#{bookingSuccessId}</strong> scheduled! Your live progress tracker is now active on your dashboard.</span>
          <button
            onClick={() => setBookingSuccessId(null)}
            className="text-gray-400 hover:text-white font-bold ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* DASHBOARD TAB VIEW */}
        {activeTab === 'dashboard' ? (
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">

            {/* Customer Portal — auth-gated */}
            {isCustomerLoggedIn ? (
              <>
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
                    <div>
                      <h3 className="text-sm font-bold text-white">My Customer Portal</h3>
                      <p className="text-xs text-gray-400">View your private bookings, payment status, and history.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('home')}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-gray-300 hover:text-white border border-slate-700"
                  >
                    ← Back to Main Website
                  </button>
                </div>
                <CustomerDashboard onOpenBooking={() => setIsBookingOpen(true)} />
              </>
            ) : (
              // Not logged in — show login prompt
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
                <div className="text-6xl">🔐</div>
                <div>
                  <h2 className="text-2xl font-black text-white mb-2">Login to Your Account</h2>
                  <p className="text-gray-400 text-sm max-w-md">
                    Your booking history is private. Please log in or create a free account to view your bookings.
                  </p>
                </div>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm hover:brightness-110 shadow-lg shadow-emerald-500/30 transition-all"
                >
                  🔑 Log In / Create Account
                </button>
                <button onClick={() => setActiveTab('home')} className="text-xs text-gray-500 hover:text-white">
                  ← Back to Main Website
                </button>
              </div>
            )}
          </div>
        ) : (
          /* MAIN CLEANING WEBSITE SHOWCASE */
          <div className="space-y-20 pb-16">
            
            {/* 1. HERO SECTION WITH CLEANING PHOTO & INSTANT ESTIMATE */}
            <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12 lg:py-20 border-b border-slate-800/80">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  
                  {/* Left Hero Text Content */}
                  <div className="lg:col-span-7 space-y-6">
                    
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 text-xs font-bold text-emerald-400">
                      <span>🧼</span> #1 Rated Professional House Cleaning Service
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
                      Your Home Cleaned to Perfection by{' '}
                      <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                        Trusted Local Pros.
                      </span>
                    </h1>

                    <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                      Experience a spotless, fresh home without lifting a finger. Vetted cleaners, 100% satisfaction guaranteed, and instant online booking in under 60 seconds.
                    </p>

                    {/* Features checklist */}
                    <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm font-semibold text-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-black">✓</span> 100% Background-Checked Cleaners
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-black">✓</span> Eco-Friendly Cleaning Supplies
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-black">✓</span> Fully Bonded & Insured
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-black">✓</span> 100% Satisfaction Guarantee
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap items-center gap-4 pt-4">
                      <button
                        onClick={() => setIsBookingOpen(true)}
                        className="rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 px-8 py-4 text-base font-black text-slate-950 shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 hover:brightness-110 active:scale-95 flex items-center gap-3"
                      >
                        <span>✨ Book Cleaning Service</span>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>

                      <button
                        onClick={() => setActiveTab('dashboard')}
                        className="rounded-2xl bg-slate-900/90 px-6 py-4 text-sm font-bold text-gray-200 hover:text-white border border-slate-700 hover:border-emerald-500/50 transition-all flex items-center gap-2"
                      >
                        <span>View Portal Dashboards</span>
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">Live Demo</span>
                      </button>
                    </div>

                    {/* Customer Rating Proof */}
                    <div className="flex items-center gap-4 pt-4 border-t border-slate-800/80">
                      <div className="flex -space-x-2">
                        <img className="h-10 w-10 rounded-full border-2 border-slate-900 object-cover" src="/amina_cleaner.png" alt="Customer" />
                        <img className="h-10 w-10 rounded-full border-2 border-slate-900 object-cover" src="/emeka_cleaner.png" alt="Customer" />
                        <img className="h-10 w-10 rounded-full border-2 border-slate-900 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Customer" />
                      </div>
                      <div>
                        <div className="flex items-center text-yellow-400 text-sm font-bold">
                          ★★★★★ <span className="text-white ml-2 text-xs">4.9 / 5 Stars</span>
                        </div>
                        <p className="text-xs text-gray-400">Over 12,000+ Happy Homes Cleaned</p>
                      </div>
                    </div>

                  </div>

                  {/* Right Side: Professional Cleaning Image Showcase */}
                  <div className="lg:col-span-5 relative">
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-800 bg-slate-900 group">
                      <img
                        src="/cleaner_hero.png"
                        alt="Professional House Cleaner at Work"
                        className="w-full h-[480px] object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                      {/* Floating Badge */}
                      <div className="absolute bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-700/80 shadow-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl">
                            🧹
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">SparklePro Certified Cleaner</div>
                            <div className="text-[11px] text-emerald-400">Eco-Friendly & Detail-Oriented</div>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-emerald-500 text-slate-950">
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* 2. WHY CHOOSE US / VALUE PROPOSITION */}
            <section id="why-choose-us" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 scroll-mt-24">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <h2 className="text-3xl font-extrabold text-white">Why Thousands Trust SparkleMaids</h2>
                <p className="text-sm text-gray-400">
                  We don&apos;t just clean homes — we give you back your valuable time with guaranteed perfection.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: '🛡️',
                    title: 'Vetted & Insured',
                    desc: 'Every cleaner passes a 10-point criminal background check and multi-stage interview.',
                  },
                  {
                    icon: '⚡',
                    title: 'Instant Online Booking',
                    desc: 'Book your clean in under 60 seconds with transparent pricing and zero hidden fees.',
                  },
                  {
                    icon: '🌿',
                    title: 'Eco-Friendly Supplies',
                    desc: 'We use non-toxic, pet-safe, and child-friendly micro-fiber and green cleaning solutions.',
                  },
                  {
                    icon: '💯',
                    title: '100% Clean Guarantee',
                    desc: 'Not completely satisfied? We will return within 24 hours to re-clean for free.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-all hover:-translate-y-1 space-y-3">
                    <div className="text-4xl">{item.icon}</div>
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. CLEANING SERVICES SHOWCASE WITH REAL PHOTOGRAPHY */}
            <section id="services-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 scroll-mt-24">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-800 pb-6">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">Our Services</span>
                  <h2 className="text-3xl font-extrabold text-white mt-1">Professional Cleaning Solutions</h2>
                </div>
                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>View All Services & Pricing →</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Deep Clean */}
                <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 hover:border-emerald-500/50 transition-all group flex flex-col justify-between">
                  <div>
                    <div className="relative h-56 w-full overflow-hidden">
                      <img src="/deep_cleaning.png" alt="Deep Cleaning Service" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-4 left-4 bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow">
                        Most Popular
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-white">Deep House Clean</h3>
                        <span className="text-2xl font-black text-emerald-400">₦45,000</span>
                      </div>

                      <p className="text-xs text-gray-400 leading-relaxed">
                        Top-to-bottom thorough reset. Includes scrubbed baseboards, high dusting, grease removal, and detailed bathroom sanitization.
                      </p>

                      <ul className="space-y-2 text-xs text-gray-300 pt-2 border-t border-slate-800">
                        <li className="flex items-center gap-2">✓ Kitchen counters & sink deep scrub</li>
                        <li className="flex items-center gap-2">✓ Bathroom tiles & grout polish</li>
                        <li className="flex items-center gap-2">✓ High dusting & baseboard wipe down</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <button
                      onClick={() => setIsBookingOpen(true)}
                      className="w-full rounded-xl bg-emerald-500/10 border border-emerald-500/40 py-3 text-xs font-bold text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 transition-all"
                    >
                      Book Deep Clean
                    </button>
                  </div>
                </div>

                {/* Move In / Out */}
                <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 hover:border-emerald-500/50 transition-all group flex flex-col justify-between">
                  <div>
                    <div className="relative h-56 w-full overflow-hidden">
                      <img src="/move_in_cleaning.png" alt="Move In Move Out Cleaning" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-4 left-4 bg-teal-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow">
                        Landlord Approved
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-white">Move In / Move Out</h3>
                        <span className="text-2xl font-black text-emerald-400">₦65,000</span>
                      </div>

                      <p className="text-xs text-gray-400 leading-relaxed">
                        Empty home spotless reset. Guaranteed compliance for deposit refunds and landlord walkthrough inspections.
                      </p>

                      <ul className="space-y-2 text-xs text-gray-300 pt-2 border-t border-slate-800">
                        <li className="flex items-center gap-2">✓ Inside fridge & oven deep clean</li>
                        <li className="flex items-center gap-2">✓ Cabinet interior & drawer wiping</li>
                        <li className="flex items-center gap-2">✓ Hardwood floor vacuum & steam mop</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <button
                      onClick={() => setIsBookingOpen(true)}
                      className="w-full rounded-xl bg-emerald-500/10 border border-emerald-500/40 py-3 text-xs font-bold text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 transition-all"
                    >
                      Book Move Clean
                    </button>
                  </div>
                </div>

                {/* Standard Clean */}
                <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 hover:border-emerald-500/50 transition-all group flex flex-col justify-between">
                  <div>
                    <div className="relative h-56 w-full overflow-hidden">
                      <img src="/standard_cleaning.png" alt="Standard Routine Cleaning" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-4 left-4 bg-cyan-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow">
                        Recurring Favorite
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-white">Standard Maintenance</h3>
                        <span className="text-2xl font-black text-emerald-400">₦25,000</span>
                      </div>

                      <p className="text-xs text-gray-400 leading-relaxed">
                        Essential weekly or bi-weekly routine upkeep for busy families. Keeps kitchen, bath, and living areas pristine.
                      </p>

                      <ul className="space-y-2 text-xs text-gray-300 pt-2 border-t border-slate-800">
                        <li className="flex items-center gap-2">✓ Dusting all surfaces & electronics</li>
                        <li className="flex items-center gap-2">✓ Trash emptying & liner replacement</li>
                        <li className="flex items-center gap-2">✓ Bed making & pillow fluffing</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <button
                      onClick={() => setIsBookingOpen(true)}
                      className="w-full rounded-xl bg-emerald-500/10 border border-emerald-500/40 py-3 text-xs font-bold text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 transition-all"
                    >
                      Book Routine Clean
                    </button>
                  </div>
                </div>

              </div>
            </section>

            {/* 4. HOW IT WORKS GUIDE (FULLY INTERACTIVE STEP CARDS) */}
            <section className="bg-slate-900/90 border-y border-slate-800 py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">Interactive Walkthrough</span>
                  <h2 className="text-3xl font-extrabold text-white">How It Works in 3 Easy Steps</h2>
                  <p className="text-xs text-gray-400">Click any step card below to test the booking wizard or preview live portal tracking!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                  
                  {/* Step 1 Card: Interactive Booking Wizard Trigger */}
                  <div
                    onClick={() => setIsBookingOpen(true)}
                    className="cursor-pointer group bg-slate-950 p-6 rounded-3xl border border-slate-800 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 transform hover:-translate-y-1 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                          1
                        </div>
                        <span className="text-[10px] uppercase font-extrabold tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
                          Step 1 • Instant
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                        Book Online in 60 Sec
                      </h3>

                      <p className="text-xs text-gray-400 leading-relaxed">
                        Choose your cleaning package, room count, add-ons, date, and preferred time window with instant upfront pricing.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-xs font-extrabold text-emerald-400 group-hover:text-emerald-300">
                      <span>✨ Launch Booking Wizard</span>
                      <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>

                  {/* Step 2 Card: Interactive Cleaner Portal Dispatch Preview */}
                  <div
                    onClick={() => {
                      const cleanerUser = MOCK_USERS.find(u => u.role === 'cleaner');
                      if (cleanerUser) setCurrentUser(cleanerUser);
                      setActiveTab('dashboard');
                    }}
                    className="cursor-pointer group bg-slate-950 p-6 rounded-3xl border border-slate-800 hover:border-teal-500 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300 transform hover:-translate-y-1 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="h-12 w-12 rounded-2xl bg-teal-500 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform">
                          2
                        </div>
                        <span className="text-[10px] uppercase font-extrabold tracking-wider bg-teal-500/20 text-teal-300 px-2.5 py-1 rounded-full border border-teal-500/30">
                          Step 2 • Cleaner View
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors">
                        Pro Cleaner Arrives
                      </h3>

                      <p className="text-xs text-gray-400 leading-relaxed">
                        Our background-checked cleaner receives your job, sets status to <strong className="text-cyan-300">En Route</strong>, and starts the deep clean.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-xs font-extrabold text-teal-400 group-hover:text-teal-300">
                      <span>🚗 Preview Cleaner Portal</span>
                      <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>

                  {/* Step 3 Card: Interactive Customer Status Tracker Preview */}
                  <div
                    onClick={() => {
                      const customerUser = MOCK_USERS.find(u => u.role === 'customer');
                      if (customerUser) setCurrentUser(customerUser);
                      setActiveTab('dashboard');
                    }}
                    className="cursor-pointer group bg-slate-950 p-6 rounded-3xl border border-slate-800 hover:border-cyan-500 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 transform hover:-translate-y-1 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="h-12 w-12 rounded-2xl bg-cyan-500 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                          3
                        </div>
                        <span className="text-[10px] uppercase font-extrabold tracking-wider bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-full border border-cyan-500/30">
                          Step 3 • Customer View
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                        Enjoy Your Clean Home
                      </h3>

                      <p className="text-xs text-gray-400 leading-relaxed">
                        Relax and enjoy your sparkling fresh house. Track live progress, cleaner location, and view completion notes right from your portal!
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-xs font-extrabold text-cyan-400 group-hover:text-cyan-300">
                      <span>📍 View Live Status Tracker</span>
                      <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* 5. REVIEWS & TESTIMONIALS */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h2 className="text-3xl font-extrabold text-white">What Our Clients Say</h2>
                <p className="text-sm text-gray-400">Read verified reviews from homeowners in your neighborhood.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    name: 'Chioma Adebayo',
                    location: 'Lekki Phase 1, Lagos',
                    review: 'SparkleMaids transformed my home before our family gathering! Amina was right on time, super meticulous, and left my kitchen sparkling.',
                    rating: 5,
                  },
                  {
                    name: 'Babatunde Adeleke',
                    location: 'Victoria Island, Lagos',
                    review: 'The move-in clean was worth every single Naira. My landlord was thoroughly impressed and released 100% of my caution deposit.',
                    rating: 5,
                  },
                  {
                    name: 'Dr. Ngozi Eze',
                    location: 'Ikoyi, Lagos',
                    review: 'I love being able to pay seamlessly via OPAY and track when Emeka arrives on the live portal. Top tier customer service and zero stress!',
                    rating: 5,
                  },
                ].map((rev, idx) => (
                  <div key={idx} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex text-yellow-400 text-sm">★★★★★</div>
                    <p className="text-xs text-gray-300 italic leading-relaxed">&quot;{rev.review}&quot;</p>
                    <div className="pt-2 border-t border-slate-800 text-xs">
                      <div className="font-bold text-white">{rev.name}</div>
                      <div className="text-gray-500 text-[10px]">{rev.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

      </main>

      {/* Booking Wizard Modal */}
      <BookingWizard
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={handleBookingSuccess}
      />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            setActiveTab('dashboard');
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 text-gray-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="text-lg font-bold text-white">Sparkle<span className="text-emerald-400">Maids</span></div>
            <p className="text-gray-400 text-xs">Professional, trusted house cleaning services with instant online booking.</p>
            <div className="text-emerald-400 font-bold">📞 (800) 555-CLEAN</div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">Cleaning Services</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setIsBookingOpen(true)} className="hover:text-white">Deep House Cleaning</button></li>
              <li><button onClick={() => setIsBookingOpen(true)} className="hover:text-white">Move-in / Move-out Clean</button></li>
              <li><button onClick={() => setIsBookingOpen(true)} className="hover:text-white">Standard Maintenance</button></li>
              <li><button onClick={() => setIsBookingOpen(true)} className="hover:text-white">Post-Renovation Clean</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">Portal Access</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => setActiveTab('dashboard')} className="hover:text-emerald-400">Customer Tracking Portal</button></li>
              <li><Link href="/cleaner" className="hover:text-cyan-400 flex items-center gap-1">🔑 Staff Cleaner Portal</Link></li>
              <li><Link href="/admin" className="hover:text-purple-400 flex items-center gap-1">🔒 Admin Command Center</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3">Service Hours</h4>
            <p className="text-xs text-gray-400">Monday – Sunday: 7:00 AM – 8:00 PM</p>
            <p className="text-xs text-gray-400 mt-2">Emergency same-day slots available.</p>
          </div>
        </div>

        {/* Official Payment Account Banner in Footer */}
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800">
            <span className="text-emerald-400 font-bold">💳 Official Payment Account:</span>
            <span className="text-white font-mono font-bold">{PAYMENT_ACCOUNT_DETAILS.bankName} - {PAYMENT_ACCOUNT_DETAILS.accountNumber}</span>
            <span className="text-gray-400">({PAYMENT_ACCOUNT_DETAILS.accountName})</span>
          </div>

          <div className="text-gray-500">
            © 2026 SparkleMaids Cleaning Services Inc. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
