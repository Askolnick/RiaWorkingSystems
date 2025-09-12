'use client'
export default function ThreadView({ messages }:{ messages:any[] }){
  return <div className="grid gap-2">
    {messages.map(m=>(
      <div key={m.id} className={`rounded p-2 border ${m.direction==='out'?'bg-white':'bg-gray-50'}`}>
        <div className="text-xs opacity-70">{m.source} • {new Date(m.sentAt).toLocaleString()}</div>
        <div className="whitespace-pre-wrap">{m.bodyText}</div>
      </div>
    ))}
  </div>
}
