export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export const CATEGORIES = [
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

export const MAX_FILES = 3

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

export const STATUS_COLOR = {
  OPEN: 'var(--info)',
  IN_PROGRESS: 'var(--warning)',
  RESOLVED: 'var(--success)',
  CLOSED: 'var(--accent)',
  REJECTED: 'var(--danger)',
}

export const inputStyle = {
  width: '100%',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'rgba(255,255,255,0.03)',
  color: 'var(--text-primary)',
  padding: '10px 12px',
  outline: 'none',
}