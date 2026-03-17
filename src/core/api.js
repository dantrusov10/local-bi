export async function sendWebhook({ url, event, payload, method = 'POST', headers = {} }) {
  if (!url) throw new Error('Не задан URL вебхука')
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify({
      event,
      payload,
      timestamp: new Date().toISOString()
    })
  })

  const text = await response.text()
  return {
    ok: response.ok,
    status: response.status,
    body: text
  }
}

export async function writeBack({ url, row, method = 'POST', headers = {} }) {
  if (!url) throw new Error('Не задан URL write-back API')
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify({
      row,
      timestamp: new Date().toISOString()
    })
  })

  const text = await response.text()
  return {
    ok: response.ok,
    status: response.status,
    body: text
  }
}
