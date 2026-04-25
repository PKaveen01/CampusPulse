import React, { useEffect, useState, useCallback } from 'react'
import { Building2, BookOpen, Wrench, Users, Clock, RefreshCw, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/layout/Navbar'
import StatCard from '../../components/common/StatCard'
import { ticketService } from '../../services/ticketService'
import bookingService from '../../services/bookingService'
import resourceService from '../../services/resourceService'
import { userManagementService } from '../../services/userManagementService'

const PRIORITY_COLOR = { CRITICAL: 'var(--danger)', HIGH: 'var(--warning)', MEDIUM: 'var(--info)', LOW: 'var(--success)' }
const STATUS_STYLE = {
  APPROVED:  { bg: 'rgba(52,211,153,0.12)',  color: '#34d399' },
  PENDING:   { bg: 'rgba(251,191,36,0.12)',   color: '#fbbf24' },
  REJECTED:  { bg: 'rgba(248,113,113,0.12)',  color: '#f87171' },
  CANCELLED: { bg: 'rgba(156,163,175,0.12)',  color: '#9ca3af' },
}

function Badge({ status }) {
  const s = STATUS_STYLE[status] ?? { bg: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)' }
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: s.bg, color: s.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {status}
    </span>
  )
}

function formatDateTime(b) {
  if (b.bookingDate && b.startTime) return `${b.bookingDate}  ${b.startTime}–${b.endTime ?? ''}`
  if (b.startTime) return b.startTime
  return '—'
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [resourceStats,   setResourceStats]   = useState({ total: 0, outOfService: 0 })
  const [userStats,       setUserStats]       = useState({ totalUsers: 0, activeUsers: 0 })
  const [pendingBookings, setPendingBookings] = useState([])
  const [recentBookings,  setRecentBookings]  = useState([])
  const [tickets,         setTickets]         = useState([])
  const [loading,         setLoading]         = useState({ stats: true, bookings: true, tickets: true })
  const [errors,          setErrors]          = useState({})
  const [approvingId,     setApprovingId]     = useState(null)
  const [rejectingId,     setRejectingId]     = useState(null)

  const loadAll = useCallback(async () => {
    setLoading({ stats: true, bookings: true, tickets: true })
    setErrors({})

    // Resources
    try {
      const resources = await resourceService.getResources(0, 1000)
      const arr = Array.isArray(resources) ? resources : []
      setResourceStats({
        total: arr.length,
        outOfService: arr.filter(r => r.status === 'OUT_OF_SERVICE' || r.status === 'MAINTENANCE').length,
      })
    } catch { setErrors(e => ({ ...e, resources: 'Failed' })) }

    // Users
    try {
      const stats = await userManagementService.getStats()
      setUserStats({
        totalUsers:  stats?.totalUsers  ?? stats?.total  ?? 0,
        activeUsers: stats?.activeUsers ?? stats?.active ?? 0,
      })
    } catch {
      try {
        const users = await userManagementService.getAllUsers()
        const arr = Array.isArray(users) ? users : []
        setUserStats({ totalUsers: arr.length, activeUsers: arr.filter(u => u.isActive !== false).length })
      } catch { setErrors(e => ({ ...e, users: 'Failed' })) }
    }
    setLoading(l => ({ ...l, stats: false }))

    // Bookings
    try {
      const res = await bookingService.getAllBookings(null, 0, 50)
      const list = Array.isArray(res?.content) ? res.content : Array.isArray(res) ? res : []
      setPendingBookings(list.filter(b => b.status === 'PENDING'))
      setRecentBookings(list.slice(0, 5))
    } catch { setErrors(e => ({ ...e, bookings: 'Failed to load bookings' })) }
    setLoading(l => ({ ...l, bookings: false }))

    // Tickets
    try {
      const data = await ticketService.getMyTickets()
      setTickets(Array.isArray(data) ? data : [])
    } catch { setErrors(e => ({ ...e, tickets: 'Failed to load tickets' })) }
    setLoading(l => ({ ...l, tickets: false }))
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const activeTicketCount = tickets.filter(t => t.status !== 'CLOSED' && t.status !== 'REJECTED').length

  async function handleApprove(id) {
    setApprovingId(id)
    try {
      await bookingService.approveBooking(id)
      setPendingBookings(prev => prev.filter(b => b.id !== id))
      setRecentBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'APPROVED' } : b))
    } catch { /* silent */ }
    setApprovingId(null)
  }

  async function handleReject(id) {
    setRejectingId(id)
    try {
      await bookingService.rejectBooking(id, 'Rejected by admin')
      setPendingBookings(prev => prev.filter(b => b.id !== id))
      setRecentBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'REJECTED' } : b))
    } catch { /* silent */ }
    setRejectingId(null)
  }

  const card = (children, delay = 0, extra = {}) => (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, animation: `fadeIn 0.5s ease ${delay}s both`, ...extra }}>
      {children}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ marginBottom: 32, animation: 'fadeIn 0.4s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700 }}>Admin Dashboard</h1>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(248,113,113,0.15)', color: 'var(--role-admin)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {user?.role}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Welcome, <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong>. Here's your campus operations overview.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          <StatCard icon={Building2} label="Total Resources"  value={loading.stats    ? '…' : String(resourceStats.total)}      sub={loading.stats    ? 'Loading…' : `${resourceStats.outOfService} out of service`}           color="var(--accent)"   delay={0.05} />
          <StatCard icon={BookOpen}  label="Pending Bookings" value={loading.bookings ? '…' : String(pendingBookings.length)}    sub={loading.bookings ? 'Loading…' : 'Awaiting approval'}                                      color="var(--warning)"  delay={0.1}  />
          <StatCard icon={Wrench}    label="Open Tickets"     value={loading.tickets  ? '…' : String(activeTicketCount)}         sub={loading.tickets  ? 'Loading…' : `${tickets.length} total tickets`}                        color="var(--danger)"   delay={0.15} />
          <StatCard icon={Users}     label="Active Users"     value={loading.stats    ? '…' : String(userStats.activeUsers)}     sub={loading.stats    ? 'Loading…' : `${userStats.totalUsers} total registered`}                color="var(--success)"  delay={0.2}  />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>

          {/* Pending Approvals */}
          {card(<>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 600 }}>Pending Approvals</h2>
              {!loading.bookings && <span style={{ fontSize: 12, background: 'rgba(251,191,36,0.15)', color: 'var(--warning)', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{pendingBookings.length} pending</span>}
            </div>
            {loading.bookings ? <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Loading…</p>
              : errors.bookings ? <p style={{ fontSize: 12, color: 'var(--danger)' }}>{errors.bookings}</p>
              : pendingBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                  <CheckCircle size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
                  <p style={{ fontSize: 13 }}>No pending bookings</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto', paddingRight: 2 }}>
                  {pendingBookings.map(p => (
                    <div key={p.id} style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{p.userName ?? p.user?.name ?? `User #${p.userId}`}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>{p.resourceName ?? p.resource?.name ?? `Resource #${p.resourceId}`}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} />{formatDateTime(p)}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                          <button disabled={!!approvingId || !!rejectingId} onClick={() => handleApprove(p.id)}
                            style={{ padding: '4px 12px', borderRadius: 6, background: 'rgba(52,211,153,0.15)', color: 'var(--success)', fontSize: 12, fontWeight: 600, border: '1px solid rgba(52,211,153,0.3)', cursor: 'pointer' }}>
                            {approvingId === p.id ? '…' : '✓ Approve'}
                          </button>
                          <button disabled={!!approvingId || !!rejectingId} onClick={() => handleReject(p.id)}
                            style={{ padding: '4px 12px', borderRadius: 6, background: 'rgba(248,113,113,0.1)', color: 'var(--danger)', fontSize: 12, fontWeight: 600, border: '1px solid rgba(248,113,113,0.3)', cursor: 'pointer' }}>
                            {rejectingId === p.id ? '…' : '✗ Reject'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            <Link to="/bookings" style={{ display: 'block', textAlign: 'center', marginTop: 14, fontSize: 13, color: 'var(--accent)' }}>View all bookings →</Link>
          </>, 0.2)}

          {/* Tickets */}
          {card(<>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 600 }}>All Tickets</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={loadAll} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <RefreshCw size={12} /> Refresh
                </button>
                <Link to="/tickets" style={{ fontSize: 13, color: 'var(--danger)' }}>Manage →</Link>
              </div>
            </div>
            {loading.tickets ? <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Loading tickets…</p>
              : errors.tickets ? <p style={{ fontSize: 12, color: 'var(--danger)' }}>{errors.tickets}</p>
              : tickets.length === 0 ? <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No tickets found.</p>
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflow: 'auto', paddingRight: 2 }}>
                  {tickets.map(ticket => (
                    <div key={ticket.id} style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ticket.ticketNumber}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: PRIORITY_COLOR[ticket.priority] ?? 'var(--text-muted)' }}>● {ticket.priority}</span>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 500 }}>{ticket.description}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                        Status: <span style={{ color: 'var(--text-secondary)' }}>{ticket.status}</span>
                        {' • '}
                        Assignee: <span style={{ color: ticket.assignedTo ? 'var(--text-secondary)' : 'var(--danger)' }}>
                          {ticket.assignedToName ?? (ticket.assignedTo ? `User #${ticket.assignedTo}` : 'Unassigned')}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
          </>, 0.25)}

          {/* Recent Bookings */}
          {card(<>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 600 }}>Recent Bookings</h2>
              <Link to="/bookings" style={{ fontSize: 13, color: 'var(--accent)' }}>View all →</Link>
            </div>
            {loading.bookings ? <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Loading…</p>
              : recentBookings.length === 0 ? <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No bookings yet.</p>
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {recentBookings.map(b => (
                    <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border)' }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{b.resourceName ?? b.resource?.name ?? `Resource #${b.resourceId}`}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} />{formatDateTime(b)}</p>
                      </div>
                      <Badge status={b.status} />
                    </div>
                  ))}
                </div>
              )}
          </>, 0.28)}

          {/* Quick Actions */}
          {card(<>
            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 600, marginBottom: 18 }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Manage Resources', icon: Building2, to: '/resources',   color: 'var(--accent)' },
                { label: 'All Bookings',     icon: BookOpen,  to: '/bookings',    color: 'var(--warning)' },
                { label: 'View Tickets',     icon: Wrench,    to: '/tickets',     color: 'var(--danger)' },
                { label: 'User Management',  icon: Users,     to: '/admin/users', color: 'var(--accent-2)' },
              ].map(a => (
                <Link key={a.to} to={a.to} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 12px', borderRadius: 10, background: `${a.color}0f`, border: `1px solid ${a.color}30`, transition: 'all 0.2s', textAlign: 'center' }}
                  onMouseOver={e => { e.currentTarget.style.background = `${a.color}1a`; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseOut={e => { e.currentTarget.style.background = `${a.color}0f`; e.currentTarget.style.transform = 'none' }}>
                  <a.icon size={20} style={{ color: a.color }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{a.label}</span>
                </Link>
              ))}
            </div>
          </>, 0.3)}
        </div>
      </main>
    </div>
  )
}
