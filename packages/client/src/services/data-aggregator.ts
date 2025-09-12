/**
 * RIA Multi-Source Data Aggregation Framework
 * 
 * Intelligent data aggregation with failover, caching, and error recovery
 * Based on Buoy's risk assessment and weather data aggregation patterns
 */

export interface DataSource<T = any> {
  id: string;
  name: string;
  priority: number;
  timeout: number;
  retries: number;
  fetch: (params: any) => Promise<T>;
  validate?: (data: T) => boolean;
  transform?: (data: any) => T;
  fallback?: () => T | null;
}

export interface AggregationConfig {
  strategy: 'first-success' | 'fastest' | 'merge' | 'best-quality';
  timeout: number;
  maxConcurrent: number;
  cacheTimeout: number;
  enableFallback: boolean;
}

export interface AggregationResult<T> {
  data: T | null;
  sources: {
    id: string;
    success: boolean;
    duration: number;
    error?: string;
    data?: T;
  }[];
  strategy: string;
  timestamp: number;
  fromCache: boolean;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
  sources: string[];
}

/**
 * Multi-source data aggregator
 */
export class DataAggregator {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();

  constructor(private defaultConfig: AggregationConfig = {
    strategy: 'first-success',
    timeout: 5000,
    maxConcurrent: 3,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    enableFallback: true,
  }) {}

  /**
   * Aggregate data from multiple sources
   */
  async aggregate<T>(
    cacheKey: string,
    sources: DataSource<T>[],
    params: any = {},
    config: Partial<AggregationConfig> = {}
  ): Promise<AggregationResult<T>> {
    const finalConfig = { ...this.defaultConfig, ...config };

    // Check cache first
    const cached = this.getFromCache<T>(cacheKey);
    if (cached) {
      return {
        data: cached.data,
        sources: cached.sources.map(id => ({
          id,
          success: true,
          duration: 0,
        })),
        strategy: 'cache',
        timestamp: cached.timestamp,
        fromCache: true,
      };
    }

    // Check if request is already pending
    const pendingKey = `${cacheKey}-${JSON.stringify(params)}`;
    if (this.pendingRequests.has(pendingKey)) {
      return await this.pendingRequests.get(pendingKey);
    }

    // Create new request
    const requestPromise = this.executeAggregation(cacheKey, sources, params, finalConfig);
    this.pendingRequests.set(pendingKey, requestPromise);

    try {
      const result = await requestPromise;
      
      // Cache successful results
      if (result.data && finalConfig.cacheTimeout > 0) {
        this.setCache(cacheKey, result.data, finalConfig.cacheTimeout, 
          result.sources.filter(s => s.success).map(s => s.id));
      }

      return result;
    } finally {
      this.pendingRequests.delete(pendingKey);
    }
  }

  /**
   * Execute aggregation based on strategy
   */
  private async executeAggregation<T>(
    cacheKey: string,
    sources: DataSource<T>[],
    params: any,
    config: AggregationConfig
  ): Promise<AggregationResult<T>> {
    const sortedSources = [...sources].sort((a, b) => b.priority - a.priority);
    
    switch (config.strategy) {
      case 'first-success':
        return await this.firstSuccessStrategy(sortedSources, params, config);
      
      case 'fastest':
        return await this.fastestStrategy(sortedSources, params, config);
      
      case 'merge':
        return await this.mergeStrategy(sortedSources, params, config);
      
      case 'best-quality':
        return await this.bestQualityStrategy(sortedSources, params, config);
      
      default:
        throw new Error(`Unknown aggregation strategy: ${config.strategy}`);
    }
  }

