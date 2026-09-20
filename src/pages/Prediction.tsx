import { useMemo, useState } from 'react'
import { TrendingUp, AlertTriangle, CheckCircle2, AlertCircle, Lightbulb } from 'lucide-react'
import { PageHeader } from '../components/Layout'
import { useClassData } from '../lib/useClassData'
import { analyzeAll } from '../lib/analysis'

export default function Prediction() {
  const { students, attendance, marks, loading } = useClassData()
  const [filter, setFilter] = useState<'all' | 'High' | 'Medium' | 'Low'>('all')

  const analytics = useMemo(() => analyzeAll(students, attendance, marks), [students, attendance, marks])

  const filtered = filter === 'all' ? analytics : analytics.filter((a) => a.riskLevel === filter)

  if (loading) return <div className="spinner" />

  return (
    <div>
      <PageHeader
        title="AI Performance Prediction"
        subtitle="Risk analysis and recommendations for every student"
        actions={
          <div className="flex gap-2">
            {(['all', 'High', 'Medium', 'Low'] as const).map((f) => (
              <button
                key={f}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : `${f} Risk`}
              </button>
            ))}
          </div>
        }
      />

      {students.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><TrendingUp size={28} /></div>
          <h3>No students to analyze</h3>
          <p>Add students, mark attendance, and enter marks to see predictions.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((a) => (
            <div className="card" key={a.student.id}>
              <div className="card-body">
                <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="stat-icon"
                      style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: a.riskLevel === 'High' ? 'var(--error-light)' : a.riskLevel === 'Medium' ? 'var(--warning-light)' : 'var(--success-light)',
                        color: a.riskLevel === 'High' ? 'var(--error)' : a.riskLevel === 'Medium' ? 'var(--warning)' : 'var(--success)',
                      }}
                    >
                      {a.riskLevel === 'High' ? <AlertTriangle size={22} /> : a.riskLevel === 'Medium' ? <AlertCircle size={22} /> : <CheckCircle2 size={22} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{a.student.name}</div>
                      <div className="text-muted text-sm">{a.student.roll_no} · {a.student.department} · Year {a.student.year} Sec {a.student.section}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-xs text-muted">Attendance</div>
                      <div className="font-semibold">{a.attendancePct.toFixed(0)}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted">Avg Marks</div>
                      <div className="font-semibold">{a.avgMarks.toFixed(0)}%</div>
                    </div>
                    <span className={`badge ${a.riskLevel === 'High' ? 'badge-error' : a.riskLevel === 'Medium' ? 'badge-warning' : 'badge-success'}`}>
                      {a.riskLevel} Risk
                    </span>
                  </div>
                </div>

                <div className="risk-meter" style={{ marginTop: 16 }}>
                  <div className="risk-bar">
                    <div
                      className="risk-bar-fill"
                      style={{
                        width: `${a.riskScore}%`,
                        background: a.riskLevel === 'High' ? 'var(--error)' : a.riskLevel === 'Medium' ? 'var(--warning)' : 'var(--success)',
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted">Risk score: {a.riskScore.toFixed(0)}</span>
                </div>

                <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 10, fontSize: 14, fontWeight: 600 }}>
                  Prediction: <span className="text-muted font-semibold">{a.prediction}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 14 }}>
                  <div>
                    <div className="text-xs font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-subtle)', marginBottom: 8 }}>
                      Insights
                    </div>
                    <div className="insight-list">
                      {a.insights.map((ins, i) => (
                        <div key={i} className="insight-item" style={{ fontSize: 12 }}>
                          <div className="insight-dot" style={{ background: 'var(--primary)' }} />
                          <span>{ins}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-subtle)', marginBottom: 8 }}>
                      <Lightbulb size={12} style={{ verticalAlign: '-1px', marginRight: 4 }} />Recommendations
                    </div>
                    <div className="insight-list">
                      {a.recommendations.length > 0 ? a.recommendations.map((rec, i) => (
                        <div key={i} className="insight-item success" style={{ fontSize: 12 }}>
                          <div className="insight-dot" style={{ background: 'var(--success)' }} />
                          <span>{rec}</span>
                        </div>
                      )) : <div className="text-muted text-sm">No interventions needed.</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon"><CheckCircle2 size={28} /></div>
              <h3>No students in this risk category</h3>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
