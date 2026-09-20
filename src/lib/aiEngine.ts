import type { TimePeriod, AlertStatus } from './supabase';

export type { AlertStatus } from './supabase';

const SAFE_LIMITS: Record<TimePeriod, number> = {
  morning:   60,
  afternoon: 70,
  evening:   55,
  night:     45,
};

export function getTimePeriod(date: Date = new Date()): TimePeriod {
  const h = date.getHours();
  if (h >= 6  && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

export function getSafeLimit(period: TimePeriod): number {
  return SAFE_LIMITS[period];
}

export function getStatus(noise: number, limit: number): AlertStatus {
  const excess = noise - limit;
  if (excess <= 0)   return 'Safe';
  if (excess <= 10)  return 'Moderate';
  if (excess <= 20)  return 'High';
  return 'Dangerous';
}

export function getRecommendation(status: AlertStatus, period: TimePeriod, noise: number, limit: number): string {
  const excess = Math.round(noise - limit);
  const periodLabel = period.charAt(0).toUpperCase() + period.slice(1);
  switch (status) {
    case 'Safe':
      return `Noise level is within the ${periodLabel.toLowerCase()}-time safe limit of ${limit} dB. Environment is healthy — no action required.`;
    case 'Moderate':
      return `Noise is ${excess} dB above the ${periodLabel.toLowerCase()}-time limit of ${limit} dB. Consider reducing nearby sound sources to prevent prolonged exposure discomfort.`;
    case 'High':
      return `Noise is ${excess} dB above the ${periodLabel.toLowerCase()}-time limit of ${limit} dB. Prolonged exposure may cause hearing fatigue. Recommend immediate noise reduction measures.`;
    case 'Dangerous':
      return `CRITICAL — Noise is ${excess} dB above the ${periodLabel.toLowerCase()}-time safety limit of ${limit} dB. This level poses a serious health risk. Immediate intervention required to protect residents.`;
  }
}


export function analyzeReading(noiseLevel: number) {
  const period = getTimePeriod();
  const safeLimit = getSafeLimit(period);
  const status = getStatus(noiseLevel, safeLimit);
  const recommendation = getRecommendation(status, period, noiseLevel, safeLimit);
  return { period, safeLimit, status, recommendation };
}

export const STATUS_META: Record<AlertStatus, { color: string; bg: string; border: string; dot: string; label: string }> = {
  Safe:       { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-400', label: 'Safe' },
  Moderate:   { color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/30',  dot: 'bg-yellow-400',  label: 'Moderate' },
  High:       { color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/30',  dot: 'bg-orange-400',  label: 'High' },
  Dangerous:  { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/30',     dot: 'bg-red-500',     label: 'Dangerous' },
};
