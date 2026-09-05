'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import AssetDetailDrawer from '@/components/AssetDetailDrawer';
import { fetchWithAuth } from '@/lib/api';
import { Briefcase, ArrowUpRight, ArrowDownRight, Trash2, Loader2 } from 'lucide-react';


interface PortfolioItem {
  id: string;
  symbol?: string;
  ticker?: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  asset_class: string;
}

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  const fetchPortfolio = async () => {
  try {
    setLoading(true);

    const res = await fetchWithAuth('/api/watchlist/manage');

    if (!res.ok) {
      throw new Error('Failed to fetch portfolio');
    }

    const data = await res.json();

    const portfolioItems = Array.isArray(data)
      ? data.filter(
          (item: any) =>
            (item.item_type || item.type) === 'portfolio'
        )
      : [];

    setItems(portfolioItems);
  } catch (err) {
    console.error('Error fetching portfolio:', err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await fetchWithAuth(`/api/watchlist?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="border-b border-slate-800/80 pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-emerald-400" /> My Portfolio
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Click on any asset in your portfolio to view in-depth details.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No assets added to your portfolio yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const isPositive = (item.change_percent || 0) >= 0;
              const ticker = item.symbol || item.ticker || '';
              
              return (
                <div
                  key={item.symbol}
                  onClick={() => setSelectedSymbol(ticker)}
                  className="bg-slate-900/65 border border-slate-800 p-5 rounded-2xl flex items-center justify-between hover:border-emerald-500/50 hover:bg-slate-900 transition group cursor-pointer"
                >
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-semibold uppercase">
                      {item.asset_class || 'Equity'}
                    </span>
                    <div className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                      {ticker}
                    </div>
                    <div className="text-xs text-slate-400 truncate max-w-[140px]">{item.name}</div>
                  </div>

                  <div className="text-right flex items-center gap-4">
                    <div>
                      <div className="text-sm font-semibold font-mono text-white">
                        ${item.price ? item.price.toLocaleString() : '0.00'}
                      </div>
                      <div className={`text-xs font-mono flex items-center justify-end gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {isPositive ? '+' : ''}{(item.change_percent || 0).toFixed(2)}%
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDelete(e, item.id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-xl transition z-20 relative"
                      title="Remove asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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