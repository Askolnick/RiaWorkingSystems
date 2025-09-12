export type TaskDependencyType = 'FS' | 'SS' | 'FF' | 'SF'

export interface TaskDependency {
  id: string
  predecessorId: string // The task that must be completed first
  successorId: string   // The task that depends on the predecessor  
  type: TaskDependencyType
  lagMinutes: number    // Delay between predecessor completion and successor start
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface CreateTaskDependencyData {
  predecessorId: string
  successorId: string
  type?: TaskDependencyType
  lagMinutes?: number
}

export interface TaskWithDependencies {
  id: string
  title: string
  status: string
  predecessors: TaskDependency[]
  successors: TaskDependency[]
}

// Dependency type descriptions:
// FS (Finish-to-Start): Predecessor must finish before successor can start
// SS (Start-to-Start): Predecessor must start before successor can start  
// FF (Finish-to-Finish): Predecessor must finish before successor can finish
// SF (Start-to-Finish): Predecessor must start before successor can finish

// -------------------- Task Custom Fields --------------------

export type CustomFieldType = 'text' | 'number' | 'boolean' | 'date' | 'select' | 'multiselect' | 'user' | 'url'

export interface CustomFieldOption {
  value: string
  label: string
  color?: string
}

export interface CustomFieldValidation {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
}

export interface TaskCustomField {
  id: string
  tenantId: string
  name: string
  key: string
  description?: string
  type: CustomFieldType
  required: boolean
  defaultValue?: any
  options?: CustomFieldOption[]
  validation?: CustomFieldValidation
  isActive: boolean
  sortOrder: number
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface TaskCustomFieldValue {
  id: string
  tenantId: string
  taskId: string
  customFieldId: string
  value: any
  createdAt: string
  updatedAt: string
  customField?: TaskCustomField
}

export interface CreateTaskCustomFieldData {
  name: string
  key: string
  description?: string
  type: CustomFieldType
  required?: boolean
  defaultValue?: any
  options?: CustomFieldOption[]
  validation?: CustomFieldValidation
  sortOrder?: number
}

export interface UpdateTaskCustomFieldData {
  name?: string
  description?: string
  required?: boolean
  defaultValue?: any
  options?: CustomFieldOption[]
  validation?: CustomFieldValidation
  isActive?: boolean
  sortOrder?: number
}

export interface SetTaskCustomFieldValueData {
  customFieldId: string
  value: any
}

export interface TaskWithCustomFields {
  id: string
  title: string
  status: string
  customFields: TaskCustomFieldValue[]
}

// -------------------- Task Saved Views --------------------

export type TaskViewType = 'list' | 'board' | 'calendar' | 'timeline'
export type SortDirection = 'asc' | 'desc'

export interface TaskFilter {
  status?: string[]
  assigneeId?: string[]
  priority?: string[]
  projectId?: string[]
  tags?: string[]
  dueDateRange?: {
    start?: string
    end?: string
  }
  createdDateRange?: {
    start?: string
    end?: string
  }
  search?: string
  customFields?: Record<string, any>
}

export interface TaskSort {
  field: string
  direction: SortDirection
}

export interface TaskSavedView {
  id: string
  tenantId: string
  name: string
  description?: string
  viewType: TaskViewType
  filters: TaskFilter
  sorting: TaskSort[]
  groupBy?: string
  columns?: string[]
  isDefault: boolean
  isShared: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CreateTaskSavedViewData {
  name: string
  description?: string
  viewType: TaskViewType
  filters: TaskFilter
  sorting: TaskSort[]
  groupBy?: string
  columns?: string[]
  isDefault?: boolean
  isShared?: boolean
}

export interface UpdateTaskSavedViewData {
  name?: string
  description?: string
  viewType?: TaskViewType
  filters?: TaskFilter
  sorting?: TaskSort[]
  groupBy?: string
  columns?: string[]
  isDefault?: boolean
  isShared?: boolean
}