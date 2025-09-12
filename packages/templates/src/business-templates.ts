/**
 * RIA Business Template Library
 * 
 * Comprehensive collection of business planning templates
 * Based on Buoy's disaster response template patterns
 */

import { BusinessTemplate, TemplateTask, TemplatePhase } from './types';

/**
 * Business Continuity - System Outage Response Template
 */
export const systemOutageTemplate: BusinessTemplate = {
  id: 'business-continuity-system-outage',
  name: 'System Outage Response Plan',
  description: 'Comprehensive response plan for critical system outages affecting business operations',
  category: 'business-continuity',
  type: 'emergency-plan',
  version: '1.0.0',
  tags: ['continuity', 'system', 'outage', 'emergency', 'it'],
  author: 'RIA Templates',
  created: new Date('2024-01-01'),
  updated: new Date('2024-01-01'),
  
  phases: [
    {
      id: 'detection',
      name: 'Detection & Assessment',
      description: 'Identify, assess, and categorize the system outage',
      order: 1,
      estimatedDuration: 2, // 2 hours
      tasks: [
        {
          id: 'detect-outage',
          title: 'Detect System Outage',
          description: 'Identify and confirm system outage through monitoring alerts or user reports',
          phase: 'planning',
          priority: 'critical',
          assignedRole: 'technical-lead',
          estimatedHours: 0.5,
          scheduleType: 'immediate',
          customizable: false,
          required: true,
          category: 'assessment',
          successCriteria: ['Outage confirmed and documented', 'Initial impact assessment completed']
        },
        {
          id: 'assess-impact',
          title: 'Assess Business Impact',
          description: 'Evaluate the scope and business impact of the system outage',
          phase: 'planning',
          priority: 'critical',
          assignedRole: 'project-manager',
          estimatedHours: 1,
          dependencies: ['detect-outage'],
          scheduleType: 'dependency',
          customizable: true,
          required: true,
          category: 'assessment',
          stakeholders: ['executives', 'department-heads'],
          successCriteria: ['Impact severity determined', 'Affected business processes identified']
        },
        {
          id: 'notify-stakeholders',
          title: 'Notify Key Stakeholders',
          description: 'Inform executives, department heads, and key personnel about the outage',
          phase: 'planning',
          priority: 'high',
          assignedRole: 'project-manager',
          estimatedHours: 0.5,
          dependencies: ['assess-impact'],
          scheduleType: 'dependency',
          customizable: true,
          required: true,
          category: 'communication',
          resources: [
            { id: 'contact-list', type: 'document', name: 'Emergency Contact List', required: true },
            { id: 'notification-system', type: 'system', name: 'Mass Notification System', required: false }
          ]
        }
      ],
      deliverables: ['Outage Assessment Report', 'Stakeholder Notification Log']
    },
    {
      id: 'response',
      name: 'Immediate Response',
      description: 'Execute immediate response actions to minimize business impact',
      order: 2,
      estimatedDuration: 8, // 8 hours
      prerequisites: ['detection'],
      tasks: [
        {
          id: 'activate-response-team',
          title: 'Activate Response Team',
          description: 'Assemble and brief the incident response team',
          phase: 'execution',
          priority: 'critical',
          assignedRole: 'project-manager',
          estimatedHours: 1,
          scheduleType: 'phase-start',
          customizable: false,
          required: true,
          category: 'coordination',
          resources: [
            { id: 'response-team-list', type: 'document', name: 'Response Team Contact List', required: true }
          ]
        },
        {
          id: 'implement-workarounds',
          title: 'Implement Temporary Workarounds',
          description: 'Deploy temporary solutions to maintain critical business functions',
          phase: 'execution',
          priority: 'high',
          assignedRole: 'technical-lead',
          estimatedHours: 4,
          dependencies: ['activate-response-team'],
          scheduleType: 'dependency',
          customizable: true,
          required: true,
          category: 'technical',
          deliverables: ['Workaround Documentation', 'Updated Process Instructions']
        },
        {
          id: 'customer-communication',
          title: 'Customer Communication',
          description: 'Communicate with customers about service disruptions and expected resolution',
          phase: 'execution',
          priority: 'high',
          assignedRole: 'project-manager',
          estimatedHours: 2,
          dependencies: ['implement-workarounds'],
          scheduleType: 'dependency',
          customizable: true,
          required: true,
          category: 'communication',
          resources: [
            { id: 'customer-db', type: 'system', name: 'Customer Database', required: true },
            { id: 'comm-templates', type: 'document', name: 'Communication Templates', required: true }
          ]
        },
        {
          id: 'system-recovery',
          title: 'Begin System Recovery',
          description: 'Initiate system recovery procedures and restoration efforts',
          phase: 'execution',
          priority: 'critical',
          assignedRole: 'technical-lead',
          estimatedHours: 6,
          dependencies: ['activate-response-team'],
          scheduleType: 'dependency',
          customizable: false,
          required: true,
          category: 'technical'
        }
      ],
      deliverables: ['Response Team Activation Log', 'Workaround Implementation Guide', 'Customer Communication Log']
    },
    {
      id: 'monitoring',
      name: 'Monitoring & Coordination',
      description: 'Monitor recovery progress and coordinate ongoing response efforts',
      order: 3,
      estimatedDuration: 12, // 12 hours
      prerequisites: ['response'],
      tasks: [
        {
          id: 'monitor-recovery',
          title: 'Monitor Recovery Progress',
          description: 'Continuously monitor system recovery and document progress',
          phase: 'monitoring',
          priority: 'high',
          assignedRole: 'technical-lead',
          estimatedHours: 8,
          scheduleType: 'phase-start',
          customizable: true,
          required: true,
          category: 'monitoring'
        },
        {
          id: 'status-updates',
          title: 'Provide Regular Status Updates',
          description: 'Send regular updates to stakeholders on recovery progress',
          phase: 'monitoring',
          priority: 'normal',
          assignedRole: 'project-manager',
          estimatedHours: 2,
          scheduleType: 'phase-start',
          dueOffset: 1, // 1 hour after phase start
          customizable: true,
          required: true,
          category: 'communication'
        },
        {
          id: 'coordinate-resources',
          title: 'Coordinate Additional Resources',
          description: 'Identify and coordinate additional resources as needed for recovery',
          phase: 'monitoring',
          priority: 'normal',
          assignedRole: 'resource-coordinator',
          estimatedHours: 4,
          scheduleType: 'phase-start',
          customizable: true,
          required: true,
          category: 'coordination'
        }
      ],
      deliverables: ['Recovery Progress Report', 'Stakeholder Update Log']
    },
    {
      id: 'review',
      name: 'Post-Incident Review',
      description: 'Analyze response effectiveness and implement improvements',
      order: 4,
      estimatedDuration: 16, // 16 hours
      prerequisites: ['monitoring'],
      tasks: [
        {
          id: 'document-incident',
          title: 'Document Incident Details',
          description: 'Create comprehensive documentation of the incident and response',
          phase: 'review',
          priority: 'high',
          assignedRole: 'quality-officer',
          estimatedHours: 4,
          scheduleType: 'phase-start',
          customizable: false,
          required: true,
          category: 'documentation',
          deliverables: ['Incident Report', 'Timeline Documentation']
        },
        {
          id: 'conduct-postmortem',
          title: 'Conduct Post-Mortem Analysis',
          description: 'Analyze what worked well and identify areas for improvement',
          phase: 'review',
          priority: 'high',
          assignedRole: 'project-manager',
          estimatedHours: 8,
          dependencies: ['document-incident'],
          scheduleType: 'dependency',
          customizable: true,
          required: true,
          category: 'analysis',
          stakeholders: ['response-team', 'executives'],
          deliverables: ['Post-Mortem Report', 'Lessons Learned Document']
        },
        {
          id: 'update-procedures',
          title: 'Update Response Procedures',
          description: 'Update incident response procedures based on lessons learned',
          phase: 'review',
          priority: 'normal',
          assignedRole: 'quality-officer',
          estimatedHours: 4,
          dependencies: ['conduct-postmortem'],
          scheduleType: 'dependency',
          customizable: true,
          required: true,
          category: 'improvement',
          deliverables: ['Updated Procedures', 'Training Materials']
        }
      ],
      deliverables: ['Post-Incident Report', 'Updated Response Procedures', 'Training Plan']
    }
  ],

  defaultRoles: ['project-manager', 'technical-lead', 'quality-officer', 'resource-coordinator'],
  requiredResources: [
    { id: 'contact-lists', type: 'document', name: 'Emergency Contact Lists', required: true },
    { id: 'system-docs', type: 'document', name: 'System Documentation', required: true },
    { id: 'monitoring-tools', type: 'system', name: 'System Monitoring Tools', required: true }
  ],
  estimatedDuration: 38, // Total hours
  complexity: 'complex',
  customizable: true,
  customizationOptions: {
    allowPhaseModification: true,
    allowTaskModification: true,
    allowRoleModification: true,
    requiredFields: ['assignedRole', 'priority']
  },
  industry: ['technology', 'finance', 'healthcare', 'retail'],
  companySize: 'medium',
  applicableRoles: ['project-manager', 'technical-lead', 'quality-officer']
};

