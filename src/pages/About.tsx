import { BookOpen, Code2, FlaskConical, Brain, Cpu, LayoutDashboard, GraduationCap } from 'lucide-react'
import { PageHeader } from '../components/Layout'

const subjectRows = [
  {
    subject: 'Programming',
    icon: Code2,
    color: '#0ea5e9',
    bg: '#e0f2fe',
    topic: 'Arrays',
    impl: 'Store students, attendance, and marks using lists and arrays for fast indexed access.',
  },
  {
    subject: 'Linear Algebra',
    icon: FlaskConical,
    color: '#14b8a6',
    bg: '#ccfbf1',
    topic: 'Matrices',
    impl: 'Represent attendance and marks as matrices for correlation and normalization analysis.',
  },
  {
    subject: 'Data Structures',
    icon: BookOpen,
    color: '#f59e0b',
    bg: '#fef3c7',
    topic: 'Sorting',
    impl: 'Sort students by attendance, marks, CGPA, and performance using comparison algorithms.',
  },
  {
    subject: 'AI',
    icon: Brain,
    color: '#8b5cf6',
    bg: '#ede9fe',
    topic: 'Correlation',
    impl: 'Analyze attendance vs. academic performance to compute risk scores and predictions.',
  },
  {
    subject: 'LLM',
    icon: Cpu,
    color: '#ec4899',
    bg: '#fce7f3',
    topic: 'Chatbot',
    impl: 'Explain performance, answer natural-language questions, and generate recommendations.',
  },
  {
    subject: 'Mini Project',
    icon: LayoutDashboard,
    color: '#16a34a',
    bg: '#dcfce7',
    topic: 'Dashboard',
    impl: 'Visualize attendance, marks, predictions, and AI insights in an interactive dashboard.',
  },
]

const modules = [
  { title: 'Login Module', items: ['Teacher Login', 'Student Login', 'Admin Login'] },
  { title: 'Student Module', items: ['Add Student', 'Update Student', 'Delete Student', 'Search Student'] },
  { title: 'Attendance Module', items: ['Daily Attendance', 'Monthly Attendance', 'Attendance %', 'CSV Upload'] },
  { title: 'Marks Module', items: ['Internal Marks', 'Semester Marks', 'Subject-wise Marks', 'CGPA Calculation'] },
  { title: 'AI/ML Layer', items: ['Performance Prediction', 'Risk Detection', 'Auto Suggestions', 'Recommendation Engine'] },
  { title: 'Reports', items: ['PDF Report', 'Excel/CSV Export', 'Semester Summary', 'Parent Report Generation'] },
]

const dsTopics = [
  'Arrays', 'Lists', 'Searching', 'Sorting', 'Stack', 'Queue', 'Dictionary', 'Hash Table', 'CSV File Handling', 'Binary Search',
]

const laTopics = [
  'Attendance Matrix', 'Marks Matrix', 'Matrix Multiplication', 'Average Matrix', 'Correlation Matrix', 'Distance Calculation', 'Normalization',
]

const workflow = [
  'Login', 'Add Students', 'Take Attendance', 'Enter Marks', 'Store in Database',
  'Pandas Analysis', 'ML Prediction', 'LLM Explanation', 'Dashboard', 'Reports',
]

export default function About() {
  return (
    <div>
      <PageHeader
        title="About Project"
        subtitle="AI Student Performance Analyzer — JNTUK R23 Mini Project"
      />

      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #075985 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px 36px',
        color: '#fff',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'absolute', right: 60, bottom: -60, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Brain size={28} />
            <h2 style={{ fontSize: 22, margin: 0, color: '#fff' }}>AI Student Performance Analyzer</h2>
          </div>
          <p style={{ fontSize: 15, opacity: 0.92, maxWidth: 680, lineHeight: 1.6, marginBottom: 20 }}>
            A full-stack academic analytics platform built for the JNTUK R23 curriculum. It integrates
            Programming, Linear Algebra, Data Structures, AI/ML, and an LLM chatbot to deliver smart
            attendance tracking, performance prediction, and actionable recommendations for teachers and students.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {['React + TypeScript', 'Supabase Database', 'AI Risk Prediction', 'LLM Chatbot', 'PDF / CSV Reports'].map((t) => (
              <span key={t} style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 999, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Subject Integration table */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3><GraduationCap size={16} style={{ verticalAlign: '-2px', marginRight: 8 }} />Subject Integration</h3>
          <span className="badge badge-primary">R23 Curriculum Alignment</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Topic</th>
                <th>Implementation in this Project</th>
              </tr>
            </thead>
            <tbody>
              {subjectRows.map((row) => {
                const Icon = row.icon
                return (
                  <tr key={row.subject}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: row.bg, color: row.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={16} />
                        </div>
                        <span style={{ fontWeight: 700 }}>{row.subject}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{row.topic}</span>
                    </td>
                    <td style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>{row.impl}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modules + workflow */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header"><h3>Project Modules</h3></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {modules.map((m) => (
                <div key={m.title}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--primary-dark)' }}>{m.title}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {m.items.map((item) => (
                      <span key={item} className="badge badge-neutral">{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-header"><h3>Project Workflow</h3></div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {workflow.map((step, i) => (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                      {i < workflow.length - 1 && <div style={{ width: 2, height: 18, background: 'var(--border)' }} />}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 500, paddingBottom: i < workflow.length - 1 ? 0 : 0 }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DS + LA concepts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3>Data Structure Concepts</h3>
            <span className="badge badge-warning">DSA</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {dsTopics.map((t) => (
                <span key={t} className="badge badge-neutral" style={{ fontSize: 13 }}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Linear Algebra Concepts</h3>
            <span className="badge badge-primary">Math</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {laTopics.map((t) => (
                <span key={t} className="badge badge-neutral" style={{ fontSize: 13 }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Outcomes */}
      <div className="card">
        <div className="card-header"><h3>Mini Project Outcomes</h3></div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { title: 'Attendance Logging', desc: 'Daily tracking with present / absent / late status per student.', color: '#0ea5e9', bg: '#e0f2fe' },
              { title: 'Performance Prediction', desc: 'Risk score computed from attendance and marks with AI analysis.', color: '#8b5cf6', bg: '#ede9fe' },
              { title: 'AI Recommendations', desc: 'Auto-generated suggestions for each student based on risk level.', color: '#16a34a', bg: '#dcfce7' },
              { title: 'Interactive Dashboard', desc: 'Live charts for attendance, marks, subject averages, and rankings.', color: '#f59e0b', bg: '#fef3c7' },
              { title: 'LLM Chatbot', desc: 'Plain-English Q&A for teachers and students powered by rule-based LLM.', color: '#ec4899', bg: '#fce7f3' },
              { title: 'PDF & Excel Reports', desc: 'Downloadable reports with full performance data and recommendations.', color: '#14b8a6', bg: '#ccfbf1' },
            ].map((o) => (
              <div key={o.title} style={{ padding: 16, borderRadius: 12, background: o.bg, border: `1px solid ${o.color}22` }}>
                <div style={{ fontWeight: 700, color: o.color, marginBottom: 6 }}>{o.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{o.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
