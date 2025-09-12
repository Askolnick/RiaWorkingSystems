'use client'
import React from 'react'
import { useTasksQuery, useUpdateTaskOptimistic } from '../../hooks/useTasksQuery'
import { mid } from '../../lib/rank'

type Lane = 'todo'|'doing'|'blocked'|'done'
const LANES:Lane[] = ['todo','doing','blocked','done']

export function KanbanPersisted(){
  const { data = [], isLoading } = useTasksQuery()
  const update = useUpdateTaskOptimistic()
  if (isLoading) return <div className='p-6'>Loading…</div>

  const grouped = Object.fromEntries(LANES.map(l=>[l, data.filter(t=>t.status===l).sort((a,b)=>(a.rank||'').localeCompare(b.rank||''))]))
  function onDragStart(e:React.DragEvent, id:string){ e.dataTransfer.setData('text/plain', id) }
  function onDrop(e:React.DragEvent, lane:Lane, afterId?:string){
    const id = e.dataTransfer.getData('text/plain')
    const items = grouped[lane]
    const idx = afterId ? items.findIndex(x=>x.id===afterId)+1 : items.length
    const beforeRank = idx>0 ? items[idx-1]?.rank : undefined
    const afterRank  = idx<items.length ? items[idx]?.rank : undefined
    const newRank = mid(beforeRank, afterRank)
    update.mutate({ id, patch: { status: lane, rank: newRank } })
  }
  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
      {LANES.map(lane=>{
        const items = grouped[lane]
        return (
          <div key={lane} onDragOver={e=>e.preventDefault()} onDrop={e=>onDrop(e,lane)} className='p-3 rounded-lg bg-bg-1 border border-border min-h-[240px]'>
            <div className='font-semibold capitalize mb-2'>{lane}</div>
            {items.map((t,i)=>(
              <div key={t.id} draggable onDragStart={e=>onDragStart(e,t.id)} onDrop={e=>onDrop(e,lane, items[i-1]?.id)}
                   className='rounded-lg bg-bg-2 border border-border p-2 mb-2 cursor-grab'>
                <div className='text-sm'>{t.title}</div>
                <div className='text-xs text-text-muted'>{t.rank || '—'}</div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
