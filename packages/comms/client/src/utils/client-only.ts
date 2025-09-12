/**
 * Utility to safely handle client-only operations and prevent SSR issues
 */

export const isClient = () => typeof window !== 'undefined';

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isClient()) return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  
  setItem: (key: string, value: string): void => {
    if (!isClient()) return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silently fail in SSR or when localStorage is disabled
    }
  },
  
  removeItem: (key: string): void => {
    if (!isClient()) return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail in SSR or when localStorage is disabled
    }
  }
};

export const createClientOnlyRepository = <T>(
  repositoryFactory: () => T,
  fallback: T
): T => {
  if (!isClient()) {
    return fallback;
  }
  
  try {
    return repositoryFactory();
  } catch (error) {
    console.warn('Repository initialization failed, using fallback:', error);
    return fallback;
  }
};