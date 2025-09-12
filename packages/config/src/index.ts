/**
 * RIA Configuration Package
 * 
 * Centralized configuration management with validation, environment handling,
 * and type safety
 */

// Core configuration manager
export {
  ConfigManager,
  ConfigSchemas,
  type ConfigManagerOptions,
  type ConfigEnvironment,
  type ConfigSource,
  type ConfigValue,
  type ConfigValidationError,
  type RiaConfig,
  type DatabaseConfig,
  type ApiConfig,
  type AuthConfig,
  type StorageConfig,
  type EmailConfig,
  type FeaturesConfig,
  type SecurityConfig,
  type MonitoringConfig,
} from './config-manager';

// Global configuration instance
import { ConfigManager } from './config-manager';

// Create global configuration manager
export const globalConfig = new ConfigManager({
  environment: (process.env.NODE_ENV as any) || 'development',
  enableHotReload: process.env.NODE_ENV === 'development',
  enableValidation: true,
  enableSecrets: true,
});

// Convenience functions
export const getConfig = <K extends keyof import('./config-manager').RiaConfig>(
  key: K
): import('./config-manager').RiaConfig[K] => {
  return globalConfig.get(key);
};

export const setConfig = <K extends keyof import('./config-manager').RiaConfig>(
  key: K,
  value: import('./config-manager').RiaConfig[K]
): void => {
  globalConfig.set(key, value);
};

export const hasConfig = (key: keyof import('./config-manager').RiaConfig): boolean => {
  return globalConfig.has(key);
};

export const validateConfig = () => {
  return globalConfig.validateAll();
};

export const getConfigHealth = () => {
  return globalConfig.getHealthStatus();
};