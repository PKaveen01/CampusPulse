import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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

export default function OAuth2RedirectPage() {
  const [params] = useSearchParams()
  const { user, loading, refetchUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    const refreshToken = params.get('refreshToken')

    console.log('=== OAuth2 Redirect Started ===')
    console.log('Token present:', !!token)
    console.log('Refresh token present:', !!refreshToken)
    
    if (token) {
      console.log('Token preview:', token.substring(0, 50) + '...')
    }

    if (!token || !refreshToken) {
      console.error('Missing tokens!')
      navigate('/login?error=oauth_failed', { replace: true })
      return
    }

    // Save tokens
    authService.saveTokens(token, refreshToken)
    console.log('Tokens saved to localStorage')

    // Try to decode user from token
    const userFromToken = authService.getUserFromToken()
    
    if (userFromToken) {
      console.log('User decoded from token:', userFromToken)
      
      // Wait a moment for token to be fully set, then fetch user
      setTimeout(() => {
        refetchUser()
        
        // Redirect after a short delay
        setTimeout(() => {
          console.log('Redirecting to dashboard:', getDashboardPath(userFromToken.role))
          navigate(getDashboardPath(userFromToken.role), { replace: true })
        }, 500)
      }, 100)
    } else {
      console.log('Could not decode token, will use API call')
      // Wait before fetching user
      setTimeout(() => {
        refetchUser()
      }, 100)
      
      // Wait for user to load, then redirect
      let attempts = 0
      const maxAttempts = 20
      const checkUser = setInterval(() => {
        attempts++
        console.log(`Checking for user (attempt ${attempts}/${maxAttempts})...`, user)
        
        if (user) {
          clearInterval(checkUser)
          console.log('User loaded from API, redirecting to:', getDashboardPath(user.role))
          navigate(getDashboardPath(user.role), { replace: true })
        } else if (attempts >= maxAttempts) {
          clearInterval(checkUser)
          console.error('Timeout waiting for user')
          navigate('/login?error=session_failed', { replace: true })
        }
      }, 250)
    }
  }, [params, navigate, refetchUser, user])

  // Also redirect if user becomes available via context
  useEffect(() => {
    if (user && !loading) {
      console.log('User loaded via context, redirecting to:', getDashboardPath(user.role))
      navigate(getDashboardPath(user.role), { replace: true })
    }
  }, [user, loading, navigate])

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', gap: 16,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Completing sign-in…</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}