export const ROLE_OPTIONS = [
  { value: 'admin', label: 'Администратор' },
  { value: 'teamlead', label: 'Руководитель группы' },
  { value: 'manager', label: 'Менеджер' },
  { value: 'viewer', label: 'Наблюдатель' }
]

export function applyRLS(rows, security = {}) {
  const role = security.role || 'admin'
  const userName = security.userName || ''
  const teamValue = security.teamValue || ''
  const ownerField = security.ownerField || 'owner'
  const teamField = security.teamField || 'team'

  if (role === 'admin') return rows
  if (role === 'viewer') return rows

  if (role === 'manager') {
    return rows.filter((r) => String(r[ownerField] ?? '') === String(userName))
  }

  if (role === 'teamlead') {
    return rows.filter((r) => String(r[teamField] ?? '') === String(teamValue))
  }

  return rows
}
