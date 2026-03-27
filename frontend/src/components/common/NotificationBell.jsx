import React, { useState, useRef, useEffect } from 'react'
import { Bell, Check, CheckCheck, X } from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext'

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        position: 'relative', padding: '8px', borderRadius: 'var(--radius-sm)',
        background: open ? 'var(--accent-glow)' : 'transparent',
        color: 'var(--text-secondary)', transition: 'all 0.2s',
        display: 'flex', alignItems: 'center',
      }}>
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            background: 'var(--danger)', color: '#fff',
            fontSize: 10, fontWeight: 700, borderRadius: '50%',
            minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 3px',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 360, maxHeight: 480, overflowY: 'auto',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)',
          zIndex: 1000, animation: 'fadeIn 0.2s ease',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderBottom: '1px solid var(--border)',
          }}>
            <span style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>Notifications</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} title="Mark all as read" style={{
                  color: 'var(--accent)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <CheckCheck size={14} /> All read
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No notifications yet
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} onClick={() => !n.isRead && markAsRead(n.id)} style={{
                padding: '12px 16px',
                background: n.isRead ? 'transparent' : 'rgba(79,142,247,0.06)',
                borderBottom: '1px solid var(--border)',
                cursor: n.isRead ? 'default' : 'pointer',
                transition: 'background 0.2s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <p style={{ fontSize: 13, fontWeight: n.isRead ? 400 : 600, color: 'var(--text-primary)' }}>
                    {n.title}
                  </p>
                  {!n.isRead && <Check size={14} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />}
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{n.message}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
