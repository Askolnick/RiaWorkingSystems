'use client'
import Link from 'next/link'

export default function MessagingSettings(){
  return <main className="p-4 grid gap-3">
    <h1 className="text-2xl font-bold">Messaging Settings</h1>
    <div className="grid gap-2">
      <Link href="#" className="text-blue-600 underline">Connect email (placeholder)</Link>
      <Link href="#" className="text-blue-600 underline">Connect Slack (placeholder)</Link>
      <Link href="#" className="text-blue-600 underline">Connect social (placeholder)</Link>
    </div>
    <div className="text-sm opacity-70">These are stubs. Wire them to your OAuth flows later.</div>
  </main>
}
