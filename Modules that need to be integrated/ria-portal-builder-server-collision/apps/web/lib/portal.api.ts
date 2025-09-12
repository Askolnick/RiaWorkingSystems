export type Layout = { id:string; tenantId:string; userId:string; name:string; cols:number; rowHeight:number; gap:number; widgets:any[] }
async function j<T>(r:Response){ if(!r.ok) throw new Error('HTTP '+r.status); return r.json() as Promise<T> }
export async function getLayout(name='default'){ const r = await fetch(`/api/portal/layout?name=${encodeURIComponent(name)}`,{cache:'no-store'}); return j<Layout>(r) }
export async function saveLayout(layout: Layout){ await fetch('/api/portal/layout',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(layout) }) }
