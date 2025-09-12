import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { globalConfig, validateConfig, getConfig } from '@ria/config';

async function bootstrap() {
  try {
    console.log('🚀 Starting RIA Management API Server...');
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Configuration is automatically loaded in constructor
    console.log('🔧 Initializing configuration...');
    
    // Validate all configuration
    const validationErrors = validateConfig();
    if (validationErrors.length > 0) {
      console.error('\n❌ Configuration validation failed:');
      validationErrors.forEach(error => {
        console.error(`   ${error.key}: ${error.error}`);
      });
      console.error('\n💡 Please check your environment variables or .env file');
      console.error('📖 See .env.example for required configuration');
      process.exit(1);
    }
    
    console.log('✅ Configuration validated successfully');
    
    // Log key configuration values (without sensitive data)
    const apiConfig = getConfig('api');
    const dbConfig = getConfig('database');
    const securityConfig = getConfig('security');
    const featuresConfig = getConfig('features');
    
    if (apiConfig) {
      console.log(`🌐 API Config:`);
      console.log(`   Host: ${apiConfig.host}`);
      console.log(`   Port: ${apiConfig.port}`);
      console.log(`   CORS: ${apiConfig.cors.enabled ? '✅ Enabled' : '❌ Disabled'}`);
      console.log(`   Rate Limiting: ${apiConfig.rateLimit.enabled ? '✅ Enabled' : '❌ Disabled'}`);
    }
    
    if (dbConfig) {
      console.log(`🗄️  Database Config:`);
      console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
      console.log(`   Database: ${dbConfig.name}`);
      console.log(`   SSL: ${dbConfig.ssl ? '✅ Enabled' : '❌ Disabled'}`);
      console.log(`   Pool Size: ${dbConfig.poolSize}`);
    }
    
    if (securityConfig) {
      console.log(`🔐 Security Config:`);
      console.log(`   HTTPS: ${securityConfig.enableHttps ? '✅ Enabled' : '❌ Disabled'}`);
      console.log(`   XSS Protection: ${securityConfig.enableXssProtection ? '✅ Enabled' : '❌ Disabled'}`);
      console.log(`   CSRF Protection: ${securityConfig.enableCsrfProtection ? '✅ Enabled' : '❌ Disabled'}`);
      console.log(`   CSP: ${securityConfig.enableContentSecurityPolicy ? '✅ Enabled' : '❌ Disabled'}`);
    }
    
    if (featuresConfig) {
      console.log(`🎛️  Feature Flags:`);
      console.log(`   Debug Mode: ${featuresConfig.enableDebugMode ? '✅ Enabled' : '❌ Disabled'}`);
      console.log(`   Experimental: ${featuresConfig.enableExperimentalFeatures ? '✅ Enabled' : '❌ Disabled'}`);
      console.log(`   Background Jobs: ${featuresConfig.enableBackgroundJobs ? '✅ Enabled' : '❌ Disabled'}`);
      console.log(`   Metrics: ${featuresConfig.enableMetrics ? '✅ Enabled' : '❌ Disabled'}`);
    }
    
    // Create NestJS application
    console.log('⚡ Creating NestJS application...');
    const app = await NestFactory.create(AppModule);
    
    // Enable CORS if configured
    if (apiConfig?.cors.enabled) {
      app.enableCors({
        origin: apiConfig.cors.origins,
        methods: apiConfig.cors.methods,
        credentials: true,
      });
      console.log('🌐 CORS enabled for origins:', apiConfig.cors.origins.join(', '));
    }
    
    // Add global prefix
    app.setGlobalPrefix('api');
    
    // Start server
    const port = apiConfig?.port || 3002;
    const host = apiConfig?.host || '0.0.0.0';
    
    await app.listen(port, host);
    
    console.log('\n🎉 API Server started successfully!');
    console.log(`📡 Server: http://${host}:${port}`);
    console.log(`🔗 Health Check: http://${host}:${port}/api/health`);
    
    // Log configuration health
    const health = globalConfig.getHealthStatus();
    const healthStatus = health.healthy ? '✅ Healthy' : '❌ Unhealthy';
    console.log(`📊 Config Health: ${healthStatus} (${health.validationErrors} errors)`);
    
    if (health.lastReload) {
      console.log(`📅 Last Config Reload: ${health.lastReload.toISOString()}`);
    }
    
    // Log startup completion
    console.log('\n🚀 RIA Management API is ready to handle requests!');
    
  } catch (error) {
    console.error('\n💥 Failed to start API server:');
    console.error(error);
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Check your .env file configuration');
    console.error('   2. Ensure database is running and accessible');
    console.error('   3. Verify all required environment variables are set');
    console.error('   4. Check for port conflicts');
    process.exit(1);
  }
}

bootstrap();
