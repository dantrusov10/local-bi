import { computeMetric, aggregateMetric } from '../src/core/metrics.js'
import { applyRLS } from '../src/core/permissions.js'
import { computeExploreData } from '../src/core/exploreShared.js'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const rows = [
  { region: 'Москва', owner: 'Иванов', team: 'Север', amount: 100, revenue: 100, cost: 40, date: '2026-01-01' },
  { region: 'Москва', owner: 'Петров', team: 'Юг', amount: 200, revenue: 200, cost: 80, date: '2026-02-01' },
  { region: 'СПб', owner: 'Иванов', team: 'Север', amount: 50, revenue: 50, cost: 10, date: '2026-03-01' }
]

assert(computeMetric(rows[0], 'revenue - cost') === 60, 'Формула revenue - cost должна быть 60')
assert(aggregateMetric(rows, { aggregation: 'sum', field: 'amount' }) === 350, 'SUM(amount) должен быть 350')
assert(applyRLS(rows, { role: 'manager', userName: 'Иванов' }).length === 2, 'Manager должен видеть 2 строки')
assert(applyRLS(rows, { role: 'viewer' }).length === 0, 'Viewer без userName не должен видеть строки')

const explore = computeExploreData(rows, {
  dimensions: ['region'],
  metric: 'sum',
  metricField: 'amount',
  compareMode: 'none'
}, [], [])

const moscow = explore.chartData.find((x) => x.label === 'Москва')
assert(moscow && moscow.value === 300, 'Москва должна иметь сумму 300')

console.log('SMOKE CHECK PASSED')
