import { Activity, FileText, Info, GraduationCap, LogOut, Shield } from 'lucide-react';
import { useApp, type Page } from '@/context/AppContext';

const NAV_ITEMS: { page: Page; icon: typeof Activity; label: string }[] = [
  { page: 'dashboard', icon: Activity,       label: 'Dashboard' },
  { page: 'reports',   icon: FileText,       label: 'Reports' },
  { page: 'academics', icon: GraduationCap,  label: 'Academics' },
  { page: 'about',     icon: Info,           label: 'About' },
];

export default function Navbar() {
  const { page, navigate, logout, username, role } = useApp();

  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-700/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <button onClick={() => navigate('dashboard')} className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/25 transition-colors">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <span className="font-bold text-white text-sm tracking-tight">NoiseGuard<span className="text-cyan-400"> AI</span></span>
        </button>

        {/* Nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {NAV_ITEMS.map(({ page: p, icon: Icon, label }) => (
            <button
              key={p}
              onClick={() => navigate(p)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                page === p
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-800/60 border border-slate-700/40 rounded-lg px-3 py-1.5">
            <Shield className="w-3 h-3 text-slate-500" />
            <span className="text-xs text-slate-300 capitalize">{username}</span>
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${
              role === 'admin' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700 text-slate-400'
            }`}>{role}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors bg-slate-800/60 border border-slate-700/40 hover:border-red-500/20 rounded-lg px-2.5 py-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="sm:hidden flex border-t border-slate-800">
        {NAV_ITEMS.map(({ page: p, icon: Icon, label }) => (
          <button
            key={p}
            onClick={() => navigate(p)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${
              page === p ? 'text-cyan-400 bg-cyan-500/5' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>
    </header>
  );
}
