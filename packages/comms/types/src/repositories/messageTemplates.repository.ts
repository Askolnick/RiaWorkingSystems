import { BaseRepository, MockRepository, PaginatedResponse } from './base.repository';

export interface MessageTemplate {
  id: string;
  tenantId: string;
  name: string;
  subject: string;
  content: string;
  templateType: MessageTemplateType;
  variables: TemplateVariable[];
  category?: string;
  tags: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type MessageTemplateType = 'email' | 'sms' | 'push' | 'in-app';

export interface TemplateVariable {
  key: string;
  name: string;
  description?: string;
  defaultValue?: string;
  required: boolean;
  type: 'text' | 'number' | 'date' | 'boolean' | 'array';
}

export interface CreateMessageTemplateData {
  name: string;
  subject: string;
  content: string;
  templateType: MessageTemplateType;
  variables: TemplateVariable[];
  category?: string;
  tags: string[];
}

export interface UpdateMessageTemplateData extends Partial<CreateMessageTemplateData> {
  isActive?: boolean;
}

export interface TemplatePreviewData {
  templateId: string;
  variables: Record<string, any>;
}

export interface TemplatePreviewResult {
  subject: string;
  content: string;
  renderedAt: string;
}

export interface MessageTemplateFilters {
  templateType?: MessageTemplateType;
  category?: string;
  tags?: string[];
  isActive?: boolean;
  search?: string;
}

export interface MessageTemplateSort {
  field: keyof MessageTemplate;
  direction: 'asc' | 'desc';
}

export class MessageTemplatesRepository extends BaseRepository<MessageTemplate> {
  protected endpoint = '/message-templates';

  async findFiltered(
    filters: MessageTemplateFilters = {},
    sort: MessageTemplateSort[] = [],
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<MessageTemplate>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined && value !== '')
      )
    });

    if (sort.length > 0) {
      params.append('sort', JSON.stringify(sort));
    }

    return this.request('GET', `?${params.toString()}`);
  }

  async previewTemplate(data: TemplatePreviewData): Promise<TemplatePreviewResult> {
    return this.request('POST', '/preview', data);
  }

  async duplicateTemplate(id: string, name: string): Promise<MessageTemplate> {
    return this.request('POST', `/${id}/duplicate`, { name });
  }

  async getTemplatesByCategory(category: string): Promise<MessageTemplate[]> {
    const response = await this.findFiltered({ category });
    return response.data;
  }

  async getTemplatesByType(templateType: MessageTemplateType): Promise<MessageTemplate[]> {
    const response = await this.findFiltered({ templateType });
    return response.data;
  }
}

export class MockMessageTemplatesRepository extends MockRepository<MessageTemplate> {
  protected storageKey = 'ria_message_templates';
  protected endpoint = '/message-templates';

