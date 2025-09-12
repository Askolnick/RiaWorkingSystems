/**
 * RIA Security - Rate Limiter
 * 
 * Client-side and server-side rate limiting to prevent abuse
 * Based on Buoy's rate limiting patterns
 */

export interface RateLimiterOptions {
  windowMs: number;        // Time window in milliseconds
  maxRequests: number;     // Maximum requests per window
  keyGenerator?: (identifier: string) => string;
  skipSuccessful?: boolean;
  skipFailedRequests?: boolean;
  resetOnSuccess?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalRequests: number;
}

interface RequestLog {
  count: number;
  resetTime: number;
  requests: number[];
}

export class RateLimiter {
  private storage = new Map<string, RequestLog>();
  private cleanupInterval: NodeJS.Timeout | number | null = null;
  private options: Required<RateLimiterOptions>;

  constructor(options: RateLimiterOptions) {
    this.options = {
      keyGenerator: (id: string) => id,
      skipSuccessful: false,
      skipFailedRequests: false,
      resetOnSuccess: false,
      ...options,
    };

    // Cleanup old entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Check if request should be allowed
   */
  check(identifier: string): RateLimitResult {
    const key = this.options.keyGenerator(identifier);
    const now = Date.now();
    const windowStart = now - this.options.windowMs;

    let log = this.storage.get(key);

    // Create new log if doesn't exist or window has passed
    if (!log || now >= log.resetTime) {
      log = {
        count: 0,
        resetTime: now + this.options.windowMs,
        requests: [],
      };
      this.storage.set(key, log);
    }

    // Remove requests outside the current window
    log.requests = log.requests.filter(timestamp => timestamp > windowStart);
    log.count = log.requests.length;

    const allowed = log.count < this.options.maxRequests;
    
    if (allowed) {
      log.requests.push(now);
      log.count++;
    }

    return {
      allowed,
      remaining: Math.max(0, this.options.maxRequests - log.count),
      resetTime: log.resetTime,
      totalRequests: log.count,
    };
  }

  /**
   * Record a successful request (for resetOnSuccess option)
   */
  recordSuccess(identifier: string): void {
    if (this.options.resetOnSuccess) {
      const key = this.options.keyGenerator(identifier);
      this.storage.delete(key);
    }
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    const key = this.options.keyGenerator(identifier);
    this.storage.delete(key);
  }

  /**
   * Get current status without incrementing counter
   */
  getStatus(identifier: string): RateLimitResult {
    const key = this.options.keyGenerator(identifier);
    const now = Date.now();
    const windowStart = now - this.options.windowMs;

    const log = this.storage.get(key);
    
    if (!log || now >= log.resetTime) {
      return {
        allowed: true,
        remaining: this.options.maxRequests,
        resetTime: now + this.options.windowMs,
        totalRequests: 0,
      };
    }

    // Count requests in current window
    const currentRequests = log.requests.filter(timestamp => timestamp > windowStart);
    
    return {
      allowed: currentRequests.length < this.options.maxRequests,
      remaining: Math.max(0, this.options.maxRequests - currentRequests.length),
      resetTime: log.resetTime,
      totalRequests: currentRequests.length,
    };
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, log] of this.storage.entries()) {
      if (now >= log.resetTime) {
        this.storage.delete(key);
      }
    }
  }

  /**
   * Destroy rate limiter and cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.storage.clear();
  }
}

/**
 * Specific rate limiters for common use cases
 */
export class AuthRateLimiter extends RateLimiter {
  constructor() {
    super({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,            // 5 attempts per 15 minutes
      resetOnSuccess: true,      // Reset on successful login
    });
  }
}

export class APIRateLimiter extends RateLimiter {
  constructor() {
    super({
      windowMs: 60 * 1000,      // 1 minute
      maxRequests: 60,          // 60 requests per minute
      skipSuccessful: false,
    });
  }
}

export class FormSubmissionRateLimiter extends RateLimiter {
  constructor() {
    super({
      windowMs: 60 * 1000,      // 1 minute
      maxRequests: 10,          // 10 submissions per minute
    });
  }
}

/**
 * Distributed rate limiter using browser storage
 */
export class BrowserRateLimiter {
  private storageKey: string;
  private options: Required<RateLimiterOptions>;

  constructor(storageKey: string, options: RateLimiterOptions) {
    this.storageKey = `rate_limit_${storageKey}`;
    this.options = {
      keyGenerator: (id: string) => id,
      skipSuccessful: false,
      skipFailedRequests: false,
      resetOnSuccess: false,
      ...options,
    };
  }

  /**
   * Check rate limit using localStorage
   */
  check(identifier: string): RateLimitResult {
    const key = this.options.keyGenerator(identifier);
    const storageKey = `${this.storageKey}_${key}`;
    
    try {
      const stored = localStorage.getItem(storageKey);
      const now = Date.now();
      const windowStart = now - this.options.windowMs;

      let log: RequestLog;
      
      if (stored) {
        log = JSON.parse(stored);
        
        // Check if window has passed
        if (now >= log.resetTime) {
          log = {
            count: 0,
            resetTime: now + this.options.windowMs,
            requests: [],
          };
        } else {
          // Filter out old requests
          log.requests = log.requests.filter(timestamp => timestamp > windowStart);
          log.count = log.requests.length;
        }
      } else {
        log = {
          count: 0,
          resetTime: now + this.options.windowMs,
          requests: [],
        };
      }

      const allowed = log.count < this.options.maxRequests;
      
      if (allowed) {
        log.requests.push(now);
        log.count++;
        localStorage.setItem(storageKey, JSON.stringify(log));
      }

      return {
        allowed,
        remaining: Math.max(0, this.options.maxRequests - log.count),
        resetTime: log.resetTime,
        totalRequests: log.count,
      };
    } catch (error) {
      // If localStorage fails, allow the request
      console.warn('Rate limiter localStorage error:', error);
      return {
        allowed: true,
        remaining: this.options.maxRequests,
        resetTime: Date.now() + this.options.windowMs,
        totalRequests: 0,
      };
    }
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    const key = this.options.keyGenerator(identifier);
    const storageKey = `${this.storageKey}_${key}`;
    
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Rate limiter reset error:', error);
    }
  }

  /**
   * Cleanup expired entries from localStorage
   */
  cleanup(): void {
    try {
      const now = Date.now();
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storageKey)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            try {
              const log: RequestLog = JSON.parse(stored);
              if (now >= log.resetTime) {
                keysToRemove.push(key);
              }
            } catch {
              // Invalid data, remove it
              keysToRemove.push(key);
            }
          }
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Rate limiter cleanup error:', error);
    }
  }
}

/**
 * Global rate limiters for common use cases
 */
export const globalRateLimiters = {
  auth: new BrowserRateLimiter('auth', {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  }),
  
  api: new BrowserRateLimiter('api', {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  }),
  
  form: new BrowserRateLimiter('form', {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  }),
};