/**
 * useAvatarInitials
 * Returns a 1-2 character string of initials derived from a full name,
 * and a deterministic HSL background colour for when no avatar image exists.
 *
 * Usage:
 *   const { initials, color } = useAvatarInitials('John Doe')
 *   // → { initials: 'JD', color: 'hsl(210, 65%, 45%)' }
 */

const PALETTE = [
  'hsl(210, 65%, 45%)',
  'hsl(262, 60%, 52%)',
  'hsl(168, 55%, 38%)',
  'hsl(338, 60%, 50%)',
  'hsl(30,  70%, 48%)',
  'hsl(190, 65%, 40%)',
  'hsl(44,  70%, 48%)',
  'hsl(0,   60%, 52%)',
]

function stringToIndex(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % PALETTE.length
}

/**
 * @param {string} name - full display name
 * @returns {{ initials: string, color: string }}
 */
export function getAvatarMeta(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  let initials = ''
  if (parts.length === 0) {
    initials = '?'
  } else if (parts.length === 1) {
    initials = parts[0].charAt(0).toUpperCase()
  } else {
    initials = (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }
  const color = PALETTE[stringToIndex(name)]
  return { initials, color }
}

/**
 * React hook wrapper around getAvatarMeta.
 * @param {string} name
 */
export function useAvatarInitials(name) {
  return getAvatarMeta(name)
}
