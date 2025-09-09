// src/index.ts
// Barrel file for the @ria/client package. Re-export types and API helpers
// so consumers can import from a single entry point. In your real
// implementation, you might expose additional functions for authentication
// or other modules (tasks, messaging, wiki, etc.).

export * from './types';
export * from './api';
export * from './auth';
export * from './library';
export * from './links';
export * from './mock';