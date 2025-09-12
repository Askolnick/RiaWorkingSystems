'use client'
import React from 'react'
import { useSettings, useTheme } from '@ria/client'
import SecureStorageDemo from '../../_components/SecureStorageDemo'

export default function Settings(){
  const { settings, updateSettings, isLoading } = useSettings()
  const { theme, setTheme, customColors, setCustomColors, toggleTheme } = useTheme()

  if (isLoading) {
    return (
      <main className='space-y-8'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 bg-bg-1 rounded'></div>
          <div className='h-4 bg-bg-1 rounded w-2/3'></div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className='h-40 bg-bg-1 rounded-2xl'></div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className='space-y-8'>
      <header className='space-y-1'>
        <h1 className='text-2xl font-semibold'>Settings</h1>
        <p className='text-text-muted'>Theme, typography, accessibility, and module preferences. Changes are saved automatically.</p>
      </header>

      <section className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Theme Mode */}
        <div className='rounded-2xl bg-bg-1 border border-border p-4 space-y-3'>
          <h2 className='font-medium'>Theme Mode</h2>
          <div className='flex gap-3'>
            <button 
              onClick={() => setTheme('light')} 
              className={'h-10 px-4 rounded-full border ' + (theme === 'light' ? 'bg-theme text-white border-theme' : 'border-border')}
            >
              Light
            </button>
            <button 
              onClick={() => setTheme('dark')} 
              className={'h-10 px-4 rounded-full border ' + (theme === 'dark' ? 'bg-theme text-white border-theme' : 'border-border')}
            >
              Dark
            </button>
            <button 
              onClick={() => setTheme('system')} 
              className={'h-10 px-4 rounded-full border ' + (theme === 'system' ? 'bg-theme text-white border-theme' : 'border-border')}
            >
              System
            </button>
          </div>
        </div>

        {/* Custom Colors */}
        <div className='rounded-2xl bg-bg-1 border border-border p-4 space-y-3'>
          <h2 className='font-medium'>Theme Colors</h2>
          <div className='space-y-2'>
            <label className='text-sm text-text-muted'>Primary</label>
            <input 
              type='color' 
              value={customColors.primary} 
              onChange={e => setCustomColors({...customColors, primary: e.target.value})} 
              className='w-full h-10 rounded border border-border'
            />
            <label className='text-sm text-text-muted'>Accent</label>
            <input 
              type='color' 
              value={customColors.accent} 
              onChange={e => setCustomColors({...customColors, accent: e.target.value})} 
              className='w-full h-10 rounded border border-border'
            />
          </div>
        </div>

        {/* Font Size */}
        <div className='rounded-2xl bg-bg-1 border border-border p-4 space-y-3'>
          <h2 className='font-medium'>Font Size</h2>
          <div className='flex gap-2'>
            {(['small', 'medium', 'large', 'extra-large'] as const).map(size => (
              <button 
                key={size}
                onClick={() => updateSettings({ fontSize: size })} 
                className={'h-10 px-3 rounded-full border text-sm ' + (settings.fontSize === size ? 'bg-theme text-white border-theme' : 'border-border')}
              >
                {size === 'extra-large' ? 'XL' : size.charAt(0).toUpperCase() + size.slice(1)}
              </button>
            ))}
          </div>
          <p className='text-sm' data-font-preview>Preview text • The quick brown fox jumps over the lazy dog.</p>
        </div>

        {/* Accessibility */}
        <div className='rounded-2xl bg-bg-1 border border-border p-4 space-y-3'>
          <h2 className='font-medium'>Accessibility</h2>
          <div className='space-y-2'>
            <label className='flex items-center gap-3'>
              <input 
                type='checkbox' 
                checked={settings.accessibility.highContrast} 
                onChange={e => updateSettings({ 
                  accessibility: { ...settings.accessibility, highContrast: e.target.checked } 
                })}
                className='w-4 h-4'
              />
              <span className='text-sm'>High contrast mode</span>
            </label>
            <label className='flex items-center gap-3'>
              <input 
                type='checkbox' 
                checked={settings.accessibility.reducedMotion} 
                onChange={e => updateSettings({ 
                  accessibility: { ...settings.accessibility, reducedMotion: e.target.checked } 
                })}
                className='w-4 h-4'
              />
              <span className='text-sm'>Reduced motion</span>
            </label>
            <label className='flex items-center gap-3'>
              <input 
                type='checkbox' 
                checked={settings.compactMode} 
                onChange={e => updateSettings({ compactMode: e.target.checked })}
                className='w-4 h-4'
              />
              <span className='text-sm'>Compact mode</span>
            </label>
          </div>
        </div>

        {/* Notifications */}
        <div className='rounded-2xl bg-bg-1 border border-border p-4 space-y-3'>
          <h2 className='font-medium'>Notifications</h2>
          <div className='space-y-2'>
            <label className='flex items-center gap-3'>
              <input 
                type='checkbox' 
                checked={settings.notifications.email} 
                onChange={e => updateSettings({ 
                  notifications: { ...settings.notifications, email: e.target.checked } 
                })}
                className='w-4 h-4'
              />
              <span className='text-sm'>Email notifications</span>
            </label>
            <label className='flex items-center gap-3'>
              <input 
                type='checkbox' 
                checked={settings.notifications.push} 
                onChange={e => updateSettings({ 
                  notifications: { ...settings.notifications, push: e.target.checked } 
                })}
                className='w-4 h-4'
              />
              <span className='text-sm'>Push notifications</span>
            </label>
            <label className='flex items-center gap-3'>
              <input 
                type='checkbox' 
                checked={settings.notifications.inApp} 
                onChange={e => updateSettings({ 
                  notifications: { ...settings.notifications, inApp: e.target.checked } 
                })}
                className='w-4 h-4'
              />
              <span className='text-sm'>In-app notifications</span>
            </label>
          </div>
        </div>

        {/* Module Settings Preview */}
        <div className='rounded-2xl bg-bg-1 border border-border p-4 space-y-3'>
          <h2 className='font-medium'>Module Preferences</h2>
          <div className='space-y-2 text-sm text-text-muted'>
            <div>Finance: {settings.modules.finance.defaultCurrency}</div>
            <div>Tasks: {settings.modules.tasks.defaultView} view</div>
            <div>Library: Sort by {settings.modules.library.defaultSort}</div>
          </div>
          <button 
            onClick={() => {
              // TODO: Navigate to detailed module settings
              console.log('Navigate to detailed module settings')
            }}
            className='h-8 px-3 rounded-full border border-border text-sm hover:bg-bg-2'
          >
            Configure modules
          </button>
        </div>
      </section>

      {/* Security Section */}
      <section className='space-y-4'>
        <h2 className='text-lg font-semibold'>Security & Privacy</h2>
        <div className='grid grid-cols-1 gap-6'>
          <SecureStorageDemo />
        </div>
      </section>
    </main>
  )
}
