import React from 'react'

export default function PivotTable({ data = [], rows = [], columns = [], valueLabel = 'Значение' }) {
  if (!data.length) {
    return <div className="empty-state">Недостаточно данных для pivot-таблицы</div>
  }

  const rowKeys = Array.from(new Set(data.map((d) => d.rowKey || '—')))
  const colKeys = Array.from(new Set(data.map((d) => d.colKey || '—')))

  const matrix = {}
  for (const item of data) {
    const r = item.rowKey || '—'
    const c = item.colKey || '—'
    if (!matrix[r]) matrix[r] = {}
    matrix[r][c] = item.value
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>{rows.join(' / ') || 'Строки'}</th>
            {colKeys.map((c) => <th key={c}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rowKeys.map((r) => (
            <tr key={r}>
              <td>{r}</td>
              {colKeys.map((c) => <td key={c}>{matrix[r]?.[c] ?? '—'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
