import React from 'react'
import { CalendarClock, Clock3, MapPin, Tag, Trash2 } from 'lucide-react'
import TicketStatusPill from './TicketStatusPill'
import TicketEmptyState from './TicketEmptyState'

export default function TicketList({ loading, tickets, currentUserId, deletingTicketId, onViewDetails, onDeleteTicket }) {
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
        <div style={{ display: 'grid', gap: 14 }}>
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: 16,
                background: 'linear-gradient(145deg, rgba(15,23,42,0.72), rgba(30,41,59,0.44))',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 10px 24px rgba(2,6,23,0.25)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                <div style={{ display: 'grid', gap: 6 }}>
                  <strong style={{ fontSize: 15, letterSpacing: '0.02em' }}>{ticket.ticketNumber}</strong>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <PriorityPill priority={ticket.priority} />
                    <MetaPill icon={Tag} value={formatCategory(ticket.category)} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <TicketStatusPill status={ticket.status} />
                  <MetaPill icon={CalendarClock} value={formatDate(ticket.createdAt)} />
                </div>
              </div>

              <p style={{ color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.45, marginBottom: 10 }}>
                {ticket.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                <MetaPill icon={MapPin} value={ticket.location || 'Location not specified'} />
              </div>

              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
                {ticket.userId === currentUserId && (
                  <button
                    onClick={() => onDeleteTicket(ticket)}
                    disabled={deletingTicketId === ticket.id}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid rgba(248,113,113,0.55)',
                      color: '#fecaca',
                      fontSize: 12,
                      fontWeight: 700,
                      background: deletingTicketId === ticket.id ? 'rgba(248,113,113,0.3)' : 'rgba(248,113,113,0.12)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Trash2 size={13} />
                    {deletingTicketId === ticket.id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
                <button
                  onClick={() => onViewDetails(ticket.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    color: '#dbeafe',
                    fontSize: 12,
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.35), rgba(30,64,175,0.35))',
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

function MetaPill({ icon: Icon, value }) {
  return (
    <span
      style={{
        fontSize: 11,
        borderRadius: 999,
        padding: '4px 9px',
        background: 'rgba(148,163,184,0.16)',
        color: 'var(--text-secondary)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
      }}
    >
      <Icon size={11} /> {value}
    </span>
  )
}

function PriorityPill({ priority }) {
  const palette = {
    CRITICAL: { bg: 'rgba(248,113,113,0.16)', color: '#fca5a5' },
    HIGH: { bg: 'rgba(251,191,36,0.16)', color: '#fcd34d' },
    MEDIUM: { bg: 'rgba(56,189,248,0.16)', color: '#7dd3fc' },
    LOW: { bg: 'rgba(52,211,153,0.16)', color: '#6ee7b7' },
  }

  const token = palette[priority] ?? { bg: 'rgba(148,163,184,0.16)', color: '#cbd5e1' }

  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.05em',
        borderRadius: 999,
        padding: '4px 10px',
        background: token.bg,
        color: token.color,
      }}
    >
      {priority}
    </span>
  )
}

function formatCategory(value) {
  if (!value) return 'UNKNOWN'
  return value.replaceAll('_', ' ')
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}