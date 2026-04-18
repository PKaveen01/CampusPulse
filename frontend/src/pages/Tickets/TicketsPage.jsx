import React, { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Plus } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'
import resourceService from '../../services/resourceService'
import { ticketService } from '../../services/ticketService'
import { useAuth } from '../../context/AuthContext'
import TicketCreateForm from './components/TicketCreateForm'
import TicketList from './components/TicketList'
import TicketDetailsPanel from './components/TicketDetailsPanel'
import { MAX_FILES, ACCEPTED_IMAGE_TYPES } from './ticketConstants'

export default function TicketsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [resources, setResources] = useState([])
  const [resourcesLoading, setResourcesLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replySubmitting, setReplySubmitting] = useState(false)

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
    fetchResources()
  }, [])

  async function fetchResources() {
    setResourcesLoading(true)
    try {
      const data = await resourceService.getResources()
      setResources(data)
    } catch {
      setResources([])
    } finally {
      setResourcesLoading(false)
    }
  }

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

  async function handleViewDetails(ticketId) {
    setDetailsLoading(true)
    setError('')
    try {
      const data = await ticketService.getTicketById(ticketId)
      setSelectedTicket(data)
      setReplyText('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load ticket details')
    } finally {
      setDetailsLoading(false)
    }
  }

  async function handleReplySubmit(e) {
    e.preventDefault()
    if (!selectedTicket?.id || !replyText.trim()) return

    setReplySubmitting(true)
    setError('')
    try {
      await ticketService.addComment(selectedTicket.id, replyText.trim(), false)
      const updated = await ticketService.getTicketById(selectedTicket.id)
      setSelectedTicket(updated)
      setReplyText('')
      setMessage('Reply sent successfully')
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
          <TicketCreateForm
            form={form}
            resources={resources}
            resourcesLoading={resourcesLoading}
            submitting={submitting}
            onFieldChange={onFieldChange}
            onFileChange={onFileChange}
            onSubmit={handleCreateTicket}
          />
        )}

        <TicketList loading={loading} tickets={tickets} onViewDetails={handleViewDetails} />

        {(selectedTicket || detailsLoading) && (
          <TicketDetailsPanel
            ticket={selectedTicket}
            loading={detailsLoading}
            currentUserId={user?.id}
            replyText={replyText}
            replySubmitting={replySubmitting}
            onReplyChange={setReplyText}
            onReplySubmit={handleReplySubmit}
            onClose={() => {
              setSelectedTicket(null)
              setReplyText('')
            }}
          />
        )}
      </main>
    </div>
  )
}
