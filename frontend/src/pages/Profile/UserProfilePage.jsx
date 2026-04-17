import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Mail, Phone, Building2, FileText, Lock,
  Camera, Trash2, Save, ArrowLeft, CheckCircle, AlertCircle,
  Eye, EyeOff, Shield, Calendar, Clock,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useProfile } from '../../context/ProfileContext'
import Navbar from '../../components/layout/Navbar'
import ProfileAvatar from '../../components/common/ProfileAvatar'

// ─── small helpers ────────────────────────────────────────────────────────────

function Toast({ message, type = 'success', onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div style={{
      position: 'fixed', bottom: 32, right: 32, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 20px', borderRadius: 12,
      background: type === 'success' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
      border: `1px solid ${type === 'success' ? 'rgba(52,211,153,0.4)' : 'rgba(248,113,113,0.4)'}`,
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      animation: 'fadeIn 0.3s ease',
      maxWidth: 360,
    }}>
      {type === 'success'
        ? <CheckCircle size={18} color="#34d399" />
        : <AlertCircle size={18} color="#f87171" />}
      <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{message}</span>
    </div>
  )
}

function FieldRow({ icon: Icon, label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        {Icon && <Icon size={13} />}
        {label}
      </label>
      {children}
    </div>
  )
}

const INPUT = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '10px 14px',
  color: 'var(--text-primary)',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.2s',
}

