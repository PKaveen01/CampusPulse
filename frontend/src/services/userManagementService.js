import api from './api'

export const userManagementService = {
  /** Fetch all users */
  getAllUsers: async () => {
    const { data } = await api.get('/admin/users')
    return data.data
  },

  /** Search/filter users */
  searchUsers: async ({ query = '', role = '', isActive } = {}) => {
    const params = new URLSearchParams()
    if (query)             params.append('query', query)
    if (role)              params.append('role', role)
    if (isActive != null)  params.append('isActive', isActive)
    const { data } = await api.get(`/admin/users/search?${params}`)
    return data.data
  },

  /** Get user statistics */
  getStats: async () => {
    const { data } = await api.get('/admin/users/stats')
    return data.data
  },

  /** Change a user's role */
  updateRole: async (userId, role) => {
    const { data } = await api.put(`/admin/users/${userId}/role`, { role })
    return data.data
  },

  /** Toggle active / inactive */
  toggleStatus: async (userId) => {
    const { data } = await api.put(`/admin/users/${userId}/toggle-status`)
    return data.data
  },
}
