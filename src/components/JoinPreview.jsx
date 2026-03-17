import React from 'react'

export default function JoinPreview({ relations = [], modelRows = [], modelColumns = [] }) {
  return (
    <div className="panel glass">
      <div className="panel-header">
        <h3>Предпросмотр объединения</h3>
        <span className="small-muted">{relations.length} связей · {modelRows.length} строк</span>
      </div>

      {!relations.length ? (
        <div className="empty-state compact">Сначала создай хотя бы одну связь в разделе «Модель».</div>
      ) : (
        <>
          <div className="join-preview-list">
            {relations.map((relation) => (
              <div key={relation.id} className="relation-card">
                <div className="relation-title">{relation.leftTableName}.{relation.leftColumn} → {relation.rightTableName}.{relation.rightColumn}</div>
                <div className="small-muted">{relation.joinType.toUpperCase()} · {relation.relationType}</div>
              </div>
            ))}
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {modelColumns.slice(0, 12).map((column) => <th key={column}>{column}</th>)}
                </tr>
              </thead>
              <tbody>
                {modelRows.slice(0, 10).map((row, idx) => (
                  <tr key={idx}>
                    {modelColumns.slice(0, 12).map((column) => <td key={column}>{row[column] == null ? '—' : String(row[column])}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
