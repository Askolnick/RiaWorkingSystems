/**
 * RIA Business Template Engine
 * 
 * Template processing, customization, and instantiation engine
 * Based on Buoy's sophisticated template customization patterns
 */

import { v4 as uuid } from 'uuid';
import { addHours, addDays, parseISO, format } from 'date-fns';
import {
  BusinessTemplate,
  TemplateInstance,
  TemplateCustomization,
  TemplateTask,
  TemplatePhase,
  BusinessRole,
  TaskLocation,
  ResourceReference,
  TemplateFilter,
  TemplateMetrics
} from './types';

export interface TemplateEngineOptions {
  enableValidation: boolean;
  enableMetrics: boolean;
  enableCaching: boolean;
  defaultTimeZone: string;
}

export class TemplateEngine {
  private templates = new Map<string, BusinessTemplate>();
  private instances = new Map<string, TemplateInstance>();
  private metrics = new Map<string, TemplateMetrics>();
  private options: TemplateEngineOptions;

  constructor(options: Partial<TemplateEngineOptions> = {}) {
    this.options = {
      enableValidation: true,
      enableMetrics: true,
      enableCaching: true,
      defaultTimeZone: 'UTC',
      ...options,
    };
  }

  /**
   * Register a template
   */
  registerTemplate(template: BusinessTemplate): void {
    if (this.options.enableValidation) {
      this.validateTemplate(template);
    }

    this.templates.set(template.id, {
      ...template,
      updated: new Date(),
    });

    // Initialize metrics if enabled
    if (this.options.enableMetrics && !this.metrics.has(template.id)) {
      this.initializeMetrics(template.id);
    }
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): BusinessTemplate | null {
    return this.templates.get(templateId) || null;
  }

