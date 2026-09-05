'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import AssetDetailDrawer from '@/components/AssetDetailDrawer';
import { fetchWithAuth } from '@/lib/api';
import { Search, Plus, Check, Loader2, Sparkles, RefreshCw } from 'lucide-react';

interface ExploreAsset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  asset_class: string;
}

const DEFAULT_ASSETS: ExploreAsset[] = [
  { symbol: 'INFY.NS', name: 'Infosys Ltd.', price: 1540.60, change: 18.40, change_percent: 1.21, asset_class: 'Stock' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', price: 3920.45, change: -24.50, change_percent: -0.62, asset_class: 'Stock' },
  { symbol: 'ITC.NS', name: 'ITC Ltd.', price: 432.10, change: 5.25, change_percent: 1.23, asset_class: 'Stock' },
  { symbol: 'HDFC.NS', name: 'HDFC Bank Ltd.', price: 1450.25, change: 12.50, change_percent: 0.87, asset_class: 'Stock' },
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd.', price: 2980.10, change: 35.40, change_percent: 1.20, asset_class: 'Stock' },
  { symbol: 'ONGC.NS', name: 'Oil & Natural Gas Corporation', price: 268.45, change: -2.10, change_percent: -0.78, asset_class: 'Stock' },
  { symbol: 'SBIN.NS', name: 'State Bank of India', price: 755.30, change: 8.90, change_percent: 1.19, asset_class: 'Stock' },
  { symbol: 'TATASTEEL.NS', name: 'Tata Steel Ltd.', price: 162.80, change: 1.45, change_percent: 0.90, asset_class: 'Stock' },
  { symbol: 'JSWSTEEL.NS', name: 'JSW Steel Ltd.', price: 890.15, change: -4.30, change_percent: -0.48, asset_class: 'Stock' },
  { symbol: 'ADANIPOWER.NS', name: 'Adani Power Ltd.', price: 645.90, change: 18.25, change_percent: 2.90, asset_class: 'Stock' },
  
  { symbol: 'SOL-USD', name: 'Solana USD', price: 142.10, change: 8.30, change_percent: 6.20, asset_class: 'Crypto' },
  { symbol: 'BTC-USD', name: 'Bitcoin USD', price: 65240.00, change: 1250.00, change_percent: 1.95, asset_class: 'Crypto' },
  { symbol: 'ETH-USD', name: 'Ethereum USD', price: 3450.50, change: 75.20, change_percent: 2.23, asset_class: 'Crypto' },
  { symbol: 'XRP-USD', name: 'XRP USD', price: 0.52, change: 0.015, change_percent: 2.97, asset_class: 'Crypto' },
  { symbol: 'ADA-USD', name: 'Cardano USD', price: 0.45, change: -0.01, change_percent: -2.17, asset_class: 'Crypto' },

  { symbol: 'GC=F', name: 'Gold Futures', price: 2158.40, change: 12.00, change_percent: 0.56, asset_class: 'Commodity' },
  { symbol: 'SI=F', name: 'Silver Futures', price: 24.80, change: 0.35, change_percent: 1.43, asset_class: 'Commodity' },
  { symbol: 'CL=F', name: 'Crude Oil Futures', price: 78.50, change: -1.10, change_percent: -1.38, asset_class: 'Commodity' },
  { symbol: 'NG=F', name: 'Natural Gas Futures', price: 1.85, change: 0.04, change_percent: 2.21, asset_class: 'Commodity' },
  { symbol: 'HG=F', name: 'Copper Futures', price: 4.12, change: 0.02, change_percent: 0.49, asset_class: 'Commodity' }
];

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'Stock' | 'Crypto' | 'Commodity'>('Stock');
  const [assets, setAssets] = useState<ExploreAsset[]>(DEFAULT_ASSETS);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [addedSymbols, setAddedSymbols] = useState<Record<string, boolean>>({});
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  useEffect(() => {
    const fetchLiveBackgroundPrices = async () => {
      setIsRefreshing(true);
      try {
        const updatedAssets = await Promise.all(
          DEFAULT_ASSETS.map(async (defaultAsset) => {
            try {
              const res = await fetch(`/api/search?q=${encodeURIComponent(defaultAsset.symbol)}`);
              if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                  const liveMatch = data.find((d: any) => d.symbol === defaultAsset.symbol) || data[0];
                  return {
                    ...defaultAsset,
                    price: liveMatch.price ?? defaultAsset.price,
                    change: liveMatch.change ?? defaultAsset.change,
                    change_percent: liveMatch.change_percent ?? defaultAsset.change_percent,
                  };
                }
              }
            } catch {
              // Fallback to static asset on network error
            }
            return defaultAsset;
          })
        );
        setAssets(updatedAssets);
      } catch (err) {
        console.error('Background price sync error:', err);
      } finally {
        setIsRefreshing(false);
      }
    };

    fetchLiveBackgroundPrices();

    const checkExisting = async () => {
  try {
    const res = await fetchWithAuth('/api/watchlist/manage');

    if (res.ok) {
      const data = await res.json();

      const map: Record<string, boolean> = {};

      data
        .filter((item: any) => item.item_type === 'watchlist')
        .forEach((item: any) => {
          map[item.symbol] = true;
        });

      setAddedSymbols(map);
    }
  } catch (e) {
    console.error('Failed to load existing watchlist items', e);
  }
};
    checkExisting();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setAssets(DEFAULT_ASSETS);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAssets(data);
          if (data[0].asset_class) {
            setSelectedTab(data[0].asset_class as 'Stock' | 'Crypto' | 'Commodity');
          }
        } else {
          setAssets([]);
        }
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.MouseEvent, asset: ExploreAsset, type: 'watchlist' | 'portfolio') => {
    e.stopPropagation();
    try {
      const res = await fetchWithAuth('/api/watchlist/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: asset.symbol,
          name: asset.name,
          price: asset.price,
          change: asset.change,
          change_percent: asset.change_percent,
          asset_class: asset.asset_class,
          item_type: type
        }),
      });

      if (res.ok) {
        if (type === 'watchlist') {
          setAddedSymbols(prev => ({ ...prev, [asset.symbol]: true }));
        }
      }
    } catch (err) {
      console.error('Add asset error:', err);
    }
  };

  // If a user typed a search query, show the API results directly. Otherwise, apply tab filter.
  const filteredAssets = assets.filter(asset => {
    const q = query.trim().toLowerCase();
    if (q) {
      return true;
    }
    return asset.asset_class?.toLowerCase() === selectedTab.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="border-b border-slate-800/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-400" /> Explore Markets
              {isRefreshing && (
                <span className="flex items-center gap-1 text-[10px] font-normal text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full ml-2">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Syncing live prices...
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Filter by asset class or search any stock, crypto, or commodity.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-80">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search symbol (e.g. TATAMOTORS.NS)..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (!e.target.value.trim()) {
                    setAssets(DEFAULT_ASSETS);
                  }
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition"
            >
              Search
            </button>
          </form>
        </div>

        <div className="flex items-center gap-2 border-b border-slate-800/60 pb-4">
          {(['Stock', 'Crypto', 'Commodity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                selectedTab === tab
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-900/50 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-900'
              }`}
            >
              {tab}s
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No assets found matching your query.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map((asset) => {
              const isPositive = (asset.change_percent || 0) >= 0;
              const isAdded = addedSymbols[asset.symbol];

              return (
                <div
                  key={asset.symbol}
                  onClick={() => setSelectedSymbol(asset.symbol)}
                  className="bg-slate-900/65 border border-slate-800 p-5 rounded-2xl flex items-center justify-between hover:border-emerald-500/50 hover:bg-slate-900 transition group cursor-pointer"
                >
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-semibold uppercase">
                      {asset.asset_class || 'Stock'}
                    </span>
                    <div className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                      {asset.symbol}
                    </div>
                    <div className="text-xs text-slate-400 truncate max-w-[140px]">{asset.name}</div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-2">
                    <div>
                      <div className="text-sm font-semibold font-mono text-white">
                        ${asset.price ? asset.price.toLocaleString() : '0.00'}
                      </div>
                      <div className={`text-xs font-mono ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{(asset.change_percent || 0).toFixed(2)}%
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 z-20 relative">
                      <button
                        onClick={(e) => handleAdd(e, asset, 'watchlist')}
                        className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${
                          isAdded 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                            : 'border-slate-800 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                        title="Add to Watchlist"
                      >
                        {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span className="text-[10px]">Watch</span>
                      </button>

                      <button
                        onClick={(e) => handleAdd(e, asset, 'portfolio')}
                        className="px-2 py-1.5 rounded-lg border border-emerald-600/30 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 text-[10px] font-semibold transition"
                        title="Add to Portfolio"
                      >
                        + Portfolio
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <AssetDetailDrawer symbol={selectedSymbol} onClose={() => setSelectedSymbol(null)} />
    </div>
  );
}