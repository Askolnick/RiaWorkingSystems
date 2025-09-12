import { 
  PortalService, 
  CreateDashboardLayoutInput, 
  UpdateDashboardLayoutInput 
} from './portal.service';
import type { WidgetInstance, DataQuery, Entity } from './types';

/**
 * Portal Controller - HTTP API layer for dashboard and widget management
 * This controller provides RESTful endpoints for portal/dashboard functionality.
 * It follows the clean architecture pattern by delegating business logic to the service layer.
 */
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  /**
   * GET /portal/layouts/:name - Get dashboard layout by name
   */
  async getLayout(tenantId: string, userId: string, name = 'default') {
    return this.portalService.getLayout(tenantId, userId, name);
  }

  /**
   * GET /portal/layouts - List all layouts for user
   */
  async listLayouts(tenantId: string, userId: string) {
    return this.portalService.listLayouts(tenantId, userId);
  }

  /**
   * POST /portal/layouts - Create/update dashboard layout
   */
  async saveLayout(tenantId: string, userId: string, input: CreateDashboardLayoutInput) {
    return this.portalService.saveLayout(tenantId, userId, input);
  }

  /**
   * DELETE /portal/layouts/:name - Delete layout
   */
  async deleteLayout(tenantId: string, userId: string, name: string) {
    return this.portalService.deleteLayout(tenantId, userId, name);
  }

  /**
   * POST /portal/layouts/:name/widgets - Add widget to layout
   */
  async addWidget(
    tenantId: string, 
    userId: string, 
    layoutName: string, 
    widget: Omit<WidgetInstance, 'id'>
  ) {
    return this.portalService.addWidget(tenantId, userId, layoutName, widget);
  }

  /**
   * PATCH /portal/layouts/:name/widgets/:widgetId - Update widget
   */
  async updateWidget(
    tenantId: string, 
    userId: string, 
    layoutName: string, 
    widgetId: string, 
    updates: Partial<WidgetInstance>
  ) {
    return this.portalService.updateWidget(tenantId, userId, layoutName, widgetId, updates);
  }

  /**
   * DELETE /portal/layouts/:name/widgets/:widgetId - Remove widget
   */
  async removeWidget(
    tenantId: string, 
    userId: string, 
    layoutName: string, 
    widgetId: string
  ) {
    return this.portalService.removeWidget(tenantId, userId, layoutName, widgetId);
  }

  /**
   * POST /portal/query - Execute data query for widget
   */
  async executeQuery(tenantId: string, query: DataQuery) {
    return this.portalService.executeDataQuery(tenantId, query);
  }

  /**
   * GET /portal/entities/:entity/fields - Get available fields for entity
   */
  async getEntityFields(entity: Entity) {
    return this.portalService.getEntityFields(entity);
  }
}

// Utility functions for extracting user/tenant from request
export function extractTenantId(headers: Record<string, any>): string {
  return headers['x-tenant-id'] || 'demo-tenant';
}

export function extractUserId(headers: Record<string, any>): string {
  return headers['x-user-id'] || 'demo-user';
}

// Export types for use in the main API application
export type { 
  CreateDashboardLayoutInput,
  UpdateDashboardLayoutInput 
};