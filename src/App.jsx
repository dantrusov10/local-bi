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
  dimension: '',
  metric: 'count',
  metricField: '',
  filterField: '',
  filterValue: '',
  chartMode: 'bar'
}

export default function App() {
  const [section, setSection] = useState('Dashboard')
  const [files, setFiles] = useState([])
  const [tables, setTables] = useState([])
  const [sheetSelection, setSheetSelection] = useState({})
  const [selectedTableId, setSelectedTableId] = useState(null)
  const [relations, setRelations] = useState([])
  const [config, setConfig] = useState(defaultConfig)
  const [savedViews, setSavedViews] = useState([])
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
        setConfig(persisted.config || defaultConfig)
        setSavedViews(persisted.savedViews || [])
        setSelectedTableId(persisted.selectedTableId || null)
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
      selectedTableId
    })
  }, [files, tables, sheetSelection, relations, config, savedViews, selectedTableId])

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
      if (leftTable && rightTable) {
        out[relation.id] = validateRelation(leftTable, rightTable, relation)
      }
    }
    return out
  }, [relations, visibleTables])

  const model = useMemo(() => buildModelRows(visibleTables, relations), [visibleTables, relations])
  const explore = useMemo(() => buildExploreData(model.rows, config), [model.rows, config])

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
      for (const file of nextFiles) {
        nextSelection[file.id] = file.sheetNames
      }

      setFiles((prev) => [...prev, ...nextFiles])
      setTables((prev) => [...prev, ...nextTables])
      setSheetSelection((prev) => ({ ...prev, ...nextSelection }))
      setSelectedTableId((current) => current || nextTables[0]?.id || null)
      setSection('Data')
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
    const name = `View ${savedViews.length + 1}`
    setSavedViews((prev) => [...prev, { id: uid('view'), name, ...config }])
    setSection('Saved Views')
  }

  function loadView(view) {
    setConfig({
      dimension: view.dimension || '',
      metric: view.metric || 'count',
      metricField: view.metricField || '',
      filterField: view.filterField || '',
      filterValue: view.filterValue || '',
      chartMode: view.chartMode || 'bar'
    })
    setSection('Explore')
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
            <h2>Upload, model, explore and save views — without server</h2>
            <p>
              Новый интерфейс собран в стиле твоих референсов: темный SaaS dashboard,
              карточки, glow-акценты, визуальный BI-поток и локальное хранение через IndexedDB.
            </p>
          </div>

          <KpiCard label="Datasets" value={files.length} hint="CSV / XLSX / XLS" />
          <KpiCard label="Tables" value={visibleTables.length} hint="листов и таблиц в модели" />
          <KpiCard label="Rows" value={totalRows} hint="строк в локальной аналитике" />
          <KpiCard label="Relations" value={relations.length} hint="confirmed joins" />
        </section>

        {section === 'Dashboard' && (
          <div className="stack">
            <div className="dashboard-grid">
              <ChartCard title="Explore output" data={explore.chartData} mode={config.chartMode} />
              <ChartCard title="Dataset health" data={[
                { label: 'Files', value: files.length || 1 },
                { label: 'Tables', value: visibleTables.length || 1 },
                { label: 'Rows', value: totalRows || 1 }
              ]} mode="line" />
              <ChartCard title="Model quality" data={[
                { label: 'Relations', value: relations.length || 1 },
                { label: 'Saved', value: savedViews.length || 1 }
              ]} mode="donut" />
            </div>

            <div className="content-grid">
              <TablePreview table={selectedTable} />
              <ProfilePanel table={selectedTable} />
            </div>
          </div>
        )}

        {section === 'Data' && (
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

        {section === 'Model' && (
          <ModelPanel
            tables={visibleTables}
            relations={relations}
            setRelations={setRelations}
            suggestions={suggestions}
            validationMap={validationMap}
          />
        )}

        {section === 'Explore' && (
          <ExplorePanel
            modelRows={explore.rows}
            modelColumns={model.columns}
            chartData={explore.chartData}
            config={config}
            setConfig={setConfig}
          />
        )}

        {section === 'Saved Views' && (
          <SavedViewsPanel
            savedViews={savedViews}
            currentConfig={config}
            onSaveView={saveView}
            onLoadView={loadView}
          />
        )}

        {section === 'Settings' && (
          <div className="panel glass">
            <div className="panel-header">
              <h3>Workspace settings</h3>
            </div>
            <div className="settings-list">
              <div className="setting-row"><span>Persistence</span><strong>IndexedDB</strong></div>
              <div className="setting-row"><span>Error handling</span><strong>UI banner + try/catch</strong></div>
              <div className="setting-row"><span>Exports</span><strong>CSV / XLSX</strong></div>
              <div className="setting-row"><span>Hardening</span><strong>готова база под Web Workers</strong></div>
            </div>
          </div>
        )}

        {busy && <div className="floating-loader">Parsing files locally...</div>}
      </main>
    </div>
  )
}
