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
  dimensions: [],
  metric: 'count',
  metricField: '',
  secondMetric: '',
  secondMetricField: '',
  breakdown: '',
  filters: [],
  chartMode: 'bar',
  sort: 'desc',
  topN: ''
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
      if (leftTable && rightTable) out[relation.id] = validateRelation(leftTable, rightTable, relation)
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
      filters: view.filters || [],
      chartMode: view.chartMode || 'bar'
    })
    setSection('Конструктор графиков')
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
              Теперь интерфейс на русском и с явным BI-конструктором: выбираешь таблицы,
              строишь связи, задаешь поля для группировки, метрики и внутренние фильтры.
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
            <div className="dashboard-grid">
              <ChartCard title="График по текущей конфигурации" data={explore.chartData} mode={config.chartMode} />
              <ChartCard title="Состояние датасетов" data={[
                { label: 'Файлы', value: files.length || 1 },
                { label: 'Таблицы', value: visibleTables.length || 1 },
                { label: 'Строки', value: totalRows || 1 }
              ]} mode="line" />
              <ChartCard title="Качество модели" data={[
                { label: 'Связи', value: relations.length || 1 },
                { label: 'Виды', value: savedViews.length || 1 }
              ]} mode="donut" />
            </div>

            <div className="dashboard-grid">
              <div className="panel glass">
                <div className="panel-header">
                  <h3>Как пользоваться инструментом</h3>
                </div>
                <div className="steps-list">
                  <div>1. Зайди в раздел <strong>Данные</strong> и загрузи 1 или несколько файлов.</div>
                  <div>2. В разделе <strong>Модель</strong> выбери, по каким колонкам объединять таблицы.</div>
                  <div>3. В разделе <strong>Конструктор графиков</strong> выбери измерения, метрики и фильтры.</div>
                  <div>4. Сохрани готовый вид в разделе <strong>Сохраненные виды</strong>.</div>
                </div>
              </div>

              <TablePreview table={selectedTable} />
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
          <ModelPanel
            tables={visibleTables}
            relations={relations}
            setRelations={setRelations}
            suggestions={suggestions}
            validationMap={validationMap}
          />
        )}

        {section === 'Конструктор графиков' && (
          <ExplorePanel
            modelRows={explore.rows}
            modelColumns={model.columns}
            chartData={explore.chartData}
            secondaryData={explore.secondaryData}
            config={config}
            setConfig={setConfig}
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
              <div className="setting-row"><span>Hardening</span><strong>готова база под Web Workers</strong></div>
            </div>
          </div>
        )}

        {busy && <div className="floating-loader">Файлы обрабатываются локально...</div>}
      </main>
    </div>
  )
}
