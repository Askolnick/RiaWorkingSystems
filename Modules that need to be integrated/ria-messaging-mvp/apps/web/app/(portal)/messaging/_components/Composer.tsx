'use client'
import { useState } from 'react'
export default function Composer({ onSend }:{ onSend:(data:{bodyText:string; as:'email'|'chat'})=>Promise<void> }){
  const [mode,setMode]=useState<'email'|'chat'>('chat')
  const [text,setText]=useState('')
  return <div className="grid gap-2">
    <div className="flex items-center gap-2">
      <select className="border rounded p-2" value={mode} onChange={e=>setMode(e.target.value as any)}>
        <option value="chat">Chat</option>
        <option value="email">Email</option>
      </select>
      <button className="px-3 py-2 border rounded" onClick={()=>{ setText(prev=>prev + '\n{{template: greeting}}' )}}>Templates</button>
      <div className="text-xs opacity-70 ml-auto">Shift+Enter for newline</div>
    </div>
    <textarea className="border rounded p-2 h-32" value={text} onChange={e=>setText(e.target.value)} onKeyDown={(e)=>{
      if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); onSend({ bodyText: text.trim(), as: mode }).then(()=>setText('')) }
    }} placeholder="Type a reply…"/>
    <div className="flex justify-end">
      <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={()=>onSend({ bodyText:text.trim(), as: mode }).then(()=>setText(''))} disabled={!text.trim()}>Send</button>
    </div>
  </div>
}
