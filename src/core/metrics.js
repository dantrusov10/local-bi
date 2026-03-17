function tokenize(expr) {
  const tokens = []
  let i = 0
  while (i < expr.length) {
    const ch = expr[i]
    if (/\s/.test(ch)) { i += 1; continue }
    if (/[()+\-*/]/.test(ch)) {
      tokens.push({ type: ch, value: ch })
      i += 1
      continue
    }
    if (/\d|\./.test(ch)) {
      let j = i + 1
      while (j < expr.length && /[\d.]/.test(expr[j])) j += 1
      tokens.push({ type: 'number', value: Number(expr.slice(i, j)) })
      i = j
      continue
    }
    if (/[A-Za-zА-Яа-я_]/.test(ch)) {
      let j = i + 1
      while (j < expr.length && /[A-Za-zА-Яа-я0-9_.$]/.test(expr[j])) j += 1
      tokens.push({ type: 'identifier', value: expr.slice(i, j) })
      i = j
      continue
    }
    throw new Error(`Недопустимый символ в формуле: ${ch}`)
  }
  return tokens
}

function parseExpression(tokens, row) {
  let index = 0

  function parseFactor() {
    const token = tokens[index]
    if (!token) return 0

    if (token.type === 'number') {
      index += 1
      return token.value
    }

    if (token.type === 'identifier') {
      index += 1
      if (tokens[index]?.type === '(') {
        const fnName = token.value.toLowerCase()
        index += 1
        const args = [parseTerm()]
        while (tokens[index]?.type === ',') {
          index += 1
          args.push(parseTerm())
        }
        if (tokens[index]?.type !== ')') throw new Error('Не закрыта функция')
        index += 1
        if (fnName === 'min') return Math.min(...args)
        if (fnName === 'max') return Math.max(...args)
        throw new Error(`Неподдерживаемая функция: ${fnName}`)
      }
      return Number(resolveIdentifier(row, token.value) || 0)
    }

    if (token.type === '(') {
      index += 1
      const value = parseTerm()
      if (tokens[index]?.type !== ')') throw new Error('Не закрыта скобка')
      index += 1
      return value
    }

    if (token.type === '-') {
      index += 1
      return -parseFactor()
    }

    throw new Error(`Неожиданный токен: ${token.type}`)
  }

  function parseMulDiv() {
    let value = parseFactor()
    while (tokens[index] && (tokens[index].type === '*' || tokens[index].type === '/')) {
      const op = tokens[index].type
      index += 1
      const right = parseFactor()
      value = op === '*' ? value * right : (right === 0 ? 0 : value / right)
    }
    return value
  }

  function parseTerm() {
    let value = parseMulDiv()
    while (tokens[index] && (tokens[index].type === '+' || tokens[index].type === '-')) {
      const op = tokens[index].type
      index += 1
      const right = parseMulDiv()
      value = op === '+' ? value + right : value - right
    }
    return value
  }

  const result = parseTerm()
  if (index < tokens.length) throw new Error('Лишние символы в формуле')
  return result
}

function resolveIdentifier(row, identifier) {
  if (identifier in row) return row[identifier]
  const parts = identifier.split('.')
  if (parts.length > 1) {
    const last = parts[parts.length - 1]
    const direct = row[identifier]
    if (direct !== undefined) return direct
    const fallback = Object.keys(row).find((k) => k.endsWith(`.${last}`))
    if (fallback) return row[fallback]
  }
  return 0
}

export function computeMetric(row, formula) {
  try {
    const tokens = tokenize(formula)
    return Number(parseExpression(tokens, row) || 0)
  } catch (e) {
    return 0
  }
}

export function aggregateMetric(rows, metricDef) {
  if (!metricDef) return 0
  if (metricDef.formula) {
    const values = rows.map((row) => computeMetric(row, metricDef.formula))
    if (metricDef.aggregation === 'avg') return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
    if (metricDef.aggregation === 'max') return values.length ? Math.max(...values) : 0
    if (metricDef.aggregation === 'min') return values.length ? Math.min(...values) : 0
    if (metricDef.aggregation === 'count') return values.length
    return values.reduce((a, b) => a + b, 0)
  }

  const field = metricDef.field
  const values = field ? rows.map((row) => Number(row[field] || 0)) : []
  if (metricDef.aggregation === 'count') return rows.length
  if (metricDef.aggregation === 'avg') return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
  if (metricDef.aggregation === 'max') return values.length ? Math.max(...values) : 0
  if (metricDef.aggregation === 'min') return values.length ? Math.min(...values) : 0
  return values.reduce((a, b) => a + b, 0)
}
