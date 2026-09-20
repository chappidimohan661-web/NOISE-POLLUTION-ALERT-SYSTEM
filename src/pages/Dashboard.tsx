import { useMemo } from 'react'
import { Users, CalendarCheck, GraduationCap, AlertTriangle, Trophy, TrendingUp, Code2, FlaskConical, BookOpen, Brain, Cpu, LayoutDashboard } from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  RadialBarChart, RadialBar, Legend,
} from 'recharts'
import { PageHeader } from '../components/Layout'
import { useClassData } from '../lib/useClassData'
import { analyzeAll, classSummary } from '../lib/analysis'
import { Link } from 'react-router-dom'

const subjectRows = [
  { subject: 'Programming', icon: Code2, color: '#0ea5e9', bg: '#e0f2fe', topic: 'Arrays', impl: 'Store students, attendance, and marks using lists and arrays.' },
  { subject: 'Linear Algebra', icon: FlaskConical, color: '#14b8a6', bg: '#ccfbf1', topic: 'Matrices', impl: 'Represent attendance and marks as matrices for analysis.' },
  { subject: 'Data Structures', icon: BookOpen, color: '#f59e0b', bg: '#fef3c7', topic: 'Sorting', impl: 'Sort students by attendance, marks, CGPA, and performance.' },
  { subject: 'AI', icon: Brain, color: '#8b5cf6', bg: '#ede9fe', topic: 'Correlation', impl: 'Analyze attendance vs. academic performance using correlation.' },
  { subject: 'LLM', icon: Cpu, color: '#ec4899', bg: '#fce7f3', topic: 'Chatbot', impl: 'Explain performance, answer questions, and generate recommendations.' },
  { subject: 'Mini Project', icon: LayoutDashboard, color: '#16a34a', bg: '#dcfce7', topic: 'Dashboard', impl: 'Visualize attendance, marks, predictions, and AI insights.' },
]

const PIE_COLORS = ['#16a34a', '#dc2626', '#f59e0b']
const RISK_COLORS = ['#16a34a', '#f59e0b', '#dc2626']

