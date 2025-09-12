'use client'
import React, { useState } from 'react'
type Task={ id:string; title:string; status:string }
type Lane = 'todo'|'doing'|'blocked'|'done'
const lanes:Lane[]=['todo','doing','blocked','done']

export function KanbanDnD({initial}:{initial:Task[]}){
  const [items,setItems]=useState(initial)
  function onDragStart(e:React.DragEvent, id:string){ e.dataTransfer.setData('text/plain', id) }
  function onDrop(e:React.DragEvent, lane:Lane){
    const id=e.dataTransfer.getData('text/plain')
    setItems(prev=>prev.map(t=>t.id===id?{...t,status:lane}:t))
    // TODO: call PATCH /tasks/:id with new status + optimistic update
  }
  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
      {lanes.map(lane=>(
        <div key={lane} onDragOver={e=>e.preventDefault()} onDrop={e=>onDrop(e,lane)} className='p-3 rounded-lg bg-bg-1 border border-border min-h-[200px]'>
          <div className='font-semibold capitalize mb-2'>{lane}</div>
          {items.filter(t=>t.status===lane).map(t=>(
            <div key={t.id} draggable onDragStart={(e)=>onDragStart(e,t.id)} className='rounded-lg bg-bg-2 border border-border p-2 mb-2 cursor-grab'>{t.title}</div>
          ))}
        </div>
      ))}
    </div>
  )
}