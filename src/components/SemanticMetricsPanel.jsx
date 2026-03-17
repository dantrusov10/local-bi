import React, { useState } from 'react'
import SearchSelect from './SearchSelect.jsx'

const aggregations = [
  { value: 'count', label: 'COUNT' },
  { value: 'sum', label: 'SUM' },
  { value: 'avg', label: 'AVG' },
  { value: 'max', label: 'MAX' },
  { value: 'min', label: 'MIN' }
]

export default function SemanticMetricsPanel({ fields = [], semanticMetrics = [], setSemanticMetrics }) {
  const [name, setName] = useState('')
  const [agg, setAgg] = useState('sum')
  const [field, setField] = useState('')

  const fieldOptions = fields.map((f) => ({ value: f, label: f }))

  function addMetric() {
    const trimmed = name.trim()
    if (!trimmed) return
    setSemanticMetrics([
      ...(semanticMetrics || []),
      {
        id: `metric_${Math.random().toString(36).slice(2, 8)}`,
        name: trimmed,
        aggregation: agg,
        field
      }
    ])
    setName('')
    setAgg('sum')
    setField('')
  }

  function removeMetric(id) {
    setSemanticMetrics((semanticMetrics || []).filter((m) => m.id !== id))
  }

  return (
    <div className="stack">
      <div className="panel glass">
        <div className="panel-header">
          <h3>Семантический слой метрик</h3>
          <span className="small-muted">Задай бизнес-метрику один раз, потом используй ее в любых графиках</span>
        </div>

        <div className="builder-grid-3">
          <div className="search-select">
            <div className="search-select-label">Название метрики</div>
            <input className="search-select-input inline-input" value={name} placeholder="Например Маржа" onChange={(e) => setName(e.target.value)} />
          </div>

          <SearchSelect
            label="Агрегация"
            value={agg}
            onChange={setAgg}
            options={aggregations}
          />

          <SearchSelect
            label="Поле"
            value={field}
            onChange={setField}
            options={[{ value: '', label: 'Без поля (для COUNT)' }, ...fieldOptions]}
            placeholder="Выбери поле"
          />
        </div>

        <div className="button-row">
          <button className="primary-btn" onClick={addMetric}>Создать метрику</button>
        </div>
      </div>

      <div className="panel glass">
        <div className="panel-header">
          <h3>Список бизнес-метрик</h3>
          <span className="small-muted">{semanticMetrics.length} создано</span>
        </div>

        {!semanticMetrics.length ? (
          <div className="empty-state compact">Пока нет semantic metrics.</div>
        ) : (
          <div className="stack">
            {semanticMetrics.map((m) => (
              <div key={m.id} className="relation-card">
                <div>
                  <div className="relation-title">{m.name}</div>
                  <div className="small-muted">{m.aggregation.toUpperCase()}({m.field || '*'})</div>
                </div>
                <button className="secondary-btn" onClick={() => removeMetric(m.id)}>Удалить</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
