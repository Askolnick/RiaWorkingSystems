import { Injectable } from '@nestjs/common'
import { Repo } from './tasks.repo'
import { TaskCreateInput, TaskUpdateInput } from './dto'
@Injectable()
export class TasksService {
  constructor(private repo: Repo) {}
  list(tenantId: string, q: Record<string, any>) { return this.repo.listTasks(tenantId, q) }
  create(tenantId: string, input: TaskCreateInput) { return this.repo.createTask(tenantId, input) }
  update(tenantId: string, id: string, input: TaskUpdateInput) { return this.repo.updateTask(tenantId, id, input) }
}