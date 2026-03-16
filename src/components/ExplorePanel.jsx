
import React from 'react'
import ChartCard from './ChartCard.jsx'

export default function ExplorePanel({
  modelRows,
  modelColumns,
  config,
  setConfig,
  chartData
}) {

  const numericFields = modelColumns.filter(f =>
    modelRows.some(r => !Number.isNaN(Number(r[f])))
  )

  function update(k,v){
    setConfig(prev=>({...prev,[k]:v}))
  }

  return (
    <div className="stack">

      <div className="panel glass">

        <div className="panel-header">
          <h3>BI‑конструктор</h3>
        </div>

        <div className="form-grid">

          <select className="select"
            value={config.dimension || ""}
            onChange={e=>update("dimension",e.target.value)}>
            <option value="">Измерение (ось X)</option>
            {modelColumns.map(c=>(
              <option key={c}>{c}</option>
            ))}
          </select>

          <select className="select"
            value={config.breakdown || ""}
            onChange={e=>update("breakdown",e.target.value)}>
            <option value="">Разбивка (series)</option>
            {modelColumns.map(c=>(
              <option key={c}>{c}</option>
            ))}
          </select>

          <select className="select"
            value={config.metric}
            onChange={e=>update("metric",e.target.value)}>
            <option value="count">COUNT</option>
            <option value="sum">SUM</option>
            <option value="avg">AVG</option>
            <option value="max">MAX</option>
            <option value="min">MIN</option>
          </select>

          <select className="select"
            value={config.metricField || ""}
            onChange={e=>update("metricField",e.target.value)}>
            <option value="">Поле метрики</option>
            {numericFields.map(c=>(
              <option key={c}>{c}</option>
            ))}
          </select>

          <select className="select"
            value={config.chartMode}
            onChange={e=>update("chartMode",e.target.value)}>
            <option value="bar">Столбцы</option>
            <option value="line">Линия</option>
            <option value="donut">Донат</option>
            <option value="table">Таблица</option>
          </select>

          <select className="select"
            value={config.sort || "desc"}
            onChange={e=>update("sort",e.target.value)}>
            <option value="desc">Сортировка ↓</option>
            <option value="asc">Сортировка ↑</option>
          </select>

        </div>

      </div>

      <ChartCard
        title="Результат"
        data={chartData}
        mode={config.chartMode}
      />

    </div>
  )
}
