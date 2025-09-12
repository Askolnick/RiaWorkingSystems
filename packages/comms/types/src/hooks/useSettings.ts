/**
 * RIA Settings Management Hook
 * 
 * Sophisticated settings management based on Buoy's patterns
 * Features: persistence, migration, CSS variable updates, loading states
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type ThemeMode = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';
export type MeasurementUnit = 'metric' | 'imperial';

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: {
    tasks: boolean;
    finance: boolean;
    system: boolean;
    updates: boolean;
  };
}

export interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
}

export interface DeveloperSettings {
  showDebugInfo: boolean;
  enableExperimentalFeatures: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  networkThrottling: boolean;
}

export interface RiaSettings {
  // Theme & Appearance
  theme: ThemeMode;
  fontSize: FontSize;
  compactMode: boolean;
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
  };

  // Functionality
  notifications: NotificationSettings;
  accessibility: AccessibilitySettings;
  measurementUnit: MeasurementUnit;
  
  // Module-specific settings
  modules: {
    finance: {
      defaultCurrency: string;
      autoSave: boolean;
      showCents: boolean;
    };
    tasks: {
      defaultView: 'list' | 'board' | 'calendar';
      autoRefresh: boolean;
      showCompletedTasks: boolean;
    };
    library: {
      defaultSort: 'name' | 'created' | 'updated';
      showPreview: boolean;
      autoBackup: boolean;
    };
  };

  // Developer settings (hidden by default)
  developer: DeveloperSettings;

  // Metadata
  version: string;
  lastUpdated: number;
}

const DEFAULT_SETTINGS: RiaSettings = {
  theme: 'system',
  fontSize: 'medium',
  compactMode: false,
  customColors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    accent: '#10b981',
  },
  notifications: {
    email: true,
    push: true,
    inApp: true,
    types: {
      tasks: true,
      finance: true,
      system: true,
      updates: false,
    },
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: false,
  },
  measurementUnit: 'metric',
  modules: {
    finance: {
      defaultCurrency: 'USD',
      autoSave: true,
      showCents: true,
    },
    tasks: {
      defaultView: 'list',
      autoRefresh: true,
      showCompletedTasks: false,
    },
    library: {
      defaultSort: 'updated',
      showPreview: true,
      autoBackup: true,
    },
  },
  developer: {
    showDebugInfo: false,
    enableExperimentalFeatures: false,
    logLevel: 'error',
    networkThrottling: false,
  },
  version: '1.0.0',
  lastUpdated: Date.now(),
};

interface SettingsState extends RiaSettings {
  isLoading: boolean;
  error: string | null;
}

interface SettingsActions {
  updateSettings: (updates: Partial<RiaSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => Promise<boolean>;
  migrateSettings: (oldSettings: any) => RiaSettings;
}

/**
 * Settings migration function
 */
function migrateSettings(stored: any, currentVersion = '1.0.0'): RiaSettings {
  if (!stored || typeof stored !== 'object') {
    return { ...DEFAULT_SETTINGS };
  }

  // If version matches, return as-is (with defaults for missing properties)
  if (stored.version === currentVersion) {
    return { ...DEFAULT_SETTINGS, ...stored, version: currentVersion };
  }

  // Migration logic for different versions
  let migrated = { ...stored };

  // Example migration from v0.x to v1.0.0
  if (!stored.version || stored.version.startsWith('0.')) {
    // Migrate old theme setting
    if (stored.darkMode !== undefined) {
      migrated.theme = stored.darkMode ? 'dark' : 'light';
      delete migrated.darkMode;
    }

    // Migrate old notification settings
    if (stored.enableNotifications !== undefined) {
      migrated.notifications = {
        ...DEFAULT_SETTINGS.notifications,
        email: stored.enableNotifications,
        push: stored.enableNotifications,
        inApp: stored.enableNotifications,
      };
    }
  }

  return {
    ...DEFAULT_SETTINGS,
    ...migrated,
    version: currentVersion,
    lastUpdated: Date.now(),
  };
}

/**
 * Zustand store for settings management
 */
