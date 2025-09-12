export type Entity = 'tasks' | 'messages' | 'contacts' | 'invoices' | 'expenses' | 'wiki'
export type Viz = 'tile' | 'list' | 'chart'
export type Filter = { field: string; op: string; value: string | number | boolean }

export interface DataQuery {
  entity: Entity
  fields: string[]
  filters: Filter[]
  limit?: number
  viz: Viz
}

export interface WidgetInstance {
  id: string
  x: number
  y: number
  w: number
  h: number
  query?: DataQuery
  config?: Record<string, string | number | boolean>
}

export interface DashboardLayout {
  id: string
  name: string
  tenantId: string
  userId?: string
  widgets: WidgetInstance[]
  createdAt: Date
  updatedAt: Date
}

export const ENTITY_FIELDS: Record<Entity, string[]> = {
  tasks: ['title', 'status', 'assignees', 'dueAt', 'priority', 'project'],
  messages: ['channel', 'from', 'to', 'status', 'receivedAt'],
  contacts: ['name', 'company', 'email', 'phone', 'tags'],
  invoices: ['number', 'status', 'totalCents', 'dueAt', 'customer'],
  expenses: ['vendor', 'amountCents', 'project', 'bookedAt'],
  wiki: ['title', 'updatedAt', 'author', 'tags']
}

export const FILTER_OPS = ['=', '!=', 'contains', 'in', '>', '<']