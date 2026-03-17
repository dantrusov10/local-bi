import { useEffect, useState } from 'react'
import { loadState, saveState } from '../core/persistence.js'
import { defaultWorkspaceState, makeDefaultDashboard } from '../core/defaults.js'

export function usePersistentWorkspace() {
  const [state, setState] = useState(defaultWorkspaceState)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    ;(async () => {
      const persisted = await loadState('workspace')
      if (persisted) {
        const dashboards = persisted.dashboards?.length ? persisted.dashboards : [makeDefaultDashboard()]
        setState({
          ...defaultWorkspaceState,
          ...persisted,
          dashboards,
          currentDashboardId: persisted.currentDashboardId || dashboards[0]?.id || ''
        })
      } else {
        const dashboards = [makeDefaultDashboard()]
        setState((prev) => ({ ...prev, dashboards, currentDashboardId: dashboards[0].id }))
      }
      setLoaded(true)
    })()
  }, [])

  useEffect(() => {
    if (!loaded) return
    saveState('workspace', state)
  }, [state, loaded])

  return { state, setState, loaded }
}
