import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brain, Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../lib/auth'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
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
        <h2>Welcome back</h2>
        <p className="auth-sub">Sign in to your performance dashboard</p>

        {error && (
          <div className="auth-error">
            <AlertCircle size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  )
}