  /**
   * First success strategy - return first successful response
   */
  private async firstSuccessStrategy<T>(
    sources: DataSource<T>[],
    params: any,
    config: AggregationConfig
  ): Promise<AggregationResult<T>> {
    const results: AggregationResult<T>['sources'] = [];
    
    for (const source of sources) {
      const startTime = Date.now();
      
      try {
        const data = await this.fetchWithRetry(source, params);
        const duration = Date.now() - startTime;
        
        if (this.validateData(source, data)) {
          results.push({ id: source.id, success: true, duration, data });
          
          return {
            data,
            sources: results,
            strategy: 'first-success',
            timestamp: Date.now(),
            fromCache: false,
          };
        }
        
        results.push({ 
          id: source.id, 
          success: false, 
          duration,
          error: 'Validation failed' 
        });
        
      } catch (error) {
        const duration = Date.now() - startTime;
        results.push({
          id: source.id,
          success: false,
          duration,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // All sources failed, try fallbacks
    if (config.enableFallback) {
      for (const source of sources) {
        if (source.fallback) {
          try {
            const data = source.fallback();
            if (data) {
              return {
                data,
                sources: results,
                strategy: 'fallback',
                timestamp: Date.now(),
                fromCache: false,
              };
            }
          } catch (error) {
            console.warn(`Fallback failed for source ${source.id}:`, error);
          }
        }
      }
    }

    return {
      data: null,
      sources: results,
      strategy: 'first-success',
      timestamp: Date.now(),
      fromCache: false,
    };
  }

  /**
   * Fastest strategy - return fastest successful response
   */
  private async fastestStrategy<T>(
    sources: DataSource<T>[],
    params: any,
    config: AggregationConfig
  ): Promise<AggregationResult<T>> {
    const results: AggregationResult<T>['sources'] = [];
    
    // Limit concurrent requests
    const concurrentSources = sources.slice(0, config.maxConcurrent);
    
    const promises = concurrentSources.map(async (source) => {
      const startTime = Date.now();
      
      try {
        const data = await this.fetchWithRetry(source, params);
        const duration = Date.now() - startTime;
        
        if (this.validateData(source, data)) {
          return { source, data, duration, success: true };
        }
        
        return { 
          source, 
          data: null, 
          duration, 
          success: false, 
          error: 'Validation failed' 
        };
        
      } catch (error) {
        const duration = Date.now() - startTime;
        return {
          source,
          data: null,
          duration,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    try {
      // Wait for first successful response or all to complete
      const raceResults = await Promise.allSettled(promises);
      
      // Find first successful result
      for (const result of raceResults) {
        if (result.status === 'fulfilled' && result.value.success && result.value.data) {
          // Collect all results for reporting
          for (const settled of raceResults) {
            if (settled.status === 'fulfilled') {
              const res = settled.value;
              results.push({
                id: res.source.id,
                success: res.success,
                duration: res.duration,
                error: res.error,
                data: res.data,
              });
            }
          }
          
          return {
            data: result.value.data,
            sources: results,
            strategy: 'fastest',
            timestamp: Date.now(),
            fromCache: false,
          };
        }
      }

      // All failed, collect errors
      for (const result of raceResults) {
        if (result.status === 'fulfilled') {
          const res = result.value;
          results.push({
            id: res.source.id,
            success: false,
            duration: res.duration,
            error: res.error,
          });
        } else {
          results.push({
            id: 'unknown',
            success: false,
            duration: 0,
            error: result.reason,
          });
        }
      }

    } catch (error) {
      console.error('Fastest strategy error:', error);
    }

    return {
      data: null,
      sources: results,
      strategy: 'fastest',
      timestamp: Date.now(),
      fromCache: false,
    };
  }

  /**
   * Merge strategy - combine data from multiple sources
   */
  private async mergeStrategy<T>(
    sources: DataSource<T>[],
    params: any,
    config: AggregationConfig
  ): Promise<AggregationResult<T>> {
    const results: AggregationResult<T>['sources'] = [];
    const successfulData: T[] = [];
    
    // Fetch from all sources
    const promises = sources.map(async (source) => {
      const startTime = Date.now();
      
      try {
        const data = await this.fetchWithRetry(source, params);
        const duration = Date.now() - startTime;
        
        if (this.validateData(source, data)) {
          successfulData.push(data);
          results.push({ id: source.id, success: true, duration, data });
        } else {
          results.push({ 
            id: source.id, 
            success: false, 
            duration,
            error: 'Validation failed' 
          });
        }
        
      } catch (error) {
        const duration = Date.now() - startTime;
        results.push({
          id: source.id,
          success: false,
          duration,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    await Promise.allSettled(promises);

    // Merge successful data
    let mergedData: T | null = null;
    if (successfulData.length > 0) {
      mergedData = this.mergeData(successfulData);
    }

    return {
      data: mergedData,
      sources: results,
      strategy: 'merge',
      timestamp: Date.now(),
      fromCache: false,
    };
  }

  /**
   * Best quality strategy - return highest quality data
   */
  private async bestQualityStrategy<T>(
    sources: DataSource<T>[],
    params: any,
    config: AggregationConfig
  ): Promise<AggregationResult<T>> {
    const results: AggregationResult<T>['sources'] = [];
    const successfulResults: { source: DataSource<T>; data: T; duration: number }[] = [];
    
    // Fetch from all sources
    const promises = sources.map(async (source) => {
      const startTime = Date.now();
      
      try {
        const data = await this.fetchWithRetry(source, params);
        const duration = Date.now() - startTime;
        
        if (this.validateData(source, data)) {
          successfulResults.push({ source, data, duration });
          results.push({ id: source.id, success: true, duration, data });
        } else {
          results.push({ 
            id: source.id, 
            success: false, 
            duration,
            error: 'Validation failed' 
          });
        }
        
      } catch (error) {
        const duration = Date.now() - startTime;
        results.push({
          id: source.id,
          success: false,
          duration,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    await Promise.allSettled(promises);

    // Select best quality data (highest priority source with successful data)
    let bestData: T | null = null;
    if (successfulResults.length > 0) {
      const bestResult = successfulResults
        .sort((a, b) => b.source.priority - a.source.priority)[0];
      bestData = bestResult.data;
    }

    return {
      data: bestData,
      sources: results,
      strategy: 'best-quality',
      timestamp: Date.now(),
      fromCache: false,
    };
  }

  /**
   * Fetch data with retry logic
   */
  private async fetchWithRetry<T>(source: DataSource<T>, params: any): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= source.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), source.timeout);
        
        const data = await Promise.race([
          source.fetch({ ...params, signal: controller.signal }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), source.timeout)
          )
        ]);
        
        clearTimeout(timeoutId);
        
        // Transform data if transformer provided
        if (source.transform) {
          return source.transform(data);
        }
        
        return data as T;
        
      } catch (error) {
        lastError = error;
        
        if (attempt < source.retries) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Validate data using source validator
   */
  private validateData<T>(source: DataSource<T>, data: T): boolean {
    if (!source.validate) return true;
    
    try {
      return source.validate(data);
    } catch (error) {
      console.warn(`Validation error for source ${source.id}:`, error);
      return false;
    }
  }

  /**
   * Merge multiple data objects (basic implementation)
   */
  private mergeData<T>(dataArray: T[]): T {
    if (dataArray.length === 0) throw new Error('No data to merge');
    if (dataArray.length === 1) return dataArray[0];
    
    // Basic merge - can be overridden for specific data types
    if (Array.isArray(dataArray[0])) {
      return dataArray.flat() as T;
    }
    
    if (typeof dataArray[0] === 'object' && dataArray[0] !== null) {
      return dataArray.reduce((merged, current) => ({
        ...merged,
        ...current,
      }), {} as T);
    }
    
    // For primitive types, return the first value
    return dataArray[0];
  }

  /**
   * Cache management
   */
  private getFromCache<T>(key: string): CacheEntry<T> | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry;
  }

  private setCache<T>(
    key: string, 
    data: T, 
    timeout: number, 
    sources: string[]
  ): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + timeout,
      sources,
    });
  }

  /**
   * Clear cache
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    entries: Array<{ key: string; sources: string[]; age: number; }>;
  } {
    const now = Date.now();
    const entries: Array<{ key: string; sources: string[]; age: number; }> = [];
    
    for (const [key, entry] of this.cache.entries()) {
      entries.push({
        key,
        sources: entry.sources,
        age: now - entry.timestamp,
      });
    }
    
    return {
      size: this.cache.size,
      entries: entries.sort((a, b) => b.age - a.age),
    };
  }
}

/**
 * Global data aggregator instance
 */
export const globalDataAggregator = new DataAggregator();