export default function Dashboard() {
  const { students, attendance, marks, loading } = useClassData()

  const analytics = useMemo(() => analyzeAll(students, attendance, marks), [students, attendance, marks])
  const summary = useMemo(() => classSummary(analytics), [analytics])

  if (loading) return <div className="spinner" />

  const attData = [
    { name: 'Present', value: summary.attendanceDistribution.present },
    { name: 'Absent', value: summary.attendanceDistribution.absent },
    { name: 'Late', value: summary.attendanceDistribution.late },
  ].filter((d) => d.value > 0)

  const subjectData = summary.subjectAverages.map((s) => ({
    subject: s.subject.length > 12 ? s.subject.slice(0, 10) + '…' : s.subject,
    avg: Math.round(s.avg),
  }))

  const riskData = [
    { name: 'Low', count: summary.riskDistribution.Low, fill: RISK_COLORS[0] },
    { name: 'Medium', count: summary.riskDistribution.Medium, fill: RISK_COLORS[1] },
    { name: 'High', count: summary.riskDistribution.High, fill: RISK_COLORS[2] },
  ]

  const rankingData = [...analytics].sort((a, b) => b.avgMarks - a.avgMarks).slice(0, 8).map((a) => ({
    name: a.student.name.split(' ')[0],
    marks: Math.round(a.avgMarks),
  }))

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Real-time overview of your class performance"
      />

      {students.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Users size={28} /></div>
          <h3>No students yet</h3>
          <p>Add your first student to start tracking attendance and marks.</p>
          <Link to="/students" className="btn btn-primary">Add Students</Link>
        </div>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}>
                  <Users size={20} />
                </div>
              </div>
              <div className="stat-value">{summary.totalStudents}</div>
              <div className="stat-label">Total Students</div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                  <CalendarCheck size={20} />
                </div>
              </div>
              <div className="stat-value">{summary.avgAttendance.toFixed(0)}%</div>
              <div className="stat-label">Average Attendance</div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                  <GraduationCap size={20} />
                </div>
              </div>
              <div className="stat-value">{summary.avgMarks.toFixed(0)}%</div>
              <div className="stat-label">Average Marks</div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <div className="stat-icon" style={{ background: 'var(--error-light)', color: 'var(--error)' }}>
                  <AlertTriangle size={20} />
                </div>
              </div>
              <div className="stat-value">{summary.atRiskCount}</div>
              <div className="stat-label">Students at Risk</div>
            </div>
          </div>

          <div className="chart-grid">
            <div className="chart-card">
              <h3>Attendance Distribution</h3>
              <div className="chart-sub">Present vs absent vs late records</div>
              {attData.length > 0 ? (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={attData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                        {attData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : <div className="text-muted text-sm" style={{ padding: 40, textAlign: 'center' }}>No attendance data yet.</div>}
            </div>

            <div className="chart-card">
              <h3>Subject-wise Averages</h3>
              <div className="chart-sub">Class average per subject</div>
              {subjectData.length > 0 ? (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="avg" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <div className="text-muted text-sm" style={{ padding: 40, textAlign: 'center' }}>No marks data yet.</div>}
            </div>

            <div className="chart-card">
              <h3>Risk Distribution</h3>
              <div className="chart-sub">Students by performance risk level</div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="20%" outerRadius="100%" data={riskData} startAngle={90} endAngle={-270}>
                    <RadialBar background dataKey="count" cornerRadius={8} />
                    <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <h3>Student Ranking</h3>
              <div className="chart-sub">Top performers by average marks</div>
              {rankingData.length > 0 ? (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rankingData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={70} />
                      <Tooltip />
                      <Bar dataKey="marks" fill="#14b8a6" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <div className="text-muted text-sm" style={{ padding: 40, textAlign: 'center' }}>No marks data yet.</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="card">
              <div className="card-header">
                <h3>Top Performer</h3>
                <Trophy size={18} style={{ color: 'var(--accent)' }} />
              </div>
              <div className="card-body">
                {summary.topper ? (
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{summary.topper.student.name}</div>
                    <div className="text-muted text-sm" style={{ marginTop: 4 }}>
                      Roll {summary.topper.student.roll_no} · {summary.topper.student.department}
                    </div>
                    <div className="flex gap-3" style={{ marginTop: 14 }}>
                      <div className="badge badge-success">{summary.topper.avgMarks.toFixed(0)}% avg marks</div>
                      <div className="badge badge-primary">{summary.topper.attendancePct.toFixed(0)}% attendance</div>
                    </div>
                  </div>
                ) : <div className="text-muted text-sm">No data.</div>}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Students Needing Support</h3>
                <TrendingUp size={18} style={{ color: 'var(--error)' }} />
              </div>
              <div className="card-body">
                {summary.weakStudents.length > 0 ? (
                  <div className="insight-list">
                    {summary.weakStudents.slice(0, 4).map((a) => (
                      <div key={a.student.id} className="insight-item">
                        <div className="insight-dot" style={{ background: a.riskLevel === 'High' ? 'var(--error)' : 'var(--warning)' }} />
                        <div>
                          <div className="font-semibold">{a.student.name}</div>
                          <div className="text-muted text-xs">
                            {a.attendancePct.toFixed(0)}% attendance · {a.avgMarks.toFixed(0)}% marks · {a.riskLevel} risk
                          </div>
                        </div>
                      </div>
                    ))}
                    {summary.weakStudents.length > 4 && (
                      <Link to="/prediction" className="text-sm" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>
                        View all {summary.weakStudents.length} →
                      </Link>
                    )}
                  </div>
                ) : <div className="text-muted text-sm">No students need support right now.</div>}
              </div>
            </div>
          </div>

          {/* Subject Integration table */}
          <div className="card" style={{ marginTop: 24 }}>
            <div className="card-header">
              <h3><GraduationCap size={16} style={{ verticalAlign: '-2px', marginRight: 8 }} />Subject Integration</h3>
              <Link to="/about" className="btn btn-ghost btn-sm">View full project →</Link>
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
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: row.bg, color: row.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Icon size={15} />
                            </div>
                            <span style={{ fontWeight: 700 }}>{row.subject}</span>
                          </div>
                        </td>
                        <td><span className="badge badge-neutral">{row.topic}</span></td>
                        <td style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{row.impl}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
