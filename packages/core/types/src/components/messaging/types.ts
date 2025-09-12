export interface CreateMessageTemplateData {
  name: string;
  description?: string;
  subject?: string;
  body: string;
  type: 'email' | 'sms' | 'notification';
  category?: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  description?: string;
  subject?: string;
  body: string;
  type: 'email' | 'sms' | 'notification';
  category?: string;
  createdAt: string;
  updatedAt: string;
}