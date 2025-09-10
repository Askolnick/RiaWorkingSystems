# Claude Development Guidelines for Ria Living Systems

## Project Context
Ria Living Systems is an ambitious all-in-one business management platform with 10+ integrated modules. This document provides guidelines to maintain clarity and prevent architectural debt as the platform grows.

## Core Principles

### 1. Module Boundaries Are Sacred
- **NEVER** add direct imports between feature modules
- **ALWAYS** use the shared packages (`@ria/client`, `@ria/utils`) for cross-module communication
- **PREFER** event-driven patterns over direct coupling between modules

### 2. Follow the Clean Architecture Pattern
- **Repository Pattern** for ALL data access - no direct API calls in components
- **Zustand Stores** for ALL state management - no useState for shared data
- **Component Library** for ALL UI elements - no inline styles or custom components
- **Error Boundaries** for ALL pages - graceful error handling everywhere
- **TypeScript-first** - no `any` types, proper interfaces for all data structures

### 3. Maintain the Modular Monolith Architecture
```
apps/
  web/          → Next.js frontend (pages only, no business logic)
  api/          → NestJS backend (controllers only, delegates to packages)
  workers/      → Background jobs (uses packages for logic)
  collab/       → Real-time features (WebSocket handling)

packages/
  [module]-server/  → Business logic for each module
  web-ui/          → Shared UI components (ALL UI COMPONENTS MUST LIVE HERE)
  db/              → Database schema and migrations
  client/          → Shared client utilities
  utils/           → Common helpers
```

### 4. Component Library is Mandatory
- **NEVER** create UI components directly in apps/web
- **ALWAYS** define components in packages/web-ui first
- **IMPORT** all components from `@ria/web-ui`
- **CHECK** COMPONENT_LIBRARY.md before creating new components
- **REUSE** existing components - check if something similar exists

### 5. Code Organization is Non-Negotiable
- **FOLLOW** CODE_ORGANIZATION.md for ALL code placement decisions
- **HOOKS** must live in `@ria/web-hooks` - no custom hooks elsewhere
- **UTILITIES** must live in `@ria/utils` - no duplicate helper functions
- **BUSINESS LOGIC** must live in `@ria/[module]-server` packages
- **API CLIENTS** must live in `@ria/client` - centralized API communication
- **TYPES** that are shared must live in `@ria/types` or be co-located
- **NEVER** duplicate code - if you write it twice, you're doing it wrong

### 6. Routing Must Be Centralized
- **ALWAYS** use `ROUTES` constants from `@ria/utils/routes` - never hardcode paths
- **NEVER** use string literals like `"/auth/sign-in"` for routing
- **UPDATE** `@ria/utils/routes.ts` when adding new routes
- **EXAMPLE**: Use `ROUTES.SIGN_IN` instead of `"/auth/sign-in"`
- **REASON**: Base URLs can change, deployments can be under subpaths

### 7. No Emojis in Production Code
- **NEVER** use emojis in component text, labels, or user-facing content
- **AVOID** emojis in comments, function names, or variable names  
- **USE** proper icons from design system instead of emoji shortcuts
- **EXCEPTION**: Demo/placeholder data can use emojis temporarily
- **REASON**: Accessibility, professionalism, cross-platform compatibility

## Clean Architecture Implementation

### Architecture Layers
```
┌──────────────────────────────────┐
│     UI Components (@ria/web-ui)   │ ← Reusable components only
├──────────────────────────────────┤
│      Stores (@ria/client)         │ ← State management (Zustand)
├──────────────────────────────────┤
│   Repositories (@ria/client)      │ ← Data access layer
├──────────────────────────────────┤
│       API Client (@ria/client)    │ ← HTTP/WebSocket communication
├──────────────────────────────────┤
│    Database Schema (@ria/db)      │ ← Prisma ORM
└──────────────────────────────────┘
```

### Repository Pattern (MANDATORY)
```typescript
// ❌ WRONG - Direct API calls in components
const MyComponent = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch('/api/items').then(res => res.json()).then(setData);
  }, []);
};

// ✅ CORRECT - Use repository pattern
// In packages/client/src/repositories/items.repository.ts
export class ItemsRepository extends BaseRepository<Item> {
  protected endpoint = '/items';
  
  async getActiveItems(): Promise<Item[]> {
    return this.request('GET', '/active');
  }
}

// In component - use store that uses repository
const MyComponent = () => {
  const { items, fetchItems } = useItemsStore();
  useEffect(() => {
    fetchItems();
  }, []);
};
```

### State Management with Zustand (MANDATORY)
```typescript
// ❌ WRONG - Local state for shared data
const [documents, setDocuments] = useState([]);
const [loading, setLoading] = useState(false);

// ✅ CORRECT - Use Zustand store
export const useDocumentsStore = create<DocumentsStore>()(
  devtools(
    immer((set, get) => ({
      documents: [],
      loading: false,
      error: null,
      
      fetchDocuments: async () => {
        set(state => { state.loading = true; });
        try {
          const response = await documentsRepository.findAll();
          set(state => { 
            state.documents = response.data;
            state.loading = false;
          });
        } catch (error) {
          set(state => { 
            state.error = error.message;
            state.loading = false;
          });
        }
      }
    }))
  )
);
```

### Error & Loading States (MANDATORY)
```typescript
// ❌ WRONG - No error handling or loading states
const MyComponent = () => {
  const { data } = useDataStore();
  return <div>{data.map(...)}</div>;
};

// ✅ CORRECT - Proper error and loading handling
import { ErrorBoundary, LoadingCard, Alert } from '@ria/web-ui';

const MyComponent = () => {
  const { data, loading, error } = useDataStore();
  
  if (loading) return <LoadingCard />;
  if (error) return <Alert type="error">{error}</Alert>;
  if (!data.length) return <EmptyState />;
  
  return (
    <ErrorBoundary>
      {data.map(...)}
    </ErrorBoundary>
  );
};
```

## Development Workflow

### Before Adding New Features
1. **Check if it belongs to an existing module** - don't create new modules unnecessarily
2. **Review the module's documentation** in `docs/[module].md`
3. **Follow the clean architecture pattern** - repository → store → component
4. **Ensure multi-tenancy** - all queries must be scoped by `tenantId`

### Creating a New Module (Step-by-Step)

#### Step 1: Create the Repository
```typescript
// packages/client/src/repositories/[module].repository.ts
import { BaseRepository, MockRepository } from './base.repository';

export class ModuleRepository extends BaseRepository<ModuleEntity> {
  protected endpoint = '/module/entities';
  
  // Add module-specific methods
  async getActive(): Promise<ModuleEntity[]> {
    return this.request('GET', '/active');
  }
}

// Mock for development
export class MockModuleRepository extends MockRepository<ModuleEntity> {
  protected storageKey = 'ria_module_entities';
  protected endpoint = '/module/entities';
}

export const moduleRepository = new MockModuleRepository();
```

#### Step 2: Create the Store
```typescript
// packages/client/src/stores/[module].store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { moduleRepository } from '../repositories';

export const useModuleStore = create<ModuleState & ModuleActions>()(
  devtools(
    immer((set, get) => ({
      // State
      items: [],
      currentItem: null,
      loading: false,
      error: null,
      
      // Actions
      fetchItems: async () => {
        set(state => { state.loading = true; });
        try {
          const response = await moduleRepository.findAll();
          set(state => { 
            state.items = response.data;
            state.loading = false;
          });
        } catch (error) {
          set(state => { 
            state.error = error.message;
            state.loading = false;
          });
        }
      },
    }))
  )
);
```

#### Step 3: Create the UI
```typescript
// apps/web/app/[module]/page.tsx
'use client';

import { useEffect } from 'react';
import { useModuleStore } from '@ria/client';
import { Card, Button, LoadingCard, Alert, ErrorBoundary } from '@ria/web-ui';

export default function ModulePage() {
  const { items, loading, error, fetchItems } = useModuleStore();
  
  useEffect(() => {
    fetchItems();
  }, []);
  
  if (loading) return <LoadingCard />;
  if (error) return <Alert type="error">{error}</Alert>;
  
  return (
    <ErrorBoundary>
      <Card>
        {/* Your UI here - using ONLY @ria/web-ui components */}
      </Card>
    </ErrorBoundary>
  );
}
```

### File Organization Rules

#### Frontend (apps/web)
```
app/
  (portal)/           → Authenticated app routes
    [module]/         → One folder per module
      page.tsx        → List/dashboard view
      [id]/page.tsx   → Detail view
      new/page.tsx    → Create view
  (public)/           → Public marketing pages
    page.tsx          → Landing page
    blog/             → Public content
```

#### Backend Packages
```
packages/[module]-server/
  src/
    index.ts          → Public API exports
    [entity].ts       → Business logic per entity
    types.ts          → TypeScript interfaces
    ai/               → AI-specific logic (if needed)
```

### Database Schema Guidelines

#### Naming Conventions
- **Tables**: PascalCase singular (e.g., `Invoice`, `WikiPage`)
- **Fields**: camelCase (e.g., `createdAt`, `tenantId`)
- **Relations**: descriptive names (e.g., `createdBy`, `parentTask`)

#### Required Fields for All Entities
```prisma
model Entity {
  id        String   @id @default(cuid())
  tenantId  String   // Multi-tenancy
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String?  // User reference
  
  // Relations
  tenant    Tenant   @relation(...)
  creator   User?    @relation(...)
  
  @@index([tenantId])
}
```

## Module-Specific Guidelines

### Finance Module
- **MAINTAIN** double-entry bookkeeping integrity
- **NEVER** modify journal entries directly - use posting rules
- **ALWAYS** validate Chart of Accounts before posting

### Wiki/Knowledge Module
- **USE** Yjs for collaborative editing
- **IMPLEMENT** proper CRDT conflict resolution
- **MAINTAIN** backlink integrity when content changes

### Task Management
- **ENFORCE** project association for all tasks
- **VALIDATE** status transitions (can't go from done → todo)
- **MAINTAIN** audit trail for all changes

### Messaging/Communication
- **DESIGN** for multiple channels from the start
- **IMPLEMENT** proper queue management for outbound messages
- **ENSURE** delivery tracking and retry logic

## AI Integration Patterns

### When Adding AI Features
1. **Start with rules/heuristics** - AI should enhance, not replace logic
2. **Implement fallback strategies** - AI can fail
3. **Log AI decisions** for debugging and improvement
4. **Use the finance AI adapter pattern** as reference:
```typescript
// First try rules engine
const ruleResult = await applyRules(data);
if (ruleResult.confident) return ruleResult;

// Fall back to AI with context
const aiResult = await aiAdapter.process(data, context);
return aiResult;
```

## Performance Considerations

### Query Optimization
- **ALWAYS** include proper indexes for frequently queried fields
- **USE** pagination for list views (limit 50 by default)
- **IMPLEMENT** cursor-based pagination for large datasets
- **AVOID** N+1 queries - use Prisma's `include` wisely

### Caching Strategy
- **Cache aggressively** at the edge (use Next.js caching)
- **Implement Redis caching** for expensive computations
- **Use optimistic updates** for better UX
- **Invalidate smartly** - know your cache dependencies

## Testing Requirements

### Minimum Test Coverage
- **Unit tests** for all business logic in packages/
- **Integration tests** for API endpoints
- **E2E tests** for critical user flows (auth, payments)
- **Multi-tenancy tests** to ensure data isolation

### Test Organization
```
packages/[module]-server/
  src/
    [feature].ts
    [feature].test.ts    → Unit tests next to code
  tests/
    integration/         → Integration tests
```

## Security Checklist

### For Every Feature
- [ ] Validate `tenantId` in all queries
- [ ] Check user permissions before operations
- [ ] Sanitize user input (XSS prevention)
- [ ] Validate file uploads (type, size, content)
- [ ] Implement rate limiting for API endpoints
- [ ] Audit log sensitive operations

## Code Review Checklist

### Before Committing
- [ ] No console.logs in production code
- [ ] TypeScript types are properly defined
- [ ] Database migrations are reversible
- [ ] Multi-tenancy is maintained
- [ ] Tests are written and passing
- [ ] Documentation is updated

### Architecture Decisions
- [ ] Module boundaries are respected
- [ ] No circular dependencies introduced
- [ ] Performance impact considered
- [ ] Scalability path is clear

## Common Pitfalls to Avoid

1. **Creating new top-level modules** instead of extending existing ones
2. **Direct API calls in components** instead of using repositories
3. **Using useState for shared data** instead of Zustand stores
4. **Direct database access** from the frontend
5. **Forgetting tenantId** in queries (data leak risk)
6. **No error boundaries** around pages and components
7. **No loading states** for async operations
8. **Using localStorage directly** instead of through stores
9. **Synchronous operations** that should be queued
10. **Tight coupling** between modules
11. **Ignoring the design system** and creating custom styles
12. **Adding features without considering mobile UX**
13. **Implementing complex features without progressive enhancement**
14. **Creating duplicate UI components** instead of using @ria/web-ui
15. **Hardcoding styles** instead of using design tokens
16. **Building complex components** instead of composing simple ones
17. **Hardcoding route paths** instead of using ROUTES constants from @ria/utils
18. **Using emojis in production code** instead of proper icons
19. **Breaking routing when base URL changes** by not using centralized routing
20. **Not following the repository → store → component pattern**

## Progressive Enhancement Strategy

### Start Simple, Enhance Gradually
1. **Version 1**: Basic CRUD operations
2. **Version 2**: Add validation and business rules
3. **Version 3**: Add AI enhancements
4. **Version 4**: Add real-time features
5. **Version 5**: Add advanced analytics

## Module Communication Patterns

### Preferred: Event-Driven
```typescript
// Publisher (in finance module)
await publishEvent('invoice.created', { 
  invoiceId, 
  clientId, 
  amount 
});

// Subscriber (in task module)
subscribeToEvent('invoice.created', async (data) => {
  await createFollowUpTask(data);
});
```

### Acceptable: Service Layer
```typescript
// In packages/client/src/api.ts
export class CrossModuleService {
  async linkEntities(from: EntityRef, to: EntityRef) {
    // Centralized linking logic
  }
}
```

### Avoid: Direct Imports
```typescript
// DON'T DO THIS
import { createInvoice } from '@ria/finance-server';
```

## Deployment Considerations

### Environment Variables
- **Group by module** in `.env` files
- **Use prefixes**: `FINANCE_`, `WIKI_`, `AI_`
- **Document all variables** in `.env.example`

### Database Migrations
- **Always reversible** - include down migrations
- **Test on copy of production** before deploying
- **Batch small changes** to reduce migration time
- **Consider zero-downtime migrations** for schema changes

## Future-Proofing Guidelines

### Design for Scale
- **Assume 1000+ tenants** from day one
- **Plan for millions of records** per table
- **Design for horizontal scaling** (stateless services)
- **Consider data archival** strategies early

### Maintain Flexibility
- **Use feature flags** for gradual rollouts
- **Design APIs versioning** from the start
- **Keep business logic in packages** (not in UI)
- **Document architectural decisions** in ADRs

## Component Development Workflow

### Before Creating Any UI Element
1. **Check Component Library** - Look in packages/web-ui/COMPONENT_LIBRARY.md
2. **Search Existing Components** - Something similar might already exist
3. **Compose First** - Try combining existing components before creating new ones
4. **Design System Only** - Use only colors/spacing from design tokens

### Component Creation Process
```bash
# 1. Check if component exists
grep -r "ComponentName" packages/web-ui/src/

# 2. If not, create in web-ui package
mkdir packages/web-ui/src/ComponentName
touch packages/web-ui/src/ComponentName/ComponentName.tsx
touch packages/web-ui/src/ComponentName/ComponentName.stories.tsx

# 3. Export from index
echo "export * from './ComponentName/ComponentName';" >> packages/web-ui/src/index.ts

# 4. Use in app
# import { ComponentName } from '@ria/web-ui';
```

## Quick Commands

```bash
# Development
pnpm dev                 # Start all services
pnpm build              # Build all packages
pnpm test               # Run all tests

# Code Quality
pnpm lint               # ESLint check
pnpm typecheck          # TypeScript check
pnpm format             # Prettier format

# Database
pnpm db:migrate         # Run migrations
pnpm db:seed            # Seed dev data
pnpm db:reset           # Reset database

# Component Library
pnpm --filter @ria/web-ui storybook  # Start Storybook
pnpm --filter @ria/web-ui test       # Test components
pnpm --filter @ria/web-ui build      # Build component library

# Module-specific
pnpm --filter @ria/finance-server test
pnpm --filter @ria/web dev
```

## Getting Help & Key Documents

1. **Check module docs** in `docs/[module].md`
2. **Review CODE_ORGANIZATION.md** for where code should live
3. **Check COMPONENT_LIBRARY.md** for UI components
4. **Review finance module** for implementation patterns
5. **Look for similar features** in existing code
6. **Check Prisma schema** for data relationships
7. **Review this guide** for architectural decisions

## Critical Documents to Always Check

- **CODE_ORGANIZATION.md** - Where every type of code belongs
- **COMPONENT_LIBRARY.md** - All UI components and patterns
- **CLAUDE.md** (this file) - Overall architecture and rules

## Remember

> "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away." - Antoine de Saint-Exupéry

Keep the codebase clean, modular, and focused. Every line of code should have a clear purpose and maintain the architectural integrity of the platform.