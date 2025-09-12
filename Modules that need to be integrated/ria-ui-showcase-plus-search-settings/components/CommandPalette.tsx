'use client'
import React from 'react'
import Link from 'next/link'
import { search } from '../app/features/search'

export default function CommandPalette(){
  const [open, setOpen] = React.useState(false)
  const [q, setQ] = React.useState('')
  const list = q ? search(q).slice(0, 20) : []
  React.useEffect(()=>{
    function onKey(e: KeyboardEvent){
      const metaK = (e.key.toLowerCase() === 'k') && (e.metaKey || e.ctrlKey)
      if (metaK){ e.preventDefault(); setOpen(v=>!v) }
      if (e.key === 'Escape'){ setOpen(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!open) return null
  return (
    <div className='fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-start justify-center p-10'>
      <div className='w-full max-w-2xl rounded-2xl bg-bg-1 border border-border shadow-3 overflow-hidden'>
        <div className='p-3 border-b border-border flex items-center gap-2'>
          <span className='text-sm text-text-muted'>Search</span>
          <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder='Search centers, features, routes…'
                 className='flex-1 h-10 rounded-lg bg-bg-2 border border-border px-3 outline-none'/>
          <kbd className='text-xs px-1.5 py-0.5 rounded bg-bg-2 border border-border'>Esc</kbd>
        </div>
        <div className='max-h-[60vh] overflow-auto'>
          {list.length === 0 ? <div className='p-6 text-sm text-text-muted'>Type to search. Tip: ⌘K / Ctrl+K</div> : (
            <ul className='divide-y divide-border'>
              {list.map(item=> (
                <li key={item.href} className='hover:bg-bg-2'>
                  <Link className='flex items-center justify-between px-4 py-3' href={item.href} onClick={()=>setOpen(false)}>
                    <div>
                      <div className='font-medium'>{item.title}</div>
                      <div className='text-xs text-text-muted'>{item.path}</div>
                    </div>
                    <span className='text-xs px-2 py-0.5 rounded-full bg-inactive'>Go</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
