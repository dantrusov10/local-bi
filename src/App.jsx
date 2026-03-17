import React, { useState } from 'react'
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
import GlobalFiltersBar from './components/GlobalFiltersBar.jsx'
import SemanticMetricsPanel from './components/SemanticMetricsPanel.jsx'
import DrilldownPanel from './components/DrilldownPanel.jsx'
import DataDiagnosticsPanel from './components/DataDiagnosticsPanel.jsx'
import SettingsEnterprisePanel from './components/SettingsEnterprisePanel.jsx'
import { usePersistentWorkspace } from './hooks/usePersistentWorkspace.js'
import { useDataWorkspace } from './hooks/useDataWorkspace.js'
import { useModeling } from './hooks/useModeling.js'
import { useAnalytics } from './hooks/useAnalytics.js'
import { useDashboards } from './hooks/useDashboards.js'
import { useSecurityTheme } from './hooks/useSecurityTheme.js'
import { defaultConfig } from './core/defaults.js'

export default function App() {
  const { state, setState, loaded } = usePersistentWorkspace()
  const [section, setSection] = useState('Дашборд')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [drilldown, setDrilldown] = useState({ label: '', rows: [] })

  const { visibleTables, selectedTable, handleFilesSelected, onToggleSheet } = useDataWorkspace(state, setState)
  const { suggestions, validationMap, model, securedRows } = useModeling(visibleTables, state.relations, state.security)
  const explore = useAnalytics(securedRows, state.config, state.semanticMetrics, state.globalFilters)
  const dashboards = useDashboards(state, setState)
  const securityTheme = useSecurityTheme(state.theme, state.security)

  if (!loaded) {
    return <div className="app-shell"><main className="main-shell"><div className="panel glass">Загружаю workspace...</div></main></div>
  }

  const totalRows = visibleTables.reduce((acc, table) => acc + table.rows.length, 0)

  function updateConfig(patch) {
    setState((prev) => ({ ...prev, config: typeof patch === 'function' ? patch(prev.config) : { ...prev.config, ...patch } }))
  }

  function handleChartClick(label) {
    const cfg = state.config
    if (!cfg.dimensions?.length && !cfg.dateField) return
    const firstDimension = cfg.dateField || cfg.dimensions[0]
    setState((prev) => ({
      ...prev,
      globalFilters: [
        ...prev.globalFilters.filter((f) => !(f.field === firstDimension && f.id === 'cross_filter')),
        { id: 'cross_filter', field: firstDimension, operator: 'eq', value: label }
      ]
    }))
    const rows = explore.rows.filter((row) => {
      if (cfg.dateField) return String(row[cfg.dateField] ?? '').slice(0, 7) === String(label)
      return String(row[firstDimension] ?? '') === String(label)
    })
    setDrilldown({ label, rows })
  }

  function loadView(view) {
    setState((prev) => ({ ...prev, config: { ...defaultConfig, ...view } }))
    setSection('Конструктор графиков')
  }

  return (
    <div className="app-shell">
      <Sidebar section={section} setSection={setSection} />

      <main className="main-shell">
        <Topbar title={section} fileCount={state.files.length} tableCount={visibleTables.length} />
        {error && <div className="error-banner">{error}</div>}

        <section className="hero-grid">
          <div className="hero-copy glass">
            <div className="small-muted">Hardening release</div>
            <h2>Декомпозиция состояния, тесты и worker-аналитика</h2>
            <p>В этой версии ядро стабилизировано: аналитика вынесена в worker, App разнесен на хуки, критические места покрыты тестами.</p>
            <div className="button-row">
              <button className="primary-btn" onClick={() => setSection('Конструктор графиков')}>Открыть конструктор графиков</button>
              <button className="secondary-btn" onClick={() => setSection('Метрики')}>Открыть semantic layer</button>
            </div>
          </div>

          <KpiCard label="Датасеты" value={state.files.length} hint="CSV / XLSX / XLS" />
          <KpiCard label="Таблицы" value={visibleTables.length} hint="листов и таблиц в модели" />
          <KpiCard label="Строки" value={totalRows} hint="строк в локальной аналитике" />
          <KpiCard label="Связи" value={state.relations.length} hint="подтвержденные join" />
        </section>

        {section === 'Дашборд' && (
          <div className="stack">
            <DashboardManager
              dashboards={state.dashboards}
              currentDashboardId={dashboards.activeDashboard?.id}
              onCreate={dashboards.createDashboard}
              onSelect={dashboards.setCurrentDashboardId}
              onDelete={dashboards.deleteDashboard}
            />

            <GlobalFiltersBar
              fields={model.columns}
              filters={state.globalFilters}
              setFilters={(filters) => setState((prev) => ({ ...prev, globalFilters: filters }))}
            />

            <div className="dashboard-grid">
              <ChartCard title="График по текущей конфигурации" data={explore.chartData} secondaryData={explore.secondaryData} mode={state.config.chartMode} onPointClick={handleChartClick} />
              <ChartCard title="Состояние датасетов" data={[
                { label: 'Файлы', value: state.files.length || 1 },
                { label: 'Таблицы', value: visibleTables.length || 1 },
                { label: 'Строки', value: totalRows || 1 }
              ]} mode="line" />
              <ChartCard title="Качество модели" data={[
                { label: 'Связи', value: state.relations.length || 1 },
                { label: 'Виды', value: state.savedViews.length || 1 },
                { label: 'Виджеты', value: (dashboards.activeDashboard?.widgets || []).length || 1 }
              ]} mode="donut" />
            </div>

            <DashboardBoard
              widgets={dashboards.activeDashboard?.widgets || []}
              onMoveUp={(id) => dashboards.moveWidget(id, 'up')}
              onMoveDown={(id) => dashboards.moveWidget(id, 'down')}
              onRemove={dashboards.removeWidget}
              onResize={dashboards.resizeWidget}
              onRename={dashboards.renameWidget}
              onDrag={dashboards.dragWidget}
            />

            <DrilldownPanel title={drilldown.label} rows={drilldown.rows} columns={model.columns} />

            <div className="dashboard-grid">
              <JoinPreview relations={state.relations} modelRows={model.rows} modelColumns={model.columns} />
              <ProfilePanel table={selectedTable} />
            </div>
          </div>
        )}

        {section === 'Данные' && (
          <div className="stack">
            <DataPanel
              files={state.files}
              visibleTables={visibleTables}
              selectedTable={selectedTable}
              setSelectedTableId={(id) => setState((prev) => ({ ...prev, selectedTableId: id }))}
              onFilesSelected={(e) => handleFilesSelected(e, setBusy, setError, setSection)}
              onToggleSheet={onToggleSheet}
            />
            <div className="content-grid">
              <TablePreview table={selectedTable} />
              <ProfilePanel table={selectedTable} />
            </div>
            <DataDiagnosticsPanel qaLogs={state.qaLogs} />
          </div>
        )}

        {section === 'Модель' && (
          <div className="stack">
            <ModelPanel
              tables={visibleTables}
              relations={state.relations}
              setRelations={(updater) => setState((prev) => ({ ...prev, relations: typeof updater === 'function' ? updater(prev.relations) : updater }))}
              suggestions={suggestions}
              validationMap={validationMap}
            />
            <ModelCanvas tables={visibleTables} relations={state.relations} />
            <JoinPreview relations={state.relations} modelRows={model.rows} modelColumns={model.columns} />
          </div>
        )}

        {section === 'Метрики' && (
          <SemanticMetricsPanel
            fields={model.columns}
            semanticMetrics={state.semanticMetrics}
            setSemanticMetrics={(metrics) => setState((prev) => ({ ...prev, semanticMetrics: typeof metrics === 'function' ? metrics(prev.semanticMetrics) : metrics }))}
          />
        )}

        {section === 'Конструктор графиков' && (
          <div className="stack">
            <GlobalFiltersBar
              fields={model.columns}
              filters={state.globalFilters}
              setFilters={(filters) => setState((prev) => ({ ...prev, globalFilters: filters }))}
            />
            <ExplorePanel
              modelRows={explore.rows}
              modelColumns={model.columns}
              chartData={explore.chartData}
              secondaryData={explore.secondaryData}
              pivotData={explore.pivotData}
              config={state.config}
              setConfig={updateConfig}
              onAddWidget={() => dashboards.addCurrentWidget(state.config, explore, setSection)}
              semanticMetrics={state.semanticMetrics}
              onChartClick={handleChartClick}
            />
            <DrilldownPanel title={drilldown.label} rows={drilldown.rows} columns={model.columns} />
          </div>
        )}

        {section === 'Сохраненные виды' && (
          <SavedViewsPanel
            savedViews={state.savedViews}
            currentConfig={state.config}
            onSaveView={() => dashboards.saveView(state.config, setSection)}
            onLoadView={loadView}
          />
        )}

        {section === 'Настройки' && (
          <SettingsEnterprisePanel
            security={state.security}
            setSecurity={(updater) => setState((prev) => ({ ...prev, security: typeof updater === 'function' ? updater(prev.security) : updater }))}
            theme={state.theme}
            setTheme={(updater) => setState((prev) => ({ ...prev, theme: typeof updater === 'function' ? updater(prev.theme) : updater }))}
            modelRows={securedRows}
            drilldownRows={drilldown.rows}
            onSendWebhook={securityTheme.handleSendWebhook}
            onWriteBack={securityTheme.handleWriteBack}
          />
        )}

        {busy && <div className="floating-loader">Файлы обрабатываются локально...</div>}
      </main>
    </div>
  )
}
