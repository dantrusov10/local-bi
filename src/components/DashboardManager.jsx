import React, { useState } from 'react'

export default function DashboardManager({
  dashboards = [],
  currentDashboardId,
  onCreate,
  onSelect,
  onDelete
}) {
  const [name, setName] = useState('')

  return (
    <div className="panel glass">
      <div className="panel-header">
        <h3>Дашборды</h3>
        <div className="button-row">
          <input
            className="input dashboard-name-input"
            placeholder="Название нового дашборда"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className="primary-btn"
            onClick={() => {
              const trimmed = name.trim()
              if (!trimmed) return
              onCreate(trimmed)
              setName('')
            }}
          >
            Создать
          </button>
        </div>
      </div>

      {!dashboards.length ? (
        <div className="empty-state compact">Пока нет дашбордов.</div>
      ) : (
        <div className="dashboard-tabs">
          {dashboards.map((db) => (
            <div key={db.id} className={`dashboard-tab ${currentDashboardId === db.id ? 'active' : ''}`}>
              <button className="dashboard-tab-main" onClick={() => onSelect(db.id)}>
                <div className="dashboard-tab-title">{db.name}</div>
                <div className="small-muted">{(db.widgets || []).length} виджетов</div>
              </button>
              <button className="dashboard-tab-delete" onClick={() => onDelete(db.id)}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
