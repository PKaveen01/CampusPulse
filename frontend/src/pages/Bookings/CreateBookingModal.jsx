import React, { useState, useEffect } from 'react'
import { X, Calendar, Clock, Users, FileText, Building2, ChevronDown, AlertCircle, CheckCircle } from 'lucide-react'
import bookingService from '../../services/bookingService'
import resourceService from '../../services/resourceService'

const inputStyle = {
  width: '100%', padding: '10px 12px',
  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
  borderRadius: 8, color: 'var(--text-primary)', fontSize: 13
}

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em'
}

export default function CreateBookingModal({ onClose, onSuccess, preselectedResourceId }) {
  const [resources, setResources] = useState([])
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    resourceId: preselectedResourceId ? String(preselectedResourceId) : '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: '',
  })

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  // Load resources
  useEffect(() => {
    resourceService.getResources(0, 200)
      .then(list => setResources(Array.isArray(list) ? list.filter(r => r.status === 'ACTIVE') : []))
      .catch(() => setResources([]))
  }, [])

  // Load slots when resource + date are set
  useEffect(() => {
    if (!form.resourceId || !form.bookingDate) { setSlots([]); return }
    setLoadingSlots(true)
    bookingService.getAvailableSlots(form.resourceId, form.bookingDate)
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [form.resourceId, form.bookingDate])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Derived — must be at component level so JSX can read them
  const selectedResource = resources.find(r => String(r.id) === form.resourceId)

  const capacityExceeded = !!(
    selectedResource &&
    form.expectedAttendees &&
    Number(form.expectedAttendees) > selectedResource.capacity
  )

  const availableSlots = slots.filter(s => s.available)

  const handleStartTime = (value) => {
    set('startTime', value)
    set('endTime', '')
  }

  // Available end times: slots that start at or after startTime and are available
  const endSlots = form.startTime
    ? slots.filter(s => s.startTime >= form.startTime && s.available)
    : []

  const handleSubmit = async () => {
    setError('')
    if (capacityExceeded) {
      setError(`Expected attendees exceed the resource capacity of ${selectedResource.capacity}`)
      return
    }
    if (!form.resourceId || !form.bookingDate || !form.startTime || !form.endTime || !form.purpose) {
      setError('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    try {
      await bookingService.createBooking({
        resourceId: Number(form.resourceId),
        bookingDate: form.bookingDate,
        startTime: form.startTime + ':00',
        endTime: form.endTime + ':00',
        purpose: form.purpose,
        expectedAttendees: form.expectedAttendees ? Number(form.expectedAttendees) : null,
      })
      onSuccess()
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', width: '100%', maxWidth: 560,
        maxHeight: '90vh', overflow: 'auto',
        animation: 'fadeIn 0.2s ease'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px 16px', borderBottom: '1px solid var(--border)'
        }}>
          <div>
            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 700 }}>New Booking</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>Reserve a campus resource</p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: 4, borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>

          {error && (
            <div style={{
              display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 14px',
              background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: 8, fontSize: 13, color: '#f87171'
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </div>
          )}

          {/* Resource */}
          <div>
            <label style={labelStyle}><Building2 size={11} style={{ display: 'inline', marginRight: 4 }} />Resource *</label>
            <select value={form.resourceId} onChange={e => set('resourceId', e.target.value)} style={inputStyle}>
              <option value="">Select a resource…</option>
              {resources.map(r => (
                <option key={r.id} value={r.id}>{r.name} — {r.location}</option>
              ))}
            </select>
            {selectedResource && (
              <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.2)', fontSize: 12, color: 'var(--text-secondary)' }}>
                Capacity: {selectedResource.capacity} · Type: {selectedResource.resourceType}
              </div>
            )}
          </div>

          {/* Date */}
          <div>
            <label style={labelStyle}><Calendar size={11} style={{ display: 'inline', marginRight: 4 }} />Date *</label>
            <input
              type="date" value={form.bookingDate} min={minDate}
              onChange={e => { set('bookingDate', e.target.value); set('startTime', ''); set('endTime', '') }}
              style={inputStyle}
            />
          </div>

          {/* Time Slots */}
          {form.resourceId && form.bookingDate && (
            <div>
              <label style={labelStyle}><Clock size={11} style={{ display: 'inline', marginRight: 4 }} />Start Time *</label>
              {loadingSlots ? (
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading available slots…</p>
              ) : availableSlots.length === 0 ? (
                <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', fontSize: 13, color: '#f87171' }}>
                  No available slots on this date
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {availableSlots.map(s => (
                    <button
                      key={s.startTime}
                      onClick={() => handleStartTime(s.startTime.slice(0, 5))}
                      style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                        border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
                        background: form.startTime === s.startTime.slice(0, 5) ? 'var(--accent)' : 'rgba(255,255,255,0.04)',
                        borderColor: form.startTime === s.startTime.slice(0, 5) ? 'var(--accent)' : 'var(--border)',
                        color: form.startTime === s.startTime.slice(0, 5) ? '#fff' : 'var(--text-secondary)',
                      }}
                    >
                      {s.startTime.slice(0, 5)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* End time */}
          {form.startTime && (
            <div>
              <label style={labelStyle}>End Time *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {endSlots.map(s => (
                  <button
                    key={s.endTime}
                    onClick={() => set('endTime', s.endTime.slice(0, 5))}
                    style={{
                      padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                      border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
                      background: form.endTime === s.endTime.slice(0, 5) ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.04)',
                      borderColor: form.endTime === s.endTime.slice(0, 5) ? '#34d399' : 'var(--border)',
                      color: form.endTime === s.endTime.slice(0, 5) ? '#34d399' : 'var(--text-secondary)',
                    }}
                  >
                    {s.endTime.slice(0, 5)}
                  </button>
                ))}
              </div>
              {form.startTime && form.endTime && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#34d399', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={12} /> Duration: {form.startTime} – {form.endTime}
                </div>
              )}
            </div>
          )}

          {/* Purpose */}
          <div>
            <label style={labelStyle}><FileText size={11} style={{ display: 'inline', marginRight: 4 }} />Purpose *</label>
            <textarea
              value={form.purpose}
              onChange={e => set('purpose', e.target.value)}
              placeholder="Brief description of why you need this resource…"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Attendees */}
          <div>
            <label style={labelStyle}><Users size={11} style={{ display: 'inline', marginRight: 4 }} />Expected Attendees</label>
            <input
              type="number"
              min={1}
              max={selectedResource ? selectedResource.capacity : undefined}
              value={form.expectedAttendees}
              onChange={e => set('expectedAttendees', e.target.value)}
              placeholder={selectedResource ? `Max: ${selectedResource.capacity}` : 'Number of people'}
              style={{
                ...inputStyle,
                borderColor: selectedResource && form.expectedAttendees &&
                  Number(form.expectedAttendees) > selectedResource.capacity
                  ? '#f87171'
                  : 'var(--border)'
              }}
            />
            {selectedResource && form.expectedAttendees && Number(form.expectedAttendees) > selectedResource.capacity && (
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#f87171' }}>
                <AlertCircle size={12} />
                Exceeds capacity — max {selectedResource.capacity} for this resource
              </div>
            )}
            {selectedResource && form.expectedAttendees && Number(form.expectedAttendees) > 0 &&
              Number(form.expectedAttendees) <= selectedResource.capacity && (
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#34d399' }}>
                <CheckCircle size={12} />
                {form.expectedAttendees} of {selectedResource.capacity} capacity
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid var(--border)',
          display: 'flex', gap: 10, justifyContent: 'flex-end'
        }}>
          <button onClick={onClose} style={{
            padding: '10px 18px', borderRadius: 8, fontSize: 13,
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', cursor: 'pointer'
          }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !form.resourceId || !form.bookingDate || !form.startTime || !form.endTime || !form.purpose || capacityExceeded}
            style={{
              padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer',
              opacity: (submitting || !form.resourceId || !form.bookingDate || !form.startTime || !form.endTime || !form.purpose || capacityExceeded) ? 0.6 : 1
            }}
          >
            {submitting ? 'Submitting…' : 'Submit Booking'}
          </button>
        </div>
      </div>
    </div>
  )
}
