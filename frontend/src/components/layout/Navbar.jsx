import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, Wrench, Building2, Users,
  LogOut, Menu, X, ChevronDown, UserCircle,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../common/NotificationBell'
import ProfileAvatar from '../common/ProfileAvatar'
import logoImage from '../images/logo.png'

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
    { to: '/resources', label: 'Resources', icon: Building2 },
  ],
  MANAGER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/bookings', label: 'Bookings', icon: BookOpen },
    { to: '/resources', label: 'Resources', icon: Building2 },
  ],
  ADMIN: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/resources', label: 'Resources', icon: Building2 },
    { to: '/bookings', label: 'Bookings', icon: BookOpen },
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
    setProfileOpen(false)
    await logout()
    navigate('/login')
  }

  const handleProfileNav = () => {
    setProfileOpen(false)
    navigate('/profile')
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
          <img
            src={logoImage}
            alt="CampusPulse"
            style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }}
            onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/36x36?text=CP' }}
          />
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
            CampusPulse
          </span>
        </Link>

        {/* Desktop nav links */}
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

          {/* ── Profile dropdown ── */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setProfileOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 10px', borderRadius: 'var(--radius-sm)',
                background: profileOpen ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: 'none', cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {/* ProfileAvatar replaces the old manual avatar logic */}
              <ProfileAvatar
                name={user?.name ?? ''}
                avatarUrl={user?.avatarUrl}
                size={30}
                style={{ border: `2px solid ${roleColor}`, boxSizing: 'content-box' }}
              />
              <span style={{
                fontSize: 13, fontWeight: 500, color: 'var(--text-primary)',
                maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user?.name}
              </span>
              <ChevronDown
                size={14}
                style={{
                  color: 'var(--text-muted)',
                  transform: profileOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s',
                }}
              />
            </button>

            {profileOpen && (
              <>
                {/* Click-away backdrop */}
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 199 }}
                  onClick={() => setProfileOpen(false)}
                />
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 230,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)',
                  animation: 'fadeIn 0.15s ease', zIndex: 200,
                  overflow: 'hidden',
                }}>
                  {/* User info header */}
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <ProfileAvatar
                        name={user?.name ?? ''}
                        avatarUrl={user?.avatarUrl}
                        size={38}
                      />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user?.name}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <span style={{
                      display: 'inline-block',
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                      textTransform: 'uppercase', padding: '2px 8px',
                      borderRadius: 4, color: '#fff',
                      background: roleColor,
                    }}>
                      {user?.role}
                    </span>
                  </div>

                  {/* My Profile link */}
                  <button
                    onClick={handleProfileNav}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '11px 16px', fontSize: 13,
                      color: 'var(--text-secondary)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      transition: 'background 0.2s',
                      borderBottom: '1px solid var(--border)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <UserCircle size={15} /> My Profile
                  </button>

                  {/* Sign out */}
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '11px 16px', fontSize: 13, color: 'var(--danger)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            style={{ color: 'var(--text-secondary)', display: 'none', background: 'none', border: 'none', cursor: 'pointer' }}
            className="mobile-menu-btn"
          >
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
          overflowY: 'auto',
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

          {/* Profile & logout in mobile */}
          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <Link to="/profile" onClick={() => setMobileOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', borderRadius: 'var(--radius-sm)',
              fontSize: 15, color: 'var(--text-secondary)',
            }}>
              <UserCircle size={18} /> My Profile
            </Link>
            <button onClick={handleLogout} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', borderRadius: 'var(--radius-sm)',
              fontSize: 15, color: 'var(--danger)',
              background: 'none', border: 'none', cursor: 'pointer',
            }}>
              <LogOut size={18} /> Sign out
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>

      {/* Spacer below fixed navbar */}
      <div style={{ height: 64 }} />
    </>
  )
}
