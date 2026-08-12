'use client';

import React from 'react';
import Link from 'next/link';

interface NavbarProps {
  onOpenBooking: () => void;
  activeTab: 'home' | 'services' | 'about' | 'dashboard';
  setActiveTab: (tab: 'home' | 'services' | 'about' | 'dashboard') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking, activeTab, setActiveTab }) => {

  const handleNavClick = (tab: 'home' | 'services' | 'about' | 'dashboard') => {
    setActiveTab(tab);
    if (tab === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'services') {
      const el = document.getElementById('services-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'about') {
      const el = document.getElementById('why-choose-us');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-1.5 px-4 text-center text-xs font-semibold text-slate-950 flex justify-between items-center max-w-7xl mx-auto">
        <span className="hidden sm:inline">✨ Special Offer: Get 20% off your first recurring home clean! Use code: <strong>FRESH20</strong></span>
        <span className="sm:hidden font-bold">✨ Get 20% off your first clean!</span>
        <div className="flex items-center gap-4 text-[11px] font-bold text-slate-900">
          <span>📞 Call Us: (800) 555-2532</span>
          <span className="hidden md:inline">🕒 Mon - Sun: 7am - 8pm</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('home')}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25">
            <svg className="h-6 w-6 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m11-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-1">
              Sparkle<span className="text-emerald-400">Maids</span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">Top-Rated House Cleaning Services</p>
          </div>
        </Link>

        {/* Center Public Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold">
          <button
            onClick={() => handleNavClick('home')}
            className={`transition-colors ${activeTab === 'home' ? 'text-emerald-400 font-bold border-b-2 border-emerald-400 pb-0.5' : 'text-gray-300 hover:text-white'}`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('services')}
            className={`transition-colors ${activeTab === 'services' ? 'text-emerald-400 font-bold border-b-2 border-emerald-400 pb-0.5' : 'text-gray-300 hover:text-white'}`}
          >
            Cleaning Services
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className={`transition-colors ${activeTab === 'about' ? 'text-emerald-400 font-bold border-b-2 border-emerald-400 pb-0.5' : 'text-gray-300 hover:text-white'}`}
          >
            Why Choose Us
          </button>
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'bg-slate-900 text-gray-300 border border-slate-800 hover:text-white'
            }`}
          >
            <span>My Customer Portal</span>
          </button>
        </nav>

        {/* Right side: Public Actions & Protected Staff Link */}
        <div className="flex items-center gap-3">
          
          {/* Staff Access Protected Gateway */}
          <Link
            href="/admin"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-purple-300 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 transition-colors"
          >
            <span>🔒 Admin Portal</span>
          </Link>

          {/* Book Now CTA */}
          <button
            onClick={onOpenBooking}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 px-5 py-2.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 hover:brightness-110 active:scale-95"
          >
            <span>Book Clean</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

        </div>

      </div>
    </header>
  );
};
