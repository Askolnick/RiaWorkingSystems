/**
 * RIA Templates Server
 * 
 * Backend services for template management
 */

export {
  TemplateService,
  type CreateTemplateInstanceDto,
  type UpdateTemplateInstanceDto,
  type TemplateSearchOptions
} from './template.service';

// Re-export key types from templates package for convenience
export {
  type BusinessTemplate,
  type TemplateInstance,
  type TemplateCustomization,
  type TemplateFilter,
  type TemplateMetrics,
  type TemplateTask,
  type TemplatePhase,
  type TemplateCategory,
  type TemplateType
} from '@ria/templates';