import React, { useEffect, useMemo, useState } from 'react'
import { Wrench, Clock, CheckCircle, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/layout/Navbar'
import StatCard from '../../components/common/StatCard'
import { ticketService } from '../../services/ticketService'

const PRIORITY_COLOR = { CRITICAL: 'var(--danger)', HIGH: 'var(--warning)', MEDIUM: 'var(--info)', LOW: 'var(--success)' }
const STATUS_STYLE = {
  OPEN:       { bg: 'rgba(96,165,250,0.12)', color: '#60a5fa' },
  IN_PROGRESS:{ bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24' },
  RESOLVED:   { bg: 'rgba(52,211,153,0.12)', color: '#34d399' },
}

export default function TechnicianDashboard() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [acceptingId, setAcceptingId] = useState(null)

  useEffect(() => {
    loadAssignedTickets()
  }, [])

  const openCount = useMemo(() => tickets.filter(t => t.status === 'OPEN').length, [tickets])
  const inProgressCount = useMemo(() => tickets.filter(t => t.status === 'IN_PROGRESS').length, [tickets])
  const resolvedCount = useMemo(() => tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length, [tickets])
  const criticalCount = useMemo(() => tickets.filter(t => t.priority === 'CRITICAL').length, [tickets])

  async function loadAssignedTickets() {
    setLoading(true)
    setError('')
    try {
      const data = await ticketService.getMyTickets()
      setTickets(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load assigned tickets')
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  async function handleAccept(ticket) {
    if (!ticket?.id || ticket.status !== 'OPEN') return

    setAcceptingId(ticket.id)
    setError('')
    setMessage('')

    try {
      await ticketService.acceptAssignedTicket(ticket.id)
      setMessage(`Ticket ${ticket.ticketNumber} accepted successfully.`)
      await loadAssignedTickets()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to accept ticket')
    } finally {
      setAcceptingId(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ marginBottom: 32, animation: 'fadeIn 0.4s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700 }}>
              Technician Dashboard
            </h1>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(251,191,36,0.15)', color: 'var(--role-technician)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {user?.role}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Hello <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong> — here are your assigned maintenance tasks.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            {error && <p style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</p>}
            {message && <p style={{ fontSize: 12, color: 'var(--success)' }}>{message}</p>}
          </div>
          <button
            onClick={loadAssignedTickets}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          <StatCard icon={Wrench}       label="Assigned to Me"  value={String(tickets.length)}  sub={`${openCount} open, ${inProgressCount} in progress`} color="var(--warning)" delay={0.05} />
          <StatCard icon={AlertTriangle} label="Critical"        value={String(criticalCount)}  sub="Needs immediate attention" color="var(--danger)" delay={0.1} />
          <StatCard icon={CheckCircle}  label="Resolved/Closed" value={String(resolvedCount)}  sub="Completed assigned tasks" color="var(--success)" delay={0.15} />
          <StatCard icon={TrendingUp}   label="Active Work"     value={String(inProgressCount)} sub="Tickets currently in progress" color="var(--accent)"  delay={0.2} />
        </div>

        {/* Assigned tickets */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, animation: 'fadeIn 0.5s ease 0.2s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 600 }}>My Assigned Tickets</h2>
            <Link to="/tickets" style={{ fontSize: 13, color: 'var(--accent)' }}>View all →</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {loading ? (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Loading assigned tickets...</p>
            ) : tickets.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No assigned tickets yet.</p>
            ) : tickets.map(t => {
              const s = STATUS_STYLE[t.status] ?? STATUS_STYLE.OPEN
              return (
                <div key={t.id} style={{
                  padding: '16px 18px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.025)',
                  border: `1px solid ${t.priority === 'CRITICAL' ? 'rgba(248,113,113,0.3)' : 'var(--border)'}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.ticketNumber}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: PRIORITY_COLOR[t.priority] }}>● {t.priority}</span>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>{t.description}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> {t.createdAt ? new Date(t.createdAt).toLocaleString() : '-'} · 📍 {t.location || 'N/A'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: s.bg, color: s.color }}>
                      {t.status.replace('_', ' ')}
                    </span>
                    {t.status === 'OPEN' ? (
                      <button
                        onClick={() => handleAccept(t)}
                        disabled={acceptingId === t.id}
                        style={{
                          padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                          background: 'var(--accent)', color: '#fff', border: 'none',
                        }}
                      >
                        {acceptingId === t.id ? 'Accepting...' : 'Accept Task'}
                      </button>
                    ) : (
                      <Link
                        to="/tickets/solve"
                        style={{
                          padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                          background: 'rgba(59,130,246,0.18)', color: '#bfdbfe',
                        }}
                      >
                        Open Task →
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
