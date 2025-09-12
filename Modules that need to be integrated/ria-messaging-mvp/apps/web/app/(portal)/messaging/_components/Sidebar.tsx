'use client'
import { useEffect, useState } from 'react'
import { createMockMessaging } from '@ria/messaging-client'

const api = createMockMessaging()

export default function Sidebar({ onFilter }:{ onFilter:(f:{q?:string; status?:string; tag?:string})=>void }){
  const [inboxes, setInboxes] = useState<any[]>([])
  const [q,setQ]=useState(''); const [status,setStatus]=useState(''); const [tag,setTag]=useState('')

  useEffect(()=>{ api.listInboxes().then(setInboxes) },[])

  return <aside className="border rounded p-3 grid gap-3">
    <div className="grid gap-2">
      <input className="border rounded p-2" placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)} />
      <select className="border rounded p-2" value={status} onChange={e=>setStatus(e.target.value)}>
        <option value="">Any status</option>
        <option value="open">Open</option>
        <option value="snoozed">Snoozed</option>
        <option value="closed">Closed</option>
      </select>
      <input className="border rounded p-2" placeholder="Filter by tag…" value={tag} onChange={e=>setTag(e.target.value)} />
      <button className="px-3 py-2 border rounded" onClick={()=>onFilter({ q, status, tag })}>Apply</button>
    </div>
    <div>
      <div className="text-xs font-semibold mb-2">Inboxes</div>
      <ul className="grid gap-1">
        {inboxes.map((ib:any)=>(<li key={ib.id}><span className="text-sm">{ib.name}</span></li>))}
      </ul>
    </div>
  </aside>
}
