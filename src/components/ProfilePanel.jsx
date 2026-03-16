import React from 'react'

export default function ProfilePanel({ table }) {
  return (
    <div className="panel glass">
      <div className="panel-header">
        <h3>Профилирование колонок</h3>
        <span className="small-muted">{table?.profiles?.length || 0} полей</span>
      </div>

      {!table ? (
        <div className="empty-state compact">Нет активной таблицы.</div>
      ) : (
        <div className="profile-grid">
          {table.profiles.map((profile) => (
            <div key={profile.name} className="profile-card">
              <div className="profile-title">{profile.name}</div>
              <div className="profile-badges">
                <span className="badge">{profile.type}</span>
                <span className="badge">null {profile.nullPercent}%</span>
                <span className="badge">unique {profile.uniquePercent}%</span>
              </div>
              <div className="small-muted">{profile.examples?.join(', ') || '—'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