/**
 * Project Management - Software Development Template
 */
export const softwareDevelopmentTemplate: BusinessTemplate = {
  id: 'project-software-development',
  name: 'Software Development Project',
  description: 'Complete software development project template from planning to deployment',
  category: 'project-management',
  type: 'project',
  version: '1.0.0',
  tags: ['software', 'development', 'agile', 'project'],
  author: 'RIA Templates',
  created: new Date('2024-01-01'),
  updated: new Date('2024-01-01'),

  phases: [
    {
      id: 'planning',
      name: 'Project Planning',
      description: 'Define requirements, scope, and project structure',
      order: 1,
      estimatedDuration: 40, // 1 work week
      tasks: [
        {
          id: 'gather-requirements',
          title: 'Gather Requirements',
          description: 'Meet with stakeholders to gather and document requirements',
          phase: 'planning',
          priority: 'critical',
          assignedRole: 'project-manager',
          estimatedHours: 16,
          scheduleType: 'phase-start',
          customizable: true,
          required: true,
          category: 'requirements',
          stakeholders: ['clients', 'end-users'],
          deliverables: ['Requirements Document', 'User Stories']
        },
        {
          id: 'technical-design',
          title: 'Technical Design',
          description: 'Create technical architecture and design specifications',
          phase: 'planning',
          priority: 'high',
          assignedRole: 'technical-lead',
          estimatedHours: 24,
          dependencies: ['gather-requirements'],
          scheduleType: 'dependency',
          customizable: true,
          required: true,
          category: 'design',
          deliverables: ['Architecture Document', 'API Specifications', 'Database Schema']
        }
      ],
      deliverables: ['Project Plan', 'Requirements Specification', 'Technical Design']
    },
    {
      id: 'execution',
      name: 'Development',
      description: 'Implement the software solution according to specifications',
      order: 2,
      estimatedDuration: 160, // 4 work weeks
      prerequisites: ['planning'],
      tasks: [
        {
          id: 'setup-environment',
          title: 'Setup Development Environment',
          description: 'Configure development tools, repositories, and CI/CD pipelines',
          phase: 'execution',
          priority: 'critical',
          assignedRole: 'technical-lead',
          estimatedHours: 8,
          scheduleType: 'phase-start',
          customizable: false,
          required: true,
          category: 'infrastructure'
        },
        {
          id: 'implement-core',
          title: 'Implement Core Features',
          description: 'Develop the main functionality of the application',
          phase: 'execution',
          priority: 'critical',
          assignedRole: 'team-member',
          estimatedHours: 120,
          dependencies: ['setup-environment'],
          scheduleType: 'dependency',
          customizable: true,
          required: true,
          category: 'development'
        },
        {
          id: 'write-tests',
          title: 'Write Unit Tests',
          description: 'Create comprehensive unit tests for all components',
          phase: 'execution',
          priority: 'high',
          assignedRole: 'team-member',
          estimatedHours: 32,
          dependencies: ['implement-core'],
          scheduleType: 'dependency',
          customizable: true,
          required: true,
          category: 'testing'
        }
      ],
      deliverables: ['Working Software', 'Test Suite', 'Documentation']
    },
    {
      id: 'monitoring',
      name: 'Testing & Quality Assurance',
      description: 'Comprehensive testing and quality assurance processes',
      order: 3,
      estimatedDuration: 40, // 1 work week
      prerequisites: ['execution'],
      tasks: [
        {
          id: 'integration-testing',
          title: 'Integration Testing',
          description: 'Test system integration and end-to-end workflows',
          phase: 'monitoring',
          priority: 'critical',
          assignedRole: 'quality-officer',
          estimatedHours: 16,
          scheduleType: 'phase-start',
          customizable: true,
          required: true,
          category: 'testing'
        },
        {
          id: 'user-acceptance',
          title: 'User Acceptance Testing',
          description: 'Conduct UAT with stakeholders and end users',
          phase: 'monitoring',
          priority: 'high',
          assignedRole: 'project-manager',
          estimatedHours: 24,
          dependencies: ['integration-testing'],
          scheduleType: 'dependency',
          customizable: true,
          required: true,
          category: 'testing',
          stakeholders: ['clients', 'end-users']
        }
      ],
      deliverables: ['Test Results', 'UAT Report', 'Bug Fix List']
    },
    {
      id: 'review',
      name: 'Deployment & Closure',
      description: 'Deploy to production and close out the project',
      order: 4,
      estimatedDuration: 24, // 3 days
      prerequisites: ['monitoring'],
      tasks: [
        {
          id: 'deploy-production',
          title: 'Deploy to Production',
          description: 'Deploy the application to production environment',
          phase: 'review',
          priority: 'critical',
          assignedRole: 'technical-lead',
          estimatedHours: 8,
          scheduleType: 'phase-start',
          customizable: false,
          required: true,
          category: 'deployment'
        },
        {
          id: 'project-closure',
          title: 'Project Closure',
          description: 'Complete project documentation and conduct retrospective',
          phase: 'review',
          priority: 'normal',
          assignedRole: 'project-manager',
          estimatedHours: 16,
          dependencies: ['deploy-production'],
          scheduleType: 'dependency',
          customizable: true,
          required: true,
          category: 'closure',
          deliverables: ['Project Report', 'Lessons Learned', 'Handover Documentation']
        }
      ],
      deliverables: ['Deployed Application', 'Project Report', 'Support Documentation']
    }
  ],

  defaultRoles: ['project-manager', 'technical-lead', 'team-member', 'quality-officer'],
  requiredResources: [
    { id: 'dev-tools', type: 'system', name: 'Development Tools', required: true },
    { id: 'version-control', type: 'system', name: 'Version Control System', required: true },
    { id: 'project-budget', type: 'budget', name: 'Project Budget', required: true }
  ],
  estimatedDuration: 264, // Total hours (~6.5 work weeks)
  complexity: 'complex',
  customizable: true,
  customizationOptions: {
    allowPhaseModification: true,
    allowTaskModification: true,
    allowRoleModification: true,
    requiredFields: ['assignedRole', 'estimatedHours']
  },
  industry: ['technology', 'software'],
  companySize: 'small',
  applicableRoles: ['project-manager', 'technical-lead', 'team-member']
};

