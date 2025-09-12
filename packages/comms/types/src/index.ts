// Core types and interfaces
export * from './types';

// JMAP client implementation
export * from './jmap-client';
export { createJMAPClient } from './jmap-client';

// OpenPGP encryption implementation
export * from './encryption';
export { createEncryption, sanitizeHTML, extractPlainText } from './encryption';

// Integration adapters
export * from './integrations';
export { createEmailIntegration, createEmailAIProcessor } from './integrations';

// Email service factory
export { createEmailService } from './service';

// Repository interface - to be implemented by consuming applications
export interface EmailRepositoryImpl {
  // Implement all methods from EmailRepository interface
}

// Default configuration
export const DEFAULT_EMAIL_CONFIG = {
  jmap: {
    timeout: 30000, // 30 seconds
    maxRetries: 3,
    retryDelay: 1000, // 1 second
  },
  encryption: {
    algorithm: 'ecc',
    curve: 'curve25519',
    keySize: 4096,
  },
  sync: {
    interval: 300000, // 5 minutes
    maxMessages: 1000,
    batchSize: 100,
  },
  ai: {
    enabled: true,
    provider: 'openai', // or 'anthropic', 'local'
    model: 'gpt-4',
    maxTokens: 1000,
    temperature: 0.1,
  },
} as const;