import { NextResponse } from 'next/server'

let mem:any = {}

export async function GET(req: Request){
  const url = new URL(req.url)
  const name = url.searchParams.get('name') ?? 'default'
  const tenantId = 'demo-tenant', userId = 'demo-user'
  const key = `${tenantId}:${userId}:${name}`
  if(!mem[key]) mem[key] = { id:'local', tenantId, userId, name, cols:12, rowHeight:90, gap:8, widgets:[] }
  return NextResponse.json(mem[key])
}

export async function POST(req: Request){
  const body = await req.json().catch(()=>({}))
  const name = body?.name ?? 'default'
  const tenantId = 'demo-tenant', userId = 'demo-user'
  const key = `${tenantId}:${userId}:${name}`
  mem[key] = { ...body, tenantId, userId, name }
  return NextResponse.json({ ok:true })
}
