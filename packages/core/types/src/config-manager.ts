/**
 * RIA Centralized Configuration Manager
 * 
 * Sophisticated configuration management with validation, environment handling,
 * and hot-reloading capabilities. Based on Buoy's multi-API configuration patterns
 */

import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import { config as dotenvConfig } from 'dotenv';

export type ConfigEnvironment = 'development' | 'staging' | 'production' | 'test';
export type ConfigSource = 'env' | 'file' | 'override' | 'default';

export interface ConfigValue<T = any> {
  value: T;
  source: ConfigSource;
  validated: boolean;
  lastUpdated: Date;
}

export interface ConfigValidationError {
  key: string;
  error: string;
  value: any;
  source: ConfigSource;
}

export interface ConfigManagerOptions {
  environment: ConfigEnvironment;
  configDir?: string;
  enableHotReload?: boolean;
  enableValidation?: boolean;
  enableSecrets?: boolean;
  secretsPrefix?: string;
  cacheTTL?: number; // Cache time-to-live in milliseconds
}

/**
 * Configuration schema definitions
 */
export const ConfigSchemas = {
  // Database configuration
  database: z.object({
    host: z.string().min(1, 'Database host is required'),
    port: z.number().int().min(1).max(65535),
    name: z.string().min(1, 'Database name is required'),
    username: z.string().min(1, 'Database username is required'),
    password: z.string().min(1, 'Database password is required'),
    ssl: z.boolean().default(false),
    poolSize: z.number().int().min(1).max(100).default(10),
    connectionTimeout: z.number().int().min(1000).default(30000),
  }),

  // API configuration
  api: z.object({
    host: z.string().default('0.0.0.0'),
    port: z.number().int().min(1).max(65535).default(3000),
    cors: z.object({
      enabled: z.boolean().default(true),
      origins: z.array(z.string()).default(['http://localhost:3000']),
      methods: z.array(z.string()).default(['GET', 'POST', 'PUT', 'DELETE']),
    }),
    rateLimit: z.object({
      enabled: z.boolean().default(true),
      windowMs: z.number().int().min(1000).default(15 * 60 * 1000), // 15 minutes
      maxRequests: z.number().int().min(1).default(100),
    }),
    timeout: z.number().int().min(1000).default(30000),
  }),

  // Authentication configuration
  auth: z.object({
    jwtSecret: z.string().min(32, 'JWT secret must be at least 32 characters'),
    jwtExpiration: z.string().default('7d'),
    bcryptRounds: z.number().int().min(8).max(15).default(10),
    sessionTimeout: z.number().int().min(300).default(1800), // 30 minutes
    maxLoginAttempts: z.number().int().min(1).default(5),
    lockoutDuration: z.number().int().min(300).default(900), // 15 minutes
  }),

  // File storage configuration
  storage: z.object({
    provider: z.enum(['local', 's3', 'gcs', 'azure']).default('local'),
    local: z.object({
      path: z.string().default('./uploads'),
      maxFileSize: z.number().int().min(1).default(10 * 1024 * 1024), // 10MB
    }),
    s3: z.object({
      bucket: z.string().optional(),
      region: z.string().optional(),
      accessKey: z.string().optional(),
      secretKey: z.string().optional(),
    }).optional(),
  }),

  // Email configuration
  email: z.object({
    provider: z.enum(['smtp', 'sendgrid', 'mailgun', 'ses']).default('smtp'),
    smtp: z.object({
      host: z.string().optional(),
      port: z.number().int().min(1).max(65535).optional(),
      secure: z.boolean().default(false),
      username: z.string().optional(),
      password: z.string().optional(),
    }),
    from: z.object({
      name: z.string().default('RIA Management'),
      email: z.string().email('Invalid from email address'),
    }),
  }),

  // Feature flags
  features: z.object({
    enableAdvancedAnalytics: z.boolean().default(false),
    enableExperimentalFeatures: z.boolean().default(false),
    enableDebugMode: z.boolean().default(false),
    maxUsersPerTenant: z.number().int().min(1).default(100),
    enableBackgroundJobs: z.boolean().default(true),
    enableMetrics: z.boolean().default(true),
  }),

  // Security configuration
  security: z.object({
    enableHttps: z.boolean().default(false),
    enableHsts: z.boolean().default(false),
    enableCsrfProtection: z.boolean().default(true),
    enableXssProtection: z.boolean().default(true),
    enableContentSecurityPolicy: z.boolean().default(true),
    allowedHosts: z.array(z.string()).default(['localhost']),
    trustedProxies: z.array(z.string()).default([]),
  }),

  // Monitoring and logging
  monitoring: z.object({
    enableLogging: z.boolean().default(true),
    logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    enableMetrics: z.boolean().default(true),
    enableTracing: z.boolean().default(false),
    healthCheckPath: z.string().default('/health'),
    metricsPath: z.string().default('/metrics'),
  }),
};

/**
 * Type inference for configuration schemas
 */