/**
 * HR - Employee Onboarding Template
 */
export const employeeOnboardingTemplate: BusinessTemplate = {
  id: 'hr-employee-onboarding',
  name: 'Employee Onboarding Process',
  description: 'Comprehensive onboarding process for new employees',
  category: 'hr',
  type: 'process',
  version: '1.0.0',
  tags: ['hr', 'onboarding', 'process', 'employee'],
  author: 'RIA Templates',
  created: new Date('2024-01-01'),
  updated: new Date('2024-01-01'),

  phases: [
    {
      id: 'pre-boarding',
      name: 'Pre-boarding Preparation',
      description: 'Prepare for new employee arrival',
      order: 1,
      estimatedDuration: 8, // 1 day
      tasks: [
        {
          id: 'prepare-workspace',
          title: 'Prepare Workspace',
          description: 'Set up desk, equipment, and access credentials',
          phase: 'planning',
          priority: 'high',
          assignedRole: 'resource-coordinator',
          estimatedHours: 4,
          scheduleType: 'phase-start',
          customizable: true,
          required: true,
          category: 'setup',
          resources: [
            { id: 'equipment-list', type: 'document', name: 'Equipment Checklist', required: true },
            { id: 'it-systems', type: 'system', name: 'IT Systems Access', required: true }
          ]
        },
        {
          id: 'welcome-package',
          title: 'Prepare Welcome Package',
          description: 'Assemble welcome materials and company information',
          phase: 'planning',
          priority: 'normal',
          assignedRole: 'team-member',
          estimatedHours: 2,
          scheduleType: 'phase-start',
          customizable: true,
          required: true,
          category: 'preparation'
        },
        {
          id: 'schedule-meetings',
          title: 'Schedule Onboarding Meetings',
          description: 'Schedule meetings with key team members and stakeholders',
          phase: 'planning',
          priority: 'normal',
          assignedRole: 'project-manager',
          estimatedHours: 2,
          scheduleType: 'phase-start',
          customizable: true,
          required: true,
          category: 'scheduling'
        }
      ],
      deliverables: ['Prepared Workspace', 'Welcome Package', 'Meeting Schedule']
    }
  ],

  defaultRoles: ['project-manager', 'resource-coordinator', 'team-member'],
  requiredResources: [
    { id: 'hr-systems', type: 'system', name: 'HR Management System', required: true },
    { id: 'onboarding-docs', type: 'document', name: 'Onboarding Documentation', required: true }
  ],
  estimatedDuration: 32, // 4 work days
  complexity: 'simple',
  customizable: true,
  customizationOptions: {
    allowPhaseModification: true,
    allowTaskModification: true,
    allowRoleModification: true,
    requiredFields: ['assignedRole']
  },
  industry: ['general'],
  companySize: 'medium',
  applicableRoles: ['project-manager', 'resource-coordinator']
};

/**
 * Template library - all available templates
 */
export const businessTemplateLibrary: BusinessTemplate[] = [
  systemOutageTemplate,
  softwareDevelopmentTemplate,
  employeeOnboardingTemplate,
];

/**
 * Get template by ID from library
 */
export function getTemplateById(id: string): BusinessTemplate | undefined {
  return businessTemplateLibrary.find(template => template.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: BusinessTemplate['category']): BusinessTemplate[] {
  return businessTemplateLibrary.filter(template => template.category === category);
}

/**
 * Get templates by type
 */
export function getTemplatesByType(type: BusinessTemplate['type']): BusinessTemplate[] {
  return businessTemplateLibrary.filter(template => template.type === type);
}