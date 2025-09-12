'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createMockMessaging } from '@ria/messaging-client'
import ThreadView from '../_components/ThreadView'
import Composer from '../_components/Composer'

const api = createMockMessaging()

export default function ConversationView(){
  const { id } = useParams() as { id: string }
  const r = useRouter()
  const [convo,setConvo]=useState<any>(null)
  const [msgs,setMsgs]=useState<any[]>([])

  async function load(){
    const { convo, messages } = await api.getConversation(id)
    setConvo(convo); setMsgs(messages)
  }
  useEffect(()=>{ load() },[id])

  async function onSend(data:{bodyText:string; as:'email'|'chat'}){
    await api.postMessage(id, data); await load()
  }

  if(!convo) return <main className="p-4">Loading…</main>

  return <main className="p-4 grid gap-3">
    <div className="flex items-center gap-2">
      <button className="px-3 py-2 border rounded" onClick={()=>r.back()}>Back</button>
      <h1 className="text-xl font-bold">{convo.subject || '(no subject)'}</h1>
      <span className="text-xs uppercase bg-gray-100 px-2 py-1 rounded">{convo.kind}</span>
      <span className="ml-auto text-xs opacity-70">{convo.status}</span>
    </div>
    <div className="border rounded p-3">
      <ThreadView messages={msgs} />
    </div>
    <div className="border rounded p-3">
      <Composer onSend={onSend} />
    </div>
  </main>
}
