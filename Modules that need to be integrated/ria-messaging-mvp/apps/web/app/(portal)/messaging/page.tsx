'use client'
import { useEffect, useState } from 'react'
import { createMockMessaging } from '@ria/messaging-client'
import Sidebar from './_components/Sidebar'
import ConversationList from './_components/ConversationList'

const api = createMockMessaging()

export default function MessagingHome(){
  const [items,setItems]=useState<any[]>([])
  const [filter,setFilter]=useState<any>({})

  useEffect(()=>{ api.listConversations(filter).then(setItems) },[filter])

  return <main className="p-4 grid gap-4 md:grid-cols-[260px_1fr]">
    <Sidebar onFilter={setFilter} />
    <div className="border rounded overflow-hidden">
      <div className="p-2 border-b bg-gray-50 text-sm">Unified Inbox</div>
      <ConversationList items={items} />
    </div>
  </main>
}
