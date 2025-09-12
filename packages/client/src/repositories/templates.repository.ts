/**
 * Templates Repository
 * 
 * Data access layer for business templates
 */

import { BaseRepository, MockRepository } from './base.repository';

// Define types locally until templates package is available
interface BusinessTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  fields: TemplateField[];
  layout?: any;
  style?: any;
}

interface TemplateInstance {
  id: string;
  templateId: string;
  name: string;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface TemplateField {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  required?: boolean;
  options?: string[];
  defaultValue?: any;
}

export interface CreateInstanceRequest {
  templateId: string;
  name: string;
  description?: string;
  startDate: Date;
  customizations?: any;
  projectId?: string;
  tenantId?: string;
  createdBy?: string;
}

export interface UpdateInstanceRequest {
  name?: string;
  description?: string;
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  customizations?: any;
  progress?: {
    phase?: string;
    tasksCompleted?: number;
    percentComplete?: number;
  };
}

export class TemplatesRepository extends BaseRepository<BusinessTemplate> {
  protected endpoint = '/templates';

  async getTemplates(filter?: any) {
    const params = new URLSearchParams();
    if (filter?.category) params.append('category', filter.category);
    if (filter?.type) params.append('type', filter.type);
    if (filter?.search) params.append('search', filter.search);
    if (filter?.includeMetrics) params.append('includeMetrics', 'true');
    
    return this.request('GET', `?${params.toString()}`);
  }

  async getTemplate(id: string, includeMetrics = false) {
    const params = includeMetrics ? '?includeMetrics=true' : '';
    return this.request('GET', `/${id}${params}`);
  }

  async createInstance(data: CreateInstanceRequest) {
    return this.request('POST', '/instances', data);
  }

  async getInstance(id: string) {
    return this.request('GET', `/instances/${id}`);
  }

  async updateInstance(id: string, updates: UpdateInstanceRequest) {
    return this.request('PUT', `/instances/${id}`, updates);
  }

  async generateTasks(instanceId: string) {
    return this.request('GET', `/instances/${instanceId}/tasks`);
  }

  async exportTemplate(id: string) {
    return this.request('GET', `/${id}/export`);
  }

  async importTemplate(templateJson: string) {
    return this.request('POST', '/import', { templateJson });
  }

  async getRecommendations(context: any) {
    const params = new URLSearchParams();
    if (context.industry) params.append('industry', context.industry);
    if (context.companySize) params.append('companySize', context.companySize);
    
    return this.request('GET', `/recommendations?${params.toString()}`);
  }

  async cloneTemplate(id: string, name: string) {
    return this.request('POST', `/${id}/clone`, { name });
  }

  async getStats() {
    return this.request('GET', '/stats');
  }
}

// Mock implementation for development
export class MockTemplatesRepository extends MockRepository<BusinessTemplate> {
  protected storageKey = 'ria_templates';
  protected endpoint = '/templates';
  protected items: Map<string, BusinessTemplate> = new Map();
  
  private instances: Map<string, TemplateInstance> = new Map();

  constructor() {
    super();
    // Initialize with built-in templates
    this.initializeTemplates();
  }

  private initializeTemplates() {
    const existingData = this.getStorage();
    if (!existingData || existingData.length === 0) {
      // Add sample templates for now
      const sampleTemplates: BusinessTemplate[] = [
        {
          id: '1',
          name: 'Invoice Template',
          category: 'Finance',
          description: 'Standard invoice template',
          fields: [
            { name: 'invoiceNumber', type: 'text', required: true },
            { name: 'amount', type: 'number', required: true },
            { name: 'dueDate', type: 'date', required: true }
          ]
        },
        {
          id: '2',
          name: 'Project Proposal',
          category: 'Business',
          description: 'Project proposal template',
          fields: [
            { name: 'projectName', type: 'text', required: true },
            { name: 'budget', type: 'number', required: true },
            { name: 'timeline', type: 'text', required: true }
          ]
        }
      ];
      
      sampleTemplates.forEach(template => {
        this.items.set(template.id, template);
      });
      this.setStorage(Array.from(this.items.values()));
    }
  }

