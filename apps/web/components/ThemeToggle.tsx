'use client';

import React from 'react';
import { PrefsCtx } from '../app/providers/prefs';

export default function ThemeToggle() {
  const { prefs, setPrefs } = React.useContext(PrefsCtx);
  const isDark = prefs.mode === 'dark';

  const toggleTheme = () => {
    setPrefs({ mode: isDark ? 'light' : 'dark' });
  };

  return (
    <button
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-elev-1 border border-border hover:bg-bg-elev-2 transition-colors"
      onClick={toggleTheme}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className="text-lg">
        {isDark ? '🌙' : '☀️'}
      </span>
      <span className="text-sm font-medium">
        {isDark ? 'Dark' : 'Light'}
      </span>
    </button>
  );
}