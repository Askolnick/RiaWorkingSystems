'use client'
import React from 'react'

export type Prefs = {
  themeHue: number         // 0..360
  themeSat: number         // 0..100
  fontScale: number        // 0.8..1.4
  mode: 'light'|'dark'
}

const DEFAULT: Prefs = { themeHue: 210, themeSat: 70, fontScale: 1.0, mode: 'light' }

function applyToDOM(p: Prefs){
  const r = document.documentElement
  r.style.setProperty('--theme-h', String(p.themeHue))
  r.style.setProperty('--theme-s', p.themeSat + '%')
  r.style.setProperty('--theme-l', '45%')
  r.style.setProperty('--font-scale', String(p.fontScale))
  r.classList.toggle('mode-dark', p.mode === 'dark')
}

export const PrefsCtx = React.createContext<{ prefs: Prefs, setPrefs: (p: Partial<Prefs>)=>void }>({
  prefs: DEFAULT, setPrefs(){}
})

export function PrefsProvider({ children }: { children: React.ReactNode }){
  const [prefs, set] = React.useState<Prefs>(()=>{
    if (typeof window === 'undefined') return DEFAULT
    try {
      const raw = localStorage.getItem('ria:prefs')
      return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT
    } catch { return DEFAULT }
  })

  React.useEffect(()=>{ applyToDOM(prefs) }, [])
  React.useEffect(()=>{
    applyToDOM(prefs)
    try { localStorage.setItem('ria:prefs', JSON.stringify(prefs)) } catch {}
  }, [prefs])

  const setPrefs = (patch: Partial<Prefs>) => set(prev => ({ ...prev, ...patch }))
  return <PrefsCtx.Provider value={{ prefs, setPrefs }}>{children}</PrefsCtx.Provider>
}
