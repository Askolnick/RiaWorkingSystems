import { 
  TasksService, 
  CreateTaskInput, 
  UpdateTaskInput,
  CreateDependencyInput,
  CreateCustomFieldInput,
  UpsertFieldValueInput,
  CreateSavedViewInput 
} from './tasks.service';

/**
 * Tasks Controller - HTTP API layer
 * This controller provides RESTful endpoints for task management.
 * It follows the clean architecture pattern by delegating business logic to the service layer.
 * 
 * Note: This is a framework-agnostic controller that can be adapted for NestJS, Express, or other frameworks.
 * The actual framework integration happens in the main API application.
 */
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * GET /tasks - List tasks with optional filtering
   */
  async listTasks(tenantId: string, query: Record<string, any>) {
    return this.tasksService.listTasks(tenantId, query);
  }

  /**
   * POST /tasks - Create a new task
   */
  async createTask(tenantId: string, input: CreateTaskInput) {
    return this.tasksService.createTask(tenantId, input);
  }

  /**
   * PATCH /tasks/:id - Update a task
   */
  async updateTask(tenantId: string, id: string, input: UpdateTaskInput) {
    return this.tasksService.updateTask(tenantId, id, input);
  }

  /**
   * DELETE /tasks/:id - Delete a task
   */
  async deleteTask(tenantId: string, id: string) {
    return this.tasksService.deleteTask(tenantId, id);
  }

  /**
   * POST /tasks/:id/reorder - Reorder a task by updating its rank
   */
  async reorderTask(
    tenantId: string, 
    id: string, 
    body: { beforeTaskId?: string; afterTaskId?: string }
  ) {
    return this.tasksService.reorderTask(
      tenantId, 
      id, 
      body.beforeTaskId, 
      body.afterTaskId
    );
  }

  /**
   * GET /tasks/:id/dependencies - Get task with its dependencies
   */
  async getTaskWithDependencies(tenantId: string, id: string) {
    return this.tasksService.getTaskWithDependencies(tenantId, id);
  }

  /**
   * POST /tasks/dependencies - Create a task dependency
   */
  async createDependency(tenantId: string, input: CreateDependencyInput) {
    return this.tasksService.createDependency(tenantId, input);
  }

  /**
   * POST /tasks/custom-fields - Create a custom field
   */
  async createCustomField(tenantId: string, input: CreateCustomFieldInput) {
    return this.tasksService.createCustomField(tenantId, input);
  }

  /**
   * POST /tasks/field-values - Set custom field value for a task
   */
  async upsertFieldValue(tenantId: string, input: UpsertFieldValueInput) {
    return this.tasksService.upsertFieldValue(tenantId, input);
  }

  /**
   * POST /tasks/saved-views - Create a saved view
   */
  async createSavedView(tenantId: string, input: CreateSavedViewInput) {
    return this.tasksService.createSavedView(tenantId, input);
  }
}

// Utility function to extract tenant ID from request headers
export function extractTenantId(headers: Record<string, any>): string {
  return headers['x-tenant-id'] || 'demo-tenant';
}

// Export types for use in the main API application
export type { 
  CreateTaskInput,
  UpdateTaskInput, 
  CreateDependencyInput,
  CreateCustomFieldInput,
  UpsertFieldValueInput,
  CreateSavedViewInput 
};