  /**
   * Search templates with filtering
   */
  searchTemplates(filter: TemplateFilter = {}): BusinessTemplate[] {
    let results = Array.from(this.templates.values());

    // Apply filters
    if (filter.category) {
      results = results.filter(t => filter.category!.includes(t.category));
    }

    if (filter.type) {
      results = results.filter(t => filter.type!.includes(t.type));
    }

    if (filter.complexity) {
      results = results.filter(t => filter.complexity!.includes(t.complexity));
    }

    if (filter.tags) {
      results = results.filter(t => 
        filter.tags!.some(tag => t.tags.includes(tag))
      );
    }

    if (filter.industry) {
      results = results.filter(t =>
        t.industry && filter.industry!.some(industry => 
          t.industry!.includes(industry)
        )
      );
    }

    if (filter.companySize) {
      results = results.filter(t =>
        t.companySize && filter.companySize!.includes(t.companySize)
      );
    }

    if (filter.roles) {
      results = results.filter(t =>
        t.applicableRoles && filter.roles!.some(role =>
          t.applicableRoles!.includes(role)
        )
      );
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      results = results.filter(t =>
        t.name.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    const sortBy = filter.sortBy || 'updated';
    const sortOrder = filter.sortOrder || 'desc';

    results.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'created':
          aValue = a.created.getTime();
          bValue = b.created.getTime();
          break;
        case 'updated':
          aValue = a.updated.getTime();
          bValue = b.updated.getTime();
          break;
        case 'complexity':
          const complexityOrder = { simple: 1, medium: 2, complex: 3 };
          aValue = complexityOrder[a.complexity];
          bValue = complexityOrder[b.complexity];
          break;
        case 'popularity':
          const aMetrics = this.metrics.get(a.id);
          const bMetrics = this.metrics.get(b.id);
          aValue = aMetrics?.usage.totalInstances || 0;
          bValue = bMetrics?.usage.totalInstances || 0;
          break;
        default:
          aValue = a.updated.getTime();
          bValue = b.updated.getTime();
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return results;
  }

  /**
   * Create template instance with customizations
   */
  instantiateTemplate(
    templateId: string,
    instanceData: {
      name: string;
      description?: string;
      startDate: Date;
      customizations?: TemplateCustomization;
      projectId?: string;
      tenantId: string;
      createdBy: string;
    }
  ): TemplateInstance {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const instanceId = uuid();
    
    // Apply customizations with proper defaults
    const customizations: TemplateCustomization = instanceData.customizations || {
      templateId,
      taskModifications: {
        add: [],
        modify: [],
        remove: [],
      },
      roleAssignments: {
        'project-manager': [],
        'technical-lead': [],
        'resource-coordinator': [],
        'quality-officer': [],
        'stakeholder': [],
        'team-member': [],
        'finance-manager': [],
        'compliance-officer': [],
      },
      customFields: {},
    };

    // Calculate estimated end date
    const estimatedEndDate = this.calculateEndDate(
      template, 
      instanceData.startDate, 
      customizations
    );

    // Create instance
    const instance: TemplateInstance = {
      id: instanceId,
      templateId,
      templateVersion: template.version,
      name: instanceData.name,
      description: instanceData.description,
      startDate: instanceData.startDate,
      endDate: estimatedEndDate,
      status: 'draft',
      customizations: {
        addedTasks: (customizations.taskModifications.add || []).map(task => ({
          ...task,
          id: uuid(),
        })),
        modifiedTasks: customizations.taskModifications.modify?.map(mod => ({
          taskId: mod.taskId,
          changes: mod.changes
        })) || [],
        removedTaskIds: customizations.taskModifications.remove || [],
        roleAssignments: customizations.roleAssignments,
        customFields: customizations.customFields,
      },
      progress: {
        phase: template.phases[0]?.id || '',
        tasksCompleted: 0,
        totalTasks: this.calculateTotalTasks(template, customizations),
        percentComplete: 0,
        estimatedCompletion: estimatedEndDate,
      },
      projectId: instanceData.projectId,
      tenantId: instanceData.tenantId,
      createdBy: instanceData.createdBy,
      created: new Date(),
      updated: new Date(),
    };

    this.instances.set(instanceId, instance);

    // Update metrics
    if (this.options.enableMetrics) {
      this.updateTemplateMetrics(templateId, 'instance_created');
    }

    return instance;
  }

  /**
   * Get template instance
   */
  getInstance(instanceId: string): TemplateInstance | null {
    return this.instances.get(instanceId) || null;
  }

  /**
   * Update instance progress
   */
  updateInstanceProgress(
    instanceId: string,
    progress: Partial<TemplateInstance['progress']>
  ): TemplateInstance {
    const instance = this.getInstance(instanceId);
    if (!instance) {
      throw new Error(`Instance not found: ${instanceId}`);
    }

    const updatedInstance = {
      ...instance,
      progress: { ...instance.progress, ...progress },
      updated: new Date(),
    };

    this.instances.set(instanceId, updatedInstance);
    return updatedInstance;
  }

  /**
   * Generate task list with scheduling for an instance
   */
  generateTaskList(instanceId: string): Array<TemplateTask & {
    scheduledStart: Date;
    scheduledEnd: Date;
    assignedUsers: string[];
  }> {
    const instance = this.getInstance(instanceId);
    if (!instance) {
      throw new Error(`Instance not found: ${instanceId}`);
    }

    const template = this.getTemplate(instance.templateId);
    if (!template) {
      throw new Error(`Template not found: ${instance.templateId}`);
    }

    const tasks: Array<TemplateTask & {
      scheduledStart: Date;
      scheduledEnd: Date;
      assignedUsers: string[];
    }> = [];

    // Process each phase
    let currentPhaseStart = instance.startDate;
    
    for (const phase of template.phases) {
      // Skip removed tasks
      const phaseTasks = phase.tasks.filter(task => 
        !instance.customizations.removedTaskIds.includes(task.id)
      );

      // Apply task modifications
      const processedTasks = phaseTasks.map(task => {
        const modification = instance.customizations.modifiedTasks.find(
          mod => mod.taskId === task.id
        );
        return modification ? { ...task, ...modification.changes } : task;
      });

      // Add phase tasks with scheduling
      for (const task of processedTasks) {
        const scheduledStart = this.calculateTaskStartDate(
          task,
          currentPhaseStart,
          instance.startDate,
          tasks
        );

        const estimatedHours = task.estimatedHours || 8; // Default 1 day
        const scheduledEnd = addHours(scheduledStart, estimatedHours);

        // Get assigned users from role assignments
        const assignedUsers = task.assignedRole && task.assignedRole in instance.customizations.roleAssignments
          ? instance.customizations.roleAssignments[task.assignedRole as BusinessRole] || []
          : [];

        tasks.push({
          ...task,
          scheduledStart,
          scheduledEnd,
          assignedUsers,
        });
      }

      // Update phase start for next phase
      if (phase.estimatedDuration) {
        currentPhaseStart = addHours(currentPhaseStart, phase.estimatedDuration);
      }
    }

    // Add custom tasks
    for (const customTask of instance.customizations.addedTasks) {
      const taskWithId = { ...customTask, id: uuid() };
      const scheduledStart = this.calculateTaskStartDate(
        taskWithId,
        currentPhaseStart,
        instance.startDate,
        tasks
      );

      const estimatedHours = taskWithId.estimatedHours || 8;
      const scheduledEnd = addHours(scheduledStart, estimatedHours);

      const assignedUsers = taskWithId.assignedRole && taskWithId.assignedRole in instance.customizations.roleAssignments
        ? instance.customizations.roleAssignments[taskWithId.assignedRole as BusinessRole] || []
        : [];

      tasks.push({
        ...taskWithId,
        scheduledStart,
        scheduledEnd,
        assignedUsers,
      });
    }

    return tasks.sort((a, b) => a.scheduledStart.getTime() - b.scheduledStart.getTime());
  }

  /**
   * Validate template structure
   */
  private validateTemplate(template: BusinessTemplate): void {
    if (!template.id || !template.name) {
      throw new Error('Template must have id and name');
    }

    if (template.phases.length === 0) {
      throw new Error('Template must have at least one phase');
    }

    // Validate phase order
    const orders = template.phases.map(p => p.order);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      throw new Error('Phase orders must be unique');
    }

    // Validate task dependencies
    for (const phase of template.phases) {
      for (const task of phase.tasks) {
        if (task.dependencies) {
          const allTaskIds = template.phases.flatMap(p => p.tasks.map(t => t.id));
          const invalidDeps = task.dependencies.filter(dep => !allTaskIds.includes(dep));
          if (invalidDeps.length > 0) {
            throw new Error(`Task ${task.id} has invalid dependencies: ${invalidDeps.join(', ')}`);
          }
        }
      }
    }
  }

  /**
   * Calculate template instance end date
   */
  private calculateEndDate(
    template: BusinessTemplate,
    startDate: Date,
    customizations: TemplateCustomization
  ): Date {
    let totalHours = 0;

    // Sum up phase durations
    for (const phase of template.phases) {
      totalHours += phase.estimatedDuration || 40; // Default 1 work week per phase
    }

    // Add custom task durations
    if (customizations.taskModifications.add) {
      totalHours += customizations.taskModifications.add.reduce(
        (sum, task) => sum + (task.estimatedHours || 8),
        0
      );
    }

    // Apply timeline adjustments
    if (customizations.timelineAdjustments?.phaseAdjustments) {
      const adjustmentHours = customizations.timelineAdjustments.phaseAdjustments.reduce(
        (sum, adj) => sum + adj.adjustmentHours,
        0
      );
      totalHours += adjustmentHours;
    }

    return addHours(startDate, totalHours);
  }

  /**
   * Calculate total task count
   */
  private calculateTotalTasks(
    template: BusinessTemplate,
    customizations: TemplateCustomization
  ): number {
    let totalTasks = 0;

    // Count template tasks (minus removed ones)
    for (const phase of template.phases) {
      totalTasks += phase.tasks.filter(task => 
        !customizations.taskModifications.remove?.includes(task.id)
      ).length;
    }

    // Add custom tasks
    totalTasks += customizations.taskModifications.add?.length || 0;

    return totalTasks;
  }

  /**
   * Calculate task start date based on schedule type and dependencies
   */
  private calculateTaskStartDate(
    task: TemplateTask,
    phaseStart: Date,
    templateStart: Date,
    existingTasks: Array<TemplateTask & { scheduledEnd: Date }>
  ): Date {
    switch (task.scheduleType) {
      case 'immediate':
        return new Date();
      
      case 'template-start':
        return task.dueOffset 
          ? addHours(templateStart, task.dueOffset)
          : templateStart;
      
      case 'phase-start':
        return task.dueOffset
          ? addHours(phaseStart, task.dueOffset)
          : phaseStart;
      
      case 'dependency':
        if (task.dependencies && task.dependencies.length > 0) {
          // Find latest dependency completion time
          const dependencyEndTimes = task.dependencies.map(depId => {
            const dep = existingTasks.find(t => t.id === depId);
            return dep ? dep.scheduledEnd : templateStart;
          });
          
          const latestDependencyEnd = new Date(Math.max(...dependencyEndTimes.map(d => d.getTime())));
          return task.dueOffset
            ? addHours(latestDependencyEnd, task.dueOffset)
            : latestDependencyEnd;
        }
        return phaseStart;
      
      default:
        return phaseStart;
    }
  }

  /**
   * Initialize metrics for a template
   */
  private initializeMetrics(templateId: string): void {
    this.metrics.set(templateId, {
      templateId,
      usage: {
        totalInstances: 0,
        activeInstances: 0,
        completedInstances: 0,
        avgCompletionTime: 0,
        successRate: 0,
      },
      performance: {
        avgTaskCompletionTime: {},
        commonCustomizations: [],
        bottleneckTasks: [],
      },
      feedback: {
        avgRating: 0,
        totalRatings: 0,
        commonIssues: [],
        improvementSuggestions: [],
      },
    });
  }

  /**
   * Update template metrics
   */
  private updateTemplateMetrics(templateId: string, event: string): void {
    const metrics = this.metrics.get(templateId);
    if (!metrics) return;

    switch (event) {
      case 'instance_created':
        metrics.usage.totalInstances++;
        metrics.usage.activeInstances++;
        break;
      
      case 'instance_completed':
        metrics.usage.completedInstances++;
        metrics.usage.activeInstances--;
        break;
      
      case 'instance_cancelled':
        metrics.usage.activeInstances--;
        break;
    }

    this.metrics.set(templateId, metrics);
  }

  /**
   * Get template metrics
   */
  getTemplateMetrics(templateId: string): TemplateMetrics | null {
    return this.metrics.get(templateId) || null;
  }

  /**
   * Export template as JSON
   */
  exportTemplate(templateId: string): string {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    return JSON.stringify(template, null, 2);
  }

  /**
   * Import template from JSON
   */
  importTemplate(templateJson: string): BusinessTemplate {
    try {
      const template = JSON.parse(templateJson) as BusinessTemplate;
      
      // Ensure dates are properly parsed
      template.created = new Date(template.created);
      template.updated = new Date(template.updated);
      
      this.registerTemplate(template);
      return template;
    } catch (error) {
      throw new Error(`Failed to import template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}