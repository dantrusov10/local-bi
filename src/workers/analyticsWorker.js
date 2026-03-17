import { computeExploreData } from '../core/exploreShared.js'

self.onmessage = (event) => {
  const { id, rows, config, semanticMetrics, globalFilters } = event.data
  try {
    const result = computeExploreData(rows, config, semanticMetrics, globalFilters)
    self.postMessage({ id, ok: true, result })
  } catch (e) {
    self.postMessage({ id, ok: false, error: e.message || 'Ошибка analytics worker' })
  }
}
