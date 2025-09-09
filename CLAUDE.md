# Claude Development Guidelines for Ria Living Systems

## Project Context
Ria Living Systems is an ambitious all-in-one business management platform with 10+ integrated modules. This document provides guidelines to maintain clarity and prevent architectural debt as the platform grows.

## Core Principles

### 1. Module Boundaries Are Sacred
- **NEVER** add direct imports between feature modules
- **ALWAYS** use the shared packages (`@ria/client`, `@ria/utils`) for cross-module communication
- **PREFER** event-driven patterns over direct coupling between modules

### 2. Follow the Established Patterns
- **Finance module** is the reference implementation - study it before implementing new features
- **Design tokens** from `packages/web-ui/tokens/` must be used for all styling
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
  web-ui/          → Shared UI components
  db/              → Database schema and migrations
  client/          → Shared client utilities
  utils/           → Common helpers
```

## Development Workflow

### Before Adding New Features
1. **Check if it belongs to an existing module** - don't create new modules unnecessarily
2. **Review the module's documentation** in `docs/[module].md`
3. **Study existing patterns** in the finance module for complex features
4. **Ensure multi-tenancy** - all queries must be scoped by `tenantId`

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
2. **Direct database access** from the frontend
3. **Forgetting tenantId** in queries (data leak risk)
4. **Synchronous operations** that should be queued
5. **Tight coupling** between modules
6. **Ignoring the design system** and creating custom styles
7. **Adding features without considering mobile UX**
8. **Implementing complex features without progressive enhancement**

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

# Module-specific
pnpm --filter @ria/finance-server test
pnpm --filter @ria/web dev
```

## Getting Help

1. **Check module docs** in `docs/[module].md`
2. **Review finance module** for implementation patterns
3. **Look for similar features** in existing code
4. **Check Prisma schema** for data relationships
5. **Review this guide** for architectural decisions

## Remember

> "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away." - Antoine de Saint-Exupéry

Keep the codebase clean, modular, and focused. Every line of code should have a clear purpose and maintain the architectural integrity of the platform.