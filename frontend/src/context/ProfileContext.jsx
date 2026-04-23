import React, { createContext, useContext, useState, useCallback } from 'react'
import { profileService } from '../services/profileService'
import { useAuth } from './AuthContext'

const ProfileContext = createContext(null)

/**
 * ProfileProvider wraps the app and makes profile data + mutators
 * available to any component via useProfile().
 *
 * It is intentionally separate from AuthContext so that profile changes
 * (e.g. avatar, bio) don't cause a full auth-state re-render.
 */
export function ProfileProvider({ children }) {
  const { refetchUser } = useAuth()

  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(false)
  const [saving,  setSaving]    = useState(false)
  const [error,   setError]     = useState(null)

  /** Load fresh profile data from the backend */
  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await profileService.getProfile()
      setProfile(data)
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [])

  /** Save name / phone / department / bio */
  const updateProfile = useCallback(async (payload) => {
    setSaving(true)
    setError(null)
    try {
      const updated = await profileService.updateProfile(payload)
      setProfile(updated)
      // Keep AuthContext user in sync (name may have changed)
      await refetchUser()
      return updated
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Update failed'
      setError(msg)
      throw new Error(msg)
    } finally {
      setSaving(false)
    }
  }, [refetchUser])

  /** Upload a new avatar image */
  const uploadAvatar = useCallback(async (file) => {
    setSaving(true)
    setError(null)
    try {
      const updated = await profileService.uploadAvatar(file)
      setProfile(updated)
      await refetchUser()
      return updated
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Avatar upload failed'
      setError(msg)
      throw new Error(msg)
    } finally {
      setSaving(false)
    }
  }, [refetchUser])

  /** Remove avatar (revert to initials) */
  const removeAvatar = useCallback(async () => {
    setSaving(true)
    setError(null)
    try {
      const updated = await profileService.removeAvatar()
      setProfile(updated)
      await refetchUser()
      return updated
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Remove avatar failed'
      setError(msg)
      throw new Error(msg)
    } finally {
      setSaving(false)
    }
  }, [refetchUser])

  /** Change password (local-auth only) */
  const changePassword = useCallback(async (payload) => {
    setSaving(true)
    setError(null)
    try {
      await profileService.changePassword(payload)
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Password change failed'
      setError(msg)
      throw new Error(msg)
    } finally {
      setSaving(false)
    }
  }, [])

  /** Permanently delete the user's own account */
  const deleteAccount = useCallback(async (password = null) => {
    setSaving(true)
    setError(null)
    try {
      await profileService.deleteAccount(password)
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Account deletion failed'
      setError(msg)
      throw new Error(msg)
    } finally {
      setSaving(false)
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return (
    <ProfileContext.Provider value={{
      profile, loading, saving, error,
      fetchProfile, updateProfile, uploadAvatar, removeAvatar, changePassword, deleteAccount,
      clearError,
    }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider')
  return ctx
}
