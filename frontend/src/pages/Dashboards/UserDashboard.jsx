import React from 'react'
import { BookOpen, Wrench, Building2, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/layout/Navbar'
import StatCard from '../../components/common/StatCard'

const MOCK_RECENT_BOOKINGS = [
  { id: 1, resource: 'Room 101 – Smart Lecture Hall', date: 'Today, 2:00 PM', status: 'APPROVED' },
  { id: 2, resource: 'Engineering Lab B', date: 'Tomorrow, 10:00 AM', status: 'PENDING' },
  { id: 3, resource: 'Meeting Room 3', date: 'Mar 30, 9:00 AM', status: 'REJECTED' },
]

const MOCK_TICKETS = [
  { id: 1, number: 'TKT-20240325-001', desc: 'Projector not working in Room 202', status: 'OPEN', priority: 'HIGH' },
  { id: 2, number: 'TKT-20240320-003', desc: 'AC unit making loud noise', status: 'IN_PROGRESS', priority: 'MEDIUM' },
]

const STATUS_STYLE = {
  APPROVED: { bg: 'rgba(52,211,153,0.12)', color: '#34d399', label: 'Approved' },
  PENDING:  { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', label: 'Pending' },
  REJECTED: { bg: 'rgba(248,113,113,0.12)', color: '#f87171', label: 'Rejected' },
  OPEN:       { bg: 'rgba(96,165,250,0.12)', color: '#60a5fa', label: 'Open' },
  IN_PROGRESS:{ bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', label: 'In Progress' },
  RESOLVED:   { bg: 'rgba(52,211,153,0.12)', color: '#34d399', label: 'Resolved' },
}

function Badge({ status }) {
  const s = STATUS_STYLE[status] ?? { bg: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)', label: status }
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '2px 8px',
      borderRadius: 20, background: s.bg, color: s.color,
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>{s.label}</span>
  )
}

export default function UserDashboard() {
  const { user } = useAuth()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Welcome */}
        <div style={{ marginBottom: 32, animation: 'fadeIn 0.4s ease' }}>
          <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
            Welcome back, <span style={{ color: 'var(--accent)' }}>{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Here's a quick overview of your campus activity.</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          <StatCard icon={BookOpen}    label="My Bookings"   value="3"  sub="1 pending approval"  color="var(--accent)"   delay={0.05} />
          <StatCard icon={Wrench}      label="Open Tickets"  value="2"  sub="1 in progress"        color="var(--warning)"  delay={0.1} />
          <StatCard icon={Building2}   label="Resources"     value="24" sub="Available today"       color="var(--success)"  delay={0.15} />
          <StatCard icon={CheckCircle} label="Resolved"      value="5"  sub="Last 30 days"          color="var(--accent-2)" delay={0.2} />
        </div>

        {/* Content grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>

          {/* Recent Bookings */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, animation: 'fadeIn 0.5s ease 0.2s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 600 }}>Recent Bookings</h2>
              <Link to="/bookings" style={{ fontSize: 13, color: 'var(--accent)' }}>View all →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {MOCK_RECENT_BOOKINGS.map(b => (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{b.resource}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> {b.date}
                    </p>
                  </div>
                  <Badge status={b.status} />
                </div>
              ))}
            </div>
            <Link to="/bookings" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              marginTop: 16, padding: '9px', borderRadius: 8,
              border: '1px dashed var(--border)', color: 'var(--text-muted)', fontSize: 13,
              transition: 'all 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <Plus size={14} /> New booking
            </Link>
          </div>

          {/* My Tickets */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, animation: 'fadeIn 0.5s ease 0.25s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 600 }}>My Tickets</h2>
              <Link to="/tickets" style={{ fontSize: 13, color: 'var(--warning)' }}>View all →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {MOCK_TICKETS.map(t => (
                <div key={t.id} style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>{t.number}</p>
                      <p style={{ fontSize: 13, fontWeight: 500 }}>{t.desc}</p>
                    </div>
                    <Badge status={t.status} />
                  </div>
                  <span style={{ fontSize: 11, color: t.priority === 'HIGH' ? 'var(--danger)' : 'var(--warning)', fontWeight: 600, marginTop: 6, display: 'block' }}>
                    ● {t.priority}
                  </span>
                </div>
              ))}
            </div>
            <Link to="/tickets/new" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              marginTop: 16, padding: '9px', borderRadius: 8,
              border: '1px dashed var(--border)', color: 'var(--text-muted)', fontSize: 13,
              transition: 'all 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--warning)'; e.currentTarget.style.color = 'var(--warning)' }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <Plus size={14} /> Report issue
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
