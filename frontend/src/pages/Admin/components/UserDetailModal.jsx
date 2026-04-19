import React from 'react'
import { X, Mail, Calendar, Clock, Shield, Globe } from 'lucide-react'

const ROLE_META = {
  ADMIN:      { label: 'Admin',       color: 'var(--role-admin)' },
  MANAGER:    { label: 'Manager',     color: 'var(--role-manager)' },
  TECHNICIAN: { label: 'Technician',  color: 'var(--role-technician)' },
  USER:       { label: 'Student',     color: 'var(--role-user)' },
}

function Field({ icon: Icon, label, value }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '12px 0', borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: 'rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={14} style={{ color: 'var(--text-muted)' }} />
      </div>
      <div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        <p style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{value || '—'}</p>
      </div>
    </div>
  )
}

export default function UserDetailModal({ user, onClose }) {
  if (!user) return null

  const meta = ROLE_META[user.role] ?? ROLE_META.USER
  const initials = user.name?.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || '?'

  const fmt = d => d ? new Date(d).toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : '—'

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 440,
          maxHeight: '90vh', overflowY: 'auto',
          animation: 'fadeIn 0.25s ease',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 17, fontWeight: 700 }}>User Profile</h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {/* Avatar & name */}
        <div style={{
          padding: '24px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)',
        }}>
          {user.avatarUrl
            ? <img src={user.avatarUrl} alt={user.name} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${meta.color}` }} />
            : <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: `${meta.color}22`, border: `2px solid ${meta.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 700, color: meta.color, fontFamily: 'Space Grotesk',
              }}>{initials}</div>
          }
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 700 }}>{user.name}</h3>
            <span style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 700,
              background: `${meta.color}18`, color: meta.color, marginTop: 6, display: 'inline-block',
            }}>
              {meta.label}
            </span>
          </div>
          <span style={{
            fontSize: 12, padding: '3px 12px', borderRadius: 20,
            background: user.isActive ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
            color: user.isActive ? 'var(--success)' : 'var(--danger)', fontWeight: 600,
          }}>
            {user.isActive ? '● Active' : '● Inactive'}
          </span>
        </div>

        {/* Fields */}
        <div style={{ padding: '4px 24px 20px' }}>
          <Field icon={Mail}     label="Email"         value={user.email} />
          <Field icon={Shield}   label="Role"          value={meta.label} />
          <Field icon={Globe}    label="Auth Provider" value={user.provider ?? 'LOCAL'} />
          <Field icon={Clock}    label="Last Login"    value={fmt(user.lastLogin)} />
          <Field icon={Calendar} label="Joined"        value={fmt(user.createdAt)} />
        </div>
      </div>
    </div>
  )
}
