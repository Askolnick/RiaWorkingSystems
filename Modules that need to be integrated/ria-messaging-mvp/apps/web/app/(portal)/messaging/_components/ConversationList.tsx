'use client'
import Link from 'next/link'

export default function ConversationList({ items }:{ items:any[] }){
  if(!items?.length) return <div className="text-gray-500">No conversations.</div>
  return <div className="grid">
    {items.map(c=>(
      <Link key={c.id} href={`/portal/messaging/${c.id}`} className="border-b p-3 hover:bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase bg-gray-100 px-2 py-1 rounded">{c.kind}</span>
          <strong className="truncate">{c.subject || '(no subject)'}</strong>
          <span className="ml-auto text-xs opacity-70">{c.status}</span>
        </div>
        <div className="text-xs opacity-70 mt-1">{(c.tags||[]).map((t:string)=>(<span key={t} className="mr-1">#{t}</span>))}</div>
      </Link>
    ))}
  </div>
}
