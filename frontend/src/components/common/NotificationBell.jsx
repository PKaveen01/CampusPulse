import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, X, Trash2, ExternalLink } from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext'

const TYPE_META = {
  BOOKING_APPROVED:   { color: '#34d399', label: 'Booking' },
  BOOKING_REJECTED:   { color: '#f87171', label: 'Booking' },
  BOOKING_CANCELLED:  { color: '#fbbf24', label: 'Booking' },
  TICKET_STATUS_CHANGED: { color: '#60a5fa', label: 'Ticket' },
  TICKET_ASSIGNED:    { color: '#a78bfa', label: 'Ticket' },
  SLA_BREACH:         { color: '#f87171', label: 'SLA Alert' },
  DEFAULT:            { color: '#4f8ef7', label: 'System' },
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const preview = notifications.slice(0, 8)

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Notifications"
        style={{
          position: 'relative', padding: '8px', borderRadius: 'var(--radius-sm)',
          background: open ? 'var(--accent-glow)' : 'transparent',
          color: open ? 'var(--accent)' : 'var(--text-secondary)',
          transition: 'all 0.2s', display: 'flex', alignItems: 'center',
          border: 'none', cursor: 'pointer',
        }}
      >
        <Bell size={20} style={{ transition: 'transform 0.2s', transform: unreadCount > 0 ? 'rotate(-10deg)' : 'none' }} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            background: 'var(--danger)', color: '#fff',
            fontSize: 9, fontWeight: 800, borderRadius: '50%',
            minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 3px', boxShadow: '0 0 0 2px var(--bg)',
            animation: 'pulse 2s infinite',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 10px)', right: 0,
            width: 380, maxHeight: 520,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            zIndex: 999, animation: 'fadeIn 0.18s ease',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', borderBottom: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.02)', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bell size={15} style={{ color: 'var(--accent)' }} />
                <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 14 }}>Notifications</span>
                {unreadCount > 0 && (
                  <span style={{
                    background: 'var(--accent-glow)', color: 'var(--accent)',
                    fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 10,
                  }}>{unreadCount} new</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} title="Mark all as read" style={{
                    color: 'var(--accent)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4,
                    padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(79,142,247,0.3)',
                    background: 'var(--accent-glow)', cursor: 'pointer', fontWeight: 600,
                    transition: 'opacity 0.2s',
                  }}>
                    <CheckCheck size={13} /> All read
                  </button>
                )}
                <button onClick={() => setOpen(false)} style={{ color: 'var(--text-muted)', padding: 4, cursor: 'pointer', border: 'none', background: 'none' }}>
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* List */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {preview.length === 0 ? (
                <div style={{ padding: '40px 16px', textAlign: 'center' }}>
                  <Bell size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px', display: 'block' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>All caught up!</p>
                </div>
              ) : (
                preview.map(n => {
                  const meta = TYPE_META[n.type] ?? TYPE_META.DEFAULT
                  return (
                    <div
                      key={n.id}
                      style={{
                        padding: '12px 16px',
                        background: n.isRead ? 'transparent' : 'rgba(79,142,247,0.05)',
                        borderBottom: '1px solid var(--border)',
                        transition: 'background 0.2s',
                        borderLeft: `3px solid ${n.isRead ? 'transparent' : meta.color}`,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                              color: meta.color, background: `${meta.color}20`,
                              padding: '1px 6px', borderRadius: 4,
                            }}>{meta.label}</span>
                            {!n.isRead && <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, display: 'inline-block' }} />}
                          </div>
                          <p style={{ fontSize: 13, fontWeight: n.isRead ? 500 : 700, color: 'var(--text-primary)', marginBottom: 3, lineHeight: 1.4 }}>
                            {n.title}
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.message}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{timeAgo(n.createdAt)}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                          {!n.isRead && (
                            <button onClick={() => markAsRead(n.id)} title="Mark read" style={{
                              color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 3,
                            }}>
                              <CheckCheck size={13} />
                            </button>
                          )}
                          <button onClick={() => deleteNotification(n.id)} title="Delete" style={{
                            color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 3,
                          }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div style={{
                padding: '10px 16px', borderTop: '1px solid var(--border)',
                flexShrink: 0, background: 'rgba(255,255,255,0.01)',
              }}>
                <button
                  onClick={() => { setOpen(false); navigate('/notifications') }}
                  style={{
                    width: '100%', padding: '8px', borderRadius: 8,
                    background: 'rgba(79,142,247,0.1)', color: 'var(--accent)',
                    border: '1px solid rgba(79,142,247,0.2)', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 6, transition: 'opacity 0.2s',
                  }}
                >
                  <ExternalLink size={13} /> View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
