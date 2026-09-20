import { useState, type ReactNode } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  GraduationCap,
  TrendingUp,
  FileText,
  MessageSquare,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Brain,
  Info,
} from 'lucide-react'
import { useAuth } from '../lib/auth'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/marks', label: 'Marks', icon: GraduationCap },
  { to: '/prediction', label: 'AI Prediction', icon: TrendingUp },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/chatbot', label: 'AI Assistant', icon: MessageSquare },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
  { to: '/about', label: 'About Project', icon: Info },
]

export default function Layout() {
  const { profile, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="logo">
            <Brain size={20} />
          </div>
          <div className="brand-text">
            <h1>PerformanceAI</h1>
            <span>Student Analyzer</span>
          </div>
        </div>
        <nav className="nav-section">
          <div className="nav-label">Main Menu</div>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="nav-icon" size={18} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="name">{profile?.full_name ?? 'User'}</div>
              <div className="role">{profile?.role ?? 'teacher'} · {profile?.department ?? 'CSE'}</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={handleSignOut} title="Sign out" style={{ padding: 8 }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div>
            <h2>AI Student Performance Analyzer</h2>
            <div className="subtitle">Attendance · Marks · Prediction · Insights</div>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 15 }}
        />
      )}
    </div>
  )
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  )
}
