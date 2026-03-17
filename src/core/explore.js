import { applyFilters } from './filtering.js'

export function buildExploreData(rows, config, semanticMetrics = [], globalFilters = []) {
  const {
    dimensions = [],
    breakdown = '',
    metric,
    metricField,
    secondMetric,
    secondMetricField,
    sort = 'desc'
  } = config

  const filtered = applyFilters([...rows], [...(globalFilters||[]), ...(config.filters||[])])

  if(!dimensions.length) return {rows: filtered, chartData:[], secondaryData:[]}

  const groups = {}

  filtered.forEach(r=>{
    const key = dimensions.map(d=>r[d] ?? "—").join(" / ")
    if(!groups[key]) groups[key] = {}
    const b = breakdown ? r[breakdown] ?? "—" : "all"
    if(!groups[key][b]) groups[key][b] = []
    groups[key][b].push(r)
  })

  const chartData = []
  const secondaryData = []

  Object.entries(groups).forEach(([label, series])=>{
    let total = 0
    Object.values(series).forEach(items=>{
      total += items.length
    })
    chartData.push({label, value: total})
  })

  chartData.sort((a,b)=> sort==="asc"?a.value-b.value:b.value-a.value)

  return {rows: filtered, chartData, secondaryData}
}
