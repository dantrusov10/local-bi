import React from 'react'
import SearchSelect from './SearchSelect.jsx'
import { operatorLabels } from '../core/filtering.js'

const operators = Object.keys(operatorLabels)

function newRule() {
  return { id: `global_${Math.random().toString(36).slice(2, 8)}`, field: '', operator: 'contains', value: '' }
}

export default function GlobalFiltersBar({ fields = [], filters = [], setFilters }) {
  const options = fields.map((f) => ({ value: f, label: f }))
  const operatorOptions = operators.map((op) => ({ value: op, label: operatorLabels[op] }))

  function addFilter() {
    setFilters([...(filters || []), newRule()])
  }
  function updateFilter(id, patch) {
    setFilters((filters || []).map((f) => f.id === id ? { ...f, ...patch } : f))
  }
  function removeFilter(id) {
    setFilters((filters || []).filter((f) => f.id !== id))
  }
  function clearAll() {
    setFilters([])
  }

  return (
    <div className="panel glass">
      <div className="panel-header">
        <h3>Глобальные фильтры дашборда</h3>
        <div className="button-row">
          <button className="secondary-btn" onClick={addFilter}>Добавить фильтр</button>
          <button className="secondary-btn" onClick={clearAll}>Сбросить</button>
        </div>
      </div>

      {!filters.length && <div className="empty-state compact">Нет глобальных фильтров. Они будут применяться ко всем виджетам и графикам.</div>}

      <div className="stack">
        {filters.map((rule) => (
          <div key={rule.id} className="filter-row">
            <SearchSelect
              value={rule.field}
              onChange={(v) => updateFilter(rule.id, { field: v })}
              options={options}
              placeholder="Поле"
            />
            <SearchSelect
              value={rule.operator}
              onChange={(v) => updateFilter(rule.id, { operator: v })}
              options={operatorOptions}
              placeholder="Оператор"
            />
            <input
              className="input"
              placeholder="Значение"
              value={rule.value}
              onChange={(e) => updateFilter(rule.id, { value: e.target.value })}
            />
            <button className="secondary-btn" onClick={() => removeFilter(rule.id)}>Удалить</button>
          </div>
        ))}
      </div>
    </div>
  )
}
