import React, { useEffect, useState, useCallback } from 'react'
import { Building2, BookOpen, Wrench, TrendingUp, BarChart3, Clock, RefreshCw, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/layout/Navbar'
import StatCard from '../../components/common/StatCard'
import ManagerTicketingTab from './components/ManagerTicketingTab'
import { ticketService } from '../../services/ticketService'
import bookingService from '../../services/bookingService'
import resourceService from '../../services/resourceService'

function formatDateTime(b) {
  if (b.bookingDate && b.startTime) return `${b.bookingDate}  ${b.startTime}–${b.endTime ?? ''}`
  if (b.startTime) return b.startTime
  return '—'
}

export default function ManagerDashboard() {
  const { user } = useAuth()

  const [resources,       setResources]       = useState([])
  const [pendingBookings, setPendingBookings] = useState([])
  const [todayBookings,   setTodayBookings]   = useState([])
  const [tickets,         setTickets]         = useState([])
  const [loading,         setLoading]         = useState({ resources: true, bookings: true, tickets: true })
  const [errors,          setErrors]          = useState({})
  const [approvingId,     setApprovingId]     = useState(null)
  const [rejectingId,     setRejectingId]     = useState(null)

  const loadAll = useCallback(async () => {
    setLoading({ resources: true, bookings: true, tickets: true })
    setErrors({})

    // Resources
    try {
      const data = await resourceService.getResources(0, 1000)
      setResources(Array.isArray(data) ? data : [])
    } catch { setErrors(e => ({ ...e, resources: 'Failed to load resources' })) }
    setLoading(l => ({ ...l, resources: false }))

    // Bookings
    try {
      const res = await bookingService.getAllBookings(null, 0, 100)
      const list = Array.isArray(res?.content) ? res.content : Array.isArray(res) ? res : []
      const today = new Date().toISOString().slice(0, 10)
      setPendingBookings(list.filter(b => b.status === 'PENDING'))
      setTodayBookings(list.filter(b => b.bookingDate === today || (b.startTime && b.startTime.startsWith(today))))
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

  const activeResources   = resources.filter(r => r.status === 'ACTIVE')
  const outOfService      = resources.filter(r => r.status === 'OUT_OF_SERVICE' || r.status === 'MAINTENANCE')
  const openTicketCount   = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length

  // Compute utilisation: % of active resources that have ≥1 booking today
  const bookedResourceIds = new Set(todayBookings.map(b => b.resourceId))
  const utilisationPct = activeResources.length > 0
    ? Math.round((bookedResourceIds.size / activeResources.length) * 100)
    : 0

  // Build utilisation rows: top 5 active resources, sorted by today-booking count desc
  const bookingCountByResource = {}
  todayBookings.forEach(b => {
    bookingCountByResource[b.resourceId] = (bookingCountByResource[b.resourceId] ?? 0) + 1
  })
  const utilisationRows = resources
    .map(r => ({
      name:   r.name,
      status: r.status,
      count:  bookingCountByResource[r.id] ?? 0,
      // util % = (bookings today / some reasonable max, e.g. 8 slots) capped at 100
      util:   Math.min(100, Math.round(((bookingCountByResource[r.id] ?? 0) / 8) * 100)),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  async function handleApprove(id) {
    setApprovingId(id)
    try {
      await bookingService.approveBooking(id)
      setPendingBookings(prev => prev.filter(b => b.id !== id))
    } catch { /* silent */ }
    setApprovingId(null)
  }

  async function handleReject(id) {
    setRejectingId(id)
    try {
      await bookingService.rejectBooking(id, 'Rejected by manager')
      setPendingBookings(prev => prev.filter(b => b.id !== id))
    } catch { /* silent */ }
    setRejectingId(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ maxWidth: 1150, margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ marginBottom: 32, animation: 'fadeIn 0.4s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700 }}>Manager Dashboard</h1>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(167,139,250,0.15)', color: 'var(--role-manager)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {user?.role}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Hello <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong> — campus operations at a glance.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          <StatCard icon={Building2}  label="Resources"      value={loading.resources ? '…' : String(resources.length)}      sub={loading.resources ? 'Loading…' : `${outOfService.length} out of service`}  color="var(--accent)"   delay={0.05} />
          <StatCard icon={BookOpen}   label="Bookings Today" value={loading.bookings  ? '…' : String(todayBookings.length)}   sub={loading.bookings  ? 'Loading…' : `${pendingBookings.length} pending review`} color="var(--warning)"  delay={0.1}  />
          <StatCard icon={Wrench}     label="Open Tickets"   value={loading.tickets  ? '…' : String(openTicketCount)}         sub={loading.tickets   ? 'Loading…' : 'Maintenance issues'}                      color="var(--danger)"   delay={0.15} />
          <StatCard icon={TrendingUp} label="Utilisation"    value={loading.resources || loading.bookings ? '…' : `${utilisationPct}%`} sub="Active resources booked today"                                     color="var(--accent-2)" delay={0.2}  />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>

          {/* Resource Utilisation */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, animation: 'fadeIn 0.5s ease 0.2s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 600 }}>Resource Utilisation</h2>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={loadAll} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <RefreshCw size={12} />
                </button>
                <BarChart3 size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
            {loading.resources || loading.bookings ? (
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Loading…</p>
            ) : utilisationRows.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No resources found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {utilisationRows.map(r => (
                  <div key={r.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: r.status === 'OUT_OF_SERVICE' || r.status === 'MAINTENANCE' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                        {r.name}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {(r.status === 'OUT_OF_SERVICE' || r.status === 'MAINTENANCE') && (
                          <span style={{ fontSize: 10, color: 'var(--danger)', fontWeight: 600 }}>⚠ {r.status === 'MAINTENANCE' ? 'MAINT' : 'OUT'}</span>
                        )}
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.count} bookings</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: r.util > 80 ? 'var(--warning)' : 'var(--text-primary)' }}>{r.util}%</span>
                      </div>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 3, width: `${r.util}%`,
                        background: (r.status === 'OUT_OF_SERVICE' || r.status === 'MAINTENANCE') ? 'var(--text-muted)'
                          : r.util > 80 ? 'var(--warning)' : 'var(--accent)',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link to="/resources" style={{ display: 'block', textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--accent)' }}>Manage resources →</Link>
          </div>

          {/* Pending Bookings + Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, animation: 'fadeIn 0.5s ease 0.25s both' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 600 }}>Pending Approvals</h2>
                {!loading.bookings && (
                  <span style={{ fontSize: 12, background: 'rgba(251,191,36,0.15)', color: 'var(--warning)', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                    {pendingBookings.length}
                  </span>
                )}
              </div>
              {loading.bookings ? (
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Loading…</p>
              ) : errors.bookings ? (
                <p style={{ fontSize: 12, color: 'var(--danger)' }}>{errors.bookings}</p>
              ) : pendingBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)' }}>
                  <CheckCircle size={24} style={{ marginBottom: 6, opacity: 0.4 }} />
                  <p style={{ fontSize: 13 }}>No pending bookings</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 240, overflowY: 'auto', paddingRight: 2 }}>
                  {pendingBookings.map(p => (
                    <div key={p.id} style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>{p.userName ?? p.user?.name ?? `User #${p.userId}`}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.resourceName ?? p.resource?.name ?? `Resource #${p.resourceId}`}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          <Clock size={10} style={{ display: 'inline', marginRight: 3 }} />
                          {formatDateTime(p)}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button
                          disabled={!!approvingId || !!rejectingId}
                          onClick={() => handleApprove(p.id)}
                          style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(52,211,153,0.15)', color: 'var(--success)', fontSize: 12, fontWeight: 600, border: '1px solid rgba(52,211,153,0.3)', cursor: 'pointer' }}>
                          {approvingId === p.id ? '…' : '✓'}
                        </button>
                        <button
                          disabled={!!approvingId || !!rejectingId}
                          onClick={() => handleReject(p.id)}
                          style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(248,113,113,0.1)', color: 'var(--danger)', fontSize: 12, fontWeight: 600, border: '1px solid rgba(248,113,113,0.3)', cursor: 'pointer' }}>
                          {rejectingId === p.id ? '…' : '✗'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link to="/bookings" style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--accent)' }}>View all →</Link>
            </div>

            {/* Quick Access */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, animation: 'fadeIn 0.5s ease 0.3s both' }}>
              <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Quick Access</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Resources', icon: Building2, to: '/resources',    color: 'var(--accent)' },
                  { label: 'Bookings',  icon: BookOpen,  to: '/bookings',     color: 'var(--warning)' },
                  { label: 'Tickets',   icon: Wrench,    to: '/tickets/solve',color: 'var(--danger)' },
                  { label: 'Reports',   icon: TrendingUp,to: '#',             color: 'var(--accent-2)' },
                ].map(a => (
                  <Link key={a.to} to={a.to} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 8, background: `${a.color}0f`, border: `1px solid ${a.color}25`, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', transition: 'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.background = `${a.color}1a` }}
                    onMouseOut={e => { e.currentTarget.style.background = `${a.color}0f` }}>
                    <a.icon size={15} style={{ color: a.color }} />
                    {a.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <ManagerTicketingTab />
        </div>
      </main>
    </div>
  )
}
