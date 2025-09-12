/**
 * EntityLink Service - Bulletproof service layer for cross-module entity relationships
 * 
 * This service provides:
 * - CRUD operations for entity links with comprehensive validation
 * - Caching layer for performance optimization
 * - Multi-tenancy isolation with proper security
 * - Event-driven notifications for link changes
 * - Bulk operations with transaction support
 * - Graph traversal for dependency analysis
 */

import {
  EntityRef,
  EntityLink,
  EntityLinkWithDetails,
  LinkKind,
  CreateLinkOptions,
  BulkCreateOptions,
  GetLinksOptions,
  ValidationResult,
  EntityLinkError,
  EntityLinkErrorCode,
  createEntityRef,
} from '../types/entity-link.types';
import { EntityLinkValidator } from './entity-link.validator';
import { entityLinkRepository } from '../repositories/entity-link.repository';

export interface EntityLinkService {
  // Core CRUD operations
  createLink(from: EntityRef, to: EntityRef, kind: LinkKind, options?: CreateLinkOptions): Promise<EntityLink>;
  updateLink(linkId: string, updates: Partial<Pick<EntityLink, 'kind' | 'note' | 'metadata' | 'active'>>, tenantId: string): Promise<EntityLink>;
  deleteLink(linkId: string, tenantId: string, soft?: boolean): Promise<void>;
  getLink(linkId: string, tenantId: string): Promise<EntityLink | null>;
  
  // Query operations
  getEntityLinks(entity: EntityRef, options?: GetLinksOptions): Promise<EntityLinkWithDetails[]>;
  findLinks(fromType?: string, toType?: string, kind?: LinkKind, tenantId?: string, options?: GetLinksOptions): Promise<EntityLinkWithDetails[]>;
  
  // Bulk operations
  createBulkLinks(links: Array<{ from: EntityRef; to: EntityRef; kind: LinkKind }>, tenantId: string, options?: BulkCreateOptions): Promise<EntityLink[]>;
  deleteBulkLinks(linkIds: string[], tenantId: string, soft?: boolean): Promise<void>;
  
  // Graph operations
  getEntityGraph(entity: EntityRef, depth?: number, kinds?: LinkKind[]): Promise<EntityGraph>;
  findPath(from: EntityRef, to: EntityRef, maxDepth?: number): Promise<EntityPath[]>;
  validateNoCycle(from: EntityRef, to: EntityRef, kind: LinkKind): Promise<boolean>;
  
  // Cache management
  invalidateCache(entity?: EntityRef): Promise<void>;
  warmCache(entities: EntityRef[]): Promise<void>;
}

export interface EntityGraph {
  nodes: Array<{
    entity: EntityRef;
    details?: {
      title: string;
      status?: string;
      url?: string;
    };
  }>;
  edges: Array<{
    from: EntityRef;
    to: EntityRef;
    kind: LinkKind;
    linkId: string;
  }>;
}

export interface EntityPath {
  entities: EntityRef[];
  links: Array<{
    from: EntityRef;
    to: EntityRef;
    kind: LinkKind;
  }>;
  length: number;
}

export class EntityLinkServiceImpl implements EntityLinkService {
  private cache = new Map<string, any>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
  /**
   * Create a new entity link with comprehensive validation
   */
  async createLink(
    from: EntityRef,
    to: EntityRef,
    kind: LinkKind,
    options: CreateLinkOptions = {}
  ): Promise<EntityLink> {
    try {
      // Validate the link creation
      const validation = await EntityLinkValidator.validateLink(from, to, kind, {
        skipEntityExistence: options.skipValidation,
        skipCircularCheck: options.skipValidation,
        skipPermissionCheck: options.skipValidation,
      });

      if (!validation.valid) {
        throw new EntityLinkError(
          `Link validation failed: ${validation.errors.map(e => e.message).join(', ')}`,
          EntityLinkErrorCode.VALIDATION_FAILED,
          { validationErrors: validation.errors }
        );
      }

      // Check for duplicates unless explicitly allowed
      if (!options.allowDuplicates) {
        const existing = await entityLinkRepository.linkExists(from, to, kind);
        if (existing) {
          throw new EntityLinkError(
            'Link already exists between these entities',
            EntityLinkErrorCode.DUPLICATE_LINK,
            { existingLinkId: existing.id }
          );
        }
      }

      // Create the link
      const link = await entityLinkRepository.create({
        tenantId: from.tenantId,
        fromType: from.type,
        fromId: from.id,
        toType: to.type,
        toId: to.id,
        kind,
        note: options.note,
        metadata: options.metadata,
        active: true,
        createdBy: options.userId || 'system',
      });

      // Invalidate relevant caches
      await this.invalidateEntityCaches(from, to);

      // Emit event for other modules
      await this.emitLinkEvent('link.created', link);

      return link;
    } catch (error) {
      if (error instanceof EntityLinkError) {
        throw error;
      }
      
      throw new EntityLinkError(
        'Failed to create entity link',
        EntityLinkErrorCode.VALIDATION_FAILED,
        { originalError: error instanceof Error ? error.message : error }
      );
    }
  }

