import { v4 as uuidv4 } from 'uuid';
import type {
  EmailIntegration,
  MailMessage,
  MailLink,
} from './types';
import { extractPlainText, sanitizeHTML } from './encryption';

export class RIAEmailIntegration implements EmailIntegration {
  constructor(
    private tasksClient: any, // Would be @ria/tasks-server client
    private contactsClient: any, // Would be @ria/contacts-server client  
    private campaignsClient: any, // Would be @ria/campaigns-server client
    private documentsClient: any // Would be document processing client
  ) {}

  async createTaskFromEmail(
    message: MailMessage,
    options?: {
      assigneeId?: string;
      projectId?: string;
      dueDate?: string;
      priority?: 'low' | 'medium' | 'high';
      extractedText?: string;
    }
  ): Promise<{ taskId: string; link: MailLink }> {
    try {
      // Extract task details from email
      const taskTitle = this.generateTaskTitle(message);
      const taskDescription = this.generateTaskDescription(message, options?.extractedText);
      
      // Create task using tasks client
      const task = await this.tasksClient.createTask({
        title: taskTitle,
        description: taskDescription,
        assigneeId: options?.assigneeId,
        projectId: options?.projectId,
        dueDate: options?.dueDate,
        priority: options?.priority || 'medium',
        source: 'email',
        sourceMetadata: {
          messageId: message.messageId,
          threadId: message.threadId,
          from: message.from,
          subject: message.subject,
          date: message.date,
        },
      });

      // Create link between email and task
      const link: Omit<MailLink, 'createdAt'> = {
        id: uuidv4(),
        messageId: message.id,
        entityType: 'task',
        entityId: task.id,
        linkType: 'created_from',
        quote: options?.extractedText || this.extractQuote(message),
        metadata: {
          taskTitle: task.title,
          createdBy: options?.assigneeId,
        },
        tenantId: message.tenantId,
        createdBy: options?.assigneeId || 'system',
      };

      return {
        taskId: task.id,
        link: { ...link, createdAt: new Date().toISOString() },
      };
    } catch (error) {
      throw new Error(`Failed to create task from email: ${error}`);
    }
  }

  async extractContactInfo(message: MailMessage): Promise<Array<{
    name?: string;
    email: string;
    phone?: string;
    company?: string;
    confidence: number;
  }>> {
    const contacts: Array<{
      name?: string;
      email: string;
      phone?: string;
      company?: string;
      confidence: number;
    }> = [];

    // Extract from sender and recipients
    const allAddresses = [
      ...message.from,
      ...message.to,
      ...(message.cc || []),
    ];

    for (const addr of allAddresses) {
      const contact: any = {
        email: addr.email,
        confidence: 0.9, // High confidence for email addresses
      };

      if (addr.name) {
        contact.name = addr.name;
        contact.confidence = 1.0;
      }

      // Extract additional info from email body
      const bodyText = message.text || extractPlainText(message.html || '');
      const additionalInfo = this.extractContactFromText(bodyText, addr.email);
      
      if (additionalInfo.phone) {
        contact.phone = additionalInfo.phone;
        contact.confidence = Math.min(contact.confidence + 0.1, 1.0);
      }
      
      if (additionalInfo.company) {
        contact.company = additionalInfo.company;
        contact.confidence = Math.min(contact.confidence + 0.1, 1.0);
      }

      contacts.push(contact);
    }

    return contacts;
  }

  async createCampaignFromTemplate(options: {
    name: string;
    templateHtml: string;
    audienceIds: string[];
    scheduleAt?: string;
    trackingParams?: Record<string, string>;
  }): Promise<{ campaignId: string }> {
    try {
      // Sanitize HTML template
      const cleanHtml = sanitizeHTML(options.templateHtml);
      
      // Create campaign using campaigns client
      const campaign = await this.campaignsClient.createCampaign({
        name: options.name,
        type: 'email',
        content: {
          html: cleanHtml,
          text: extractPlainText(cleanHtml),
        },
        audienceIds: options.audienceIds,
        scheduleAt: options.scheduleAt,
        settings: {
          tracking: {
            opens: true,
            clicks: true,
            unsubscribes: true,
            ...options.trackingParams,
          },
        },
        source: 'email_template',
      });

      return { campaignId: campaign.id };
    } catch (error) {
      throw new Error(`Failed to create campaign from template: ${error}`);
    }
  }