export type DatabaseConfig = z.infer<typeof ConfigSchemas.database>;
export type ApiConfig = z.infer<typeof ConfigSchemas.api>;
export type AuthConfig = z.infer<typeof ConfigSchemas.auth>;
export type StorageConfig = z.infer<typeof ConfigSchemas.storage>;
export type EmailConfig = z.infer<typeof ConfigSchemas.email>;
export type FeaturesConfig = z.infer<typeof ConfigSchemas.features>;
export type SecurityConfig = z.infer<typeof ConfigSchemas.security>;
export type MonitoringConfig = z.infer<typeof ConfigSchemas.monitoring>;

export type RiaConfig = {
  database: DatabaseConfig;
  api: ApiConfig;
  auth: AuthConfig;
  storage: StorageConfig;
  email: EmailConfig;
  features: FeaturesConfig;
  security: SecurityConfig;
  monitoring: MonitoringConfig;
};

/**
 * Centralized Configuration Manager
 */
export class ConfigManager {
  private config = new Map<string, ConfigValue>();
  private watchers = new Map<string, fs.FSWatcher>();
  private validationErrors: ConfigValidationError[] = [];
  private options: Required<ConfigManagerOptions>;
  private cache = new Map<string, { value: any; expires: number }>();

  constructor(options: ConfigManagerOptions) {
    this.options = {
      configDir: './config',
      enableHotReload: false,
      enableValidation: true,
      enableSecrets: true,
      secretsPrefix: 'RIA_',
      cacheTTL: 5 * 60 * 1000, // 5 minutes
      ...options,
    };

    this.loadEnvironmentConfig();
    this.loadFileConfig();

    if (this.options.enableHotReload) {
      this.setupHotReload();
    }
  }

  /**
   * Get configuration value with type safety
   */
  get<K extends keyof RiaConfig>(key: K, fallback?: RiaConfig[K]): RiaConfig[K] {
    const cached = this.getFromCache(key as string);
    if (cached !== null) {
      return cached as RiaConfig[K];
    }

    const configValue = this.config.get(key as string);
    if (!configValue) {
      if (fallback !== undefined) {
        this.setCache(key as string, fallback);
        return fallback;
      }
      throw new Error(`Configuration key '${key}' not found and no fallback provided`);
    }

    if (this.options.enableValidation && !configValue.validated) {
      this.validateConfig(key as string, configValue.value);
    }

    this.setCache(key as string, configValue.value);
    return configValue.value as RiaConfig[K];
  }

  /**
   * Set configuration value
   */
  set<K extends keyof RiaConfig>(
    key: K,
    value: RiaConfig[K],
    source: ConfigSource = 'override'
  ): void {
    if (this.options.enableValidation) {
      this.validateConfig(key as string, value);
    }

    this.config.set(key as string, {
      value,
      source,
      validated: true,
      lastUpdated: new Date(),
    });

    this.clearCache(key as string);
  }

  /**
   * Check if configuration key exists
   */
  has(key: keyof RiaConfig): boolean {
    return this.config.has(key as string);
  }

  /**
   * Get all configuration as object
   */
  getAll(): Partial<RiaConfig> {
    const result: any = {};
    
    for (const [key, configValue] of this.config.entries()) {
      result[key] = configValue.value;
    }

    return result;
  }

  /**
   * Get configuration with metadata
   */
  getWithMetadata<K extends keyof RiaConfig>(key: K): ConfigValue<RiaConfig[K]> | null {
    return this.config.get(key as string) as ConfigValue<RiaConfig[K]> || null;
  }

  /**
   * Validate entire configuration
   */
  validateAll(): ConfigValidationError[] {
    this.validationErrors = [];

    for (const [key, configValue] of this.config.entries()) {
      try {
        this.validateConfig(key, configValue.value);
      } catch (error) {
        this.validationErrors.push({
          key,
          error: error instanceof Error ? error.message : 'Unknown validation error',
          value: configValue.value,
          source: configValue.source,
        });
      }
    }

    return this.validationErrors;
  }

  /**
   * Get validation errors
   */
  getValidationErrors(): ConfigValidationError[] {
    return this.validationErrors;
  }

  /**
   * Reload configuration from all sources
   */
  reload(): void {
    this.config.clear();
    this.clearAllCaches();
    this.loadEnvironmentConfig();
    this.loadFileConfig();
  }

  /**
   * Export configuration to file
   */
  exportConfig(filePath: string, format: 'json' | 'env' = 'json'): void {
    const config = this.getAll();

    if (format === 'json') {
      fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
    } else if (format === 'env') {
      const envContent = Object.entries(config)
        .map(([key, value]) => `${this.options.secretsPrefix}${key.toUpperCase()}=${value}`)
        .join('\n');
      fs.writeFileSync(filePath, envContent);
    }
  }

