export type LinkKind = 'relates' | 'depends' | 'blocks' | 'duplicates' | 'references';

export interface EntityRef {
  type: string;
  id: string;
  tenantId?: string;
}

export interface EntityLink {
  id: string;
  from: { type: string; id: string };
  to: { type: string; id: string };
  kind: LinkKind;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// Helper function to create entity references
export function createEntityRef(type: string, id: string, tenantId?: string): EntityRef {
  return { type, id, tenantId };
}

// API surface for links; use this interface for both mock and real implementations.
export interface LinksApi {
  /**
   * List links connected to a given entity. Returns all links where the entity
   * appears as either the source or the target.
   */
  listLinks(entity: { type: string; id: string }): Promise<EntityLink[]>;

  /**
   * Create a new link connecting two entities. If kind is not provided it
   * defaults to `relates`.
   */
  createLink(input: {
    from: { type: string; id: string };
    to: { type: string; id: string };
    kind?: LinkKind;
    note?: string;
  }): Promise<EntityLink>;

  /**
   * Remove an existing link.
   */
  deleteLink(id: string): Promise<void>;

  /**
   * Update an existing link.
   */
  updateLink(id: string, patch: Partial<Pick<EntityLink, 'kind' | 'note'>>): Promise<EntityLink>;
}

// Mock implementation for development/testing
export const createMockLinks = (): LinksApi => {
  let links: EntityLink[] = [
    {
      id: '1',
      from: { type: 'client', id: '1' },
      to: { type: 'document', id: '1' },
      kind: 'references',
      note: 'Client onboarding documentation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2', 
      from: { type: 'document', id: '1' },
      to: { type: 'document', id: '2' },
      kind: 'relates',
      note: 'Related investment policies',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  const api: LinksApi = {
    async listLinks(entity) {
      return links.filter(link => 
        (link.from.type === entity.type && link.from.id === entity.id) ||
        (link.to.type === entity.type && link.to.id === entity.id)
      );
    },

    async createLink(input) {
      const link: EntityLink = {
        id: Math.random().toString(36).substring(2),
        from: input.from,
        to: input.to,
        kind: input.kind || 'relates',
        note: input.note,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Prevent duplicate links
      const existing = links.find(l => 
        l.from.type === link.from.type &&
        l.from.id === link.from.id &&
        l.to.type === link.to.type &&
        l.to.id === link.to.id &&
        l.kind === link.kind
      );

      if (existing) {
        throw new Error('Link already exists');
      }

      links.push(link);
      return link;
    },

    async deleteLink(id) {
      const index = links.findIndex(link => link.id === id);
      if (index === -1) {
        throw new Error(`Link ${id} not found`);
      }
      links.splice(index, 1);
    },

    async updateLink(id, patch) {
      const index = links.findIndex(link => link.id === id);
      if (index === -1) {
        throw new Error(`Link ${id} not found`);
      }

      links[index] = {
        ...links[index],
        ...patch,
        updatedAt: new Date().toISOString(),
      };

      return links[index];
    },
  };

  return api;
};

// Default links instance
export const links = createMockLinks();