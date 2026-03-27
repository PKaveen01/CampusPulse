import React from 'react'

export default function StatCard({ icon: Icon, label, value, sub, color = 'var(--accent)', delay = 0 }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '20px 22px',
      display: 'flex', alignItems: 'flex-start', gap: 16,
      animation: `fadeIn 0.5s ease ${delay}s both`,
      transition: 'border-color 0.2s, transform 0.2s',
      cursor: 'default',
    }}
    onMouseOver={e => {
      e.currentTarget.style.borderColor = color
      e.currentTarget.style.transform = 'translateY(-2px)'
    }}
    onMouseOut={e => {
      e.currentTarget.style.borderColor = 'var(--border)'
      e.currentTarget.style.transform = 'none'
    }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
          {label}
        </p>
        <p style={{ fontSize: 26, fontWeight: 700, fontFamily: 'Space Grotesk', color: 'var(--text-primary)', lineHeight: 1.2, marginTop: 2 }}>
          {value}
        </p>
        {sub && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{sub}</p>}
      </div>
    </div>
  )
}
