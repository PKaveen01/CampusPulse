import React from 'react'
import { Clock3 } from 'lucide-react'
import TicketStatusPill from './TicketStatusPill'
import TicketEmptyState from './TicketEmptyState'

export default function TicketList({ loading, tickets, onViewDetails }) {
  return (
    <section
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: 20,
      }}
    >
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>My Ticket List</h2>
      {loading ? (
        <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock3 size={14} /> Loading tickets...
        </p>
      ) : tickets.length === 0 ? (
        <TicketEmptyState />
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: 14,
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <strong>{ticket.ticketNumber}</strong>
                  <TicketStatusPill status={ticket.status} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Priority: {ticket.priority}</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '-'}
                </span>
              </div>
              <p style={{ color: 'var(--text-primary)', marginBottom: 6 }}>{ticket.description}</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Category: {ticket.category} • Location: {ticket.location || 'N/A'}
              </p>
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => onViewDetails(ticket.id)}
                  style={{
                    padding: '7px 11px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontSize: 12,
                    fontWeight: 700,
                    background: 'rgba(255,255,255,0.03)',
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}