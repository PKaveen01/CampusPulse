import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'

function getDashboardPath(role) {
  switch (role) {
    case 'ADMIN': return '/dashboard/admin'
    case 'TECHNICIAN': return '/dashboard/technician'
    case 'MANAGER': return '/dashboard/manager'
    default: return '/dashboard/user'
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname

  const handleSubmit = async e => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(from || getDashboardPath(user.role), { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message
      setError(msg || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', position: 'relative', overflow: 'hidden', padding: 20,
    }}>
      {/* Ambient blobs */}
      <div style={{
        position: 'absolute', width: 600, height: 600,
        borderRadius: '50%', top: -200, left: -200,
        background: 'radial-gradient(circle, rgba(79,142,247,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 500, height: 500,
        borderRadius: '50%', bottom: -150, right: -150,
        background: 'radial-gradient(circle, rgba(124,99,247,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '40px 36px',
        boxShadow: 'var(--shadow), var(--shadow-glow)',
        animation: 'fadeIn 0.5s ease',
        position: 'relative', zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 800, color: '#fff',
            boxShadow: '0 8px 24px rgba(79,142,247,0.4)',
          }}>S</div>
          <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Sign in to Smart Campus Hub
          </p>
        </div>

        {/* Google OAuth */}
        <button
          onClick={() => authService.loginWithGoogle()}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '11px 16px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text-primary)', fontSize: 14, fontWeight: 500,
            transition: 'all 0.2s', marginBottom: 24, cursor: 'pointer',
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>or sign in with email</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px', borderRadius: 'var(--radius-sm)',
            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
            color: 'var(--danger)', fontSize: 13, marginBottom: 16,
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>
              Email address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: focused === 'email' ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'color 0.2s',
              }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')}
                placeholder="you@university.edu"
                style={{
                  width: '100%', padding: '10px 12px 10px 38px',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${focused === 'email' ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)', outline: 'none',
                  transition: 'border-color 0.2s',
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: focused === 'pwd' ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'color 0.2s',
              }} />
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused('pwd')}
                onBlur={() => setFocused('')}
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '10px 40px 10px 38px',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${focused === 'pwd' ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)', outline: 'none',
                  transition: 'border-color 0.2s',
                  fontSize: 14,
                }}
              />
              <button type="button" onClick={() => setShowPwd(s => !s)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', display: 'flex', padding: 2,
              }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '11px 16px',
              background: loading ? 'rgba(79,142,247,0.5)' : 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              color: '#fff', borderRadius: 'var(--radius-sm)',
              fontSize: 14, fontWeight: 600, marginTop: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'opacity 0.2s, transform 0.1s',
              boxShadow: '0 4px 16px rgba(79,142,247,0.35)',
            }}
            onMouseOver={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseOut={e => e.currentTarget.style.transform = 'none'}
          >
            {loading ? (
              <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            ) : (
              <><span>Sign in</span><ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 24 }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 500 }}>Create one</Link>
        </p>
      </div>
    </div>
  )
}
