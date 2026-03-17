import { describe, expect, it } from 'vitest'
import { computeMetric, aggregateMetric } from '../src/core/metrics.js'

describe('metrics', () => {
  it('считает безопасную формулу', () => {
    expect(computeMetric({ revenue: 100, cost: 40 }, 'revenue - cost')).toBe(60)
  })

  it('поддерживает скобки и деление', () => {
    expect(computeMetric({ a: 10, b: 20, c: 5 }, '(a + b) / c')).toBe(6)
  })

  it('агрегирует formula metric', () => {
    const rows = [{ revenue: 100, cost: 50 }, { revenue: 80, cost: 20 }]
    const metric = { aggregation: 'sum', formula: 'revenue - cost' }
    expect(aggregateMetric(rows, metric)).toBe(110)
  })

  it('агрегирует avg по полю', () => {
    const rows = [{ amount: 10 }, { amount: 20 }, { amount: 30 }]
    const metric = { aggregation: 'avg', field: 'amount' }
    expect(aggregateMetric(rows, metric)).toBe(20)
  })
})
