import { useMemo } from 'react'
import { suggestJoins, validateRelation } from '../core/matching.js'
import { buildModelRows } from '../core/modeling.js'
import { applyRLS } from '../core/permissions.js'

export function useModeling(visibleTables, relations, security) {
  const suggestions = useMemo(() => suggestJoins(visibleTables), [visibleTables])

  const validationMap = useMemo(() => {
    const out = {}
    for (const relation of relations) {
      const leftTable = visibleTables.find((t) => t.id === relation.leftTableId)
      const rightTable = visibleTables.find((t) => t.id === relation.rightTableId)
      if (leftTable && rightTable) out[relation.id] = validateRelation(leftTable, rightTable, relation)
    }
    return out
  }, [relations, visibleTables])

  const model = useMemo(() => buildModelRows(visibleTables, relations), [visibleTables, relations])
  const securedRows = useMemo(() => applyRLS(model.rows, security), [model.rows, security])

  return { suggestions, validationMap, model, securedRows }
}
