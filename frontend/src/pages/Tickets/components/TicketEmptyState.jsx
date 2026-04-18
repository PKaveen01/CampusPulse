import React from 'react'
import { Wrench } from 'lucide-react'

export default function TicketEmptyState() {
  return (
    <div
      style={{
        padding: 28,
        borderRadius: 14,
        border: '1px dashed var(--border)',
        textAlign: 'center',
        color: 'var(--text-secondary)',
      }}
    >
      <Wrench size={18} style={{ margin: '0 auto 8px auto', color: 'var(--warning)' }} />
      <p style={{ marginBottom: 4, color: 'var(--text-primary)', fontWeight: 600 }}>No tickets yet</p>
      <p style={{ fontSize: 13 }}>Create your first incident ticket to report an issue.</p>
    </div>
  )
}