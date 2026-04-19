import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmDialog({ open, title, message, confirmLabel, confirmColor, onConfirm, onCancel }) {
  if (!open) return null

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 380,
          padding: 28, boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          animation: 'fadeIn 0.25s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: `${confirmColor ?? 'var(--warning)'}18`,
            border: `1px solid ${confirmColor ?? 'var(--warning)'}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={18} style={{ color: confirmColor ?? 'var(--warning)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 15, fontWeight: 700 }}>{title}</h3>
          </div>
          <button onClick={onCancel} style={{ color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 22 }}>{message}</p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 18px', borderRadius: 'var(--radius-sm)',
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 18px', borderRadius: 'var(--radius-sm)',
              background: confirmColor ? `${confirmColor}20` : 'rgba(251,191,36,0.15)',
              border: `1px solid ${confirmColor ? `${confirmColor}40` : 'rgba(251,191,36,0.4)'}`,
              color: confirmColor ?? 'var(--warning)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {confirmLabel ?? 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}
