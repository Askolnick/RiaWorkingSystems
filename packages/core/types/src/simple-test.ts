/**
 * Simple test file to verify package compilation
 */

export interface SimpleTemplate {
  id: string;
  name: string;
  description: string;
}

export const testTemplate: SimpleTemplate = {
  id: 'test-template',
  name: 'Test Template',
  description: 'A simple test template'
};

export function createTemplate(name: string, description: string): SimpleTemplate {
  return {
    id: `template-${Date.now()}`,
    name,
    description
  };
}