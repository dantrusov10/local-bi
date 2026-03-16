import React from 'react'

export default function Topbar({ title, fileCount, tableCount }) {
  return (
    <header className="topbar">
      <div>
        <div className="page-eyebrow">NewLevel CRM style dashboard</div>
        <h1>{title}</h1>
      </div>

      <div className="topbar-actions">
        <div className="pill">Files: {fileCount}</div>
        <div className="pill">Tables: {tableCount}</div>
        <div className="avatar">DT</div>
      </div>
    </header>
  )
}
