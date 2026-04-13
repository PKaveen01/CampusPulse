import api from './api'

export const resourceService = {
  async getResources() {
    const { data } = await api.get('/resources')
    return data.data ?? []
  },
}