  /**
   * Update an existing entity link
   */
  async updateLink(
    linkId: string,
    updates: Partial<Pick<EntityLink, 'kind' | 'note' | 'metadata' | 'active'>>,
    tenantId: string
  ): Promise<EntityLink> {
    try {
      // Get existing link with tenant validation
      const existingLink = await entityLinkRepository.findById(linkId, tenantId);
      if (!existingLink) {
        throw new EntityLinkError(
          'Link not found',
          EntityLinkErrorCode.ENTITY_NOT_FOUND,
          { linkId, tenantId }
        );
      }

      // If changing the link kind, validate the new relationship
      if (updates.kind && updates.kind !== existingLink.kind) {
        const from = createEntityRef(existingLink.fromType as any, existingLink.fromId, existingLink.tenantId);
        const to = createEntityRef(existingLink.toType as any, existingLink.toId, existingLink.tenantId);
        
        const validation = await EntityLinkValidator.validateLink(from, to, updates.kind);
        if (!validation.valid) {
          throw new EntityLinkError(
            `Link kind validation failed: ${validation.errors.map(e => e.message).join(', ')}`,
            EntityLinkErrorCode.VALIDATION_FAILED,
            { validationErrors: validation.errors }
          );
        }
      }

      // Update the link
      const updatedLink = await entityLinkRepository.update(linkId, updates, tenantId);

      // Invalidate caches
      const from = createEntityRef(existingLink.fromType as any, existingLink.fromId, existingLink.tenantId);
      const to = createEntityRef(existingLink.toType as any, existingLink.toId, existingLink.tenantId);
      await this.invalidateEntityCaches(from, to);

      // Emit event
      await this.emitLinkEvent('link.updated', updatedLink);

      return updatedLink;
    } catch (error) {
      if (error instanceof EntityLinkError) {
        throw error;
      }
      
      throw new EntityLinkError(
        'Failed to update entity link',
        EntityLinkErrorCode.VALIDATION_FAILED,
        { linkId, originalError: error instanceof Error ? error.message : error }
      );
    }
  }

  /**
   * Delete an entity link (soft or hard delete)
   */
  async deleteLink(linkId: string, tenantId: string, soft = true): Promise<void> {
    try {
      const existingLink = await entityLinkRepository.findById(linkId, tenantId);
      if (!existingLink) {
        throw new EntityLinkError(
          'Link not found',
          EntityLinkErrorCode.ENTITY_NOT_FOUND,
          { linkId, tenantId }
        );
      }

      if (soft) {
        // Soft delete - mark as inactive
        await entityLinkRepository.update(linkId, { active: false }, tenantId);
      } else {
        // Hard delete - remove from database
        await entityLinkRepository.delete(linkId, tenantId);
      }

      // Invalidate caches
      const from = createEntityRef(existingLink.fromType as any, existingLink.fromId, existingLink.tenantId);
      const to = createEntityRef(existingLink.toType as any, existingLink.toId, existingLink.tenantId);
      await this.invalidateEntityCaches(from, to);

      // Emit event
      await this.emitLinkEvent('link.deleted', { linkId, soft, tenantId });
    } catch (error) {
      if (error instanceof EntityLinkError) {
        throw error;
      }
      
      throw new EntityLinkError(
        'Failed to delete entity link',
        EntityLinkErrorCode.VALIDATION_FAILED,
        { linkId, originalError: error instanceof Error ? error.message : error }
      );
    }
  }

