import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brain, AlertCircle } from 'lucide-react'
import { useAuth } from '../lib/auth'
import type { Role } from '../lib/supabase'

const departments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT']

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('teacher')
  const [department, setDepartment] = useState('CSE')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    const { error } = await signUp(email, password, fullName, role, department)
    setLoading(false)
    if (error) {
      setError(error)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Brain size={28} />
        </div>
        <h2>Create your account</h2>
        <p className="auth-sub">Start analyzing student performance</p>

        {error && (
          <div className="auth-error">
            <AlertCircle size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Prof. Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email address</label>
            <input
              type="email"
              className="form-control"
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <div className="role-select">
              {(['teacher', 'student', 'admin'] as Role[]).map((r) => (
                <div
                  key={r}
                  className={`role-option ${role === r ? 'active' : ''}`}
                  onClick={() => setRole(r)}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Department</label>
            <select className="form-control" value={department} onChange={(e) => setDepartment(e.target.value)}>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
