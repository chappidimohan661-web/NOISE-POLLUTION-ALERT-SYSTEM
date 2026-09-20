import { useState } from 'react';
import { Activity, Lock, User, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function LoginPage() {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const ok = login(username, password);
    setLoading(false);
    if (!ok) setError('Invalid credentials. Try admin/admin123 or user/user123');
  };

  return (
    <div className="min-h-screen bg-[#080d16] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-4">
            <Activity className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">NoiseGuard AI</h1>
          <p className="text-slate-400 text-sm mt-1">Noise Pollution Alert System</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-10 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-red-400 text-xs leading-relaxed">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-semibold rounded-xl py-3 text-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900/40 border-t-slate-900 rounded-full animate-spin" />
                  Signing in…
                </>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <p className="text-xs text-slate-500 text-center mb-3">Demo credentials</p>
            <div className="grid grid-cols-2 gap-2">
              {[{ label: 'Admin', user: 'admin', pass: 'admin123' }, { label: 'User', user: 'user', pass: 'user123' }].map(c => (
                <button
                  key={c.user}
                  type="button"
                  onClick={() => { setUsername(c.user); setPassword(c.pass); setError(''); }}
                  className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-xl p-2.5 text-left transition-colors"
                >
                  <p className="text-xs font-medium text-slate-300">{c.label}</p>
                  <p className="text-xs text-slate-500 font-mono">{c.user} / {c.pass}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          JNTUK R23 Semester-I Mini Project &mdash; AI Noise Pollution Alert System
        </p>
      </div>
    </div>
  );
}
