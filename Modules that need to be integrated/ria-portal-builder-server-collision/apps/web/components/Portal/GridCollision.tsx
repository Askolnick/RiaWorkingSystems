'use client'
import * as React from 'react'
import type { WidgetInstance } from '../../types/widgets'

type Props = {
  cols: number
  rowHeight: number
  gap: number
  items: WidgetInstance[]
  onItemsChange: (items: WidgetInstance[]) => void
  renderItem: (it: WidgetInstance) => React.ReactNode
  onRemove?: (id: string) => void
}

function clone<T>(v:T):T{ return JSON.parse(JSON.stringify(v)) }

function collide(a:WidgetInstance, b:WidgetInstance){
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y)
}

function resolveCollisions(items: WidgetInstance[], movedId: string, cols:number){
  // Simple strategy: if an item overlaps others, push it down until no overlaps,
  // then compact grid by moving items up where possible.
  const list = items.slice().sort((a,b)=> a.y - b.y || a.x - b.x)
  const moved = list.find(i=>i.id===movedId)!
  // push-down phase
  let changed = true
  while (changed){
    changed = false
    for (const it of list){
      if (it.id===moved.id) continue
      if (collide(moved, it)){
        moved.y = it.y + it.h
        changed = true
      }
    }
  }
  // boundary clamp
  moved.x = Math.max(0, Math.min(cols - moved.w, moved.x))
  if (moved.x + moved.w > cols) moved.x = Math.max(0, cols - moved.w)

  // compaction: for each item (by columns), bubble upward as far as possible without collisions
  for (const it of list){
    let targetY = it.y
    while (targetY > 0){
      const candidate = { ...it, y: targetY - 1 }
      if (list.filter(x=>x.id!==it.id).some(x=>collide(candidate, x))) break
      targetY--
    }
    it.y = targetY
  }
  return list
}

export default function GridCollision({ cols, rowHeight, gap, items, onItemsChange, renderItem, onRemove }: Props){
  const containerRef = React.useRef<HTMLDivElement>(null)

  function cellWidth(){
    const el = containerRef.current
    if(!el) return 100
    const totalGap = gap * (cols - 1)
    const cw = (el.clientWidth - totalGap) / cols
    return Math.floor(cw)
  }
  function snap(px:number, unit:number){ return Math.max(0, Math.round(px / unit)) }

  function pxX(x:number){ return x * (cellWidth()+gap) }
  function pxY(y:number){ return y * (rowHeight+gap) }
  function pxW(w:number){ return w * cellWidth() + (w-1)*gap }
  function pxH(h:number){ return h * rowHeight + (h-1)*gap }

  function move(id:string, nx:number, ny:number){
    const next = clone(items)
    const it = next.find(i=>i.id===id)!
    it.x = nx; it.y = ny
    onItemsChange(resolveCollisions(next, id, cols))
  }
  function resize(id:string, nw:number, nh:number){
    const next = clone(items)
    const it = next.find(i=>i.id===id)!
    it.w = Math.max(1, Math.min(cols, nw))
    it.h = Math.max(1, nh)
    onItemsChange(resolveCollisions(next, id, cols))
  }

  function onDragStart(e: React.PointerEvent, id: string){
    const target = (e.currentTarget as HTMLElement)
    const rect = target.getBoundingClientRect()
    const start = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    function onMoveEvt(ev: PointerEvent){
      const cont = containerRef.current!.getBoundingClientRect()
      const left = ev.clientX - cont.left - start.x
      const top = ev.clientY - cont.top - start.y
      const nx = snap(left, cellWidth()+gap)
      const ny = snap(top, rowHeight+gap)
      move(id, nx, ny)
    }
    function onUp(){
      window.removeEventListener('pointermove', onMoveEvt)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMoveEvt)
    window.addEventListener('pointerup', onUp, { once: true })
  }

  function onResizeStart(e: React.PointerEvent, id: string){
    e.stopPropagation()
    const start = { x: e.clientX, y: e.clientY }
    function onMoveEvt(ev: PointerEvent){
      const dx = ev.clientX - start.x
      const dy = ev.clientY - start.y
      const dw = Math.round(dx / (cellWidth()+gap))
      const dh = Math.round(dy / (rowHeight+gap))
      const it = items.find(i=>i.id===id)!
      resize(id, it.w + dw, it.h + dh)
    }
    function onUp(){
      window.removeEventListener('pointermove', onMoveEvt)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMoveEvt)
    window.addEventListener('pointerup', onUp, { once: true })
  }

  function onKey(e: React.KeyboardEvent, id: string){
    let dx=0, dy=0, rw=0, rh=0
    if (e.key==='ArrowLeft') (e.shiftKey ? rw=-1 : dx=-1)
    if (e.key==='ArrowRight')(e.shiftKey ? rw=+1 : dx=+1)
    if (e.key==='ArrowUp')  (e.shiftKey ? rh=-1 : dy=-1)
    if (e.key==='ArrowDown')(e.shiftKey ? rh=+1 : dy=+1)
    if (dx||dy){ e.preventDefault(); const it = items.find(i=>i.id===id)!; move(id, Math.max(0,it.x+dx), Math.max(0,it.y+dy)) }
    if (rw||rh){ e.preventDefault(); const it = items.find(i=>i.id===id)!; resize(id, it.w+rw, it.h+rh) }
  }

  return (
    <div ref={containerRef} className='relative w-full' style={{ minHeight: 400 }}>
      <div className='absolute inset-0 pointer-events-none' style={{
        backgroundSize: `${cellWidth()+gap}px ${rowHeight+gap}px`,
        backgroundImage: `linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)`,
        opacity: .25
      }}/>
      {items.map(it=>(
        <div key={it.id}
             role='group'
             tabIndex={0}
             onKeyDown={(e)=>onKey(e,it.id)}
             onPointerDown={(e)=>onDragStart(e,it.id)}
             className='absolute rounded-xl bg-bg-1 border border-border shadow-1 overflow-hidden select-none'
             style={{ left: pxX(it.x), top: pxY(it.y), width: pxW(it.w), height: pxH(it.h) }}>
          <div className='h-9 px-3 flex items-center justify-between bg-bg-2 border-b border-border cursor-grab'>
            <div className='text-sm font-medium'>Widget</div>
            {onRemove && <button onClick={(e)=>{e.stopPropagation(); onRemove(it.id)}} className='text-xs rounded-full border border-border px-2 h-7'>Remove</button>}
          </div>
          <div className='p-2 h-[calc(100%-2.25rem)] overflow-auto'>
            {renderItem(it)}
          </div>
          <div onPointerDown={(e)=>onResizeStart(e,it.id)} className='absolute right-1 bottom-1 w-4 h-4 rounded-sm border border-border bg-bg-2 cursor-nwse-resize'/>
        </div>
      ))}
    </div>
  )
}
