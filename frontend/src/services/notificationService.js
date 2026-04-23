import api from './api'

const notificationService = {
  getAll: (page = 0, size = 20) =>
    api.get(`/notifications?page=${page}&size=${size}`).then(r => r.data.data),

  getUnreadCount: () =>
    api.get('/notifications/unread-count').then(r => r.data.data?.count ?? 0),

  markAsRead: (id) =>
    api.put(`/notifications/${id}/read`).then(r => r.data),

  markAllAsRead: () =>
    api.put('/notifications/read-all').then(r => r.data),

  delete: (id) =>
    api.delete(`/notifications/${id}`).then(r => r.data),

  deleteAllRead: () =>
    api.delete('/notifications/read').then(r => r.data),

  getPreferences: () =>
    api.get('/notifications/preferences').then(r => r.data.data),

  updatePreferences: (prefs) =>
    api.put('/notifications/preferences', prefs).then(r => r.data.data),
}

export default notificationService
