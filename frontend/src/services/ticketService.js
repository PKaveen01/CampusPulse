import api from './api'

export const ticketService = {
  async getMyTickets(status) {
    const params = {}
    if (status) params.status = status
    const { data } = await api.get('/tickets', { params })
    return data.data ?? []
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
