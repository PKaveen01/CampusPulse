import React from 'react'
import { Building2, BookOpen, Wrench, Users, Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/layout/Navbar'
import StatCard from '../../components/common/StatCard'

const MOCK_PENDING = [
  { id: 1, user: 'Alice Nguyen', resource: 'Conference Room A', time: 'Today 3:00–5:00 PM' },
  { id: 2, user: 'Bob Kumar', resource: 'Engineering Lab B', time: 'Tomorrow 9:00–11:00 AM' },
  { id: 3, user: 'Carla Da Silva', resource: 'Auditorium', time: 'Apr 2, 10:00 AM' },
]
const MOCK_TICKETS = [
  { number: 'TKT-001', desc: 'Projector purple tint – Room 101', priority: 'HIGH', assignee: 'John Tech' },
  { number: 'TKT-002', desc: 'AC failure – Lab B', priority: 'CRITICAL', assignee: 'Unassigned' },
  { number: 'TKT-003', desc: 'Broken whiteboard – Rm 204', priority: 'LOW', assignee: 'Jane Fix' },
]
const PRIORITY_COLOR = { CRITICAL: 'var(--danger)', HIGH: 'var(--warning)', MEDIUM: 'var(--info)', LOW: 'var(--success)' }

export default function AdminDashboard() {
  const { user } = useAuth()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32, animation: 'fadeIn 0.4s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700 }}>
              Admin Dashboard
            </h1>
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
          <StatCard icon={Building2}    label="Total Resources"    value="48"  sub="6 out of service"     color="var(--accent)"   delay={0.05} />
          <StatCard icon={BookOpen}     label="Pending Bookings"   value="12"  sub="Awaiting approval"    color="var(--warning)"  delay={0.1} />
          <StatCard icon={Wrench}       label="Open Tickets"       value="9"   sub="2 critical priority"  color="var(--danger)"   delay={0.15} />
          <StatCard icon={Users}        label="Active Users"       value="284" sub="This month"            color="var(--success)"  delay={0.2} />
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>

          {/* Pending Approvals */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, animation: 'fadeIn 0.5s ease 0.2s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 600 }}>Pending Approvals</h2>
              <span style={{ fontSize: 12, background: 'rgba(251,191,36,0.15)', color: 'var(--warning)', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{MOCK_PENDING.length} new</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MOCK_PENDING.map(p => (
                <div key={p.id} style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>{p.user}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{p.resource}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} />{p.time}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                      <button style={{ padding: '4px 12px', borderRadius: 6, background: 'rgba(52,211,153,0.15)', color: 'var(--success)', fontSize: 12, fontWeight: 600, border: '1px solid rgba(52,211,153,0.3)' }}>✓ Approve</button>
                      <button style={{ padding: '4px 12px', borderRadius: 6, background: 'rgba(248,113,113,0.1)', color: 'var(--danger)', fontSize: 12, fontWeight: 600, border: '1px solid rgba(248,113,113,0.3)' }}>✗ Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/bookings" style={{ display: 'block', textAlign: 'center', marginTop: 14, fontSize: 13, color: 'var(--accent)' }}>View all bookings →</Link>
          </div>

          {/* Active Tickets */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, animation: 'fadeIn 0.5s ease 0.25s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 600 }}>Active Tickets</h2>
              <Link to="/tickets" style={{ fontSize: 13, color: 'var(--danger)' }}>Manage →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MOCK_TICKETS.map(t => (
                <div key={t.number} style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.number}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: PRIORITY_COLOR[t.priority] ?? 'var(--text-muted)' }}>● {t.priority}</span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{t.desc}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Assignee: <span style={{ color: t.assignee === 'Unassigned' ? 'var(--danger)' : 'var(--text-secondary)' }}>{t.assignee}</span></p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, animation: 'fadeIn 0.5s ease 0.3s both' }}>
            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 600, marginBottom: 18 }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Manage Resources', icon: Building2, to: '/resources', color: 'var(--accent)' },
                { label: 'All Bookings', icon: BookOpen, to: '/bookings', color: 'var(--warning)' },
                { label: 'View Tickets', icon: Wrench, to: '/tickets', color: 'var(--danger)' },
                { label: 'User Management', icon: Users, to: '/admin/users', color: 'var(--accent-2)' },
              ].map(a => (
                <Link key={a.to} to={a.to} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '16px 12px', borderRadius: 10,
                  background: `${a.color}0f`, border: `1px solid ${a.color}30`,
                  transition: 'all 0.2s', textAlign: 'center',
                }}
                onMouseOver={e => { e.currentTarget.style.background = `${a.color}1a`; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseOut={e => { e.currentTarget.style.background = `${a.color}0f`; e.currentTarget.style.transform = 'none' }}
                >
                  <a.icon size={20} style={{ color: a.color }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{a.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
