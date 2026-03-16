import React from 'react'

export default function SavedViewsPanel({ savedViews, onSaveView, onLoadView, currentConfig }) {
  return (
    <div className="content-grid">
      <div className="panel glass">
        <div className="panel-header">
          <h3>Saved views</h3>
          <button className="primary-btn" onClick={onSaveView}>Save current view</button>
        </div>

        {!savedViews.length ? (
          <div className="empty-state compact">Пока нет сохраненных представлений.</div>
        ) : (
          <div className="stack">
            {savedViews.map((view) => (
              <div key={view.id} className="relation-card">
                <div>
                  <div className="relation-title">{view.name}</div>
                  <div className="small-muted">{view.dimension || '—'} · {view.metric || '—'} · {view.metricField || '*'}</div>
                </div>
                <button className="secondary-btn" onClick={() => onLoadView(view)}>Load</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel glass">
        <div className="panel-header">
          <h3>Current config</h3>
        </div>
        <pre className="config-box">{JSON.stringify(currentConfig, null, 2)}</pre>
      </div>
    </div>
  )
}
