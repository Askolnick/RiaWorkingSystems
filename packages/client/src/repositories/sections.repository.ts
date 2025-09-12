import { BaseRepository, MockRepository } from './base.repository';

// Types for the sections system
export interface WikiSection {
  id: string;
  tenantId: string;
  spaceId?: string;
  title: string;
  slug: string;
  description?: string;
  content: any; // JSON content
  type: SectionType;
  status: SectionStatus;
  isTemplate: boolean;
  templateId?: string;
  tags: string[];
  version: number;
  isPublic: boolean;
  isGlobal: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WikiSectionUsage {
  id: string;
  tenantId: string;
  sectionId: string;
  pageId: string;
  position: number;
  customData?: any; // JSON for custom overrides
  createdAt: string;
  updatedAt: string;
}

export interface WikiSectionVersion {
  id: string;
  tenantId: string;
  sectionId: string;
  version: number;
  title: string;
  content: any; // JSON content
  description?: string;
  changeNote?: string;
  createdBy: string;
  createdAt: string;
}

export interface WikiSectionLink {
  id: string;
  tenantId: string;
  fromSectionId: string;
  toSectionId: string;
  linkType: string;
  description?: string;
  createdAt: string;
}

export enum SectionType {
  text = 'text',
  code = 'code',
  image = 'image',
  video = 'video',
  table = 'table',
  chart = 'chart',
  checklist = 'checklist',
  callout = 'callout',
  quote = 'quote',
  template = 'template'
}

export enum SectionStatus {
  draft = 'draft',
  published = 'published',
  archived = 'archived'
}

export interface CreateSectionData {
  spaceId?: string;
  title: string;
  slug: string;
  description?: string;
  content: any;
  type: SectionType;
  isTemplate?: boolean;
  templateId?: string;
  tags?: string[];
  isPublic?: boolean;
  isGlobal?: boolean;
}

export interface UpdateSectionData {
  title?: string;
  slug?: string;
  description?: string;
  content?: any;
  type?: SectionType;
  status?: SectionStatus;
  tags?: string[];
  isPublic?: boolean;
  isGlobal?: boolean;
  changeNote?: string;
}

export interface CreateSectionUsageData {
  sectionId: string;
  pageId: string;
  position: number;
  customData?: any;
}

export interface SectionWithUsages extends WikiSection {
  usages: WikiSectionUsage[];
  usageCount: number;
}

export interface SectionWithRelations extends WikiSection {
  usages: WikiSectionUsage[];
  versions: WikiSectionVersion[];
  links: WikiSectionLink[];
  backlinks: WikiSectionLink[];
}

export interface SectionFilters {
  type?: SectionType[];
  status?: SectionStatus[];
  tags?: string[];
  spaceId?: string;
  isTemplate?: boolean;
  isPublic?: boolean;
  isGlobal?: boolean;
  createdBy?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface SectionSort {
  field: 'title' | 'createdAt' | 'updatedAt' | 'usageCount' | 'version';
  direction: 'asc' | 'desc';
}

export interface SectionSearchOptions {
  query: string;
  spaceIds?: string[];
  types?: SectionType[];
  statuses?: SectionStatus[];
  tags?: string[];
  isTemplate?: boolean;
  limit?: number;
}

export interface SectionSearchResult {
  id: string;
  title: string;
  description?: string;
  type: SectionType;
  status: SectionStatus;
  highlights: string[];
  relevanceScore: number;
  usageCount: number;
  lastUpdated: string;
}

export class SectionsRepository extends BaseRepository<WikiSection> {
  protected endpoint = '/wiki/sections';

  // Section management
  async createSection(data: CreateSectionData): Promise<WikiSection> {
    return this.request('POST', '/', { body: data });
  }

  async updateSection(id: string, data: UpdateSectionData): Promise<WikiSection> {
    return this.request('PUT', `/${id}`, { body: data });
  }

  async deleteSection(id: string): Promise<void> {
    await this.request('DELETE', `/${id}`);
  }

  async getSectionWithRelations(id: string): Promise<SectionWithRelations> {
    return this.request('GET', `/${id}/with-relations`);
  }

  async duplicateSection(id: string, title: string): Promise<WikiSection> {
    return this.request('POST', `/${id}/duplicate`, { body: { title } });
  }

  // Section usage management
  async addSectionToPage(data: CreateSectionUsageData): Promise<WikiSectionUsage> {
    return this.request('POST', '/usages', { body: data });
  }

