import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/api'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true); setError('')
    try {
      const user = await api.login(email, password)
      login(user)
      navigate(user.role === 'admin' ? '/admin/users' : '/user/documents')
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const fill = (email, password) => { setEmail(email); setPassword(password); setError('') }

  const s = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fdf2f4 0%, #fce8ec 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: 'system-ui, sans-serif'
    },
    wrapper: { width: '100%', maxWidth: '440px' },
    header: { textAlign: 'center', marginBottom: '36px' },
    logoBox: {
      width: '56px', height: '56px',
      background: '#c0392b', borderRadius: '14px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 20px',
    },
    logoText: { color: 'white', fontSize: '14px', fontWeight: '800', letterSpacing: '0.05em' },
    title: { fontSize: '28px', fontWeight: '700', color: '#1a0a0f', margin: '0 0 8px' },
    subtitle: { fontSize: '15px', color: '#888', margin: 0 },
    card: {
      background: 'white', borderRadius: '20px',
      padding: '40px', boxShadow: '0 2px 24px rgba(0,0,0,0.08)',
      border: '1px solid #f0e0e0'
    },
    error: {
      background: '#fff5f5', border: '1px solid #fcc', color: '#c0392b',
      fontSize: '14px', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px'
    },
    label: {
      display: 'block', fontSize: '14px', fontWeight: '600',
      color: '#333', marginBottom: '8px'
    },
    input: {
      width: '100%', padding: '13px 16px',
      border: '1.5px solid #e8d0d0', borderRadius: '10px',
      fontSize: '15px', outline: 'none', background: '#fdf8f8',
      color: '#1a0a0f', boxSizing: 'border-box', transition: 'border-color 0.2s'
    },
    btn: {
      width: '100%', padding: '14px',
      background: '#c0392b', color: 'white', border: 'none',
      borderRadius: '10px', fontSize: '16px', fontWeight: '600',
      cursor: 'pointer', marginTop: '8px', transition: 'background 0.2s'
    },
    divider: {
      borderTop: '1px solid #f0e0e0', margin: '24px 0',
      display: 'flex', alignItems: 'center', gap: '12px'
    },
    dividerText: { fontSize: '13px', color: '#bbb', whiteSpace: 'nowrap' },
    quickGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
    quickBtn: {
      padding: '11px', background: '#fdf8f8',
      border: '1.5px solid #e8d0d0', borderRadius: '10px',
      fontSize: '14px', color: '#c0392b', fontWeight: '500',
      cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center'
    }
  }

  return (
    <div style={s.page}>
      <div style={s.wrapper}>
        <div style={s.header}>
          <div style={s.logoBox}>
            <span style={s.logoText}>DMS</span>
          </div>
          <h1 style={s.title}>Sign in to your account</h1>
          <p style={s.subtitle}>Document Management System</p>
        </div>

        <div style={s.card}>
          {error && <div style={s.error}>{error}</div>}

          <form onSubmit={handleSubmit} autoComplete="off">
            <div style={{ marginBottom: '20px' }}>
              <label style={s.label}>Email address</label>
              <input
                type="email" value={email} autoComplete="off"
                placeholder="you@example.com"
                onChange={e => setEmail(e.target.value)}
                style={s.input}
                onFocus={e => e.target.style.borderColor = '#c0392b'}
                onBlur={e => e.target.style.borderColor = '#e8d0d0'}
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={s.label}>Password</label>
              <input
                type="password" value={password} autoComplete="new-password"
                placeholder="Enter your password"
                onChange={e => setPassword(e.target.value)}
                style={s.input}
                onFocus={e => e.target.style.borderColor = '#c0392b'}
                onBlur={e => e.target.style.borderColor = '#e8d0d0'}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              ...s.btn,
              background: loading ? '#e08080' : '#c0392b',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div style={s.divider}>
            <div style={{ flex: 1, height: '1px', background: '#f0e0e0' }} />
            <span style={s.dividerText}>Quick access for demo</span>
            <div style={{ flex: 1, height: '1px', background: '#f0e0e0' }} />
          </div>

          <div style={s.quickGrid}>
            <button type="button" onClick={() => fill('admin@dms.com', 'password')}
              style={s.quickBtn}
              onMouseEnter={e => { e.currentTarget.style.background = '#fce8ec'; e.currentTarget.style.borderColor = '#c0392b' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fdf8f8'; e.currentTarget.style.borderColor = '#e8d0d0' }}>
              Admin account
            </button>
            <button type="button" onClick={() => fill('user@dms.com', 'password')}
              style={s.quickBtn}
              onMouseEnter={e => { e.currentTarget.style.background = '#fce8ec'; e.currentTarget.style.borderColor = '#c0392b' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fdf8f8'; e.currentTarget.style.borderColor = '#e8d0d0' }}>
              User account
            </button>
          </div>

          {email && (
            <p style={{ fontSize: '13px', color: '#aaa', textAlign: 'center', marginTop: '12px' }}>
              Ready to sign in as: {email}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginPage