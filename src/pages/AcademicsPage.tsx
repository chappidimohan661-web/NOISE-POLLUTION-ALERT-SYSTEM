import { useState } from 'react';
import {
  BookOpen, Zap, Code2, Brain, Wifi, Globe, Database, BarChart2,
  ChevronDown, ChevronUp, GraduationCap, Lightbulb, Mic2, CheckCircle2,
} from 'lucide-react';

const SUBJECTS = [
  {
    name: 'Engineering Physics',
    icon: Zap,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    dot: 'bg-amber-400',
    topics: ['Sound Waves', 'Noise Pollution', 'Decibel (dB)', 'Wave Propagation'],
    mapping: 'Study of sound, noise, and decibel measurement forms the scientific foundation of this project.',
  },
  {
    name: 'Basic Electrical Engineering',
    icon: Zap,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    dot: 'bg-yellow-400',
    topics: ['Sensors', 'Voltage', 'Current', 'Arduino / ESP32', 'Circuit Connections'],
    mapping: 'Interfacing the sound sensor (KY-038 / MAX9814) with Arduino / ESP32 for data acquisition.',
  },
  {
    name: 'Programming for Problem Solving',
    icon: Code2,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    dot: 'bg-blue-400',
    topics: ['Variables', 'Functions', 'Conditional Statements', 'Loops', 'File Handling', 'Serial Communication'],
    mapping: 'Reading sensor values, processing data, and communicating with the web application using Python.',
  },
  {
    name: 'Artificial Intelligence',
    icon: Brain,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    dot: 'bg-cyan-400',
    topics: ['Rule-Based Decision Making', 'Noise Level Classification', 'Threshold Analysis', 'Basic AI Logic'],
    mapping: 'Analysing noise levels against time-aware safe limits and generating intelligent alert recommendations.',
  },
  {
    name: 'Internet of Things (IoT)',
    icon: Wifi,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-400',
    topics: ['Sound Sensor', 'Data Acquisition', 'Sensor Interfacing', 'Real-Time Monitoring'],
    mapping: 'Sending sensor data automatically to the web application for live monitoring and alerts.',
  },
  {
    name: 'Web Development',
    icon: Globe,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    dot: 'bg-violet-400',
    topics: ['Flask / React', 'HTML', 'CSS', 'JavaScript', 'Dashboard Design'],
    mapping: 'Displaying live noise data, alerts, and recommendations on a real-time interactive dashboard.',
  },
  {
    name: 'Database Management',
    icon: Database,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    dot: 'bg-orange-400',
    topics: ['SQLite / Supabase', 'Data Storage', 'Reports', 'History Logs'],
    mapping: 'Storing every noise reading with timestamp, status, and AI recommendation for reports and audits.',
  },
  {
    name: 'Data Visualisation',
    icon: BarChart2,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    dot: 'bg-pink-400',
    topics: ['Charts', 'Graphs', 'Live Dashboard', 'Statistics'],
    mapping: 'Rendering trend charts, status distribution graphs, and statistical summaries on the dashboard.',
  },
];

