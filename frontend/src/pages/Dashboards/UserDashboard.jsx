import React, { useEffect, useState, useCallback } from 'react'
import { BookOpen, Wrench, Building2, Clock, CheckCircle, Plus, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/layout/Navbar'
import StatCard from '../../components/common/StatCard'
import { ticketService } from '../../services/ticketService'
import bookingService from '../../services/bookingService'
import resourceService from '../../services/resourceService'

const STATUS_STYLE = {
  APPROVED:    { bg: 'rgba(52,211,153,0.12)',  color: '#34d399',  label: 'Approved' },
  PENDING:     { bg: 'rgba(251,191,36,0.12)',   color: '#fbbf24',  label: 'Pending' },
  REJECTED:    { bg: 'rgba(248,113,113,0.12)',  color: '#f87171',  label: 'Rejected' },
  CANCELLED:   { bg: 'rgba(156,163,175,0.12)',  color: '#9ca3af',  label: 'Cancelled' },
  OPEN:        { bg: 'rgba(96,165,250,0.12)',   color: '#60a5fa',  label: 'Open' },
  IN_PROGRESS: { bg: 'rgba(251,191,36,0.12)',   color: '#fbbf24',  label: 'In Progress' },
  RESOLVED:    { bg: 'rgba(52,211,153,0.12)',   color: '#34d399',  label: 'Resolved' },
  CLOSED:      { bg: 'rgba(156,163,175,0.12)',  color: '#9ca3af',  label: 'Closed' },
}

const PRIORITY_COLOR = { CRITICAL: 'var(--danger)', HIGH: 'var(--danger)', MEDIUM: 'var(--warning)', LOW: 'var(--success)' }

function Badge({ status }) {
  const s = STATUS_STYLE[status] ?? { bg: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)', label: status }
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: s.bg, color: s.color, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  )
}

function formatDateTime(b) {
  if (b.bookingDate && b.startTime) return `${b.bookingDate}  ${b.startTime}–${b.endTime ?? ''}`
  if (b.startTime) return b.startTime
  return '—'
}

export default function UserDashboard() {
  const { user } = useAuth()

  const [bookings,         setBookings]         = useState([])
  const [tickets,          setTickets]          = useState([])
  const [availableCount,   setAvailableCount]   = useState(0)
  const [loading,          setLoading]          = useState({ bookings: true, tickets: true, resources: true })
  const [errors,           setErrors]           = useState({})

  const loadAll = useCallback(async () => {
    setLoading({ bookings: true, tickets: true, resources: true })
    setErrors({})

    // My Bookings
    try {
      const res = await bookingService.getMyBookings(0, 20)
      const list = Array.isArray(res?.content) ? res.content : Array.isArray(res) ? res : []
      setBookings(list)
    } catch { setErrors(e => ({ ...e, bookings: 'Failed to load bookings' })) }
    setLoading(l => ({ ...l, bookings: false }))

    // My Tickets
    try {
      const data = await ticketService.getMyTickets()
      setTickets(Array.isArray(data) ? data : [])
    } catch { setErrors(e => ({ ...e, tickets: 'Failed to load tickets' })) }
    setLoading(l => ({ ...l, tickets: false }))

    // Available Resources count
    try {
      const resources = await resourceService.getResources(0, 1000)
      const arr = Array.isArray(resources) ? resources : []
      setAvailableCount(arr.filter(r => r.status === 'ACTIVE').length)
    } catch { /* non-critical */ }
    setLoading(l => ({ ...l, resources: false }))
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const pendingBookings  = bookings.filter(b => b.status === 'PENDING').length
  const openTickets      = tickets.filter(t => t.status === 'OPEN').length
  const inProgressTickets = tickets.filter(t => t.status === 'IN_PROGRESS').length
  const resolvedTickets  = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length

  const recentBookings = bookings.slice(0, 4)
  const recentTickets  = tickets.slice(0, 4)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Welcome */}
        <div style={{ marginBottom: 32, animation: 'fadeIn 0.4s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
              Welcome back, <span style={{ color: 'var(--accent)' }}>{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>Here's a quick overview of your campus activity.</p>
          </div>
          <button onClick={loadAll} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', marginTop: 4 }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          <StatCard
            icon={BookOpen}
            label="My Bookings"
            value={loading.bookings ? '…' : String(bookings.length)}
            sub={loading.bookings ? 'Loading…' : `${pendingBookings} pending approval`}
            color="var(--accent)"
            delay={0.05}
          />
          <StatCard
            icon={Wrench}
            label="Open Tickets"
            value={loading.tickets ? '…' : String(openTickets + inProgressTickets)}
            sub={loading.tickets ? 'Loading…' : `${inProgressTickets} in progress`}
            color="var(--warning)"
            delay={0.1}
          />
          <StatCard
            icon={Building2}
            label="Resources"
            value={loading.resources ? '…' : String(availableCount)}
            sub="Available today"
            color="var(--success)"
            delay={0.15}
          />
          <StatCard
            icon={CheckCircle}
            label="Resolved"
            value={loading.tickets ? '…' : String(resolvedTickets)}
            sub="Tickets resolved"
            color="var(--accent-2)"
            delay={0.2}
          />
        </div>

        {/* Content grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>

          {/* Recent Bookings */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, animation: 'fadeIn 0.5s ease 0.2s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 600 }}>Recent Bookings</h2>
              <Link to="/bookings" style={{ fontSize: 13, color: 'var(--accent)' }}>View all →</Link>
            </div>

            {loading.bookings ? (
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Loading bookings…</p>
            ) : errors.bookings ? (
              <p style={{ fontSize: 12, color: 'var(--danger)' }}>{errors.bookings}</p>
            ) : recentBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
                <BookOpen size={28} style={{ marginBottom: 8, opacity: 0.3 }} />
                <p style={{ fontSize: 13 }}>No bookings yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recentBookings.map(b => (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>
                        {b.resourceName ?? b.resource?.name ?? `Resource #${b.resourceId}`}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} /> {formatDateTime(b)}
                      </p>
                    </div>
                    <Badge status={b.status} />
                  </div>
                ))}
              </div>
            )}

            <Link to="/bookings"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, padding: '9px', borderRadius: 8, border: '1px dashed var(--border)', color: 'var(--text-muted)', fontSize: 13, transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
              <Plus size={14} /> New booking
            </Link>
          </div>

          {/* My Tickets */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, animation: 'fadeIn 0.5s ease 0.25s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 600 }}>My Tickets</h2>
              <Link to="/tickets" style={{ fontSize: 13, color: 'var(--warning)' }}>View all →</Link>
            </div>

            {loading.tickets ? (
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Loading tickets…</p>
            ) : errors.tickets ? (
              <p style={{ fontSize: 12, color: 'var(--danger)' }}>{errors.tickets}</p>
            ) : recentTickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
                <CheckCircle size={28} style={{ marginBottom: 8, opacity: 0.3 }} />
                <p style={{ fontSize: 13 }}>No tickets raised</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recentTickets.map(t => (
                  <div key={t.id} style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>{t.ticketNumber}</p>
                        <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{t.description}</p>
                      </div>
                      <Badge status={t.status} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <span style={{ fontSize: 11, color: PRIORITY_COLOR[t.priority] ?? 'var(--text-muted)', fontWeight: 600 }}>
                        ● {t.priority}
                      </span>
                      {t.category && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.category}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link to="/tickets/new"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, padding: '9px', borderRadius: 8, border: '1px dashed var(--border)', color: 'var(--text-muted)', fontSize: 13, transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--warning)'; e.currentTarget.style.color = 'var(--warning)' }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
              <Plus size={14} /> Report issue
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
