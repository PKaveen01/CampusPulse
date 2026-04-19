import React, { useState } from 'react'
import { ShieldCheck, Wrench, UserCog, User, ChevronDown, Power, PowerOff } from 'lucide-react'

const ROLE_META = {
  ADMIN:      { label: 'Admin',       color: 'var(--role-admin)',       icon: ShieldCheck },
  MANAGER:    { label: 'Manager',     color: 'var(--role-manager)',     icon: UserCog },
  TECHNICIAN: { label: 'Technician',  color: 'var(--role-technician)',  icon: Wrench },
  USER:       { label: 'Student',     color: 'var(--role-user)',        icon: User },
}
const ALL_ROLES = ['USER', 'TECHNICIAN', 'MANAGER', 'ADMIN']

function Avatar({ user }) {
  if (user.avatarUrl) {
    return <img src={user.avatarUrl} alt={user.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
  }
  const initials = user.name?.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || '?'
  const meta = ROLE_META[user.role] ?? ROLE_META.USER
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      background: `${meta.color}22`, border: `1px solid ${meta.color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 700, color: meta.color,
    }}>{initials}</div>
  )
}

function RoleDropdown({ user, onChangeRole }) {
  const [open, setOpen] = useState(false)
  const meta = ROLE_META[user.role] ?? ROLE_META.USER
  const Icon = meta.icon

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', borderRadius: 20,
          background: `${meta.color}18`, border: `1px solid ${meta.color}40`,
          color: meta.color, fontSize: 12, fontWeight: 600,
          cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        <Icon size={11} />
        {meta.label}
        <ChevronDown size={10} style={{ opacity: 0.7, transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
      </button>

      {open && (
        <>
          {/* backdrop to close */}
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
          <div style={{
            position: 'absolute', top: '110%', left: 0, zIndex: 100,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', overflow: 'hidden',
            minWidth: 140, boxShadow: 'var(--shadow)',
            animation: 'fadeIn 0.15s ease',
          }}>
            {ALL_ROLES.map(r => {
              const m = ROLE_META[r]
              const Mi = m.icon
              return (
                <button
                  key={r}
                  onClick={() => { onChangeRole(user.id, r); setOpen(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '9px 14px', textAlign: 'left',
                    background: r === user.role ? `${m.color}14` : 'transparent',
                    color: r === user.role ? m.color : 'var(--text-secondary)',
                    fontSize: 13, fontWeight: r === user.role ? 600 : 400,
                    cursor: 'pointer', borderBottom: '1px solid var(--border)',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = `${m.color}20`}
                  onMouseOut={e => e.currentTarget.style.background = r === user.role ? `${m.color}14` : 'transparent'}
                >
                  <Mi size={12} style={{ color: m.color }} />
                  {m.label}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function UserTable({ users, onChangeRole, onToggleStatus, onViewDetail, loading }) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 13, animation: 'pulse 1.5s ease infinite' }}>Loading users…</div>
      </div>
    )
  }

  if (!users?.length) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: 14 }}>
        No users found matching your filters.
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {['User', 'Email', 'Role', 'Provider', 'Last Login', 'Status', 'Actions'].map(h => (
              <th key={h} style={{
                padding: '10px 14px', textAlign: 'left',
                color: 'var(--text-muted)', fontWeight: 600, fontSize: 11,
                textTransform: 'uppercase', letterSpacing: '0.05em',
                borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr
              key={u.id}
              style={{
                borderBottom: '1px solid var(--border)',
                animation: `fadeIn 0.3s ease ${i * 0.03}s both`,
                opacity: u.isActive ? 1 : 0.55,
                transition: 'opacity 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* User */}
              <td style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar user={u} />
                  <div>
                    <p
                      style={{ fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                      onClick={() => onViewDetail && onViewDetail(u)}
                      onMouseOver={e => e.currentTarget.style.color = 'var(--accent)'}
                      onMouseOut={e => e.currentTarget.style.color = 'var(--text-primary)'}
                    >
                      {u.name}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>ID #{u.id}</p>
                  </div>
                </div>
              </td>

              {/* Email */}
              <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{u.email}</td>

              {/* Role dropdown */}
              <td style={{ padding: '12px 14px' }}>
                <RoleDropdown user={u} onChangeRole={onChangeRole} />
              </td>

              {/* Provider */}
              <td style={{ padding: '12px 14px' }}>
                <span style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 20,
                  background: u.provider === 'GOOGLE' ? 'rgba(66,133,244,0.15)' : 'rgba(255,255,255,0.08)',
                  color: u.provider === 'GOOGLE' ? '#4285f4' : 'var(--text-secondary)',
                  fontWeight: 600,
                }}>
                  {u.provider ?? 'LOCAL'}
                </span>
              </td>

              {/* Last Login */}
              <td style={{ padding: '12px 14px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {formatDate(u.lastLogin)}
              </td>

              {/* Status */}
              <td style={{ padding: '12px 14px' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                  background: u.isActive ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
                  color: u.isActive ? 'var(--success)' : 'var(--danger)',
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: u.isActive ? 'var(--success)' : 'var(--danger)',
                    display: 'inline-block',
                    boxShadow: u.isActive ? '0 0 6px var(--success)' : 'none',
                  }} />
                  {u.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>

              {/* Actions */}
              <td style={{ padding: '12px 14px' }}>
                <button
                  onClick={() => onToggleStatus(u.id)}
                  title={u.isActive ? 'Deactivate user' : 'Activate user'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '5px 12px', borderRadius: 'var(--radius-sm)',
                    background: u.isActive ? 'rgba(248,113,113,0.1)' : 'rgba(52,211,153,0.1)',
                    border: `1px solid ${u.isActive ? 'rgba(248,113,113,0.3)' : 'rgba(52,211,153,0.3)'}`,
                    color: u.isActive ? 'var(--danger)' : 'var(--success)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={e => e.currentTarget.style.opacity = '0.8'}
                  onMouseOut={e => e.currentTarget.style.opacity = '1'}
                >
                  {u.isActive
                    ? <><PowerOff size={12} /> Deactivate</>
                    : <><Power size={12} /> Activate</>
                  }
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
