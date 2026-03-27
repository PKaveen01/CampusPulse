import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, Wrench, Building2, Users,
  LogOut, Menu, X, ChevronDown,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../common/NotificationBell'

const ROLE_COLOR = {
  USER: 'var(--role-user)',
  TECHNICIAN: 'var(--role-technician)',
  MANAGER: 'var(--role-manager)',
  ADMIN: 'var(--role-admin)',
}

const NAV_LINKS = {
  USER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/bookings', label: 'Bookings', icon: BookOpen },
    { to: '/tickets', label: 'My Tickets', icon: Wrench },
    { to: '/resources', label: 'Resources', icon: Building2 },
  ],
  TECHNICIAN: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tickets', label: 'Tickets', icon: Wrench },
    { to: '/resources', label: 'Resources', icon: Building2 },
  ],
  MANAGER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/bookings', label: 'Bookings', icon: BookOpen },
    { to: '/resources', label: 'Resources', icon: Building2 },
    { to: '/tickets', label: 'Tickets', icon: Wrench },
  ],
  ADMIN: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/resources', label: 'Resources', icon: Building2 },
    { to: '/bookings', label: 'Bookings', icon: BookOpen },
    { to: '/tickets', label: 'Tickets', icon: Wrench },
    { to: '/admin/users', label: 'Users', icon: Users },
  ],
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const links = NAV_LINKS[user?.role] ?? NAV_LINKS.USER
  const roleColor = ROLE_COLOR[user?.role] ?? 'var(--accent)'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 64,
        background: 'rgba(10,14,26,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        padding: '0 24px',
        gap: 16,
      }}>
        {/* Logo */}
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color: '#fff',
          }}>C</div>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
            CampusPulse
          </span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: 4, marginLeft: 16, flex: 1 }} className="nav-links-desktop">
          {links.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to
            return (
              <Link key={to} to={to} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                fontSize: 14, fontWeight: active ? 600 : 400,
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: active ? 'rgba(79,142,247,0.12)' : 'transparent',
                transition: 'all 0.2s',
              }}>
                <Icon size={15} />
                {label}
              </Link>
            )
          })}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <NotificationBell />

          {/* Profile dropdown */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setProfileOpen(o => !o)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 10px', borderRadius: 'var(--radius-sm)',
              background: profileOpen ? 'rgba(255,255,255,0.06)' : 'transparent',
              transition: 'background 0.2s',
            }}>
              {/* Avatar */}
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
              ) : (
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${roleColor}, var(--accent-2))`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#fff',
                }}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              )}
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </span>
              <ChevronDown size={14} style={{ color: 'var(--text-muted)', transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {profileOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                width: 220,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)',
                animation: 'fadeIn 0.15s ease', zIndex: 200,
                overflow: 'hidden',
              }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{user?.email}</p>
                  <span style={{
                    display: 'inline-block', marginTop: 6,
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                    textTransform: 'uppercase', padding: '2px 8px',
                    borderRadius: 4, color: '#fff',
                    background: roleColor,
                  }}>
                    {user?.role}
                  </span>
                </div>
                <button onClick={handleLogout} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', fontSize: 13, color: 'var(--danger)',
                  transition: 'background 0.2s',
                }}>
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(o => !o)} style={{ color: 'var(--text-secondary)', display: 'none' }} className="mobile-menu-btn">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, bottom: 0,
          background: 'var(--bg-card)', zIndex: 99,
          padding: 16, display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', borderRadius: 'var(--radius-sm)',
              fontSize: 15, color: location.pathname === to ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: location.pathname === to ? 'rgba(79,142,247,0.12)' : 'transparent',
            }}>
              <Icon size={18} /> {label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>

      {/* Spacer */}
      <div style={{ height: 64 }} />
    </>
  )
}
