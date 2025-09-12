/**
 * RIA Security - XSS Protection Utilities
 * 
 * Provides comprehensive XSS protection using DOMPurify and custom validators
 * Based on Buoy's security patterns
 */

import DOMPurify from 'dompurify';

export interface XSSProtectionOptions {
  allowedTags?: string[];
  allowedAttributes?: string[];
  stripTags?: boolean;
  stripAttributes?: boolean;
  maxLength?: number;
}

export class XSSProtection {
  private static readonly DEFAULT_ALLOWED_TAGS = [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
  ];

  private static readonly DEFAULT_ALLOWED_ATTRIBUTES = [
    'class', 'id', 'title', 'alt', 'href', 'target', 'rel'
  ];

  private static readonly DANGEROUS_PATTERNS = [
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /<script/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<link/gi,
    /<meta/gi,
    /data:\w+\/\w+;base64,/gi,
  ];

  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitizeHTML(
    content: string, 
    options: XSSProtectionOptions = {}
  ): string {
    if (!content || typeof content !== 'string') {
      return '';
    }

    // Check length limit
    if (options.maxLength && content.length > options.maxLength) {
      content = content.substring(0, options.maxLength);
    }

    // Configure DOMPurify
    const config: DOMPurify.Config = {
      ALLOWED_TAGS: options.allowedTags || this.DEFAULT_ALLOWED_TAGS,
      ALLOWED_ATTR: options.allowedAttributes || this.DEFAULT_ALLOWED_ATTRIBUTES,
      // Remove dangerous protocols
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      // Remove script-like content
      FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style', 'form'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout'],
    };

    return DOMPurify.sanitize(content, config);
  }

  /**
   * Sanitize plain text input
   */
  static sanitizeText(input: string, maxLength?: number): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    let sanitized = input
      // Remove potential HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove potentially dangerous characters
      .replace(/[<>\"'&]/g, (match) => {
        switch (match) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '"': return '&quot;';
          case "'": return '&#x27;';
          case '&': return '&amp;';
          default: return match;
        }
      })
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();

    // Apply length limit
    if (maxLength && sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
  }

  /**
   * Validate URL to prevent dangerous protocols
   */
  static sanitizeURL(url: string): string | null {
    if (!url || typeof url !== 'string') {
      return null;
    }

    // Remove leading/trailing whitespace
    const cleanUrl = url.trim();

    // Check for dangerous patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(cleanUrl)) {
        return null;
      }
    }

    // Allow only safe protocols
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:', 'ftp:'];
    
    try {
      const urlObj = new URL(cleanUrl);
      if (!allowedProtocols.includes(urlObj.protocol)) {
        return null;
      }
      return urlObj.toString();
    } catch {
      // If URL parsing fails, check if it's a relative URL
      if (cleanUrl.startsWith('/') || cleanUrl.startsWith('./') || cleanUrl.startsWith('../')) {
        return cleanUrl;
      }
      return null;
    }
  }

  /**
   * Sanitize object properties recursively
   */
  static sanitizeObject<T extends Record<string, any>>(
    obj: T, 
    options: XSSProtectionOptions & { textFields?: string[]; htmlFields?: string[]; } = {}
  ): T {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const sanitized = { ...obj } as T;
    const textFields = options.textFields || [];
    const htmlFields = options.htmlFields || [];

    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'string') {
        if (htmlFields.includes(key)) {
          (sanitized as any)[key] = this.sanitizeHTML(value, options);
        } else if (textFields.includes(key) || textFields.length === 0) {
          (sanitized as any)[key] = this.sanitizeText(value, options.maxLength);
        }
      } else if (Array.isArray(value)) {
        (sanitized as any)[key] = value.map(item => 
          typeof item === 'object' ? this.sanitizeObject(item, options) : 
          typeof item === 'string' ? this.sanitizeText(item, options.maxLength) : item
        );
      } else if (value && typeof value === 'object') {
        (sanitized as any)[key] = this.sanitizeObject(value, options);
      }
    }

    return sanitized;
  }

  /**
   * Validate and sanitize form data
   */
  static sanitizeFormData(
    formData: FormData | Record<string, any>,
    fieldConfig: Record<string, XSSProtectionOptions & { type?: 'text' | 'html' | 'url' }> = {}
  ): Record<string, any> {
    const result: Record<string, any> = {};

    const processValue = (key: string, value: any) => {
      const config = fieldConfig[key] || {};
      
      if (typeof value !== 'string') {
        return value;
      }

      switch (config.type) {
        case 'html':
          return this.sanitizeHTML(value, config);
        case 'url':
          return this.sanitizeURL(value);
        case 'text':
        default:
          return this.sanitizeText(value, config.maxLength);
      }
    };

    if (formData instanceof FormData) {
      for (const [key, value] of formData.entries()) {
        result[key] = processValue(key, value);
      }
    } else {
      for (const [key, value] of Object.entries(formData)) {
        result[key] = processValue(key, value);
      }
    }

    return result;
  }

  /**
   * Check if content contains potential XSS vectors
   */
  static containsXSS(content: string): boolean {
    if (!content || typeof content !== 'string') {
      return false;
    }

    // Check for dangerous patterns
    return this.DANGEROUS_PATTERNS.some(pattern => pattern.test(content));
  }

  /**
   * Generate content security policy
   */
  static generateCSP(options: {
    scriptSrc?: string[];
    styleSrc?: string[];
    imgSrc?: string[];
    connectSrc?: string[];
    allowEval?: boolean;
    allowInline?: boolean;
  } = {}): string {
    const {
      scriptSrc = ["'self'"],
      styleSrc = ["'self'", "'unsafe-inline'"],
      imgSrc = ["'self'", "data:", "https:"],
      connectSrc = ["'self'"],
      allowEval = false,
      allowInline = false,
    } = options;

    const directives = [
      `script-src ${allowEval ? "'unsafe-eval'" : ''} ${allowInline ? "'unsafe-inline'" : ''} ${scriptSrc.join(' ')}`.trim(),
      `style-src ${styleSrc.join(' ')}`,
      `img-src ${imgSrc.join(' ')}`,
      `connect-src ${connectSrc.join(' ')}`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ];

    return directives.join('; ');
  }

  /**
   * Create secure headers for HTTP responses
   */
  static getSecurityHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy': this.generateCSP(),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    };
  }
}