import React from 'react'

export default function Topbar({ title, fileCount, tableCount }) {
  return (
    <header className="topbar">
      <div>
        <div className="page-eyebrow">NewLevel CRM style dashboard</div>
        <h1>{title}</h1>
      </div>

      <div className="topbar-actions">
        <div className="pill">Файлы: {fileCount}</div>
        <div className="pill">Таблицы: {tableCount}</div>
        <div className="avatar">DT</div>
      </div>
    </header>
  )
}
