/**
 * RIA Security - React Hook for Encrypted Storage
 * 
 * Provides a React hook interface for encrypted storage with automatic
 * initialization and cleanup based on user authentication
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { EncryptedStorage, StorageOptions } from '../storage/encrypted-storage';

export interface UseSecureStorageOptions extends StorageOptions {
  autoInitialize?: boolean;
  clearOnLogout?: boolean;
}

export interface UseSecureStorageReturn {
  storage: EncryptedStorage | null;
  isReady: boolean;
  isInitializing: boolean;
  error: string | null;
  initialize: (password: string, userId: string) => Promise<void>;
  setItem: <T = any>(key: string, data: T, type?: string) => Promise<void>;
  getItem: <T = any>(key: string) => Promise<T | null>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  keys: () => Promise<string[]>;
  getStats: () => Promise<{ itemCount: number; totalSize: number; avgItemSize: number; }>;
  close: () => void;
}

/**
 * React hook for encrypted storage management
 */
export function useSecureStorage(
  options: UseSecureStorageOptions = {}
): UseSecureStorageReturn {
  const [storage, setStorage] = useState<EncryptedStorage | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const storageRef = useRef<EncryptedStorage | null>(null);
  const optionsRef = useRef(options);

  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  /**
   * Initialize encrypted storage
   */
  const initialize = useCallback(async (password: string, userId: string) => {
    if (isInitializing) return;
    
    setIsInitializing(true);
    setError(null);

    try {
      // Close existing storage if any
      if (storageRef.current) {
        storageRef.current.close();
      }

      // Create new storage instance
      const newStorage = new EncryptedStorage(optionsRef.current);
      await newStorage.initialize(password, userId);

      storageRef.current = newStorage;
      setStorage(newStorage);
      setIsReady(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize storage';
      setError(errorMessage);
      console.error('Secure storage initialization failed:', err);
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing]);

  /**
   * Store encrypted data
   */
  const setItem = useCallback(async <T = any>(
    key: string, 
    data: T, 
    type: string = 'data'
  ): Promise<void> => {
    if (!storageRef.current?.isReady()) {
      throw new Error('Storage not initialized');
    }
    
    try {
      await storageRef.current.setItem(key, data, type);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to store data';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Retrieve and decrypt data
   */
  const getItem = useCallback(async <T = any>(key: string): Promise<T | null> => {
    if (!storageRef.current?.isReady()) {
      throw new Error('Storage not initialized');
    }
    
    try {
      return await storageRef.current.getItem<T>(key);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to retrieve data';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Remove item from storage
   */
  const removeItem = useCallback(async (key: string): Promise<void> => {
    if (!storageRef.current?.isReady()) {
      throw new Error('Storage not initialized');
    }
    
    try {
      await storageRef.current.removeItem(key);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove data';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Clear all data from storage
   */
  const clear = useCallback(async (): Promise<void> => {
    if (!storageRef.current?.isReady()) {
      throw new Error('Storage not initialized');
    }
    
    try {
      await storageRef.current.clear();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear storage';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Get all keys in storage
   */
  const keys = useCallback(async (): Promise<string[]> => {
    if (!storageRef.current?.isReady()) {
      throw new Error('Storage not initialized');
    }
    
    try {
      return await storageRef.current.keys();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to retrieve keys';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Get storage usage statistics
   */
  const getStats = useCallback(async () => {
    if (!storageRef.current?.isReady()) {
      throw new Error('Storage not initialized');
    }
    
    try {
      return await storageRef.current.getStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get storage stats';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Close storage and cleanup
   */
  const close = useCallback(() => {
    if (storageRef.current) {
      storageRef.current.close();
      storageRef.current = null;
    }
    setStorage(null);
    setIsReady(false);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (storageRef.current) {
        storageRef.current.close();
      }
    };
  }, []);

  // Clear error when storage becomes ready
  useEffect(() => {
    if (isReady && error) {
      setError(null);
    }
  }, [isReady, error]);

  return {
    storage,
    isReady,
    isInitializing,
    error,
    initialize,
    setItem,
    getItem,
    removeItem,
    clear,
    keys,
    getStats,
    close,
  };
}

/**
 * Hook for managing secure storage with automatic user authentication integration
 */
export function useUserSecureStorage(
  user: { id: string; email: string } | null,
  password: string | null,
  options: UseSecureStorageOptions = {}
) {
  const secureStorage = useSecureStorage({
    ...options,
    autoInitialize: true,
  });

  // Auto-initialize when user and password are available
  useEffect(() => {
    if (user && password && !secureStorage.isReady && !secureStorage.isInitializing) {
      secureStorage.initialize(password, user.id).catch(err => {
        console.error('Auto-initialization failed:', err);
      });
    }
  }, [user, password, secureStorage]);

  // Auto-close when user logs out
  useEffect(() => {
    if (!user && secureStorage.isReady && options.clearOnLogout !== false) {
      secureStorage.close();
    }
  }, [user, secureStorage, options.clearOnLogout]);

  return secureStorage;
}