import React, { useMemo, useRef, useState, useEffect } from 'react'

export default function SearchSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Выберите значение',
  multiple = false
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)

  useEffect(() => {
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => String(o.label || o.value).toLowerCase().includes(q))
  }, [options, query])

  const selectedLabel = useMemo(() => {
    if (multiple) {
      const arr = Array.isArray(value) ? value : []
      return arr.length ? arr.join(', ') : placeholder
    }
    const found = options.find((o) => o.value === value)
    return found ? found.label : placeholder
  }, [value, options, multiple, placeholder])

  function pick(optionValue) {
    if (multiple) {
      const arr = Array.isArray(value) ? value : []
      const next = arr.includes(optionValue)
        ? arr.filter((x) => x !== optionValue)
        : [...arr, optionValue]
      onChange(next)
      return
    }
    onChange(optionValue)
    setOpen(false)
  }

  const currentMulti = Array.isArray(value) ? value : []

  return (
    <div className="search-select" ref={rootRef}>
      {label && <div className="search-select-label">{label}</div>}

      <button type="button" className={`search-select-trigger ${open ? 'open' : ''}`} onClick={() => setOpen((s) => !s)}>
        <span className="search-select-value">{selectedLabel}</span>
        <span className="search-select-arrow">▾</span>
      </button>

      {open && (
        <div className="search-select-menu glass">
          <input
            className="search-select-input"
            placeholder="Поиск..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />

          <div className="search-select-list">
            {!filtered.length && <div className="search-select-empty">Ничего не найдено</div>}

            {filtered.map((option) => {
              const active = multiple ? currentMulti.includes(option.value) : value === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`search-select-option ${active ? 'active' : ''}`}
                  onClick={() => pick(option.value)}
                >
                  <span>{option.label}</span>
                  {active && <span className="search-select-check">✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
