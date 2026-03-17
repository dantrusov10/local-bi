
import React from 'react'
export default function Legend({series=[]}){
  return (
    <div className="legend">
      {series.map((s,i)=>(
        <div key={i} className="legend-item">
          <span className="legend-dot"/> {s}
        </div>
      ))}
    </div>
  )
}
