import {
  Activity, Cpu, Database, Brain, Wifi, Shield, BookOpen, Zap,
  AlertTriangle, CheckCircle2, Target, Layers, Code2, Globe,
  BarChart2, Lock, FileText, Clock, Info, Users, HelpCircle,
} from 'lucide-react';

/* ── Data ─────────────────────────────────────────────────────── */

const PERIODS = [
  { period: 'Morning',   time: '6:00 – 12:00',  limit: 60, color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
  { period: 'Afternoon', time: '12:00 – 17:00', limit: 70, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { period: 'Evening',   time: '17:00 – 21:00', limit: 55, color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
  { period: 'Night',     time: '21:00 – 6:00',  limit: 45, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
];

const ALERT_LEVELS = [
  { status: 'Safe',      dot: 'bg-emerald-400', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', range: 'At or below safe limit',        desc: 'The environment is healthy. No action required.' },
  { status: 'Moderate',  dot: 'bg-yellow-400',  color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20',  range: '1 – 10 dB above limit',          desc: 'Consider reducing nearby sound sources to prevent discomfort.' },
  { status: 'High',      dot: 'bg-orange-400',  color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20',  range: '11 – 20 dB above limit',         desc: 'Prolonged exposure may cause hearing fatigue. Reduce noise immediately.' },
  { status: 'Dangerous', dot: 'bg-red-500',     color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     range: 'More than 20 dB above limit',    desc: 'Critical health risk. Immediate intervention required.' },
];

const FEATURES = [
  { icon: Brain,     color: 'text-cyan-400',    title: 'AI-Based Threshold Analysis',  desc: 'The AI engine compares every reading against a time-aware safe limit and instantly classifies it as Safe, Moderate, High, or Dangerous — no manual rules to configure.' },
  { icon: Clock,     color: 'text-amber-400',   title: 'Time-Aware Safe Limits',       desc: 'Safe noise limits automatically change throughout the day — stricter at night when people sleep, more relaxed in the afternoon when activity is higher.' },
  { icon: Activity,  color: 'text-blue-400',    title: 'Live Noise Input',             desc: 'Enter any noise value in decibels and receive an instant AI analysis with a colour-coded gauge, status badge, and detailed recommendation.' },
  { icon: BarChart2, color: 'text-violet-400',  title: 'Trend Chart',                  desc: 'Every submitted reading is plotted on a live line chart so you can visually track how noise levels have changed over time.' },
  { icon: Database,  color: 'text-orange-400',  title: 'Persistent Database',          desc: 'All readings are saved to a PostgreSQL database (Supabase). Nothing is lost when you close the browser — full history is always available.' },
  { icon: FileText,  color: 'text-emerald-400', title: 'Reports & CSV Export',         desc: 'The Reports page summarises readings by time period, shows status distribution, highlights alert events, and lets you download everything as a CSV file.' },
  { icon: Lock,      color: 'text-slate-300',   title: 'Role-Based Login',             desc: 'Two access roles — Admin and User — protect the system. Only logged-in users can submit readings or view reports.' },
  { icon: Globe,     color: 'text-pink-400',    title: 'Fully Responsive Design',      desc: 'The interface works on desktops, tablets, and phones. Every page adapts its layout to fit the screen size automatically.' },
];

const TOOLS = [
  {
    category: 'Frontend',
    color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20',
    icon: Globe,
    items: [
      { name: 'React 18',      role: 'UI framework',         detail: 'Builds the interactive dashboard, charts, and forms using reusable components and real-time state.' },
      { name: 'TypeScript',    role: 'Type-safe JavaScript', detail: 'Prevents bugs by enforcing strict data types throughout the entire codebase.' },
      { name: 'Tailwind CSS',  role: 'Styling system',       detail: 'Utility-first CSS framework that enables consistent spacing, colours, and responsive layouts without writing custom CSS.' },
      { name: 'Vite',          role: 'Build tool',           detail: 'Extremely fast development server and production bundler. Hot-reloads the browser instantly on every code change.' },
      { name: 'Canvas API',    role: 'Live chart rendering',  detail: 'Native browser drawing API used to render the real-time noise trend chart — no third-party chart library needed.' },
      { name: 'Lucide React',  role: 'Icon library',         detail: 'Clean, consistent SVG icons used throughout the navigation, cards, and status indicators.' },
    ],
  },
  {
    category: 'Backend & Database',
    color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20',
    icon: Database,
    items: [
      { name: 'Supabase',      role: 'Backend-as-a-Service', detail: 'Provides a hosted PostgreSQL database, REST API, and authentication — all without writing a separate server.' },
      { name: 'PostgreSQL',    role: 'Relational database',  detail: 'Stores every noise reading with its timestamp, dB value, safe limit, status, and AI recommendation.' },
      { name: 'Row Level Security', role: 'Data protection', detail: 'Database-level access rules ensure that only authorised clients can read or write noise data.' },
      { name: 'REST API',      role: 'Data transport',       detail: 'Supabase auto-generates a secure REST API so the frontend can insert and query readings without SQL knowledge.' },
    ],
  },
  {
    category: 'AI & Logic',
    color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20',
    icon: Brain,
    items: [
      { name: 'Rule-Based AI', role: 'Decision engine',      detail: 'Time-aware threshold logic that classifies noise levels into four alert categories based on the hour of the day.' },
      { name: 'Dynamic Thresholds', role: 'Smart limits',    detail: 'Safe limits shift automatically — 60 dB mornings, 70 dB afternoons, 55 dB evenings, 45 dB nights.' },
      { name: 'NL Recommendations', role: 'AI output',       detail: 'The AI generates a specific, plain-English recommendation for every reading based on how far it exceeds (or stays within) the limit.' },
    ],
  },
  {
    category: 'Security & Auth',
    color: 'text-slate-300', bg: 'bg-slate-700/20', border: 'border-slate-700/40',
    icon: Lock,
    items: [
      { name: 'Credential Auth', role: 'Login system',       detail: 'Username and password-based login protects the system. Two demo roles (Admin, User) are pre-configured.' },
      { name: 'Protected Routes', role: 'Access control',    detail: 'All pages except Login are hidden until the user authenticates. The router enforces this on every render.' },
      { name: 'Role Display',    role: 'User identity',      detail: 'The navbar shows the logged-in username and role badge so the current session is always visible.' },
    ],
  },
];

const HOW_IT_WORKS = [
  { step: '01', icon: Users,    color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20',   title: 'User Logs In',         desc: 'Enter username and password on the login screen. Admin or User role determines access.' },
  { step: '02', icon: Activity, color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   title: 'Enter Noise Value',    desc: 'Type a noise level in decibels (0–200 dB) into the input field on the Dashboard.' },
  { step: '03', icon: Brain,    color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', title: 'AI Analyses the Input', desc: 'The engine detects the current time period, fetches its safe limit, and classifies the reading.' },
  { step: '04', icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', title: 'Alert is Displayed', desc: 'A colour-coded gauge, status badge, and AI recommendation appear instantly.' },
  { step: '05', icon: Database, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', title: 'Reading is Saved',   desc: 'The result is persisted to the database with a timestamp for future reporting.' },
  { step: '06', icon: BarChart2, color: 'text-pink-400',  bg: 'bg-pink-500/10',   border: 'border-pink-500/20',   title: 'View Reports',         desc: 'The Reports page shows history, statistics, status charts, and a one-click CSV export.' },
];

const OBJECTIVES = [
  'Detect and classify noise levels automatically using AI-based threshold logic.',
  'Apply time-aware safe limits that reflect real-world noise standards (morning, afternoon, evening, night).',
  'Provide instant, actionable recommendations to help reduce harmful noise exposure.',
  'Persist all readings to a database for trend analysis, reporting, and auditing.',
  'Demonstrate the integration of AI logic, web development, and database management in a single project.',
  'Serve as an educational reference covering Physics, Electrical Engineering, Programming, AI, IoT, and Web technologies.',
];

/* ── Component ─────────────────────────────────────────────────── */

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 border border-cyan-500/15 rounded-3xl p-8 sm:p-10 overflow-hidden text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-blue-500/5 rounded-full blur-3xl" />
        </div>
        <div className="relative space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mx-auto">
            <Activity className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">NoiseGuard AI</h1>
          <p className="text-slate-400 text-base max-w-2xl mx-auto leading-relaxed">
            An AI-based noise pollution alert system that accepts user-submitted noise readings,
            applies time-aware safety thresholds, and delivers instant classification and health recommendations.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-3 py-1 text-xs text-cyan-400 font-medium">
              <BookOpen className="w-3 h-3" /> JNTUK R23 Semester-I
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-800 border border-slate-700/40 rounded-full px-3 py-1 text-xs text-slate-300 font-medium">
              <Brain className="w-3 h-3 text-violet-400" /> AI + Web + Database
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-800 border border-slate-700/40 rounded-full px-3 py-1 text-xs text-slate-300 font-medium">
              <Shield className="w-3 h-3 text-emerald-400" /> Mini Project
            </span>
          </div>
        </div>
      </div>

      {/* ── About the Project ── */}
      <div className="bg-slate-900/80 border border-slate-700/40 rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Info className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-bold text-white">About the Project</h2>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed">
          <span className="text-white font-semibold">NoiseGuard AI</span> is a web-based noise pollution
          alert system built for the JNTUK R23 first-year engineering mini project. The core idea is
          simple: a user enters a noise level in decibels, and the system's AI engine immediately
          determines whether that level is safe based on the current time of day — then displays a
          clear status and health recommendation.
        </p>

        <p className="text-slate-400 text-sm leading-relaxed">
          Noise pollution is one of the most overlooked environmental hazards. Long-term exposure to
          sounds above 65–70 dB can cause hearing loss, sleep disorders, stress, and cardiovascular
          problems. Unlike visual pollution, noise is invisible — making automated monitoring and
          alerting systems extremely valuable for public health.
        </p>

        <p className="text-slate-400 text-sm leading-relaxed">
          This project demonstrates how a simple rule-based AI model, combined with a modern web
          frontend and a cloud database, can solve a real-world problem. Every component — from the
          login screen to the reports export — maps directly to subjects taught in the first-year
          engineering curriculum.
        </p>

        {/* Objectives */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Project Objectives</h3>
          </div>
          <ul className="space-y-2">
            {OBJECTIVES.map((obj, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-400 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                {obj}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── How It Works ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-bold text-white">How It Works</h2>
        </div>
        <p className="text-slate-500 text-xs mb-5">Six steps from login to report</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HOW_IT_WORKS.map(s => (
            <div key={s.step} className={`bg-slate-900/80 border rounded-2xl p-5 ${s.border} hover:shadow-lg transition-all`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center shrink-0`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <span className={`text-xs font-bold ${s.color} tracking-widest`}>STEP {s.step}</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1.5">{s.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── AI Thresholds ── */}
      <div className="bg-slate-900/80 border border-slate-700/40 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700/40">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">AI Safety Thresholds</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Safe limits change automatically based on the time of day</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-800">
          {PERIODS.map(p => (
            <div key={p.period} className={`p-5 ${p.bg}`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${p.color} mb-1`}>{p.period}</p>
              <p className="text-slate-400 text-xs mb-3">{p.time}</p>
              <p className="text-2xl font-bold text-white">{p.limit}<span className="text-sm text-slate-400 ml-1">dB</span></p>
              <p className="text-xs text-slate-500 mt-0.5">safe limit</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Alert Levels ── */}
      <div className="bg-slate-900/80 border border-slate-700/40 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white">Alert Level Classification</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ALERT_LEVELS.map(a => (
            <div key={a.status} className={`flex items-start gap-3 rounded-xl p-4 border ${a.bg} ${a.border}`}>
              <div className={`w-3 h-3 rounded-full ${a.dot} shrink-0 mt-1`} />
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`text-sm font-bold ${a.color}`}>{a.status}</span>
                  <span className={`text-xs font-medium ${a.color} opacity-60`}>{a.range}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-bold text-white">Key Features</h2>
        </div>
        <p className="text-slate-500 text-xs mb-5">Everything included in this project</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-slate-900/80 border border-slate-700/40 rounded-xl p-5 hover:border-slate-600/50 transition-colors group">
              <div className="w-9 h-9 rounded-xl bg-slate-800 group-hover:bg-slate-700/60 flex items-center justify-center mb-3 transition-colors">
                <f.icon className={`w-4 h-4 ${f.color}`} />
              </div>
              <h3 className="text-xs font-semibold text-white mb-1.5 leading-snug">{f.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── What We Used ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-bold text-white">What We Used in This Project</h2>
        </div>
        <p className="text-slate-500 text-xs mb-5">Every tool, library, and service — and exactly why it was chosen</p>
        <div className="space-y-5">
          {TOOLS.map(cat => (
            <div key={cat.category} className={`bg-slate-900/80 border rounded-2xl overflow-hidden ${cat.border}`}>
              {/* Category header */}
              <div className={`px-5 py-3.5 border-b ${cat.border} ${cat.bg} flex items-center gap-2`}>
                <cat.icon className={`w-4 h-4 ${cat.color}`} />
                <span className={`text-xs font-bold uppercase tracking-wider ${cat.color}`}>{cat.category}</span>
              </div>
              {/* Items */}
              <div className="divide-y divide-slate-800/60">
                {cat.items.map(item => (
                  <div key={item.name} className="px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-6 hover:bg-slate-800/20 transition-colors">
                    <div className="sm:w-44 shrink-0">
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      <p className={`text-xs mt-0.5 ${cat.color} opacity-70`}>{item.role}</p>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── System Architecture ── */}
      <div className="bg-slate-900/80 border border-slate-700/40 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white">System Architecture</h2>
        </div>
        <div className="flex flex-wrap items-stretch justify-center gap-3">
          {[
            { icon: Users,      label: 'User Input',    sub: 'Enter dB value',        color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20' },
            { icon: Brain,      label: 'AI Engine',     sub: 'Classify & recommend',  color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20' },
            { icon: Database,   label: 'Supabase DB',   sub: 'Save reading',          color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20' },
            { icon: Activity,   label: 'Dashboard',     sub: 'Gauge + chart',         color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
            { icon: Shield,     label: 'Alert System',  sub: 'Status + advice',       color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20' },
            { icon: FileText,   label: 'Reports',       sub: 'History + export',      color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center gap-3">
              <div className={`${step.bg} border ${step.border} rounded-2xl p-4 flex flex-col items-center gap-2 w-28`}>
                <div className={`w-10 h-10 rounded-xl bg-slate-900/60 flex items-center justify-center`}>
                  <step.icon className={`w-5 h-5 ${step.color}`} />
                </div>
                <p className={`text-xs font-semibold text-center ${step.color}`}>{step.label}</p>
                <p className="text-xs text-slate-500 text-center leading-tight">{step.sub}</p>
              </div>
              {i < arr.length - 1 && <span className="text-slate-700 text-xl font-light hidden sm:block">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer note ── */}
      <div className="bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-violet-500/5 border border-cyan-500/15 rounded-2xl p-6 text-center space-y-2">
        <p className="text-white font-semibold text-sm">JNTUK R23 — First Year Engineering — Semester I Mini Project</p>
        <p className="text-slate-400 text-xs leading-relaxed max-w-2xl mx-auto">
          This project integrates concepts from <span className="text-amber-400">Engineering Physics</span>,{' '}
          <span className="text-yellow-400">Basic Electrical Engineering</span>,{' '}
          <span className="text-blue-400">Python Programming</span>,{' '}
          <span className="text-cyan-400">Artificial Intelligence</span>,{' '}
          <span className="text-emerald-400">Internet of Things</span>,{' '}
          <span className="text-violet-400">Web Development</span>, and{' '}
          <span className="text-orange-400">Database Management</span> into a single working system.
        </p>
        <p className="text-slate-600 text-xs pt-1">NoiseGuard AI — AI-Based Noise Pollution Alert System</p>
      </div>

    </div>
  );
}
