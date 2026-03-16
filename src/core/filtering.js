export const operatorLabels = {
  contains: 'содержит',
  notContains: 'не содержит',
  eq: 'равно',
  neq: 'не равно',
  startsWith: 'начинается с',
  endsWith: 'заканчивается на',
  gt: 'больше',
  gte: 'не менее',
  lt: 'меньше',
  lte: 'не более',
  isEmpty: 'пусто',
  isNotEmpty: 'не пусто'
}

export function applyFilterRule(rows, rule) {
  if (!rule?.field || !rule?.operator) return rows
  return rows.filter((row) => matchRule(row[rule.field], rule.operator, rule.value))
}

export function applyFilters(rows, rules = []) {
  return rules.reduce((acc, rule) => applyFilterRule(acc, rule), rows)
}

function matchRule(raw, operator, value) {
  const str = String(raw ?? '')
  const a = str.toLowerCase()
  const b = String(value ?? '').toLowerCase()
  const numA = Number(raw)
  const numB = Number(value)

  if (operator === 'contains') return a.includes(b)
  if (operator === 'notContains') return !a.includes(b)
  if (operator === 'eq') return a === b
  if (operator === 'neq') return a !== b
  if (operator === 'startsWith') return a.startsWith(b)
  if (operator === 'endsWith') return a.endsWith(b)
  if (operator === 'gt') return !Number.isNaN(numA) && !Number.isNaN(numB) && numA > numB
  if (operator === 'gte') return !Number.isNaN(numA) && !Number.isNaN(numB) && numA >= numB
  if (operator === 'lt') return !Number.isNaN(numA) && !Number.isNaN(numB) && numA < numB
  if (operator === 'lte') return !Number.isNaN(numA) && !Number.isNaN(numB) && numA <= numB
  if (operator === 'isEmpty') return raw == null || raw === ''
  if (operator === 'isNotEmpty') return !(raw == null || raw === '')
  return true
}
