'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import AssetDetailDrawer from '@/components/AssetDetailDrawer';
import { fetchWithAuth } from '@/lib/api';
import {
  Bookmark,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface WatchlistItem {
  id: string;
  symbol?: string;
  ticker?: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  asset_class: string;
  item_type?: 'watchlist' | 'portfolio';

  // Current live market data
  current_price?: number;
  current_change?: number;
  current_change_percent?: number;

  // Smart Watchlist data
  last_checked_price?: number | null;
  last_checked_at?: string | null;
  since_last_check?: number;
  change_status?: 'normal' | 'moderate' | 'meaningful' | 'major';
  needs_attention?: boolean;
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [checkingId, setCheckingId] = useState<string | null>(null);

  // --------------------------------------------------
  // Fetch Watchlist
  // --------------------------------------------------
  const fetchWatchlist = async () => {
    try {
      setLoading(true);

      const res = await fetchWithAuth('/api/watchlist/manage');

      if (!res.ok) {
        throw new Error('Failed to fetch watchlist');
      }

      const data = await res.json();

      const watchlistItems = Array.isArray(data)
        ? data.filter(
            (item: WatchlistItem) =>
              item.item_type === 'watchlist'
          )
        : [];

      setItems(watchlistItems);
    } catch (err) {
      console.error('Error fetching watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  // --------------------------------------------------
  // Assets that need attention
  // --------------------------------------------------
  const attentionItems = items.filter(
    (item) => item.needs_attention
  );

  // --------------------------------------------------
  // Delete asset
  // --------------------------------------------------
  const handleDelete = async (
    e: React.MouseEvent,
    id: string
  ) => {
    e.stopPropagation();

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
      console.error('Delete error:', err);
    }
  };

  // --------------------------------------------------
  // Mark asset as checked
  // --------------------------------------------------
  const handleMarkAsChecked = async (
    e: React.MouseEvent,
    item: WatchlistItem
  ) => {
    e.stopPropagation();

    const currentPrice =
      item.current_price ?? item.price;

    if (!currentPrice || currentPrice <= 0) {
      console.error('Invalid current price');
      return;
    }

    try {
      setCheckingId(item.id);

      const res = await fetchWithAuth(
        '/api/watchlist/manage',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: item.id,
            current_price: currentPrice,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(
          'Failed to mark asset as checked'
        );
      }

      // Reload so the new baseline is displayed
      await fetchWatchlist();
    } catch (err) {
      console.error(
        'Mark as checked error:',
        err
      );
    } finally {
      setCheckingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ==================================================
            HEADER
        ================================================== */}
        <div className="border-b border-slate-800/80 pb-6">
          <div className="flex items-center justify-between gap-4">

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <Bookmark className="w-6 h-6 text-emerald-400" />
                Watchlist
              </h1>

              <p className="text-xs text-slate-400 mt-1">
                Track meaningful market movements and see
                what changed since your last check.
              </p>
            </div>

            {/* Refresh */}
            <button
              onClick={fetchWatchlist}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  loading ? 'animate-spin' : ''
                }`}
              />
              Refresh
            </button>

          </div>
        </div>

        {/* ==================================================
            LOADING
        ================================================== */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          </div>
        ) : items.length === 0 ? (

          /* ==================================================
              EMPTY WATCHLIST
          ================================================== */
          <div className="text-center py-12 text-slate-500 text-sm">
            Your watchlist is empty.
            <br />
            Go to Explore to add symbols!
          </div>

        ) : (

          <>
            {/* ==================================================
                NEEDS ATTENTION
            ================================================== */}
            <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">

              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-sm font-bold text-white">
                    🔥 Needs Attention
                  </h2>

                  <p className="text-[10px] text-slate-500 mt-1">
                    Assets with meaningful movement since
                    your last check
                  </p>
                </div>

                <div className="text-xs text-slate-400">
                  {attentionItems.length}{' '}
                  {attentionItems.length === 1
                    ? 'asset'
                    : 'assets'}
                </div>
              </div>

              {attentionItems.length === 0 ? (

                <div className="border border-dashed border-slate-800 rounded-xl p-5 text-center">
                  <div className="text-sm text-emerald-400 font-semibold">
                    ✓ Nothing significant changed
                  </div>

                  <p className="text-[10px] text-slate-500 mt-1">
                    Your watchlist is within normal movement
                    ranges.
                  </p>
                </div>

              ) : (

                <div className="space-y-3">
                  {attentionItems.map((item) => {

                    const movement =
                      item.since_last_check ?? 0;

                    const positive =
                      movement >= 0;

                    const isMajor =
                      item.change_status === 'major';

                    return (
                      <div
                        key={item.id}
                        onClick={() =>
                          setSelectedSymbol(
                            item.symbol ||
                              item.ticker ||
                              ''
                          )
                        }
                        className="flex items-center justify-between gap-4 bg-slate-950/60 border border-slate-800 rounded-xl p-4 hover:border-emerald-500/30 transition cursor-pointer"
                      >

                        {/* Asset */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">

                            <span className="text-sm font-bold text-white">
                              {item.symbol ||
                                item.ticker}
                            </span>

                            <span
                              className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-semibold ${
                                isMajor
                                  ? 'bg-red-500/10 text-red-400'
                                  : 'bg-amber-500/10 text-amber-400'
                              }`}
                            >
                              {item.change_status}
                            </span>

                          </div>

                          <div className="text-[10px] text-slate-500 mt-1 truncate max-w-[220px]">
                            {item.name}
                          </div>
                        </div>

                        {/* Movement */}
                        <div className="text-right shrink-0">

                          <div
                            className={`text-sm font-bold font-mono ${
                              positive
                                ? 'text-emerald-400'
                                : 'text-red-400'
                            }`}
                          >
                            {positive ? '+' : ''}
                            {movement.toFixed(2)}%
                          </div>

                          <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-1">
                            since last check
                          </div>

                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </section>

            {/* ==================================================
                YOUR WATCHLIST
            ================================================== */}
            <section>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-white">
                    Your Watchlist
                  </h2>

                  <p className="text-[10px] text-slate-500 mt-1">
                    {items.length}{' '}
                    {items.length === 1
                      ? 'asset'
                      : 'assets'}{' '}
                    being tracked
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {items.map((item) => {

                  const ticker =
                    item.symbol ||
                    item.ticker ||
                    '';

                  const currentPrice =
                    item.current_price ??
                    item.price ??
                    0;

                  const dailyChange =
                    item.current_change_percent ??
                    item.change_percent ??
                    0;

                  /*
                    If there is no last checked price,
                    this is an older record.
                  */
                  const hasBaseline =
                    item.last_checked_price !== null &&
                    item.last_checked_price !== undefined;

                  const sinceLastCheck =
                    item.since_last_check ?? 0;

                  const isPositive =
                    sinceLastCheck >= 0;

                  const status =
                    item.change_status ??
                    'normal';

                  const statusLabel =
                    status === 'major'
                      ? 'MAJOR'
                      : status === 'meaningful'
                      ? 'MEANINGFUL'
                      : status === 'moderate'
                      ? 'MODERATE'
                      : 'NORMAL';

                  const statusClass =
                    status === 'major'
                      ? 'text-red-400'
                      : status === 'meaningful'
                      ? 'text-amber-400'
                      : status === 'moderate'
                      ? 'text-yellow-400'
                      : 'text-slate-500';

                  return (
                    <div
                      key={item.id}
                      onClick={() =>
                        setSelectedSymbol(ticker)
                      }
                      className={`bg-slate-900/65 border p-5 rounded-2xl hover:bg-slate-900 transition group cursor-pointer ${
                        item.needs_attention
                          ? 'border-amber-500/30'
                          : 'border-slate-800 hover:border-emerald-500/50'
                      }`}
                    >

                      {/* ============================
                          TOP
                      ============================ */}
                      <div className="flex items-start justify-between">

                        <div className="space-y-1">

                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-semibold uppercase">
                            {item.asset_class ||
                              'Equity'}
                          </span>

                          <div className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                            {ticker}
                          </div>

                          <div className="text-xs text-slate-400 truncate max-w-[180px]">
                            {item.name}
                          </div>

                        </div>

                        {/* Delete */}
                        <button
                          onClick={(e) =>
                            handleDelete(
                              e,
                              item.id
                            )
                          }
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-xl transition z-20 relative"
                          title="Remove asset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>

                      {/* ============================
                          PRICE INFORMATION
                      ============================ */}
                      <div className="mt-5 flex items-end justify-between gap-4">

                        {/* Current */}
                        <div>

                          <div className="text-xs text-slate-500">
                            Current Price
                          </div>

                          <div className="text-lg font-bold font-mono text-white">
                            $
                            {currentPrice.toLocaleString()}
                          </div>

                          <div
                            className={`text-xs font-mono flex items-center gap-0.5 ${
                              dailyChange >= 0
                                ? 'text-emerald-400'
                                : 'text-red-400'
                            }`}
                          >

                            {dailyChange >= 0 ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5" />
                            )}

                            {dailyChange >= 0
                              ? '+'
                              : ''}
                            {dailyChange.toFixed(2)}%
                            <span className="text-slate-500 ml-1">
                              today
                            </span>

                          </div>

                        </div>

                        {/* Since Last Check */}
                        <div className="text-right">

                          <div className="text-[10px] text-slate-500">
                            Since last check
                          </div>

                          {hasBaseline ? (

                            <>
                              <div
                                className={`text-base font-bold font-mono ${
                                  isPositive
                                    ? 'text-emerald-400'
                                    : 'text-red-400'
                                }`}
                              >
                                {isPositive
                                  ? '+'
                                  : ''}
                                {sinceLastCheck.toFixed(
                                  2
                                )}
                                %
                              </div>

                              <div
                                className={`text-[9px] font-semibold uppercase tracking-wider ${statusClass}`}
                              >
                                {statusLabel}
                              </div>
                            </>

                          ) : (

                            <div className="text-[10px] text-slate-600 mt-1">
                              First check needed
                            </div>

                          )}

                        </div>

                      </div>

                      {/* ============================
                          LAST CHECKED TIME
                      ============================ */}
                      {item.last_checked_at && (
                        <div className="text-[9px] text-slate-600 mt-4">
                          Last checked:{' '}
                          {new Date(
                            item.last_checked_at
                          ).toLocaleString()}
                        </div>
                      )}

                      {/* ============================
                          MARK AS CHECKED
                      ============================ */}
                      <button
                        onClick={(e) =>
                          handleMarkAsChecked(
                            e,
                            item
                          )
                        }
                        disabled={
                          checkingId === item.id
                        }
                        className="w-full mt-5 px-3 py-2 rounded-xl border border-slate-800 bg-slate-800/50 text-slate-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 text-[10px] font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {checkingId === item.id ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Updating...
                          </span>
                        ) : (
                          '✓ Mark as Checked'
                        )}
                      </button>

                    </div>
                  );
                })}

              </div>

            </section>
          </>
        )}

      </main>

      {/* Asset details drawer */}
      <AssetDetailDrawer
        symbol={selectedSymbol}
        onClose={() =>
          setSelectedSymbol(null)
        }
      />
    </div>
  );
}