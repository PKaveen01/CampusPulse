import React, { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import {
  BookOpen, Plus, Clock, CheckCircle, XCircle, AlertTriangle,
  ChevronLeft, ChevronRight, Search, Filter, X, Calendar,
  Users, MapPin, FileText, RefreshCw, Eye
} from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import { useAuth } from '../../context/AuthContext'
import bookingService from '../../services/bookingService'
import resourceService from '../../services/resourceService'
import CreateBookingModal from './CreateBookingModal'
import BookingDetailModal from './BookingDetailModal'

// ── Status badge ────────────────────────────────────────────────────────────
const STATUS = {
  PENDING:   { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', label: 'Pending',   icon: Clock },
  APPROVED:  { bg: 'rgba(52,211,153,0.12)',  color: '#34d399', label: 'Approved',  icon: CheckCircle },
  REJECTED:  { bg: 'rgba(248,113,113,0.12)', color: '#f87171', label: 'Rejected',  icon: XCircle },
  CANCELLED: { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', label: 'Cancelled', icon: XCircle },
}

function StatusBadge({ status }) {
  const s = STATUS[status] ?? { bg: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)', label: status, icon: AlertTriangle }
  const Icon = s.icon
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 600, padding: '3px 10px',
      borderRadius: 20, background: s.bg, color: s.color,
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      <Icon size={10} /> {s.label}
    </span>
  )
}

// ── Booking card ─────────────────────────────────────────────────────────────
function BookingCard({ booking, onView, onCancel, isAdmin, onApprove, onReject }) {
  const canCancel = ['PENDING', 'APPROVED'].includes(booking.status)
  const canApprove = isAdmin && booking.status === 'PENDING'

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 20,
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(79,142,247,0.3)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            {booking.bookingNumber}
          </span>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginTop: 2, fontFamily: 'Space Grotesk' }}>
            {booking.resourceName || `Resource #${booking.resourceId}`}
          </h3>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
          <Calendar size={13} />
          <span>{booking.bookingDate} &nbsp;·&nbsp; {booking.startTime?.slice(0,5)} – {booking.endTime?.slice(0,5)}</span>
        </div>
        {booking.resourceLocation && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
            <MapPin size={13} />
            <span>{booking.resourceLocation}</span>
          </div>
        )}
        {booking.expectedAttendees && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
            <Users size={13} />
            <span>{booking.expectedAttendees} attendees</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
          <FileText size={13} style={{ marginTop: 2, flexShrink: 0 }} />
          <span style={{ lineHeight: 1.4 }}>{booking.purpose}</span>
        </div>
        {isAdmin && booking.userName && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Booked by: <strong style={{ color: 'var(--text-secondary)' }}>{booking.userName}</strong>
          </div>
        )}
        {booking.rejectionReason && (
          <div style={{
            marginTop: 4, padding: '6px 10px', borderRadius: 6,
            background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
            fontSize: 12, color: '#f87171'
          }}>
            Reason: {booking.rejectionReason}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => onView(booking)} style={btnStyle('ghost')}>
          <Eye size={13} /> View Details
        </button>
        {canApprove && (
          <>
            <button onClick={() => onApprove(booking)} style={btnStyle('success')}>
              <CheckCircle size={13} /> Approve
            </button>
            <button onClick={() => onReject(booking)} style={btnStyle('danger')}>
              <XCircle size={13} /> Reject
            </button>
          </>
        )}
        {!isAdmin && canCancel && (
          <button onClick={() => onCancel(booking)} style={btnStyle('danger')}>
            <XCircle size={13} /> Cancel
          </button>
        )}
      </div>
    </div>
  )
}

function btnStyle(variant) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
    cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
  }
  if (variant === 'ghost') return { ...base, background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }
  if (variant === 'success') return { ...base, background: 'rgba(52,211,153,0.1)', borderColor: 'rgba(52,211,153,0.3)', color: '#34d399' }
  if (variant === 'danger') return { ...base, background: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.3)', color: '#f87171' }
  return { ...base, background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' }
}

