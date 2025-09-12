export type Json = Record<string, any>
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path.startsWith('/api') ? path : `/api${path}`, {
    headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': 'demo-tenant', ...(init?.headers||{}) },
    ...init
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<T>
}
export function idempotencyHeaders(){
  const key = (typeof crypto!=='undefined' && 'randomUUID' in crypto) ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  return { 'Idempotency-Key': key }
}
