import { applyFilters } from './filtering.js'

export function buildExploreData(rows, config) {
  const {
    dimensions = [],
    dimension,
    breakdown = '',
    metric,
    metricField,
    filters = [],
    sort = 'desc',
    topN = ''
  } = config

  const dims = dimensions.length ? dimensions : (dimension ? [dimension] : [])
  const filtered = applyFilters([...rows], filters)

  if (!dims.length || !metric) {
    return { rows: filtered, chartData: [] }
  }

  const groups = new Map()

  for (const row of filtered) {
    const baseKey = dims.map((d) => String(row[d] ?? '—')).join(' / ')
    const key = breakdown ? `${baseKey} · ${String(row[breakdown] ?? '—')}` : baseKey
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(row)
  }

  let data = Array.from(groups.entries()).map(([label, items]) => {
    const values = metricField ? items.map((row) => Number(row[metricField] || 0)) : []
    let value = 0

    if (metric === 'count') value = items.length
    if (metric === 'sum') value = values.reduce((a, b) => a + b, 0)
    if (metric === 'avg') value = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
    if (metric === 'max') value = values.length ? Math.max(...values) : 0
    if (metric === 'min') value = values.length ? Math.min(...values) : 0

    return { label, value: Number(value.toFixed(2)) }
  })

  data.sort((a, b) => sort === 'asc' ? a.value - b.value : b.value - a.value)

  const limit = Number(topN || 0)
  if (!Number.isNaN(limit) && limit > 0) {
    data = data.slice(0, limit)
  }

  return {
    rows: filtered,
    chartData: data
  }
}