  async extractDocuments(message: MailMessage): Promise<Array<{
    attachmentId: string;
    documentType: 'invoice' | 'contract' | 'receipt' | 'other';
    extractedData?: Record<string, any>;
    confidence: number;
  }>> {
    const documents: Array<{
      attachmentId: string;
      documentType: 'invoice' | 'contract' | 'receipt' | 'other';
      extractedData?: Record<string, any>;
      confidence: number;
    }> = [];

    if (!message.attachments) return documents;

    for (const attachment of message.attachments) {
      try {
        // Determine document type based on filename and MIME type
        const docType = this.classifyDocument(attachment.name, attachment.mime);
        
        // Extract data based on document type
        let extractedData: Record<string, any> | undefined;
        let confidence = 0.5;

        if (docType !== 'other') {
          try {
            extractedData = await this.documentsClient.extractData({
              attachmentId: attachment.id,
              documentType: docType,
              fileName: attachment.name,
              mimeType: attachment.mime,
            });
            confidence = extractedData?.confidence || 0.7;
          } catch (error) {
            console.warn(`Failed to extract data from ${attachment.name}:`, error);
          }
        }

        documents.push({
          attachmentId: attachment.id,
          documentType: docType,
          extractedData,
          confidence,
        });
      } catch (error) {
        console.warn(`Failed to process attachment ${attachment.name}:`, error);
        documents.push({
          attachmentId: attachment.id,
          documentType: 'other',
          confidence: 0.1,
        });
      }
    }

    return documents;
  }

  // Helper methods
  private generateTaskTitle(message: MailMessage): string {
    const subject = message.subject || 'Email Task';
    const from = message.from[0]?.name || message.from[0]?.email || 'Unknown';
    
    // Clean up subject line
    const cleanSubject = subject
      .replace(/^(re:|fwd?:)\s*/gi, '')
      .trim();
    
    if (cleanSubject.length > 80) {
      return `${cleanSubject.substring(0, 77)}...`;
    }
    
    return `Follow up: ${cleanSubject} (from ${from})`;
  }

  private generateTaskDescription(message: MailMessage, extractedText?: string): string {
    const from = message.from[0];
    const fromText = from?.name ? `${from.name} (${from.email})` : from?.email || 'Unknown';
    const date = new Date(message.date).toLocaleDateString();
    
    let description = `**Email Task Created**\n\n`;
    description += `**From:** ${fromText}\n`;
    description += `**Date:** ${date}\n`;
    description += `**Subject:** ${message.subject}\n\n`;
    
    if (extractedText) {
      description += `**Selected Text:**\n${extractedText}\n\n`;
    }
    
    if (message.preview) {
      description += `**Email Preview:**\n${message.preview}\n\n`;
    }
    
    description += `**Message ID:** ${message.messageId}\n`;
    description += `**Thread ID:** ${message.threadId}`;
    
    return description;
  }

  private extractQuote(message: MailMessage, maxLength: number = 500): string {
    const text = message.text || extractPlainText(message.html || '');
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength - 3) + '...';
  }

  private extractContactFromText(text: string, email: string): {
    phone?: string;
    company?: string;
  } {
    const result: { phone?: string; company?: string } = {};
    
    // Extract phone numbers
    const phoneRegex = /(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
    const phoneMatch = text.match(phoneRegex);
    if (phoneMatch) {
      result.phone = phoneMatch[0].trim();
    }
    
    // Extract company from signature patterns
    const companyPatterns = [
      /Best regards,?\s*\n(.+)/i,
      /Sincerely,?\s*\n(.+)/i,
      /Thanks,?\s*\n(.+)/i,
      /\n(.+)\nPhone:/i,
      /\n(.+)\nEmail:/i,
    ];
    
    for (const pattern of companyPatterns) {
      const match = text.match(pattern);
      if (match && match[1] && !match[1].includes(email)) {
        result.company = match[1].trim();
        break;
      }
    }
    
    return result;
  }

  private classifyDocument(fileName: string, mimeType: string): 'invoice' | 'contract' | 'receipt' | 'other' {
    const name = fileName.toLowerCase();
    
    // Invoice patterns
    if (name.includes('invoice') || name.includes('bill') || name.includes('statement')) {
      return 'invoice';
    }
    
    // Contract patterns
    if (name.includes('contract') || name.includes('agreement') || name.includes('terms')) {
      return 'contract';
    }
    
    // Receipt patterns
    if (name.includes('receipt') || name.includes('payment') || name.includes('transaction')) {
      return 'receipt';
    }
    
    // Check MIME type for PDFs (common for all document types)
    if (mimeType === 'application/pdf') {
      // Could analyze PDF content here for better classification
      return 'other';
    }
    
    return 'other';
  }
}

// AI-powered email processing
export class EmailAIProcessor {
  constructor(private aiClient: any) {}