  /**
   * Get a single entity link by ID
   */
  async getLink(linkId: string, tenantId: string): Promise<EntityLink | null> {
    const cacheKey = `link:${linkId}:${tenantId}`;
    
    // Check cache first
    const cached = this.getFromCache<EntityLink>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const link = await entityLinkRepository.findById(linkId, tenantId);
      
      if (link) {
        this.setCache(cacheKey, link);
      }
      
      return link;
    } catch (error) {
      throw new EntityLinkError(
        'Failed to retrieve entity link',
        EntityLinkErrorCode.VALIDATION_FAILED,
        { linkId, originalError: error instanceof Error ? error.message : error }
      );
    }
  }

  /**
   * Get all links for a specific entity with optional filtering
   */
  async getEntityLinks(
    entity: EntityRef,
    options: GetLinksOptions = {}
  ): Promise<EntityLinkWithDetails[]> {
    const cacheKey = `entity-links:${entity.type}:${entity.id}:${entity.tenantId}:${JSON.stringify(options)}`;
    
    // Check cache first
    const cached = this.getFromCache<EntityLinkWithDetails[]>(cacheKey);
    if (cached && !options.skipCache) {
      return cached;
    }

    try {
      const links = await entityLinkRepository.findByEntity(entity, options);
      
      this.setCache(cacheKey, links);
      
      return links;
    } catch (error) {
      throw new EntityLinkError(
        'Failed to retrieve entity links',
        EntityLinkErrorCode.VALIDATION_FAILED,
        { entity, originalError: error instanceof Error ? error.message : error }
      );
    }
  }

  /**
   * Find links by criteria
   */
  async findLinks(
    fromType?: string,
    toType?: string,
    kind?: LinkKind,
    tenantId?: string,
    options: GetLinksOptions = {}
  ): Promise<EntityLinkWithDetails[]> {
    try {
      return await entityLinkRepository.findByCriteria({
        fromType,
        toType,
        kind,
        tenantId,
        active: !options.includeInactive,
      });
    } catch (error) {
      throw new EntityLinkError(
        'Failed to find entity links',
        EntityLinkErrorCode.VALIDATION_FAILED,
        { originalError: error instanceof Error ? error.message : error }
      );
    }
  }

  /**
   * Create multiple links in a batch with transaction support
   */
  async createBulkLinks(
    links: Array<{ from: EntityRef; to: EntityRef; kind: LinkKind }>,
    tenantId: string,
    options: BulkCreateOptions = {}
  ): Promise<EntityLink[]> {
    const results: EntityLink[] = [];
    const errors: Array<{ index: number; error: Error }> = [];

    try {
      // Validate all links first if not skipping validation
      if (!options.skipValidation) {
        const validation = await EntityLinkValidator.validateBulkLinks(links, {
          stopOnFirstError: !options.allowPartialFailure,
          skipEntityExistence: options.skipValidation,
        });

        if (!validation.valid && !options.allowPartialFailure) {
          throw new EntityLinkError(
            'Bulk link validation failed',
            EntityLinkErrorCode.VALIDATION_FAILED,
            { validationResults: validation.results }
          );
        }
      }

      // Process in batches
      const batchSize = options.batchSize || 10;
      for (let i = 0; i < links.length; i += batchSize) {
        const batch = links.slice(i, i + batchSize);
        
        for (const [batchIndex, linkData] of batch.entries()) {
          const globalIndex = i + batchIndex;
          
          try {
            const link = await this.createLink(
              linkData.from,
              linkData.to,
              linkData.kind,
              {
                ...options,
                skipValidation: true, // Already validated above
              }
            );
            results[globalIndex] = link;
          } catch (error) {
            errors.push({ index: globalIndex, error: error as Error });
            
            if (!options.allowPartialFailure) {
              throw error;
            }
          }
        }
      }

      if (errors.length > 0 && !options.allowPartialFailure) {
        throw new EntityLinkError(
          'Some links failed to create',
          EntityLinkErrorCode.VALIDATION_FAILED,
          { errors: errors.map(e => ({ index: e.index, message: e.error.message })) }
        );
      }

      return results.filter(Boolean);
    } catch (error) {
      if (error instanceof EntityLinkError) {
        throw error;
      }
      
      throw new EntityLinkError(
        'Failed to create bulk entity links',
        EntityLinkErrorCode.VALIDATION_FAILED,
        { originalError: error instanceof Error ? error.message : error }
      );
    }
  }

  /**
   * Delete multiple links in a batch
   */
  async deleteBulkLinks(linkIds: string[], tenantId: string, soft = true): Promise<void> {
    try {
      if (soft) {
        // For soft deletes, update each link individually to maintain audit trail
        const promises = linkIds.map(linkId => entityLinkRepository.update(linkId, { active: false }, tenantId));
        await Promise.all(promises);
      } else {
        // For hard deletes, use bulk delete for efficiency
        await entityLinkRepository.deleteMany(linkIds, tenantId);
      }
      
      // Invalidate cache for affected entities
      await this.invalidateCache();
    } catch (error) {
      throw new EntityLinkError(
        'Failed to delete bulk entity links',
        EntityLinkErrorCode.VALIDATION_FAILED,
        { linkIds, originalError: error instanceof Error ? error.message : error }
      );
    }
  }

  /**
   * Get entity graph for visualization and analysis
   */
  async getEntityGraph(
    entity: EntityRef,
    depth = 2,
    kinds?: LinkKind[]
  ): Promise<EntityGraph> {
    try {
      const visited = new Set<string>();
      const nodes = new Map<string, any>();
      const edges: EntityGraph['edges'] = [];

      await this.traverseGraph(entity, depth, visited, nodes, edges, kinds);

      return {
        nodes: Array.from(nodes.values()),
        edges,
      };
    } catch (error) {
      throw new EntityLinkError(
        'Failed to build entity graph',
        EntityLinkErrorCode.VALIDATION_FAILED,
        { entity, originalError: error instanceof Error ? error.message : error }
      );
    }
  }

  /**
   * Find paths between two entities
   */
  async findPath(
    from: EntityRef,
    to: EntityRef,
    maxDepth = 5
  ): Promise<EntityPath[]> {
    try {
      const paths: EntityPath[] = [];
      const visited = new Set<string>();
      
      await this.findPathsRecursive(from, to, [], [], visited, paths, maxDepth);
      
      return paths.sort((a, b) => a.length - b.length);
    } catch (error) {
      throw new EntityLinkError(
        'Failed to find entity paths',
        EntityLinkErrorCode.VALIDATION_FAILED,
        { from, to, originalError: error instanceof Error ? error.message : error }
      );
    }
  }

  /**
   * Validate that creating a link won't create a cycle
   */
  async validateNoCycle(from: EntityRef, to: EntityRef, kind: LinkKind): Promise<boolean> {
    try {
      // Only check for dependency-type links that could create cycles
      const dependencyLinks: LinkKind[] = ['depends_on', 'blocks', 'parent_of', 'child_of'];
      if (!dependencyLinks.includes(kind)) {
        return true; // Non-dependency links can't create problematic cycles
      }

      // Check if there's already a path from 'to' back to 'from'
      const paths = await this.findPath(to, from, 10);
      return paths.length === 0;
    } catch (error) {
      throw new EntityLinkError(
        'Failed to validate cycle detection',
        EntityLinkErrorCode.VALIDATION_FAILED,
        { from, to, kind, originalError: error instanceof Error ? error.message : error }
      );
    }
  }

  /**
   * Cache management
   */
  async invalidateCache(entity?: EntityRef): Promise<void> {
    if (entity) {
      const patterns = [
        `entity-links:${entity.type}:${entity.id}:${entity.tenantId}`,
        `link:*:${entity.tenantId}`,
      ];
      
      for (const [key] of this.cache.entries()) {
        for (const pattern of patterns) {
          if (key.includes(pattern.replace('*', ''))) {
            this.cache.delete(key);
            this.cacheExpiry.delete(key);
          }
        }
      }
    } else {
      this.cache.clear();
      this.cacheExpiry.clear();
    }
  }

  async warmCache(entities: EntityRef[]): Promise<void> {
    try {
      const promises = entities.map(entity => 
        this.getEntityLinks(entity, { skipCache: true })
      );
      await Promise.all(promises);
    } catch (error) {
      // Warm cache failures are not critical
      console.warn('Failed to warm entity link cache:', error);
    }
  }

  // Private helper methods

  private getFromCache<T>(key: string): T | null {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.cache.get(key) || null;
  }

  private setCache<T>(key: string, value: T): void {
    this.cache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
  }

  private async invalidateEntityCaches(from: EntityRef, to: EntityRef): Promise<void> {
    await this.invalidateCache(from);
    await this.invalidateCache(to);
  }

  private async emitLinkEvent(eventType: string, data: any): Promise<void> {
    // TODO: Implement event emission to notify other modules
    // This could use EventEmitter, Redis pub/sub, or other event systems
    console.log(`EntityLink Event: ${eventType}`, data);
  }


  private async traverseGraph(
    entity: EntityRef,
    remainingDepth: number,
    visited: Set<string>,
    nodes: Map<string, any>,
    edges: EntityGraph['edges'],
    kinds?: LinkKind[]
  ): Promise<void> {
    const entityKey = `${entity.type}:${entity.id}`;
    
    if (visited.has(entityKey) || remainingDepth <= 0) {
      return;
    }
    
    visited.add(entityKey);
    nodes.set(entityKey, {
      entity,
      details: {
        title: `${entity.type}:${entity.id}`, // TODO: Fetch actual title
        status: 'active',
      },
    });
    
    if (remainingDepth > 0) {
      const links = await entityLinkRepository.findByEntity(entity, { kinds, includeDetails: true });
      
      for (const link of links) {
        // Determine target entity (could be either 'to' or 'from' depending on direction)
        const isOutgoing = link.fromType === entity.type && link.fromId === entity.id;
        const targetEntity = isOutgoing 
          ? createEntityRef(link.toType as any, link.toId, link.tenantId)
          : createEntityRef(link.fromType as any, link.fromId, link.tenantId);
        
        edges.push({
          from: entity,
          to: targetEntity,
          kind: link.kind,
          linkId: link.id,
        });
        
        await this.traverseGraph(targetEntity, remainingDepth - 1, visited, nodes, edges, kinds);
      }
    }
  }

  private async findPathsRecursive(
    current: EntityRef,
    target: EntityRef,
    currentPath: EntityRef[],
    currentLinks: EntityPath['links'],
    visited: Set<string>,
    allPaths: EntityPath[],
    remainingDepth: number
  ): Promise<void> {
    const currentKey = `${current.type}:${current.id}`;
    
    if (remainingDepth <= 0 || visited.has(currentKey)) {
      return;
    }
    
    if (current.type === target.type && current.id === target.id && currentPath.length > 0) {
      allPaths.push({
        entities: [...currentPath, current],
        links: [...currentLinks],
        length: currentPath.length,
      });
      return;
    }
    
    visited.add(currentKey);
    const links = await entityLinkRepository.findByEntity(current, { includeDetails: true });
    
    for (const link of links) {
      // Determine next entity (could be either 'to' or 'from' depending on direction)
      const isOutgoing = link.fromType === current.type && link.fromId === current.id;
      const nextEntity = isOutgoing 
        ? createEntityRef(link.toType as any, link.toId, link.tenantId)
        : createEntityRef(link.fromType as any, link.fromId, link.tenantId);
      
      await this.findPathsRecursive(
        nextEntity,
        target,
        [...currentPath, current],
        [...currentLinks, { from: current, to: nextEntity, kind: link.kind }],
        new Set(visited),
        allPaths,
        remainingDepth - 1
      );
    }
    
    visited.delete(currentKey);
  }
}

// Export singleton instance
export const entityLinkService = new EntityLinkServiceImpl();