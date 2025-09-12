'use client'
import * as React from 'react'

type Entity = 'tasks'|'messages'|'contacts'|'invoices'|'expenses'|'wiki'
type Viz = 'tile'|'list'|'chart'
type Filter = { field:string; op:string; value:any }

const ENTITY_FIELDS: Record<Entity, string[]> = {
  tasks: ['title','status','assignees','dueAt','priority','project'],
  messages: ['channel','from','to','status','receivedAt'],
  contacts: ['name','company','email','phone','tags'],
  invoices: ['number','status','totalCents','dueAt','customer'],
  expenses: ['vendor','amountCents','project','bookedAt'],
  wiki: ['title','updatedAt','author','tags']
}

const OPS = ['=','!=','contains','in','>','<']

export type DataQuery = {
  entity: Entity
  fields: string[]
  filters: Filter[]
  limit?: number
  viz: Viz
}

export function WidgetBuilder({ value, onChange, preview }:{ value?:any, onChange:(v:any)=>void, preview:(q:DataQuery)=>React.ReactNode }){
  const [entity, setEntity] = React.useState<Entity>(value?.query?.entity ?? 'tasks')
  const [fields, setFields] = React.useState<string[]>(value?.query?.fields ?? ['title','status'])
  const [filters, setFilters] = React.useState<Filter[]>(value?.query?.filters ?? [])
  const [viz, setViz] = React.useState<Viz>(value?.query?.viz ?? 'tile')
  const [limit, setLimit] = React.useState<number>(value?.query?.limit ?? 5)

  React.useEffect(()=>{
    onChange({ ...(value || {}), query: { entity, fields, filters, viz, limit } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, fields, filters, viz, limit])

  function toggleField(f:string){
    setFields(v => v.includes(f) ? v.filter(x=>x!==f) : [...v, f])
  }
  function addFilter(){
    setFilters(v => [...v, { field: ENTITY_FIELDS[entity][0], op: '=', value: '' }])
  }
  function setFilter(i:number, patch:Partial<Filter>){
    setFilters(v => v.map((f,idx)=> idx===i ? { ...f, ...patch } : f))
  }
  function removeFilter(i:number){ setFilters(v => v.filter((_,idx)=>idx!==i)) }

  const available = ENTITY_FIELDS[entity]

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-medium mb-1'>Entity</label>
          <select value={entity} onChange={e=>setEntity(e.target.value as Entity)} className='w-full h-10 rounded-lg bg-bg-2 border border-border px-3'>
            {Object.keys(ENTITY_FIELDS).map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium mb-1'>Fields</label>
          <div className='flex flex-wrap gap-2'>
            {available.map(f => (
              <button key={f} onClick={()=>toggleField(f)} className={'h-8 px-3 rounded-full border ' + (fields.includes(f) ? 'bg-theme text-white border-theme' : 'border-border')}>{f}</button>
            ))}
          </div>
        </div>

        <div>
          <div className='flex items-center justify-between mb-1'>
            <label className='text-sm font-medium'>Filters</label>
            <button onClick={addFilter} className='text-xs rounded-full border border-border h-7 px-2'>Add</button>
          </div>
          <div className='space-y-2'>
            {filters.map((f,i)=>(
              <div key={i} className='flex items-center gap-2'>
                <select value={f.field} onChange={e=>setFilter(i,{field:e.target.value})} className='h-9 rounded-lg bg-bg-2 border border-border px-2'>
                  {available.map(ff=><option key={ff} value={ff}>{ff}</option>)}
                </select>
                <select value={f.op} onChange={e=>setFilter(i,{op:e.target.value})} className='h-9 rounded-lg bg-bg-2 border border-border px-2'>
                  {OPS.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
                <input value={f.value} onChange={e=>setFilter(i,{value:e.target.value})} className='flex-1 h-9 rounded-lg bg-bg-2 border border-border px-2' placeholder='value'/>
                <button onClick={()=>removeFilter(i)} className='text-xs rounded-full border border-border h-7 px-2'>Remove</button>
              </div>
            ))}
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3'>
          <div>
            <label className='block text-sm font-medium mb-1'>Visualization</label>
            <select value={viz} onChange={e=>setViz(e.target.value as Viz)} className='w-full h-10 rounded-lg bg-bg-2 border border-border px-3'>
              <option value='tile'>Tile</option>
              <option value='list'>List</option>
              <option value='chart'>Chart</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Limit</label>
            <input type='number' value={limit} onChange={e=>setLimit(Math.max(1,Number(e.target.value)||5))} className='w-full h-10 rounded-lg bg-bg-2 border border-border px-3' />
          </div>
        </div>
      </div>

      <div className='rounded-2xl bg-bg-1 border border-border p-4'>
        <div className='text-sm text-text-muted mb-2'>Preview</div>
        {preview({ entity, fields, filters, viz, limit })}
      </div>
    </div>
  )
}
