import React from 'react'
import ChartCard from './ChartCard.jsx'
import { exportRowsToCsv, exportRowsToXlsx } from '../core/export.js'
import { operatorLabels } from '../core/filtering.js'

const operators = Object.keys(operatorLabels)

function newRule() {
  return { id: `rule_${Math.random().toString(36).slice(2, 8)}`, field: '', operator: 'contains', value: '' }
}

export default function ExplorePanel({
  modelRows,
  modelColumns,
  config,
  setConfig,
  chartData
}) {
  const numericFields = modelColumns.filter((field) =>
    modelRows.some((row) => row[field] !== null && !Number.isNaN(Number(row[field])))
  )

  const dimensions = config.dimensions || []
  const filters = config.filters || []

  function toggleDimension(field) {
    const exists = dimensions.includes(field)
    setConfig((prev) => ({
      ...prev,
      dimensions: exists ? prev.dimensions.filter((x) => x !== field) : [...prev.dimensions, field]
    }))
  }

  function addFilter() {
    setConfig((prev) => ({ ...prev, filters: [...(prev.filters || []), newRule()] }))
  }

  function updateFilter(id, patch) {
    setConfig((prev) => ({
      ...prev,
      filters: (prev.filters || []).map((rule) => rule.id === id ? { ...rule, ...patch } : rule)
    }))
  }

  function removeFilter(id) {
    setConfig((prev) => ({
      ...prev,
      filters: (prev.filters || []).filter((rule) => rule.id !== id)
    }))
  }

  return (
    <div className="stack">
      <div className="content-grid">
        <div className="panel glass">
          <div className="panel-header">
            <h3>Конструктор графиков и таблиц</h3>
            <span className="small-muted">по логике Metabase / BI builder</span>
          </div>

          <div className="builder-block">
            <div className="builder-title">1. Измерения (X / группировки)</div>
            <div className="chip-grid">
              {modelColumns.map((field) => (
                <button
                  key={field}
                  className={`select-chip ${dimensions.includes(field) ? 'active' : ''}`}
                  onClick={() => toggleDimension(field)}
                >
                  {field}
                </button>
              ))}
            </div>
          </div>

          <div className="form-grid">
            <select className="select" value={config.metric} onChange={(e) => setConfig((prev) => ({ ...prev, metric: e.target.value }))}>
              <option value="">Метрика</option>
              <option value="count">COUNT</option>
              <option value="sum">SUM</option>
              <option value="avg">AVG</option>
              <option value="max">MAX</option>
              <option value="min">MIN</option>
            </select>

            <select className="select" value={config.metricField} onChange={(e) => setConfig((prev) => ({ ...prev, metricField: e.target.value }))}>
              <option value="">Поле метрики</option>
              {numericFields.map((field) => <option key={field} value={field}>{field}</option>)}
            </select>

            <select className="select" value={config.chartMode} onChange={(e) => setConfig((prev) => ({ ...prev, chartMode: e.target.value }))}>
              <option value="bar">Столбцы</option>
              <option value="line">Линейный стиль</option>
              <option value="donut">Донат</option>
            </select>
          </div>

          <div className="builder-block">
            <div className="builder-title">2. Фильтры</div>
            <div className="stack">
              {filters.map((rule) => (
                <div key={rule.id} className="filter-row">
                  <select className="select" value={rule.field} onChange={(e) => updateFilter(rule.id, { field: e.target.value })}>
                    <option value="">Поле</option>
                    {modelColumns.map((field) => <option key={field} value={field}>{field}</option>)}
                  </select>
                  <select className="select" value={rule.operator} onChange={(e) => updateFilter(rule.id, { operator: e.target.value })}>
                    {operators.map((op) => <option key={op} value={op}>{operatorLabels[op]}</option>)}
                  </select>
                  <input className="input" value={rule.value} placeholder="Значение" onChange={(e) => updateFilter(rule.id, { value: e.target.value })} />
                  <button className="secondary-btn" onClick={() => removeFilter(rule.id)}>Удалить</button>
                </div>
              ))}
              <div>
                <button className="secondary-btn" onClick={addFilter}>Добавить фильтр</button>
              </div>
            </div>
          </div>

          <div className="sql-box">
{`Модель: объединенные таблицы
Измерения: ${dimensions.length ? dimensions.join(', ') : 'не выбраны'}
Метрика: ${config.metric || 'не выбрана'}(${config.metricField || '*'})
Фильтры:
${filters.length ? filters.map((f) => `- ${f.field || 'поле'} ${operatorLabels[f.operator] || f.operator} ${f.value || ''}`).join('\n') : '- нет фильтров'}
`}
          </div>

          <div className="button-row">
            <button className="secondary-btn" onClick={() => exportRowsToCsv(modelRows, 'model-export.csv')}>Экспорт CSV</button>
            <button className="secondary-btn" onClick={() => exportRowsToXlsx(modelRows, 'model-export.xlsx')}>Экспорт XLSX</button>
          </div>
        </div>

        <ChartCard title="График" data={chartData} mode={config.chartMode} />
      </div>

      <div className="panel glass">
        <div className="panel-header">
          <h3>Табличный вывод</h3>
          <span className="small-muted">{modelRows.length} строк в текущей модели</span>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {modelColumns.slice(0, 10).map((column) => <th key={column}>{column}</th>)}
              </tr>
            </thead>
            <tbody>
              {modelRows.slice(0, 18).map((row, idx) => (
                <tr key={idx}>
                  {modelColumns.slice(0, 10).map((column) => <td key={column}>{row[column] == null ? '—' : String(row[column])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
