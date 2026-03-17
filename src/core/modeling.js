import { normalizeJoinKey } from './utils.js'

export function buildModelRows(tables, relations) {
  if (!tables.length) return { rows: [], columns: [] }
  const confirmed = relations.filter((r) => r.confirmed)
  if (!confirmed.length) {
    const base = tables[0]
    return {
      rows: namespacedRows(base),
      columns: namespacedColumns(base)
    }
  }

  let currentRows = namespacedRows(tables[0])
  let currentColumns = namespacedColumns(tables[0])
  let currentTableIds = new Set([tables[0].id])
  const remaining = [...confirmed]

  while (remaining.length) {
    let progressed = false
    for (let i = 0; i < remaining.length; i += 1) {
      const relation = remaining[i]
      const leftTable = tables.find((t) => t.id === relation.leftTableId)
      const rightTable = tables.find((t) => t.id === relation.rightTableId)
      if (!leftTable || !rightTable) continue

      const leftInModel = currentTableIds.has(leftTable.id)
      const rightInModel = currentTableIds.has(rightTable.id)

      if (leftInModel && !rightInModel) {
        const joined = joinRows(currentRows, currentColumns, leftTable, rightTable, relation)
        currentRows = joined.rows
        currentColumns = joined.columns
        currentTableIds.add(rightTable.id)
        remaining.splice(i, 1)
        progressed = true
        break
      }

      if (rightInModel && !leftInModel) {
        const swapped = {
          ...relation,
          leftTableId: relation.rightTableId,
          leftColumn: relation.rightColumn,
          rightTableId: relation.leftTableId,
          rightColumn: relation.leftColumn
        }
        const joined = joinRows(currentRows, currentColumns, rightTable, leftTable, swapped)
        currentRows = joined.rows
        currentColumns = joined.columns
        currentTableIds.add(leftTable.id)
        remaining.splice(i, 1)
        progressed = true
        break
      }
    }
    if (!progressed) break
  }

  return { rows: currentRows, columns: currentColumns }
}

function namespacedColumns(table) {
  return table.columns.map((column) => `${table.tableName}.${column}`)
}

function namespacedRows(table) {
  return table.rows.map((row) => {
    const next = {}
    for (const column of table.columns) next[`${table.tableName}.${column}`] = row[column]
    return next
  })
}

function joinRows(currentRows, currentColumns, currentTable, newTable, relation) {
  const index = new Map()
  for (const row of newTable.rows) {
    const key = normalizeJoinKey(row[relation.rightColumn], 'soft')
    if (!key) continue
    if (!index.has(key)) index.set(key, [])
    index.get(key).push(row)
  }

  const rightColumns = newTable.columns.map((column) => `${newTable.tableName}.${column}`)
  const outRows = []

  for (const row of currentRows) {
    const leftValue = row[`${currentTable.tableName}.${relation.leftColumn}`]
    const key = normalizeJoinKey(leftValue, 'soft')
    const matches = key ? index.get(key) || [] : []

    if (matches.length) {
      for (const match of matches) {
        const merged = { ...row }
        for (const column of newTable.columns) merged[`${newTable.tableName}.${column}`] = match[column]
        outRows.push(merged)
      }
    } else if (relation.joinType === 'left' || relation.joinType === 'full') {
      const merged = { ...row }
      for (const column of newTable.columns) merged[`${newTable.tableName}.${column}`] = null
      outRows.push(merged)
    }
  }

  if (relation.joinType === 'full') {
    const seen = new Set(outRows.map((row) => normalizeJoinKey(row[`${currentTable.tableName}.${relation.leftColumn}`], 'soft')))
    for (const extra of newTable.rows) {
      const key = normalizeJoinKey(extra[relation.rightColumn], 'soft')
      if (!key || seen.has(key)) continue
      const merged = {}
      for (const col of currentColumns) merged[col] = null
      for (const column of newTable.columns) merged[`${newTable.tableName}.${column}`] = extra[column]
      outRows.push(merged)
    }
  }

  return { rows: outRows, columns: [...currentColumns, ...rightColumns] }
}
