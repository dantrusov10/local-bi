
import React from 'react'

export default function ChartCard({ title, data = [], mode = 'bar' }) {

  const max = Math.max(...data.map(d=>d.value||0),1)

  return (
    <div className="panel glass">
      <div className="panel-header">
        <h3>{title}</h3>
      </div>

      {!data.length && (
        <div className="empty-state">Нет данных для построения графика</div>
      )}

      {mode === "table" && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Категория</th>
                <th>Значение</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d,i)=>(
                <tr key={i}>
                  <td>{d.label}</td>
                  <td>{d.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(mode==="bar" || mode==="line") && (
        <div className="chart-bars">
          {data.slice(0,12).map(d=>(
            <div key={d.label} className="bar-col">
              <div
                className="bar"
                style={{height: Math.max(12,(d.value/max)*160)+"px"}}
              />
              <div className="bar-label">{d.label}</div>
              <div className="bar-value">{d.value}</div>
            </div>
          ))}
        </div>
      )}

      {mode==="donut" && (
        <div style={{padding:"30px",textAlign:"center"}}>
          <div style={{fontSize:"40px",fontWeight:"bold"}}>
            {data.reduce((a,b)=>a+b.value,0)}
          </div>
          <div className="small-muted">суммарное значение</div>
        </div>
      )}

    </div>
  )
}
