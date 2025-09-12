/**
 * RIA Data Manager Hook
 * 
 * Sophisticated data management with caching, error handling, and offline support
 * Based on Buoy's consolidated data hook patterns
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface DataState<T> {
  data: T[];
  currentItem: T | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  hasMore: boolean;
  page: number;
  totalCount: number;
}

export interface DataCache<T> {
  [key: string]: {
    data: T[];
    timestamp: number;
    expiry: number;
  };
}

export interface DataManagerOptions {
  cacheTimeout: number;      // Cache timeout in ms
  retryAttempts: number;     // Number of retry attempts
  retryDelay: number;        // Delay between retries in ms
  pageSize: number;          // Items per page
  enableCache: boolean;      // Enable caching
  enableOffline: boolean;    // Enable offline support
}

const DEFAULT_OPTIONS: DataManagerOptions = {
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  retryAttempts: 3,
  retryDelay: 1000,
  pageSize: 50,
  enableCache: true,
  enableOffline: true,
};

/**
 * Generic data manager hook factory
 */
export function createDataManager<T extends { id: string }>(
  key: string,
  fetcher: {
    getAll: (page?: number, limit?: number) => Promise<{ data: T[]; total: number; hasMore: boolean }>;
    getById: (id: string) => Promise<T>;
    create: (data: Omit<T, 'id'>) => Promise<T>;
    update: (id: string, data: Partial<T>) => Promise<T>;
    delete: (id: string) => Promise<void>;
    search?: (query: string, page?: number, limit?: number) => Promise<{ data: T[]; total: number; hasMore: boolean }>;
  },
  options: Partial<DataManagerOptions> = {}
) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Zustand store for this data type
  const useStore = create<DataState<T> & {
    cache: DataCache<T>;
    
    // Actions
    setData: (data: T[]) => void;
    setCurrentItem: (item: T | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    addItem: (item: T) => void;
    updateItem: (item: T) => void;
    removeItem: (id: string) => void;
    setPage: (page: number) => void;
    incrementPage: () => void;
    resetPagination: () => void;
    
    // Cache management
    setCacheData: (cacheKey: string, data: T[], expiry?: number) => void;
    getCacheData: (cacheKey: string) => T[] | null;
    clearCache: (cacheKey?: string) => void;
  }>()(
    devtools(
      immer((set, get) => ({
        // Initial state
        data: [],
        currentItem: null,
        loading: false,
        error: null,
        lastFetch: null,
        hasMore: true,
        page: 1,
        totalCount: 0,
        cache: {},

        // Basic actions
        setData: (data: T[]) => set(state => {
          state.data = data;
          state.lastFetch = Date.now();
        }),

        setCurrentItem: (item: T | null) => set(state => {
          state.currentItem = item;
        }),

        setLoading: (loading: boolean) => set(state => {
          state.loading = loading;
        }),

        setError: (error: string | null) => set(state => {
          state.error = error;
        }),

        addItem: (item: T) => set(state => {
          const existingIndex = state.data.findIndex(d => d.id === item.id);
          if (existingIndex >= 0) {
            state.data[existingIndex] = item;
          } else {
            state.data.unshift(item);
            state.totalCount += 1;
          }
        }),

        updateItem: (item: T) => set(state => {
          const index = state.data.findIndex(d => d.id === item.id);
          if (index >= 0) {
            state.data[index] = item;
          }
          if (state.currentItem?.id === item.id) {
            state.currentItem = item;
          }
        }),

        removeItem: (id: string) => set(state => {
          state.data = state.data.filter(d => d.id !== id);
          if (state.currentItem?.id === id) {
            state.currentItem = null;
          }
          state.totalCount = Math.max(0, state.totalCount - 1);
        }),

        // Pagination
        setPage: (page: number) => set(state => {
          state.page = page;
        }),

        incrementPage: () => set(state => {
          state.page += 1;
        }),

        resetPagination: () => set(state => {
          state.page = 1;
          state.hasMore = true;
          state.data = [];
        }),

        // Cache management
        setCacheData: (cacheKey: string, data: T[], expiry?: number) => set(state => {
          if (!opts.enableCache) return;
          
          state.cache[cacheKey] = {
            data,
            timestamp: Date.now(),
            expiry: expiry || Date.now() + opts.cacheTimeout,
          };
        }),

        getCacheData: (cacheKey: string) => {
          if (!opts.enableCache) return null;
          
          const cached = get().cache[cacheKey];
          if (!cached) return null;
          
          if (Date.now() > cached.expiry) {
            // Cache expired
            set(state => {
              delete state.cache[cacheKey];
            });
            return null;
          }
          
          return cached.data;
        },

        clearCache: (cacheKey?: string) => set(state => {
          if (cacheKey) {
            delete state.cache[cacheKey];
          } else {
            state.cache = {};
          }
        }),
      })),
      { name: `ria-data-${key}` }
    )
  );

  /**
   * Main hook for data management
   */
  return function useDataManager() {
    const store = useStore();
    const retryCountRef = useRef(0);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Retry logic with exponential backoff
    const withRetry = useCallback(async <R>(
      operation: () => Promise<R>,
      context = 'operation'
    ): Promise<R> => {
      for (let attempt = 0; attempt < opts.retryAttempts; attempt++) {
        try {
          const result = await operation();
          retryCountRef.current = 0;
          return result;
        } catch (error) {
          const isLastAttempt = attempt === opts.retryAttempts - 1;
          
          if (isLastAttempt) {
            throw error;
          }
          
          // Exponential backoff
          const delay = opts.retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      throw new Error('All retry attempts failed');
    }, []);

    // Fetch all data
    const fetchData = useCallback(async (
      page = 1, 
      append = false,
      useCache = opts.enableCache
    ) => {
      const cacheKey = `${key}-page-${page}`;
      
      // Check cache first
      if (useCache) {
        const cachedData = store.getCacheData(cacheKey);
        if (cachedData) {
          if (append) {
            store.setData([...store.data, ...cachedData]);
          } else {
            store.setData(cachedData);
          }
          return;
        }
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      store.setLoading(true);
      store.setError(null);

      try {
        const result = await withRetry(async () => {
          return fetcher.getAll(page, opts.pageSize);
        }, 'fetchData');

        // Cache the result
        if (opts.enableCache) {
          store.setCacheData(cacheKey, result.data);
        }

        if (append) {
          store.setData([...store.data, ...result.data]);
        } else {
          store.setData(result.data);
        }

        store.setPage(page);
        set(state => {
          state.hasMore = result.hasMore;
          state.totalCount = result.total;
        });

      } catch (error) {
        if (error.name !== 'AbortError') {
          const message = error instanceof Error ? error.message : 'Failed to fetch data';
          store.setError(message);
          console.error(`Data fetch error (${key}):`, error);
        }
      } finally {
        store.setLoading(false);
        abortControllerRef.current = null;
      }
    }, [store, withRetry]);

    // Fetch single item
    const fetchItem = useCallback(async (id: string, useCache = opts.enableCache) => {
      const cacheKey = `${key}-item-${id}`;
      
      // Check cache first
      if (useCache) {
        const cachedData = store.getCacheData(cacheKey);
        if (cachedData && cachedData.length > 0) {
          store.setCurrentItem(cachedData[0]);
          return cachedData[0];
        }
      }

      store.setLoading(true);
      store.setError(null);

      try {
        const item = await withRetry(async () => {
          return fetcher.getById(id);
        }, 'fetchItem');

        // Cache the result
        if (opts.enableCache) {
          store.setCacheData(cacheKey, [item]);
        }

        store.setCurrentItem(item);
        return item;

      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch item';
        store.setError(message);
        console.error(`Item fetch error (${key}):`, error);
        throw error;
      } finally {
        store.setLoading(false);
      }
    }, [store, withRetry]);

    // Create item
    const createItem = useCallback(async (data: Omit<T, 'id'>) => {
      store.setLoading(true);
      store.setError(null);

      try {
        const newItem = await withRetry(async () => {
          return fetcher.create(data);
        }, 'createItem');

        store.addItem(newItem);
        
        // Clear relevant cache
        store.clearCache();

        return newItem;

      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create item';
        store.setError(message);
        console.error(`Item creation error (${key}):`, error);
        throw error;
      } finally {
        store.setLoading(false);
      }
    }, [store, withRetry]);

    // Update item
    const updateItem = useCallback(async (id: string, data: Partial<T>) => {
      store.setLoading(true);
      store.setError(null);

      try {
        const updatedItem = await withRetry(async () => {
          return fetcher.update(id, data);
        }, 'updateItem');

        store.updateItem(updatedItem);
        
        // Clear relevant cache
        store.clearCache(`${key}-item-${id}`);

        return updatedItem;

      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update item';
        store.setError(message);
        console.error(`Item update error (${key}):`, error);
        throw error;
      } finally {
        store.setLoading(false);
      }
    }, [store, withRetry]);

    // Delete item
    const deleteItem = useCallback(async (id: string) => {
      store.setLoading(true);
      store.setError(null);

      try {
        await withRetry(async () => {
          return fetcher.delete(id);
        }, 'deleteItem');

        store.removeItem(id);
        
        // Clear relevant cache
        store.clearCache();

      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete item';
        store.setError(message);
        console.error(`Item deletion error (${key}):`, error);
        throw error;
      } finally {
        store.setLoading(false);
      }
    }, [store, withRetry]);

    // Search items
    const searchItems = useCallback(async (
      query: string,
      page = 1,
      append = false
    ) => {
      if (!fetcher.search) {
        throw new Error('Search not implemented for this data type');
      }

      const cacheKey = `${key}-search-${query}-page-${page}`;
      
      // Check cache first
      if (opts.enableCache) {
        const cachedData = store.getCacheData(cacheKey);
        if (cachedData) {
          if (append) {
            store.setData([...store.data, ...cachedData]);
          } else {
            store.setData(cachedData);
          }
          return;
        }
      }

      store.setLoading(true);
      store.setError(null);

      try {
        const result = await withRetry(async () => {
          return fetcher.search!(query, page, opts.pageSize);
        }, 'searchItems');

        // Cache the result
        if (opts.enableCache) {
          store.setCacheData(cacheKey, result.data);
        }

        if (append) {
          store.setData([...store.data, ...result.data]);
        } else {
          store.setData(result.data);
        }

        store.setPage(page);
        set(state => {
          state.hasMore = result.hasMore;
          state.totalCount = result.total;
        });

      } catch (error) {
        const message = error instanceof Error ? error.message : 'Search failed';
        store.setError(message);
        console.error(`Search error (${key}):`, error);
      } finally {
        store.setLoading(false);
      }
    }, [store, withRetry]);

    // Load more (pagination)
    const loadMore = useCallback(async () => {
      if (!store.hasMore || store.loading) return;
      
      await fetchData(store.page + 1, true);
    }, [store.hasMore, store.loading, store.page, fetchData]);

    // Refresh data
    const refresh = useCallback(async () => {
      store.clearCache();
      store.resetPagination();
      await fetchData(1, false, false);
    }, [store, fetchData]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    }, []);

    return {
      // State
      data: store.data,
      currentItem: store.currentItem,
      loading: store.loading,
      error: store.error,
      hasMore: store.hasMore,
      page: store.page,
      totalCount: store.totalCount,
      
      // Actions
      fetchData,
      fetchItem,
      createItem,
      updateItem,
      deleteItem,
      searchItems,
      loadMore,
      refresh,
      
      // Utility
      setCurrentItem: store.setCurrentItem,
      clearError: () => store.setError(null),
      clearCache: store.clearCache,
    };
  };
}