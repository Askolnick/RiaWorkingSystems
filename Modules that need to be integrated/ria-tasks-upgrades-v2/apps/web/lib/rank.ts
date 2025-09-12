// Minimal lexo-like rank between two strings
const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
export function mid(a?: string, b?: string){
  if (!a && !b) return 'U' // middle
  if (!a) return dec(b!)
  if (!b) return inc(a!)
  let i = 0, prefix = ''
  while (true){
    const ca = i < a.length ? a[i] : '0'
    const cb = i < b.length ? b[i] : 'z'
    if (ca === cb){ prefix += ca; i++; continue }
    const ai = CHARS.indexOf(ca); const bi = CHARS.indexOf(cb)
    if (bi - ai > 1){ const ci = Math.floor((ai + bi)/2); return prefix + CHARS[ci] }
    prefix += ca; i++
  }
}
export function inc(a: string){ const i = CHARS.indexOf(a[a.length-1]); return a.slice(0,-1) + CHARS[Math.min(i+1, CHARS.length-1)] }
export function dec(b: string){ const i = CHARS.indexOf(b[0]); return CHARS[Math.max(i-1,0)] + b.slice(1) }
