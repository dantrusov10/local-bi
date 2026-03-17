import React, { useMemo, useState, useEffect } from 'react'

const PAGE_SIZE = 50

export default function TablePreview({ table }) {
  const [page, setPage] = useState(1)

  useEffect(() => { setPage(1) }, [table?.id])

  const totalPages = useMemo(() => {
    const total = table?.rows?.length || 0
    return Math.max(1, Math.ceil(total / PAGE_SIZE))
  }, [table])

  const visibleRows = useMemo(() => {
    if (!table) return []
    const start = (page - 1) * PAGE_SIZE
    return table.rows.slice(start, start + PAGE_SIZE)
  }, [table, page])

  if (!table) {
    return <div className="panel glass"><div className="empty-state">Выбери таблицу для preview.</div></div>
  }

  return (
    <div className="panel glass">
      <div className="panel-header">
        <h3>Предпросмотр · {table.tableName}</h3>
        <span className="small-muted">{table.rows.length} строк</span>
      </div>

      <div className="button-row">
        <button className="secondary-btn" onClick={() => setPage((p) => Math.max(1, p - 1))}>← Назад</button>
        <span className="small-muted">Страница {page} из {totalPages}</span>
        <button className="secondary-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Вперед →</button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {table.columns.map((column) => <th key={column}>{column}</th>)}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, idx) => (
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
