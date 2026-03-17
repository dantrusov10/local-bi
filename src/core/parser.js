import { uid } from './utils.js'

let worker
let listeners = new Map()

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL('../workers/dataWorker.js', import.meta.url), { type: 'module' })
    worker.onmessage = (event) => {
      const { id, ok, result, error } = event.data
      const handler = listeners.get(id)
      if (!handler) return
      listeners.delete(id)
      if (ok) handler.resolve(result)
      else handler.reject(new Error(error || 'Ошибка worker'))
    }
  }
  return worker
}

function runWorker(type, payload) {
  const id = uid('task')
  const w = getWorker()
  return new Promise((resolve, reject) => {
    listeners.set(id, { resolve, reject })
    w.postMessage({ id, type, payload }, payload.transfer || [])
  })
}

export function detectSourceType(fileName = '') {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.csv')) return 'csv'
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) return 'xlsx'
  return 'unknown'
}

export async function parseFile(file) {
  const type = detectSourceType(file.name)
  const fileId = uid('file')
  const fileAsset = {
    id: fileId,
    name: file.name,
    size: file.size,
    sourceType: type,
    sheetNames: type === 'csv' ? ['Data'] : []
  }

  if (type === 'csv') {
    const text = await file.text()
    return runWorker('parse_csv', {
      text,
      fileId,
      fileName: file.name,
      tableId: uid('table'),
      tableName: file.name.replace(/\.[^.]+$/, ''),
      fileAsset
    })
  }

  if (type === 'xlsx') {
    const buffer = await file.arrayBuffer()
    return runWorker('parse_xlsx', {
      buffer,
      transfer: [buffer],
      fileId,
      fileName: file.name,
      baseTableName: file.name.replace(/\.[^.]+$/, ''),
      fileAsset
    })
  }

  throw new Error(`Неподдерживаемый тип файла: ${file.name}`)
}
