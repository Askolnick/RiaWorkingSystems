/**
 * EntityLink Repository - Data access layer for entity relationships
 * 
 * Handles all database operations for EntityLink with:
 * - Multi-tenancy isolation
 * - Proper error handling  
 * - Query optimization
 * - Type safety
 */

import { BaseRepository, MockRepository } from './base.repository';
import {
  EntityLink,
  EntityLinkWithDetails,
  EntityRef,
  LinkKind,
  GetLinksOptions,
} from '../types/entity-link.types';

export interface EntityLinkRepository {
  // Core CRUD operations
  create(data: Omit<EntityLink, 'id' | 'createdAt' | 'updatedAt'>): Promise<EntityLink>;
  update(id: string, data: Partial<EntityLink>, tenantId: string): Promise<EntityLink>;
  delete(id: string, tenantId: string): Promise<void>;
  findById(id: string, tenantId: string): Promise<EntityLink | null>;
  
  // Query operations
  findByEntity(entity: EntityRef, options?: GetLinksOptions): Promise<EntityLinkWithDetails[]>;
  findByCriteria(criteria: {
    fromType?: string;
    toType?: string;
    kind?: LinkKind;
    tenantId?: string;
    active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<EntityLinkWithDetails[]>;
  
  // Relationship queries
  findOutgoingLinks(entity: EntityRef, kinds?: LinkKind[]): Promise<EntityLinkWithDetails[]>;
  findIncomingLinks(entity: EntityRef, kinds?: LinkKind[]): Promise<EntityLinkWithDetails[]>;
  findBidirectionalLinks(entity: EntityRef, kinds?: LinkKind[]): Promise<EntityLinkWithDetails[]>;
  
  // Existence checks
  linkExists(from: EntityRef, to: EntityRef, kind: LinkKind): Promise<EntityLink | null>;
  countEntityLinks(entity: EntityRef, kinds?: LinkKind[]): Promise<number>;
  
  // Bulk operations
  createMany(links: Array<Omit<EntityLink, 'id' | 'createdAt' | 'updatedAt'>>): Promise<EntityLink[]>;
  deleteMany(ids: string[], tenantId: string): Promise<void>;
  
  // Graph operations
  findConnectedEntities(entity: EntityRef, depth: number, kinds?: LinkKind[]): Promise<{
    entities: EntityRef[];
    links: EntityLinkWithDetails[];
  }>;
}

export class EntityLinkRepositoryImpl extends BaseRepository<EntityLink> implements EntityLinkRepository {
  protected endpoint = '/entity-links';

  /**
   * Create a new entity link
   */
  async create(data: Omit<EntityLink, 'id' | 'createdAt' | 'updatedAt'>): Promise<EntityLink> {
    return this.request<EntityLink>('POST', '', data);
  }

  /**
   * Update an existing entity link
   */
  async update(id: string, data: Partial<EntityLink>, tenantId: string): Promise<EntityLink> {
    return this.request<EntityLink>('PUT', `/${id}`, data, {
      headers: { 'X-Tenant-ID': tenantId }
    });
  }

  /**
   * Delete an entity link
   */
  async delete(id: string, tenantId: string): Promise<void> {
    await this.request<void>('DELETE', `/${id}`, undefined, {
      headers: { 'X-Tenant-ID': tenantId }
    });
  }

  /**
   * Find entity link by ID
   */
  async findById(id: string, tenantId: string): Promise<EntityLink | null> {
    try {
      return await this.request<EntityLink>('GET', `/${id}`, undefined, {
        headers: { 'X-Tenant-ID': tenantId }
      });
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Find all links for a specific entity
   */
  async findByEntity(entity: EntityRef, options: GetLinksOptions = {}): Promise<EntityLinkWithDetails[]> {
    const params = new URLSearchParams();
    params.append('entityType', entity.type);
    params.append('entityId', entity.id);
    
    if (options.kinds?.length) {
      options.kinds.forEach(kind => params.append('kinds', kind));
    }
    if (options.includeInactive) {
      params.append('includeInactive', 'true');
    }
    if (options.includeDetails) {
      params.append('includeDetails', 'true');
    }
    if (options.direction) {
      params.append('direction', options.direction);
    }

    return this.request<EntityLinkWithDetails[]>('GET', `?${params.toString()}`, undefined, {
      headers: { 'X-Tenant-ID': entity.tenantId }
    });
  }

  /**
   * Find links by various criteria
   */
  async findByCriteria(criteria: {
    fromType?: string;
    toType?: string;
    kind?: LinkKind;
    tenantId?: string;
    active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<EntityLinkWithDetails[]> {
    const params = new URLSearchParams();
    
    Object.entries(criteria).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    return this.request<EntityLinkWithDetails[]>('GET', `/search?${params.toString()}`, undefined, {
      headers: criteria.tenantId ? { 'X-Tenant-ID': criteria.tenantId } : {}
    });
  }

  /**
   * Find outgoing links from an entity
   */
  async findOutgoingLinks(entity: EntityRef, kinds?: LinkKind[]): Promise<EntityLinkWithDetails[]> {
    return this.findByEntity(entity, { 
      kinds, 
      direction: 'outgoing', 
      includeDetails: true 
    });
  }

  /**
   * Find incoming links to an entity
   */
  async findIncomingLinks(entity: EntityRef, kinds?: LinkKind[]): Promise<EntityLinkWithDetails[]> {
    return this.findByEntity(entity, { 
      kinds, 
      direction: 'incoming', 
      includeDetails: true 
    });
  }

  /**
   * Find all links (both incoming and outgoing) for an entity
   */
  async findBidirectionalLinks(entity: EntityRef, kinds?: LinkKind[]): Promise<EntityLinkWithDetails[]> {
    return this.findByEntity(entity, { 
      kinds, 
      direction: 'both', 
      includeDetails: true 
    });
  }

  /**
   * Check if a specific link already exists
   */
  async linkExists(from: EntityRef, to: EntityRef, kind: LinkKind): Promise<EntityLink | null> {
    const params = new URLSearchParams({
      fromType: from.type,
      fromId: from.id,
      toType: to.type,
      toId: to.id,
      kind,
    });

    try {
      const results = await this.request<EntityLink[]>('GET', `/exists?${params.toString()}`, undefined, {
        headers: { 'X-Tenant-ID': from.tenantId }
      });
      
      return results.length > 0 ? results[0] : null;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Count links for an entity
   */
  async countEntityLinks(entity: EntityRef, kinds?: LinkKind[]): Promise<number> {
    const params = new URLSearchParams({
      entityType: entity.type,
      entityId: entity.id,
    });
    
    if (kinds?.length) {
      kinds.forEach(kind => params.append('kinds', kind));
    }

    const result = await this.request<{ count: number }>('GET', `/count?${params.toString()}`, undefined, {
      headers: { 'X-Tenant-ID': entity.tenantId }
    });
    
    return result.count;
  }

  /**
   * Create multiple links at once
   */
  async createMany(links: Array<Omit<EntityLink, 'id' | 'createdAt' | 'updatedAt'>>): Promise<EntityLink[]> {
    return this.request<EntityLink[]>('POST', '/bulk', { links });
  }

  /**
   * Delete multiple links at once
   */
  async deleteMany(ids: string[], tenantId: string): Promise<void> {
    await this.request<void>('DELETE', '/bulk', { ids }, {
      headers: { 'X-Tenant-ID': tenantId }
    });
  }

  /**
   * Find connected entities up to a certain depth
   */
  async findConnectedEntities(
    entity: EntityRef, 
    depth: number, 
    kinds?: LinkKind[]
  ): Promise<{
    entities: EntityRef[];
    links: EntityLinkWithDetails[];
  }> {
    const params = new URLSearchParams({
      entityType: entity.type,
      entityId: entity.id,
      depth: depth.toString(),
    });
    
    if (kinds?.length) {
      kinds.forEach(kind => params.append('kinds', kind));
    }

    return this.request<{
      entities: EntityRef[];
      links: EntityLinkWithDetails[];
    }>('GET', `/graph?${params.toString()}`, undefined, {
      headers: { 'X-Tenant-ID': entity.tenantId }
    });
  }
}

/**
 * Mock repository for development and testing
 */
export class MockEntityLinkRepository extends MockRepository<EntityLink> implements EntityLinkRepository {
  protected storageKey = 'ria_entity_links';
  protected endpoint = '/entity-links';

  /**
   * Create a new entity link (mock)
   */
  async create(data: Omit<EntityLink, 'id' | 'createdAt' | 'updatedAt'>): Promise<EntityLink> {
    const link: EntityLink = {
      ...data,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const items = this.getStoredItems();
    items.push(link);
    this.setStoredItems(items);
    
    return link;
  }

  /**
   * Update an existing entity link (mock)
   */
  async update(id: string, data: Partial<EntityLink>, tenantId: string): Promise<EntityLink> {
    const items = this.getStoredItems();
    const index = items.findIndex(item => item.id === id && item.tenantId === tenantId);
    
    if (index === -1) {
      throw new Error(`EntityLink with id ${id} not found`);
    }
    
    const updated = {
      ...items[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    items[index] = updated;
    this.setStoredItems(items);
    
    return updated;
  }

  /**
   * Delete an entity link (mock)
   */
  async delete(id: string, tenantId: string): Promise<void> {
    const items = this.getStoredItems();
    const filtered = items.filter(item => !(item.id === id && item.tenantId === tenantId));
    this.setStoredItems(filtered);
  }

  /**
   * Find entity link by ID (mock)
   */
  async findById(id: string, tenantId: string): Promise<EntityLink | null> {
    const items = this.getStoredItems();
    return items.find(item => item.id === id && item.tenantId === tenantId) || null;
  }

  /**
   * Find all links for a specific entity (mock)
   */
  async findByEntity(entity: EntityRef, options: GetLinksOptions = {}): Promise<EntityLinkWithDetails[]> {
    const items = this.getStoredItems();
    
    let filtered = items.filter(item => 
      item.tenantId === entity.tenantId &&
      (
        (item.fromType === entity.type && item.fromId === entity.id) ||
        (item.toType === entity.type && item.toId === entity.id)
      )
    );
    
    if (options.kinds?.length) {
      filtered = filtered.filter(item => options.kinds!.includes(item.kind));
    }
    
    if (!options.includeInactive) {
      filtered = filtered.filter(item => item.active);
    }
    
    if (options.direction) {
      switch (options.direction) {
        case 'outgoing':
          filtered = filtered.filter(item => 
            item.fromType === entity.type && item.fromId === entity.id
          );
          break;
        case 'incoming':
          filtered = filtered.filter(item => 
            item.toType === entity.type && item.toId === entity.id
          );
          break;
        // 'both' is default - no additional filtering needed
      }
    }
    
    // Convert to EntityLinkWithDetails format
    return filtered.map(item => ({
      ...item,
      fromEntity: options.includeDetails ? {
        id: item.fromId,
        title: `${item.fromType}:${item.fromId}`,
        type: item.fromType as any,
        status: 'active',
      } : undefined,
      toEntity: options.includeDetails ? {
        id: item.toId,
        title: `${item.toType}:${item.toId}`,
        type: item.toType as any,
        status: 'active',
      } : undefined,
    }));
  }

  /**
   * Find links by various criteria (mock)
   */
  async findByCriteria(criteria: {
    fromType?: string;
    toType?: string;
    kind?: LinkKind;
    tenantId?: string;
    active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<EntityLinkWithDetails[]> {
    const items = this.getStoredItems();
    
    let filtered = items.filter(item => {
      if (criteria.tenantId && item.tenantId !== criteria.tenantId) return false;
      if (criteria.fromType && item.fromType !== criteria.fromType) return false;
      if (criteria.toType && item.toType !== criteria.toType) return false;
      if (criteria.kind && item.kind !== criteria.kind) return false;
      if (criteria.active !== undefined && item.active !== criteria.active) return false;
      return true;
    });
    
    if (criteria.offset) {
      filtered = filtered.slice(criteria.offset);
    }
    
    if (criteria.limit) {
      filtered = filtered.slice(0, criteria.limit);
    }
    
    return filtered.map(item => ({
      ...item,
      fromEntity: {
        id: item.fromId,
        title: `${item.fromType}:${item.fromId}`,
        type: item.fromType as any,
        status: 'active',
      },
      toEntity: {
        id: item.toId,
        title: `${item.toType}:${item.toId}`,
        type: item.toType as any,
        status: 'active',
      },
    }));
  }

  async findOutgoingLinks(entity: EntityRef, kinds?: LinkKind[]): Promise<EntityLinkWithDetails[]> {
    return this.findByEntity(entity, { kinds, direction: 'outgoing', includeDetails: true });
  }

  async findIncomingLinks(entity: EntityRef, kinds?: LinkKind[]): Promise<EntityLinkWithDetails[]> {
    return this.findByEntity(entity, { kinds, direction: 'incoming', includeDetails: true });
  }

  async findBidirectionalLinks(entity: EntityRef, kinds?: LinkKind[]): Promise<EntityLinkWithDetails[]> {
    return this.findByEntity(entity, { kinds, direction: 'both', includeDetails: true });
  }

  async linkExists(from: EntityRef, to: EntityRef, kind: LinkKind): Promise<EntityLink | null> {
    const items = this.getStoredItems();
    return items.find(item => 
      item.tenantId === from.tenantId &&
      item.fromType === from.type &&
      item.fromId === from.id &&
      item.toType === to.type &&
      item.toId === to.id &&
      item.kind === kind &&
      item.active
    ) || null;
  }

  async countEntityLinks(entity: EntityRef, kinds?: LinkKind[]): Promise<number> {
    const links = await this.findByEntity(entity, { kinds, includeInactive: false });
    return links.length;
  }

  async createMany(links: Array<Omit<EntityLink, 'id' | 'createdAt' | 'updatedAt'>>): Promise<EntityLink[]> {
    const results: EntityLink[] = [];
    for (const linkData of links) {
      const created = await this.create(linkData);
      results.push(created);
    }
    return results;
  }

  async deleteMany(ids: string[], tenantId: string): Promise<void> {
    for (const id of ids) {
      await this.delete(id, tenantId);
    }
  }

  async findConnectedEntities(
    entity: EntityRef, 
    depth: number, 
    kinds?: LinkKind[]
  ): Promise<{
    entities: EntityRef[];
    links: EntityLinkWithDetails[];
  }> {
    const visitedEntities = new Set<string>();
    const allEntities: EntityRef[] = [];
    const allLinks: EntityLinkWithDetails[] = [];
    
    await this.traverseConnectedEntities(entity, depth, kinds, visitedEntities, allEntities, allLinks);
    
    return {
      entities: allEntities,
      links: allLinks,
    };
  }

  private async traverseConnectedEntities(
    entity: EntityRef,
    remainingDepth: number,
    kinds: LinkKind[] | undefined,
    visited: Set<string>,
    allEntities: EntityRef[],
    allLinks: EntityLinkWithDetails[]
  ): Promise<void> {
    const entityKey = `${entity.type}:${entity.id}`;
    
    if (visited.has(entityKey) || remainingDepth <= 0) {
      return;
    }
    
    visited.add(entityKey);
    allEntities.push(entity);
    
    const links = await this.findByEntity(entity, { kinds, includeDetails: true });
    
    for (const link of links) {
      if (!allLinks.find(existing => existing.id === link.id)) {
        allLinks.push(link);
        
        // Find the connected entity
        const connectedEntity = link.fromType === entity.type && link.fromId === entity.id
          ? { type: link.toType as any, id: link.toId, tenantId: link.tenantId }
          : { type: link.fromType as any, id: link.fromId, tenantId: link.tenantId };
        
        await this.traverseConnectedEntities(
          connectedEntity,
          remainingDepth - 1,
          kinds,
          visited,
          allEntities,
          allLinks
        );
      }
    }
  }

  private generateId(): string {
    return `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export repository instances
export const entityLinkRepository = new MockEntityLinkRepository();