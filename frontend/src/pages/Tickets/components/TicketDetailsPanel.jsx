import React, { useEffect, useState } from 'react'
import { MessageCircle, Shield, Ticket, X } from 'lucide-react'
import QRCode from 'qrcode'
import TicketStatusPill from './TicketStatusPill'

function buildBars(seedText) {
  const source = String(seedText || 'TICKET')
  let hash = 0
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash << 5) - hash + source.charCodeAt(i)
    hash |= 0
  }

  return Array.from({ length: 40 }, (_, index) => {
    const value = Math.abs((hash + index * 31) % 100)
    const height = value > 66 ? 34 : value > 33 ? 26 : 18
    const width = value % 3 === 0 ? 2 : 1
    return { height, width }
  })
}

export default function TicketDetailsPanel({
  ticket,
  loading,
  currentUserId,
  replyText,
  replySubmitting,
  onReplyChange,
  onReplySubmit,
  onClose,
}) {
  if (!ticket && !loading) return null

  const bars = buildBars(ticket?.ticketNumber || ticket?.id)
  const qrPayload = [
    `ticketNumber:${ticket?.ticketNumber || `TCK-${ticket?.id || ''}`}`,
    `problem:${ticket?.description || ''}`,
    `status:${ticket?.status || ''}`,
  ].join('|')
  const [qrImage, setQrImage] = useState('')

  useEffect(() => {
    let disposed = false

    async function generateQrImage() {
      if (!ticket) {
        setQrImage('')
        return
      }

      try {
        const imageDataUrl = await QRCode.toDataURL(qrPayload, {
          errorCorrectionLevel: 'M',
          margin: 1,
          width: 220,
          color: {
            dark: '#0f172a',
            light: '#f8fafc',
          },
        })
        if (!disposed) {
          setQrImage(imageDataUrl)
        }
      } catch {
        if (!disposed) {
          setQrImage('')
        }
      }
    }

    generateQrImage()

    return () => {
      disposed = true
    }
  }, [ticket, qrPayload])

  return (
    <section
      style={{
        marginTop: 16,
        background: 'linear-gradient(180deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.62) 100%)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: 20,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Ticket size={16} style={{ color: 'var(--warning)' }} />
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Ticket Details</h2>
        </div>
        <button onClick={onClose} style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center' }}>
          <X size={16} />
        </button>
      </div>

      {loading || !ticket ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Loading details...</p>
      ) : (
        <>
          <div
            style={{
              border: '1px solid rgba(148,163,184,0.25)',
              borderRadius: 14,
              marginBottom: 14,
              background: 'linear-gradient(145deg, rgba(15,23,42,0.95), rgba(30,41,59,0.88))',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr auto 1fr' }}>
              <div style={{ padding: 14 }}>
                <p style={{ fontSize: 11, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>
                  Service Ticket Pass
                </p>
                <p style={{ fontSize: 20, fontWeight: 800, letterSpacing: '0.06em', fontFamily: 'monospace', marginBottom: 8 }}>
                  {ticket.ticketNumber || `TCK-${ticket.id}`}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <TicketStatusPill status={ticket.status} />
                  <span style={{ fontSize: 12, color: '#cbd5e1' }}>Ref #{ticket.id}</span>
                </div>
                <div
                  style={{
                    borderRadius: 8,
                    background: '#f8fafc',
                    padding: '8px 10px',
                    width: '100%',
                    maxWidth: 360,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 34 }}>
                    <span style={{ width: 3, height: 34, background: '#0f172a' }} />
                    {bars.map((bar, index) => (
                      <span key={index} style={{ width: bar.width, height: bar.height - 4, background: '#0f172a', borderRadius: 1 }} />
                    ))}
                    <span style={{ width: 3, height: 34, background: '#0f172a' }} />
                  </div>
                </div>
              </div>

              <div
                style={{
                  width: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  background: 'rgba(255,255,255,0.02)',
                  borderLeft: '1px dashed rgba(148,163,184,0.35)',
                  borderRight: '1px dashed rgba(148,163,184,0.35)',
                }}
              >
                <span style={{ width: 14, height: 14, borderRadius: 999, background: '#0b1220' }} />
                <span style={{ width: 14, height: 14, borderRadius: 999, background: '#0b1220' }} />
              </div>

              <div style={{ padding: 14, display: 'grid', alignContent: 'center' }}>
                <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 5 }}>QR Verification</p>
                <div
                  style={{
                    width: 118,
                    height: 118,
                    borderRadius: 10,
                    background: '#e2e8f0',
                    padding: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}
                >
                  {qrImage ? (
                    <img
                      src={qrImage}
                      alt="Ticket verification QR"
                      style={{ width: '100%', height: '100%', borderRadius: 6, imageRendering: 'pixelated' }}
                    />
                  ) : (
                    <span style={{ fontSize: 11, color: '#475569' }}>QR loading...</span>
                  )}
                </div>
                <p style={{ fontSize: 11, color: '#cbd5e1' }}>Includes: Ticket No, Problem, Status</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginBottom: 14 }}>
            <Info label="Category" value={ticket.category} />
            <Info label="Priority" value={ticket.priority} />
            <Info label="Location" value={ticket.location || 'N/A'} />
            <Info label="Created" value={ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : 'N/A'} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Issue Description</p>
            <p style={{ fontSize: 14, color: 'var(--text-primary)' }}>{ticket.description}</p>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
              <MessageCircle size={14} /> Replies
            </p>

            <div style={{ maxHeight: 190, overflow: 'auto', display: 'grid', gap: 8, marginBottom: 12 }}>
              {(ticket.comments ?? []).length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>No replies yet.</p>
              ) : (
                ticket.comments.map(comment => {
                  const isMine = currentUserId === comment.userId
                  return (
                    <div
                      key={comment.id}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        padding: 10,
                        background: isMine ? 'rgba(59,130,246,0.10)' : 'rgba(16,185,129,0.10)',
                      }}
                    >
                      <p style={{ fontSize: 11, color: isMine ? '#93c5fd' : '#86efac', fontWeight: 700, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {!isMine && <Shield size={12} />} {isMine ? 'You' : 'Admin/Staff'}
                      </p>
                      <p style={{ fontSize: 13 }}>{comment.comment}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                        {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
                      </p>
                    </div>
                  )
                })
              )}
            </div>

            <form onSubmit={onReplySubmit} style={{ display: 'grid', gap: 8 }}>
              <textarea
                value={replyText}
                onChange={e => onReplyChange(e.target.value)}
                rows={3}
                placeholder="Reply to admin..."
                style={{
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'rgba(255,255,255,0.03)',
                  color: 'var(--text-primary)',
                  padding: '10px 12px',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={replySubmitting || !replyText.trim()}
                  style={{
                    padding: '9px 14px',
                    borderRadius: 10,
                    background: replySubmitting ? 'rgba(59,130,246,0.4)' : 'linear-gradient(135deg,#60a5fa,#2563eb)',
                    color: '#eff6ff',
                    fontWeight: 700,
                  }}
                >
                  {replySubmitting ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </section>
  )
}

function Info({ label, value }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 10, background: 'rgba(255,255,255,0.02)' }}>
      <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{value}</p>
    </div>
  )
}