  async removeSectionFromPage(usageId: string): Promise<void> {
    await this.request('DELETE', `/usages/${usageId}`);
  }

  async updateSectionUsage(usageId: string, data: { position?: number; customData?: any }): Promise<WikiSectionUsage> {
    return this.request('PUT', `/usages/${usageId}`, { body: data });
  }

  async getPageSections(pageId: string): Promise<WikiSectionUsage[]> {
    return this.request('GET', `/pages/${pageId}/sections`);
  }

  async reorderPageSections(pageId: string, usageIds: string[]): Promise<WikiSectionUsage[]> {
    return this.request('PUT', `/pages/${pageId}/sections/reorder`, { body: { usageIds } });
  }

  // Version management
  async getSectionVersions(sectionId: string): Promise<WikiSectionVersion[]> {
    return this.request('GET', `/${sectionId}/versions`);
  }

  async restoreVersion(sectionId: string, versionId: string): Promise<WikiSection> {
    return this.request('POST', `/${sectionId}/versions/${versionId}/restore`);
  }

  // Cross-referencing
  async createSectionLink(fromSectionId: string, toSectionId: string, linkType: string, description?: string): Promise<WikiSectionLink> {
    return this.request('POST', '/links', { 
      body: { fromSectionId, toSectionId, linkType, description } 
    });
  }

  async deleteSectionLink(linkId: string): Promise<void> {
    await this.request('DELETE', `/links/${linkId}`);
  }

  async getSectionLinks(sectionId: string): Promise<WikiSectionLink[]> {
    return this.request('GET', `/${sectionId}/links`);
  }

  async getSectionBacklinks(sectionId: string): Promise<WikiSectionLink[]> {
    return this.request('GET', `/${sectionId}/backlinks`);
  }

  // Search and filtering
  async searchSections(options: SectionSearchOptions): Promise<SectionSearchResult[]> {
    return this.request('POST', '/search', { body: options });
  }

  async getFilteredSections(filters: SectionFilters, sort: SectionSort[], page: number = 1, limit: number = 20) {
    return this.request('POST', '/filter', {
      body: { filters, sort, page, limit }
    });
  }

  // Templates
  async getTemplates(spaceId?: string): Promise<WikiSection[]> {
    const endpoint = spaceId ? `/templates?spaceId=${spaceId}` : '/templates';
    return this.request('GET', endpoint);
  }

  async createFromTemplate(templateId: string, data: Partial<CreateSectionData>): Promise<WikiSection> {
    return this.request('POST', `/templates/${templateId}/create`, { body: data });
  }

  // Analytics
  async getSectionStats(sectionId?: string): Promise<{
    totalSections: number;
    totalUsages: number;
    topUsedSections: Array<{ section: WikiSection; usageCount: number }>;
    recentlyCreated: WikiSection[];
    recentlyUpdated: WikiSection[];
  }> {
    const endpoint = sectionId ? `/${sectionId}/stats` : '/stats';
    return this.request('GET', endpoint);
  }

  // Publishing
  async publishSection(id: string): Promise<WikiSection> {
    return this.request('POST', `/${id}/publish`);
  }

  async archiveSection(id: string): Promise<WikiSection> {
    return this.request('POST', `/${id}/archive`);
  }
}

export class MockSectionsRepository extends MockRepository<WikiSection> {
  protected storageKey = 'ria_wiki_sections';
  protected endpoint = '/wiki/sections';
  
  private readonly defaultTenantId = 'tenant-1';
  private readonly defaultUserId = 'user-1';
  
  private generateId(): string {
    return 'section_' + Math.random().toString(36).substr(2, 9);
  }

