import React from 'react'
import ChartCard from './ChartCard.jsx'

export default function DashboardBoard({ widgets = [], onMoveUp, onMoveDown, onRemove, onResize }) {
  if (!widgets.length) {
    return <div className="empty-state">Пока нет сохраненных виджетов на дашборде</div>
  }

  return (
    <div className="dashboard-widgets-grid">
      {widgets.map((widget, index) => (
        <div key={widget.id} className={`panel glass widget-size-${widget.size || 'normal'}`}>
          <div className="panel-header">
            <div>
              <h3>{widget.title || `Виджет ${index + 1}`}</h3>
              <div className="small-muted">{widget.chartMode || 'bar'} · {(widget.dimensions || []).join(', ') || 'без измерений'}</div>
            </div>
            <div className="button-row">
              <button className="secondary-btn" onClick={() => onResize(widget.id, 'normal')}>1x</button>
              <button className="secondary-btn" onClick={() => onResize(widget.id, 'wide')}>2x</button>
              <button className="secondary-btn" onClick={() => onMoveUp(widget.id)}>↑</button>
              <button className="secondary-btn" onClick={() => onMoveDown(widget.id)}>↓</button>
              <button className="secondary-btn" onClick={() => onRemove(widget.id)}>Удалить</button>
            </div>
          </div>

          <ChartCard
            title={widget.title || 'Виджет'}
            data={widget.chartData || []}
            secondaryData={widget.secondaryData || []}
            mode={widget.chartMode || 'bar'}
          />
        </div>
      ))}
    </div>
  )
}
