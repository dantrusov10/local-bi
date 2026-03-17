import React, { useState } from 'react'
import SearchSelect from './SearchSelect.jsx'
import { ROLE_OPTIONS } from '../core/permissions.js'

export default function SettingsEnterprisePanel({
  security,
  setSecurity,
  theme,
  setTheme,
  modelRows,
  drilldownRows,
  onSendWebhook,
  onWriteBack
}) {
  const [webhookEvent, setWebhookEvent] = useState('kpi_alert')
  const [webhookStatus, setWebhookStatus] = useState('')
  const [writebackStatus, setWritebackStatus] = useState('')

  async function handleWebhook() {
    const sample = (drilldownRows && drilldownRows.length ? drilldownRows[0] : modelRows[0]) || {}
    const result = await onSendWebhook({
      event: webhookEvent,
      payload: {
        rowsVisible: modelRows.length,
        sample
      }
    })
    setWebhookStatus(result)
  }

  async function handleWriteback() {
    const sample = (drilldownRows && drilldownRows.length ? drilldownRows[0] : modelRows[0]) || {}
    const result = await onWriteBack({ row: sample })
    setWritebackStatus(result)
  }

  return (
    <div className="stack">
      <div className="panel glass">
        <div className="panel-header">
          <h3>Права доступа (RLS)</h3>
          <span className="small-muted">Ограничение строк по роли, владельцу и команде</span>
        </div>

        <div className="builder-grid-3">
          <SearchSelect
            label="Роль"
            value={security.role}
            onChange={(v) => setSecurity((prev) => ({ ...prev, role: v }))}
            options={ROLE_OPTIONS}
          />
          <div className="search-select">
            <div className="search-select-label">Пользователь</div>
            <input className="search-select-input inline-input" value={security.userName} onChange={(e) => setSecurity((prev) => ({ ...prev, userName: e.target.value }))} placeholder="Например Иванов" />
          </div>
          <div className="search-select">
            <div className="search-select-label">Команда</div>
            <input className="search-select-input inline-input" value={security.teamValue} onChange={(e) => setSecurity((prev) => ({ ...prev, teamValue: e.target.value }))} placeholder="Например Север" />
          </div>
        </div>

        <div className="builder-grid-2">
          <div className="search-select">
            <div className="search-select-label">Поле владельца</div>
            <input className="search-select-input inline-input" value={security.ownerField} onChange={(e) => setSecurity((prev) => ({ ...prev, ownerField: e.target.value }))} />
          </div>
          <div className="search-select">
            <div className="search-select-label">Поле команды</div>
            <input className="search-select-input inline-input" value={security.teamField} onChange={(e) => setSecurity((prev) => ({ ...prev, teamField: e.target.value }))} />
          </div>
        </div>
      </div>

      <div className="panel glass">
        <div className="panel-header">
          <h3>API, Webhooks и Write-back</h3>
          <span className="small-muted">Настройка реальных HTTP-вызовов из интерфейса BI</span>
        </div>

        <div className="builder-grid-2">
          <div className="search-select">
            <div className="search-select-label">Webhook URL</div>
            <input className="search-select-input inline-input" value={security.webhookUrl} onChange={(e) => setSecurity((prev) => ({ ...prev, webhookUrl: e.target.value }))} placeholder="https://..." />
          </div>
          <div className="search-select">
            <div className="search-select-label">Название события</div>
            <input className="search-select-input inline-input" value={webhookEvent} onChange={(e) => setWebhookEvent(e.target.value)} placeholder="kpi_alert" />
          </div>
        </div>

        <div className="builder-grid-2">
          <div className="search-select">
            <div className="search-select-label">Write-back URL</div>
            <input className="search-select-input inline-input" value={security.writebackUrl} onChange={(e) => setSecurity((prev) => ({ ...prev, writebackUrl: e.target.value }))} placeholder="https://..." />
          </div>
          <div className="button-row align-end">
            <button className="secondary-btn" onClick={handleWebhook}>Отправить webhook</button>
            <button className="primary-btn" onClick={handleWriteback}>Сделать write-back</button>
          </div>
        </div>

        {!!webhookStatus && <div className="sql-box">{webhookStatus}</div>}
        {!!writebackStatus && <div className="sql-box">{writebackStatus}</div>}
      </div>

      <div className="panel glass">
        <div className="panel-header">
          <h3>White Label</h3>
          <span className="small-muted">Кастомизация цветов под брендбук компании</span>
        </div>

        <div className="builder-grid-3">
          <div className="search-select">
            <div className="search-select-label">Основной цвет</div>
            <input className="search-select-input inline-input" value={theme.primary} onChange={(e) => setTheme((prev) => ({ ...prev, primary: e.target.value }))} placeholder="#4a7cff" />
          </div>
          <div className="search-select">
            <div className="search-select-label">Акцентный цвет</div>
            <input className="search-select-input inline-input" value={theme.accent} onChange={(e) => setTheme((prev) => ({ ...prev, accent: e.target.value }))} placeholder="#55c6ff" />
          </div>
          <div className="search-select">
            <div className="search-select-label">Свечение карточек</div>
            <input className="search-select-input inline-input" value={theme.cardGlow} onChange={(e) => setTheme((prev) => ({ ...prev, cardGlow: e.target.value }))} placeholder="rgba(...)" />
          </div>
        </div>

        <div className="builder-grid-2">
          <div className="search-select">
            <div className="search-select-label">Фон: верх</div>
            <input className="search-select-input inline-input" value={theme.bgStart} onChange={(e) => setTheme((prev) => ({ ...prev, bgStart: e.target.value }))} />
          </div>
          <div className="search-select">
            <div className="search-select-label">Фон: низ</div>
            <input className="search-select-input inline-input" value={theme.bgEnd} onChange={(e) => setTheme((prev) => ({ ...prev, bgEnd: e.target.value }))} />
          </div>
        </div>
      </div>
    </div>
  )
}
