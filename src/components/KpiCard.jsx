import React from 'react'

export default function KpiCard({ label, value, hint }) {
  return (
    <div className="kpi-card glass">
      <div className="small-muted">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-hint">{hint}</div>
    </div>
  )
}