  /**
   * Get configuration health status
   */
  getHealthStatus(): {
    healthy: boolean;
    validationErrors: number;
    configSources: Record<ConfigSource, number>;
    lastReload: Date | null;
  } {
    const sourceCounts: Record<ConfigSource, number> = {
      env: 0,
      file: 0,
      override: 0,
      default: 0,
    };

    for (const configValue of this.config.values()) {
      sourceCounts[configValue.source]++;
    }

    return {
      healthy: this.validationErrors.length === 0,
      validationErrors: this.validationErrors.length,
      configSources: sourceCounts,
      lastReload: null, // Would track actual reload timestamp in production
    };
  }

  /**
   * Load configuration from environment variables
   */
  private loadEnvironmentConfig(): void {
    // Load .env file if it exists
    dotenvConfig();

    // Database configuration
    this.setFromEnv('database', {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      name: process.env.DB_NAME || 'ria',
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl: process.env.DB_SSL === 'true',
      poolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
      connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000', 10),
    });

    // API configuration
    this.setFromEnv('api', {
      host: process.env.API_HOST || '0.0.0.0',
      port: parseInt(process.env.API_PORT || '3001', 10),
      cors: {
        enabled: process.env.CORS_ENABLED !== 'false',
        origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
        methods: process.env.CORS_METHODS?.split(',') || ['GET', 'POST', 'PUT', 'DELETE'],
      },
      rateLimit: {
        enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
      },
      timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
    });

    // Auth configuration
    this.setFromEnv('auth', {
      jwtSecret: process.env.JWT_SECRET || this.generateSecretKey(),
      jwtExpiration: process.env.JWT_EXPIRATION || '7d',
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
      sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '1800', 10),
      maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
      lockoutDuration: parseInt(process.env.LOCKOUT_DURATION || '900', 10),
    });

    // Continue with other configuration sections...
    this.setFromEnv('features', {
      enableAdvancedAnalytics: process.env.ENABLE_ADVANCED_ANALYTICS === 'true',
      enableExperimentalFeatures: process.env.ENABLE_EXPERIMENTAL_FEATURES === 'true',
      enableDebugMode: process.env.NODE_ENV === 'development',
      maxUsersPerTenant: parseInt(process.env.MAX_USERS_PER_TENANT || '100', 10),
      enableBackgroundJobs: process.env.ENABLE_BACKGROUND_JOBS !== 'false',
      enableMetrics: process.env.ENABLE_METRICS !== 'false',
    });
  }

  /**
   * Load configuration from files
   */
  private loadFileConfig(): void {
    if (!fs.existsSync(this.options.configDir)) {
      return;
    }

    const configFiles = [
      `${this.options.environment}.json`,
      'default.json',
      'local.json',
    ];

    for (const fileName of configFiles) {
      const filePath = path.join(this.options.configDir, fileName);
      
      if (fs.existsSync(filePath)) {
        try {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const fileConfig = JSON.parse(fileContent);
          
          for (const [key, value] of Object.entries(fileConfig)) {
            if (!this.config.has(key)) {
              this.config.set(key, {
                value,
                source: 'file',
                validated: false,
                lastUpdated: new Date(),
              });
            }
          }
        } catch (error) {
          console.warn(`Failed to load config file ${filePath}:`, error);
        }
      }
    }
  }

  /**
   * Set configuration from environment with proper typing
   */
  private setFromEnv(key: string, value: any): void {
    this.config.set(key, {
      value,
      source: 'env',
      validated: false,
      lastUpdated: new Date(),
    });
  }

  /**
   * Validate configuration value against schema
   */
  private validateConfig(key: string, value: any): void {
    const schema = (ConfigSchemas as any)[key];
    
    if (schema) {
      try {
        schema.parse(value);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(`Validation failed for ${key}: ${error.errors.map(e => e.message).join(', ')}`);
        }
        throw error;
      }
    }
  }

  /**
   * Setup hot reload for configuration files
   */
  private setupHotReload(): void {
    if (!fs.existsSync(this.options.configDir)) {
      return;
    }

    const watcher = fs.watch(this.options.configDir, (eventType, filename) => {
      if (filename && filename.endsWith('.json')) {
        console.log(`Configuration file ${filename} changed, reloading...`);
        this.reload();
      }
    });

    this.watchers.set(this.options.configDir, watcher);
  }

  /**
   * Generate a secure secret key
   */
  private generateSecretKey(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expires) {
      return cached.value;
    }
    
    if (cached) {
      this.cache.delete(key);
    }
    
    return null;
  }

  private setCache(key: string, value: any): void {
    this.cache.set(key, {
      value,
      expires: Date.now() + this.options.cacheTTL,
    });
  }

  private clearCache(key: string): void {
    this.cache.delete(key);
  }

  private clearAllCaches(): void {
    this.cache.clear();
  }

  /**
   * Cleanup watchers on destroy
   */
  destroy(): void {
    for (const watcher of this.watchers.values()) {
      watcher.close();
    }
    this.watchers.clear();
    this.clearAllCaches();
  }
}