import * as XLSX from 'xlsx'

export function exportRowsToCsv(rows, filename = 'export.csv') {
  if (!rows.length) return
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const csv = XLSX.utils.sheet_to_csv(worksheet)
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), filename)
}

export function exportRowsToXlsx(rows, filename = 'export.xlsx') {
  if (!rows.length) return
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
  XLSX.writeFile(workbook, filename)
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
