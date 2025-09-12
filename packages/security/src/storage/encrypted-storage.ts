/**
 * RIA Security - Encrypted Local Storage
 * 
 * Provides encrypted storage using IndexedDB with double-layer encryption
 * Based on Buoy's zero-knowledge architecture patterns
 */

import { RiaEncryption, EncryptedData } from '../encryption/core';

export interface StorageOptions {
  dbName?: string;
  version?: number;
  storeName?: string;
  useDoubleEncryption?: boolean;
}

export interface StoredData {
  id: string;
  encryptedData: EncryptedData;
  metadata: {
    created: number;
    updated: number;
    type: string;
    size: number;
  };
}

export class EncryptedStorage {
  private db: IDBDatabase | null = null;
  private userKey: CryptoKey | null = null;
  private deviceKey: CryptoKey | null = null;
  private options: Required<StorageOptions>;

  constructor(options: StorageOptions = {}) {
    this.options = {
      dbName: 'ria-encrypted-storage',
      version: 1,
      storeName: 'encrypted_data',
      useDoubleEncryption: true,
      ...options
    };
  }

  /**
   * Initialize the encrypted storage with user credentials
   */
  async initialize(password: string, userId: string): Promise<void> {
    if (!RiaEncryption.isSupported()) {
      throw new Error('Web Crypto API not supported');
    }

    // Derive user key
    this.userKey = await RiaEncryption.deriveKey(password, userId);
    
    // Generate device key if using double encryption
    if (this.options.useDoubleEncryption) {
      this.deviceKey = await RiaEncryption.generateDeviceKey(userId);
    }

    // Initialize IndexedDB
    await this.initializeDB();
  }

  /**
   * Store encrypted data
   */
  async setItem<T = any>(key: string, data: T, type: string = 'data'): Promise<void> {
    if (!this.userKey || !this.db) {
      throw new Error('Storage not initialized');
    }

    const transaction = this.db.transaction([this.options.storeName], 'readwrite');
    const store = transaction.objectStore(this.options.storeName);

    // Encrypt data
    let encryptedData: EncryptedData;
    if (this.options.useDoubleEncryption && this.deviceKey) {
      encryptedData = await RiaEncryption.doubleEncrypt(data, this.userKey, this.deviceKey);
    } else {
      encryptedData = await RiaEncryption.encrypt(data, this.userKey);
    }

    const storedData: StoredData = {
      id: key,
      encryptedData,
      metadata: {
        created: Date.now(),
        updated: Date.now(),
        type,
        size: JSON.stringify(data).length
      }
    };

    return new Promise((resolve, reject) => {
      const request = store.put(storedData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Retrieve and decrypt data
   */
  async getItem<T = any>(key: string): Promise<T | null> {
    if (!this.userKey || !this.db) {
      throw new Error('Storage not initialized');
    }

    const transaction = this.db.transaction([this.options.storeName], 'readonly');
    const store = transaction.objectStore(this.options.storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      
      request.onsuccess = async () => {
        try {
          const storedData: StoredData = request.result;
          if (!storedData) {
            resolve(null);
            return;
          }

          // Decrypt data
          let decryptedData: T;
          if (this.options.useDoubleEncryption && this.deviceKey) {
            decryptedData = await RiaEncryption.doubleDecrypt(
              storedData.encryptedData,
              this.userKey!,
              this.deviceKey
            );
          } else {
            decryptedData = await RiaEncryption.decrypt(storedData.encryptedData, this.userKey!);
          }

          resolve(decryptedData);
        } catch (error) {
          reject(error);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove item from storage
   */
  async removeItem(key: string): Promise<void> {
    if (!this.db) {
      throw new Error('Storage not initialized');
    }

    const transaction = this.db.transaction([this.options.storeName], 'readwrite');
    const store = transaction.objectStore(this.options.storeName);

    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * List all keys in storage
   */
  async keys(): Promise<string[]> {
    if (!this.db) {
      throw new Error('Storage not initialized');
    }

    const transaction = this.db.transaction([this.options.storeName], 'readonly');
    const store = transaction.objectStore(this.options.storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAllKeys();
      request.onsuccess = () => resolve(request.result as string[]);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get storage metadata for a key
   */
  async getMetadata(key: string): Promise<StoredData['metadata'] | null> {
    if (!this.db) {
      throw new Error('Storage not initialized');
    }

    const transaction = this.db.transaction([this.options.storeName], 'readonly');
    const store = transaction.objectStore(this.options.storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      
      request.onsuccess = () => {
        const storedData: StoredData = request.result;
        resolve(storedData ? storedData.metadata : null);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all data from storage
   */
  async clear(): Promise<void> {
    if (!this.db) {
      throw new Error('Storage not initialized');
    }

    const transaction = this.db.transaction([this.options.storeName], 'readwrite');
    const store = transaction.objectStore(this.options.storeName);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get storage usage statistics
   */
  async getStats(): Promise<{
    itemCount: number;
    totalSize: number;
    avgItemSize: number;
  }> {
    if (!this.db) {
      throw new Error('Storage not initialized');
    }

    const transaction = this.db.transaction([this.options.storeName], 'readonly');
    const store = transaction.objectStore(this.options.storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        const allData: StoredData[] = request.result;
        const totalSize = allData.reduce((sum, item) => sum + item.metadata.size, 0);
        const itemCount = allData.length;
        const avgItemSize = itemCount > 0 ? totalSize / itemCount : 0;

        resolve({
          itemCount,
          totalSize,
          avgItemSize: Math.round(avgItemSize)
        });
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.userKey = null;
    this.deviceKey = null;
  }

  /**
   * Initialize IndexedDB
   */
  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.options.dbName, this.options.version);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.options.storeName)) {
          const store = db.createObjectStore(this.options.storeName, { keyPath: 'id' });
          
          // Create indexes for efficient querying
          store.createIndex('type', 'metadata.type', { unique: false });
          store.createIndex('created', 'metadata.created', { unique: false });
          store.createIndex('updated', 'metadata.updated', { unique: false });
        }
      };
    });
  }

  /**
   * Check if storage is available and initialized
   */
  isReady(): boolean {
    return this.db !== null && this.userKey !== null;
  }
}