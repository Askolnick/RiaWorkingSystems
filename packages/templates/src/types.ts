/**
 * RIA Business Template System - Core Types
 * 
 * Type definitions for business planning templates, based on Buoy's
 * sophisticated phase-based disaster planning patterns
 */

export type TemplatePriority = 'critical' | 'high' | 'normal' | 'low';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
export type TemplatePhaseName = 'planning' | 'execution' | 'monitoring' | 'review';
export type BusinessRole = 
  | 'project-manager'
  | 'technical-lead' 
  | 'resource-coordinator'
  | 'quality-officer'
  | 'stakeholder'
  | 'team-member'
  | 'finance-manager'
  | 'compliance-officer';

export type LocationType = 'office' | 'client-site' | 'remote' | 'virtual' | 'service-area';

// Location context for business tasks
export interface TaskLocation {
  id: string;
  name: string;
  type: LocationType;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  metadata?: {
    timezone?: string;
    capacity?: number;
    facilities?: string[];
    contacts?: string[];
  };
}

// Business resource reference
export interface ResourceReference {
  id: string;
  type: 'contact' | 'document' | 'system' | 'equipment' | 'budget';
  name: string;
  category?: string;
  required: boolean;
  notes?: string;
}

// Template task definition
export interface TemplateTask {
  id: string;
  title: string;
  description: string;
  phase: TemplatePhaseName;
  priority: TemplatePriority;
  
  // Assignment
  assignedRole?: BusinessRole;
  estimatedHours?: number;
  dependencies?: string[]; // Task IDs
  
  // Scheduling
  dueOffset?: number; // Hours from template start/phase start
  scheduleType: 'immediate' | 'phase-start' | 'template-start' | 'dependency';
  
  // Context
  location?: TaskLocation;
  resources?: ResourceReference[];
  tags?: string[];
  
  // Customization
  customizable: boolean;
  required: boolean;
  
  // Business-specific
  category?: string;
  stakeholders?: string[];
  deliverables?: string[];
  successCriteria?: string[];
}

// Template phase definition
export interface TemplatePhase {
  id: string;
  name: string;
  description: string;
  order: number;
  estimatedDuration?: number; // Hours
  tasks: TemplateTask[];
  prerequisites?: string[]; // Phase IDs
  deliverables?: string[];
}

// Complete business template
export interface BusinessTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  type: TemplateType;
  version: string;
  
  // Phases and structure
  phases: TemplatePhase[];
  
  // Metadata
  tags: string[];
  author: string;
  created: Date;
  updated: Date;
  
  // Configuration
  defaultRoles: BusinessRole[];
  requiredResources: ResourceReference[];
  estimatedDuration?: number; // Total hours
  complexity: 'simple' | 'medium' | 'complex';
  
  // Customization options
  customizable: boolean;
  customizationOptions?: {
    allowPhaseModification: boolean;
    allowTaskModification: boolean;
    allowRoleModification: boolean;
    requiredFields: string[];
  };
  
  // Business context
  industry?: string[];
  companySize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  applicableRoles?: BusinessRole[];
}

// Template categories
export type TemplateCategory = 
  | 'business-continuity'
  | 'project-management'
  | 'process-improvement'
  | 'compliance'
  | 'crisis-management'
  | 'onboarding'
  | 'marketing'
  | 'sales'
  | 'finance'
  | 'hr'
  | 'it'
  | 'operations';

export type TemplateType = 
  | 'project'
  | 'process'
  | 'emergency-plan'
  | 'compliance-audit'
  | 'workflow'
  | 'checklist';

// Template instantiation (creating actual plans from templates)
export interface TemplateInstance {
  id: string;
  templateId: string;
  templateVersion: string;
  name: string;
  description?: string;
  
  // Scheduling
  startDate: Date;
  endDate?: Date;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  
  // Customizations applied
  customizations: {
    addedTasks: TemplateTask[];
    modifiedTasks: Array<{ taskId: string; changes: Partial<TemplateTask> }>;
    removedTaskIds: string[];
    roleAssignments: Record<BusinessRole, string[]>; // Role -> User IDs
    customFields: Record<string, any>;
  };
  
  // Progress tracking
  progress: {
    phase: string;
    tasksCompleted: number;
    totalTasks: number;
    percentComplete: number;
    estimatedCompletion?: Date;
  };
  
  // Context
  projectId?: string;
  tenantId: string;
  createdBy: string;
  created: Date;
  updated: Date;
}

// Template customization options
export interface TemplateCustomization {
  templateId: string;
  
  // Task modifications
  taskModifications: {
    add?: Omit<TemplateTask, 'id'>[];
    modify?: Array<{ taskId: string; changes: Partial<TemplateTask> }>;
    remove?: string[];
  };
  
  // Role assignments
  roleAssignments: Record<BusinessRole, string[]>; // Role -> User IDs
  
  // Timeline adjustments
  timelineAdjustments?: {
    startDate?: Date;
    phaseAdjustments?: Array<{ phaseId: string; adjustmentHours: number }>;
  };
  
  // Custom fields
  customFields: Record<string, any>;
  
  // Location mappings
  locationMappings?: Record<string, TaskLocation>;
}

// Template search and filtering
export interface TemplateFilter {
  category?: TemplateCategory[];
  type?: TemplateType[];
  complexity?: ('simple' | 'medium' | 'complex')[];
  tags?: string[];
  industry?: string[];
  companySize?: ('startup' | 'small' | 'medium' | 'large' | 'enterprise')[];
  roles?: BusinessRole[];
  search?: string;
  sortBy?: 'name' | 'created' | 'updated' | 'popularity' | 'complexity';
  sortOrder?: 'asc' | 'desc';
}

// Template metrics and analytics
export interface TemplateMetrics {
  templateId: string;
  
  usage: {
    totalInstances: number;
    activeInstances: number;
    completedInstances: number;
    avgCompletionTime: number; // Hours
    successRate: number; // 0-1
  };
  
  performance: {
    avgTaskCompletionTime: Record<string, number>; // Task ID -> Hours
    commonCustomizations: Array<{ type: string; frequency: number }>;
    bottleneckTasks: Array<{ taskId: string; avgDelayHours: number }>;
  };
  
  feedback: {
    avgRating: number; // 1-5
    totalRatings: number;
    commonIssues: string[];
    improvementSuggestions: string[];
  };
}