import React, { useEffect, useState } from 'react'
import { Building2, BookOpen, Wrench, TrendingUp, BarChart3, Users, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/layout/Navbar'
import StatCard from '../../components/common/StatCard'
import ManagerTicketingTab from './components/ManagerTicketingTab'
import { ticketService } from '../../services/ticketService'

const MOCK_UTILISATION = [
  { name: 'Engineering Lab A', util: 87, status: 'ACTIVE' },
  { name: 'Conference Room 1', util: 72, status: 'ACTIVE' },
  { name: 'Auditorium', util: 45, status: 'ACTIVE' },
  { name: 'Meeting Room 3', util: 91, status: 'ACTIVE' },
  { name: 'Room 101 – Lecture Hall', util: 33, status: 'OUT_OF_SERVICE' },
]
const MOCK_PENDING = [
  { user: 'Dr. James Perera', resource: 'Auditorium', time: 'Apr 5, 9:00 AM' },
  { user: 'Prof. Sarah Lin', resource: 'Conference Room 1', time: 'Apr 6, 2:00 PM' },
]

export default function ManagerDashboard() {
  const { user } = useAuth()
  const [openTicketCount, setOpenTicketCount] = useState('...')

  useEffect(() => {
    loadOpenTicketCount()
  }, [])

  async function loadOpenTicketCount() {
    try {
      const openTickets = await ticketService.getMyTickets('OPEN')
      setOpenTicketCount(String(Array.isArray(openTickets) ? openTickets.length : 0))
    } catch {
      setOpenTicketCount('0')
    }
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          <StatCard icon={Building2} label="Resources"      value="48"  sub="6 out of service"   color="var(--accent)"   delay={0.05} />
          <StatCard icon={BookOpen}  label="Bookings Today" value="18"  sub="3 pending review"   color="var(--warning)"  delay={0.1} />
          <StatCard icon={Wrench}    label="Open Tickets"   value={openTicketCount}   sub="Maintenance issues" color="var(--danger)"   delay={0.15} />
          <StatCard icon={TrendingUp} label="Utilisation"   value="68%" sub="Avg this week"      color="var(--accent-2)" delay={0.2} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>

          {/* Resource Utilisation */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, animation: 'fadeIn 0.5s ease 0.2s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 600 }}>Resource Utilisation</h2>
              <BarChart3 size={16} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {MOCK_UTILISATION.map(r => (
                <div key={r.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: r.status === 'OUT_OF_SERVICE' ? 'var(--text-muted)' : 'var(--text-primary)' }}>{r.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {r.status === 'OUT_OF_SERVICE' && <span style={{ fontSize: 10, color: 'var(--danger)', fontWeight: 600 }}>⚠ OUT</span>}
                      <span style={{ fontSize: 13, fontWeight: 600, color: r.util > 80 ? 'var(--warning)' : 'var(--text-primary)' }}>{r.util}%</span>
                    </div>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 3, width: `${r.util}%`,
                      background: r.status === 'OUT_OF_SERVICE' ? 'var(--text-muted)'
                        : r.util > 80 ? 'var(--warning)' : 'var(--accent)',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
            <Link to="/resources" style={{ display: 'block', textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--accent)' }}>Manage resources →</Link>
          </div>

          {/* Pending Bookings + Quick actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, animation: 'fadeIn 0.5s ease 0.25s both' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 600 }}>Pending Approvals</h2>
                <span style={{ fontSize: 12, background: 'rgba(251,191,36,0.15)', color: 'var(--warning)', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{MOCK_PENDING.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {MOCK_PENDING.map((p, i) => (
                  <div key={i} style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>{p.user}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.resource}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}><Clock size={10} style={{ display: 'inline', marginRight: 3 }} />{p.time}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(52,211,153,0.15)', color: 'var(--success)', fontSize: 12, fontWeight: 600 }}>✓</button>
                      <button style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(248,113,113,0.1)', color: 'var(--danger)', fontSize: 12, fontWeight: 600 }}>✗</button>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/bookings" style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--accent)' }}>View all →</Link>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, animation: 'fadeIn 0.5s ease 0.3s both' }}>
              <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Quick Access</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Resources', icon: Building2, to: '/resources', color: 'var(--accent)' },
                  { label: 'Bookings', icon: BookOpen, to: '/bookings', color: 'var(--warning)' },
                  { label: 'Tickets', icon: Wrench, to: '/tickets/solve', color: 'var(--danger)' },
                  { label: 'Reports', icon: TrendingUp, to: '#', color: 'var(--accent-2)' },
                ].map(a => (
                  <Link key={a.to} to={a.to} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '12px 14px', borderRadius: 8,
                    background: `${a.color}0f`, border: `1px solid ${a.color}25`,
                    fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = `${a.color}1a` }}
                  onMouseOut={e => { e.currentTarget.style.background = `${a.color}0f` }}
                  >
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
