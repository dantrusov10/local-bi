import React from 'react'

export default function DataDiagnosticsPanel({ qaLogs = [] }) {
  return (
    <div className="panel glass">
      <div className="panel-header">
        <h3>QA и диагностика загрузки</h3>
        <span className="small-muted">{qaLogs.length} записей</span>
      </div>

      {!qaLogs.length ? (
        <div className="empty-state compact">Логи загрузки появятся после импорта файлов.</div>
      ) : (
        <div className="stack">
          {qaLogs.slice().reverse().map((item, index) => (
            <div key={index} className="relation-card">
              <div>
                <div className="relation-title">{item.fileName}</div>
                <div className="small-muted">
                  {item.sourceType?.toUpperCase()} · {item.tableCount} таблиц · {item.rowCount} строк · {item.columnCount} колонок · {item.durationMs} мс
                </div>
              </div>
              <div className="profile-badges">
                {item.rowCount > 50000 && <span className="badge">тяжелый файл</span>}
                {item.durationMs > 2000 && <span className="badge">медленная загрузка</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
