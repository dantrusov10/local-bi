import React from 'react'

export default function DataPanel({
  files,
  visibleTables,
  selectedTable,
  setSelectedTableId,
  onFilesSelected,
  onToggleSheet
}) {
  return (
    <div className="content-grid">
      <div className="panel glass">
        <div className="panel-header">
          <h3>Загрузка датасетов</h3>
          <label className="primary-btn">
            Загрузить
            <input type="file" multiple accept=".csv,.xlsx,.xls" onChange={onFilesSelected} hidden />
          </label>
        </div>

        {!files.length && <div className="empty-state">Загрузи несколько CSV/XLSX файлов. Все обработается локально в браузере.</div>}

        <div className="stack">
          {files.map((file) => (
            <div key={file.id} className="dataset-card">
              <div className="dataset-title">{file.name}</div>
              <div className="dataset-meta">
                {(file.size / 1024 / 1024).toFixed(2)} MB · {file.sourceType.toUpperCase()}
              </div>

              {file.sheetNames?.length > 1 && (
                <div className="sheet-list">
                  {file.sheetNames.map((sheet) => (
                    <button
                      key={sheet}
                      className={`sheet-chip ${visibleTables.some((t) => t.fileId === file.id && t.sheetName === sheet) ? 'active' : ''}`}
                      onClick={() => onToggleSheet(file.id, sheet)}
                    >
                      {sheet}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="panel glass">
        <div className="panel-header">
          <h3>Таблицы</h3>
          <span className="small-muted">{visibleTables.length} готово</span>
        </div>
        <div className="table-list">
          {visibleTables.map((table) => (
            <button
              key={table.id}
              className={`table-chip ${selectedTable?.id === table.id ? 'active' : ''}`}
              onClick={() => setSelectedTableId(table.id)}
            >
              <div>{table.tableName}</div>
              <div className="small-muted">{table.rows.length} строк · {table.columns.length} колонок</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
