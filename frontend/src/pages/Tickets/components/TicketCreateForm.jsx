import React from 'react'
import { ImagePlus } from 'lucide-react'
import { ACCEPTED_IMAGE_TYPES, CATEGORIES, MAX_FILES, PRIORITIES, inputStyle } from '../ticketConstants'

export default function TicketCreateForm({
  form,
  resources,
  resourcesLoading,
  submitting,
  onFieldChange,
  onFileChange,
  onSubmit,
}) {
  return (
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
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <select
            name="resourceId"
            value={form.resourceId}
            onChange={onFieldChange}
            style={{ ...inputStyle, background: '#1a2438' }}
            disabled={resourcesLoading}
          >
            <option value="">{resourcesLoading ? 'Loading resources...' : 'No specific resource'}</option>
            {resources.map(resource => (
              <option key={resource.id} value={String(resource.id)}>
                #{resource.id} - {resource.name}
              </option>
            ))}
          </select>
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
            style={{ ...inputStyle, background: '#1a2438' }}
            required
          >
            {CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
          <select name="priority" value={form.priority} onChange={onFieldChange} style={{ ...inputStyle, background: '#1a2438' }}>
            {PRIORITIES.map(priority => (
              <option key={priority} value={priority}>
                {priority}
              </option>
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
            <ImagePlus size={15} /> Attach up to {MAX_FILES} images (JPG, PNG)
          </label>
          <input type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} multiple onChange={onFileChange} />
          {form.attachments.length > 0 && (
            <p style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: 13 }}>
              Selected: {form.attachments.map(file => file.name).join(', ')}
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
              background: submitting ? 'rgba(251,191,36,0.5)' : 'linear-gradient(135deg, var(--warning), #f59e0b)',
              color: '#1b1408',
              fontWeight: 700,
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </div>
      </form>
    </section>
  )
}