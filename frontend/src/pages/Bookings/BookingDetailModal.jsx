import React from 'react'
import {
  X, Calendar, Clock, Users, FileText, MapPin, Building2,
  CheckCircle, XCircle, Hash, User, AlertCircle
} from 'lucide-react'

const STATUS = {
  PENDING:   { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', label: 'Pending' },
  APPROVED:  { bg: 'rgba(52,211,153,0.12)',  color: '#34d399', label: 'Approved' },
  REJECTED:  { bg: 'rgba(248,113,113,0.12)', color: '#f87171', label: 'Rejected' },
  CANCELLED: { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', label: 'Cancelled' },
}

function Row({ icon: Icon, label, value, accent }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={14} style={{ color: accent || 'var(--text-muted)' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5 }}>{value}</div>
      </div>
    </div>
  )
}

function btnStyle(variant) {
  const base = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s' }
  if (variant === 'ghost')   return { ...base, background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }
  if (variant === 'success') return { ...base, background: 'rgba(52,211,153,0.1)', borderColor: 'rgba(52,211,153,0.3)', color: '#34d399' }
  if (variant === 'danger')  return { ...base, background: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.3)', color: '#f87171' }
  return base
}

export default function BookingDetailModal({ booking, onClose, isAdmin, onApprove, onReject, onCancel }) {
  if (!booking) return null
  const s = STATUS[booking.status] ?? { bg: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)', label: booking.status }
  const canApprove = isAdmin && booking.status === 'PENDING'
  const canCancel  = ['PENDING', 'APPROVED'].includes(booking.status)

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', width: '100%', maxWidth: 520,
        maxHeight: '90vh', overflow: 'auto', animation: 'fadeIn 0.2s ease'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{booking.bookingNumber}</span>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20,
                background: s.bg, color: s.color, textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>{s.label}</span>
            </div>
            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 700 }}>Booking Details</h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: 4, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 6 }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '8px 24px 20px' }}>
          <Row icon={Building2} label="Resource"  value={booking.resourceName || `Resource #${booking.resourceId}`} accent="var(--accent)" />
          <Row icon={MapPin}     label="Location"  value={booking.resourceLocation} />
          <Row icon={Calendar}   label="Date"      value={booking.bookingDate} />
          <Row icon={Clock}      label="Time"      value={`${booking.startTime?.slice(0,5)} – ${booking.endTime?.slice(0,5)}`} />
          <Row icon={Users}      label="Attendees" value={booking.expectedAttendees ? `${booking.expectedAttendees} people` : null} />
          <Row icon={FileText}   label="Purpose"   value={booking.purpose} />
          <Row icon={User}       label="Booked by" value={booking.userName ? `${booking.userName} (${booking.userEmail})` : null} />
          {booking.approvedByName && (
            <Row icon={CheckCircle} label="Approved by" value={`${booking.approvedByName}`} accent="#34d399" />
          )}
          {booking.rejectionReason && (
            <div style={{
              marginTop: 12, padding: '10px 14px', borderRadius: 8,
              background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
              fontSize: 13, color: '#f87171'
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Rejection Reason</div>
              {booking.rejectionReason}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {(canApprove || canCancel) && (
          <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={onClose} style={btnStyle('ghost')}>Close</button>
            {canApprove && (
              <>
                <button onClick={() => { onApprove(booking); onClose() }} style={btnStyle('success')}>
                  <CheckCircle size={14} /> Approve
                </button>
                <button onClick={() => { onReject(booking); onClose() }} style={btnStyle('danger')}>
                  <XCircle size={14} /> Reject
                </button>
              </>
            )}
            {!isAdmin && canCancel && (
              <button onClick={() => { onCancel(booking); onClose() }} style={btnStyle('danger')}>
                <XCircle size={14} /> Cancel Booking
              </button>
            )}
          </div>
        )}
        {!canApprove && !canCancel && (
          <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)' }}>
            <button onClick={onClose} style={btnStyle('ghost')}>Close</button>
          </div>
        )}
      </div>
    </div>
  )
}
