/**
 * Health Check Controller
 * 
 * Provides API health status and diagnostics
 */

import { Controller, Get, HttpStatus } from '@nestjs/common';
import { getConfig, getConfigHealth } from '@ria/config';

@Controller('health')
export class HealthController {
  @Get()
  getHealth(): any {
    const startTime = process.hrtime();
    const configHealth = getConfigHealth();
    
    // Calculate uptime
    const uptime = process.uptime();
    const uptimeFormatted = this.formatUptime(uptime);
    
    // Memory usage
    const memoryUsage = process.memoryUsage();
    const memoryInfo = {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
      external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB',
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
    };
    
    // Configuration status
    const apiConfig = getConfig('api');
    const dbConfig = getConfig('database');
    const securityConfig = getConfig('security');
    const featuresConfig = getConfig('features');
    
    const configStatus = {
      healthy: configHealth.healthy,
      validationErrors: configHealth.validationErrors,
      lastReload: configHealth.lastReload,
      modules: {
        api: !!apiConfig,
        database: !!dbConfig,
        security: !!securityConfig,
        features: !!featuresConfig,
      }
    };
    
    // Performance timing
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const responseTime = Math.round((seconds * 1000) + (nanoseconds / 1000000));
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: uptimeFormatted,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      memory: memoryInfo,
      configuration: configStatus,
      performance: {
        responseTime: `${responseTime}ms`,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      features: {
        rateLimiting: apiConfig?.rateLimit.enabled || false,
        cors: apiConfig?.cors.enabled || false,
        xssProtection: securityConfig?.enableXssProtection || false,
        csrfProtection: securityConfig?.enableCsrfProtection || false,
        debugMode: featuresConfig?.enableDebugMode || false,
      }
    };
    
    return {
      ...healthData,
      httpStatus: HttpStatus.OK,
    };
  }
  
  @Get('detailed')
  getDetailedHealth(): any {
    const baseHealth = this.getHealth();
    
    // Add more detailed diagnostics
    const detailed = {
      ...baseHealth,
      system: {
        pid: process.pid,
        ppid: process.ppid,
        cwd: process.cwd(),
        execPath: process.execPath,
        argv: process.argv,
      },
      resources: {
        cpuUsage: process.cpuUsage(),
        resourceUsage: process.resourceUsage?.() || null,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: Intl.DateTimeFormat().resolvedOptions().locale,
      }
    };
    
    return detailed;
  }
  
  private formatUptime(uptime: number): string {
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }
}