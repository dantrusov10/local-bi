import * as XLSX from 'xlsx'
import Papa from 'papaparse'

function normalizeValue(value) {
  if (value === undefined || value === null || value === '') return null
  if (typeof value === 'string') return value.trim()
  return value
}

function normalizeRows(rows) {
  return rows.map((row) => {
    const next = {}
    for (const key of Object.keys(row || {})) {
      next[key] = normalizeValue(row[key])
    }
    return next
  })
}

function detectColumnType(values) {
  const nonEmpty = values.filter((v) => v !== null && v !== '')
  if (!nonEmpty.length) return 'empty'
  const isBoolean = nonEmpty.every((v) => v === true || v === false || v === 'true' || v === 'false')
  if (isBoolean) return 'boolean'
  const isNumber = nonEmpty.every((v) => !Number.isNaN(Number(v)))
  if (isNumber) return 'number'
  const isDate = nonEmpty.every((v) => {
    if (typeof v === 'number') return false
    const d = new Date(v)
    return !Number.isNaN(d.getTime())
  })
  if (isDate) return 'date'
  return 'string'
}

function profileTable(table) {
  const profiles = table.columns.map((column) => {
    const values = table.rows.map((row) => row[column])
    const type = detectColumnType(values)
    const normalized = values.filter((v) => v !== null && v !== '').map((v) => String(v).trim().toLowerCase())
    const unique = new Set(normalized)
    const nullCount = values.filter((v) => v === null || v === '').length
    return {
      name: column,
      type,
      nullPercent: table.rows.length ? Math.round((nullCount / table.rows.length) * 100) : 0,
      uniquePercent: normalized.length ? Math.round((unique.size / normalized.length) * 100) : 0,
      examples: Array.from(unique).slice(0, 3)
    }
  })
  return { ...table, profiles }
}

self.onmessage = async (event) => {
  const { id, type, payload } = event.data
  try {
    if (type === 'parse_csv') {
      const rowsRaw = await new Promise((resolve, reject) => {
        Papa.parse(payload.text, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => resolve(result.data || []),
          error: reject
        })
      })
      const rows = normalizeRows(rowsRaw)
      const columns = Object.keys(rows[0] || {})
      const tables = [profileTable({
        id: payload.tableId,
        fileId: payload.fileId,
        fileName: payload.fileName,
        tableName: payload.tableName,
        sourceType: 'csv',
        sheetName: 'Data',
        columns,
        rows
      })]
      self.postMessage({ id, ok: true, result: { fileAsset: payload.fileAsset, tables } })
      return
    }

    if (type === 'parse_xlsx') {
      const workbook = XLSX.read(payload.buffer, { type: 'array' })
      const tables = workbook.SheetNames.map((sheetName, index) => {
        const raw = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null })
        const rows = normalizeRows(raw)
        const columns = Object.keys(rows[0] || {})
        return profileTable({
          id: `${payload.fileId}_table_${index}`,
          fileId: payload.fileId,
          fileName: payload.fileName,
          tableName: `${payload.baseTableName}_${sheetName}`,
          sourceType: 'xlsx',
          sheetName,
          columns,
          rows
        })
      })

      self.postMessage({
        id,
        ok: true,
        result: {
          fileAsset: { ...payload.fileAsset, sheetNames: workbook.SheetNames },
          tables
        }
      })
      return
    }

    throw new Error('Неизвестный тип задачи worker')
  } catch (e) {
    self.postMessage({ id, ok: false, error: e.message || 'Ошибка worker' })
  }
}
