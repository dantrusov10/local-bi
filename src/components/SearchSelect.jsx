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
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => String(o.label || o.value).toLowerCase().includes(q))
  }, [options, query])

  const selectedValues = multiple ? (Array.isArray(value) ? value : []) : [value].filter(Boolean)

  function pick(optionValue) {
    if (multiple) {
      const next = selectedValues.includes(optionValue)
        ? selectedValues.filter((x) => x !== optionValue)
        : [...selectedValues, optionValue]
      onChange(next)
      return
    }
    onChange(optionValue)
    setOpen(false)
  }

  function removeChip(chip) {
    if (!multiple) return
    onChange(selectedValues.filter((x) => x !== chip))
  }

  return (
    <div className="search-select" ref={rootRef}>
      {label && <div className="search-select-label">{label}</div>}

      <button type="button" className={`search-select-trigger ${open ? 'open' : ''}`} onClick={() => setOpen((s) => !s)}>
        <div className="search-select-value-area">
          {!selectedValues.length && <span className="search-select-placeholder">{placeholder}</span>}
          {!!selectedValues.length && !multiple && <span className="search-select-value">{selectedValues[0]}</span>}
          {!!selectedValues.length && multiple && (
            <div className="search-select-chips">
              {selectedValues.slice(0, 3).map((chip) => (
                <span key={chip} className="search-chip">
                  {chip}
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeChip(chip) }}>×</button>
                </span>
              ))}
              {selectedValues.length > 3 && <span className="search-chip more">+{selectedValues.length - 3}</span>}
            </div>
          )}
        </div>
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
              const active = multiple ? selectedValues.includes(option.value) : value === option.value
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
