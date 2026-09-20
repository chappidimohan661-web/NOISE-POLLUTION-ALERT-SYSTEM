import { useEffect, useState, useRef, useCallback } from 'react';
import { Activity, Brain, AlertTriangle, CheckCircle, TrendingUp, Clock, Zap, Send } from 'lucide-react';
import { supabase, type NoiseReading } from '@/lib/supabase';
import { analyzeReading, STATUS_META, getTimePeriod, getSafeLimit } from '@/lib/aiEngine';
import NoiseChart from '@/components/NoiseChart';

const MAX_HISTORY = 40;

function GaugeMeter({ value, limit }: { value: number; limit: number }) {
  const max = Math.max(limit * 2, value + 20);
  const pct = Math.min(100, (value / max) * 100);
  const limitPct = Math.min(100, (limit / max) * 100);
  const strokeDash = 2 * Math.PI * 54;

  const color =
    pct <= limitPct              ? '#34d399' :
    pct <= limitPct + 12         ? '#facc15' :
    pct <= limitPct + 24         ? '#fb923c' :
                                   '#f87171';

  return (
    <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
      <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-[135deg]">
        <circle cx="80" cy="80" r="54" fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth="12"
          strokeDasharray={`${strokeDash * 0.75} ${strokeDash * 0.25}`} strokeLinecap="round" />
        <circle cx="80" cy="80" r="54" fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={`${strokeDash * 0.75 * (pct / 100)} ${strokeDash}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease, stroke 0.4s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-white leading-none" style={{ transition: 'all 0.4s ease' }}>
          {value.toFixed(1)}
        </span>
        <span className="text-xs text-slate-400 mt-0.5">dB</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState<NoiseReading | null>(null);
  const [history, setHistory] = useState<NoiseReading[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState('');
  const isMounted = useRef(true);

  const period = getTimePeriod();
  const safeLimit = getSafeLimit(period);
  const periodLabel = period.charAt(0).toUpperCase() + period.slice(1);

  useEffect(() => {
    isMounted.current = true;
    (async () => {
      const { data } = await supabase
        .from('noise_readings')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(MAX_HISTORY);
      if (data && isMounted.current) {
        const sorted = [...data].reverse() as NoiseReading[];
        setHistory(sorted);
        setResult(sorted[sorted.length - 1] ?? null);
      }
    })();
    return () => { isMounted.current = false; };
  }, []);

  const handleAnalyze = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError('');

    const noise = parseFloat(inputValue);
    if (isNaN(noise)) { setInputError('Please enter a valid number.'); return; }
    if (noise < 0 || noise > 200) { setInputError('Enter a value between 0 and 200 dB.'); return; }

    setLoading(true);
    const { period: p, safeLimit: sl, status, recommendation } = analyzeReading(noise);

    const row = {
      noise_level: noise,
      safe_limit: sl,
      time_period: p,
      status,
      ai_recommendation: recommendation,
    };

    const { data, error } = await supabase.from('noise_readings').insert(row).select().maybeSingle();
    if (!isMounted.current) return;

    const newReading: NoiseReading = error
      ? { id: Date.now(), ...row, recorded_at: new Date().toISOString() }
      : (data as NoiseReading);

    setResult(newReading);
    setHistory(prev => [...prev.slice(-MAX_HISTORY + 1), newReading]);
    setLoading(false);
    setInputValue('');
  }, [inputValue]);

  const meta = result ? STATUS_META[result.status] : null;

  const stats = history.length ? {
    avg: (history.reduce((s, r) => s + r.noise_level, 0) / history.length).toFixed(1),
    max: Math.max(...history.map(r => r.noise_level)).toFixed(1),
    total: history.length,
    alerts: history.filter(r => r.status === 'High' || r.status === 'Dangerous').length,
  } : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Noise Analyzer</h1>
          <p className="text-slate-400 text-xs mt-0.5">Enter a noise level to get an instant AI analysis</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/40 rounded-lg px-3 py-2">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-300 capitalize">{periodLabel}</span>
          <span className="text-xs text-slate-500">•</span>
          <span className="text-xs text-slate-300">Limit: {safeLimit} dB</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Input + Result panel */}
        <div className="space-y-4">
          {/* Input card */}
          <div className="bg-slate-900/80 border border-slate-700/40 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Brain className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">Enter Noise Level</h2>
            </div>

            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                  Noise Value (dB)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={200}
                    step={0.1}
                    value={inputValue}
                    onChange={e => { setInputValue(e.target.value); setInputError(''); }}
                    placeholder="e.g. 72"
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3.5 text-white text-xl font-bold placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium pointer-events-none">dB</span>
                </div>
                {inputError && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {inputError}
                  </p>
                )}
              </div>

              {/* Quick presets */}
              <div>
                <p className="text-xs text-slate-500 mb-2">Quick values</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {[30, 55, 75, 95].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => { setInputValue(String(v)); setInputError(''); }}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-lg py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !inputValue}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold rounded-xl py-3.5 text-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-900/40 border-t-slate-900 rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Analyze
                  </>
                )}
              </button>
            </form>

            {/* Safe limits reference */}
            <div className="mt-5 pt-5 border-t border-slate-800">
              <p className="text-xs text-slate-500 mb-2.5">Safe limits by time</p>
              <div className="space-y-1.5">
                {[
                  { label: 'Morning', time: '6–12', limit: 60, active: period === 'morning' },
                  { label: 'Afternoon', time: '12–17', limit: 70, active: period === 'afternoon' },
                  { label: 'Evening', time: '17–21', limit: 55, active: period === 'evening' },
                  { label: 'Night', time: '21–6', limit: 45, active: period === 'night' },
                ].map(p => (
                  <div key={p.label} className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${p.active ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-slate-800/50'}`}>
                    <span className={p.active ? 'text-cyan-400 font-medium' : 'text-slate-400'}>{p.label} <span className="text-slate-600">({p.time}h)</span></span>
                    <span className={`font-bold ${p.active ? 'text-cyan-400' : 'text-slate-300'}`}>{p.limit} dB</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Result + chart column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Result card */}
          {result ? (
            <div className={`bg-slate-900/80 border rounded-2xl p-6 ${meta!.border}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                {/* Gauge + numbers */}
                <div className="flex items-center gap-6">
                  <GaugeMeter value={result.noise_level} limit={result.safe_limit} />
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500">Current Noise</p>
                      <p className="text-3xl font-bold text-white">{result.noise_level.toFixed(1)} <span className="text-base text-slate-400">dB</span></p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Safe Limit</p>
                      <p className="text-xl font-bold text-slate-300">{result.safe_limit} <span className="text-sm text-slate-500">dB</span></p>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-bold ${meta!.bg} ${meta!.color} ${meta!.border}`}>
                      <div className={`w-2.5 h-2.5 rounded-full ${meta!.dot} ${result.status === 'Dangerous' || result.status === 'High' ? 'animate-pulse' : ''}`} />
                      {result.status}
                    </div>
                  </div>
                </div>

                {/* AI Recommendation */}
                <div className={`flex-1 min-w-[200px] rounded-xl p-4 border ${meta!.bg} ${meta!.border}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className={`w-4 h-4 ${meta!.color}`} />
                    <span className={`text-xs font-semibold uppercase tracking-wider ${meta!.color}`}>AI Recommendation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    {result.status === 'Safe' || result.status === 'Moderate'
                      ? <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${meta!.color}`} />
                      : <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${meta!.color}`} />}
                    <p className={`text-sm leading-relaxed ${meta!.color}`}>{result.ai_recommendation}</p>
                  </div>

                  {result.noise_level > result.safe_limit && (
                    <div className="mt-3 pt-3 border-t border-current/10">
                      <p className={`text-xs ${meta!.color} opacity-70`}>
                        Exceeds limit by <span className="font-bold">{(result.noise_level - result.safe_limit).toFixed(1)} dB</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/80 border border-slate-700/40 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center">
                <Activity className="w-7 h-7 text-slate-600" />
              </div>
              <p className="text-slate-400 font-medium">No analysis yet</p>
              <p className="text-slate-600 text-sm">Enter a noise value on the left and click Analyze.</p>
            </div>
          )}

          {/* Chart */}
          <div className="bg-slate-900/80 border border-slate-700/40 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-white">History Trend</span>
              </div>
              <span className="text-xs text-slate-500">{history.length} readings</span>
            </div>
            <NoiseChart readings={history} height={220} />
          </div>
        </div>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Readings', value: stats.total, icon: Activity, color: 'text-cyan-400' },
            { label: 'Average Level', value: `${stats.avg} dB`, icon: TrendingUp, color: 'text-blue-400' },
            { label: 'Peak Level', value: `${stats.max} dB`, icon: Zap, color: 'text-orange-400' },
            { label: 'Alert Events', value: stats.alerts, icon: AlertTriangle, color: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900/80 border border-slate-700/40 rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-sm font-bold text-white">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History table */}
      <div className="bg-slate-900/80 border border-slate-700/40 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700/40 flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold text-white">Reading History</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800">
                {['Time', 'Level', 'Limit', 'Excess', 'Period', 'Status'].map(h => (
                  <th key={h} className="text-left py-3 px-5 text-slate-500 font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...history].reverse().slice(0, 15).map((r, i) => {
                const m = STATUS_META[r.status];
                const excess = r.noise_level - r.safe_limit;
                return (
                  <tr key={r.id} className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${i === 0 ? 'bg-slate-800/20' : ''}`}>
                    <td className="py-3 px-5 text-slate-400 font-mono">
                      {new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-5 font-bold text-white">{r.noise_level.toFixed(1)} dB</td>
                    <td className="py-3 px-5 text-slate-400">{r.safe_limit} dB</td>
                    <td className={`py-3 px-5 font-medium ${excess > 0 ? m.color : 'text-emerald-400'}`}>
                      {excess > 0 ? `+${excess.toFixed(1)}` : `${excess.toFixed(1)}`} dB
                    </td>
                    <td className="py-3 px-5 text-slate-400 capitalize">{r.time_period}</td>
                    <td className="py-3 px-5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${m.bg} ${m.color} ${m.border}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
                        {r.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {history.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-sm">No readings yet — enter a value above to begin.</div>
          )}
        </div>
      </div>
    </div>
  );
}
