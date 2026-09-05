'use client';

import { useRouter } from 'next/navigation';
import { 
  TrendingUp, Coins, Flame, Shield, Zap, ArrowRight, 
  CheckCircle2, Layers, Landmark, Lock, Briefcase, BarChart3 
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Navigation */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="bg-emerald-500 p-1.5 rounded-lg text-slate-950">
              <BarChart3 className="w-5 h-5 font-bold" />
            </div>
            <span className="text-lg font-bold tracking-tight">DeltaPulse</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/login')}
              className="text-xs font-semibold text-slate-300 hover:text-white transition px-3 py-2"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/explore')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-lg shadow-emerald-600/20"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-center relative">
        <div className="absolute inset-0 top-20 flex justify-center pointer-events-none">
          <div className="w-[500px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-xs text-emerald-400 font-medium">
            <Zap className="w-3.5 h-3.5" />
            <span>Real-time Multi-Asset Delta Analytics</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Track Stocks, Crypto & Commodities in <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">One Terminal</span>
          </h1>

          <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            Get instant market alerts, smart price-delta calculations, and seamless multi-asset watchlist management powered by real-time Yahoo Finance data.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => router.push('/explore')}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              Explore Markets <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/login')}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-sm px-6 py-3.5 rounded-xl transition"
            >
              Sign In to Portfolio
            </button>
          </div>
        </div>
      </section>

      {/* Supported Markets Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl font-bold tracking-tight">Supported Asset Classes</h2>
          <p className="text-xs text-slate-400">Live price tracking and market insights across global instruments.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Stocks & Equities',
              desc: 'Global equities including NASDAQ, NYSE, and NSE symbols with volume anomaly indicators.',
              icon: TrendingUp,
              status: 'Live',
              badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            },
            {
              title: 'Cryptocurrencies',
              desc: 'Track major tokens (BTC, ETH, SOL) with 24/7 price delta and sparkline charts.',
              icon: Coins,
              status: 'Live',
              badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            },
            {
              title: 'Commodities',
              desc: 'Gold, Silver, Crude Oil futures and energy markets updated dynamically.',
              icon: Flame,
              status: 'Live',
              badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }
          ].map((market) => (
            <div key={market.title} className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-slate-800/80 rounded-xl text-emerald-400">
                    <market.icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${market.badgeColor}`}>
                    {market.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{market.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{market.desc}</p>
              </div>

              <button
                onClick={() => router.push('/explore')}
                className="mt-6 text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                Browse Directory →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Modules Preview */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl font-bold tracking-tight">Expanding Financial Ecosystem</h2>
          <p className="text-xs text-slate-400">Integrations currently in active development.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Futures & Options', icon: Layers },
            { label: 'Mutual Funds', icon: Landmark },
            { label: 'Fixed Deposits', icon: Lock },
            { label: 'Loans & Credit', icon: Briefcase },
          ].map((item) => (
            <div key={item.label} className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl flex flex-col items-center text-center gap-3">
              <item.icon className="w-6 h-6 text-slate-500" />
              <span className="text-xs font-medium text-slate-300">{item.label}</span>
              <span className="text-[9px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">Coming Soon</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 DeltaPulse Financial Terminal. Powered by Yahoo Finance & Supabase.</p>
      </footer>

    </div>
  );
}