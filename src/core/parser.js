import * as XLSX from 'xlsx'
import Papa from 'papaparse'

function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

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

export function detectSourceType(fileName = '') {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.csv')) return 'csv'
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) return 'xlsx'
  return 'unknown'
}

export async function parseFile(file) {
  const type = detectSourceType(file.name)
  if (type === 'csv') return parseCsv(file)
  if (type === 'xlsx') return parseExcel(file)
  throw new Error(`Неподдерживаемый тип файла: ${file.name}`)
}

async function parseCsv(file) {
  const rows = await new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => resolve(result.data || []),
      error: reject
    })
  })

  const normalized = normalizeRows(rows)
  const columns = Object.keys(normalized[0] || {})
  const fileId = uid('file')
  return {
    fileAsset: {
      id: fileId,
      name: file.name,
      size: file.size,
      sourceType: 'csv',
      sheetNames: ['Data']
    },
    tables: [{
      id: uid('table'),
      fileId,
      fileName: file.name,
      tableName: file.name.replace(/\.[^.]+$/, ''),
      sourceType: 'csv',
      sheetName: 'Data',
      columns,
      rows: normalized
    }]
  }
}

async function parseExcel(file) {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const fileId = uid('file')
  const tables = workbook.SheetNames.map((sheetName) => {
    const raw = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null })
    const rows = normalizeRows(raw)
    const columns = Object.keys(rows[0] || {})
    return {
      id: uid('table'),
      fileId,
      fileName: file.name,
      tableName: `${file.name.replace(/\.[^.]+$/, '')}_${sheetName}`,
      sourceType: 'xlsx',
      sheetName,
      columns,
      rows
    }
  })

  return {
    fileAsset: {
      id: fileId,
      name: file.name,
      size: file.size,
      sourceType: 'xlsx',
      sheetNames: workbook.SheetNames
    },
    tables
  }
}
