import api from './api'

export const authService = {
  async signup(name, email, password) {
    const { data } = await api.post('/auth/signup', { name, email, password })
    if (data.data?.accessToken) {
      this.saveTokens(data.data.accessToken, data.data.refreshToken)
    } else if (data.data?.token) {
      this.saveTokens(data.data.token, data.data.refreshToken)
    }
    return data.data
  },

  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    if (data.data?.accessToken) {
      this.saveTokens(data.data.accessToken, data.data.refreshToken)
    } else if (data.data?.token) {
      this.saveTokens(data.data.token, data.data.refreshToken)
    }
    return data.data
  },

  async logout() {
    try { await api.post('/auth/logout') } catch {}
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },

  async getCurrentUser() {
    try {
      const { data } = await api.get('/auth/me')
      return data.data
    } catch (error) {
      console.error('Error fetching current user:', error)
      throw error
    }
  },

  getUserFromToken() {
    const token = this.getStoredToken()
    if (!token) return null
    
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        console.error('Invalid token format')
        return null
      }
      
      const base64Url = parts[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      
      const decoded = JSON.parse(jsonPayload)
      console.log('Decoded token:', decoded)
      
      return {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role
      }
    } catch (error) {
      console.error('Error decoding token:', error)
      return null
    }
  },

  saveTokens(accessToken, refreshToken) {
    console.log('Saving tokens - accessToken:', !!accessToken, 'refreshToken:', !!refreshToken)
    localStorage.setItem('accessToken', accessToken)
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken)
    }
  },

  getStoredToken() {
    return localStorage.getItem('accessToken')
  },

  isAuthenticated() {
    const token = this.getStoredToken()
    if (!token) return false
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const exp = payload.exp * 1000
      return exp > Date.now()
    } catch {
      return false
    }
  },

  loginWithGoogle() {
    // Direct to backend - use absolute URL
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  },
}