  async categorizeEmail(message: MailMessage): Promise<{
    category: string;
    confidence: number;
    suggestedActions: string[];
  }> {
    try {
      const prompt = this.buildCategorizationPrompt(message);
      const response = await this.aiClient.complete({
        prompt,
        maxTokens: 200,
        temperature: 0.1,
      });
      
      return this.parseCategorizationResponse(response);
    } catch (error) {
      console.warn('AI categorization failed:', error);
      return {
        category: 'general',
        confidence: 0.5,
        suggestedActions: [],
      };
    }
  }

  async extractActionItems(message: MailMessage): Promise<Array<{
    action: string;
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    assignee?: string;
  }>> {
    try {
      const text = message.text || extractPlainText(message.html || '');
      const prompt = `Extract action items from this email:

Subject: ${message.subject}
From: ${message.from[0]?.email}
Content: ${text.substring(0, 2000)}

Identify specific action items, their priority, and any mentioned deadlines or assignees.`;

      const response = await this.aiClient.complete({
        prompt,
        maxTokens: 300,
        temperature: 0.2,
      });
      
      return this.parseActionItems(response);
    } catch (error) {
      console.warn('AI action extraction failed:', error);
      return [];
    }
  }

  async generateReplyDraft(
    message: MailMessage,
    replyType: 'acknowledge' | 'decline' | 'request_info' | 'custom',
    customPrompt?: string
  ): Promise<{ subject: string; body: string }> {
    try {
      const prompt = this.buildReplyPrompt(message, replyType, customPrompt);
      const response = await this.aiClient.complete({
        prompt,
        maxTokens: 500,
        temperature: 0.3,
      });
      
      return this.parseReplyDraft(response, message.subject);
    } catch (error) {
      console.warn('AI reply generation failed:', error);
      return {
        subject: `Re: ${message.subject}`,
        body: 'Thank you for your email. I will review and get back to you soon.',
      };
    }
  }

  private buildCategorizationPrompt(message: MailMessage): string {
    const text = message.text || extractPlainText(message.html || '');
    return `Categorize this email:

Subject: ${message.subject}
From: ${message.from[0]?.email}
Content: ${text.substring(0, 1000)}

Categories: support, sales, billing, project, meeting, notification, spam, personal, other
Provide category, confidence (0-1), and 2-3 suggested actions.`;
  }

  private parseCategorizationResponse(response: string): {
    category: string;
    confidence: number;
    suggestedActions: string[];
  } {
    // Simple parsing - in production, use structured output
    const lines = response.split('\n').filter(l => l.trim());
    return {
      category: lines[0]?.toLowerCase() || 'other',
      confidence: 0.7,
      suggestedActions: lines.slice(1, 4).filter(Boolean),
    };
  }

  private parseActionItems(response: string): Array<{
    action: string;
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    assignee?: string;
  }> {
    // Simple parsing - in production, use structured output
    const lines = response.split('\n').filter(l => l.trim() && l.includes('Action:'));
    return lines.map(line => ({
      action: line.replace('Action:', '').trim(),
      priority: 'medium' as const,
    }));
  }

  private buildReplyPrompt(
    message: MailMessage,
    replyType: string,
    customPrompt?: string
  ): string {
    if (customPrompt) return customPrompt;
    
    const templates = {
      acknowledge: 'Write a professional acknowledgment email',
      decline: 'Write a polite decline email',
      request_info: 'Write an email requesting more information',
    };
    
    const template = templates[replyType as keyof typeof templates] || templates.acknowledge;
    const text = message.text || extractPlainText(message.html || '');
    
    return `${template} in response to:

Subject: ${message.subject}
From: ${message.from[0]?.email}
Content: ${text.substring(0, 800)}

Keep it professional, concise, and helpful.`;
  }

  private parseReplyDraft(response: string, originalSubject: string): {
    subject: string;
    body: string;
  } {
    // Extract subject and body from response
    const lines = response.split('\n');
    const subjectLine = lines.find(l => l.toLowerCase().includes('subject:'));
    const subject = subjectLine 
      ? subjectLine.replace(/subject:/i, '').trim()
      : `Re: ${originalSubject}`;
    
    const bodyStartIndex = lines.findIndex(l => l.toLowerCase().includes('body:')) + 1;
    const body = bodyStartIndex > 0 
      ? lines.slice(bodyStartIndex).join('\n').trim()
      : response.trim();
    
    return { subject, body };
  }
}

// Factory functions
export function createEmailIntegration(clients: {
  tasks: any;
  contacts: any;
  campaigns: any;
  documents: any;
}): EmailIntegration {
  return new RIAEmailIntegration(
    clients.tasks,
    clients.contacts,
    clients.campaigns,
    clients.documents
  );
}

export function createEmailAIProcessor(aiClient: any): EmailAIProcessor {
  return new EmailAIProcessor(aiClient);
}