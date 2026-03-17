export const ROLE_OPTIONS = [
  { value: 'admin', label: 'Администратор' },
  { value: 'teamlead', label: 'Руководитель группы' },
  { value: 'manager', label: 'Менеджер' },
  { value: 'viewer', label: 'Наблюдатель' }
]

export function applyRLS(rows, security = {}) {
  const role = security.role || 'viewer'
  const userName = String(security.userName || '')
  const teamValue = String(security.teamValue || '')
  const ownerField = security.ownerField || 'owner'
  const teamField = security.teamField || 'team'

  if (role === 'admin') return rows

  if (role === 'manager') {
    if (!userName) return []
    return rows.filter((r) => String(r[ownerField] ?? '') === userName)
  }

  if (role === 'teamlead') {
    if (!teamValue) return []
    return rows.filter((r) => String(r[teamField] ?? '') === teamValue)
  }

  if (role === 'viewer') {
    if (userName) return rows.filter((r) => String(r[ownerField] ?? '') === userName)
    return []
  }

  return []
}
