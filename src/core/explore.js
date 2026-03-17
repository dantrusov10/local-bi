import { computeExploreData } from './exploreShared.js'

export function buildExploreData(rows, config, semanticMetrics = [], globalFilters = []) {
  return computeExploreData(rows, config, semanticMetrics, globalFilters)
}
