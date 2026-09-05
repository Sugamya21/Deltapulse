'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { fetchWithAuth } from '@/lib/api';
import {
  LayoutDashboard,
  TrendingUp,
  Bell,
  Star,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Trash2,
} from 'lucide-react';

interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price?: number;
  change?: number;
  change_percent?: number;
  asset_class?: string;
  item_type?: 'watchlist' | 'portfolio';
  created_at?: string;

  // Live values returned by /api/watchlist/manage
  current_price?: number;
  current_change?: number;
  current_change_percent?: number;
}

export default function DashboardPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'watchlist' | 'portfolio'>(
    'watchlist'
  );

  // =========================
  // FETCH DASHBOARD DATA
  // =========================
  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchWithAuth('/api/watchlist/manage');

      if (!res.ok) {
        throw new Error('Failed to fetch user items');
      }

      const data = await res.json();

      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(
        err.message ||
          'An error occurred while loading your dashboard data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // =========================
  // REMOVE ITEM
  // =========================
  const handleRemove = async (id: string) => {
    try {
      const res = await fetchWithAuth(
        `/api/watchlist/manage?id=${id}`,
        {
          method: 'DELETE',
        }
      );

      if (res.ok) {
        setItems((prev) =>
          prev.filter((item) => item.id !== id)
        );
      }
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  // =========================
  // FILTER BY ACTIVE TAB
  // =========================
  const displayedItems = items.filter(
    (item) =>
      (item.item_type || 'watchlist') === activeTab
  );

  // =========================
  // DASHBOARD SUMMARY
  // =========================

  const totalAssets = items.length;

  const topPerformer = items.reduce<WatchlistItem | null>(
    (max, item) => {
      const itemPct =
        item.current_change_percent ??
        item.change_percent ??
        0;

      const maxPct =
        max?.current_change_percent ??
        max?.change_percent ??
        -Infinity;

      return itemPct > maxPct ? item : max;
    },
    null
  );

  const activeGainers = items.filter((item) => {
    const changePct =
      item.current_change_percent ??
      item.change_percent ??
      0;

    return changePct > 0;
  }).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* =========================
            HEADER
        ========================== */}
        <div className="border-b border-slate-800/80 pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-emerald-400" />

            Executive Dashboard
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            Overall market overview of your tracked assets and
            portfolio holdings.
          </p>
        </div>

        {/* =========================
            SUMMARY CARDS
        ========================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* TOTAL ASSETS */}
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                Total Tracked Assets
              </span>

              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="text-2xl font-bold text-white tracking-tight">
              {totalAssets}
            </div>

            <div className="text-[10px] text-slate-500">
              Across Portfolio & Watchlist
            </div>
          </div>

          {/* GAINING ASSETS */}
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                Gaining Assets
              </span>

              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="text-2xl font-bold text-emerald-400 tracking-tight">
              {activeGainers}
            </div>

            <div className="text-[10px] text-slate-500">
              Assets in positive delta
            </div>
          </div>

          {/* TOP PERFORMER */}
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                Top Performer
              </span>

              <Star className="w-4 h-4 text-amber-400" />
            </div>

            <div className="text-base font-bold text-white tracking-tight truncate">
              {topPerformer ? (
                `${topPerformer.symbol} (${
                  (
                    topPerformer.current_change_percent ??
                    topPerformer.change_percent ??
                    0
                  ) >= 0
                    ? '+'
                    : ''
                }${(
                  topPerformer.current_change_percent ??
                  topPerformer.change_percent ??
                  0
                ).toFixed(2)}%)`
              ) : (
                '—'
              )}
            </div>

            <div className="text-[10px] text-slate-500">
              Highest current market change
            </div>
          </div>

          {/* ALERT STATUS */}
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                Alert Status
              </span>

              <Bell className="w-4 h-4 text-teal-400" />
            </div>

            <div className="text-2xl font-bold text-white tracking-tight">
              Active
            </div>

            <div className="text-[10px] text-slate-500">
              Monitoring price shifts
            </div>
          </div>

        </div>

        {/* =========================
            WATCHLIST / PORTFOLIO
        ========================== */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">

          {/* TOP BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">

            {/* TABS */}
            <div className="flex items-center gap-2">

              {/* WATCHLIST */}
              <button
                onClick={() => setActiveTab('watchlist')}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
                  activeTab === 'watchlist'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Watchlist
              </button>

              {/* PORTFOLIO */}
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
                  activeTab === 'portfolio'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Portfolio Holdings
              </button>

            </div>

            {/* REFRESH */}
            <button
              onClick={fetchItems}
              className="text-xs text-emerald-400 hover:text-emerald-300 transition font-medium self-start sm:self-auto"
            >
              Refresh Feed
            </button>

          </div>

          {/* =========================
              LOADING
          ========================== */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-2">

              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />

              <span className="text-xs">
                Loading items from Supabase...
              </span>

            </div>

          ) : error ? (

            /* =========================
               ERROR
            ========================== */
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
              {error}
            </div>

          ) : displayedItems.length === 0 ? (

            /* =========================
               EMPTY STATE
            ========================== */
            <div className="py-12 text-center space-y-3 border border-dashed border-slate-800 rounded-xl">

              <Star className="w-8 h-8 text-slate-600 mx-auto" />

              <div className="text-sm font-medium text-slate-300">
                Your {activeTab} is empty
              </div>

              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Use the Explore tab in the top navigation to add
                assets to your {activeTab}.
              </p>

            </div>

          ) : (

            /* =========================
               ASSET LIST
            ========================== */
            <div className="divide-y divide-slate-800/80">

              {displayedItems.map((item) => {

                const changePct =
                  item.current_change_percent ??
                  item.change_percent ??
                  0;

                const currentPrice =
                  item.current_price ??
                  item.price ??
                  0;

                const isPositive = changePct >= 0;

                return (
                  <div
                    key={item.id}
                    className="py-3.5 flex items-center justify-between group"
                  >

                    {/* LEFT SIDE */}
                    <div className="flex items-center gap-3">

                      <div>

                        <div className="flex items-center gap-2">

                          <span className="text-sm font-bold text-white">
                            {item.symbol}
                          </span>

                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                            {item.asset_class || 'Equity'}
                          </span>

                        </div>

                        <div className="text-xs text-slate-400 mt-0.5">
                          {item.name}
                        </div>

                      </div>

                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex items-center gap-6">

                      {/* PRICE + DAILY CHANGE */}
                      <div className="text-right">

                        <div className="text-sm font-semibold text-slate-200">
                          ${currentPrice.toLocaleString()}
                        </div>

                        <div
                          className={`text-xs font-mono flex items-center justify-end gap-0.5 ${
                            isPositive
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          }`}
                        >

                          {isPositive ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}

                          {isPositive ? '+' : ''}
                          {changePct.toFixed(2)}%

                        </div>

                      </div>

                      {/* REMOVE */}
                      <button
                        onClick={() => handleRemove(item.id)}
                        title="Remove item"
                        className="text-slate-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-800 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>

      </main>
    </div>
  );
}