import { useState, useMemo } from 'react'
import { GraduationCap, Plus, X, Save, Trash2 } from 'lucide-react'
import { PageHeader } from '../components/Layout'
import { useClassData } from '../lib/useClassData'
import { supabase, type MarksRow } from '../lib/supabase'
import { useAuth } from '../lib/auth'

const SUBJECTS = ['Data Structures', 'DBMS', 'Operating Systems', 'Computer Networks', 'Python Programming', 'Linear Algebra', 'Machine Learning']

export default function Marks() {
  const { students, marks, reload, loading } = useClassData()
  const { session } = useAuth()
  const [selectedId, setSelectedId] = useState<string>('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ subject: SUBJECTS[0], internal: 0, external: 0 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const student = students.find((s) => s.id === selectedId)
  const studentMarks = useMemo(() => marks.filter((m) => m.student_id === selectedId), [marks, selectedId])

  const avg = studentMarks.length
    ? studentMarks.reduce((s, m) => s + m.total, 0) / studentMarks.length
    : 0
  // CGPA approximation: total% / 10 capped at 10
  const cgpa = Math.min(10, avg / 10)

  const openAdd = () => {
    if (!selectedId) return
    setForm({ subject: SUBJECTS[0], internal: 0, external: 0 })
    setError(null)
    setModalOpen(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const { error } = await supabase.from('marks').insert({
        student_id: selectedId,
        subject: form.subject,
        internal: Number(form.internal),
        external: Number(form.external),
        user_id: session!.user.id,
      })
      if (error) throw error
      await reload()
      setModalOpen(false)
    } catch (err: any) {
      setError(err.message ?? 'Failed to save marks')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (m: MarksRow) => {
    await supabase.from('marks').delete().eq('id', m.id)
    await reload()
  }

  return (
    <div>
      <PageHeader
        title="Marks"
        subtitle="Enter internal and external marks per subject, view CGPA"
        actions={
          <button className="btn btn-primary" onClick={openAdd} disabled={!selectedId}>
            <Plus size={16} /> Add Marks
          </button>
        }
      />

      {loading ? (
        <div className="spinner" />
      ) : students.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><GraduationCap size={28} /></div>
          <h3>No students yet</h3>
          <p>Add students first to enter marks.</p>
        </div>
      ) : (
        <>
          <div className="form-group" style={{ maxWidth: 360 }}>
            <label>Select Student</label>
            <select className="form-control" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              <option value="">— Choose a student —</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.roll_no})</option>
              ))}
            </select>
          </div>

          {!selectedId ? (
            <div className="empty-state">
              <div className="empty-icon"><GraduationCap size={28} /></div>
              <h3>Select a student</h3>
              <p>Choose a student above to view and add their marks.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="card">
                <div className="card-header">
                  <h3>{student?.name} — Marks</h3>
                  <span className="text-muted text-sm">{studentMarks.length} subjects</span>
                </div>
                <div className="card-body">
                  {studentMarks.length === 0 ? (
                    <div className="text-muted text-sm" style={{ textAlign: 'center', padding: 24 }}>
                      No marks recorded. Click "Add Marks" to enter the first subject.
                    </div>
                  ) : (
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Subject</th>
                            <th>Internal</th>
                            <th>External</th>
                            <th>Total</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentMarks.map((m) => (
                            <tr key={m.id}>
                              <td className="font-semibold">{m.subject}</td>
                              <td>{m.internal}/40</td>
                              <td>{m.external}/60</td>
                              <td>
                                <span className={`badge ${m.total >= 75 ? 'badge-success' : m.total >= 40 ? 'badge-warning' : 'badge-error'}`}>
                                  {m.total}/100
                                </span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <button className="btn btn-danger btn-sm" onClick={() => remove(m)}><Trash2 size={14} /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-header"><h3>Summary</h3></div>
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <div className="text-muted text-sm">Average Total</div>
                      <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{avg.toFixed(1)}<span className="text-muted text-sm">/100</span></div>
                    </div>
                    <div>
                      <div className="text-muted text-sm">CGPA</div>
                      <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)', color: cgpa >= 7 ? 'var(--success)' : cgpa >= 5 ? 'var(--warning)' : 'var(--error)' }}>{cgpa.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="text-muted text-sm" style={{ marginBottom: 12 }}>Subject performance:</div>
                  <div className="insight-list">
                    {studentMarks.map((m) => (
                      <div key={m.id} className="insight-item">
                        <div className="insight-dot" style={{ background: m.total >= 75 ? 'var(--success)' : m.total >= 40 ? 'var(--warning)' : 'var(--error)' }} />
                        <div className="flex justify-between w-full">
                          <span>{m.subject}</span>
                          <span className="font-semibold">{m.total}/100</span>
                        </div>
                      </div>
                    ))}
                    {studentMarks.length === 0 && <div className="text-muted text-sm">No subjects yet.</div>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Marks — {student?.name}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                {error && <div className="auth-error">{error}</div>}
                <div className="form-group">
                  <label>Subject</label>
                  <select className="form-control" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Internal (out of 40)</label>
                    <input type="number" min={0} max={40} className="form-control" value={form.internal} onChange={(e) => setForm({ ...form, internal: Number(e.target.value) })} required />
                  </div>
                  <div className="form-group">
                    <label>External (out of 60)</label>
                    <input type="number" min={0} max={60} className="form-control" value={form.external} onChange={(e) => setForm({ ...form, external: Number(e.target.value) })} required />
                  </div>
                </div>
                <div className="text-muted text-sm">Total: <span className="font-semibold">{Number(form.internal) + Number(form.external)}/100</span></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}><Save size={16} /> {saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