// ── Reject dialog ─────────────────────────────────────────────────────────────
function RejectDialog({ booking, onClose, onConfirm }) {
  const [reason, setReason] = useState('')
  if (!booking) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: 28, maxWidth: 440, width: '100%'
      }}>
        <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: 16 }}>Reject Booking</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Rejecting <strong>{booking.bookingNumber}</strong>. Please provide a reason:
        </p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Enter rejection reason..."
          rows={3}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border)', borderRadius: 8,
            color: 'var(--text-primary)', padding: '10px 12px', fontSize: 13,
            resize: 'vertical', marginBottom: 16
          }}
        />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={btnStyle('ghost')}>Cancel</button>
          <button
            onClick={() => reason.trim() && onConfirm(reason)}
            disabled={!reason.trim()}
            style={{ ...btnStyle('danger'), opacity: reason.trim() ? 1 : 0.5 }}
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BookingsPage() {
  const { user } = useAuth()
  const location = useLocation()
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER'

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Modals
  const [showCreate, setShowCreate] = useState(false)
  const [preselectedResource, setPreselectedResource] = useState(null)
  const [viewBooking, setViewBooking] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)

  // Stats
  const [stats, setStats] = useState({ pending: 0, approved: 0, total: 0 })

  // Auto-open create modal if navigated from ResourceDetails
  useEffect(() => {
    if (location.state?.resourceId) {
      setPreselectedResource(location.state.resourceId)
      setShowCreate(true)
    }
  }, [location.state])

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      let result
      if (isAdmin) {
        result = await bookingService.getAllBookings(statusFilter || null, page, 12)
      } else {
        result = await bookingService.getMyBookings(page, 12)
      }
      const content = result.content ?? []
      setBookings(content)
      setTotalPages(result.totalPages ?? 0)
      setTotalElements(result.totalElements ?? 0)

      // Simple stats from current page
      if (!isAdmin) {
        setStats({
          pending: content.filter(b => b.status === 'PENDING').length,
          approved: content.filter(b => b.status === 'APPROVED').length,
          total: result.totalElements ?? content.length,
        })
      }
    } catch (e) {
      console.error('Failed to load bookings', e)
    } finally {
      setLoading(false)
    }
  }, [isAdmin, page, statusFilter])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  // Filter displayed bookings by search
  const displayed = bookings.filter(b => {
    if (!searchTerm) return true
    const s = searchTerm.toLowerCase()
    return (
      b.resourceName?.toLowerCase().includes(s) ||
      b.bookingNumber?.toLowerCase().includes(s) ||
      b.purpose?.toLowerCase().includes(s) ||
      b.userName?.toLowerCase().includes(s)
    )
  })

  const handleApprove = async (booking) => {
    try {
      await bookingService.approveBooking(booking.id)
      fetchBookings()
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to approve booking')
    }
  }

  const handleReject = async (reason) => {
    try {
      await bookingService.rejectBooking(rejectTarget.id, reason)
      setRejectTarget(null)
      fetchBookings()
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to reject booking')
    }
  }

  const handleCancel = async (booking) => {
    if (!confirm(`Cancel booking ${booking.bookingNumber}?`)) return
    try {
      await bookingService.cancelBooking(booking.id)
      fetchBookings()
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to cancel booking')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
              {isAdmin ? 'All Bookings' : 'My Bookings'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              {isAdmin
                ? 'Manage and approve resource booking requests'
                : 'Track and manage your resource reservations'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={fetchBookings} style={{ ...btnStyle('ghost'), padding: '9px 14px' }}>
              <RefreshCw size={14} />
            </button>
            <button onClick={() => setShowCreate(true)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 600,
              background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer'
            }}>
              <Plus size={16} /> New Booking
            </button>
          </div>
        </div>

        {/* Stats strip (user view) */}
        {!isAdmin && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total Bookings', value: stats.total, color: 'var(--accent)' },
              { label: 'Approved',       value: bookings.filter(b=>b.status==='APPROVED').length, color: '#34d399' },
              { label: 'Pending',        value: bookings.filter(b=>b.status==='PENDING').length, color: '#fbbf24' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '14px 18px',
              }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: 'Space Grotesk' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search bookings…"
              style={{
                width: '100%', padding: '9px 12px 9px 32px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                borderRadius: 8, color: 'var(--text-primary)', fontSize: 13
              }}
            />
          </div>
          {isAdmin && (
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(0) }}
              style={{ padding: '9px 12px', fontSize: 13, minWidth: 140 }}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : displayed.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: 60,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)'
          }}>
            <BookOpen size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
            <p style={{ color: 'var(--text-muted)' }}>
              {searchTerm ? 'No bookings match your search' : 'No bookings found'}
            </p>
            <button onClick={() => setShowCreate(true)} style={{
              marginTop: 16, padding: '9px 18px', borderRadius: 8, fontSize: 13,
              background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer'
            }}>
              Create Your First Booking
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16, marginBottom: 24 }}>
            {displayed.map(b => (
              <BookingCard
                key={b.id}
                booking={b}
                isAdmin={isAdmin}
                onView={setViewBooking}
                onCancel={handleCancel}
                onApprove={handleApprove}
                onReject={setRejectTarget}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{ ...btnStyle('ghost'), opacity: page === 0 ? 0.4 : 1 }}>
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Page {page + 1} of {totalPages} &nbsp;·&nbsp; {totalElements} bookings
            </span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} style={{ ...btnStyle('ghost'), opacity: page >= totalPages - 1 ? 0.4 : 1 }}>
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      {showCreate && (
        <CreateBookingModal
          onClose={() => { setShowCreate(false); setPreselectedResource(null) }}
          onSuccess={() => { setShowCreate(false); setPreselectedResource(null); fetchBookings() }}
          preselectedResourceId={preselectedResource}
        />
      )}
      {viewBooking && (
        <BookingDetailModal
          booking={viewBooking}
          onClose={() => setViewBooking(null)}
          isAdmin={isAdmin}
          onApprove={handleApprove}
          onReject={setRejectTarget}
          onCancel={handleCancel}
        />
      )}
      {rejectTarget && (
        <RejectDialog
          booking={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleReject}
        />
      )}
    </div>
  )
}
