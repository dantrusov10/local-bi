export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

export function normalizeValue(value) {
  if (value === undefined || value === null || value === '') return null
  if (typeof value === 'string') return value.trim()
  return value
}

export function normalizeJoinKey(value, mode = 'soft') {
  if (value === null || value === undefined) return ''
  const base = String(value).trim().toLowerCase()
  if (mode === 'loose') {
    return base.replace(/[\s\-()]/g, '')
  }
  return base
}
