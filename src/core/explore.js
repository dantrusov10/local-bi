export function inferFieldType(rows, field) {
  const values = rows.map((row) => row[field]).filter((v) => v !== null && v !== '')
  if (!values.length) return 'string'
  if (values.every((v) => !Number.isNaN(Number(v)))) return 'number'
  return 'string'
}

export function buildExploreData(rows, config) {
  const { dimension, metric, metricField, filterField, filterValue } = config
  let filtered = [...rows]

  if (filterField && filterValue) {
    filtered = filtered.filter((row) => String(row[filterField] ?? '').toLowerCase().includes(String(filterValue).toLowerCase()))
  }

  if (!dimension || !metric) return { rows: filtered, chartData: [] }

  const groups = new Map()
  for (const row of filtered) {
    const key = row[dimension] ?? '—'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(row)
  }

  const data = Array.from(groups.entries()).map(([label, items]) => {
    const values = metricField ? items.map((row) => Number(row[metricField] || 0)) : []
    let value = 0

    if (metric === 'count') value = items.length
    if (metric === 'sum') value = values.reduce((a, b) => a + b, 0)
    if (metric === 'avg') value = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
    if (metric === 'max') value = values.length ? Math.max(...values) : 0
    if (metric === 'min') value = values.length ? Math.min(...values) : 0

    return { label: String(label), value: Number(value.toFixed(2)) }
  }).sort((a, b) => b.value - a.value)

  return {
    rows: filtered,
    chartData: data
  }
}
