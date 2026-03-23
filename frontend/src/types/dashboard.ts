export interface MetricCardData {
  title: string
  href: string
  total: string
  data: Array<{
    label: string
    value: number
  }>
}

export interface AdvisorIssue {
  id: string
  category: 'setup' | 'reliability' | 'performance' | 'security'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  actionLabel: string
  actionHref: string
}

export interface ActivityRow {
  id: string
  status: 'success' | 'error' | 'running' | 'warning'
  workflow: string
  step: string
  duration: string
  time: string
}

export interface ExecutionData {
  id: string
  flow_name: string
  status: string
  created_at: string
  updated_at?: string
}
