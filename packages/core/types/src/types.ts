// -------------------- Core Types --------------------

export interface WikiSpace {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  slug: string;
  isPublic: boolean;
  icon?: string;
  color?: string;
  sortOrder: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WikiPage {
  id: string;
  tenantId: string;
  spaceId: string;
  parentId?: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  status: WikiPageStatus;
  isTemplate: boolean;
  templateId?: string;
  tags: string[];
  version: number;
  publishedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type WikiPageStatus = 'draft' | 'published' | 'archived';

export interface WikiRevision {
  id: string;
  tenantId: string;
  pageId: string;
  version: number;
  title: string;
  content: string;
  excerpt?: string;
  changeNote?: string;
  createdBy: string;
  createdAt: string;
}

export interface WikiLink {
  id: string;
  tenantId: string;
  fromPageId: string;
  toPageId: string;
  linkText?: string;
  linkType: WikiLinkType;
  createdAt: string;
}

export type WikiLinkType = 'internal' | 'mention' | 'reference';

export interface WikiBookmark {
  id: string;
  tenantId: string;
  userId: string;
  pageId: string;
  createdAt: string;
}

// -------------------- Extended Types with Relations --------------------

export interface WikiSpaceWithPages extends WikiSpace {
  pages: WikiPage[];
  pageCount: number;
}

export interface WikiPageWithRelations extends WikiPage {
  space: WikiSpace;
  parent?: WikiPage;
  children: WikiPage[];
  template?: WikiPage;
  revisions: WikiRevision[];
  backlinks: WikiLink[];
  bookmarkCount: number;
}

export interface WikiPageTree extends WikiPage {
  children: WikiPageTree[];
  level: number;
}

// -------------------- Create/Update Types --------------------

export interface CreateWikiSpaceData {
  name: string;
  description?: string;
  slug: string;
  isPublic?: boolean;
  icon?: string;
  color?: string;
  sortOrder?: number;
}

export interface UpdateWikiSpaceData extends Partial<CreateWikiSpaceData> {}

export interface CreateWikiPageData {
  spaceId: string;
  parentId?: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  status?: WikiPageStatus;
  isTemplate?: boolean;
  templateId?: string;
  tags?: string[];
}

export interface UpdateWikiPageData extends Partial<CreateWikiPageData> {
  changeNote?: string; // For revision tracking
}

export interface CreateWikiRevisionData {
  pageId: string;
  title: string;
  content: string;
  excerpt?: string;
  changeNote?: string;
}

// -------------------- Filter/Search Types --------------------

export interface WikiSpaceFilters {
  isPublic?: boolean;
  createdBy?: string;
  search?: string;
}

export interface WikiPageFilters {
  spaceId?: string;
  parentId?: string;
  status?: WikiPageStatus;
  isTemplate?: boolean;
  tags?: string[];
  createdBy?: string;
  search?: string;
  hasContent?: boolean;
}

export interface WikiSort {
  field: keyof WikiPage | keyof WikiSpace;
  direction: 'asc' | 'desc';
}

// -------------------- Stats Types --------------------

export interface WikiStats {
  totalSpaces: number;
  totalPages: number;
  publishedPages: number;
  draftPages: number;
  archivedPages: number;
  totalRevisions: number;
  recentlyUpdated: WikiPage[];
  popularPages: (WikiPage & { viewCount: number })[];
  topContributors: Array<{
    userId: string;
    pageCount: number;
    revisionCount: number;
  }>;
}

export interface WikiSpaceStats extends WikiSpace {
  pageCount: number;
  publishedCount: number;
  draftCount: number;
  archivedCount: number;
  lastUpdated: string;
  contributors: string[];
}

// -------------------- Search Types --------------------

export interface WikiSearchResult {
  type: 'space' | 'page';
  id: string;
  title: string;
  excerpt?: string;
  highlights: string[];
  relevanceScore: number;
  breadcrumb: string[];
  lastUpdated: string;
}

export interface WikiSearchOptions {
  query: string;
  spaceIds?: string[];
  pageStatuses?: WikiPageStatus[];
  tags?: string[];
  limit?: number;
  offset?: number;
}

// -------------------- Template Types --------------------

export interface WikiTemplate extends WikiPage {
  isTemplate: true;
  variables: WikiTemplateVariable[];
  category?: string;
}

export interface WikiTemplateVariable {
  name: string;
  type: 'text' | 'date' | 'select' | 'multiselect';
  description?: string;
  required: boolean;
  defaultValue?: string;
  options?: string[]; // For select types
}

export interface CreateFromTemplateData {
  templateId: string;
  title: string;
  slug: string;
  spaceId: string;
  parentId?: string;
  variables: Record<string, any>;
}

// -------------------- Analytics Types --------------------

export interface WikiAnalytics {
  pageViews: Record<string, number>; // pageId -> view count
  popularPages: Array<{
    page: WikiPage;
    views: number;
    uniqueVisitors: number;
  }>;
  activityTimeline: Array<{
    date: string;
    pagesCreated: number;
    pagesUpdated: number;
    revisionsCreated: number;
  }>;
  spaceActivity: Record<string, {
    space: WikiSpace;
    activity: number;
  }>;
}

// -------------------- Export Types --------------------

export interface WikiExportOptions {
  format: 'markdown' | 'html' | 'pdf' | 'json';
  spaceId?: string;
  pageIds?: string[];
  includeSubpages: boolean;
  includeRevisions: boolean;
  includeMetadata: boolean;
}

export interface WikiImportData {
  format: 'markdown' | 'confluence' | 'notion' | 'json';
  spaceId: string;
  data: any;
  options: {
    preserveStructure: boolean;
    createRevisions: boolean;
    handleConflicts: 'skip' | 'overwrite' | 'rename';
  };
}

// -------------------- Permission Types --------------------

export interface WikiPermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canManageSpace: boolean;
  canCreateSpace: boolean;
}

export interface WikiAccessLevel {
  spaceId?: string;
  pageId?: string;
  userId: string;
  permissions: WikiPermissions;
  inheritedFrom?: string; // space or parent page
}