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