const useSettingsStore = create<SettingsState & SettingsActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        ...DEFAULT_SETTINGS,
        isLoading: true,
        error: null,

        // Actions
        updateSettings: async (updates: Partial<RiaSettings>) => {
          set(state => {
            Object.assign(state, {
              ...updates,
              lastUpdated: Date.now(),
            });
            state.error = null;
          });

          // Apply CSS variable updates
          requestAnimationFrame(() => {
            applyCSSVariables(get());
          });

          // Store in encrypted storage if sensitive data
          // TODO: Integrate with @ria/security for sensitive settings
        },

        resetSettings: async () => {
          set(state => {
            Object.assign(state, {
              ...DEFAULT_SETTINGS,
              lastUpdated: Date.now(),
            });
            state.error = null;
          });

          requestAnimationFrame(() => {
            applyCSSVariables(get());
          });
        },

        exportSettings: () => {
          const currentSettings = get();
          const exportData = {
            ...currentSettings,
            // Remove non-exportable fields
            isLoading: undefined,
            error: undefined,
          };
          return JSON.stringify(exportData, null, 2);
        },

        importSettings: async (settingsJson: string) => {
          try {
            const importedSettings = JSON.parse(settingsJson);
            const migratedSettings = migrateSettings(importedSettings);
            
            set(state => {
              Object.assign(state, {
                ...migratedSettings,
                lastUpdated: Date.now(),
              });
              state.error = null;
            });

            requestAnimationFrame(() => {
              applyCSSVariables(get());
            });

            return true;
          } catch (error) {
            set(state => {
              state.error = 'Failed to import settings: Invalid format';
            });
            return false;
          }
        },

        migrateSettings,
      })),
      {
        name: 'ria-settings',
        version: 1,
        migrate: (persistedState: any, version: number) => {
          if (version < 1) {
            return migrateSettings(persistedState);
          }
          return persistedState;
        },
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.isLoading = false;
            // Apply settings to DOM
            requestAnimationFrame(() => {
              applyCSSVariables(state);
            });
          }
        },
      }
    ),
    { name: 'ria-settings-store' }
  )
);

/**
 * Apply settings to CSS variables
 */
function applyCSSVariables(settings: RiaSettings): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const updates: Record<string, string> = {};

  // Theme
  updates['--theme-mode'] = settings.theme;

  // Colors
  updates['--color-primary'] = settings.customColors.primary;
  updates['--color-secondary'] = settings.customColors.secondary;
  updates['--color-accent'] = settings.customColors.accent;

  // Font size
  const fontSizeMap = {
    small: '14px',
    medium: '16px',
    large: '18px',
    'extra-large': '20px',
  };
  updates['--font-size-base'] = fontSizeMap[settings.fontSize];

  // Compact mode
  updates['--spacing-scale'] = settings.compactMode ? '0.8' : '1';

  // Accessibility
  if (settings.accessibility.highContrast) {
    updates['--contrast-mode'] = 'high';
  }

  if (settings.accessibility.reducedMotion) {
    updates['--motion-scale'] = '0';
  }

  // Apply all updates
  Object.entries(updates).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });

  // Apply theme class
  root.classList.remove('theme-light', 'theme-dark', 'theme-system');
  root.classList.add(`theme-${settings.theme}`);

  // Apply accessibility classes
  root.classList.toggle('high-contrast', settings.accessibility.highContrast);
  root.classList.toggle('reduced-motion', settings.accessibility.reducedMotion);
  root.classList.toggle('compact-mode', settings.compactMode);
}

/**
 * React hook for settings management
 */
export function useSettings() {
  const store = useSettingsStore();

  const settingsOnly = useMemo(() => {
    const { isLoading, error, updateSettings, resetSettings, exportSettings, importSettings, migrateSettings, ...settings } = store;
    return settings as RiaSettings;
  }, [store]);

  const actions = useMemo(() => ({
    updateSettings: store.updateSettings,
    resetSettings: store.resetSettings,
    exportSettings: store.exportSettings,
    importSettings: store.importSettings,
  }), [store]);

  return {
    settings: settingsOnly,
    isLoading: store.isLoading,
    error: store.error,
    ...actions,
  };
}

/**
 * Hook for specific setting value with type safety
 */
export function useSetting<K extends keyof RiaSettings>(key: K): [RiaSettings[K], (value: RiaSettings[K]) => void] {
  const { settings, updateSettings } = useSettings();
  
  const setValue = useCallback((value: RiaSettings[K]) => {
    updateSettings({ [key]: value } as Partial<RiaSettings>);
  }, [key, updateSettings]);

  return [settings[key], setValue];
}

/**
 * Hook for theme-specific functionality
 */
export function useTheme() {
  const [theme, setTheme] = useSetting('theme');
  const [customColors, setCustomColors] = useSetting('customColors');

  const isDark = useMemo(() => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    
    // System preference
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    return false;
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(current => {
      switch (current) {
        case 'light': return 'dark';
        case 'dark': return 'system';
        case 'system': return 'light';
        default: return 'light';
      }
    });
  }, [setTheme]);

  return {
    theme,
    setTheme,
    customColors,
    setCustomColors,
    isDark,
    toggleTheme,
  };
}