function Input({ style, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      {...props}
      style={{ ...INPUT, borderColor: focused ? 'var(--accent)' : 'var(--border)', ...style }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

function Textarea({ style, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <textarea
      {...props}
      style={{
        ...INPUT, resize: 'vertical', minHeight: 90,
        borderColor: focused ? 'var(--accent)' : 'var(--border)',
        fontFamily: 'inherit', lineHeight: 1.6,
        ...style,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

function Btn({ children, variant = 'primary', loading, style, ...props }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '10px 22px', borderRadius: 10, fontWeight: 600, fontSize: 14,
    cursor: loading ? 'not-allowed' : 'pointer',
    border: 'none', transition: 'all 0.2s', opacity: loading ? 0.7 : 1,
  }
  const variants = {
    primary: { background: 'var(--accent)', color: '#fff' },
    danger:  { background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' },
    ghost:   { background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border)' },
  }
  return (
    <button style={{ ...base, ...variants[variant], ...style }} disabled={loading} {...props}>
      {loading ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> : null}
      {children}
    </button>
  )
}

function SectionCard({ children, style }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: '28px 32px',
      ...style,
    }}>
      {children}
    </div>
  )
}

// ─── role badge ───────────────────────────────────────────────────────────────
const ROLE_STYLE = {
  USER:       { bg: 'rgba(79,142,247,0.12)',  color: '#4f8ef7' },
  TECHNICIAN: { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
  MANAGER:    { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa' },
  ADMIN:      { bg: 'rgba(248,113,113,0.12)', color: '#f87171' },
}

function RoleBadge({ role }) {
  const s = ROLE_STYLE[role] ?? ROLE_STYLE.USER
  return (
    <span style={{
      fontSize: 11, fontWeight: 700,
      padding: '3px 10px', borderRadius: 20,
      background: s.bg, color: s.color,
      textTransform: 'uppercase', letterSpacing: '0.08em',
    }}>{role}</span>
  )
}

// ─── Tab IDs ──────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'info',     label: 'Profile Info',   icon: User },
  { id: 'avatar',  label: 'Profile Photo',  icon: Camera },
  { id: 'security',label: 'Security',        icon: Shield },
]

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UserProfilePage() {
  const { user } = useAuth()
  const {
    profile, loading, saving,
    fetchProfile, updateProfile, uploadAvatar, removeAvatar, changePassword,
  } = useProfile()
  const navigate = useNavigate()

  const [activeTab,  setActiveTab]  = useState('info')
  const [toast,      setToast]      = useState(null)  // { message, type }
  const fileRef = useRef(null)

  // ── Profile form state ──
  const [form, setForm] = useState({ name: '', phone: '', department: '', bio: '' })

  // ── Password form state ──
  const [pwForm,    setPwForm]    = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPw,    setShowPw]    = useState({ current: false, new: false, confirm: false })
  const [pwError,   setPwError]   = useState('')

  // ── Avatar preview ──
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile,    setAvatarFile]    = useState(null)

  useEffect(() => { fetchProfile() }, [fetchProfile])

  useEffect(() => {
    if (profile) {
      setForm({
        name:       profile.name       ?? '',
        phone:      profile.phone      ?? '',
        department: profile.department ?? '',
        bio:        profile.bio        ?? '',
      })
    }
  }, [profile])

  const showToast = (message, type = 'success') => setToast({ message, type })

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────

  const handleProfileSave = async (e) => {
    e.preventDefault()
    try {
      await updateProfile(form)
      showToast('Profile updated successfully!')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file.', 'error')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5 MB.', 'error')
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return
    try {
      await uploadAvatar(avatarFile)
      setAvatarFile(null)
      setAvatarPreview(null)
      showToast('Profile photo updated!')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleAvatarRemove = async () => {
    if (!window.confirm('Remove your profile photo?')) return
    try {
      await removeAvatar()
      setAvatarPreview(null)
      setAvatarFile(null)
      showToast('Profile photo removed.')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwError('')
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match.')
      return
    }
    if (pwForm.newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.')
      return
    }
    try {
      await changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword,
      })
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      showToast('Password changed successfully!')
    } catch (err) {
      setPwError(err.message)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  const displayProfile = profile ?? user

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ paddingTop: 88, paddingBottom: 60, maxWidth: 860, margin: '0 auto', padding: '88px 24px 60px' }}>

        {/* ── Back button ── */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', color: 'var(--text-secondary)',
            cursor: 'pointer', fontSize: 14, marginBottom: 28, padding: 0,
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* ── Hero card ── */}
        <SectionCard style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <ProfileAvatar
            name={displayProfile?.name ?? ''}
            avatarUrl={displayProfile?.avatarUrl}
            size={80}
          />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {displayProfile?.name ?? '—'}
              </h1>
              <RoleBadge role={displayProfile?.role ?? 'USER'} />
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
              {displayProfile?.email}
            </p>
            {displayProfile?.department && (
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
                {displayProfile.department}
              </p>
            )}
          </div>
          {/* Stat pills */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { icon: Calendar, label: 'Member since', value: displayProfile?.createdAt ? new Date(displayProfile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—' },
              { icon: Clock,    label: 'Last login',   value: displayProfile?.lastLogin  ? new Date(displayProfile.lastLogin ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Now' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '10px 16px', textAlign: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                  <Icon size={12} /> {label}
                </div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 14 }}>{value}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 4 }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '9px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
              background: activeTab === id ? 'var(--accent)' : 'transparent',
              color: activeTab === id ? '#fff' : 'var(--text-secondary)',
            }}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* ══════════ TAB: Profile Info ══════════ */}
        {activeTab === 'info' && (
          <SectionCard>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading…</div>
            ) : (
              <form onSubmit={handleProfileSave}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24, color: 'var(--text-primary)' }}>
                  Personal Information
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginBottom: 20 }}>

                  <FieldRow icon={User} label="Full Name">
                    <Input
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your full name"
                      required
                    />
                  </FieldRow>

                  <FieldRow icon={Mail} label="Email Address">
                    <Input
                      value={displayProfile?.email ?? ''}
                      disabled
                      style={{ opacity: 0.5, cursor: 'not-allowed' }}
                    />
                  </FieldRow>

                  <FieldRow icon={Phone} label="Phone Number">
                    <Input
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+94 71 234 5678"
                      maxLength={20}
                    />
                  </FieldRow>

                  <FieldRow icon={Building2} label="Department">
                    <Input
                      value={form.department}
                      onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                      placeholder="e.g. Engineering, Administration"
                      maxLength={100}
                    />
                  </FieldRow>
                </div>

                <FieldRow icon={FileText} label="Bio">
                  <Textarea
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="A short description about yourself…"
                    maxLength={500}
                    rows={3}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
                    {form.bio.length}/500
                  </span>
                </FieldRow>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28 }}>
                  <Btn type="submit" loading={saving}>
                    <Save size={15} /> Save Changes
                  </Btn>
                </div>
              </form>
            )}
          </SectionCard>
        )}

        {/* ══════════ TAB: Avatar ══════════ */}
        {activeTab === 'avatar' && (
          <SectionCard>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
              Profile Photo
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 28 }}>
              Upload a JPG or PNG image. Maximum file size: 5 MB.
            </p>

            {/* Current + preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap', marginBottom: 32 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Current</p>
                <ProfileAvatar
                  name={displayProfile?.name ?? ''}
                  avatarUrl={displayProfile?.avatarUrl}
                  size={90}
                />
              </div>

              {avatarPreview && (
                <>
                  <div style={{ fontSize: 22, color: 'var(--text-muted)' }}>→</div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Preview</p>
                    <ProfileAvatar
                      name={displayProfile?.name ?? ''}
                      avatarUrl={avatarPreview}
                      size={90}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Dropzone / file picker */}
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: '2px dashed var(--border)', borderRadius: 12,
                padding: '32px 24px', textAlign: 'center', cursor: 'pointer',
                transition: 'border-color 0.2s, background 0.2s',
                background: 'rgba(79,142,247,0.03)',
                marginBottom: 20,
              }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault()
                const file = e.dataTransfer.files?.[0]
                if (file) {
                  const syntheticEvent = { target: { files: [file] } }
                  handleAvatarFileChange(syntheticEvent)
                }
              }}
            >
              <Camera size={28} color="var(--text-muted)" style={{ marginBottom: 10 }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
                Click or drag an image here
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>JPG, PNG · max 5 MB</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                style={{ display: 'none' }}
                onChange={handleAvatarFileChange}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {avatarFile && (
                <Btn onClick={handleAvatarUpload} loading={saving}>
                  <Camera size={15} /> Upload Photo
                </Btn>
              )}
              {displayProfile?.avatarUrl && !avatarFile && (
                <Btn variant="danger" onClick={handleAvatarRemove} loading={saving}>
                  <Trash2 size={15} /> Remove Photo
                </Btn>
              )}
              {avatarFile && (
                <Btn variant="ghost" onClick={() => { setAvatarFile(null); setAvatarPreview(null) }}>
                  Cancel
                </Btn>
              )}
            </div>
          </SectionCard>
        )}

        {/* ══════════ TAB: Security ══════════ */}
        {activeTab === 'security' && (
          <SectionCard>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
              Change Password
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
              {displayProfile?.provider === 'GOOGLE'
                ? 'Password changes are not available for Google accounts. Your account is secured by Google OAuth2.'
                : 'Update your password. You will stay logged in.'}
            </p>

            {displayProfile?.provider === 'GOOGLE' ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '16px 20px', borderRadius: 12,
                background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.2)',
              }}>
                <Shield size={20} color="var(--accent)" />
                <div>
                  <p style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, margin: 0 }}>Google account</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>Your account is secured by Google OAuth2.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePasswordChange}>
                {pwError && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
                    padding: '12px 16px', borderRadius: 10,
                    background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                    color: '#f87171', fontSize: 14,
                  }}>
                    <AlertCircle size={16} />{pwError}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 420 }}>
                  {[
                    { key: 'currentPassword', label: 'Current Password',  pwKey: 'current' },
                    { key: 'newPassword',     label: 'New Password',      pwKey: 'new' },
                    { key: 'confirmPassword', label: 'Confirm New Password', pwKey: 'confirm' },
                  ].map(({ key, label, pwKey }) => (
                    <FieldRow key={key} icon={Lock} label={label}>
                      <div style={{ position: 'relative' }}>
                        <Input
                          type={showPw[pwKey] ? 'text' : 'password'}
                          value={pwForm[key]}
                          onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                          placeholder="••••••••"
                          required
                          style={{ paddingRight: 44 }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(s => ({ ...s, [pwKey]: !s[pwKey] }))}
                          style={{
                            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--text-muted)', padding: 0, display: 'flex',
                          }}
                        >
                          {showPw[pwKey] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FieldRow>
                  ))}
                </div>

                <div style={{ marginTop: 28 }}>
                  <Btn type="submit" loading={saving}>
                    <Lock size={15} /> Update Password
                  </Btn>
                </div>
              </form>
            )}
          </SectionCard>
        )}
      </div>

      {/* ── Toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  )
}
