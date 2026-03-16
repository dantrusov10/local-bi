import React from 'react'

export default function TablePreview({ table }) {
  if (!table) {
    return <div className="panel glass"><div className="empty-state">Выбери таблицу для preview.</div></div>
  }

  return (
    <div className="panel glass">
      <div className="panel-header">
        <h3>Предпросмотр · {table.tableName}</h3>
        <span className="small-muted">{table.rows.length} строк</span>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {table.columns.map((column) => <th key={column}>{column}</th>)}
            </tr>
          </thead>
          <tbody>
            {table.rows.slice(0, 12).map((row, idx) => (
              <tr key={idx}>
                {table.columns.map((column) => <td key={column}>{row[column] == null ? '—' : String(row[column])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
