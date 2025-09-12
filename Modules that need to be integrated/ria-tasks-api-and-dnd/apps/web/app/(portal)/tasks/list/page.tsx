'use client'
import { saveView } from '../../../../lib/saved-views'
export default function Page(){
  async function onSave(){ await saveView({ name:'My List', kind:'list', filters:{}, sort:{}, layout:{} }) }
  return <main className='p-6 space-y-4'><h1 className='text-2xl font-semibold'>List</h1><button onClick={onSave} className='rounded-full bg-theme text-white h-10 px-4'>Save view</button></main>
}