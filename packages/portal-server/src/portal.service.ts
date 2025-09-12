import { z } from 'zod';
import type { DashboardLayout, WidgetInstance, DataQuery, Entity, Viz } from './types';

// Zod schemas for validation
const DataQuerySchema = z.object({
  entity: z.enum(['tasks', 'messages', 'contacts', 'invoices', 'expenses', 'wiki']),
  fields: z.array(z.string()),
  filters: z.array(z.object({
    field: z.string(),
    op: z.enum(['=', '!=', 'contains', 'in', '>', '<']),
    value: z.union([z.string(), z.number(), z.boolean()]),
  })),
  limit: z.number().optional(),
  viz: z.enum(['tile', 'list', 'chart']),
});

const WidgetInstanceSchema = z.object({
  id: z.string(),
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  w: z.number().int().min(1).max(12),
  h: z.number().int().min(1),
  query: DataQuerySchema.optional(),
  config: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
});

const DashboardLayoutSchema = z.object({
  name: z.string().min(1).default('default'),
  widgets: z.array(WidgetInstanceSchema).default([]),
  cols: z.number().int().min(1).max(24).default(12),
  rowHeight: z.number().int().min(20).default(90),
  gap: z.number().int().min(0).default(8),
});

const UpdateDashboardLayoutSchema = DashboardLayoutSchema.partial();

export type CreateDashboardLayoutInput = z.infer<typeof DashboardLayoutSchema>;
export type UpdateDashboardLayoutInput = z.infer<typeof UpdateDashboardLayoutSchema>;

/**
 * Portal Service - Business logic layer for dashboard layouts and widgets
 * This service handles portal/dashboard operations following the clean architecture pattern.
 */
export class PortalService {
  constructor(private readonly portalRepository: any) {}

  /**
   * Get dashboard layout by name for a user
   */
  async getLayout(tenantId: string, userId: string, name = 'default'): Promise<DashboardLayout | null> {
    return this.portalRepository.findLayout({
      tenantId,
      userId,
      name,
    });
  }

  /**
   * Save/update dashboard layout
   */
  async saveLayout(
    tenantId: string, 
    userId: string, 
    input: CreateDashboardLayoutInput
  ): Promise<DashboardLayout> {
    const validatedInput = DashboardLayoutSchema.parse(input);
    
    // Check if layout already exists
    const existing = await this.getLayout(tenantId, userId, validatedInput.name);
    
    if (existing) {
      // Update existing layout
      return this.portalRepository.updateLayout(existing.id, {
        ...validatedInput,
        updatedAt: new Date(),
      });
    } else {
      // Create new layout
      return this.portalRepository.createLayout({
        ...validatedInput,
        tenantId,
        userId,
        id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  /**
   * List all layouts for a user
   */
  async listLayouts(tenantId: string, userId: string): Promise<DashboardLayout[]> {
    return this.portalRepository.findAllLayouts({
      tenantId,
      userId,
    });
  }

  /**
   * Delete a layout
   */
  async deleteLayout(tenantId: string, userId: string, name: string): Promise<void> {
    const layout = await this.getLayout(tenantId, userId, name);
    if (layout) {
      return this.portalRepository.deleteLayout(layout.id);
    }
    throw new Error('Layout not found');
  }

  /**
   * Add widget to layout
   */
  async addWidget(
    tenantId: string, 
    userId: string, 
    layoutName: string, 
    widget: Omit<WidgetInstance, 'id'>
  ): Promise<DashboardLayout> {
    const layout = await this.getLayout(tenantId, userId, layoutName);
    if (!layout) {
      throw new Error('Layout not found');
    }

    const validatedWidget = WidgetInstanceSchema.parse({
      ...widget,
      id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
    });

    const updatedLayout = {
      ...layout,
      widgets: [...layout.widgets, validatedWidget],
      updatedAt: new Date(),
    };

    return this.portalRepository.updateLayout(layout.id, updatedLayout);
  }

  /**
   * Update widget in layout
   */
  async updateWidget(
    tenantId: string, 
    userId: string, 
    layoutName: string, 
    widgetId: string, 
    updates: Partial<WidgetInstance>
  ): Promise<DashboardLayout> {
    const layout = await this.getLayout(tenantId, userId, layoutName);
    if (!layout) {
      throw new Error('Layout not found');
    }

    const widgetIndex = layout.widgets.findIndex(w => w.id === widgetId);
    if (widgetIndex === -1) {
      throw new Error('Widget not found');
    }

    const updatedWidget = { ...layout.widgets[widgetIndex], ...updates };
    const validatedWidget = WidgetInstanceSchema.parse(updatedWidget);

    const updatedWidgets = [...layout.widgets];
    updatedWidgets[widgetIndex] = validatedWidget;

    const updatedLayout = {
      ...layout,
      widgets: updatedWidgets,
      updatedAt: new Date(),
    };

    return this.portalRepository.updateLayout(layout.id, updatedLayout);
  }

  /**
   * Remove widget from layout
   */
  async removeWidget(
    tenantId: string, 
    userId: string, 
    layoutName: string, 
    widgetId: string
  ): Promise<DashboardLayout> {
    const layout = await this.getLayout(tenantId, userId, layoutName);
    if (!layout) {
      throw new Error('Layout not found');
    }

    const updatedWidgets = layout.widgets.filter(w => w.id !== widgetId);
    
    const updatedLayout = {
      ...layout,
      widgets: updatedWidgets,
      updatedAt: new Date(),
    };

    return this.portalRepository.updateLayout(layout.id, updatedLayout);
  }

  /**
   * Execute data query for a widget
   */
  async executeDataQuery(tenantId: string, query: DataQuery): Promise<any> {
    const validatedQuery = DataQuerySchema.parse(query);
    
    // This would integrate with the appropriate repository based on the entity
    // For now, return mock data structure
    return this.portalRepository.executeQuery(tenantId, validatedQuery);
  }

  /**
   * Get available fields for an entity
   */
  async getEntityFields(entity: Entity): Promise<string[]> {
    // Import ENTITY_FIELDS from types
    const { ENTITY_FIELDS } = await import('./types');
    return ENTITY_FIELDS[entity] || [];
  }
}