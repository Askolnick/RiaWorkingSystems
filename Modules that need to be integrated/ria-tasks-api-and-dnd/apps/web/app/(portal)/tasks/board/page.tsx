'use client'
import { KanbanDnD } from '../../../../components/tasks/KanbanDnD'
export default function Page(){
  const tasks=[
    {id:'1',title:'Design login page',status:'todo'},
    {id:'2',title:'Implement auth',status:'doing'},
    {id:'3',title:'Fix upload bug',status:'blocked'},
    {id:'4',title:'Ship v0',status:'done'},
  ]
  return <main className='p-6 space-y-4'><h1 className='text-2xl font-semibold'>Board</h1><KanbanDnD initial={tasks}/></main>
}