'use client'
import React from 'react'
export default function SearchButton(){
  return (
    <button onClick={()=>document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            className='h-9 px-3 rounded-full bg-bg-2 border border-border text-sm text-text-muted'>
      Search… <span className='ml-2 text-xs opacity-70'>⌘K</span>
    </button>
  )
}