  private mockSections: WikiSection[] = [
    {
      id: 'section-1',
      tenantId: 'tenant-1',
      spaceId: 'space-1',
      title: 'Company Overview',
      slug: 'company-overview',
      description: 'Standard company overview section for onboarding',
      content: {
        type: 'text',
        content: [
          {
            type: 'heading',
            level: 2,
            content: 'About Our Company'
          },
          {
            type: 'paragraph',
            content: 'We are a leading technology company focused on innovation and excellence.'
          }
        ]
      },
      type: SectionType.text,
      status: SectionStatus.published,
      isTemplate: true,
      tags: ['onboarding', 'company', 'overview'],
      version: 2,
      isPublic: true,
      isGlobal: false,
      createdBy: 'user-1',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-09-01T14:30:00Z'
    },
    {
      id: 'section-2',
      tenantId: 'tenant-1',
      title: 'API Authentication Code',
      slug: 'api-auth-code',
      description: 'Reusable code block for API authentication',
      content: {
        type: 'code',
        language: 'javascript',
        content: `const authenticate = async (token) => {
  const response = await fetch('/api/auth', {
    headers: { 'Authorization': \`Bearer \${token}\` }
  });
  return response.json();
};`
      },
      type: SectionType.code,
      status: SectionStatus.published,
      isTemplate: false,
      tags: ['api', 'auth', 'javascript'],
      version: 1,
      isPublic: true,
      isGlobal: true,
      createdBy: 'user-2',
      createdAt: '2024-02-01T09:00:00Z',
      updatedAt: '2024-02-01T09:00:00Z'
    },
    {
      id: 'section-3',
      tenantId: 'tenant-1',
      spaceId: 'space-2',
      title: 'Security Checklist',
      slug: 'security-checklist',
      description: 'Security best practices checklist',
      content: {
        type: 'checklist',
        items: [
          { text: 'Enable two-factor authentication', completed: false },
          { text: 'Use strong passwords', completed: false },
          { text: 'Regular security audits', completed: false },
          { text: 'Keep software updated', completed: false }
        ]
      },
      type: SectionType.checklist,
      status: SectionStatus.published,
      isTemplate: false,
      tags: ['security', 'checklist', 'best-practices'],
      version: 3,
      isPublic: false,
      isGlobal: false,
      createdBy: 'user-3',
      createdAt: '2024-03-01T11:00:00Z',
      updatedAt: '2024-08-15T16:20:00Z'
    }
  ];

  private mockUsages: WikiSectionUsage[] = [
    {
      id: 'usage-1',
      tenantId: 'tenant-1',
      sectionId: 'section-1',
      pageId: 'page-1',
      position: 0,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'usage-2',
      tenantId: 'tenant-1',
      sectionId: 'section-2',
      pageId: 'page-3',
      position: 1,
      createdAt: '2024-02-01T11:00:00Z',
      updatedAt: '2024-02-01T11:00:00Z'
    },
    {
      id: 'usage-3',
      tenantId: 'tenant-1',
      sectionId: 'section-1',
      pageId: 'page-2',
      position: 0,
      customData: { showTitle: false },
      createdAt: '2024-03-01T14:00:00Z',
      updatedAt: '2024-03-01T14:00:00Z'
    }
  ];

  private mockVersions: WikiSectionVersion[] = [
    {
      id: 'version-1',
      tenantId: 'tenant-1',
      sectionId: 'section-1',
      version: 1,
      title: 'Company Overview',
      content: {
        type: 'text',
        content: [
          {
            type: 'paragraph',
            content: 'Basic company information.'
          }
        ]
      },
      changeNote: 'Initial version',
      createdBy: 'user-1',
      createdAt: '2024-01-15T10:00:00Z'
    }
  ];

  private mockLinks: WikiSectionLink[] = [
    {
      id: 'link-1',
      tenantId: 'tenant-1',
      fromSectionId: 'section-1',
      toSectionId: 'section-3',
      linkType: 'related',
      description: 'Company overview links to security practices',
      createdAt: '2024-03-01T15:00:00Z'
    }
  ];

  constructor() {
    super();
    this.loadMockData();
  }

  private loadMockData() {
    if (!this.getStorage().length) {
      this.setStorage(this.mockSections);
    }
  }

  async createSection(data: CreateSectionData): Promise<WikiSection> {
    const section: WikiSection = {
      id: this.generateId(),
      tenantId: this.defaultTenantId,
      createdBy: this.defaultUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: SectionStatus.draft,
      isTemplate: false,
      tags: [],
      version: 1,
      isPublic: false,
      isGlobal: false,
      ...data
    };

    const sections = this.getStorage();
    sections.push(section);
    this.setStorage(sections);
    return section;
  }

