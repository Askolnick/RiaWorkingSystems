export default async function Page({ params }:{ params:{ slug:string } }){
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE ?? ''}/api/roadmap/${params.slug}`, { cache: 'no-store' })
  const data = await res.json().catch(()=>({ title:'Roadmap', items:[] }))
  return <main className='prose mx-auto p-10'><h1>{data.title || `Roadmap ${params.slug}`}</h1><p>Public roadmap. Log in to comment.</p></main>
}