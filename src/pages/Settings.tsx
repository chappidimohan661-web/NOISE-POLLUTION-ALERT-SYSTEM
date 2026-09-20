import { useState } from 'react'
import { User, Save, LogOut } from 'lucide-react'
import { PageHeader } from '../components/Layout'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const departments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT']

export default function Settings() {
  const { profile, session, signOut } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [department, setDepartment] = useState(profile?.department ?? 'CSE')
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState<string | null>(null)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('profiles').update({ full_name: fullName, department }).eq('id', session!.user.id)
    setSaving(false)
    if (error) setSavedMsg(`Error: ${error.message}`)
    else setSavedMsg('Profile updated.')
    setTimeout(() => setSavedMsg(null), 3000)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your profile and account" />

      <div style={{ maxWidth: 520 }}>
        <div className="card">
          <div className="card-header">
            <h3><User size={16} style={{ verticalAlign: '-2px', marginRight: 6 }} />Profile</h3>
          </div>
          <div className="card-body">
            <form onSubmit={save}>
              <div className="form-group">
                <label>Full Name</label>
                <input className="form-control" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input className="form-control" value={session?.user?.email ?? ''} disabled style={{ opacity: 0.6 }} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <input className="form-control" value={profile?.role ?? ''} disabled style={{ opacity: 0.6, textTransform: 'capitalize' }} />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select className="form-control" value={department} onChange={(e) => setDepartment(e.target.value)}>
                    {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              {savedMsg && <div className={`badge ${savedMsg.startsWith('Error') ? 'badge-error' : 'badge-success'}`} style={{ marginBottom: 12 }}>{savedMsg}</div>}
              <button type="submit" className="btn btn-primary" disabled={saving}><Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}</button>
            </form>
          </div>
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header"><h3>Account</h3></div>
          <div className="card-body">
            <p className="text-muted text-sm" style={{ marginBottom: 16 }}>Sign out of your account on this device.</p>
            <button className="btn btn-danger" onClick={handleSignOut}><LogOut size={16} /> Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  )
}
