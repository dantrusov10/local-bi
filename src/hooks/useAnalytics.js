import { useEffect, useMemo, useState } from 'react'
import { runAnalytics } from '../core/analyticsRunner.js'

export function useAnalytics(securedRows, config, semanticMetrics, globalFilters) {
  const [explore, setExplore] = useState({ rows: securedRows, chartData: [], secondaryData: [], pivotData: [] })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const result = await runAnalytics(securedRows, config, semanticMetrics, globalFilters)
      if (!cancelled) setExplore(result)
    })()
    return () => { cancelled = true }
  }, [securedRows, config, semanticMetrics, globalFilters])

  return explore
}