const VIVA_TOPICS = [
  { category: 'Physics', items: ['Noise Pollution', 'Decibel (dB)', 'Sound Waves', 'Wave Propagation'], color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { category: 'Electronics', items: ['Sound Sensor (KY-038 / MAX9814)', 'Arduino / ESP32', 'Circuit Interfacing', 'Serial Communication'], color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  { category: 'Programming', items: ['Python Basics', 'Conditional Logic', 'Functions & Loops', 'File Handling'], color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { category: 'AI Logic', items: ['AI-Based Threshold Detection', 'Rule-Based Classification', 'Safe / Moderate / High / Dangerous', 'Time-Aware Limits'], color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  { category: 'IoT', items: ['Sensor Data Acquisition', 'Real-Time Monitoring', 'Serial-to-Web Pipeline', 'Edge Sensing'], color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { category: 'Web & Database', items: ['Flask Web Framework', 'Dashboard Design', 'SQLite Database', 'Report Generation', 'Alert System'], color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
];

const FLOW_STEPS = [
  { label: 'Sound Sensor', sub: 'KY-038 / MAX9814', icon: Mic2, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { label: 'Arduino / ESP32', sub: 'Reads sensor value', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  { label: 'Python', sub: 'Serial communication', icon: Code2, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { label: 'AI Engine', sub: 'Threshold analysis', icon: Brain, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  { label: 'Web Dashboard', sub: 'Live display + alerts', icon: Globe, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { label: 'Database', sub: 'Storage + reports', icon: Database, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
];

const SAFE_LIMITS = [
  { period: 'Morning',   time: '6:00 – 12:00',  limit: 60, color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  { period: 'Afternoon', time: '12:00 – 17:00', limit: 70, color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20' },
  { period: 'Evening',   time: '17:00 – 21:00', limit: 55, color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
  { period: 'Night',     time: '21:00 – 6:00',  limit: 45, color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20' },
];

function SubjectCard({ subject, index }: { subject: typeof SUBJECTS[0]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`bg-slate-900/80 border rounded-2xl overflow-hidden transition-all duration-200 ${subject.border} hover:shadow-lg`}>
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left p-5 flex items-start justify-between gap-4"
      >
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl ${subject.bg} border ${subject.border} flex items-center justify-center shrink-0 mt-0.5`}>
            <subject.icon className={`w-5 h-5 ${subject.color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold uppercase tracking-wider ${subject.color}`}>
                Subject {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white">{subject.name}</h3>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {subject.topics.map(t => (
                <span key={t} className={`text-xs px-2 py-0.5 rounded-full border ${subject.bg} ${subject.color} ${subject.border} opacity-80`}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="shrink-0 text-slate-500 mt-1">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>
      {expanded && (
        <div className={`px-5 pb-5 pt-0`}>
          <div className={`rounded-xl p-4 border ${subject.bg} ${subject.border}`}>
            <div className="flex items-start gap-2">
              <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${subject.color}`} />
              <p className={`text-sm leading-relaxed ${subject.color}`}>{subject.mapping}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AcademicsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">

      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mx-auto">
          <GraduationCap className="w-7 h-7 text-cyan-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Academic Reference</h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
          Subjects, topics, project mapping, and viva preparation guide for the
          JNTUK R23 Semester-I interdisciplinary mini project.
        </p>
        <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 text-xs text-cyan-400 font-medium">
          <BookOpen className="w-3 h-3" />
          JNTUK R23 — First Year Engineering — Semester I
        </div>
      </div>

      {/* Project flow */}
      <div className="bg-slate-900/80 border border-slate-700/40 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <Wifi className="w-4 h-4 text-cyan-400" /> Complete Project Flow
        </h2>
        <p className="text-xs text-slate-500 mb-6">How all subjects connect in the real system</p>
        <div className="flex flex-wrap items-stretch justify-center gap-2">
          {FLOW_STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className={`${step.bg} border ${step.border} rounded-2xl p-4 flex flex-col items-center gap-2 min-w-[100px] max-w-[120px]`}>
                <div className={`w-10 h-10 rounded-xl bg-slate-900/60 flex items-center justify-center`}>
                  <step.icon className={`w-5 h-5 ${step.color}`} />
                </div>
                <p className={`text-xs font-semibold text-center ${step.color}`}>{step.label}</p>
                <p className="text-xs text-slate-500 text-center leading-tight">{step.sub}</p>
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <span className="text-slate-600 text-xl font-light hidden sm:block">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Threshold reference */}
      <div className="bg-slate-900/80 border border-slate-700/40 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700/40">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Brain className="w-4 h-4 text-cyan-400" /> AI Safety Threshold Table
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Core AI logic — time-based safe noise limits used for classification</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {['Time Period', 'Hours', 'Safe Limit', 'AI Decision Logic'].map(h => (
                  <th key={h} className="text-left py-3 px-5 text-slate-500 text-xs font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SAFE_LIMITS.map(row => (
                <tr key={row.period} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 px-5">
                    <span className={`font-semibold ${row.color}`}>{row.period}</span>
                  </td>
                  <td className="py-4 px-5 text-slate-400 font-mono text-xs">{row.time}</td>
                  <td className="py-4 px-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg font-bold text-sm border ${row.bg} ${row.color} ${row.border}`}>
                      {row.limit} dB
                    </span>
                  </td>
                  <td className="py-4 px-5 text-slate-400 text-xs leading-relaxed">
                    If noise &gt; {row.limit} dB → Moderate | &gt; {row.limit + 10} dB → High | &gt; {row.limit + 20} dB → Dangerous
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subjects */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">Subjects &amp; Topics Covered</h2>
        </div>
        <p className="text-xs text-slate-500 mb-5">Click any subject card to see how it maps to the project</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SUBJECTS.map((s, i) => (
            <SubjectCard key={s.name} subject={s} index={i} />
          ))}
        </div>
      </div>

      {/* Full mapping table */}
      <div className="bg-slate-900/80 border border-slate-700/40 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700/40">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-cyan-400" /> Project Mapping at a Glance
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800">
                {['Subject', 'Topics Covered', 'Role in Project'].map(h => (
                  <th key={h} className="text-left py-3 px-5 text-slate-500 font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SUBJECTS.map(s => (
                <tr key={s.name} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                      <span className={`font-semibold ${s.color}`}>{s.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex flex-wrap gap-1">
                      {s.topics.map(t => (
                        <span key={t} className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-xs">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-5 text-slate-400 leading-relaxed max-w-xs">{s.mapping}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Viva topics */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Mic2 className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">Main Topics for Viva</h2>
        </div>
        <p className="text-xs text-slate-500 mb-5">Organised by subject — review these before your examination</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {VIVA_TOPICS.map(cat => (
            <div key={cat.category} className={`bg-slate-900/80 border rounded-2xl p-5 ${cat.border}`}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-2 h-2 rounded-full ${cat.bg.replace('/10', '/80')}`} style={{ background: '' }}>
                  <div className={`w-2 h-2 rounded-full`} style={{ background: cat.color.replace('text-', '').includes('amber') ? '#fbbf24' : cat.color.includes('yellow') ? '#facc15' : cat.color.includes('blue') ? '#60a5fa' : cat.color.includes('cyan') ? '#22d3ee' : cat.color.includes('emerald') ? '#34d399' : '#a78bfa' }} />
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${cat.color}`}>{cat.category}</span>
              </div>
              <ul className="space-y-2">
                {cat.items.map(item => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${cat.color} opacity-70`} />
                    <span className="text-slate-300 text-xs">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Integration badge */}
      <div className="bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-violet-500/5 border border-cyan-500/15 rounded-2xl p-6 text-center">
        <p className="text-slate-300 text-sm leading-relaxed max-w-2xl mx-auto">
          This project demonstrates the integration of <span className="text-cyan-400 font-semibold">Physics</span> +{' '}
          <span className="text-yellow-400 font-semibold">Electrical Engineering</span> +{' '}
          <span className="text-blue-400 font-semibold">Programming</span> +{' '}
          <span className="text-cyan-400 font-semibold">AI</span> +{' '}
          <span className="text-emerald-400 font-semibold">IoT</span> +{' '}
          <span className="text-violet-400 font-semibold">Web Development</span> +{' '}
          <span className="text-orange-400 font-semibold">Database</span> — covering all interdisciplinary pillars of the JNTUK R23 first-year curriculum.
        </p>
      </div>

      <p className="text-center text-xs text-slate-600 pb-4">NoiseGuard AI — JNTUK R23 Semester-I Mini Project</p>
    </div>
  );
}
