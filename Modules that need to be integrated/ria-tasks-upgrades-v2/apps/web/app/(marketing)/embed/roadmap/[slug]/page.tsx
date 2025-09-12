export default async function Page({ params }:{ params:{ slug:string } }){
  const base = process.env.NEXT_PUBLIC_API_BASE ?? ''
  const res = await fetch(`${base}/api/roadmap/${params.slug}`, { cache: 'no-store' })
  const data = await res.json().catch(()=>({ title:'Roadmap', items:[] }))
  return (
    <main className='p-4'>
      <h2 className='text-lg font-semibold'>{data.title || `Roadmap ${params.slug}`}</h2>
      <p className='text-sm text-text-muted'>Embeddable view — place this in iframes.</p>
    </main>
  )
}