import React from 'react'
import { Search, X } from 'lucide-react'

const ROLES = ['', 'ADMIN', 'MANAGER', 'TECHNICIAN', 'USER']
const ROLE_LABELS = { '': 'All Roles', ADMIN: 'Admin', MANAGER: 'Manager', TECHNICIAN: 'Technician', USER: 'Student' }

const inputStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-primary)',
  padding: '9px 12px',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.2s',
}

export default function UserFilters({ filters, onChange }) {
  const { query, role, isActive } = filters

  const set = (key, val) => onChange({ ...filters, [key]: val })
  const clear = () => onChange({ query: '', role: '', isActive: null })
  const hasFilters = query || role || isActive != null

  return (
    <div style={{
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap',
      alignItems: 'center',
      marginBottom: 20,
    }}>
      {/* Search */}
      <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
        <Search size={14} style={{
          position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)', pointerEvents: 'none',
        }} />
        <input
          value={query}
          onChange={e => set('query', e.target.value)}
          placeholder="Search by name or email…"
          style={{ ...inputStyle, paddingLeft: 32 }}
          onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      {/* Role filter */}
      <select
        value={role}
        onChange={e => set('role', e.target.value)}
        style={{ ...inputStyle, width: 'auto', minWidth: 130, flex: '0 0 auto' }}
      >
        {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
      </select>

      {/* Status filter */}
      <select
        value={isActive == null ? '' : String(isActive)}
        onChange={e => set('isActive', e.target.value === '' ? null : e.target.value === 'true')}
        style={{ ...inputStyle, width: 'auto', minWidth: 130, flex: '0 0 auto' }}
      >
        <option value="">All Status</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clear}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '9px 14px', borderRadius: 'var(--radius-sm)',
            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
            color: 'var(--danger)', fontSize: 13, fontWeight: 500,
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          <X size={13} /> Clear
        </button>
      )}
    </div>
  )
}
