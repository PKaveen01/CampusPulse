import React, { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Clock3, ImagePlus, Plus, Wrench } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'
import { ticketService } from '../../services/ticketService'

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const CATEGORIES = [
  'ELECTRICAL',
  'NETWORK',
  'HARDWARE',
  'SOFTWARE',
  'PROJECTOR',
  'AIR_CONDITIONING',
  'PLUMBING',
  'CLEANING',
  'SECURITY',
  'OTHER',
]
const MAX_FILES = 3
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

const STATUS_COLOR = {
  OPEN: 'var(--info)',
  IN_PROGRESS: 'var(--warning)',
  RESOLVED: 'var(--success)',
  CLOSED: 'var(--accent)',
  REJECTED: 'var(--danger)',
}

function StatusPill({ status }) {
  const color = STATUS_COLOR[status] ?? 'var(--text-secondary)'
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.06em',
        padding: '4px 10px',
        borderRadius: 999,
        color,
        border: `1px solid ${color}55`,
        background: `${color}14`,
      }}
    >
      {status?.replace('_', ' ') ?? 'UNKNOWN'}
    </span>
  )
}

function EmptyState() {
  return (
    <div
      style={{
        padding: 28,
        borderRadius: 14,
        border: '1px dashed var(--border)',
        textAlign: 'center',
        color: 'var(--text-secondary)',
      }}
    >
      <Wrench size={18} style={{ margin: '0 auto 8px auto', color: 'var(--warning)' }} />
      <p style={{ marginBottom: 4, color: 'var(--text-primary)', fontWeight: 600 }}>No tickets yet</p>
      <p style={{ fontSize: 13 }}>Create your first incident ticket to report an issue.</p>
    </div>
  )
}

