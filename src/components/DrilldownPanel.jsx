import React from 'react'

export default function DrilldownPanel({ title, rows = [], columns = [] }) {
  return (
    <div className="panel glass">
      <div className="panel-header">
        <h3>Drill-down: {title || 'детализация'}</h3>
        <span className="small-muted">{rows.length} строк</span>
      </div>

      {!rows.length ? (
        <div className="empty-state compact">Кликни по элементу графика, чтобы увидеть детализацию.</div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {columns.slice(0, 10).map((column) => <th key={column}>{column}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 30).map((row, idx) => (
                <tr key={idx}>
                  {columns.slice(0, 10).map((column) => <td key={column}>{row[column] == null ? '—' : String(row[column])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
