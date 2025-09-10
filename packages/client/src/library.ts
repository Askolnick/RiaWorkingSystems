export type ID = string;
export type DocKind = 'wiki' | 'spec' | 'policy' | 'howto' | 'memo' | 'brief';
export type DocStatus = 'draft' | 'review' | 'scheduled' | 'published' | 'archived';
export type PublishScope = 'private' | 'users' | 'groups' | 'internal' | 'clients' | 'public';

export interface LibraryDoc {
  id: ID;
  title: string;
  slug?: string;
  summary?: string;
  kind: DocKind;
  status: DocStatus;
  ownerId?: ID;
  tags?: string[];
  bodyMd?: string;
  bodyTypist?: any;
  sectionIds?: ID[];
  updatedAt?: string;
  createdAt?: string;
}

export interface LibrarySection {
  id: ID;
  name: string;
  title?: string;
  bodyMd?: string;
  bodyTypist?: any;
  version: number;
  updatedAt: string;
  createdAt: string;
}

export interface DocPublish {
  id: ID;
  docId: ID;
  scope: PublishScope;
  userIds: ID[];
  groupIds: ID[];
  urlPath?: string;
  createdAt: string;
}

/**
 * LibraryApi defines the methods required for managing documents and
 * sections. Each method returns a promise to support asynchronous
 * implementations. For the MVP, filters are optional and may be
 * expanded later.
 */
export interface LibraryApi {
  // List documents with optional filters
  listDocs(params?: {
    q?: string;
    status?: DocStatus | 'all';
    kind?: DocKind | 'all';
    tag?: string;
    sort?: 'updated' | 'created';
  }): Promise<LibraryDoc[]>;
  
  // Get a document and its section / publish info
  getDoc(id: ID): Promise<{ doc: LibraryDoc; sections: { id: ID; name: string; version: number }[]; publishes: DocPublish[] }>;
  
  // Create a document
  createDoc(input: { title: string; kind?: DocKind; bodyMd?: string; tags?: string[] }): Promise<LibraryDoc>;
  
  // Update a document
  updateDoc(id: ID, patch: Partial<Omit<LibraryDoc, 'id' | 'createdAt'>>): Promise<LibraryDoc>;
  
  // Attach a section to a doc
  attachSection(docId: ID, sectionId: ID, position?: number): Promise<void>;
  
  // Detach a section from a doc
  detachSection(docId: ID, sectionId: ID): Promise<void>;
  
  // List sections
  listSections(params?: { q?: string }): Promise<LibrarySection[]>;
  
  // Create a section
  createSection(input: { name: string; bodyMd?: string }): Promise<LibrarySection>;
  
  // Update a section
  updateSection(id: ID, patch: Partial<Omit<LibrarySection, 'id' | 'createdAt'>>): Promise<LibrarySection>;
  
  // List publishes
  listPublishes(docId: ID): Promise<DocPublish[]>;
  
  // Upsert a publish entry
  upsertPublish(docId: ID, scope: PublishScope, opts: { userIds?: ID[]; groupIds?: ID[]; urlPath?: string }): Promise<DocPublish>;
  
  // Remove a publish entry
  removePublish(publishId: ID): Promise<void>;
}

