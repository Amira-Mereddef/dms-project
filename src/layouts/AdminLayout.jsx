import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AdminLayout() {
  const { user, logout, theme, toggleTheme } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/') }
  const dark = theme === 'dark'

  const bg        = dark ? '#1a0808' : 'white'
  const border    = dark ? '#3a1010' : '#f0e0e0'
  const mainBg    = dark ? '#110505' : '#fdf8f8'
  const textPri   = dark ? '#f5e0e0' : '#1a0a0f'
  const textMuted = dark ? '#c08080' : '#888'
  const activeBg  = dark ? '#3a1010' : '#fce8ec'
  const activeCol = dark ? '#e08080' : '#c0392b'
  const cardBg    = dark ? '#2a0808' : '#fdf8f8'

  const links = [
    { to: '/admin/users',       label: 'Users',         },
    { to: '/admin/departments', label: 'Departments',   },
    { to: '/admin/categories',  label: 'Categories',    },
    { to: '/admin/activity',    label: 'Activity Log',  },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', background: mainBg }}>

      <aside style={{
        width: '240px', flexShrink: 0,
        background: bg, borderRight: `1px solid ${border}`,
        display: 'flex', flexDirection: 'column', padding: '28px 16px'
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 8px' }}>
          <div style={{
            width: '40px', height: '40px',
            background: '#c0392b', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: 'white', fontSize: '13px', fontWeight: '800', letterSpacing: '0.05em' }}>DMS</span>
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: textPri }}>Admin Panel</div>
            <div style={{ fontSize: '12px', color: textMuted }}>Management Console</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <p style={{
            fontSize: '11px', fontWeight: '700', color: textMuted,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            padding: '0 12px', marginBottom: '10px'
          }}>Management</p>
          {links.map(l => (
            <NavLink key={l.to} to={l.to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '11px 14px', borderRadius: '10px',
              fontSize: '15px', fontWeight: isActive ? '600' : '400',
              color: isActive ? activeCol : textMuted,
              background: isActive ? activeBg : 'transparent',
              textDecoration: 'none',
              borderLeft: isActive ? `3px solid ${activeCol}` : '3px solid transparent',
              transition: 'all 0.15s'
            })}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: `1px solid ${border}`, paddingTop: '20px', marginTop: '20px' }}>
          <div style={{
            background: cardBg, borderRadius: '10px',
            padding: '14px', marginBottom: '12px',
            border: `1px solid ${border}`
          }}>
            <div style={{ fontSize: '12px', color: textMuted, marginBottom: '4px' }}>Signed in as</div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: textPri }}>{user?.name}</div>
            <div style={{ fontSize: '12px', color: '#c0392b', marginTop: '2px' }}>{user?.email}</div>
          </div>

          <button onClick={toggleTheme} style={{
            width: '100%', padding: '10px',
            background: cardBg, border: `1.5px solid ${border}`,
            borderRadius: '8px', fontSize: '14px',
            color: textMuted, fontWeight: '500',
            cursor: 'pointer', marginBottom: '8px', textAlign: 'left',
            paddingLeft: '14px'
          }}>
            {dark ? 'Light mode' : 'Dark mode'}
          </button>

          <button onClick={handleLogout} style={{
            width: '100%', padding: '10px',
            background: 'transparent', border: `1.5px solid ${border}`,
            borderRadius: '8px', fontSize: '14px',
            color: textMuted, fontWeight: '500',
            cursor: 'pointer', textAlign: 'left', paddingLeft: '14px'
          }}>
            Sign out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto', background: mainBg }}>
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout