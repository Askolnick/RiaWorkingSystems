/**
 * EntityLink Types - Bulletproof type system for cross-module entity relationships
 * 
 * This file provides compile-time type safety for entity linking operations
 * and runtime validation to prevent invalid link creation.
 */

// Entity type registry - single source of truth
export const ENTITY_TYPES = {
  // Core entities
  task: 'task',
  project: 'project', 
  contact: 'contact',
  invoice: 'invoice',
  document: 'document',
  wiki_page: 'wiki_page',
  user: 'user',
  organization: 'organization',
  
  // Product entities
  product: 'product',
  campaign: 'campaign',
  roadmap_item: 'roadmap_item',
  
  // Library entities
  library_doc: 'library_doc',
  library_section: 'library_section',
  
  // Messaging entities
  message: 'message',
  thread: 'thread',
  
  // Finance entities
  expense: 'expense',
  payment: 'payment',
} as const;

export type EntityType = keyof typeof ENTITY_TYPES;

// Enhanced LinkKind with business logic
export const LINK_KINDS = {
  // Hierarchical relationships
  parent_of: 'parent_of',
  child_of: 'child_of',
  
  // Dependencies
  depends_on: 'depends_on',
  blocks: 'blocks',
  
  // References
  references: 'references',
  mentioned_in: 'mentioned_in',
  attached_to: 'attached_to',
  
  // Business relationships
  assigned_to: 'assigned_to',
  owned_by: 'owned_by',
  collaborates_with: 'collaborates_with',
  
  // Workflow
  triggers: 'triggers',
  completes: 'completes',
  
  // Generic
  relates: 'relates',
  duplicates: 'duplicates',
} as const;

export type LinkKind = keyof typeof LINK_KINDS;

// Strongly typed entity reference
export interface EntityRef {
  type: EntityType;
  id: string;
  tenantId: string;
}

// EntityLink with full metadata
export interface EntityLink {
  id: string;
  tenantId: string;
  
  // Source entity
  fromType: EntityType;
  fromId: string;
  
  // Target entity  
  toType: EntityType;
  toId: string;
  
  // Relationship metadata
  kind: LinkKind;
  note?: string;
  metadata?: Record<string, any>;
  
  // Lifecycle management
  active: boolean;
  
