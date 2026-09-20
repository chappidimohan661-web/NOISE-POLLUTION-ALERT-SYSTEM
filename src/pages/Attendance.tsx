import { useState, useMemo } from 'react'
import { CalendarCheck, Save, Check, X, Clock } from 'lucide-react'
import { PageHeader } from '../components/Layout'
import { useClassData } from '../lib/useClassData'
import { supabase } from '../lib/supabase'
import { attendancePct } from '../lib/analysis'

type Status = 'present' | 'absent' | 'late'

export default function Attendance() {
  const { students, attendance, reload, loading } = useClassData()
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [draft, setDraft] = useState<Record<string, Status>>({})
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState<string | null>(null)

  // existing records for the selected date
  const existing = useMemo(() => {
    const map = new Map<string, Status>()
    attendance.filter((a) => a.date === date).forEach((a) => map.set(a.student_id, a.status))
    return map
  }, [attendance, date])

  // per-student attendance %
  const pctByStudent = useMemo(() => {
    const map = new Map<string, number>()
    students.forEach((s) => {
      map.set(s.id, attendancePct(attendance.filter((a) => a.student_id === s.id)).pct)
    })
    return map
  }, [students, attendance])

  const getStatus = (sid: string): Status => draft[sid] ?? existing.get(sid) ?? 'present'

  const setStatus = (sid: string, status: Status) => setDraft({ ...draft, [sid]: status })

  const save = async () => {
    setSaving(true)
    setSavedMsg(null)
    try {
      const rows = students.map((s) => ({
        student_id: s.id,
        date,
        status: getStatus(s.id),
      }))
      // upsert by (student_id, date)
      const { error } = await supabase.from('attendance').upsert(rows, { onConflict: 'student_id,date' })
      if (error) throw error
      setDraft({})
      await reload()
      setSavedMsg(`Attendance saved for ${date}.`)
      setTimeout(() => setSavedMsg(null), 3000)
    } catch (err: any) {
      setSavedMsg(`Error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const markedCount = students.filter((s) => existing.has(s.id) || draft[s.id]).length

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Mark daily attendance and view attendance percentages"
        actions={
          <div className="flex items-center gap-3">
            <input
              type="date"
              className="form-control"
              style={{ width: 'auto' }}
              value={date}
              onChange={(e) => { setDate(e.target.value); setDraft({}); setSavedMsg(null) }}
            />
            <button className="btn btn-primary" onClick={save} disabled={saving || students.length === 0}>
              <Save size={16} /> {saving ? 'Saving…' : 'Save Attendance'}
            </button>
          </div>
        }
      />

      {savedMsg && (
        <div className={`badge ${savedMsg.startsWith('Error') ? 'badge-error' : 'badge-success'}`} style={{ marginBottom: 16 }}>
          {savedMsg}
        </div>
      )}

      {loading ? (
        <div className="spinner" />
      ) : students.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><CalendarCheck size={28} /></div>
          <h3>No students to mark</h3>
          <p>Add students first to take attendance.</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3>Attendance for {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
            <span className="text-muted text-sm">{markedCount}/{students.length} marked</span>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Overall %</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const status = getStatus(s.id)
                  const pct = pctByStudent.get(s.id) ?? 0
                  return (
                    <tr key={s.id}>
                      <td className="font-semibold">{s.roll_no}</td>
                      <td>{s.name}</td>
                      <td>
                        <div className="risk-meter" style={{ maxWidth: 160 }}>
                          <div className="risk-bar">
                            <div
                              className="risk-bar-fill"
                              style={{
                                width: `${pct}%`,
                                background: pct >= 85 ? 'var(--success)' : pct >= 65 ? 'var(--warning)' : 'var(--error)',
                              }}
                            />
                          </div>
                          <span className="text-xs font-semibold">{pct.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          {([
                            { v: 'present', icon: Check, color: 'var(--success)' },
                            { v: 'late', icon: Clock, color: 'var(--warning)' },
                            { v: 'absent', icon: X, color: 'var(--error)' },
                          ] as { v: Status; icon: any; color: string }[]).map(({ v, icon: Icon, color }) => (
                            <button
                              key={v}
                              onClick={() => setStatus(s.id, v)}
                              className="btn btn-sm"
                              style={{
                                background: status === v ? color : 'var(--surface-2)',
                                color: status === v ? '#fff' : 'var(--text-muted)',
                                border: `1px solid ${status === v ? color : 'var(--border)'}`,
                                padding: '6px 10px',
                              }}
                              title={v}
                            >
                              <Icon size={14} />
                              <span style={{ marginLeft: 4, textTransform: 'capitalize' }}>{v}</span>
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