// Mock implementation for development/testing
export const createMockLibrary = (): LibraryApi => {
  let docs: LibraryDoc[] = [
    {
      id: '1',
      title: 'Company Onboarding Guide',
      slug: 'company-onboarding',
      kind: 'howto',
      status: 'published',
      ownerId: '1',
      tags: ['onboarding', 'hr'],
      summary: 'Complete guide for new employee onboarding',
      bodyMd: '# Onboarding Guide\n\nWelcome to our company...',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Investment Policy Statement',
      slug: 'investment-policy',
      kind: 'policy',
      status: 'published',
      ownerId: '2',
      tags: ['investment', 'policy'],
      bodyMd: '# Investment Policy\n\nOur investment approach...',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
  ];

  let sections: LibrarySection[] = [
    {
      id: '1',
      name: 'Introduction',
      bodyMd: '## Introduction\n\nThis section covers...',
      version: 1,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
  ];

  let publishes: DocPublish[] = [];

  const api: LibraryApi = {
    async listDocs(params = {}) {
      let filtered = [...docs];
      
      if (params.q) {
        const q = params.q.toLowerCase();
        filtered = filtered.filter(doc => 
          doc.title.toLowerCase().includes(q) ||
          doc.tags.some(tag => tag.toLowerCase().includes(q))
        );
      }
      
      if (params.status && params.status !== 'all') {
        filtered = filtered.filter(doc => doc.status === params.status);
      }
      
      if (params.kind && params.kind !== 'all') {
        filtered = filtered.filter(doc => doc.kind === params.kind);
      }
      
      if (params.tag) {
        filtered = filtered.filter(doc => doc.tags.includes(params.tag));
      }
      
      if (params.sort === 'created') {
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else {
        filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      }
      
      return filtered;
    },

    async getDoc(id: ID) {
      const doc = docs.find(d => d.id === id);
      if (!doc) throw new Error(`Document ${id} not found`);
      
      const docPublishes = publishes.filter(p => p.docId === id);
      const docSections = sections.map(s => ({ id: s.id, name: s.name, version: s.version }));
      
      return { doc, sections: docSections, publishes: docPublishes };
    },

    async createDoc(input) {
      const doc: LibraryDoc = {
        id: Math.random().toString(36).substring(2),
        title: input.title,
        kind: input.kind || 'wiki',
        status: 'draft',
        tags: input.tags || [],
        bodyMd: input.bodyMd,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      
      docs.push(doc);
      return doc;
    },

    async updateDoc(id: ID, patch) {
      const index = docs.findIndex(d => d.id === id);
      if (index === -1) throw new Error(`Document ${id} not found`);
      
      docs[index] = {
        ...docs[index],
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      
      return docs[index];
    },

    async attachSection(docId: ID, sectionId: ID, position?: number) {
      // In a real implementation, this would manage the relationship
      // For now, we just verify both exist
      if (!docs.find(d => d.id === docId)) throw new Error(`Document ${docId} not found`);
      if (!sections.find(s => s.id === sectionId)) throw new Error(`Section ${sectionId} not found`);
    },

    async detachSection(docId: ID, sectionId: ID) {
      // In a real implementation, this would remove the relationship
      if (!docs.find(d => d.id === docId)) throw new Error(`Document ${docId} not found`);
      if (!sections.find(s => s.id === sectionId)) throw new Error(`Section ${sectionId} not found`);
    },

    async listSections(params = {}) {
      let filtered = [...sections];
      
      if (params.q) {
        const q = params.q.toLowerCase();
        filtered = filtered.filter(section => 
          section.name.toLowerCase().includes(q)
        );
      }
      
      return filtered;
    },

    async createSection(input) {
      const section: LibrarySection = {
        id: Math.random().toString(36).substring(2),
        name: input.name,
        bodyMd: input.bodyMd,
        version: 1,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      
      sections.push(section);
      return section;
    },

    async updateSection(id: ID, patch) {
      const index = sections.findIndex(s => s.id === id);
      if (index === -1) throw new Error(`Section ${id} not found`);
      
      sections[index] = {
        ...sections[index],
        ...patch,
        version: sections[index].version + 1,
        updatedAt: new Date().toISOString(),
      };
      
      return sections[index];
    },

    async listPublishes(docId: ID) {
      return publishes.filter(p => p.docId === docId);
    },

    async upsertPublish(docId: ID, scope: PublishScope, opts) {
      const existing = publishes.find(p => p.docId === docId && p.scope === scope);
      
      if (existing) {
        existing.userIds = opts.userIds || [];
        existing.groupIds = opts.groupIds || [];
        existing.urlPath = opts.urlPath;
        return existing;
      }
      
      const publish: DocPublish = {
        id: Math.random().toString(36).substring(2),
        docId,
        scope,
        userIds: opts.userIds || [],
        groupIds: opts.groupIds || [],
        urlPath: opts.urlPath,
        createdAt: new Date().toISOString(),
      };
      
      publishes.push(publish);
      return publish;
    },

    async removePublish(publishId: ID) {
      const index = publishes.findIndex(p => p.id === publishId);
      if (index === -1) throw new Error(`Publish ${publishId} not found`);
      publishes.splice(index, 1);
    },
  };

  return api;
};

// Default library instance
export const library = createMockLibrary();