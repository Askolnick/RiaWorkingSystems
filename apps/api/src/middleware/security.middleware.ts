/**
 * RIA API Security Middleware
 * 
 * Enhanced security middleware integrating military-grade protection
 * from @ria/security package
 */

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { XSSProtection } from '@ria/security';
import { getConfig } from '@ria/config';

export interface SecurityRequest extends Request {
  rateLimit?: {
    remaining: number;
    resetTime: Date;
    hit: boolean;
  };
  sanitized?: boolean;
}

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);

  constructor() {
    // Middleware initialization
  }

  async use(req: SecurityRequest, res: Response, next: NextFunction) {
    const startTime = Date.now();
    
    try {
      // 1. Basic Input Sanitization (XSS Protection)
      this.sanitizeRequest(req);

      // 2. Security Headers
      this.setSecurityHeaders(res);

      // 3. Request Logging (for security monitoring)
      this.logSecurityEvent(req, startTime);

      next();
    } catch (error) {
      this.logger.error('Security middleware error:', error);
      
      // Don't expose internal errors
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'A security error occurred',
      });
    }
  }

  private sanitizeRequest(req: SecurityRequest): void {
    try {
      // Basic XSS prevention - sanitize string inputs
      if (req.query && typeof req.query === 'object') {
        for (const [key, value] of Object.entries(req.query)) {
          if (typeof value === 'string') {
            // Basic XSS sanitization using built-in methods
            req.query[key] = XSSProtection.sanitizeText(value);
          }
        }
      }

      // Sanitize body (for POST/PUT requests)
      if (req.body && typeof req.body === 'object') {
        req.body = XSSProtection.sanitizeObject(req.body);
      }

      // Sanitize URL parameters
      if (req.params && typeof req.params === 'object') {
        for (const [key, value] of Object.entries(req.params)) {
          if (typeof value === 'string') {
            req.params[key] = XSSProtection.sanitizeText(value);
          }
        }
      }

      req.sanitized = true;
    } catch (error) {
      this.logger.error('Input sanitization error:', error);
      throw new Error('Input validation failed');
    }
  }

  private setSecurityHeaders(res: Response): void {
    // Basic security headers
    res.set('X-XSS-Protection', '1; mode=block');
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.set('X-Powered-By', 'RIA Management System');

    // Basic CSP
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self'"
    ].join('; ');
    
    res.set('Content-Security-Policy', csp);
  }

  private logSecurityEvent(req: Request, startTime: number): void {
    const duration = Date.now() - startTime;
    
    // Log all non-GET requests and security-relevant paths
    const securityRelevant = [
      '/auth',
      '/admin',
      '/users',
      '/config',
    ].some(path => req.path.startsWith(path));

    if (securityRelevant || req.method !== 'GET') {
      this.logger.log(`${req.method} ${req.path} (${duration}ms)`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')?.substring(0, 100) + '...',
      });
    }

    // Log suspicious requests
    const suspiciousPatterns = [
      /\.\./,  // Directory traversal
      /<script/i,  // Script injection
      /union.*select/i,  // SQL injection
    ];

    const fullUrl = `${req.path}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;
    
    if (suspiciousPatterns.some(pattern => pattern.test(fullUrl))) {
      this.logger.warn('Suspicious request detected', {
        ip: req.ip,
        method: req.method,
        path: req.path,
      });
    }
  }
}