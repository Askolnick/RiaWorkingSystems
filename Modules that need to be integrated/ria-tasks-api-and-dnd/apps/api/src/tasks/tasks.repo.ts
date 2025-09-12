// Repo layer (adapters). Replace with real Prisma Client usage.
import { Injectable } from '@nestjs/common'

export type Task = {
  id: string; tenantId: string; projectId?: string|null; title: string;
  status: 'todo'|'doing'|'blocked'|'done'|'archived'; type: 'task'|'bug'|'feature';
  dueAt?: string|null; priority: number; points?: number|null; tags: string[]
}
@Injectable()
export class Repo {
  // These are placeholders. Wire to Prisma client and remove in-memory parts.
  private tasks: Task[] = []
  async listTasks(tenantId: string, q: Record<string, any>): Promise<Task[]> {
    return this.tasks.filter(t => t.tenantId === tenantId)
  }
  async createTask(tenantId: string, data: Partial<Task>): Promise<Task> {
    const t: Task = Object.assign({
      id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
      tenantId, status: 'todo', type: 'task', priority: 0, tags: []
    }, data) as Task
    this.tasks.push(t); return t
  }
  async updateTask(tenantId: string, id: string, patch: Partial<Task>): Promise<Task> {
    const i = this.tasks.findIndex(x => x.id === id && x.tenantId === tenantId)
    if (i < 0) throw new Error('Not found')
    this.tasks[i] = { ...this.tasks[i], ...patch }
    return this.tasks[i]
  }
  async reorderTask(): Promise<void> { /* store order in SavedView.layout or a rank column */ }
}