import React from 'react'
import { Users, ShieldCheck, Wrench, UserCog, UserX } from 'lucide-react'

const STAT_ITEMS = [
  { key: 'total',       label: 'Total Users',  icon: Users,       color: 'var(--accent)' },
  { key: 'active',      label: 'Active',       icon: UserCog,     color: 'var(--success)' },
  { key: 'inactive',    label: 'Inactive',     icon: UserX,       color: 'var(--danger)' },
  { key: 'admins',      label: 'Admins',       icon: ShieldCheck, color: 'var(--role-admin)' },
  { key: 'managers',    label: 'Managers',     icon: UserCog,     color: 'var(--role-manager)' },
  { key: 'technicians', label: 'Technicians',  icon: Wrench,      color: 'var(--role-technician)' },
  { key: 'users',       label: 'Students',     icon: Users,       color: 'var(--role-user)' },
]

export default function UserStatsBar({ stats, loading }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: 12,
      marginBottom: 28,
    }}>
      {STAT_ITEMS.map(({ key, label, icon: Icon, color }, i) => (
        <div
          key={key}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            animation: `fadeIn 0.4s ease ${i * 0.05}s both`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
            <Icon size={13} style={{ color }} />
          </div>
          <span style={{
            fontSize: 24,
            fontFamily: 'Space Grotesk',
            fontWeight: 700,
            color: loading ? 'var(--text-muted)' : color,
            transition: 'color 0.3s',
          }}>
            {loading ? '—' : (stats?.[key] ?? 0)}
          </span>
        </div>
      ))}
    </div>
  )
}
