import { z } from 'zod'

export const TaskCreate = z.object({
  projectId: z.string().uuid().optional(),
  title: z.string().min(1),
  status: z.enum(['todo','doing','blocked','done','archived']).optional(),
  type: z.enum(['task','bug','feature']).optional(),
  dueAt: z.string().datetime().optional(),
  priority: z.number().int().min(0).max(5).optional(),
  points: z.number().int().min(0).max(100).nullable().optional(),
  tags: z.array(z.string()).optional(),
  assigneeMembershipIds: z.array(z.string().uuid()).optional(),
})
export const TaskUpdate = TaskCreate.partial()
export type TaskCreateInput = z.infer<typeof TaskCreate>
export type TaskUpdateInput = z.infer<typeof TaskUpdate>

export const DepCreate = z.object({
  predecessorId: z.string().uuid(), successorId: z.string().uuid(),
  type: z.enum(['FS','SS','FF','SF']).default('FS'),
  lagMinutes: z.number().int().min(0).default(0)
})
export type DepCreateInput = z.infer<typeof DepCreate>

export const FieldCreate = z.object({
  projectId: z.string().uuid().optional(),
  name: z.string().min(1),
  key: z.string().min(1),
  kind: z.string().min(1),
  options: z.any().optional()
})
export type FieldCreateInput = z.infer<typeof FieldCreate>

export const FieldValueUpsert = z.object({
  taskId: z.string().uuid(),
  fieldId: z.string().uuid(),
  value: z.any()
})
export type FieldValueUpsertInput = z.infer<typeof FieldValueUpsert>

export const SavedViewCreate = z.object({
  projectId: z.string().uuid().optional(),
  name: z.string().min(1),
  kind: z.enum(['board','list','gantt','calendar']),
  filters: z.any().default({}),
  sort: z.any().default({}),
  layout: z.any().default({}),
  isDefault: z.boolean().default(false),
  isShared: z.boolean().default(false)
})
export type SavedViewCreateInput = z.infer<typeof SavedViewCreate>

export const RoadmapItemCreate = z.object({
  projectId: z.string().uuid().optional(),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.string().default('open'),
  public: z.boolean().default(true)
})
export type RoadmapItemCreateInput = z.infer<typeof RoadmapItemCreate>

export const RoadmapCommentCreate = z.object({
  itemId: z.string().uuid(),
  body: z.string().min(1)
})
export type RoadmapCommentCreateInput = z.infer<typeof RoadmapCommentCreate>