import React from 'react'

export default function ChartCard({ title, data = [], mode = 'bar' }) {
  const safe = data.slice(0, 8)
  const max = Math.max(...safe.map((d) => d.value || 0), 1)

  return (
    <div className="panel glass">
      <div className="panel-header">
        <h3>{title}</h3>
        <span className="small-muted">{safe.length} items</span>
      </div>

      {safe.length === 0 ? (
        <div className="empty-state compact">Пока нет данных для графика</div>
      ) : (
        <div className="chart-area">
          {mode === 'donut' ? (
            <div className="donut-wrap">
              <svg viewBox="0 0 120 120" className="donut">
                <circle cx="60" cy="60" r="42" pathLength="100" className="donut-bg" />
                <circle cx="60" cy="60" r="42" pathLength="100" className="donut-value" strokeDasharray={`${Math.min(100, (safe[0].value / max) * 100)} 100`} />
              </svg>
              <div className="donut-center">{safe[0].value}</div>
            </div>
          ) : (
            <div className={`chart-bars ${mode}`}>
              {safe.map((item) => (
                <div key={item.label} className="bar-col">
                  <div
                    className="bar"
                    style={{ height: `${Math.max(12, (item.value / max) * 160)}px` }}
                  />
                  <div className="bar-label" title={item.label}>{item.label}</div>
                  <div className="bar-value">{item.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
