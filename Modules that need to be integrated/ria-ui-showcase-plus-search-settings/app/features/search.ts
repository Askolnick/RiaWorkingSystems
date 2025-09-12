import { centers } from './registry'

export function search(q: string){
  const s = q.toLowerCase().trim()
  const rows: { title: string, path: string, href: string }[] = []
  for (const c of centers){
    const cMatch = c.name.toLowerCase().includes(s) || c.key.includes(s)
    if (cMatch){
      const first = c.features[0]
      const href = first?.routes?.[0]?.path ?? `/${c.key}/${first?.key || ''}`
      rows.push({ title: c.name, path: `/${c.key}`, href })
    }
    for (const f of c.features){
      const fMatch = (f.name.toLowerCase().includes(s) || f.key.includes(s))
      if (fMatch){
        const href = f.routes?.[0]?.path ?? `/${c.key}/${f.key}`
        rows.push({ title: `${c.name} • ${f.name}`, path: href, href })
      }
      for (const r of f.routes || []){
        if (r.name.toLowerCase().includes(s) || r.path.includes(s)){
          rows.push({ title: `${c.name} • ${f.name} • ${r.name}`, path: r.path, href: r.path })
        }
      }
    }
  }
  // de-duplicate by href
  const seen = new Set<string>()
  return rows.filter(r => (seen.has(r.href) ? false : (seen.add(r.href), true)))
}