  async updateSection(id: string, data: UpdateSectionData): Promise<WikiSection> {
    const sections = this.getStorage();
    const index = sections.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Section not found');

    // Create version if content changed
    if (data.content && JSON.stringify(data.content) !== JSON.stringify(sections[index].content)) {
      const version: WikiSectionVersion = {
        id: this.generateId(),
        tenantId: this.defaultTenantId,
        sectionId: id,
        version: sections[index].version + 1,
        title: data.title || sections[index].title,
        content: data.content,
        description: data.description,
        changeNote: data.changeNote,
        createdBy: this.defaultUserId,
        createdAt: new Date().toISOString()
      };
      this.mockVersions.push(version);
    }

    sections[index] = {
      ...sections[index],
      ...data,
      version: data.content ? sections[index].version + 1 : sections[index].version,
      updatedAt: new Date().toISOString()
    };

    this.setStorage(sections);
    return sections[index];
  }

  async deleteSection(id: string): Promise<void> {
    const sections = this.getStorage();
    const filtered = sections.filter(s => s.id !== id);
    this.storage.setItem(this.storageKey, JSON.stringify(filtered));
    
    // Remove usages
    this.mockUsages = this.mockUsages.filter(u => u.sectionId !== id);
  }

  async getSectionWithRelations(id: string): Promise<SectionWithRelations> {
    const section = this.getStorage().find(s => s.id === id);
    if (!section) throw new Error('Section not found');

    const usages = this.mockUsages.filter(u => u.sectionId === id);
    const versions = this.mockVersions.filter(v => v.sectionId === id);
    const links = this.mockLinks.filter(l => l.fromSectionId === id);
    const backlinks = this.mockLinks.filter(l => l.toSectionId === id);

    return {
      ...section,
      usages,
      versions,
      links,
      backlinks
    };
  }

  async addSectionToPage(data: CreateSectionUsageData): Promise<WikiSectionUsage> {
    const usage: WikiSectionUsage = {
      id: this.generateId(),
      tenantId: this.defaultTenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };

    this.mockUsages.push(usage);
    return usage;
  }

  async removeSectionFromPage(usageId: string): Promise<void> {
    this.mockUsages = this.mockUsages.filter(u => u.id !== usageId);
  }

  async getPageSections(pageId: string): Promise<WikiSectionUsage[]> {
    return this.mockUsages
      .filter(u => u.pageId === pageId)
      .sort((a, b) => a.position - b.position);
  }

  async searchSections(options: SectionSearchOptions): Promise<SectionSearchResult[]> {
    const { query, types, statuses, tags, isTemplate, limit = 10 } = options;
    const sections = this.getStorage();

    const results = sections
      .filter(section => {
        if (types && !types.includes(section.type)) return false;
        if (statuses && !statuses.includes(section.status)) return false;
        if (isTemplate !== undefined && section.isTemplate !== isTemplate) return false;
        if (tags && !tags.some(tag => section.tags.includes(tag))) return false;
        
        return section.title.toLowerCase().includes(query.toLowerCase()) ||
               section.description?.toLowerCase().includes(query.toLowerCase()) ||
               section.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
      })
      .map(section => {
        const usageCount = this.mockUsages.filter(u => u.sectionId === section.id).length;
        return {
          id: section.id,
          title: section.title,
          description: section.description,
          type: section.type,
          status: section.status,
          highlights: [section.title],
          relevanceScore: section.title.toLowerCase().includes(query.toLowerCase()) ? 1.0 : 0.6,
          usageCount,
          lastUpdated: section.updatedAt
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    return results;
  }

  async getTemplates(spaceId?: string): Promise<WikiSection[]> {
    return this.getStorage().filter(s => {
      if (!s.isTemplate) return false;
      if (spaceId && s.spaceId !== spaceId) return false;
      return true;
    });
  }

  async publishSection(id: string): Promise<WikiSection> {
    return this.updateSection(id, { status: SectionStatus.published });
  }

  async archiveSection(id: string): Promise<WikiSection> {
    return this.updateSection(id, { status: SectionStatus.archived });
  }

  async getSectionStats() {
    const sections = this.getStorage();
    const usageCounts = new Map<string, number>();
    
    this.mockUsages.forEach(usage => {
      usageCounts.set(usage.sectionId, (usageCounts.get(usage.sectionId) || 0) + 1);
    });

    const topUsedSections = sections
      .map(section => ({
        section,
        usageCount: usageCounts.get(section.id) || 0
      }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5);

    return {
      totalSections: sections.length,
      totalUsages: this.mockUsages.length,
      topUsedSections,
      recentlyCreated: sections
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
      recentlyUpdated: sections
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5)
    };
  }
}

export const sectionsRepository = new MockSectionsRepository();