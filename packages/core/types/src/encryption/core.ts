/**
 * RIA Security - Military-Grade Encryption Core
 * Based on Buoy's double-layer encryption architecture
 * 
 * Features:
 * - AES-256-GCM encryption with Web Crypto API
 * - PBKDF2 key derivation with 100,000 iterations
 * - Device-specific keys for additional security
 * - Zero-knowledge architecture support
 */

export interface EncryptedData {
  data: string;
  iv: string;
  algorithm: string;
  timestamp: number;
  version: string;
}

export interface EncryptionOptions {
  iterations?: number;
  keyLength?: number;
  algorithm?: string;
}

export class RiaEncryption {
  private static readonly DEFAULT_OPTIONS: Required<EncryptionOptions> = {
    iterations: 100000,
    keyLength: 256,
    algorithm: 'AES-GCM',
  };

  private static readonly APP_SALT = 'ria-2024-security-salt-v1';
  private static readonly ENCRYPTION_VERSION = '1.0.0';

  /**
   * Derive encryption key from password using PBKDF2
   */
  static async deriveKey(
    password: string,
    userSalt?: string,
    options: EncryptionOptions = {}
  ): Promise<CryptoKey> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const encoder = new TextEncoder();
    
    // Create salt combining user-specific and app-wide salts
    const saltString = userSalt ? `${userSalt}-${this.APP_SALT}` : this.APP_SALT;
    const salt = encoder.encode(saltString);

    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    // Derive key using PBKDF2
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: opts.iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: opts.algorithm, length: opts.keyLength },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generate device-specific key for additional security layer
   */
  static async generateDeviceKey(deviceId?: string): Promise<CryptoKey> {
    const deviceIdentifier = deviceId || this.getDeviceIdentifier();
    const encoder = new TextEncoder();
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(`device-${deviceIdentifier}-${this.APP_SALT}`),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('device-key-salt'),
        iterations: 50000, // Lower iterations for device key
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  static async encrypt(
    data: any,
    key: CryptoKey,
    options: EncryptionOptions = {}
  ): Promise<EncryptedData> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const encoder = new TextEncoder();
    
    // Generate random IV (12 bytes for GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Convert data to string and encrypt
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const encrypted = await crypto.subtle.encrypt(
      { name: opts.algorithm, iv },
      key,
      encoder.encode(dataString)
    );

    return {
      data: this.arrayBufferToBase64(encrypted),
      iv: this.arrayBufferToBase64(iv.buffer),
      algorithm: `${opts.algorithm}-${opts.keyLength}`,
      timestamp: Date.now(),
      version: this.ENCRYPTION_VERSION
    };
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  static async decrypt(
    encryptedData: EncryptedData,
    key: CryptoKey
  ): Promise<any> {
    const decoder = new TextDecoder();
    
    const encrypted = this.base64ToArrayBuffer(encryptedData.data);
    const iv = this.base64ToArrayBuffer(encryptedData.iv);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    const dataString = decoder.decode(decrypted);
    
    // Try to parse as JSON, fallback to string
    try {
      return JSON.parse(dataString);
    } catch {
      return dataString;
    }
  }

  /**
   * Double-layer encryption: encrypt with both user key and device key
   */
  static async doubleEncrypt(
    data: any,
    userKey: CryptoKey,
    deviceKey: CryptoKey
  ): Promise<EncryptedData> {
    // First layer: encrypt with user key
    const firstLayer = await this.encrypt(data, userKey);
    
    // Second layer: encrypt the encrypted data with device key
    const secondLayer = await this.encrypt(firstLayer, deviceKey);
    
    return {
      ...secondLayer,
      algorithm: `DOUBLE-${secondLayer.algorithm}`,
    };
  }

  /**
   * Double-layer decryption: decrypt with both device key and user key
   */
  static async doubleDecrypt(
    encryptedData: EncryptedData,
    userKey: CryptoKey,
    deviceKey: CryptoKey
  ): Promise<any> {
    // First layer: decrypt with device key
    const firstLayer = await this.decrypt(encryptedData, deviceKey) as EncryptedData;
    
    // Second layer: decrypt with user key
    return this.decrypt(firstLayer, userKey);
  }

  /**
   * Generate a unique device identifier
   */
  private static getDeviceIdentifier(): string {
    // Try to get a stable device identifier
    if (typeof window !== 'undefined') {
      let deviceId = localStorage.getItem('ria-device-id');
      
      if (!deviceId) {
        // Generate device ID from available browser features
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx?.fillText('device-fingerprint', 10, 50);
        
        const fingerprint = [
          navigator.userAgent,
          navigator.language,
          screen.width + 'x' + screen.height,
          Intl.DateTimeFormat().resolvedOptions().timeZone,
          canvas.toDataURL()
        ].join('|');
        
        deviceId = btoa(fingerprint).slice(0, 32);
        localStorage.setItem('ria-device-id', deviceId);
      }
      
      return deviceId;
    }
    
    // Fallback for server-side
    return 'server-device-' + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Utility: Convert ArrayBuffer to base64
   */
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  }

  /**
   * Utility: Convert base64 to ArrayBuffer
   */
  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const uint8Array = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    return uint8Array.buffer;
  }

  /**
   * Validate that Web Crypto API is available
   */
  static isSupported(): boolean {
    return typeof crypto !== 'undefined' && 
           typeof crypto.subtle !== 'undefined';
  }

  /**
   * Test encryption/decryption with sample data
   */
  static async test(): Promise<boolean> {
    try {
      const testData = { message: 'Hello RIA Security', timestamp: Date.now() };
      const password = 'test-password-123';
      
      const key = await this.deriveKey(password, 'test-user');
      const encrypted = await this.encrypt(testData, key);
      const decrypted = await this.decrypt(encrypted, key);
      
      return JSON.stringify(testData) === JSON.stringify(decrypted);
    } catch (error) {
      console.error('Encryption test failed:', error);
      return false;
    }
  }
}