export interface Contact {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  contactType: ContactType;
  status: ContactStatus;
  source?: string;
  tags: string[];
  addresses: ContactAddress[];
  socialProfiles: SocialProfile[];
  customFields: Record<string, any>;
  notes?: string;
  assignedTo?: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  leadScore?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type ContactType = 'lead' | 'client' | 'prospect' | 'partner' | 'vendor' | 'other';
export type ContactStatus = 'active' | 'inactive' | 'do-not-contact' | 'qualified' | 'converted';

export interface ContactAddress {
  id: string;
  type: AddressType;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
}

export type AddressType = 'home' | 'work' | 'other';

export interface SocialProfile {
  platform: SocialPlatform;
  url: string;
  username?: string;
}

export type SocialPlatform = 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'website' | 'other';

export interface ContactInteraction {
  id: string;
  contactId: string;
  tenantId: string;
  type: InteractionType;
  subject: string;
  description?: string;
  outcome?: string;
  nextAction?: string;
  scheduledDate?: string;
  completedDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type InteractionType = 'call' | 'email' | 'meeting' | 'note' | 'task' | 'proposal' | 'contract' | 'other';

export interface ContactList {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  isStatic: boolean;
  criteria?: ContactListCriteria;
  contactIds: string[];
  contactCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactListCriteria {
  contactType?: ContactType[];
  status?: ContactStatus[];
  tags?: string[];
  company?: string[];
  leadScoreMin?: number;
  leadScoreMax?: number;
  lastContactDateRange?: {
    from?: string;
    to?: string;
  };
  customFields?: Record<string, any>;
}

export interface CreateContactData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  contactType: ContactType;
  status?: ContactStatus;
  source?: string;
  tags?: string[];
  addresses?: Omit<ContactAddress, 'id'>[];
  socialProfiles?: SocialProfile[];
  customFields?: Record<string, any>;
  notes?: string;
  assignedTo?: string;
  nextFollowUpDate?: string;
  leadScore?: number;
}

export interface UpdateContactData extends Partial<CreateContactData> {
  lastContactDate?: string;
}

export interface ContactFilters {
  contactType?: ContactType;
  status?: ContactStatus;
  assignedTo?: string;
  company?: string;
  tags?: string[];
  leadScoreMin?: number;
  leadScoreMax?: number;
  search?: string;
  hasPhone?: boolean;
  hasEmail?: boolean;
  lastContactDateRange?: {
    from?: string;
    to?: string;
  };
}

export interface ContactSort {
  field: keyof Contact;
  direction: 'asc' | 'desc';
}

export interface ContactImportData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  contactType?: string;
  status?: string;
  source?: string;
  tags?: string;
  notes?: string;
  [key: string]: any; // Allow additional custom fields
}

export interface ContactExportOptions {
  format: 'csv' | 'excel' | 'json';
  includeCustomFields: boolean;
  includeAddresses: boolean;
  includeSocialProfiles: boolean;
  includeInteractions: boolean;
  dateRange?: {
    from?: string;
    to?: string;
  };
}

export interface ContactStats {
  totalContacts: number;
  contactsByType: Record<ContactType, number>;
  contactsByStatus: Record<ContactStatus, number>;
  newContactsThisMonth: number;
  activeContacts: number;
  averageLeadScore: number;
  topCompanies: Array<{
    company: string;
    count: number;
  }>;
  recentInteractions: ContactInteraction[];
}