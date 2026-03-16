import { applyFilters } from './filtering.js'

export function buildExploreData(rows, config) {
  const { dimensions = [], metric, metricField, filters = [] } = config
  const filtered = applyFilters([...rows], filters)

  if (!dimensions.length || !metric) {
    return { rows: filtered, chartData: [] }
  }

  const groups = new Map()
  for (const row of filtered) {
    const key = dimensions.map((d) => String(row[d] ?? '—')).join(' / ')
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
    return { label, value: Number(value.toFixed(2)) }
  }).sort((a, b) => b.value - a.value)

  return { rows: filtered, chartData: data }
}
