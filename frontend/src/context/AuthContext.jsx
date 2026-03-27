import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchCurrentUser = useCallback(async () => {
    try {
      const userData = await authService.getCurrentUser()
      setUser(userData)
    } catch {
      setUser(null)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authService.isAuthenticated()) {
      fetchCurrentUser()
    } else {
      setLoading(false)
    }
  }, [fetchCurrentUser])

  const login = async (email, password) => {
    const data = await authService.login(email, password)
    authService.saveTokens(data.accessToken, data.refreshToken)
    setUser(data.user)
    return data.user
  }

  const signup = async (name, email, password) => {
    const data = await authService.signup(name, email, password)
    authService.saveTokens(data.accessToken, data.refreshToken)
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  const loginWithOAuth = (token, refreshToken) => {
    authService.saveTokens(token, refreshToken)
    fetchCurrentUser()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, loginWithOAuth, refetchUser: fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
