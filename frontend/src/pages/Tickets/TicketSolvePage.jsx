import React, { useEffect, useState } from 'react'
import { CheckCircle2, RefreshCw, Send, UserCog } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import { ticketService } from '../../services/ticketService'

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']

export default function TicketSolvePage() {
  const [tickets, setTickets] = useState([])
  const [staff, setStaff] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [assigneeId, setAssigneeId] = useState('')
  const [nextStatus, setNextStatus] = useState('OPEN')
  const [statusNote, setStatusNote] = useState('')
  const [replyText, setReplyText] = useState('')

  const [assigning, setAssigning] = useState(false)
  const [statusSubmitting, setStatusSubmitting] = useState(false)
  const [replySubmitting, setReplySubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    const [ticketResult, staffResult] = await Promise.allSettled([
      ticketService.getMyTickets(),
      ticketService.getAssignableStaff(),
    ])

    if (ticketResult.status === 'fulfilled') {
      setTickets(ticketResult.value)
    } else {
      const err = ticketResult.reason
      setError(err?.response?.data?.message || 'Failed to load ticket solve data')
      setTickets([])
    }

    if (staffResult.status === 'fulfilled') {
      setStaff(staffResult.value)
    } else {
      setStaff([])
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
      setReplyText('')
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

    setAssigning(true)
    setError('')
    setMessage('')
    try {
      await ticketService.assignTicket(selectedId, Number(assigneeId))
      setMessage('Technician assigned successfully')
      await selectTicket(selectedId)
      await loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign technician')
    } finally {
      setAssigning(false)
    }
  }

  async function submitStatusChange(e) {
    e.preventDefault()
    if (!selectedId || !nextStatus) return

    setStatusSubmitting(true)
    setError('')
    setMessage('')

    const payload = { status: nextStatus }
    if (nextStatus === 'RESOLVED' && statusNote.trim()) payload.resolutionNotes = statusNote.trim()
    if (nextStatus === 'REJECTED' && statusNote.trim()) payload.rejectedReason = statusNote.trim()

    try {
      await ticketService.updateTicketStatus(selectedId, payload)
      setMessage('Ticket status updated successfully')
      await selectTicket(selectedId)
      await loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update ticket status')
    } finally {
      setStatusSubmitting(false)
    }
  }

  async function submitReply(e) {
    e.preventDefault()
    if (!selectedId || !replyText.trim()) return

    setReplySubmitting(true)
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
      setReplySubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ maxWidth: 1150, margin: '0 auto', padding: '28px 24px 36px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>Ticket Solve Center</h1>
          <button onClick={loadData} style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--text-secondary)' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {error && <p style={{ color: 'var(--danger)', marginBottom: 8, fontSize: 13 }}>{error}</p>}
        {message && <p style={{ color: 'var(--success)', marginBottom: 8, fontSize: 13 }}>{message}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) minmax(320px, 1.3fr)', gap: 14 }}>
          <div style={{ border: '1px solid var(--border)', borderRadius: 10, maxHeight: 560, overflow: 'auto', background: 'var(--bg-card)' }}>
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
                    padding: '11px 12px',
                    borderBottom: '1px solid var(--border)',
                    background: selectedId === ticket.id ? 'rgba(59,130,246,0.10)' : 'transparent',
                  }}
                >
                  <p style={{ fontSize: 12, fontWeight: 700 }}>{ticket.ticketNumber}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{ticket.category} • {ticket.status}</p>
                </button>
              ))
            )}
          </div>

          <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 14, background: 'var(--bg-card)' }}>
            {!selectedId ? (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Select a ticket to assign technician and solve.</p>
            ) : detailsLoading ? (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Loading details...</p>
            ) : !details ? (
              <p style={{ fontSize: 13, color: 'var(--danger)' }}>Ticket details unavailable.</p>
            ) : (
              <>
                <p style={{ fontSize: 14, fontWeight: 700 }}>{details.ticketNumber}</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>{details.description}</p>

                <form onSubmit={submitAssign} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 10, marginBottom: 10 }}>
                  <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                    <UserCog size={13} /> Assign Technician
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
                    <select
                      value={assigneeId}
                      onChange={e => setAssigneeId(e.target.value)}
                      style={{ borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)', padding: '8px 10px' }}
                    >
                      <option value="">Select staff member</option>
                      {staff.map(item => (
                        <option key={item.id} value={String(item.id)}>{item.name} ({item.role})</option>
                      ))}
                    </select>
                    <button type="submit" disabled={assigning || !assigneeId} style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(14,165,233,0.18)', color: '#bae6fd', fontWeight: 700 }}>
                      {assigning ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>
                </form>

                <form onSubmit={submitStatusChange} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 10, marginBottom: 10 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Update Status</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginBottom: 8 }}>
                    <select
                      value={nextStatus}
                      onChange={e => setNextStatus(e.target.value)}
                      style={{ borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)', padding: '8px 10px' }}
                    >
                      {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>
                      ))}
                    </select>
                    <button type="submit" disabled={statusSubmitting} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderRadius: 8, background: 'rgba(59,130,246,0.18)', color: '#bfdbfe', fontWeight: 700 }}>
                      <CheckCircle2 size={13} /> {statusSubmitting ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                  <textarea
                    value={statusNote}
                    onChange={e => setStatusNote(e.target.value)}
                    rows={2}
                    placeholder={nextStatus === 'REJECTED' ? 'Rejected reason (required by backend)' : 'Resolution note (optional)'}
                    style={{ width: '100%', borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)', padding: 8 }}
                  />
                </form>

                <div style={{ maxHeight: 130, overflow: 'auto', marginBottom: 10, border: '1px dashed var(--border)', borderRadius: 8, padding: 8 }}>
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
                    placeholder="Write solve update or answer..."
                    style={{ width: '100%', borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)', padding: 10, marginBottom: 8 }}
                  />
                  <button type="submit" disabled={replySubmitting || !replyText.trim()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, background: 'var(--accent)', color: '#041021', fontWeight: 700 }}>
                    <Send size={13} /> {replySubmitting ? 'Sending...' : 'Send Reply'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}