export default function TicketsPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const [form, setForm] = useState({
    resourceId: '',
    location: '',
    category: 'ELECTRICAL',
    priority: 'MEDIUM',
    description: '',
    preferredContactDetails: '',
    attachments: [],
  })

  const showCreate = useMemo(() => {
    return location.pathname.endsWith('/new')
  }, [location.pathname])

  useEffect(() => {
    fetchTickets()
  }, [])

  async function fetchTickets() {
    setLoading(true)
    setError('')
    try {
      const data = await ticketService.getMyTickets()
      setTickets(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  function onFieldChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function onFileChange(e) {
    const nextFiles = Array.from(e.target.files || [])

    if (nextFiles.length > MAX_FILES) {
      setError('You can upload up to 3 images only.')
      return
    }

    const invalidType = nextFiles.find(file => !ACCEPTED_IMAGE_TYPES.includes(file.type))
    if (invalidType) {
      setError('Only JPG and PNG images are allowed.')
      return
    }

    setError('')
    setForm(prev => ({ ...prev, attachments: nextFiles }))
  }

  async function handleCreateTicket(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!form.category.trim()) {
      setError('Category is required')
      return
    }
    if (!form.description.trim()) {
      setError('Description is required')
      return
    }
    if (form.attachments.length > MAX_FILES) {
      setError('You can upload up to 3 images only.')
      return
    }

    const payload = {
      resourceId: form.resourceId.trim() ? Number(form.resourceId) : null,
      location: form.location.trim(),
      category: form.category.trim(),
      priority: form.priority,
      description: form.description.trim(),
      preferredContactDetails: form.preferredContactDetails.trim(),
      attachments: form.attachments,
    }

    setSubmitting(true)
    try {
      const createdTicket = await ticketService.createTicket(payload)
      setMessage(`Ticket created successfully. Ticket ID: ${createdTicket?.ticketNumber ?? 'Auto-generated'}`)
      setForm({
        resourceId: '',
        location: '',
        category: 'ELECTRICAL',
        priority: 'MEDIUM',
        description: '',
        preferredContactDetails: '',
        attachments: [],
      })
      await fetchTickets()
      navigate('/tickets')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ maxWidth: 1150, margin: '0 auto', padding: '28px 24px 36px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700 }}>Maintenance Tickets</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
              Report incidents with optional evidence images and track progress.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link
              to="/tickets"
              style={{
                padding: '9px 14px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontSize: 14,
              }}
            >
              My Tickets
            </Link>
            <Link
              to="/tickets/new"
              style={{
                padding: '9px 14px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, var(--warning), #f59e0b)',
                color: '#1b1408',
                fontSize: 14,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Plus size={14} /> New Ticket
            </Link>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginBottom: 14,
              padding: '11px 14px',
              borderRadius: 10,
              border: '1px solid var(--danger)',
              background: 'rgba(248,113,113,0.12)',
              color: '#fecaca',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {message && (
          <div
            style={{
              marginBottom: 14,
              padding: '11px 14px',
              borderRadius: 10,
              border: '1px solid var(--success)',
              background: 'rgba(52,211,153,0.14)',
              color: '#bbf7d0',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <CheckCircle2 size={16} /> {message}
          </div>
        )}

        {showCreate && (
          <section
            style={{
              marginBottom: 24,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 20,
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>Create Incident Ticket</h2>
            <form onSubmit={handleCreateTicket} style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <input
                  value="Ticket ID (Auto-generated)"
                  readOnly
                  aria-label="Ticket ID"
                  style={{
                    ...inputStyle,
                    color: 'var(--text-primary)',
                    background: 'rgba(255,255,255,0.02)',
                    cursor: 'not-allowed',
                    fontWeight: 600,
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <input
                  name="resourceId"
                  type="number"
                  min="1"
                  placeholder="Resource ID (optional)"
                  value={form.resourceId}
                  onChange={onFieldChange}
                  style={inputStyle}
                />
                <input
                  name="location"
                  placeholder="Location (example: Room 301)"
                  value={form.location}
                  onChange={onFieldChange}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <select
                  name="category"
                  value={form.category}
                  onChange={onFieldChange}
                  style={{ ...inputStyle, color: 'var(--text-primary)', background: '#1a2438' }}
                  required
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category} style={{ color: '#0f172a', background: '#ffffff' }}>
                      {category.replaceAll('_', ' ')}
                    </option>
                  ))}
                </select>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={onFieldChange}
                  style={{ ...inputStyle, color: 'var(--text-primary)', background: '#1a2438' }}
                >
                  {PRIORITIES.map(p => (
                    <option key={p} value={p} style={{ color: '#0f172a', background: '#ffffff' }}>{p}</option>
                  ))}
                </select>
              </div>

              <textarea
                name="description"
                placeholder="Describe the incident in detail"
                value={form.description}
                onChange={onFieldChange}
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
                required
              />

              <input
                name="preferredContactDetails"
                placeholder="Preferred contact details (phone/email)"
                value={form.preferredContactDetails}
                onChange={onFieldChange}
                style={inputStyle}
              />

              <div style={{ border: '1px dashed var(--border)', borderRadius: 10, padding: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--text-secondary)', fontSize: 14 }}>
                  <ImagePlus size={15} /> Attach up to 3 images (JPG, PNG)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  multiple
                  onChange={onFileChange}
                />
                {form.attachments.length > 0 && (
                  <p style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: 13 }}>
                    Selected: {form.attachments.map(f => f.name).join(', ')}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 10,
                    background: submitting
                      ? 'rgba(251,191,36,0.5)'
                      : 'linear-gradient(135deg, var(--warning), #f59e0b)',
                    color: '#1b1408',
                    fontWeight: 700,
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </section>
        )}

        <section
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: 20,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>My Ticket List</h2>
          {loading ? (
            <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock3 size={14} /> Loading tickets...
            </p>
          ) : tickets.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {tickets.map(ticket => (
                <div
                  key={ticket.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: 14,
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <strong>{ticket.ticketNumber}</strong>
                      <StatusPill status={ticket.status} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Priority: {ticket.priority}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '-'}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-primary)', marginBottom: 6 }}>{ticket.description}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Category: {ticket.category} • Location: {ticket.location || 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'rgba(255,255,255,0.03)',
  color: 'var(--text-primary)',
  padding: '10px 12px',
  outline: 'none',
}
