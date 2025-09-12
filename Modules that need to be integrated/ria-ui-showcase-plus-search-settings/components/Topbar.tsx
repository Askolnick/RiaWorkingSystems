'use client'
import React from 'react'
import ThemeToggle from './ThemeToggle'
import SearchButton from './SearchButton'
import CommandPalette from './CommandPalette'
import { PrefsProvider } from '../app/providers/prefs'

export default function Topbar(){
  return (
    <PrefsProvider>
      <header className='h-14 flex items-center justify-between px-4 border-b border-border bg-bg-1'>
        <div className='text-sm text-text-muted'>Admin-only preview</div>
        <div className='flex items-center gap-3'>
          <SearchButton/>
          <ThemeToggle/>
        </div>
      </header>
      <CommandPalette/>
    </PrefsProvider>
  )
}
