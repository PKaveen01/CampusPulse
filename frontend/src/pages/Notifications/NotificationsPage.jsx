import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, CheckCheck, Trash2, Trash, RefreshCw, Filter, Search,
  BookOpen, Wrench, AlertTriangle, Info, ChevronDown, ArrowLeft,
} from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import { useNotifications } from '../../context/NotificationContext'

// ── helpers ────────────────────────────────────────────────────────────────
const TYPE_META = {
  BOOKING_APPROVED:      { color: '#34d399', bg: 'rgba(52,211,153,0.12)', icon: BookOpen,      label: 'Booking Approved' },
  BOOKING_REJECTED:      { color: '#f87171', bg: 'rgba(248,113,113,0.12)', icon: BookOpen,     label: 'Booking Rejected' },
  BOOKING_CANCELLED:     { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  icon: BookOpen,     label: 'Booking Cancelled' },
  TICKET_STATUS_CHANGED: { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  icon: Wrench,       label: 'Ticket Updated' },
  TICKET_ASSIGNED:       { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', icon: Wrench,       label: 'Ticket Assigned' },
  SLA_BREACH:            { color: '#f87171', bg: 'rgba(248,113,113,0.12)', icon: AlertTriangle, label: 'SLA Breach' },
  DEFAULT:               { color: '#4f8ef7', bg: 'rgba(79,142,247,0.12)',  icon: Info,          label: 'System' },
}

const FILTERS = ['ALL', 'UNREAD', 'BOOKING', 'TICKET', 'SLA']

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  if (h < 168) return `${Math.floor(h / 24)}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function groupByDate(items) {
  const today = new Date(); today.setHours(0,0,0,0)
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
  const groups = {}
  items.forEach(n => {
    const d = new Date(n.createdAt); d.setHours(0,0,0,0)
    let label
    if (d.getTime() === today.getTime()) label = 'Today'
    else if (d.getTime() === yesterday.getTime()) label = 'Yesterday'
    else label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    if (!groups[label]) groups[label] = []
    groups[label].push(n)
  })
  return groups
}

// ── Preferences Panel ──────────────────────────────────────────────────────
function PreferencesPanel({ onClose }) {
  const [prefs, setPrefs] = useState({
    inAppNotifications: true,
    emailNotifications: true,
    bookingUpdates: true,
    ticketUpdates: true,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const toggle = key => setPrefs(p => ({ ...p, [key]: !p[key] }))

  const save = async () => {
    setSaving(true)
    // API call: notificationService.updatePreferences(prefs)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const rows = [
    { key: 'inAppNotifications', label: 'In-app notifications', desc: 'Receive notifications in the bell icon' },
    { key: 'emailNotifications', label: 'Email notifications', desc: 'Also send to your registered email' },
    { key: 'bookingUpdates',     label: 'Booking updates', desc: 'Approvals, rejections and cancellations' },
    { key: 'ticketUpdates',      label: 'Ticket updates', desc: 'Status changes, assignments, comments' },
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: 28, width: 420, maxWidth: '90vw',
        animation: 'fadeIn 0.2s ease',
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 6 }}>Notification Preferences</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Control what notifications you receive.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          {rows.map(({ key, label, desc }) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</p>
              </div>
              <button
                onClick={() => toggle(key)}
                style={{
                  width: 44, height: 24, borderRadius: 12, position: 'relative',
                  background: prefs[key] ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                  border: 'none', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
                }}
              >
                <span style={{
                  position: 'absolute', top: 3, left: prefs[key] ? 23 : 3,
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#fff', transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }} />
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{
            flex: 2, padding: '10px', borderRadius: 8, border: 'none',
            background: saved ? '#34d399' : 'var(--accent)', color: '#fff',
            cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'background 0.3s',
          }}>
            {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const {
    notifications, unreadCount, loading, hasMore,
    markAsRead, markAllAsRead, deleteNotification, deleteAllRead, loadMore, refresh,
  } = useNotifications()
  const navigate = useNavigate()

  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [showPrefs, setShowPrefs] = useState(false)
  const [deleting, setDeleting] = useState(null)

  // Filter logic
  const filtered = notifications.filter(n => {
    if (filter === 'UNREAD' && n.isRead) return false
    if (filter === 'BOOKING' && !n.type?.startsWith('BOOKING')) return false
    if (filter === 'TICKET' && !n.type?.startsWith('TICKET')) return false
    if (filter === 'SLA' && n.type !== 'SLA_BREACH') return false
    if (search && !n.title?.toLowerCase().includes(search.toLowerCase()) &&
        !n.message?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const grouped = groupByDate(filtered)
  const readCount = notifications.filter(n => n.isRead).length

  const handleDelete = async (id) => {
    setDeleting(id)
    await deleteNotification(id)
    setDeleting(null)
  }

  const handleDeleteAllRead = async () => {
    await deleteAllRead()
  }

  return (
    <>
      <Navbar />
      <div style={{
        minHeight: '100vh', background: 'var(--bg)',
        padding: '0 24px 60px',
        maxWidth: 860, margin: '0 auto',
      }}>

        {/* Page Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 32, paddingBottom: 24,
          borderBottom: '1px solid var(--border)',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                color: 'var(--text-muted)', fontSize: 13,
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '6px 10px', borderRadius: 8,
                transition: 'color 0.2s, background 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none' }}
            >
              <ArrowLeft size={15} /> Back
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: 700 }}>Notifications</h1>
                {unreadCount > 0 && (
                  <span style={{
                    background: 'var(--danger)', color: '#fff',
                    fontSize: 12, fontWeight: 800, padding: '2px 9px',
                    borderRadius: 20, animation: 'pulse 2s infinite',
                  }}>{unreadCount} unread</span>
                )}
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                {notifications.length} total · {readCount} read
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={refresh} title="Refresh" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
              background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontSize: 13, transition: 'all 0.2s',
            }}>
              <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.3)',
                color: 'var(--accent)', fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
              }}>
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
            {readCount > 0 && (
              <button onClick={handleDeleteAllRead} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                color: 'var(--danger)', fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
              }}>
                <Trash size={14} /> Delete read
              </button>
            )}
            <button onClick={() => setShowPrefs(true)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
              background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontSize: 13, transition: 'all 0.2s',
            }}>
              <Filter size={14} /> Preferences
            </button>
          </div>
        </div>

        {/* Filter tabs + Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '20px 0 16px',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', gap: 4, flex: 1, flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.2s',
                background: filter === f ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                color: filter === f ? '#fff' : 'var(--text-secondary)',
                border: filter === f ? 'none' : '1px solid var(--border)',
              }}>
                {f === 'ALL' ? `All (${notifications.length})` :
                 f === 'UNREAD' ? `Unread (${unreadCount})` : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '7px 12px', minWidth: 200,
          }}>
            <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search notifications…"
              style={{
                background: 'none', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: 13, width: '100%',
              }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <Filter size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Notification List */}
        {loading && filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <RefreshCw size={28} style={{ color: 'var(--text-muted)', animation: 'spin 1s linear infinite', margin: '0 auto 16px', display: 'block' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading notifications…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '80px 24px', textAlign: 'center' }}>
            <Bell size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px', display: 'block', opacity: 0.4 }} />
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
              {search ? 'No results found' : filter === 'UNREAD' ? 'All caught up!' : 'No notifications'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              {search ? `No notifications match "${search}"` : 'Nothing here yet.'}
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              {/* Date divider */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 10px',
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  {date}
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map(n => {
                  const meta = TYPE_META[n.type] ?? TYPE_META.DEFAULT
                  const Icon = meta.icon
                  return (
                    <div
                      key={n.id}
                      style={{
                        display: 'flex', gap: 14, padding: '16px',
                        background: n.isRead ? 'var(--bg-card)' : `linear-gradient(135deg, ${meta.bg}, var(--bg-card))`,
                        border: `1px solid ${n.isRead ? 'var(--border)' : meta.color + '35'}`,
                        borderRadius: 'var(--radius)',
                        transition: 'all 0.2s',
                        opacity: deleting === n.id ? 0.4 : 1,
                        animation: 'fadeIn 0.2s ease',
                        position: 'relative', overflow: 'hidden',
                      }}
                    >
                      {/* Accent stripe */}
                      {!n.isRead && (
                        <div style={{
                          position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                          background: meta.color, borderRadius: '4px 0 0 4px',
                        }} />
                      )}

                      {/* Icon */}
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `1px solid ${meta.color}30`,
                      }}>
                        <Icon size={18} style={{ color: meta.color }} />
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                              color: meta.color, padding: '1px 7px', borderRadius: 4, background: meta.bg,
                            }}>{meta.label}</span>
                            {!n.isRead && (
                              <span style={{
                                fontSize: 10, fontWeight: 700, color: '#fff',
                                background: 'var(--accent)', padding: '1px 7px', borderRadius: 4,
                              }}>NEW</span>
                            )}
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                            {timeAgo(n.createdAt)}
                          </span>
                        </div>
                        <p style={{ fontSize: 14, fontWeight: n.isRead ? 500 : 700, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.4 }}>
                          {n.title}
                        </p>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {n.message}
                        </p>
                        {n.relatedEntityType && (
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                            Related: {n.relatedEntityType} #{n.relatedEntityId}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                        {!n.isRead && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            title="Mark as read"
                            style={{
                              width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
                              background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.2)',
                              color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.2s',
                            }}
                          >
                            <CheckCheck size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(n.id)}
                          title="Delete"
                          disabled={deleting === n.id}
                          style={{
                            width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
                            background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)',
                            color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}

        {/* Load more */}
        {hasMore && !loading && filtered.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <button onClick={loadMore} style={{
              padding: '10px 28px', borderRadius: 10, cursor: 'pointer',
              background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500,
              display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
            }}>
              <ChevronDown size={15} /> Load more
            </button>
          </div>
        )}
        {loading && filtered.length > 0 && (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: 13 }}>
            Loading more…
          </div>
        )}
      </div>

      {showPrefs && <PreferencesPanel onClose={() => setShowPrefs(false)} />}
    </>
  )
}
