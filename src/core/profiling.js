export function detectColumnType(values) {
  const nonEmpty = values.filter((v) => v !== null && v !== '')
  if (!nonEmpty.length) return 'empty'
  const isBoolean = nonEmpty.every((v) => v === true || v === false || v === 'true' || v === 'false')
  if (isBoolean) return 'boolean'
  const isNumber = nonEmpty.every((v) => !Number.isNaN(Number(v)))
  if (isNumber) return 'number'
  const isDate = nonEmpty.every((v) => {
    if (typeof v === 'number') return false
    const d = new Date(v)
    return !Number.isNaN(d.getTime())
  })
  if (isDate) return 'date'
  return 'string'
}

export function profileTable(table) {
  const profiles = table.columns.map((column) => {
    const values = table.rows.map((row) => row[column])
    const type = detectColumnType(values)
    const normalized = values.filter((v) => v !== null && v !== '').map((v) => String(v).trim().toLowerCase())
    const unique = new Set(normalized)
    const nullCount = values.filter((v) => v === null || v === '').length
    return {
      name: column,
      type,
      nullPercent: table.rows.length ? Math.round((nullCount / table.rows.length) * 100) : 0,
      uniquePercent: normalized.length ? Math.round((unique.size / normalized.length) * 100) : 0,
      examples: Array.from(unique).slice(0, 3)
    }
  })

  return { ...table, profiles }
}
