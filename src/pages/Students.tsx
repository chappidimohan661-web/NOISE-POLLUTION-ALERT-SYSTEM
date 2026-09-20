import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Users, X } from 'lucide-react'
import { PageHeader } from '../components/Layout'
import { useClassData } from '../lib/useClassData'
import { supabase, type Student } from '../lib/supabase'
import { useAuth } from '../lib/auth'

const departments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT']

interface FormState {
  name: string
  roll_no: string
  department: string
  year: number
  section: string
  email: string
}

const emptyForm: FormState = { name: '', roll_no: '', department: 'CSE', year: 1, section: 'A', email: '' }

export default function Students() {
  const { students, reload, loading } = useClassData()
  const { session } = useAuth()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.roll_no.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setError(null)
    setModalOpen(true)
  }

  const openEdit = (s: Student) => {
    setEditing(s)
    setForm({ name: s.name, roll_no: s.roll_no, department: s.department, year: s.year, section: s.section, email: s.email ?? '' })
    setError(null)
    setModalOpen(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (editing) {
        const { error } = await supabase.from('students').update(form).eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('students').insert({ ...form, user_id: session!.user.id })
        if (error) throw error
      }
      await reload()
      setModalOpen(false)
    } catch (err: any) {
      setError(err.message ?? 'Failed to save student')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (s: Student) => {
    if (!confirm(`Delete ${s.name}? This also removes their attendance and marks.`)) return
    await supabase.from('students').delete().eq('id', s.id)
    await reload()
  }

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle="Add, edit, search, and manage student records"
        actions={
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Student
          </button>
        }
      />

      {loading ? (
        <div className="spinner" />
      ) : students.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Users size={28} /></div>
          <h3>No students yet</h3>
          <p>Add your first student to begin tracking.</p>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Student</button>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3>All Students ({students.length})</h3>
            <input
              className="search-input"
              placeholder="Search name, roll, dept…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Section</th>
                  <th>Email</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td className="font-semibold">{s.roll_no}</td>
                    <td>{s.name}</td>
                    <td><span className="badge badge-primary">{s.department}</span></td>
                    <td>Year {s.year}</td>
                    <td>Sec {s.section}</td>
                    <td className="text-muted text-sm">{s.email ?? '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)} title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(s)} title="Delete" style={{ marginLeft: 6 }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-muted" style={{ textAlign: 'center', padding: 32 }}>No students match your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Student' : 'Add Student'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                {error && <div className="auth-error">{error}</div>}
                <div className="form-group">
                  <label>Full Name</label>
                  <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Roll Number</label>
                    <input className="form-control" value={form.roll_no} onChange={(e) => setForm({ ...form, roll_no: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Section</label>
                    <select className="form-control" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>
                      {['A', 'B', 'C', 'D'].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Department</label>
                    <select className="form-control" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                      {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Year</label>
                    <select className="form-control" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}>
                      {[1, 2, 3, 4].map((y) => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Email (optional)</label>
                  <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
