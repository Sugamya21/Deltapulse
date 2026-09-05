import Link from 'next/link';
import { usePathname } from 'next/navigation';
//import { createClient } from '@/lib/supabase/client';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Compass, Bookmark, Briefcase, LayoutDashboard, LogOut } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  //const supabase = createClient();

  const handleSignOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Sign out error:', error);
      return;
    }

    window.location.replace('/');
  } catch (error) {
    console.error('Sign out error:', error);
  }
};

  const navItems = [
    { name: 'Markets', href: '/explore', icon: Compass },
    { name: 'Watchlist', href: '/watchlist', icon: Bookmark },
    { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-white tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-slate-950 font-black text-sm">Δ</span>
            </div>
            DeltaPulse
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </header>
  );
}