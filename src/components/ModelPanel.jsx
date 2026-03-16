import React, { useMemo, useState } from 'react'

export default function ModelPanel({ tables, relations, setRelations, suggestions, validationMap }) {
  const [leftTableId, setLeftTableId] = useState(tables[0]?.id || '')
  const [rightTableId, setRightTableId] = useState(tables[1]?.id || '')
  const [leftColumn, setLeftColumn] = useState('')
  const [rightColumn, setRightColumn] = useState('')
  const [joinType, setJoinType] = useState('left')

  const leftTable = useMemo(() => tables.find((t) => t.id === leftTableId), [tables, leftTableId])
  const rightTable = useMemo(() => tables.find((t) => t.id === rightTableId), [tables, rightTableId])

  function confirmSuggestion(suggestion) {
    setRelations((prev) => {
      const exists = prev.some((r) => r.id === suggestion.id)
      if (exists) {
        return prev.map((r) => r.id === suggestion.id ? { ...r, confirmed: true } : r)
      }
      return [...prev, { ...suggestion, confirmed: true }]
    })
  }

  function createManualJoin() {
    if (!leftTableId || !rightTableId || !leftColumn || !rightColumn) return
    setRelations((prev) => [
      ...prev,
      {
        id: `manual_${leftTableId}_${leftColumn}_${rightTableId}_${rightColumn}`,
        leftTableId,
        rightTableId,
        leftColumn,
        rightColumn,
        leftTableName: leftTable?.tableName,
        rightTableName: rightTable?.tableName,
        joinType,
        relationType: 'manual',
        confidence: 100,
        confirmed: true
      }
    ])
  }

  return (
    <div className="stack">
      <div className="content-grid">
        <div className="panel glass">
          <div className="panel-header">
            <h3>Suggested joins</h3>
            <span className="small-muted">{suggestions.length} found</span>
          </div>

          {!suggestions.length ? (
            <div className="empty-state compact">Сначала загрузи минимум 2 таблицы.</div>
          ) : (
            <div className="stack">
              {suggestions.slice(0, 12).map((item) => (
                <div key={item.id} className="relation-card">
                  <div>
                    <div className="relation-title">{item.leftTableName}.{item.leftColumn} ↔ {item.rightTableName}.{item.rightColumn}</div>
                    <div className="small-muted">confidence {item.confidence}% · {item.relationType}</div>
                  </div>
                  <button className="secondary-btn" onClick={() => confirmSuggestion(item)}>Use join</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel glass">
          <div className="panel-header">
            <h3>Manual join</h3>
            <span className="small-muted">left / inner / full</span>
          </div>

          <div className="form-grid">
            <select className="select" value={leftTableId} onChange={(e) => setLeftTableId(e.target.value)}>
              <option value="">Left table</option>
              {tables.map((table) => <option key={table.id} value={table.id}>{table.tableName}</option>)}
            </select>

            <select className="select" value={leftColumn} onChange={(e) => setLeftColumn(e.target.value)}>
              <option value="">Left field</option>
              {leftTable?.columns.map((column) => <option key={column} value={column}>{column}</option>)}
            </select>

            <select className="select" value={rightTableId} onChange={(e) => setRightTableId(e.target.value)}>
              <option value="">Right table</option>
              {tables.map((table) => <option key={table.id} value={table.id}>{table.tableName}</option>)}
            </select>

            <select className="select" value={rightColumn} onChange={(e) => setRightColumn(e.target.value)}>
              <option value="">Right field</option>
              {rightTable?.columns.map((column) => <option key={column} value={column}>{column}</option>)}
            </select>

            <select className="select" value={joinType} onChange={(e) => setJoinType(e.target.value)}>
              <option value="left">LEFT JOIN</option>
              <option value="inner">INNER JOIN</option>
              <option value="full">FULL JOIN</option>
            </select>

            <button className="primary-btn full-width" onClick={createManualJoin}>Create join</button>
          </div>
        </div>
      </div>

      <div className="panel glass">
        <div className="panel-header">
          <h3>Model schema</h3>
          <span className="small-muted">{relations.length} relations</span>
        </div>

        {!relations.length ? (
          <div className="empty-state compact">Пока нет подтвержденных связей.</div>
        ) : (
          <div className="stack">
            {relations.map((relation) => {
              const validation = validationMap[relation.id]
              return (
                <div key={relation.id} className={`schema-row ${validation?.status || 'good'}`}>
                  <div>
                    <div className="relation-title">{relation.leftTableName}.{relation.leftColumn} → {relation.rightTableName}.{relation.rightColumn}</div>
                    <div className="small-muted">{relation.joinType.toUpperCase()} · {relation.relationType}</div>
                  </div>
                  <div className="schema-metrics">
                    <span>{validation?.matchedPercent ?? 0}% matched</span>
                    <span>L dup {validation?.leftDuplicates ?? 0}</span>
                    <span>R dup {validation?.rightDuplicates ?? 0}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
