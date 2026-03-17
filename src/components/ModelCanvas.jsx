import React from 'react'

export default function ModelCanvas({ tables = [], relations = [] }) {
  if (!tables.length) {
    return <div className="empty-state">Нет таблиц для визуальной схемы</div>
  }

  return (
    <div className="panel glass">
      <div className="panel-header">
        <h3>Визуальная схема модели</h3>
        <span className="small-muted">{tables.length} таблиц · {relations.length} связей</span>
      </div>

      <div className="model-canvas">
        <div className="model-canvas-grid">
          {tables.map((table) => (
            <div key={table.id} className="model-card">
              <div className="model-card-title">{table.tableName}</div>
              <div className="model-card-meta">{table.rows.length} строк · {table.columns.length} колонок</div>
              <div className="model-fields">
                {table.columns.slice(0, 8).map((column) => (
                  <div key={column} className="model-field">{column}</div>
                ))}
                {table.columns.length > 8 && <div className="small-muted">+ еще {table.columns.length - 8}</div>}
              </div>
            </div>
          ))}
        </div>

        {!!relations.length && (
          <div className="model-relations">
            {relations.map((relation) => (
              <div key={relation.id} className="model-relation-line">
                <span>{relation.leftTableName}.{relation.leftColumn}</span>
                <strong>→</strong>
                <span>{relation.rightTableName}.{relation.rightColumn}</span>
                <em>{relation.joinType.toUpperCase()}</em>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
