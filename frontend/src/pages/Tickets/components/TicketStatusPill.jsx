import React from 'react'
import { STATUS_COLOR } from '../ticketConstants'

export default function TicketStatusPill({ status }) {
  const color = STATUS_COLOR[status] ?? 'var(--text-secondary)'

  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.06em',
        padding: '4px 10px',
        borderRadius: 999,
        color,
        border: `1px solid ${color}55`,
        background: `${color}14`,
      }}
    >
      {status?.replace('_', ' ') ?? 'UNKNOWN'}
    </span>
  )
}