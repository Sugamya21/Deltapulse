'use client';

import { useState, useEffect } from 'react';
import { X, TrendingUp, BarChart2, FileText, Cpu, Activity, Loader2 } from 'lucide-react';

interface DrawerProps {
  symbol: string | null;
  onClose: () => void;
}

export default function AssetDetailDrawer({ symbol, onClose }: DrawerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'business' | 'technicals' | 'fundamentals' | 'derivatives'>('overview');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sessionDiff, setSessionDiff] = useState<{ priceChange: number; percentChange: number } | null>(null);

  useEffect(() => {
    if (!symbol) {
      setData(null);
      setSessionDiff(null);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/yahoo/details?symbol=${encodeURIComponent(symbol)}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);

          const currentPrice = json?.price?.regularMarketPrice?.raw ?? json?.price?.regularMarketPrice;
          if (currentPrice !== undefined && currentPrice !== null) {
            const storageKey = `last_login_price_${symbol}`;
            const savedLoginPrice = localStorage.getItem(storageKey);

            if (!savedLoginPrice) {
              localStorage.setItem(storageKey, currentPrice.toString());
              setSessionDiff({ priceChange: 0, percentChange: 0 });
            } else {
              const baseline = parseFloat(savedLoginPrice);
              const diff = currentPrice - baseline;
              const percent = baseline > 0 ? (diff / baseline) * 100 : 0;
              setSessionDiff({ priceChange: diff, percentChange: percent });
            }
          }
        }
      } catch (err) {
        console.error('Failed to load asset details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [symbol]);

  if (!symbol) return null;

  const price = data?.price;
  const summary = data?.summaryDetail;
  const financial = data?.financialData;
  const profile = data?.assetProfile;
  const stats = data?.defaultKeyStatistics;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm transition-opacity">
      {/* Slide-over Content Box */}
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{symbol}</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
                {price?.exchangeName || 'Market'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{price?.longName || profile?.longBusinessSummary?.slice(0, 50) + '...'}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart2 },
            { id: 'business', label: 'Business & Recs', icon: FileText },
            { id: 'technicals', label: 'Technicals', icon: Activity },
            { id: 'fundamentals', label: 'Fundamentals', icon: TrendingUp },
            { id: 'derivatives', label: 'Derivatives', icon: Cpu },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Body Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              <p className="text-xs">Loading terminal analytics for {symbol}...</p>
            </div>
          ) : (
            <>
              {/* Price Banner */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Current Market Price</div>
                  <div className="text-2xl font-bold text-white font-mono">
                    ${price?.regularMarketPrice?.raw ?? price?.regularMarketPrice ?? 'N/A'}
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs text-slate-400">Day Range</div>
                  <div className="text-xs text-slate-200 font-semibold">
                    ${summary?.dayLow?.raw ?? '0'} - ${summary?.dayHigh?.raw ?? '0'}
                  </div>
                </div>
              </div>

              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Session Overview Card */}
                  <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" /> Session Overview
                    </h4>
                    <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800/60">
                      <span className="text-slate-400">Change since last login:</span>
                      {sessionDiff ? (
                        <span className={`font-mono font-semibold ${sessionDiff.priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {sessionDiff.priceChange >= 0 ? '+' : ''}${sessionDiff.priceChange.toFixed(2)} 
                          ({sessionDiff.percentChange >= 0 ? '+' : ''}{sessionDiff.percentChange.toFixed(2)}%)
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono">Evaluating...</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-xs text-slate-400">Market Cap</span>
                      <div className="text-sm font-bold text-white">{summary?.marketCap?.fmt || 'N/A'}</div>
                    </div>
                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-xs text-slate-400">Volume Traded</span>
                      <div className="text-sm font-bold text-white">{summary?.volume?.fmt || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* BUSINESS & RECS TAB */}
              {activeTab === 'business' && (
                <div className="space-y-4">
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-slate-300 uppercase">Analyst Consensus</h4>
                    <div className="text-lg font-bold text-emerald-400 uppercase">
                      {financial?.recommendationKey || 'Hold'}
                    </div>
                    <p className="text-xs text-slate-400">
                      Mean Target Price: <span className="text-white font-mono">${financial?.targetMeanPrice?.raw || 'N/A'}</span>
                    </p>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-slate-300 uppercase">Company Profile</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {profile?.longBusinessSummary || 'No detailed business summary available for this security.'}
                    </p>
                  </div>
                </div>
              )}

              {/* TECHNICALS TAB */}
              {activeTab === 'technicals' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400">50-Day Moving Avg</span>
                    <div className="text-sm font-bold text-white">${summary?.fiftyDayAverage?.raw?.toFixed(2) || 'N/A'}</div>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400">200-Day Moving Avg</span>
                    <div className="text-sm font-bold text-white">${summary?.twoHundredDayAverage?.raw?.toFixed(2) || 'N/A'}</div>
                  </div>
                </div>
              )}

              {/* FUNDAMENTALS TAB */}
              {activeTab === 'fundamentals' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400">Trailing P/E</span>
                    <div className="text-sm font-bold text-white">{summary?.trailingPE?.raw?.toFixed(2) || 'N/A'}</div>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400">Price to Book (P/B)</span>
                    <div className="text-sm font-bold text-white">{stats?.priceToBook?.raw?.toFixed(2) || 'N/A'}</div>
                  </div>
                </div>
              )}

              {/* DERIVATIVES TAB */}
              {activeTab === 'derivatives' && (
                <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800 text-center text-slate-400 text-xs space-y-2">
                  <div>Options & Futures metrics for {symbol}</div>
                  <p className="text-slate-500">Implied volatility and open interest tracking active.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}