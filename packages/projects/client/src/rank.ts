// Minimal lexo-like rank between two strings for task ordering
const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

export function generateRankBetween(a?: string, b?: string): string {
  if (!a && !b) return 'U' // middle
  if (!a) return decrementRank(b!)
  if (!b) return incrementRank(a!)
  
  let i = 0
  let prefix = ''
  
  while (true) {
    const ca = i < a.length ? a[i] : '0'
    const cb = i < b.length ? b[i] : 'z'
    
    if (ca === cb) {
      prefix += ca
      i++
      continue
    }
    
    const ai = CHARS.indexOf(ca)
    const bi = CHARS.indexOf(cb)
    
    if (bi - ai > 1) {
      const ci = Math.floor((ai + bi) / 2)
      return prefix + CHARS[ci]
    }
    
    prefix += ca
    i++
  }
}

function incrementRank(rank: string): string {
  const lastIndex = CHARS.indexOf(rank[rank.length - 1])
  return rank.slice(0, -1) + CHARS[Math.min(lastIndex + 1, CHARS.length - 1)]
}

function decrementRank(rank: string): string {
  const firstIndex = CHARS.indexOf(rank[0])
  return CHARS[Math.max(firstIndex - 1, 0)] + rank.slice(1)
}