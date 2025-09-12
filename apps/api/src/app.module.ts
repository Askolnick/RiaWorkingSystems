import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { SecurityMiddleware } from './middleware/security.middleware';
import { HealthController } from './controllers/health.controller';
import { TemplatesController } from './controllers/templates.controller';

@Module({ 
  imports: [], 
  controllers: [HealthController, TemplatesController], 
  providers: [SecurityMiddleware] 
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply security middleware to all routes
    consumer
      .apply(SecurityMiddleware)
      .forRoutes('*');
  }
}