  private mockTemplates: MessageTemplate[] = [
    {
      id: 'template-1',
      tenantId: 'tenant-1',
      name: 'Welcome Email',
      subject: 'Welcome to {{company_name}}!',
      content: `Dear {{user_name}},

Welcome to {{company_name}}! We're excited to have you as part of our community.

Here are some next steps to get you started:
- Complete your profile
- Explore our features
- Join our community forum

If you have any questions, don't hesitate to reach out to our support team.

Best regards,
The {{company_name}} Team`,
      templateType: 'email',
      variables: [
        {
          key: 'user_name',
          name: 'User Name',
          description: 'The full name of the user',
          required: true,
          type: 'text'
        },
        {
          key: 'company_name',
          name: 'Company Name',
          description: 'Name of the company',
          required: true,
          type: 'text',
          defaultValue: 'Ria Living Systems'
        }
      ],
      category: 'onboarding',
      tags: ['welcome', 'email', 'new-user'],
      isActive: true,
      createdBy: 'user-1',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'template-2',
      tenantId: 'tenant-1',
      name: 'Task Assignment',
      subject: 'New Task Assigned: {{task_title}}',
      content: `Hello {{assignee_name}},

You have been assigned a new task:

**{{task_title}}**
{{task_description}}

**Due Date:** {{due_date}}
**Priority:** {{priority}}

You can view the full task details here: {{task_url}}

Best regards,
{{assigner_name}}`,
      templateType: 'email',
      variables: [
        {
          key: 'assignee_name',
          name: 'Assignee Name',
          description: 'Name of the person assigned to the task',
          required: true,
          type: 'text'
        },
        {
          key: 'task_title',
          name: 'Task Title',
          description: 'Title of the task',
          required: true,
          type: 'text'
        },
        {
          key: 'task_description',
          name: 'Task Description',
          description: 'Description of the task',
          required: false,
          type: 'text'
        },
        {
          key: 'due_date',
          name: 'Due Date',
          description: 'When the task is due',
          required: false,
          type: 'date'
        },
        {
          key: 'priority',
          name: 'Priority',
          description: 'Task priority level',
          required: false,
          type: 'text'
        },
        {
          key: 'task_url',
          name: 'Task URL',
          description: 'Link to the task',
          required: true,
          type: 'text'
        },
        {
          key: 'assigner_name',
          name: 'Assigner Name',
          description: 'Name of the person who assigned the task',
          required: true,
          type: 'text'
        }
      ],
      category: 'tasks',
      tags: ['task', 'assignment', 'notification'],
      isActive: true,
      createdBy: 'user-1',
      createdAt: '2024-01-15T11:00:00Z',
      updatedAt: '2024-01-15T11:00:00Z'
    },
    {
      id: 'template-3',
      tenantId: 'tenant-1',
      name: 'Invoice Reminder',
      subject: 'Invoice #{{invoice_number}} - Payment Due',
      content: `Dear {{client_name}},

This is a friendly reminder that your invoice is due for payment.

**Invoice Details:**
- Invoice Number: {{invoice_number}}
- Amount Due: {{amount_due}}
- Due Date: {{due_date}}

Please make your payment by the due date to avoid any late fees.

You can pay online here: {{payment_url}}

Thank you for your business!

{{company_name}} Finance Team`,
      templateType: 'email',
      variables: [
        {
          key: 'client_name',
          name: 'Client Name',
          description: 'Name of the client',
          required: true,
          type: 'text'
        },
        {
          key: 'invoice_number',
          name: 'Invoice Number',
          description: 'Invoice identifier',
          required: true,
          type: 'text'
        },
        {
          key: 'amount_due',
          name: 'Amount Due',
          description: 'Total amount due',
          required: true,
          type: 'text'
        },
        {
          key: 'due_date',
          name: 'Due Date',
          description: 'Payment due date',
          required: true,
          type: 'date'
        },
        {
          key: 'payment_url',
          name: 'Payment URL',
          description: 'Link to payment portal',
          required: true,
          type: 'text'
        },
        {
          key: 'company_name',
          name: 'Company Name',
          description: 'Name of the company',
          required: true,
          type: 'text'
        }
      ],
      category: 'finance',
      tags: ['invoice', 'payment', 'reminder'],
      isActive: true,
      createdBy: 'user-1',
      createdAt: '2024-01-15T12:00:00Z',
      updatedAt: '2024-01-15T12:00:00Z'
    },
    {
      id: 'template-4',
      tenantId: 'tenant-1',
      name: 'Password Reset SMS',
      subject: '',
      content: 'Hi {{user_name}}, your password reset code is: {{reset_code}}. This code expires in 15 minutes.',
      templateType: 'sms',
      variables: [
        {
          key: 'user_name',
          name: 'User Name',
          description: 'Name of the user',
          required: true,
          type: 'text'
        },
        {
          key: 'reset_code',
          name: 'Reset Code',
          description: '6-digit verification code',
          required: true,
          type: 'text'
        }
      ],
      category: 'security',
      tags: ['password', 'reset', 'sms', 'security'],
      isActive: true,
      createdBy: 'user-1',
      createdAt: '2024-01-15T13:00:00Z',
      updatedAt: '2024-01-15T13:00:00Z'
    }
  ];

  async findFiltered(
    filters: MessageTemplateFilters = {},
    sort: MessageTemplateSort[] = [],
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<MessageTemplate>> {
    await this.simulateDelay();
    
    let filtered = [...this.mockTemplates];

    // Apply filters
    if (filters.templateType) {
      filtered = filtered.filter(t => t.templateType === filters.templateType);
    }
    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(t => 
        filters.tags!.some(tag => t.tags.includes(tag))
      );
    }
    if (filters.isActive !== undefined) {
      filtered = filtered.filter(t => t.isActive === filters.isActive);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        t.subject.toLowerCase().includes(searchLower) ||
        t.content.toLowerCase().includes(searchLower) ||
        (t.category && t.category.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    if (sort.length > 0) {
      const sortConfig = sort[0]; // Use first sort config
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.field];
        const bVal = b[sortConfig.field];
        const compare = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortConfig.direction === 'desc' ? -compare : compare;
      });
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit)
    };
  }

  async previewTemplate(data: TemplatePreviewData): Promise<TemplatePreviewResult> {
    await this.simulateDelay();
    
    const template = this.mockTemplates.find(t => t.id === data.templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Simple template variable replacement
    let renderedSubject = template.subject;
    let renderedContent = template.content;

    Object.entries(data.variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      renderedSubject = renderedSubject.replace(placeholder, String(value));
      renderedContent = renderedContent.replace(placeholder, String(value));
    });

    return {
      subject: renderedSubject,
      content: renderedContent,
      renderedAt: new Date().toISOString()
    };
  }

  async duplicateTemplate(id: string, name: string): Promise<MessageTemplate> {
    await this.simulateDelay();
    
    const original = this.mockTemplates.find(t => t.id === id);
    if (!original) {
      throw new Error('Template not found');
    }

    const duplicate: MessageTemplate = {
      ...original,
      id: `template-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.mockTemplates.push(duplicate);
    return duplicate;
  }

  async getTemplatesByCategory(category: string): Promise<MessageTemplate[]> {
    const response = await this.findFiltered({ category });
    return response.data;
  }

  async getTemplatesByType(templateType: MessageTemplateType): Promise<MessageTemplate[]> {
    const response = await this.findFiltered({ templateType });
    return response.data;
  }
}



export const messageTemplatesRepository = new MockMessageTemplatesRepository();
