import { applyFilters } from './filtering.js'

function calcMetric(items, metric, metricField) {
  const values = metricField ? items.map((row) => Number(row[metricField] || 0)) : []
  if (metric === 'count') return items.length
  if (metric === 'sum') return values.reduce((a, b) => a + b, 0)
  if (metric === 'avg') return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
  if (metric === 'max') return values.length ? Math.max(...values) : 0
  if (metric === 'min') return values.length ? Math.min(...values) : 0
  return 0
}

export function buildExploreData(rows, config) {
  const {
    dimensions = [],
    breakdown = '',
    metric,
    metricField,
    secondMetric = '',
    secondMetricField = '',
    filters = [],
    sort = 'desc',
    topN = ''
  } = config

  const filtered = applyFilters([...rows], filters)
  if (!dimensions.length || !metric) return { rows: filtered, chartData: [], secondaryData: [] }

  const groups = new Map()
  for (const row of filtered) {
    const baseKey = dimensions.map((d) => String(row[d] ?? '—')).join(' / ')
    const key = breakdown ? `${baseKey} · ${String(row[breakdown] ?? '—')}` : baseKey
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(row)
  }

  let data = Array.from(groups.entries()).map(([label, items]) => ({
    label,
    value: Number(calcMetric(items, metric, metricField).toFixed(2)),
    value2: secondMetric ? Number(calcMetric(items, secondMetric, secondMetricField).toFixed(2)) : null
  }))

  data.sort((a, b) => sort === 'asc' ? a.value - b.value : b.value - a.value)

  const limit = Number(topN || 0)
  if (!Number.isNaN(limit) && limit > 0) data = data.slice(0, limit)

  return {
    rows: filtered,
    chartData: data,
    secondaryData: data
      .filter((x) => x.value2 !== null && x.value2 !== undefined)
      .map((x) => ({ label: x.label, value: x.value2 }))
  }
}
