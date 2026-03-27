import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request with debugging
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  console.log('API Request:', config.method.toUpperCase(), config.url)
  console.log('Token present:', !!token)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log('Authorization header set')
  } else {
    console.log('No token found')
  }
  return config
}, error => {
  console.error('Request interceptor error:', error)
  return Promise.reject(error)
})

// Auto-refresh on 401 with debugging
api.interceptors.response.use(
  res => {
    console.log('API Response:', res.status, res.config.url)
    return res
  },
  async err => {
    console.error('API Error:', err.response?.status, err.config?.url, err.message)
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      console.log('401 error, attempting token refresh...')
      original._retry = true
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh-token', { refreshToken })
          const newToken = data.data.accessToken
          console.log('Token refreshed successfully')
          localStorage.setItem('accessToken', newToken)
          original.headers.Authorization = `Bearer ${newToken}`
          return api(original)
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          localStorage.clear()
          window.location.href = '/login'
        }
      } else {
        console.log('No refresh token available')
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api