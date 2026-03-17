import { uid } from './utils.js'
import { computeExploreData } from './exploreShared.js'

let worker = null
const listeners = new Map()

function getWorker() {
  if (typeof window === 'undefined') return null
  if (!worker) {
    worker = new Worker(new URL('../workers/analyticsWorker.js', import.meta.url), { type: 'module' })
    worker.onmessage = (event) => {
      const { id, ok, result, error } = event.data
      const pending = listeners.get(id)
      if (!pending) return
      listeners.delete(id)
      if (ok) pending.resolve(result)
      else pending.reject(new Error(error || 'Ошибка analytics worker'))
    }
  }
  return worker
}

export async function runAnalytics(rows, config, semanticMetrics = [], globalFilters = []) {
  try {
    const w = getWorker()
    if (!w) return computeExploreData(rows, config, semanticMetrics, globalFilters)
    const id = uid('analytics')
    return await new Promise((resolve, reject) => {
      listeners.set(id, { resolve, reject })
      w.postMessage({ id, rows, config, semanticMetrics, globalFilters })
    })
  } catch {
    return computeExploreData(rows, config, semanticMetrics, globalFilters)
  }
}
