// Replace with Prisma client. This is an in-memory demo.
import { Injectable } from '@nestjs/common'

type Widget = { id:string; key:string; x:number; y:number; w:number; h:number; props:any }
type Layout = { id:string; tenantId:string; userId:string; name:string; cols:number; rowHeight:number; gap:number; widgets:Widget[] }

@Injectable()
export class PortalRepo {
  private store = new Map<string, Layout>()
  private id(){ return Math.random().toString(36).slice(2) }

  async getLayout(tenantId:string, userId:string, name='default'): Promise<Layout> {
    const key = `${tenantId}:${userId}:${name}`
    let row = this.store.get(key)
    if (!row){
      row = { id: this.id(), tenantId, userId, name, cols:12, rowHeight:90, gap:8, widgets:[] }
      this.store.set(key, row)
    }
    return JSON.parse(JSON.stringify(row))
  }
  async saveLayout(input: Layout): Promise<Layout> {
    const key = `${input.tenantId}:${input.userId}:${input.name}`
    this.store.set(key, JSON.parse(JSON.stringify(input)))
    return input
  }
}
