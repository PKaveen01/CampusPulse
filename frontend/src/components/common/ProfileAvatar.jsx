import React from 'react'
import { getAvatarMeta } from '../../hooks/useAvatarInitials'

/**
 * ProfileAvatar
 *
 * A reusable avatar component that shows either:
 *   - The user's avatar image (if avatarUrl is set), or
 *   - A coloured circle with the user's initials
 *
 * Props:
 *   name       {string}  - Display name (used for initials + colour)
 *   avatarUrl  {string}  - URL to avatar image (optional)
 *   size       {number}  - Diameter in pixels (default: 40)
 *   style      {object}  - Extra inline styles
 *   className  {string}  - Extra class names
 *   onClick    {func}    - Click handler
 */
export default function ProfileAvatar({
  name = '',
  avatarUrl,
  size = 40,
  style = {},
  className = '',
  onClick,
}) {
  const { initials, color } = getAvatarMeta(name)
  const fontSize = Math.round(size * 0.38)

  const base = {
    width:  size,
    height: size,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  }

  if (avatarUrl) {
    return (
      <div style={base} className={className} onClick={onClick}>
        <img
          src={avatarUrl}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            // Gracefully fall back to initials if image fails to load
            e.currentTarget.style.display = 'none'
            e.currentTarget.parentElement.style.background = color
            const span = document.createElement('span')
            span.textContent = initials
            span.style.fontSize = `${fontSize}px`
            span.style.fontWeight = '700'
            span.style.color = '#fff'
            span.style.fontFamily = 'Space Grotesk, sans-serif'
            e.currentTarget.parentElement.appendChild(span)
          }}
        />
      </div>
    )
  }

  return (
    <div
      style={{ ...base, background: color }}
      className={className}
      onClick={onClick}
    >
      <span style={{
        fontSize,
        fontWeight: 700,
        color: '#fff',
        fontFamily: 'Space Grotesk, sans-serif',
        lineHeight: 1,
        userSelect: 'none',
      }}>
        {initials}
      </span>
    </div>
  )
}
