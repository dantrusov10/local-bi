import React from 'react'
import ChartCard from './ChartCard.jsx'
import { exportRowsToCsv, exportRowsToXlsx } from '../core/export.js'

export default function ExplorePanel({
  modelRows,
  modelColumns,
  config,
  setConfig,
  chartData
}) {
  const stringFields = modelColumns
  const numericFields = modelColumns.filter((field) =>
    modelRows.some((row) => row[field] !== null && !Number.isNaN(Number(row[field])))
  )

  return (
    <div className="stack">
      <div className="content-grid">
        <div className="panel glass">
          <div className="panel-header">
            <h3>Explore builder</h3>
            <span className="small-muted">filters · dimensions · metrics</span>
          </div>

          <div className="form-grid">
            <select className="select" value={config.dimension} onChange={(e) => setConfig((prev) => ({ ...prev, dimension: e.target.value }))}>
              <option value="">Dimension</option>
              {stringFields.map((field) => <option key={field} value={field}>{field}</option>)}
            </select>

            <select className="select" value={config.metric} onChange={(e) => setConfig((prev) => ({ ...prev, metric: e.target.value }))}>
              <option value="">Metric</option>
              <option value="count">COUNT</option>
              <option value="sum">SUM</option>
              <option value="avg">AVG</option>
              <option value="max">MAX</option>
              <option value="min">MIN</option>
            </select>

            <select className="select" value={config.metricField} onChange={(e) => setConfig((prev) => ({ ...prev, metricField: e.target.value }))}>
              <option value="">Metric field</option>
              {numericFields.map((field) => <option key={field} value={field}>{field}</option>)}
            </select>

            <select className="select" value={config.filterField} onChange={(e) => setConfig((prev) => ({ ...prev, filterField: e.target.value }))}>
              <option value="">Filter field</option>
              {stringFields.map((field) => <option key={field} value={field}>{field}</option>)}
            </select>

            <input
              className="input"
              placeholder="Filter value"
              value={config.filterValue}
              onChange={(e) => setConfig((prev) => ({ ...prev, filterValue: e.target.value }))}
            />

            <select className="select" value={config.chartMode} onChange={(e) => setConfig((prev) => ({ ...prev, chartMode: e.target.value }))}>
              <option value="bar">Bar</option>
              <option value="line">Line-style bars</option>
              <option value="donut">Donut</option>
            </select>
          </div>

          <div className="sql-box">
{`SELECT
  ${config.dimension || '-- dimension'}
, ${config.metric || '-- metric'}(${config.metricField || '*'})
FROM model
${config.filterField && config.filterValue ? `WHERE ${config.filterField} LIKE '%${config.filterValue}%'` : ''}
${config.dimension ? `GROUP BY ${config.dimension}` : ''}`}
          </div>

          <div className="button-row">
            <button className="secondary-btn" onClick={() => exportRowsToCsv(modelRows, 'model-export.csv')}>Export CSV</button>
            <button className="secondary-btn" onClick={() => exportRowsToXlsx(modelRows, 'model-export.xlsx')}>Export XLSX</button>
          </div>
        </div>

        <ChartCard title="Chart output" data={chartData} mode={config.chartMode} />
      </div>

      <div className="panel glass">
        <div className="panel-header">
          <h3>Table output</h3>
          <span className="small-muted">{modelRows.length} rows in current model</span>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {modelColumns.slice(0, 12).map((column) => <th key={column}>{column}</th>)}
              </tr>
            </thead>
            <tbody>
              {modelRows.slice(0, 18).map((row, idx) => (
                <tr key={idx}>
                  {modelColumns.slice(0, 12).map((column) => <td key={column}>{row[column] == null ? '—' : String(row[column])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
