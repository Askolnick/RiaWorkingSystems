'use client'
import React from 'react'
import { PrefsCtx } from '../../providers/prefs'

export default function Settings(){
  const { prefs, setPrefs } = React.useContext(PrefsCtx)
  return (
    <main className='space-y-8'>
      <header className='space-y-1'>
        <h1 className='text-2xl font-semibold'>Settings</h1>
        <p className='text-text-muted'>Theme, typography, and appearance. Changes are saved locally.</p>
      </header>

      <section className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='rounded-2xl bg-bg-1 border border-border p-4 space-y-3'>
          <h2 className='font-medium'>Mode</h2>
          <div className='flex gap-3'>
            <button onClick={()=>setPrefs({ mode:'light' })} className={'h-10 px-4 rounded-full border ' + (prefs.mode==='light' ? 'bg-theme text-white border-theme' : 'border-border')}>Light</button>
            <button onClick={()=>setPrefs({ mode:'dark' })} className={'h-10 px-4 rounded-full border ' + (prefs.mode==='dark' ? 'bg-theme text-white border-theme' : 'border-border')}>Dark</button>
          </div>
        </div>

        <div className='rounded-2xl bg-bg-1 border border-border p-4 space-y-3'>
          <h2 className='font-medium'>Theme color</h2>
          <label className='text-sm text-text-muted'>Hue: {prefs.themeHue}</label>
          <input type='range' min={0} max={360} value={prefs.themeHue} onChange={e=>setPrefs({ themeHue: Number(e.target.value) })} className='w-full'/>
          <label className='text-sm text-text-muted'>Saturation: {prefs.themeSat}%</label>
          <input type='range' min={20} max={100} value={prefs.themeSat} onChange={e=>setPrefs({ themeSat: Number(e.target.value) })} className='w-full'/>
        </div>

        <div className='rounded-2xl bg-bg-1 border border-border p-4 space-y-3'>
          <h2 className='font-medium'>Typography</h2>
          <label className='text-sm text-text-muted'>Font scale: {prefs.fontScale.toFixed(2)}×</label>
          <input type='range' min={0.8} max={1.4} step={0.05} value={prefs.fontScale} onChange={e=>setPrefs({ fontScale: Number(e.target.value) })} className='w-full'/>
          <p className='text-sm' style={{ fontSize: `${prefs.fontScale}rem` }}>Preview text • The quick brown fox jumps over the lazy dog.</p>
        </div>

        <div className='rounded-2xl bg-bg-1 border border-border p-4 space-y-3'>
          <h2 className='font-medium'>Status & tokens</h2>
          <div className='grid grid-cols-4 gap-3'>
            <div className='h-12 rounded-xl bg-theme'></div>
            <div className='h-12 rounded-xl bg-secondary'></div>
            <div className='h-12 rounded-xl bg-inactive'></div>
            <div className='h-12 rounded-xl bg-attention'></div>
          </div>
          <p className='text-xs text-text-muted'>Tokens reflect your selections. (Secondary/inactive derive from theme & mode.)</p>
        </div>
      </section>
    </main>
  )
}
