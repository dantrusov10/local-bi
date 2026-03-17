import { uid } from '../core/utils.js'
import { makeDefaultDashboard } from '../core/defaults.js'

export function useDashboards(state, setState) {
  const activeDashboard = state.dashboards.find((d) => d.id === state.currentDashboardId) || state.dashboards[0] || null

  function setCurrentDashboardId(id) {
    setState((prev) => ({ ...prev, currentDashboardId: id }))
  }

  function createDashboard(name) {
    const db = { id: uid('dashboard'), name, widgets: [] }
    setState((prev) => ({ ...prev, dashboards: [...prev.dashboards, db], currentDashboardId: db.id }))
  }

  function deleteDashboard(id) {
    setState((prev) => {
      const next = prev.dashboards.filter((d) => d.id !== id)
      if (!next.length) {
        const db = makeDefaultDashboard()
        return { ...prev, dashboards: [db], currentDashboardId: db.id }
      }
      return {
        ...prev,
        dashboards: next,
        currentDashboardId: prev.currentDashboardId === id ? next[0].id : prev.currentDashboardId
      }
    })
  }

  function saveView(config, setSection) {
    const name = `Вид ${state.savedViews.length + 1}`
    setState((prev) => ({ ...prev, savedViews: [...prev.savedViews, { id: uid('view'), name, ...config }] }))
    setSection('Сохраненные виды')
  }

  function addCurrentWidget(config, explore, setSection) {
    if (!activeDashboard) return
    const widget = {
      id: uid('widget'),
      title: `Виджет ${(activeDashboard.widgets || []).length + 1}`,
      chartMode: config.chartMode,
      dimensions: config.dimensions || [],
      chartData: explore.chartData,
      secondaryData: explore.secondaryData,
      size: 'normal'
    }
    setState((prev) => ({
      ...prev,
      dashboards: prev.dashboards.map((d) => d.id === activeDashboard.id ? { ...d, widgets: [...(d.widgets || []), widget] } : d)
    }))
    setSection('Дашборд')
  }

  function moveWidget(id, dir) {
    if (!activeDashboard) return
    setState((prev) => ({
      ...prev,
      dashboards: prev.dashboards.map((d) => {
        if (d.id !== activeDashboard.id) return d
        const widgets = [...(d.widgets || [])]
        const idx = widgets.findIndex((x) => x.id === id)
        if (idx === -1) return d
        const swap = dir === 'up' ? idx - 1 : idx + 1
        if (swap < 0 || swap >= widgets.length) return d
        ;[widgets[idx], widgets[swap]] = [widgets[swap], widgets[idx]]
        return { ...d, widgets }
      })
    }))
  }

  function removeWidget(id) {
    if (!activeDashboard) return
    setState((prev) => ({
      ...prev,
      dashboards: prev.dashboards.map((d) => d.id === activeDashboard.id ? { ...d, widgets: (d.widgets || []).filter((x) => x.id !== id) } : d)
    }))
  }

  function resizeWidget(id, size) {
    if (!activeDashboard) return
    setState((prev) => ({
      ...prev,
      dashboards: prev.dashboards.map((d) => d.id === activeDashboard.id ? {
        ...d,
        widgets: (d.widgets || []).map((x) => x.id === id ? { ...x, size } : x)
      } : d)
    }))
  }

  function renameWidget(id, title) {
    if (!activeDashboard) return
    setState((prev) => ({
      ...prev,
      dashboards: prev.dashboards.map((d) => d.id === activeDashboard.id ? {
        ...d,
        widgets: (d.widgets || []).map((x) => x.id === id ? { ...x, title } : x)
      } : d)
    }))
  }

  function dragWidget(sourceId, targetId) {
    if (!activeDashboard) return
    setState((prev) => ({
      ...prev,
      dashboards: prev.dashboards.map((d) => {
        if (d.id !== activeDashboard.id) return d
        const w = [...(d.widgets || [])]
        const s = w.findIndex((x) => x.id === sourceId)
        const t = w.findIndex((x) => x.id === targetId)
        if (s === -1 || t === -1) return d
        const item = w.splice(s, 1)[0]
        w.splice(t, 0, item)
        return { ...d, widgets: w }
      })
    }))
  }

  return {
    activeDashboard,
    setCurrentDashboardId,
    createDashboard,
    deleteDashboard,
    saveView,
    addCurrentWidget,
    moveWidget,
    removeWidget,
    resizeWidget,
    renameWidget,
    dragWidget
  }
}
