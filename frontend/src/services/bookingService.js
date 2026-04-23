import api from './api'

const bookingService = {

  // Create a new booking
  async createBooking(data) {
    const { data: res } = await api.post('/bookings', data)
    return res.data
  },

  // Get current user's bookings (paginated)
  async getMyBookings(page = 0, size = 10) {
    const { data: res } = await api.get('/bookings/my', { params: { page, size } })
    return res.data
  },

  // Admin: get all bookings
  async getAllBookings(status = null, page = 0, size = 20) {
    const params = { page, size }
    if (status) params.status = status
    const { data: res } = await api.get('/bookings/admin', { params })
    return res.data
  },

  // Get single booking
  async getBookingById(id) {
    const { data: res } = await api.get(`/bookings/${id}`)
    return res.data
  },

  // Approve a booking (admin/manager)
  async approveBooking(id, remarks = '') {
    const { data: res } = await api.put(`/bookings/${id}/approve`, { remarks })
    return res.data
  },

  // Reject a booking (admin/manager)
  async rejectBooking(id, reason) {
    const { data: res } = await api.put(`/bookings/${id}/reject`, { reason })
    return res.data
  },

  // Cancel a booking
  async cancelBooking(id) {
    const { data: res } = await api.put(`/bookings/${id}/cancel`)
    return res.data
  },

  // Permanently delete a PENDING booking (before admin review)
  async deleteBooking(id) {
    const { data: res } = await api.delete(`/bookings/${id}`)
    return res.data
  },

  // Get available time slots for a resource on a date
  async getAvailableSlots(resourceId, date) {
    const { data: res } = await api.get('/bookings/slots', {
      params: { resourceId, date }
    })
    return res.data  // array of { startTime, endTime, available }
  },

  // Check if a time slot has a conflict
  async checkConflict(resourceId, date, startTime, endTime) {
    const { data: res } = await api.get('/bookings/check-conflict', {
      params: { resourceId, date, startTime, endTime }
    })
    return res.data  // boolean
  },
}

export default bookingService
