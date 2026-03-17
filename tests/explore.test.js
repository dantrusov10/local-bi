import { describe, expect, it } from 'vitest'
import { computeExploreData } from '../src/core/exploreShared.js'

const rows = [
  { region: 'Москва', manager: 'Иванов', amount: 100, date: '2026-01-01', revenue: 100, cost: 40 },
  { region: 'Москва', manager: 'Петров', amount: 200, date: '2026-02-01', revenue: 200, cost: 80 },
  { region: 'СПб', manager: 'Иванов', amount: 50, date: '2026-03-01', revenue: 50, cost: 10 }
]

describe('explore', () => {
  it('делает sum по измерению', () => {
    const result = computeExploreData(rows, { dimensions: ['region'], metric: 'sum', metricField: 'amount' })
    const moscow = result.chartData.find((x) => x.label === 'Москва')
    expect(moscow.value).toBe(300)
  })

  it('поддерживает semantic metric', () => {
    const result = computeExploreData(
      rows,
      { dimensions: ['region'], metric: 'semantic:m1' },
      [{ id: 'm1', name: 'Маржа', aggregation: 'sum', formula: 'revenue - cost' }]
    )
    const moscow = result.chartData.find((x) => x.label === 'Москва')
    expect(moscow.value).toBe(180)
  })

  it('строит pivot', () => {
    const result = computeExploreData(rows, {
      dimensions: ['region'],
      metric: 'count',
      pivotRows: ['region'],
      pivotColumns: ['manager']
    })
    expect(result.pivotData.length).toBeGreaterThan(0)
  })

  it('сравнивает с предыдущим периодом', () => {
    const result = computeExploreData(rows, {
      dimensions: ['region'],
      metric: 'sum',
      metricField: 'amount',
      dateField: 'date',
      compareMode: 'previous_period'
    })
    expect(result.secondaryData.length).toBe(result.chartData.length)
  })
})
