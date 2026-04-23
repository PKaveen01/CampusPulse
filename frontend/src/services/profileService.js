import api from './api'

/**
 * Profile API service
 * All calls are authenticated via the JWT interceptor in api.js
 */
export const profileService = {
  /**
   * Fetch the full profile of the currently authenticated user.
   * @returns {Promise<UserDTO>}
   */
  async getProfile() {
    const { data } = await api.get('/profile')
    return data.data
  },

  /**
   * Update basic profile fields.
   * @param {{ name: string, phone?: string, department?: string, bio?: string }} payload
   * @returns {Promise<UserDTO>}
   */
  async updateProfile(payload) {
    const { data } = await api.put('/profile', payload)
    return data.data
  },

  /**
   * Upload a new avatar image.
   * @param {File} file - image file (jpeg / png)
   * @returns {Promise<UserDTO>}
   */
  async uploadAvatar(file) {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data
  },

  /**
   * Remove the current avatar (revert to initials).
   * @returns {Promise<UserDTO>}
   */
  async removeAvatar() {
    const { data } = await api.delete('/profile/avatar')
    return data.data
  },

  /**
   * Change local-auth password.
   * @param {{ currentPassword: string, newPassword: string }} payload
   * @returns {Promise<void>}
   */
  async changePassword(payload) {
    const { data } = await api.put('/profile/password', payload)
    return data
  },

  /**
   * Permanently delete the current user's account.
   * @param {string|null} password - required for local-auth accounts; omit for OAuth2.
   * @returns {Promise<void>}
   */
  async deleteAccount(password = null) {
    const { data } = await api.delete('/profile', {
      data: password ? { password } : {},
    })
    return data
  },
}
