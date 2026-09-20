import { useEffect, useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, AlertTriangle, CheckCircle, BarChart2 } from 'lucide-react';
import { supabase, type NoiseReading } from '@/lib/supabase';
import { STATUS_META, type AlertStatus } from '@/lib/aiEngine';

function groupByPeriod(readings: NoiseReading[]) {
  const groups: Record<string, NoiseReading[]> = { morning: [], afternoon: [], evening: [], night: [] };
  readings.forEach(r => { if (groups[r.time_period]) groups[r.time_period].push(r); });
  return groups;
}

function PeriodBar({ label, readings, limit }: { label: string; readings: NoiseReading[]; limit: number }) {
  if (!readings.length) return null;
  const avg = readings.reduce((s, r) => s + r.noise_level, 0) / readings.length;
  const pct = Math.min(100, (avg / (limit * 2)) * 100);
  const limitPct = Math.min(100, (limit / (limit * 2)) * 100);
  const status: AlertStatus = avg <= limit ? 'Safe' : avg <= limit + 10 ? 'Moderate' : avg <= limit + 20 ? 'High' : 'Dangerous';
  const meta = STATUS_META[status];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400 capitalize font-medium">{label}</span>
        <span className="text-white font-bold">{avg.toFixed(1)} dB <span className="text-slate-500 font-normal">avg</span></span>
      </div>
      <div className="relative h-2.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700`}
          style={{ width: `${pct}%`, background: pct > limitPct ? meta.dot.replace('bg-', '') : '#34d399' }}
        />
        <div className="absolute top-0 h-full w-px bg-slate-500/60" style={{ left: `${limitPct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-slate-600">
        <span>0 dB</span>
        <span className="text-slate-500">limit: {limit} dB</span>
        <span>{(limit * 2).toFixed(0)} dB</span>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [readings, setReadings] = useState<NoiseReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'today' | 'week'>('today');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const since = new Date();
      if (range === 'today') since.setHours(0, 0, 0, 0);
      else since.setDate(since.getDate() - 7);

      const { data } = await supabase
        .from('noise_readings')
        .select('*')
        .gte('recorded_at', since.toISOString())
        .order('recorded_at', { ascending: true });
      setReadings((data ?? []) as NoiseReading[]);
      setLoading(false);
    })();
  }, [range]);

  const groups = groupByPeriod(readings);
  const limits: Record<string, number> = { morning: 60, afternoon: 70, evening: 55, night: 45 };

  const statusCounts = readings.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = readings.length;
  const avg = total ? (readings.reduce((s, r) => s + r.noise_level, 0) / total) : 0;
  const peak = total ? Math.max(...readings.map(r => r.noise_level)) : 0;
  const alertCount = (statusCounts['High'] ?? 0) + (statusCounts['Dangerous'] ?? 0);

  const handleExport = () => {
    const lines = ['Time,Level (dB),Limit (dB),Period,Status,Recommendation'];
    readings.forEach(r => {
      lines.push([
        new Date(r.recorded_at).toLocaleString(),
        r.noise_level.toFixed(1),
        r.safe_limit,
        r.time_period,
        r.status,
        `"${r.ai_recommendation.replace(/"/g, '""')}"`,
      ].join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noiseguard-report-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Reports</h1>
          <p className="text-slate-400 text-xs mt-0.5">Noise analysis summaries and exports</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800/60 border border-slate-700/40 rounded-xl p-1">
            {(['today', 'week'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  range === r ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {r === 'today' ? 'Today' : '7 Days'}
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            disabled={!readings.length}
            className="flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-xs font-medium rounded-xl px-3 py-2.5 transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Readings', value: total, icon: FileText, color: 'text-cyan-400' },
              { label: 'Average Level', value: `${avg.toFixed(1)} dB`, icon: TrendingUp, color: 'text-blue-400' },
              { label: 'Peak Level', value: `${peak.toFixed(1)} dB`, icon: BarChart2, color: 'text-orange-400' },
              { label: 'Alert Events', value: alertCount, icon: AlertTriangle, color: 'text-red-400' },
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Status distribution */}
            <div className="bg-slate-900/80 border border-slate-700/40 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Status Distribution</h2>
              {total === 0 ? (
                <p className="text-slate-500 text-sm py-4">No data for this period.</p>
              ) : (
                <div className="space-y-3">
                  {(['Safe', 'Moderate', 'High', 'Dangerous'] as AlertStatus[]).map(s => {
                    const count = statusCounts[s] ?? 0;
                    const pct = total ? ((count / total) * 100) : 0;
                    const meta = STATUS_META[s];
                    return (
                      <div key={s}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${meta.dot}`} />
                            <span className="text-slate-400">{s}</span>
                          </div>
                          <span className={`font-bold ${meta.color}`}>{count} ({pct.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${meta.dot}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Per-period averages */}
            <div className="bg-slate-900/80 border border-slate-700/40 rounded-2xl p-5 space-y-5">
              <h2 className="text-sm font-semibold text-white">Average by Time Period</h2>
              {total === 0 ? (
                <p className="text-slate-500 text-sm py-4">No data for this period.</p>
              ) : (
                <div className="space-y-5">
                  {Object.entries(groups).map(([period, rs]) =>
                    rs.length > 0 && (
                      <PeriodBar
                        key={period}
                        label={period}
                        readings={rs}
                        limit={limits[period]}
                      />
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* AI summary */}
          {total > 0 && (
            <div className={`rounded-2xl p-5 border ${alertCount > 0 ? 'bg-red-500/5 border-red-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
              <div className="flex items-start gap-3">
                {alertCount > 0
                  ? <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  : <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
                <div>
                  <h3 className={`font-semibold text-sm mb-1 ${alertCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    AI Report Summary
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {alertCount > 0
                      ? `During this period, ${alertCount} out of ${total} readings exceeded safe thresholds. `
                        + `The peak noise level reached ${peak.toFixed(1)} dB. `
                        + `Consistent monitoring and noise reduction measures are recommended.`
                      : `All ${total} readings recorded during this period remained within safe noise limits. `
                        + `The average level of ${avg.toFixed(1)} dB indicates a healthy acoustic environment.`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recent alerts table */}
          {alertCount > 0 && (
            <div className="bg-slate-900/80 border border-slate-700/40 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/40 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm font-semibold text-white">Alert Events</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-800">
                      {['Time', 'Level', 'Limit', 'Excess', 'Status'].map(h => (
                        <th key={h} className="text-left py-3 px-5 text-slate-500 font-medium uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {readings.filter(r => r.status === 'High' || r.status === 'Dangerous').slice(-15).reverse().map(r => {
                      const m = STATUS_META[r.status];
                      const excess = (r.noise_level - r.safe_limit).toFixed(1);
                      return (
                        <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-5 text-slate-400 font-mono">
                            {new Date(r.recorded_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3 px-5 font-bold text-white">{r.noise_level.toFixed(1)} dB</td>
                          <td className="py-3 px-5 text-slate-400">{r.safe_limit} dB</td>
                          <td className={`py-3 px-5 font-bold ${m.color}`}>+{excess} dB</td>
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
              </div>
            </div>
          )}

          {total === 0 && (
            <div className="text-center py-16">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No readings found for this period.</p>
              <p className="text-slate-500 text-sm mt-1">Visit the Dashboard to start collecting data.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
