import api from './api'

export const ticketService = {
  async getMyTickets(status) {
    const params = {}
    if (status) params.status = status
    const { data } = await api.get('/tickets', { params })
    return data.data ?? []
  },

  async getTicketById(ticketId) {
    const { data } = await api.get(`/tickets/${ticketId}`)
    return data.data
  },

  async deleteTicket(ticketId) {
    await api.delete(`/tickets/${ticketId}`)
  },

  async addComment(ticketId, comment, internal = false) {
    const { data } = await api.post(`/tickets/${ticketId}/comments`, {
      comment,
      internal,
    })
    return data.data
  },

  async updateTicketStatus(ticketId, payload) {
    const { data } = await api.patch(`/tickets/${ticketId}/status`, payload)
    return data.data
  },

  async acceptAssignedTicket(ticketId) {
    const { data } = await api.patch(`/tickets/${ticketId}/status`, { status: 'IN_PROGRESS' })
    return data.data
  },

  async assignTicket(ticketId, assigneeUserId) {
    const { data } = await api.patch(`/tickets/${ticketId}/assign`, { assigneeUserId })
    return data.data
  },

  async getAssignableStaff() {
    try {
      const { data } = await api.get('/tickets/assignable-staff')
      const payload = Array.isArray(data) ? data : (data?.data ?? data?.staff ?? [])
      return Array.isArray(payload) ? payload : []
    } catch (error) {
      if (error?.response?.status !== 404) {
        throw error
      }

      try {
        const { data } = await api.get('/tickets/staff')
        const payload = Array.isArray(data) ? data : (data?.data ?? data?.staff ?? [])
        return Array.isArray(payload) ? payload : []
      } catch (fallbackError) {
        throw fallbackError
      }
    }
  },

  async createTicket(payload) {
    const form = new FormData()

    if (payload.resourceId) form.append('resourceId', payload.resourceId)
    if (payload.location) form.append('location', payload.location)
    form.append('category', payload.category)
    form.append('priority', payload.priority)
    form.append('description', payload.description)
    if (payload.preferredContactDetails) {
      form.append('preferredContactDetails', payload.preferredContactDetails)
    }

    ;(payload.attachments ?? []).forEach(file => {
      form.append('attachments', file)
    })

    const { data } = await api.post('/tickets', form)
    return data.data
  },
}
