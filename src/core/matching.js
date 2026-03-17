import { normalizeJoinKey } from './utils.js'

function similarityByName(a, b) {
  const x = a.toLowerCase()
  const y = b.toLowerCase()
  if (x === y) return 1
  if (x.includes(y) || y.includes(x)) return 0.75
  const aliases = [
    ['inn', 'инн'],
    ['email', 'email_address'],
    ['phone', 'телефон'],
    ['id', 'company_id'],
    ['client_id', 'company_id']
  ]
  if (aliases.some(([m, n]) => (x === m && y === n) || (x === n && y === m))) return 0.8
  return 0
}

function overlapScore(leftRows, rightRows, leftColumn, rightColumn) {
  const left = new Set(leftRows.map((r) => normalizeJoinKey(r[leftColumn], 'loose')).filter(Boolean))
  const right = new Set(rightRows.map((r) => normalizeJoinKey(r[rightColumn], 'loose')).filter(Boolean))
  if (!left.size || !right.size) return 0
  let overlap = 0
  for (const key of left) if (right.has(key)) overlap += 1
  return overlap / Math.min(left.size, right.size)
}

function relationType(leftRows, rightRows, leftColumn, rightColumn) {
  const leftValues = leftRows.map((r) => normalizeJoinKey(r[leftColumn], 'soft')).filter(Boolean)
  const rightValues = rightRows.map((r) => normalizeJoinKey(r[rightColumn], 'soft')).filter(Boolean)
  const leftUnique = new Set(leftValues).size === leftValues.length
  const rightUnique = new Set(rightValues).size === rightValues.length
  if (leftUnique && rightUnique) return 'one-to-one'
  if (!leftUnique && rightUnique) return 'many-to-one'
  if (leftUnique && !rightUnique) return 'one-to-many'
  return 'many-to-many'
}

export function suggestJoins(tables) {
  const suggestions = []
  for (let i = 0; i < tables.length; i += 1) {
    for (let j = i + 1; j < tables.length; j += 1) {
      const leftTable = tables[i]
      const rightTable = tables[j]
      for (const leftColumn of leftTable.columns) {
        for (const rightColumn of rightTable.columns) {
          const nameScore = similarityByName(leftColumn, rightColumn)
          const overlap = overlapScore(leftTable.rows, rightTable.rows, leftColumn, rightColumn)
          const confidence = Math.round((nameScore * 0.45 + overlap * 0.55) * 100)
          if (confidence >= 45) {
            suggestions.push({
              id: `${leftTable.id}_${leftColumn}_${rightTable.id}_${rightColumn}`,
              leftTableId: leftTable.id,
              leftTableName: leftTable.tableName,
              leftColumn,
              rightTableId: rightTable.id,
              rightTableName: rightTable.tableName,
              rightColumn,
              joinType: 'left',
              confidence,
              relationType: relationType(leftTable.rows, rightTable.rows, leftColumn, rightColumn)
            })
          }
        }
      }
    }
  }
  return suggestions.sort((a, b) => b.confidence - a.confidence)
}

export function validateRelation(leftTable, rightTable, relation) {
  const leftKeys = leftTable.rows.map((r) => normalizeJoinKey(r[relation.leftColumn], 'soft')).filter(Boolean)
  const rightKeys = rightTable.rows.map((r) => normalizeJoinKey(r[relation.rightColumn], 'soft')).filter(Boolean)
  const rightSet = new Set(rightKeys)
  let matched = 0
  for (const key of leftKeys) if (rightSet.has(key)) matched += 1
  const matchedPercent = leftKeys.length ? Math.round((matched / leftKeys.length) * 100) : 0
  const leftDuplicates = leftKeys.length - new Set(leftKeys).size
  const rightDuplicates = rightKeys.length - new Set(rightKeys).size
  let status = 'good'
  if (matchedPercent < 75 || leftDuplicates > 0 || rightDuplicates > 0) status = 'warning'
  if (matchedPercent < 40) status = 'bad'
  return {
    matchedPercent,
    unmatchedLeft: Math.max(0, leftKeys.length - matched),
    leftDuplicates,
    rightDuplicates,
    status
  }
}
