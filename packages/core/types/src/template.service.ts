/**
 * Template Service
 * 
 * Backend service for managing business templates
 */

import { PrismaClient } from '@prisma/client';
import { 
  TemplateEngine,
  BusinessTemplate,
  TemplateInstance,
  TemplateCustomization,
  TemplateFilter,
  TemplateMetrics,
  businessTemplateLibrary,
  getTemplateById,
  getTemplatesByCategory,
  getTemplatesByType
} from '@ria/templates';
import { v4 as uuid } from 'uuid';

export interface CreateTemplateInstanceDto {
  templateId: string;
  name: string;
  description?: string;
  startDate: Date;
  customizations?: TemplateCustomization;
  projectId?: string;
  tenantId: string;
  createdBy: string;
}

export interface UpdateTemplateInstanceDto {
  name?: string;
  description?: string;
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  customizations?: Partial<TemplateCustomization>;
  progress?: {
    phase?: string;
    tasksCompleted?: number;
    percentComplete?: number;
  };
}

export interface TemplateSearchOptions {
  tenantId: string;
  filter?: TemplateFilter;
  includeMetrics?: boolean;
  includeInstances?: boolean;
}

export class TemplateService {
  private engine: TemplateEngine;
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.engine = new TemplateEngine({
      enableValidation: true,
      enableMetrics: true,
      enableCaching: true,
      defaultTimeZone: 'UTC'
    });
    
    this.prisma = prisma || new PrismaClient();
    
    // Register all built-in templates
    this.registerBuiltInTemplates();
  }

  /**
   * Register all built-in business templates
   */
  private registerBuiltInTemplates(): void {
    for (const template of businessTemplateLibrary) {
      this.engine.registerTemplate(template);
    }
  }

  /**
   * Get all available templates
   */
  async getTemplates(options: TemplateSearchOptions): Promise<{
    templates: BusinessTemplate[];
    metrics?: Map<string, TemplateMetrics>;
  }> {
    const templates = this.engine.searchTemplates(options.filter);
    
    const result: {
      templates: BusinessTemplate[];
      metrics?: Map<string, TemplateMetrics>;
    } = { templates };

    if (options.includeMetrics) {
      const metrics = new Map<string, TemplateMetrics>();
      for (const template of templates) {
        const templateMetrics = this.engine.getTemplateMetrics(template.id);
        if (templateMetrics) {
          metrics.set(template.id, templateMetrics);
        }
      }
      result.metrics = metrics;
    }

    return result;
  }

  /**
   * Get a specific template by ID
   */
  async getTemplate(templateId: string, includeMetrics = false): Promise<{
    template: BusinessTemplate | null;
    metrics?: TemplateMetrics | null;
  }> {
    const template = this.engine.getTemplate(templateId);
    
    const result: {
      template: BusinessTemplate | null;
      metrics?: TemplateMetrics | null;
    } = { template };

    if (includeMetrics && template) {
      result.metrics = this.engine.getTemplateMetrics(templateId);
    }

    return result;
  }

  /**
   * Create a new template instance
   */
  async createTemplateInstance(dto: CreateTemplateInstanceDto): Promise<TemplateInstance> {
    // Validate template exists
    const template = this.engine.getTemplate(dto.templateId);
    if (!template) {
      throw new Error(`Template not found: ${dto.templateId}`);
    }

    // Create instance using the engine
    const instance = this.engine.instantiateTemplate(dto.templateId, {
      name: dto.name,
      description: dto.description,
      startDate: dto.startDate,
      customizations: dto.customizations,
      projectId: dto.projectId,
      tenantId: dto.tenantId,
      createdBy: dto.createdBy
    });

    // TODO: Persist to database
    // await this.persistInstance(instance);

    return instance;
  }

  /**
   * Get a template instance
   */
  async getTemplateInstance(instanceId: string, tenantId: string): Promise<TemplateInstance | null> {
    // TODO: Add database lookup
    // const dbInstance = await this.prisma.templateInstance.findFirst({
    //   where: { id: instanceId, tenantId }
    // });

    // For now, return from engine cache
    const instance = this.engine.getInstance(instanceId);
    
    if (instance && instance.tenantId !== tenantId) {
      return null; // Security check
    }

    return instance;
  }

  /**
   * Update a template instance
   */
  async updateTemplateInstance(
    instanceId: string,
    tenantId: string,
    updates: UpdateTemplateInstanceDto
  ): Promise<TemplateInstance> {
    const instance = await this.getTemplateInstance(instanceId, tenantId);
    if (!instance) {
      throw new Error(`Template instance not found: ${instanceId}`);
    }

    // Update progress if provided
    if (updates.progress) {
      this.engine.updateInstanceProgress(instanceId, updates.progress);
    }

    // TODO: Handle other updates and persist to database

    return this.engine.getInstance(instanceId)!;
  }

  /**
   * Generate task list for a template instance
   */
  async generateTaskList(instanceId: string, tenantId: string): Promise<any[]> {
    const instance = await this.getTemplateInstance(instanceId, tenantId);
    if (!instance) {
      throw new Error(`Template instance not found: ${instanceId}`);
    }

    return this.engine.generateTaskList(instanceId);
  }

  /**
   * Export a template as JSON
   */
  async exportTemplate(templateId: string): Promise<string> {
    return this.engine.exportTemplate(templateId);
  }

  /**
   * Import a template from JSON
   */
  async importTemplate(templateJson: string, tenantId: string): Promise<BusinessTemplate> {
    const template = this.engine.importTemplate(templateJson);
    
    // TODO: Add tenant-specific template storage
    // await this.persistTemplate(template, tenantId);
    
    return template;
  }

  /**
   * Get template recommendations based on business context
   */
  async getRecommendations(context: {
    industry?: string;
    companySize?: string;
    currentTasks?: string[];
    tenantId: string;
  }): Promise<BusinessTemplate[]> {
    const filter: TemplateFilter = {};

    if (context.industry) {
      filter.industry = [context.industry];
    }

    if (context.companySize) {
      filter.companySize = [context.companySize as any];
    }

    // Search for relevant templates
    const templates = this.engine.searchTemplates(filter);

    // Sort by relevance (could be enhanced with ML)
    return templates.slice(0, 5); // Return top 5 recommendations
  }

  /**
   * Clone a template for customization
   */
  async cloneTemplate(
    templateId: string,
    newName: string,
    tenantId: string
  ): Promise<BusinessTemplate> {
    const original = this.engine.getTemplate(templateId);
    if (!original) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const cloned: BusinessTemplate = {
      ...original,
      id: uuid(),
      name: newName,
      author: 'Custom',
      created: new Date(),
      updated: new Date(),
      version: '1.0.0-custom'
    };

    this.engine.registerTemplate(cloned);
    
    // TODO: Persist cloned template for tenant
    // await this.persistTemplate(cloned, tenantId);

    return cloned;
  }

  /**
   * Get template statistics for a tenant
   */
  async getTemplateStats(tenantId: string): Promise<{
    totalTemplates: number;
    totalInstances: number;
    activeInstances: number;
    completedInstances: number;
    avgCompletionTime: number;
    popularTemplates: Array<{ templateId: string; count: number }>;
  }> {
    // TODO: Implement database queries for real stats
    
    // Mock stats for now
    const templates = this.engine.searchTemplates();
    
    return {
      totalTemplates: templates.length,
      totalInstances: 0,
      activeInstances: 0,
      completedInstances: 0,
      avgCompletionTime: 0,
      popularTemplates: []
    };
  }

  /**
   * Clean up resources
   */
  async destroy(): Promise<void> {
    await this.prisma.$disconnect();
  }
}