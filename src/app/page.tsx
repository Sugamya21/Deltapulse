'use client';

import Link from 'next/link';
import { BarChart3, ArrowRight, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Navbar Header */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-emerald-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight text-lg text-white">DeltaPulse</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-300 hover:text-white px-4 py-2 transition"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/20"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 space-y-8 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-emerald-400 text-xs font-medium">
          <Zap className="w-3.5 h-3.5" /> Real-time Multi-Asset Delta Analytics
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Track Stocks, Crypto & <br />
          Commodities in <span className="text-emerald-400">One Terminal</span>
        </h1>

        <p className="text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed">
          Get instant market alerts, smart price-delta calculations, and seamless multi-asset watchlist management powered by real-time Yahoo Finance data.
        </p>

        <div className="flex items-center gap-4 pt-4">
          <Link
            href="/login"
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-6 py-3.5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            Explore Markets <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold px-6 py-3.5 rounded-xl transition"
          >
            Sign In to Portfolio
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} DeltaPulse Terminal. All rights reserved.
      </footer>

    </div>
  );
}