  async getTemplates(filter?: any) {
    await this.simulateDelay();
    
    let templates = Array.from(this.items.values());
    
    if (filter?.category && filter.category !== 'all') {
      templates = templates.filter(t => t.category === filter.category);
    }
    
    if (filter?.type) {
      templates = templates.filter(t => t.type === filter.type);
    }
    
    if (filter?.search) {
      const query = filter.search.toLowerCase();
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    const response: any = {
      success: true,
      data: templates,
      count: templates.length
    };
    
    if (filter?.includeMetrics) {
      response.metrics = {};
      templates.forEach(t => {
        response.metrics[t.id] = {
          usageCount: Math.floor(Math.random() * 100),
          avgCompletionTime: Math.floor(Math.random() * 30) + 10,
          successRate: Math.random() * 0.3 + 0.7
        };
      });
    }
    
    return response;
  }

  async getTemplate(id: string, includeMetrics = false) {
    await this.simulateDelay();
    
    const template = this.items.get(id);
    if (!template) {
      throw new Error('Template not found');
    }
    
    const response: any = {
      success: true,
      data: template
    };
    
    if (includeMetrics) {
      response.metrics = {
        usageCount: Math.floor(Math.random() * 100),
        avgCompletionTime: Math.floor(Math.random() * 30) + 10,
        successRate: Math.random() * 0.3 + 0.7
      };
    }
    
    return response;
  }

  async createInstance(data: CreateInstanceRequest) {
    await this.simulateDelay();
    
    const template = this.items.get(data.templateId);
    if (!template) {
      throw new Error('Template not found');
    }
    
    const instance: TemplateInstance = {
      id: this.generateId(),
      templateId: data.templateId,
      name: data.name,
      description: data.description,
      startDate: data.startDate,
      endDate: new Date(data.startDate.getTime() + (template.estimatedDuration || 30) * 24 * 60 * 60 * 1000),
      status: 'active',
      progress: {
        currentPhase: template.phases[0]?.id || '',
        completedPhases: [],
        tasksCompleted: 0,
        totalTasks: template.phases.reduce((sum, p) => sum + (p.tasks?.length || 0), 0),
        percentComplete: 0
      },
      customizations: data.customizations || {},
      projectId: data.projectId,
      tenantId: data.tenantId || 'default',
      createdBy: data.createdBy || 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.instances.set(instance.id, instance);
    
    return {
      success: true,
      data: instance,
      message: 'Template instance created successfully'
    };
  }

  async getInstance(id: string) {
    await this.simulateDelay();
    
    const instance = this.instances.get(id);
    if (!instance) {
      throw new Error('Instance not found');
    }
    
    return {
      success: true,
      data: instance
    };
  }

  async updateInstance(id: string, updates: UpdateInstanceRequest) {
    await this.simulateDelay();
    
    const instance = this.instances.get(id);
    if (!instance) {
      throw new Error('Instance not found');
    }
    
    const updatedInstance = {
      ...instance,
      ...updates,
      updatedAt: new Date()
    };
    
    this.instances.set(id, updatedInstance);
    
    return {
      success: true,
      data: updatedInstance,
      message: 'Instance updated successfully'
    };
  }

  async generateTasks(instanceId: string) {
    await this.simulateDelay();
    
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error('Instance not found');
    }
    
    const template = this.items.get(instance.templateId);
    if (!template) {
      throw new Error('Template not found');
    }
    
    const tasks = template.phases.flatMap(phase => 
      phase.tasks?.map(task => ({
        ...task,
        phaseId: phase.id,
        phaseName: phase.name,
        instanceId,
        status: 'pending',
        dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000)
      })) || []
    );
    
    return {
      success: true,
      data: tasks,
      count: tasks.length
    };
  }

  async getRecommendations(context: any) {
    await this.simulateDelay();
    
    let templates = Array.from(this.items.values());
    
    // Simple recommendation logic
    if (context.industry) {
      templates = templates.filter(t => 
        t.industry?.includes(context.industry) || !t.industry
      );
    }
    
    if (context.companySize) {
      templates = templates.filter(t => 
        t.companySize?.includes(context.companySize) || !t.companySize
      );
    }
    
    // Return top 5 templates
    return {
      success: true,
      data: templates.slice(0, 5),
      count: Math.min(5, templates.length)
    };
  }

  async cloneTemplate(id: string, name: string) {
    await this.simulateDelay();
    
    const original = this.items.get(id);
    if (!original) {
      throw new Error('Template not found');
    }
    
    const cloned: BusinessTemplate = {
      ...original,
      id: this.generateId(),
      name,
      author: 'Custom',
      featured: false,
      created: new Date(),
      updated: new Date(),
      version: '1.0.0-custom'
    };
    
    this.items.set(cloned.id, cloned);
    this.saveToStorage();
    
    return {
      success: true,
      data: cloned,
      message: 'Template cloned successfully'
    };
  }
}

// Export the mock repository for development
export const templatesRepository = new MockTemplatesRepository();