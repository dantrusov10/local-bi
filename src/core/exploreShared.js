import { applyFilters } from './filtering.js'
import { aggregateMetric } from './metrics.js'

export function getMetricDefinition(metric, metricField, semanticMetrics = []) {
  if (!metric) return null
  if (metric.startsWith('semantic:')) {
    const id = metric.replace('semantic:', '')
    return semanticMetrics.find((m) => m.id === id) || null
  }
  return {
    id: `native_${metric}_${metricField || 'all'}`,
    aggregation: metric,
    field: metricField || ''
  }
}

export function getPeriodKey(raw, grain = 'month') {
  if (!raw) return '—'
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return '—'
  if (grain === 'year') return String(d.getFullYear())
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function computeExploreData(rows, config, semanticMetrics = [], globalFilters = []) {
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
  const effectiveDimensions = dateField ? [dateField] : dimensions

  if (!effectiveDimensions.length || !metric) {
    return { rows: filtered, chartData: [], secondaryData: [], pivotData: [] }
  }

  const primaryMetric = getMetricDefinition(metric, metricField, semanticMetrics)
  const secondaryMetric = secondMetric ? getMetricDefinition(secondMetric, secondMetricField, semanticMetrics) : null

  const groups = new Map()
  for (const row of filtered) {
    const baseKey = dateField
      ? getPeriodKey(row[dateField], timeGrain)
      : effectiveDimensions.map((d) => String(row[d] ?? '—')).join(' / ')
    const fullKey = breakdown ? `${baseKey} · ${String(row[breakdown] ?? '—')}` : baseKey
    if (!groups.has(fullKey)) groups.set(fullKey, [])
    groups.get(fullKey).push(row)
  }

  let chartData = Array.from(groups.entries()).map(([label, items]) => ({
    label,
    value: Number(aggregateMetric(items, primaryMetric).toFixed(2)),
    value2: secondaryMetric ? Number(aggregateMetric(items, secondaryMetric).toFixed(2)) : null
  }))

  chartData.sort((a, b) => sort === 'asc' ? a.value - b.value : b.value - a.value)
  const limit = Number(topN || 0)
  if (!Number.isNaN(limit) && limit > 0) chartData = chartData.slice(0, limit)

  let secondaryData = chartData
    .filter((item) => item.value2 !== null && item.value2 !== undefined)
    .map((item) => ({ label: item.label, value: item.value2 }))

  if (dateField && compareMode === 'previous_period') {
    secondaryData = chartData.map((item, index) => ({
      label: item.label,
      value: chartData[index - 1]?.value ?? 0
    }))
  }

  if (dateField && compareMode === 'ytd') {
    let running = 0
    secondaryData = chartData.map((item) => {
      running += item.value
      return { label: item.label, value: Number(running.toFixed(2)) }
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

    pivotData = Array.from(pivotGroups.values()).map((group) => ({
      rowKey: group.rowKey,
      colKey: group.colKey,
      value: Number(aggregateMetric(group.items, primaryMetric).toFixed(2))
    }))
  }

  return { rows: filtered, chartData, secondaryData, pivotData }
}
