import { uid } from './utils.js'
import { defaultTheme } from './theme.js'

export const defaultConfig = {
  dimensions: [],
  metric: 'count',
  metricField: '',
  secondMetric: '',
  secondMetricField: '',
  breakdown: '',
  filters: [],
  chartMode: 'bar',
  sort: 'desc',
  topN: '',
  pivotRows: [],
  pivotColumns: [],
  dateField: '',
  compareMode: 'none',
  timeGrain: 'month'
}

export const defaultSecurity = {
  role: 'admin',
  userName: '',
  teamValue: '',
  ownerField: 'owner',
  teamField: 'team',
  webhookUrl: '',
  writebackUrl: ''
}

export const defaultDrilldown = { label: '', rows: [] }

export function makeDefaultDashboard() {
  return { id: uid('dashboard'), name: 'Основной дашборд', widgets: [] }
}

export const defaultWorkspaceState = {
  files: [],
  tables: [],
  sheetSelection: {},
  selectedTableId: null,
  relations: [],
  config: defaultConfig,
  savedViews: [],
  dashboards: [makeDefaultDashboard()],
  currentDashboardId: '',
  semanticMetrics: [],
  globalFilters: [],
  security: defaultSecurity,
  theme: defaultTheme,
  qaLogs: []
}
