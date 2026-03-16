import React from 'react'

function maxVal(data) {
  return Math.max(...data.map((d) => Number(d.value || 0)), 1)
}

function sumVal(data) {
  return data.reduce((a, b) => a + Number(b.value || 0), 0)
}

function palette(i) {
  const colors = ['#55c6ff', '#4a7cff', '#44e1cf', '#7a8dff', '#3ed598', '#7ecbff', '#b184ff']
  return colors[i % colors.length]
}

export default function ChartCard({ title, data = [], mode = 'bar' }) {
  const safe = data.slice(0, 12)
  const max = maxVal(safe)
  const total = sumVal(safe)


  return (
    <div className="panel glass">
      <div className="panel-header">
        <h3>{title}</h3>
        <span className="small-muted">{safe.length} точек</span>
      </div>

      {!safe.length && <div className="empty-state">Нет данных для построения графика</div>}

      {mode === 'table' && !!safe.length && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Категория</th><th>Значение</th></tr>
            </thead>
            <tbody>
              {safe.map((d, i) => (
                <tr key={i}><td>{d.label}</td><td>{d.value}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mode === 'kpi' && !!safe.length && (
        <div className="kpi-visual-wrap">
          <div className="kpi-visual-value">{total}</div>
          <div className="small-muted">суммарное значение</div>
          <div className="kpi-mini-grid">
            {safe.slice(0, 4).map((d, i) => (
              <div key={i} className="kpi-mini-item">
                <div className="small-muted">{d.label}</div>
                <strong>{d.value}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {(mode === 'bar' || mode === 'stacked') && !!safe.length && (
        <div className="chart-bars">
          {safe.map((d, i) => (
            <div key={d.label + i} className="bar-col">
              <div
                className={`bar ${mode === 'stacked' ? 'stacked' : ''}`}
                style={{
                  height: Math.max(12, (Number(d.value || 0) / max) * 180) + 'px',
                  background: mode === 'stacked'
                    ? `linear-gradient(180deg, ${palette(i)} 0%, ${palette(i + 1)} 100%)`
                    : undefined
                }}
              />
              <div className="bar-label" title={d.label}>{d.label}</div>
              <div className="bar-value">{d.value}</div>
            </div>
          ))}
        </div>
      )}

      {mode === 'hbar' && !!safe.length && (
        <div className="hbars-wrap">
          {safe.map((d, i) => (
            <div key={d.label + i} className="hbar-row">
              <div className="hbar-label" title={d.label}>{d.label}</div>
              <div className="hbar-track">
                <div className="hbar-fill" style={{ width: `${Math.max(4, (Number(d.value || 0) / max) * 100)}%`, background: palette(i) }} />
              </div>
              <div className="hbar-value">{d.value}</div>
            </div>
          ))}
        </div>
      )}

      {(mode === 'line' || mode === 'area' || mode === 'combo') && !!safe.length && (
        <div className="svg-chart-wrap">
          <svg viewBox="0 0 640 260" className="svg-chart">
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#55c6ff" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#55c6ff" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {[0,1,2,3].map((r) => (
              <line key={r} x1="40" x2="620" y1={40 + r*50} y2={40 + r*50} className="svg-grid-line" />
            ))}

            {mode === 'combo' && safe.map((d, i) => {
              const x = 50 + i * (560 / Math.max(safe.length - 1, 1))
              const h = Math.max(8, (Number(d.value || 0) / max) * 120)
              return (
                <rect
                  key={'bar'+i}
                  x={x - 12}
                  y={200 - h}
                  width="24"
                  height={h}
                  rx="8"
                  fill="rgba(74,124,255,0.35)"
                />
              )
            })}

            {mode === 'area' && (
              <path
                d={buildAreaPath(safe, max)}
                fill="url(#areaFill)"
                stroke="none"
              />
            )}

            <path
              d={buildLinePath(safe, max)}
              fill="none"
              stroke="#55c6ff"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {safe.map((d, i) => {
              const x = 50 + i * (560 / Math.max(safe.length - 1, 1))
              const y = 200 - (Number(d.value || 0) / max) * 150
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="5" fill="#44e1cf" />
                  <text x={x} y="232" textAnchor="middle" className="svg-x-label">{truncateLabel(d.label)}</text>
                </g>
              )
            })}
          </svg>
        </div>
      )}

      {(mode === 'pie' || mode === 'donut') && !!safe.length && (
        <div className="pie-wrap">
          <svg viewBox="0 0 260 260" className="pie-svg">
            {buildPieSlices(safe, mode === 'donut').map((slice, i) => (
              <path key={i} d={slice.d} fill={palette(i)} />
            ))}
            {mode === 'donut' && <circle cx="130" cy="130" r="52" fill="#0d1830" />}
            <text x="130" y="126" textAnchor="middle" className="pie-total">{total}</text>
            <text x="130" y="146" textAnchor="middle" className="pie-sub">итого</text>
          </svg>

          <div className="pie-legend">
            {safe.map((d, i) => (
              <div key={i} className="pie-legend-row">
                <span className="pie-legend-dot" style={{ background: palette(i) }} />
                <span className="pie-legend-label">{d.label}</span>
                <strong>{d.value}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function truncateLabel(label) {
  const s = String(label || '')
  return s.length > 10 ? s.slice(0, 10) + '…' : s
}

function buildLinePath(data, max) {
  return data.map((d, i) => {
    const x = 50 + i * (560 / Math.max(data.length - 1, 1))
    const y = 200 - (Number(d.value || 0) / max) * 150
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')
}

function buildAreaPath(data, max) {
  const line = buildLinePath(data, max)
  const endX = 50 + (data.length - 1) * (560 / Math.max(data.length - 1, 1))
  return `${line} L ${endX} 200 L 50 200 Z`
}

function buildPieSlices(data, donut = false) {
  const total = Math.max(sumVal(data), 1)
  let angle = -Math.PI / 2
  const cx = 130, cy = 130, r = 90

  return data.map((d) => {
    const part = Number(d.value || 0) / total
    const next = angle + part * Math.PI * 2
    const largeArc = next - angle > Math.PI ? 1 : 0

    const x1 = cx + Math.cos(angle) * r
    const y1 = cy + Math.sin(angle) * r
    const x2 = cx + Math.cos(next) * r
    const y2 = cy + Math.sin(next) * r

    let path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`

    if (donut) {
      const r2 = 52
      const ix2 = cx + Math.cos(angle) * r2
      const iy2 = cy + Math.sin(angle) * r2
      const ix1 = cx + Math.cos(next) * r2
      const iy1 = cy + Math.sin(next) * r2
      path = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${r2} ${r2} 0 ${largeArc} 0 ${ix2} ${iy2} Z`
    }

    angle = next
    return { d: path }
  })
}
