/**
 * useEntityLinks Hook - Easy integration of EntityLink system
 * 
 * Provides:
 * - Automatic data fetching and caching
 * - Loading and error states
 * - Optimistic updates
 * - Real-time synchronization
 * - Type-safe operations
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  EntityRef, 
  EntityLinkWithDetails, 
  LinkKind,
  CreateLinkOptions,
  GetLinksOptions,
  EntityLinkError,
  createEntityRef,
} from '../types/entity-link.types';
import { entityLinkService } from '../services/entity-link.service';

export interface UseEntityLinksOptions extends GetLinksOptions {
  autoFetch?: boolean;
  refetchInterval?: number;
  onError?: (error: Error) => void;
  onLinkCreated?: (link: EntityLinkWithDetails) => void;
  onLinkDeleted?: (linkId: string) => void;
  onLinkUpdated?: (link: EntityLinkWithDetails) => void;
}

export interface UseEntityLinksResult {
  // Data
  links: EntityLinkWithDetails[];
  outgoingLinks: EntityLinkWithDetails[];
  incomingLinks: EntityLinkWithDetails[];
  linksByKind: Record<LinkKind, EntityLinkWithDetails[]>;
  
  // State
  loading: boolean;
  error: Error | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  
  // Actions
  createLink: (to: EntityRef, kind: LinkKind, options?: CreateLinkOptions) => Promise<void>;
  updateLink: (linkId: string, updates: any) => Promise<void>;
  deleteLink: (linkId: string, soft?: boolean) => Promise<void>;
  refetch: () => Promise<void>;
  
  // Utilities
  hasLinkTo: (entity: EntityRef, kind?: LinkKind) => boolean;
  getLinksTo: (entity: EntityRef, kind?: LinkKind) => EntityLinkWithDetails[];
  getLinkedEntities: (kind?: LinkKind) => EntityRef[];
}

export function useEntityLinks(
  entity: EntityRef | null,
  options: UseEntityLinksOptions = {}
): UseEntityLinksResult {
  const {
    autoFetch = true,
    refetchInterval,
    onError,
    onLinkCreated,
    onLinkDeleted,
    onLinkUpdated,
    ...getLinksOptions
  } = options;

  // State
  const [links, setLinks] = useState<EntityLinkWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch links
  const fetchLinks = useCallback(async () => {
    if (!entity) {
      setLinks([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await entityLinkService.getEntityLinks(entity, getLinksOptions);
      setLinks(result);
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [entity, JSON.stringify(getLinksOptions), onError]);

  // Auto-fetch on mount and entity change
  useEffect(() => {
    if (autoFetch && entity) {
      fetchLinks();
    }
  }, [entity?.id, entity?.type, autoFetch]);

  // Refetch interval
  useEffect(() => {
    if (refetchInterval && entity) {
      const interval = setInterval(fetchLinks, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [refetchInterval, entity, fetchLinks]);

  // Create link
  const createLink = useCallback(async (
    to: EntityRef,
    kind: LinkKind,
    createOptions: CreateLinkOptions = {}
  ) => {
    if (!entity) {
      throw new Error('Entity is required to create links');
    }

    setCreating(true);
    setError(null);

    try {
      const newLink = await entityLinkService.createLink(entity, to, kind, createOptions);
      
      // Convert to EntityLinkWithDetails for consistency
      const linkWithDetails: EntityLinkWithDetails = {
        ...newLink,
        fromEntity: {
          id: entity.id,
          title: `${entity.type}:${entity.id}`,
          type: entity.type,
          status: 'active',
        },
        toEntity: {
          id: to.id,
          title: `${to.type}:${to.id}`,
          type: to.type,
          status: 'active',
        },
      };

      // Optimistic update
      setLinks(prev => [...prev, linkWithDetails]);
      
      onLinkCreated?.(linkWithDetails);
      
      // Refetch to get full details
      await fetchLinks();
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setCreating(false);
    }
  }, [entity, fetchLinks, onError, onLinkCreated]);

  // Update link
  const updateLink = useCallback(async (linkId: string, updates: any) => {
    if (!entity) {
      throw new Error('Entity is required to update links');
    }

    setUpdating(true);
    setError(null);

    try {
      const updatedLink = await entityLinkService.updateLink(linkId, updates, entity.tenantId);
      
      // Optimistic update
      setLinks(prev => prev.map(link => 
        link.id === linkId ? { ...link, ...updates } : link
      ));
      
      onLinkUpdated?.(updatedLink as EntityLinkWithDetails);
      
      // Refetch to get full details
      await fetchLinks();
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setUpdating(false);
    }
  }, [entity, fetchLinks, onError, onLinkUpdated]);

  // Delete link
  const deleteLink = useCallback(async (linkId: string, soft = true) => {
    if (!entity) {
      throw new Error('Entity is required to delete links');
    }

    setDeleting(true);
    setError(null);

    try {
      await entityLinkService.deleteLink(linkId, entity.tenantId, soft);
      
      // Optimistic update
      setLinks(prev => prev.filter(link => link.id !== linkId));
      
      onLinkDeleted?.(linkId);
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      // Revert optimistic update on error
      await fetchLinks();
      throw error;
    } finally {
      setDeleting(false);
    }
  }, [entity, fetchLinks, onError, onLinkDeleted]);

  // Computed values
  const outgoingLinks = useMemo(() => {
    if (!entity) return [];
    return links.filter(link => 
      link.fromType === entity.type && link.fromId === entity.id
    );
  }, [links, entity]);

  const incomingLinks = useMemo(() => {
    if (!entity) return [];
    return links.filter(link => 
      link.toType === entity.type && link.toId === entity.id
    );
  }, [links, entity]);

  const linksByKind = useMemo(() => {
    const grouped: Partial<Record<LinkKind, EntityLinkWithDetails[]>> = {};
    
    links.forEach(link => {
      if (!grouped[link.kind]) {
        grouped[link.kind] = [];
      }
      grouped[link.kind]!.push(link);
    });
    
    return grouped as Record<LinkKind, EntityLinkWithDetails[]>;
  }, [links]);

  // Utility functions
  const hasLinkTo = useCallback((targetEntity: EntityRef, kind?: LinkKind) => {
    return links.some(link => {
      const isLinkedTo = (
        (link.fromType === entity?.type && link.fromId === entity?.id &&
         link.toType === targetEntity.type && link.toId === targetEntity.id) ||
        (link.toType === entity?.type && link.toId === entity?.id &&
         link.fromType === targetEntity.type && link.fromId === targetEntity.id)
      );
      
      return isLinkedTo && (!kind || link.kind === kind);
    });
  }, [links, entity]);

  const getLinksTo = useCallback((targetEntity: EntityRef, kind?: LinkKind) => {
    return links.filter(link => {
      const isLinkedTo = (
        (link.fromType === entity?.type && link.fromId === entity?.id &&
         link.toType === targetEntity.type && link.toId === targetEntity.id) ||
        (link.toType === entity?.type && link.toId === entity?.id &&
         link.fromType === targetEntity.type && link.fromId === targetEntity.id)
      );
      
      return isLinkedTo && (!kind || link.kind === kind);
    });
  }, [links, entity]);

  const getLinkedEntities = useCallback((kind?: LinkKind) => {
    if (!entity) return [];
    
    const entities: EntityRef[] = [];
    const seen = new Set<string>();
    
    links.forEach(link => {
      if (kind && link.kind !== kind) return;
      
      let linkedEntity: EntityRef | null = null;
      
      if (link.fromType === entity.type && link.fromId === entity.id) {
        linkedEntity = createEntityRef(link.toType as any, link.toId, link.tenantId);
      } else if (link.toType === entity.type && link.toId === entity.id) {
        linkedEntity = createEntityRef(link.fromType as any, link.fromId, link.tenantId);
      }
      
      if (linkedEntity) {
        const key = `${linkedEntity.type}:${linkedEntity.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          entities.push(linkedEntity);
        }
      }
    });
    
    return entities;
  }, [links, entity]);

  return {
    // Data
    links,
    outgoingLinks,
    incomingLinks,
    linksByKind,
    
    // State
    loading,
    error,
    creating,
    updating,
    deleting,
    
    // Actions
    createLink,
    updateLink,
    deleteLink,
    refetch: fetchLinks,
    
    // Utilities
    hasLinkTo,
    getLinksTo,
    getLinkedEntities,
  };
}

/**
 * Hook for managing multiple entity links at once
 */
export function useBulkEntityLinks(
  entities: EntityRef[],
  options: UseEntityLinksOptions = {}
) {
  const [allLinks, setAllLinks] = useState<Map<string, EntityLinkWithDetails[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAllLinks = useCallback(async () => {
    if (entities.length === 0) {
      setAllLinks(new Map());
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await Promise.all(
        entities.map(entity => 
          entityLinkService.getEntityLinks(entity, options)
            .then(links => ({ entity, links }))
        )
      );

      const linksMap = new Map<string, EntityLinkWithDetails[]>();
      results.forEach(({ entity, links }) => {
        const key = `${entity.type}:${entity.id}`;
        linksMap.set(key, links);
      });

      setAllLinks(linksMap);
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [entities, options]);

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchAllLinks();
    }
  }, [entities.length]);

  return {
    allLinks,
    loading,
    error,
    refetch: fetchAllLinks,
    getLinksForEntity: (entity: EntityRef) => {
      const key = `${entity.type}:${entity.id}`;
      return allLinks.get(key) || [];
    },
  };
}