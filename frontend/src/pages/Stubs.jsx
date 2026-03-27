// ─── Stub pages for Member 1, 2, 3 ───
// Each exports a simple placeholder page so routes work.
// The actual implementations belong to other team members.

import React from 'react'
import { Building2, BookOpen, Wrench, Users } from 'lucide-react'
import Navbar from '../components/layout/Navbar'

function StubPage({ icon: Icon, title, member, color }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{
        maxWidth: 700, margin: '80px auto', padding: '0 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        animation: 'fadeIn 0.4s ease',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: 20, marginBottom: 24,
          background: `${color}15`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={36} style={{ color }} />
        </div>
        <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700, marginBottom: 12 }}>{title}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, maxWidth: 460 }}>
          This section is being developed by <strong style={{ color: 'var(--text-primary)' }}>{member}</strong>.
          The full implementation — including all CRUD operations, filters, and business logic — will be added here.
        </p>
        <div style={{
          marginTop: 32, padding: '14px 24px',
          borderRadius: 'var(--radius)', border: '1px dashed var(--border)',
          color: 'var(--text-muted)', fontSize: 13,
        }}>
          🚧 Under construction — connect this route to the real component when ready.
        </div>
      </main>
    </div>
  )
}

export function ResourcesPage() {
  return <StubPage icon={Building2} title="Facilities & Assets" member="Member 1" color="var(--accent)" />
}

export function BookingsPage() {
  return <StubPage icon={BookOpen} title="Booking Management" member="Member 2" color="var(--warning)" />
}

export function TicketsPage() {
  return <StubPage icon={Wrench} title="Maintenance & Tickets" member="Member 3" color="var(--danger)" />
}

export function AdminUsersPage() {
  return <StubPage icon={Users} title="User Management" member="Member 4 (Auth)" color="var(--accent-2)" />
}
