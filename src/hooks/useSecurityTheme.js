import { useEffect } from 'react'
import { applyTheme } from '../core/theme.js'
import { sendWebhook, writeBack } from '../core/api.js'

export function useSecurityTheme(theme, security) {
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  async function handleSendWebhook({ event, payload }) {
    try {
      const result = await sendWebhook({ url: security.webhookUrl, event, payload })
      return JSON.stringify(result, null, 2)
    } catch (e) {
      return e.message || 'Ошибка webhook'
    }
  }

  async function handleWriteBack({ row }) {
    try {
      const result = await writeBack({ url: security.writebackUrl, row })
      return JSON.stringify(result, null, 2)
    } catch (e) {
      return e.message || 'Ошибка write-back'
    }
  }

  return { handleSendWebhook, handleWriteBack }
}
