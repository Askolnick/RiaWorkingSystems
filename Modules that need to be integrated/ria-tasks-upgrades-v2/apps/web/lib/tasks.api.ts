import { api, idempotencyHeaders } from './api'
export type Task = { id: string; title: string; status: 'todo'|'doing'|'blocked'|'done'|'archived'; priority: number; tags: string[]; rank?: string }
export async function listTasks(): Promise<Task[]>{ return api<Task[]>('/tasks') }
export async function updateTask(id: string, patch: Partial<Task>): Promise<Task>{ return api<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(patch), headers: idempotencyHeaders() }) }
export async function createTask(input: Partial<Task>): Promise<Task>{ return api<Task>('/tasks', { method: 'POST', body: JSON.stringify(input), headers: idempotencyHeaders() }) }
