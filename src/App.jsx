import React, { useEffect, useMemo, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import KpiCard from './components/KpiCard.jsx'
import DataPanel from './components/DataPanel.jsx'
import TablePreview from './components/TablePreview.jsx'
import ProfilePanel from './components/ProfilePanel.jsx'
import ModelPanel from './components/ModelPanel.jsx'
import ExplorePanel from './components/ExplorePanel.jsx'
import SavedViewsPanel from './components/SavedViewsPanel.jsx'
import ChartCard from './components/ChartCard.jsx'
import DashboardBoard from './components/DashboardBoard.jsx'
import DashboardManager from './components/DashboardManager.jsx'
import JoinPreview from './components/JoinPreview.jsx'
import ModelCanvas from './components/ModelCanvas.jsx'
import { parseFile } from './core/parser.js'
import { profileTable } from './core/profiling.js'
import { suggestJoins, validateRelation } from './core/matching.js'
import { buildModelRows } from './core/modeling.js'
import { buildExploreData } from './core/explore.js'
import { saveState, loadState } from './core/persistence.js'

function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

const defaultConfig = {
  dimensions: [],
  metric: 'count',
  metricField: '',
  secondMetric: '',
  secondMetricField: '',
  breakdown: '',
  filters: [],
  chartMode: 'bar',
  sort: 'desc',
  topN: '',
  pivotRows: [],
  pivotColumns: []
}

function makeDefaultDashboard() {
  return { id: uid('dashboard'), name: 'Основной дашборд', widgets: [] }
}

export default function App() {
  const [section, setSection] = useState('Дашборд')
  const [files, setFiles] = useState([])
  const [tables, setTables] = useState([])
  const [sheetSelection, setSheetSelection] = useState({})
  const [selectedTableId, setSelectedTableId] = useState(null)
  const [relations, setRelations] = useState([])
  const [config, setConfig] = useState(defaultConfig)
  const [savedViews, setSavedViews] = useState([])
  const [dashboards, setDashboards] = useState([makeDefaultDashboard()])
  const [currentDashboardId, setCurrentDashboardId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      const persisted = await loadState('workspace')
      if (persisted) {
        setFiles(persisted.files || [])
        setTables(persisted.tables || [])
        setSheetSelection(persisted.sheetSelection || {})
        setRelations(persisted.relations || [])
        setConfig({ ...defaultConfig, ...(persisted.config || {}) })
        setSavedViews(persisted.savedViews || [])
        const persistedDashboards = persisted.dashboards?.length ? persisted.dashboards : [makeDefaultDashboard()]
        setDashboards(persistedDashboards)
        setCurrentDashboardId(persisted.currentDashboardId || persistedDashboards[0]?.id || '')
        setSelectedTableId(persisted.selectedTableId || null)
      } else {
        const init = makeDefaultDashboard()
        setDashboards([init])
        setCurrentDashboardId(init.id)
      }
    })()
  }, [])

  useEffect(() => {
    saveState('workspace', {
      files,
      tables,
      sheetSelection,
      relations,
      config,
      savedViews,
      dashboards,
      currentDashboardId,
      selectedTableId
    })
  }, [files, tables, sheetSelection, relations, config, savedViews, dashboards, currentDashboardId, selectedTableId])

  const visibleTables = useMemo(() => (
    tables.filter((table) => {
      const selected = sheetSelection[table.fileId]
      if (!table.sheetName || !selected?.length) return true
      return selected.includes(table.sheetName)
    })
  ), [tables, sheetSelection])

  const selectedTable = useMemo(
    () => visibleTables.find((table) => table.id === selectedTableId) || visibleTables[0] || null,
    [visibleTables, selectedTableId]
  )

  const suggestions = useMemo(() => suggestJoins(visibleTables), [visibleTables])

  const validationMap = useMemo(() => {
    const out = {}
    for (const relation of relations) {
      const leftTable = visibleTables.find((t) => t.id === relation.leftTableId)
      const rightTable = visibleTables.find((t) => t.id === relation.rightTableId)
      if (leftTable && rightTable) out[relation.id] = validateRelation(leftTable, rightTable, relation)
    }
    return out
  }, [relations, visibleTables])

  const model = useMemo(() => buildModelRows(visibleTables, relations), [visibleTables, relations])
  const explore = useMemo(() => buildExploreData(model.rows, config), [model.rows, config])

  const activeDashboard = useMemo(
    () => dashboards.find((d) => d.id === currentDashboardId) || dashboards[0] || null,
    [dashboards, currentDashboardId]
  )

  async function handleFilesSelected(event) {
    const incoming = Array.from(event.target.files || [])
    if (!incoming.length) return
    setBusy(true)
    setError('')
    try {
      const nextFiles = []
      const nextTables = []

      for (const file of incoming) {
        const parsed = await parseFile(file)
        nextFiles.push(parsed.fileAsset)
        nextTables.push(...parsed.tables.map(profileTable))
      }

      const nextSelection = {}
      for (const file of nextFiles) nextSelection[file.id] = file.sheetNames

      setFiles((prev) => [...prev, ...nextFiles])
      setTables((prev) => [...prev, ...nextTables])
      setSheetSelection((prev) => ({ ...prev, ...nextSelection }))
      setSelectedTableId((current) => current || nextTables[0]?.id || null)
      setSection('Данные')
    } catch (err) {
      setError(err.message || 'Не удалось обработать файлы')
    } finally {
      setBusy(false)
    }
  }

  function onToggleSheet(fileId, sheetName) {
    setSheetSelection((prev) => {
      const current = prev[fileId] || []
      const next = current.includes(sheetName)
        ? current.filter((item) => item !== sheetName)
        : [...current, sheetName]
      return { ...prev, [fileId]: next }
    })
  }

  function saveView() {
    const name = `Вид ${savedViews.length + 1}`
    setSavedViews((prev) => [...prev, { id: uid('view'), name, ...config }])
    setSection('Сохраненные виды')
  }

  function loadView(view) {
    setConfig({
      dimensions: view.dimensions || [],
      metric: view.metric || 'count',
      metricField: view.metricField || '',
      secondMetric: view.secondMetric || '',
      secondMetricField: view.secondMetricField || '',
      breakdown: view.breakdown || '',
      filters: view.filters || [],
      chartMode: view.chartMode || 'bar',
      sort: view.sort || 'desc',
      topN: view.topN || '',
      pivotRows: view.pivotRows || [],
      pivotColumns: view.pivotColumns || []
    })
    setSection('Конструктор графиков')
  }

  function createDashboard(name) {
    const db = { id: uid('dashboard'), name, widgets: [] }
    setDashboards((prev) => [...prev, db])
    setCurrentDashboardId(db.id)
  }

  function deleteDashboard(id) {
    setDashboards((prev) => {
      const next = prev.filter((d) => d.id !== id)
      if (!next.length) {
        const db = makeDefaultDashboard()
        setCurrentDashboardId(db.id)
        return [db]
      }
      if (currentDashboardId === id) setCurrentDashboardId(next[0].id)
      return next
    })
  }

  function addCurrentWidget() {
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

    setDashboards((prev) => prev.map((d) => d.id === activeDashboard.id ? { ...d, widgets: [...(d.widgets || []), widget] } : d))
    setSection('Дашборд')
  }

  function moveWidget(id, dir) {
    if (!activeDashboard) return
    setDashboards((prev) => prev.map((d) => {
      if (d.id !== activeDashboard.id) return d
      const widgets = [...(d.widgets || [])]
      const idx = widgets.findIndex((x) => x.id === id)
      if (idx === -1) return d
      const swap = dir === 'up' ? idx - 1 : idx + 1
      if (swap < 0 || swap >= widgets.length) return d
      ;[widgets[idx], widgets[swap]] = [widgets[swap], widgets[idx]]
      return { ...d, widgets }
    }))
  }

  function removeWidget(id) {
    if (!activeDashboard) return
    setDashboards((prev) => prev.map((d) => d.id === activeDashboard.id ? { ...d, widgets: (d.widgets || []).filter((x) => x.id !== id) } : d))
  }

  function resizeWidget(id, size) {
    if (!activeDashboard) return
    setDashboards((prev) => prev.map((d) => d.id === activeDashboard.id ? {
      ...d,
      widgets: (d.widgets || []).map((x) => x.id === id ? { ...x, size } : x)
    } : d))
  }

  const totalRows = visibleTables.reduce((acc, table) => acc + table.rows.length, 0)

  return (
    <div className="app-shell">
      <Sidebar section={section} setSection={setSection} />

      <main className="main-shell">
        <Topbar title={section} fileCount={files.length} tableCount={visibleTables.length} />

        {error && <div className="error-banner">{error}</div>}

        <section className="hero-grid">
          <div className="hero-copy glass">
            <div className="small-muted">Dark glass BI cockpit</div>
            <h2>Загружай, объединяй, фильтруй и выводи данные в графики</h2>
            <p>
              Теперь внутри есть несколько дашбордов, сохраненные виджеты, pivot-аналитика и визуальная схема модели.
            </p>
            <div className="button-row">
              <button className="primary-btn" onClick={() => setSection('Конструктор графиков')}>Открыть конструктор графиков</button>
              <button className="secondary-btn" onClick={() => setSection('Модель')}>Открыть модель данных</button>
            </div>
          </div>

          <KpiCard label="Датасеты" value={files.length} hint="CSV / XLSX / XLS" />
          <KpiCard label="Таблицы" value={visibleTables.length} hint="листов и таблиц в модели" />
          <KpiCard label="Строки" value={totalRows} hint="строк в локальной аналитике" />
          <KpiCard label="Связи" value={relations.length} hint="подтвержденные join" />
        </section>

        {section === 'Дашборд' && (
          <div className="stack">
            <DashboardManager
              dashboards={dashboards}
              currentDashboardId={activeDashboard?.id}
              onCreate={createDashboard}
              onSelect={setCurrentDashboardId}
              onDelete={deleteDashboard}
            />

            <div className="dashboard-grid">
              <ChartCard title="График по текущей конфигурации" data={explore.chartData} secondaryData={explore.secondaryData} mode={config.chartMode} />
              <ChartCard title="Состояние датасетов" data={[
                { label: 'Файлы', value: files.length || 1 },
                { label: 'Таблицы', value: visibleTables.length || 1 },
                { label: 'Строки', value: totalRows || 1 }
              ]} mode="line" />
              <ChartCard title="Качество модели" data={[
                { label: 'Связи', value: relations.length || 1 },
                { label: 'Виды', value: savedViews.length || 1 },
                { label: 'Виджеты', value: (activeDashboard?.widgets || []).length || 1 }
              ]} mode="donut" />
            </div>

            <DashboardBoard
              widgets={activeDashboard?.widgets || []}
              onMoveUp={(id) => moveWidget(id, 'up')}
              onMoveDown={(id) => moveWidget(id, 'down')}
              onRemove={removeWidget}
              onResize={resizeWidget}
            />

            <div className="dashboard-grid">
              <JoinPreview relations={relations} modelRows={model.rows} modelColumns={model.columns} />
              <ProfilePanel table={selectedTable} />
            </div>
          </div>
        )}

        {section === 'Данные' && (
          <div className="stack">
            <DataPanel
              files={files}
              visibleTables={visibleTables}
              selectedTable={selectedTable}
              setSelectedTableId={setSelectedTableId}
              onFilesSelected={handleFilesSelected}
              onToggleSheet={onToggleSheet}
            />
            <div className="content-grid">
              <TablePreview table={selectedTable} />
              <ProfilePanel table={selectedTable} />
            </div>
          </div>
        )}

        {section === 'Модель' && (
          <div className="stack">
            <ModelPanel
              tables={visibleTables}
              relations={relations}
              setRelations={setRelations}
              suggestions={suggestions}
              validationMap={validationMap}
            />
            <ModelCanvas tables={visibleTables} relations={relations} />
            <JoinPreview relations={relations} modelRows={model.rows} modelColumns={model.columns} />
          </div>
        )}

        {section === 'Конструктор графиков' && (
          <ExplorePanel
            modelRows={explore.rows}
            modelColumns={model.columns}
            chartData={explore.chartData}
            secondaryData={explore.secondaryData}
            pivotData={explore.pivotData}
            config={config}
            setConfig={setConfig}
            onAddWidget={addCurrentWidget}
          />
        )}

        {section === 'Сохраненные виды' && (
          <SavedViewsPanel
            savedViews={savedViews}
            currentConfig={config}
            onSaveView={saveView}
            onLoadView={loadView}
          />
        )}

        {section === 'Настройки' && (
          <div className="panel glass">
            <div className="panel-header">
              <h3>Настройки workspace</h3>
            </div>
            <div className="settings-list">
              <div className="setting-row"><span>Persistence</span><strong>IndexedDB</strong></div>
              <div className="setting-row"><span>Обработка ошибок</span><strong>UI banner + try/catch</strong></div>
              <div className="setting-row"><span>Экспорт</span><strong>CSV / XLSX</strong></div>
              <div className="setting-row"><span>Dashboards</span><strong>несколько отдельных дашбордов</strong></div>
            </div>
          </div>
        )}

        {busy && <div className="floating-loader">Файлы обрабатываются локально...</div>}
      </main>
    </div>
  )
}
