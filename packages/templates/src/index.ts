/**
 * RIA Business Templates Package
 * 
 * Complete business planning template system with engine and library
 */

// Core types
export * from './types';

// Template engine
export { TemplateEngine, type TemplateEngineOptions } from './engine';

// Business template library
export {
  businessTemplateLibrary,
  systemOutageTemplate,
  softwareDevelopmentTemplate,
  employeeOnboardingTemplate,
  getTemplateById,
  getTemplatesByCategory,
  getTemplatesByType,
} from './business-templates';