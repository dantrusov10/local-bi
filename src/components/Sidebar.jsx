import React from 'react'

const items = [
  'Дашборд',
  'Данные',
  'Модель',
  'Конструктор графиков',
  'Сохраненные виды',
  'Настройки'
]

export default function Sidebar({ section, setSection }) {
  return (
    <aside className="sidebar glass">
      <div className="brand">
        <div className="brand-logo">N</div>
        <div>
          <div className="brand-title">NewLevel BI</div>
          <div className="brand-sub">Локальная BI-аналитика без сервера</div>
        </div>
      </div>

      <nav className="nav">
        {items.map((item) => (
          <button
            key={item}
            className={`nav-item ${section === item ? 'active' : ''}`}
            onClick={() => setSection(item)}
          >
            <span className="nav-dot" />
            {item}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="small-muted">Workspace</div>
        <div className="workspace-badge">local-bi-jade</div>
      </div>
    </aside>
  )
}
