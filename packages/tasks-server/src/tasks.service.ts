import { z } from 'zod';
import { generateRankBetween } from './rank';
import type { CreateTaskDependencyData } from './types';

// Zod schemas for validation
export const CreateTaskSchema = z.object({
  projectId: z.string().uuid().optional(),
  title: z.string().min(1),
  status: z.enum(['todo','doing','blocked','done','archived']).default('todo'),
  type: z.enum(['task','bug','feature']).default('task'),
  dueAt: z.string().datetime().optional(),
  priority: z.number().int().min(0).max(5).default(0),
  points: z.number().int().min(0).max(100).nullable().optional(),
  tags: z.array(z.string()).default([]),
  assigneeMembershipIds: z.array(z.string().uuid()).default([]),
  parentTaskId: z.string().uuid().optional(),
  rank: z.string().optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial();

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;

export const CreateDependencySchema = z.object({
  predecessorId: z.string().uuid(),
  successorId: z.string().uuid(),
  type: z.enum(['FS','SS','FF','SF']).default('FS'),
  lagMinutes: z.number().int().min(0).default(0),
});

export type CreateDependencyInput = z.infer<typeof CreateDependencySchema>;

export const CreateCustomFieldSchema = z.object({
  projectId: z.string().uuid().optional(),
  name: z.string().min(1),
  key: z.string().min(1),
  kind: z.enum(['text', 'number', 'date', 'select', 'multi_select', 'checkbox']),
  options: z.any().optional(),
});

export type CreateCustomFieldInput = z.infer<typeof CreateCustomFieldSchema>;

export const UpsertFieldValueSchema = z.object({
  taskId: z.string().uuid(),
  fieldId: z.string().uuid(),
  value: z.any(),
});

export type UpsertFieldValueInput = z.infer<typeof UpsertFieldValueSchema>;

export const CreateSavedViewSchema = z.object({
  projectId: z.string().uuid().optional(),
  name: z.string().min(1),
  kind: z.enum(['board','list','gantt','calendar']),
  filters: z.record(z.any()).default({}),
  sort: z.record(z.any()).default({}),
  layout: z.record(z.any()).default({}),
  isDefault: z.boolean().default(false),
  isShared: z.boolean().default(false),
});

export type CreateSavedViewInput = z.infer<typeof CreateSavedViewSchema>;

/**
 * Tasks Service - Business logic layer
 * This service handles task management operations following the clean architecture pattern.
 * It integrates with the repository layer for data access and provides validation.
 */
export class TasksService {
  constructor(private readonly tasksRepository: any) {}

  /**
   * List tasks with filtering and sorting
   */
  async listTasks(tenantId: string, query: Record<string, any>) {
    // Apply tenant filtering and any query parameters
    return this.tasksRepository.findAll({
      tenantId,
      ...query,
    });
  }

  /**
   * Create a new task with proper ranking
   */
  async createTask(tenantId: string, input: CreateTaskInput) {
    const validatedInput = CreateTaskSchema.parse(input);
    
    // Generate rank if not provided
    if (!validatedInput.rank) {
      // Get the last task in the same column to calculate rank
      const lastTask = await this.tasksRepository.findLast({
        tenantId,
        status: validatedInput.status,
        projectId: validatedInput.projectId,
      });
      
      validatedInput.rank = generateRankBetween(
        lastTask?.rank || null,
        null
      );
    }

    return this.tasksRepository.create({
      ...validatedInput,
      tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Update an existing task
   */
  async updateTask(tenantId: string, id: string, input: UpdateTaskInput) {
    const validatedInput = UpdateTaskSchema.parse(input);
    
    return this.tasksRepository.update(id, {
      ...validatedInput,
      tenantId,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Delete a task
   */
  async deleteTask(tenantId: string, id: string) {
    return this.tasksRepository.delete(id, { tenantId });
  }

  /**
   * Reorder task by updating its rank
   */
  async reorderTask(
    tenantId: string, 
    taskId: string, 
    beforeTaskId?: string, 
    afterTaskId?: string
  ) {
    const beforeTask = beforeTaskId 
      ? await this.tasksRepository.findById(beforeTaskId, { tenantId })
      : null;
    const afterTask = afterTaskId 
      ? await this.tasksRepository.findById(afterTaskId, { tenantId })
      : null;

    const newRank = generateRankBetween(
      beforeTask?.rank || null,
      afterTask?.rank || null
    );

    return this.updateTask(tenantId, taskId, { rank: newRank });
  }

  /**
   * Add task dependency
   */
  async createDependency(tenantId: string, input: CreateDependencyInput) {
    const validatedInput = CreateDependencySchema.parse(input);
    
    // Validate both tasks exist and belong to tenant
    const [predecessor, successor] = await Promise.all([
      this.tasksRepository.findById(validatedInput.predecessorId, { tenantId }),
      this.tasksRepository.findById(validatedInput.successorId, { tenantId }),
    ]);

    if (!predecessor || !successor) {
      throw new Error('Task not found');
    }

    // Check for circular dependencies (basic check)
    if (validatedInput.predecessorId === validatedInput.successorId) {
      throw new Error('Task cannot depend on itself');
    }

    return this.tasksRepository.createDependency({
      ...validatedInput,
      tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Get task with its dependencies
   */
  async getTaskWithDependencies(tenantId: string, taskId: string) {
    return this.tasksRepository.findWithDependencies(taskId, { tenantId });
  }

  /**
   * Create custom field
   */
  async createCustomField(tenantId: string, input: CreateCustomFieldInput) {
    const validatedInput = CreateCustomFieldSchema.parse(input);
    
    return this.tasksRepository.createCustomField({
      ...validatedInput,
      tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Set custom field value for a task
   */
  async upsertFieldValue(tenantId: string, input: UpsertFieldValueInput) {
    const validatedInput = UpsertFieldValueSchema.parse(input);
    
    // Validate task and field exist
    const [task, field] = await Promise.all([
      this.tasksRepository.findById(validatedInput.taskId, { tenantId }),
      this.tasksRepository.findCustomField(validatedInput.fieldId, { tenantId }),
    ]);

    if (!task || !field) {
      throw new Error('Task or field not found');
    }

    return this.tasksRepository.upsertFieldValue({
      ...validatedInput,
      tenantId,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Create saved view
   */
  async createSavedView(tenantId: string, input: CreateSavedViewInput) {
    const validatedInput = CreateSavedViewSchema.parse(input);
    
    return this.tasksRepository.createSavedView({
      ...validatedInput,
      tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}