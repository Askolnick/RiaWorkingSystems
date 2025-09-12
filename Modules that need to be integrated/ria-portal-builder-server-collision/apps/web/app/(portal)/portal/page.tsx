'use client'
import * as React from 'react'
import Grid from '../../../components/Portal/GridCollision'
import { WidgetRegistry } from '../../../widgets/registry'
import type { WidgetInstance } from '../../../types/widgets'
import { getLayout, saveLayout } from '../../../lib/portal.api'
import { WidgetBuilder } from '../../../components/Portal/WidgetBuilder'

function uid(){ return Math.random().toString(36).slice(2) }

export default function Portal(){
  const [name] = React.useState('default')
  const [cols, setCols] = React.useState(12)
  const [rowHeight, setRowHeight] = React.useState(90)
  const [gap, setGap] = React.useState(8)
  const [items, setItems] = React.useState<WidgetInstance[]>([])
  const [showAdd, setShowAdd] = React.useState(false)
  const [selKey, setSelKey] = React.useState<string>('inbox-count')
  const [cfg, setCfg] = React.useState<any>({})

  React.useEffect(()=>{
    getLayout(name).then(l=>{ setCols(l.cols); setRowHeight(l.rowHeight); setGap(l.gap); setItems(l.widgets) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])

  // Debounced save
  React.useEffect(()=>{
    const t = setTimeout(()=>{
      saveLayout({ id:'local', tenantId:'demo-tenant', userId:'demo-user', name, cols, rowHeight, gap, widgets: items })
    }, 400)
    return ()=>clearTimeout(t)
  }, [name, cols, rowHeight, gap, items])

  function renderItem(it: WidgetInstance){
    const def = WidgetRegistry[it.key]
    if (!def) return <div className='text-sm text-text-muted'>Unknown widget {it.key}</div>
    // Basic renderer; when using builder, pass `it.props.query` to fetch/visualize
    return <def.Render {...(it.props||{})} />
  }

  function onAdd(){
    const def = WidgetRegistry[selKey]
    const w = def?.defaultW || def?.minW || 3
    const h = def?.defaultH || def?.minH || 2
    setItems(prev => [...prev, { id: uid(), key: selKey, x: 0, y: 0, w, h, props: cfg }])
    setShowAdd(false); setCfg({})
  }

  function preview(q:any){
    return <div className='text-sm text-text-muted'>Previewing {q.entity} • fields: {q.fields.join(', ')} • viz: {q.viz} • limit {q.limit}</div>
  }

  return (
    <main className='space-y-6'>
      <header className='flex flex-wrap items-center gap-3 justify-between'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-semibold'>Your Dashboard</h1>
          <p className='text-text-muted text-sm'>Drag to move, drag corner to resize. Shift + arrow keys resize; arrows move.</p>
        </div>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2'><label className='text-sm text-text-muted'>Cols</label><input type='number' value={cols} onChange={e=>setCols(Math.max(4,Number(e.target.value)||12))} className='w-16 h-9 rounded-lg bg-bg-1 border border-border px-2'/></div>
          <div className='flex items-center gap-2'><label className='text-sm text-text-muted'>Row</label><input type='number' value={rowHeight} onChange={e=>setRowHeight(Math.max(60,Number(e.target.value)||90))} className='w-16 h-9 rounded-lg bg-bg-1 border border-border px-2'/></div>
          <div className='flex items-center gap-2'><label className='text-sm text-text-muted'>Gap</label><input type='number' value={gap} onChange={e=>setGap(Math.max(0,Number(e.target.value)||8))} className='w-16 h-9 rounded-lg bg-bg-1 border border-border px-2'/></div>
          <button onClick={()=>setShowAdd(true)} className='rounded-full bg-theme text-white h-10 px-4'>Add Widget</button>
        </div>
      </header>

      <Grid cols={cols}
            rowHeight={rowHeight}
            gap={gap}
            items={items}
            onItemsChange={setItems}
            renderItem={renderItem}
      />

      {showAdd && (
        <div className='fixed inset-0 z-50 bg-black/30 backdrop-blur-sm grid place-items-center p-6'>
          <div className='w-full max-w-3xl rounded-2xl bg-bg-1 border border-border shadow-3 overflow-hidden'>
            <div className='p-4 border-b border-border flex items-center justify-between'>
              <div className='font-medium'>Add Widget</div>
              <button onClick={()=>setShowAdd(false)} className='text-xs rounded-full border border-border h-8 px-2'>Close</button>
            </div>

            <div className='p-4 grid grid-cols-1 md:grid-cols-3 gap-4'>
              {Object.keys(WidgetRegistry).map(key=>(
                <label key={key} className={'rounded-xl border p-3 cursor-pointer ' + (selKey===key ? 'border-theme' : 'border-border')}>
                  <input type='radio' name='w' value={key} className='hidden' checked={selKey===key} onChange={()=>setSelKey(key)} />
                  <div className='font-medium text-sm'>{WidgetRegistry[key].name}</div>
                  <div className='text-xs text-text-muted'>{WidgetRegistry[key].description}</div>
                </label>
              ))}
            </div>

            <div className='p-4 border-t border-border space-y-4'>
              <div className='font-medium'>Builder</div>
              <WidgetBuilder value={cfg} onChange={setCfg} preview={preview} />
              <div className='flex justify-end'><button onClick={onAdd} className='rounded-full bg-theme text-white h-10 px-4'>Add</button></div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