  // Audit trail
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Enhanced EntityLink with related entity details
export interface EntityLinkWithDetails extends EntityLink {
  fromEntity?: {
    id: string;
    title: string;
    type: EntityType;
    status?: string;
    url?: string;
  };
  toEntity?: {
    id: string;
    title: string;
    type: EntityType;
    status?: string;
    url?: string;
  };
}

// Link validation rules - defines which entities can link to which
export interface LinkRules {
  'task': {
    'parent_of': ['task'];
    'child_of': ['task'];
    'depends_on': ['task', 'project'];
    'blocks': ['task'];
    'assigned_to': ['user', 'contact'];
    'references': ['document', 'wiki_page', 'library_doc'];
    'attached_to': ['document'];
    'relates': EntityType[];
  };
  'project': {
    'parent_of': ['project', 'task'];
    'owned_by': ['user', 'organization'];
    'collaborates_with': ['user', 'contact'];
    'references': ['document', 'wiki_page'];
    'relates': EntityType[];
  };
  'contact': {
    'assigned_to': ['user'];
    'collaborates_with': ['user', 'contact'];
    'relates': EntityType[];
  };
  'invoice': {
    'assigned_to': ['contact', 'organization'];
    'references': ['project', 'task'];
    'relates': EntityType[];
  };
  'document': {
    'attached_to': ['task', 'project', 'contact'];
    'references': ['wiki_page', 'library_doc'];
    'relates': EntityType[];
  };
  'wiki_page': {
    'parent_of': ['wiki_page'];
    'child_of': ['wiki_page'];
    'references': ['document', 'task', 'project'];
    'relates': EntityType[];
  };
  'user': {
    'collaborates_with': ['user', 'contact'];
    'relates': EntityType[];
  };
  'organization': {
    'collaborates_with': ['organization', 'contact'];
    'relates': EntityType[];
  };
  'product': {
    'owned_by': ['user', 'organization'];
    'references': ['roadmap_item', 'campaign'];
    'relates': EntityType[];
  };
  'campaign': {
    'references': ['product', 'contact'];
    'relates': EntityType[];
  };
  'roadmap_item': {
    'parent_of': ['roadmap_item'];
    'child_of': ['roadmap_item'];
    'depends_on': ['roadmap_item'];
    'blocks': ['roadmap_item'];
    'references': ['task', 'product'];
    'relates': EntityType[];
  };
  'library_doc': {
    'parent_of': ['library_doc'];
    'child_of': ['library_doc', 'library_section'];
    'references': ['task', 'project'];
    'relates': EntityType[];
  };
  'library_section': {
    'parent_of': ['library_doc'];
    'relates': EntityType[];
  };
  'message': {
    'references': ['task', 'project', 'contact'];
    'relates': EntityType[];
  };
  'thread': {
    'references': ['task', 'project'];
    'relates': EntityType[];
  };
  'expense': {
    'assigned_to': ['project', 'task'];
    'relates': EntityType[];
  };
  'payment': {
    'references': ['invoice', 'contact'];
    'relates': EntityType[];
  };
}

// Compile-time validation of link creation
export type ValidateLink<
  From extends EntityType, 
  To extends EntityType, 
  Kind extends LinkKind
> = Kind extends keyof LinkRules[From] 
  ? To extends LinkRules[From][Kind][number] 
    ? true 
    : never
  : never;

// Link creation options
export interface CreateLinkOptions {
  note?: string;
  metadata?: Record<string, any>;
  userId?: string;
  allowDuplicates?: boolean;
  skipValidation?: boolean;
}

// Bulk link creation options
export interface BulkCreateOptions extends CreateLinkOptions {
  allowPartialFailure?: boolean;
  batchSize?: number;
}

// Link query options
export interface GetLinksOptions {
  kinds?: LinkKind[];
  includeInactive?: boolean;
  skipCache?: boolean;
  includeDetails?: boolean;
  direction?: 'outgoing' | 'incoming' | 'both';
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

// Error codes for EntityLink operations
export enum EntityLinkErrorCode {
  INVALID_ENTITY_TYPE = 'INVALID_ENTITY_TYPE',
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
  CIRCULAR_DEPENDENCY = 'CIRCULAR_DEPENDENCY',
  DUPLICATE_LINK = 'DUPLICATE_LINK',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INVALID_LINK_KIND = 'INVALID_LINK_KIND',
  TENANT_MISMATCH = 'TENANT_MISMATCH',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

// Custom error class for EntityLink operations
export class EntityLinkError extends Error {
  constructor(
    message: string,
    public readonly code: EntityLinkErrorCode,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'EntityLinkError';
  }
}

// Type guards
export function isValidEntityType(type: string): type is EntityType {
  return type in ENTITY_TYPES;
}

export function isValidLinkKind(kind: string): kind is LinkKind {
  return kind in LINK_KINDS;
}

export function isValidEntityRef(ref: any): ref is EntityRef {
  return (
    typeof ref === 'object' &&
    ref !== null &&
    typeof ref.type === 'string' &&
    typeof ref.id === 'string' &&
    typeof ref.tenantId === 'string' &&
    isValidEntityType(ref.type)
  );
}

// Helper function to create entity references
export function createEntityRef(
  type: EntityType,
  id: string,
  tenantId: string
): EntityRef {
  return { type, id, tenantId };
}

// Helper function to validate link rules
export function canLink(
  fromType: EntityType,
  toType: EntityType,
  kind: LinkKind
): boolean {
  const rules = LINK_RULES[fromType];
  if (!rules) return false;
  
  const allowedTypes = rules[kind as keyof LinkRules[EntityType]];
  if (!allowedTypes) return false;
  
  return allowedTypes.includes(toType);
}

// Link rules constant for runtime validation
const LINK_RULES: LinkRules = {
  task: {
    parent_of: ['task'],
    child_of: ['task'],
    depends_on: ['task', 'project'],
    blocks: ['task'],
    assigned_to: ['user', 'contact'],
    references: ['document', 'wiki_page', 'library_doc'],
    attached_to: ['document'],
    relates: Object.keys(ENTITY_TYPES) as EntityType[],
  },
  project: {
    parent_of: ['project', 'task'],
    owned_by: ['user', 'organization'],
    collaborates_with: ['user', 'contact'],
    references: ['document', 'wiki_page'],
    relates: Object.keys(ENTITY_TYPES) as EntityType[],
  },
  contact: {
    assigned_to: ['user'],
    collaborates_with: ['user', 'contact'],
    relates: Object.keys(ENTITY_TYPES) as EntityType[],
  },
  invoice: {
    assigned_to: ['contact', 'organization'],
    references: ['project', 'task'],
    relates: Object.keys(ENTITY_TYPES) as EntityType[],
  },
  document: {
    attached_to: ['task', 'project', 'contact'],
    references: ['wiki_page', 'library_doc'],
    relates: Object.keys(ENTITY_TYPES) as EntityType[],
  },
  wiki_page: {
    parent_of: ['wiki_page'],
    child_of: ['wiki_page'],
    references: ['document', 'task', 'project'],
    relates: Object.keys(ENTITY_TYPES) as EntityType[],
  },
  user: {
    collaborates_with: ['user', 'contact'],
    relates: Object.keys(ENTITY_TYPES) as EntityType[],
  },
  organization: {
    collaborates_with: ['organization', 'contact'],
    relates: Object.keys(ENTITY_TYPES) as EntityType[],
  },
  product: {
    owned_by: ['user', 'organization'],
    references: ['roadmap_item', 'campaign'],
    relates: Object.keys(ENTITY_TYPES) as EntityType[],
  },
  campaign: {
    references: ['product', 'contact'],
    relates: Object.keys(ENTITY_TYPES) as EntityType[],
  },
  roadmap_item: {
    parent_of: ['roadmap_item'],
    child_of: ['roadmap_item'],
    depends_on: ['roadmap_item'],
    blocks: ['roadmap_item'],
    references: ['task', 'product'],
    relates: Object.keys(ENTITY_TYPES) as EntityType[],
  },
  library_doc: {
    parent_of: ['library_doc'],
    child_of: ['library_doc', 'library_section'],
    references: ['task', 'project'],
    relates: Object.keys(ENTITY_TYPES) as EntityType[],
  },
  library_section: {
    parent_of: ['library_doc'],
    relates: Object.keys(ENTITY_TYPES) as EntityType[],
  },
  message: {
    references: ['task', 'project', 'contact'],
    relates: Object.keys(ENTITY_TYPES) as EntityType[],
  },
  thread: {
    references: ['task', 'project'],
    relates: Object.keys(ENTITY_TYPES) as EntityType[],
  },
  expense: {
    assigned_to: ['project', 'task'],
    relates: Object.keys(ENTITY_TYPES) as EntityType[],
  },
  payment: {
    references: ['invoice', 'contact'],
    relates: Object.keys(ENTITY_TYPES) as EntityType[],
  },
};

export { LINK_RULES };