import React from 'react'
import ChartCard from './ChartCard.jsx'

export default function DashboardBoard({
  widgets = [],
  onMoveUp,
  onMoveDown,
  onRemove,
  onResize,
  onRename,
  onDrag
}) {

  function handleDragStart(e, id){
    e.dataTransfer.setData("id", id)
  }

  function handleDrop(e, targetId){
    const sourceId = e.dataTransfer.getData("id")
    if(sourceId && sourceId !== targetId){
      onDrag(sourceId, targetId)
    }
  }

  return (
    <div className="dashboard-widgets-grid">
      {widgets.map((widget, index) => (
        <div
          key={widget.id}
          className={`panel glass widget-size-${widget.size || 'normal'}`}
          draggable
          onDragStart={(e)=>handleDragStart(e, widget.id)}
          onDragOver={(e)=>e.preventDefault()}
          onDrop={(e)=>handleDrop(e, widget.id)}
        >
          <div className="panel-header">
            <input
              className="input widget-title-input"
              value={widget.title || ''}
              onChange={(e)=>onRename(widget.id, e.target.value)}
            />
            <div className="button-row">
              <button className="secondary-btn" onClick={() => onResize(widget.id, 'normal')}>1x</button>
              <button className="secondary-btn" onClick={() => onResize(widget.id, 'wide')}>2x</button>
              <button className="secondary-btn" onClick={() => onMoveUp(widget.id)}>↑</button>
              <button className="secondary-btn" onClick={() => onMoveDown(widget.id)}>↓</button>
              <button className="secondary-btn" onClick={() => onRemove(widget.id)}>Удалить</button>
            </div>
          </div>

          <ChartCard
            title={widget.title || ''}
            data={widget.chartData || []}
            secondaryData={widget.secondaryData || []}
            mode={widget.chartMode || 'bar'}
          />
        </div>
      ))}
    </div>
  )
}
