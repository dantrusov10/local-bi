import { useMemo } from 'react'
import { parseFile } from '../core/parser.js'

export function useDataWorkspace(state, setState) {
  const visibleTables = useMemo(() => (
    state.tables.filter((table) => {
      const selected = state.sheetSelection[table.fileId]
      if (!table.sheetName || !selected?.length) return true
      return selected.includes(table.sheetName)
    })
  ), [state.tables, state.sheetSelection])

  const selectedTable = useMemo(
    () => visibleTables.find((table) => table.id === state.selectedTableId) || visibleTables[0] || null,
    [visibleTables, state.selectedTableId]
  )

  async function handleFilesSelected(event, setBusy, setError, setSection) {
    const incoming = Array.from(event.target.files || [])
    if (!incoming.length) return
    setBusy(true)
    setError('')
    try {
      const nextFiles = []
      const nextTables = []
      const nextQaLogs = []

      for (const file of incoming) {
        const parsed = await parseFile(file)
        nextFiles.push(parsed.fileAsset)
        nextTables.push(...parsed.tables)
        nextQaLogs.push({
          fileName: parsed.fileAsset.name,
          ...(parsed.qa || {})
        })
      }

      const nextSelection = {}
      for (const file of nextFiles) nextSelection[file.id] = file.sheetNames

      setState((prev) => ({
        ...prev,
        files: [...prev.files, ...nextFiles],
        tables: [...prev.tables, ...nextTables],
        sheetSelection: { ...prev.sheetSelection, ...nextSelection },
        selectedTableId: prev.selectedTableId || nextTables[0]?.id || null,
        qaLogs: [...prev.qaLogs, ...nextQaLogs]
      }))
      setSection('Данные')
    } catch (err) {
      setError(err.message || 'Не удалось обработать файлы')
    } finally {
      setBusy(false)
    }
  }

  function onToggleSheet(fileId, sheetName) {
    setState((prev) => {
      const current = prev.sheetSelection[fileId] || []
      const next = current.includes(sheetName)
        ? current.filter((item) => item !== sheetName)
        : [...current, sheetName]
      return { ...prev, sheetSelection: { ...prev.sheetSelection, [fileId]: next } }
    })
  }

  return { visibleTables, selectedTable, handleFilesSelected, onToggleSheet }
}
