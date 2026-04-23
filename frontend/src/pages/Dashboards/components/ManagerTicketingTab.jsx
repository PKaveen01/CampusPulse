import React, { useEffect, useState } from 'react'
import { CheckCircle2, MessageSquare, RefreshCw, Send } from 'lucide-react'
import { ticketService } from '../../../services/ticketService'
import { useAuth } from '../../../context/AuthContext'

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']

export default function ManagerTicketingTab() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [staff, setStaff] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [statusSubmitting, setStatusSubmitting] = useState(false)
  const [assignSubmitting, setAssignSubmitting] = useState(false)
  const [assigneeId, setAssigneeId] = useState('')
  const [nextStatus, setNextStatus] = useState('OPEN')
  const [statusNote, setStatusNote] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [staffError, setStaffError] = useState('')

  const isManager = user?.role === 'MANAGER'
  const statusOptions = isManager
    ? STATUS_OPTIONS.filter(status => status !== 'CLOSED' && status !== 'REJECTED')
    : STATUS_OPTIONS
  const canShowUpdateButton = details?.status === 'OPEN'

  useEffect(() => {
    loadTickets()
  }, [])

  async function loadTickets() {
    setLoading(true)
    setError('')
    setStaffError('')
    const [ticketResult, staffResult] = await Promise.allSettled([
      ticketService.getMyTickets(),
      ticketService.getAssignableStaff(),
    ])

    if (ticketResult.status === 'fulfilled') {
      setTickets(ticketResult.value)
    } else {
      const err = ticketResult.reason
      setError(err?.response?.data?.message || 'Failed to load tickets')
      setTickets([])
    }

    if (staffResult.status === 'fulfilled') {
      setStaff(staffResult.value)
    } else {
      setStaff([])
      const err = staffResult.reason
      setStaffError(err?.response?.data?.message || 'Failed to load available technicians')
    }

    setLoading(false)
  }

  async function selectTicket(ticketId) {
    setSelectedId(ticketId)
    setDetailsLoading(true)
    setError('')
    setMessage('')
    try {
      const data = await ticketService.getTicketById(ticketId)
      setDetails(data)
      setAssigneeId(data.assignedTo ? String(data.assignedTo) : '')
      setNextStatus(data.status || 'OPEN')
      setStatusNote('')
    } catch (err) {
      setDetails(null)
      setError(err.response?.data?.message || 'Failed to load ticket details')
    } finally {
      setDetailsLoading(false)
    }
  }

  async function submitAssign(e) {
    e.preventDefault()
    if (!selectedId || !assigneeId) return

    setAssignSubmitting(true)
    setError('')
    setMessage('')
    try {
      await ticketService.assignTicket(selectedId, Number(assigneeId))
      setMessage('Technician assigned successfully. Waiting for technician to accept the task.')
      await selectTicket(selectedId)
      await loadTickets()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign technician')
    } finally {
      setAssignSubmitting(false)
    }
  }

  async function submitStatusChange(e) {
    e.preventDefault()
    if (!selectedId || !nextStatus) return

    setStatusSubmitting(true)
    setError('')
    setMessage('')

    const payload = { status: nextStatus }
    if (nextStatus === 'RESOLVED' && statusNote.trim()) {
      payload.resolutionNotes = statusNote.trim()
    }
    if (nextStatus === 'REJECTED' && statusNote.trim()) {
      payload.rejectedReason = statusNote.trim()
    }

    try {
      await ticketService.updateTicketStatus(selectedId, payload)
      setMessage('Ticket status updated successfully')
      await selectTicket(selectedId)
      await loadTickets()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update ticket status')
    } finally {
      setStatusSubmitting(false)
    }
  }

  async function submitReply(e) {
    e.preventDefault()
    if (!selectedId || !replyText.trim()) return

    setSubmitting(true)
    setError('')
    setMessage('')
    try {
      await ticketService.addComment(selectedId, replyText.trim(), false)
      setReplyText('')
      setMessage('Reply sent successfully')
      await selectTicket(selectedId)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reply')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, animation: 'fadeIn 0.5s ease 0.32s both' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 600 }}>Ticketing</h2>
        <button onClick={loadTickets} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {error && <p style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 10 }}>{error}</p>}
      {message && <p style={{ fontSize: 12, color: 'var(--success)', marginBottom: 10 }}>{message}</p>}
      {staffError && <p style={{ fontSize: 12, color: 'var(--warning)', marginBottom: 10 }}>{staffError}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) minmax(260px, 1.2fr)', gap: 12 }}>
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, maxHeight: 280, overflow: 'auto' }}>
          {loading ? (
            <p style={{ padding: 12, color: 'var(--text-secondary)', fontSize: 13 }}>Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p style={{ padding: 12, color: 'var(--text-secondary)', fontSize: 13 }}>No tickets available</p>
          ) : (
            tickets.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => selectTicket(ticket.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderBottom: '1px solid var(--border)',
                  background: selectedId === ticket.id ? 'rgba(59,130,246,0.12)' : 'transparent',
                }}
              >
                <p style={{ fontSize: 12, fontWeight: 700 }}>{ticket.ticketNumber}</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{ticket.category} • {ticket.status}</p>
              </button>
            ))
          )}
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
          {!selectedId ? (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Select a ticket to review and reply.</p>
          ) : detailsLoading ? (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Loading details...</p>
          ) : !details ? (
            <p style={{ fontSize: 13, color: 'var(--danger)' }}>Ticket details unavailable.</p>
          ) : (
            <>
              <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{details.ticketNumber}</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{details.description}</p>

              <form onSubmit={submitAssign} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 8, marginBottom: 10 }}>
                <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Assign Technician</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
                  <select
                    value={assigneeId}
                    onChange={e => setAssigneeId(e.target.value)}
                    style={{ borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)', padding: '8px 10px' }}
                  >
                    <option value="">Select technician/staff</option>
                    {staff.length === 0 && <option value="" disabled>No technicians available</option>}
                    {staff.map(item => (
                      <option key={item.id} value={String(item.id)}>{item.name || item.fullName || item.email || `User ${item.id}`} ({item.role || 'TECHNICIAN'})</option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={assignSubmitting || !assigneeId}
                    style={{ padding: '8px 10px', borderRadius: 8, background: 'rgba(14,165,233,0.18)', color: '#bae6fd', fontWeight: 700 }}
                  >
                    {assignSubmitting ? 'Assigning...' : 'Assign'}
                  </button>
                </div>
              </form>

              <form onSubmit={submitStatusChange} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 8, marginBottom: 10 }}>
                <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Change Ticket Status</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <select
                    value={nextStatus}
                    onChange={e => setNextStatus(e.target.value)}
                    disabled={!canShowUpdateButton}
                    style={{ borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)', padding: '8px 10px' }}
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>
                    ))}
                  </select>
                  {canShowUpdateButton ? (
                    <button
                      type="submit"
                      disabled={statusSubmitting}
                      style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: 6, padding: '8px 10px', borderRadius: 8, background: 'rgba(59,130,246,0.18)', color: '#bfdbfe', fontWeight: 700 }}
                    >
                      <CheckCircle2 size={13} /> {statusSubmitting ? 'Updating...' : 'Update Status'}
                    </button>
                  ) : (
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px dashed var(--border)', color: 'var(--text-secondary)', fontSize: 11, padding: '8px 10px' }}>
                      Update allowed only for OPEN
                    </div>
                  )}
                </div>
                <textarea
                  value={statusNote}
                  onChange={e => setStatusNote(e.target.value)}
                  disabled={!canShowUpdateButton}
                  rows={2}
                  placeholder={nextStatus === 'REJECTED' ? 'Rejected reason (required by backend)' : 'Resolution note (optional)'}
                  style={{ width: '100%', borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)', padding: 8 }}
                />
              </form>

              <div style={{ maxHeight: 120, overflow: 'auto', marginBottom: 10, border: '1px dashed var(--border)', borderRadius: 8, padding: 8 }}>
                {(details.comments ?? []).length === 0 ? (
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>No replies yet</p>
                ) : (
                  details.comments.map(comment => (
                    <div key={comment.id} style={{ marginBottom: 7 }}>
                      <p style={{ fontSize: 12 }}>{comment.comment}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={submitReply}>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  rows={3}
                  placeholder="Write review or answer..."
                  style={{ width: '100%', borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)', padding: 10, marginBottom: 8 }}
                />
                <button
                  type="submit"
                  disabled={submitting || !replyText.trim()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, background: 'var(--accent)', color: '#041021', fontWeight: 700 }}
                >
                  <Send size={13} /> {submitting ? 'Sending...' : 'Send Reply'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <LinkRow />
    </div>
  )
}

function LinkRow() {
  return (
    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 12 }}>
      <MessageSquare size={13} /> Manager assigns technician. Technician accepts task and handles progress updates.
    </div>
  )
}