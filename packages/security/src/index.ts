/**
 * RIA Security Package
 * 
 * Military-grade encryption and security utilities for RIA Management Software
 * Based on Buoy's security architecture patterns
 */

// Core encryption
export { RiaEncryption, type EncryptedData, type EncryptionOptions } from './encryption/core';

// Encrypted storage
export { EncryptedStorage, type StorageOptions, type StoredData } from './storage/encrypted-storage';

// React hooks
export { 
  useSecureStorage, 
  useUserSecureStorage,
  type UseSecureStorageOptions, 
  type UseSecureStorageReturn 
} from './hooks/useSecureStorage';

// Security utilities
export { XSSProtection, type XSSProtectionOptions } from './security/xss-protection';
export { 
  RateLimiter,
  AuthRateLimiter,
  APIRateLimiter,
  FormSubmissionRateLimiter,
  BrowserRateLimiter,
  globalRateLimiters,
  type RateLimiterOptions,
  type RateLimitResult
} from './security/rate-limiter';