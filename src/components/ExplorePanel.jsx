import React from 'react'
import ChartCard from './ChartCard.jsx'
import SearchSelect from './SearchSelect.jsx'
import { exportRowsToCsv, exportRowsToXlsx } from '../core/export.js'
import { operatorLabels } from '../core/filtering.js'

const operators = Object.keys(operatorLabels)
const chartTypes = [
  { value: 'bar', label: 'Столбчатая' },
  { value: 'hbar', label: 'Горизонтальная столбчатая' },
  { value: 'line', label: 'Линейная' },
  { value: 'area', label: 'Область' },
  { value: 'combo', label: 'Комбинированная' },
  { value: 'stacked', label: 'Stacked columns' },
  { value: 'pie', label: 'Круговая' },
  { value: 'donut', label: 'Донат' },
  { value: 'funnel', label: 'Воронка' },
  { value: 'kpi', label: 'KPI карточка' },
  { value: 'table', label: 'Таблица' }
]

function newRule() {
  return { id: `rule_${Math.random().toString(36).slice(2, 8)}`, field: '', operator: 'contains', value: '' }
}

export default function ExplorePanel({
  modelRows,
  modelColumns,
  config,
  setConfig,
  chartData,
  secondaryData
}) {
  const numericFields = modelColumns.filter((field) =>
    modelRows.some((row) => row[field] !== null && !Number.isNaN(Number(row[field])))
  )

  const filters = config.filters || []
  const allFieldOptions = modelColumns.map((field) => ({ value: field, label: field }))
  const numericOptions = numericFields.map((field) => ({ value: field, label: field }))
  const operatorOptions = operators.map((op) => ({ value: op, label: operatorLabels[op] }))
  const metricOptions = [
    { value: 'count', label: 'COUNT' },
    { value: 'sum', label: 'SUM' },
    { value: 'avg', label: 'AVG' },
    { value: 'max', label: 'MAX' },
    { value: 'min', label: 'MIN' }
  ]
  const sortOptions = [
    { value: 'desc', label: 'Сортировка по убыванию' },
    { value: 'asc', label: 'Сортировка по возрастанию' }
  ]

  function addFilter() {
    setConfig((prev) => ({ ...prev, filters: [...(prev.filters || []), newRule()] }))
  }
  function updateFilter(id, patch) {
    setConfig((prev) => ({
      ...prev,
      filters: (prev.filters || []).map((rule) => rule.id === id ? { ...rule, ...patch } : rule)
    }))
  }
  function removeFilter(id) {
    setConfig((prev) => ({
      ...prev,
      filters: (prev.filters || []).filter((rule) => rule.id !== id)
    }))
  }

  return (
    <div className="stack">
      <div className="content-grid">
        <div className="panel glass">
          <div className="panel-header">
            <h3>Конструктор графиков и визуалов</h3>
            <span className="small-muted">сделан как BI-builder под дашборды и аналитику</span>
          </div>

          <div className="builder-block">
            <div className="builder-title">1. Измерения и сущности</div>
            <div className="builder-grid-2">
              <SearchSelect
                label="Измерения (можно несколько)"
                value={config.dimensions || []}
                onChange={(v) => setConfig((prev) => ({ ...prev, dimensions: v }))}
                options={allFieldOptions}
                placeholder="Выбери 1 или несколько полей"
                multiple
              />
              <SearchSelect
                label="Разбивка / серия"
                value={config.breakdown || ''}
                onChange={(v) => setConfig((prev) => ({ ...prev, breakdown: v }))}
                options={[{ value: '', label: 'Без разбивки' }, ...allFieldOptions]}
                placeholder="Выбери поле для сравнения"
              />
            </div>
          </div>

          <div className="builder-block">
            <div className="builder-title">2. Метрики и визуальный тип</div>
            <div className="builder-grid-3">
              <SearchSelect
                label="Основная метрика"
                value={config.metric || 'count'}
                onChange={(v) => setConfig((prev) => ({ ...prev, metric: v }))}
                options={metricOptions}
              />
              <SearchSelect
                label="Поле основной метрики"
                value={config.metricField || ''}
                onChange={(v) => setConfig((prev) => ({ ...prev, metricField: v }))}
                options={numericOptions}
                placeholder="Выбери числовое поле"
              />
              <SearchSelect
                label="Тип графика"
                value={config.chartMode || 'bar'}
                onChange={(v) => setConfig((prev) => ({ ...prev, chartMode: v }))}
                options={chartTypes}
              />
            </div>

            <div className="builder-grid-3">
              <SearchSelect
                label="Вторая метрика"
                value={config.secondMetric || ''}
                onChange={(v) => setConfig((prev) => ({ ...prev, secondMetric: v }))}
                options={[{ value: '', label: 'Без второй метрики' }, ...metricOptions]}
                placeholder="Опционально"
              />
              <SearchSelect
                label="Поле второй метрики"
                value={config.secondMetricField || ''}
                onChange={(v) => setConfig((prev) => ({ ...prev, secondMetricField: v }))}
                options={[{ value: '', label: 'Без поля' }, ...numericOptions]}
                placeholder="Опционально"
              />
              <SearchSelect
                label="Сортировка"
                value={config.sort || 'desc'}
                onChange={(v) => setConfig((prev) => ({ ...prev, sort: v }))}
                options={sortOptions}
              />
            </div>

            <div className="builder-grid-2">
              <div className="search-select">
                <div className="search-select-label">Top N</div>
                <input
                  className="search-select-input inline-input"
                  placeholder="Например 10"
                  value={config.topN || ''}
                  onChange={(e) => setConfig((prev) => ({ ...prev, topN: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="builder-block">
            <div className="builder-title">3. Внутренние фильтры</div>
            <div className="stack">
              {filters.map((rule) => (
                <div key={rule.id} className="filter-row">
                  <SearchSelect
                    value={rule.field}
                    onChange={(v) => updateFilter(rule.id, { field: v })}
                    options={allFieldOptions}
                    placeholder="Поле"
                  />
                  <SearchSelect
                    value={rule.operator}
                    onChange={(v) => updateFilter(rule.id, { operator: v })}
                    options={operatorOptions}
                    placeholder="Оператор"
                  />
                  <input
                    className="input"
                    value={rule.value}
                    placeholder="Значение"
                    onChange={(e) => updateFilter(rule.id, { value: e.target.value })}
                  />
                  <button className="secondary-btn" onClick={() => removeFilter(rule.id)}>Удалить</button>
                </div>
              ))}
              <div>
                <button className="secondary-btn" onClick={addFilter}>Добавить фильтр</button>
              </div>
            </div>
          </div>

          <div className="sql-box">
{`Логика текущего вывода
Измерения: ${(config.dimensions || []).length ? (config.dimensions || []).join(', ') : 'не выбраны'}
Разбивка: ${config.breakdown || 'без разбивки'}
Метрика 1: ${config.metric || 'не выбрана'}(${config.metricField || '*'})
Метрика 2: ${config.secondMetric || 'нет'}(${config.secondMetricField || '*'})

Тип графика: ${chartTypes.find((x) => x.value === config.chartMode)?.label || config.chartMode}
Сортировка: ${config.sort === 'asc' ? 'по возрастанию' : 'по убыванию'}
Top N: ${config.topN || 'без ограничения'}

Фильтры:
${filters.length ? filters.map((f) => `- ${f.field || 'поле'} ${operatorLabels[f.operator] || f.operator} ${f.value || ''}`).join('\n') : '- нет фильтров'}
`}
          </div>

          <div className="button-row">
            <button className="secondary-btn" onClick={() => exportRowsToCsv(modelRows, 'model-export.csv')}>Экспорт CSV</button>
            <button className="secondary-btn" onClick={() => exportRowsToXlsx(modelRows, 'model-export.xlsx')}>Экспорт XLSX</button>
          </div>
        </div>

        <ChartCard title="Предпросмотр визуала" data={chartData} secondaryData={secondaryData} mode={config.chartMode} />
      </div>

      <div className="panel glass">
        <div className="panel-header">
          <h3>Табличный вывод</h3>
          <span className="small-muted">{modelRows.length} строк в текущей модели</span>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {modelColumns.slice(0, 10).map((column) => <th key={column}>{column}</th>)}
              </tr>
            </thead>
            <tbody>
              {modelRows.slice(0, 18).map((row, idx) => (
                <tr key={idx}>
                  {modelColumns.slice(0, 10).map((column) => <td key={column}>{row[column] == null ? '—' : String(row[column])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
