import { useEffect, useRef } from 'react';
import type { NoiseReading } from '@/lib/supabase';
import { STATUS_META, type AlertStatus } from '@/lib/aiEngine';

interface Props {
  readings: NoiseReading[];
  height?: number;
}

const COLORS: Record<AlertStatus, string> = {
  Safe:      '#34d399',
  Moderate:  '#facc15',
  High:      '#fb923c',
  Dangerous: '#f87171',
};

export default function NoiseChart({ readings, height = 200 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || readings.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const PAD = { top: 16, right: 16, bottom: 36, left: 44 };
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top  - PAD.bottom;

    ctx.clearRect(0, 0, W, H);

    const levels = readings.map(r => r.noise_level);
    const limits  = readings.map(r => r.safe_limit);
    const maxVal  = Math.max(...levels, ...limits) + 10;
    const minVal  = Math.max(0, Math.min(...levels, ...limits) - 10);

    const xOf = (i: number) => PAD.left + (i / (readings.length - 1 || 1)) * plotW;
    const yOf = (v: number) => PAD.top  + (1 - (v - minVal) / (maxVal - minVal)) * plotH;

    // Grid lines
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const v  = minVal + ((maxVal - minVal) / steps) * i;
      const yy = yOf(v);
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(148,163,184,0.08)';
      ctx.lineWidth = 1;
      ctx.moveTo(PAD.left, yy);
      ctx.lineTo(W - PAD.right, yy);
      ctx.stroke();
      ctx.fillStyle = 'rgba(148,163,184,0.5)';
      ctx.font = `10px system-ui`;
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.round(v)}`, PAD.left - 6, yy + 3.5);
    }

    // Safe limit line (dashed)
    if (readings.length >= 2) {
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(148,163,184,0.3)';
      ctx.lineWidth = 1.5;
      readings.forEach((r, i) => {
        const x = xOf(i);
        const y = yOf(r.safe_limit);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Gradient fill
    if (readings.length >= 2) {
      const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + plotH);
      grad.addColorStop(0, 'rgba(6,182,212,0.25)');
      grad.addColorStop(1, 'rgba(6,182,212,0.01)');
      ctx.beginPath();
      ctx.moveTo(xOf(0), yOf(levels[0]));
      readings.forEach((r, i) => ctx.lineTo(xOf(i), yOf(r.noise_level)));
      ctx.lineTo(xOf(readings.length - 1), PAD.top + plotH);
      ctx.lineTo(PAD.left, PAD.top + plotH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Noise line
    if (readings.length >= 2) {
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      readings.forEach((r, i) => {
        const x = xOf(i);
        const y = yOf(r.noise_level);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.strokeStyle = 'rgba(6,182,212,0.9)';
      ctx.stroke();
    }

    // Dots
    readings.forEach((r, i) => {
      const x = xOf(i);
      const y = yOf(r.noise_level);
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = COLORS[r.status as AlertStatus];
      ctx.fill();
    });

    // X-axis labels (show every few)
    const step = Math.max(1, Math.floor(readings.length / 6));
    ctx.fillStyle = 'rgba(148,163,184,0.5)';
    ctx.font = `9px system-ui`;
    ctx.textAlign = 'center';
    readings.forEach((r, i) => {
      if (i % step !== 0 && i !== readings.length - 1) return;
      const x = xOf(i);
      const d = new Date(r.recorded_at);
      const label = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      ctx.fillText(label, x, H - 8);
    });
  }, [readings, height]);

  if (readings.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center">
        <p className="text-slate-500 text-sm">Waiting for readings…</p>
      </div>
    );
  }

  return (
    <div style={{ height }} className="relative w-full">
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} className="block" />
      {/* Legend */}
      <div className="absolute top-2 right-2 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-4 border-t border-dashed border-slate-400/40" />
          <span className="text-xs text-slate-500">Safe limit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 border-t-2 border-cyan-400/80" />
          <span className="text-xs text-slate-500">Noise</span>
        </div>
      </div>
      <div className="absolute top-2 left-10 flex items-center gap-1">
        {Object.entries(STATUS_META).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${v.dot}`} />
            <span className="text-xs text-slate-500">{k}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
