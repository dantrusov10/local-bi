import { applyFilters } from './filtering.js'

function rawMetricValue(items, metric, metricField) {
  const values = metricField ? items.map((row) => Number(row[metricField] || 0)) : []
  if (metric === 'count') return items.length
  if (metric === 'sum') return values.reduce((a, b) => a + b, 0)
  if (metric === 'avg') return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
  if (metric === 'max') return values.length ? Math.max(...values) : 0
  if (metric === 'min') return values.length ? Math.min(...values) : 0
  return 0
}

function metricValue(items, metric, metricField, semanticMetrics = []) {
  if (metric && metric.startsWith('semantic:')) {
    const id = metric.replace('semantic:', '')
    const found = (semanticMetrics || []).find((m) => m.id === id)
    if (!found) return 0
    return rawMetricValue(items, found.aggregation, found.field)
  }
  return rawMetricValue(items, metric, metricField)
}

function getPeriodKey(raw, grain = 'month') {
  if (!raw) return '—'
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return '—'
  if (grain === 'year') return String(d.getFullYear())
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function buildExploreData(rows, config, semanticMetrics = [], globalFilters = []) {
  const {
    dimensions = [],
    breakdown = '',
    metric,
    metricField,
    secondMetric = '',
    secondMetricField = '',
    filters = [],
    sort = 'desc',
    topN = '',
    pivotRows = [],
    pivotColumns = [],
    dateField = '',
    compareMode = 'none',
    timeGrain = 'month'
  } = config

  const mergedFilters = [...(globalFilters || []), ...(filters || [])]
  const filtered = applyFilters([...rows], mergedFilters)

  const activeDimensions = dateField ? [dateField] : dimensions
  if (!activeDimensions.length || !metric) {
    return { rows: filtered, chartData: [], secondaryData: [], pivotData: [] }
  }

  const groups = new Map()
  for (const row of filtered) {
    const baseKey = dateField
      ? getPeriodKey(row[dateField], timeGrain)
      : activeDimensions.map((d) => String(row[d] ?? '—')).join(' / ')
    const key = breakdown ? `${baseKey} · ${String(row[breakdown] ?? '—')}` : baseKey
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(row)
  }

  let data = Array.from(groups.entries()).map(([label, items]) => ({
    label,
    value: Number(metricValue(items, metric, metricField, semanticMetrics).toFixed(2)),
    value2: secondMetric ? Number(metricValue(items, secondMetric, secondMetricField, semanticMetrics).toFixed(2)) : null
  }))

  data.sort((a, b) => sort === 'asc' ? a.value - b.value : b.value - a.value)

  const limit = Number(topN || 0)
  if (!Number.isNaN(limit) && limit > 0) data = data.slice(0, limit)

  let secondaryData = data
    .filter((x) => x.value2 !== null && x.value2 !== undefined)
    .map((x) => ({ label: x.label, value: x.value2 }))

  if (dateField && compareMode === 'previous_period') {
    secondaryData = data.map((x, idx) => ({ label: x.label, value: data[idx - 1]?.value ?? 0 }))
  }

  if (dateField && compareMode === 'ytd') {
    let running = 0
    secondaryData = data.map((x) => {
      running += x.value
      return { label: x.label, value: Number(running.toFixed(2)) }
    })
  }

  let pivotData = []
  if (pivotRows.length && pivotColumns.length) {
    const pivotGroups = new Map()
    for (const row of filtered) {
      const rowKey = pivotRows.map((f) => String(row[f] ?? '—')).join(' / ')
      const colKey = pivotColumns.map((f) => String(row[f] ?? '—')).join(' / ')
      const key = `${rowKey}__${colKey}`
      if (!pivotGroups.has(key)) pivotGroups.set(key, { rowKey, colKey, items: [] })
      pivotGroups.get(key).items.push(row)
    }

    pivotData = Array.from(pivotGroups.values()).map((x) => ({
      rowKey: x.rowKey,
      colKey: x.colKey,
      value: Number(metricValue(x.items, metric, metricField, semanticMetrics).toFixed(2))
    }))
  }

  return {
    rows: filtered,
    chartData: data,
    secondaryData,
    pivotData
  }
}
