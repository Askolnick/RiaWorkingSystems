# Architecture Rules & Standards

## Additional Code Organization Rules

### State Management
**Location:** `packages/state/src/` (when needed)
**Import:** `import { useAppStore } from '@ria/state'`
**Rules:**
- Start with React Context/useState
- Only add Zustand/Redux when truly needed
- Keep state as close to usage as possible
- Server state separate from client state

### Validation Schemas
**Location:** `packages/validation/src/`
**Import:** `import { invoiceSchema } from '@ria/validation'`
**Rules:**
- Use Zod for runtime validation
- Co-locate with forms when simple
- Extract when used in multiple places

### Middleware & Interceptors
**Location:** Within relevant app or package
```
apps/api/src/middleware/
apps/web/middleware.ts (Next.js specific)
packages/client/src/interceptors/
```

### Database Operations
**Seeders:** `packages/db/seed/`
**Migrations:** `packages/db/prisma/migrations/`
**Query Builders:** `packages/db/src/queries/`
**Transactions:** `packages/db/src/transactions/`

### Internationalization (i18n)
**Location:** `packages/i18n/src/`
```
packages/i18n/src/
├── locales/
│   ├── en/
│   ├── es/
│   └── fr/
├── config.ts
└── index.ts
```

### Email Templates
**Location:** `packages/email-templates/src/`
```
packages/email-templates/src/
├── templates/
│   ├── invoice-reminder.tsx
│   ├── welcome.tsx
│   └── password-reset.tsx
├── components/
└── utils/
```

### File Upload Handlers
**Location:** `packages/file-handlers/src/`
```
packages/file-handlers/src/
├── validators/
├── processors/
├── storage/
└── types.ts
```

### Cron Jobs & Scheduled Tasks
**Location:** `apps/workers/src/jobs/`
```
apps/workers/src/jobs/
├── daily/
├── hourly/
├── weekly/
└── index.ts
```

### Webhooks
**Incoming:** `apps/api/src/webhooks/`
**Outgoing:** `packages/webhooks/src/`

### GraphQL (if used)
**Schema:** `packages/graphql/schema/`
**Resolvers:** `packages/graphql/resolvers/`

### WebSocket Events
**Location:** `apps/collab/src/events/`
```
apps/collab/src/events/
├── handlers/
├── emitters/
└── types.ts
```

### Design Tokens & Theme
**Location:** `packages/web-ui/tokens/`
```
packages/web-ui/tokens/
├── colors.ts
├── spacing.ts
├── typography.ts
├── shadows.ts
├── animations.ts
└── index.ts
```

### Analytics & Tracking
**Location:** `packages/analytics/src/`
```
packages/analytics/src/
├── events/
├── trackers/
├── providers/
└── index.ts
```

### Feature Flags
**Location:** `packages/feature-flags/src/`
```
packages/feature-flags/src/
├── flags.ts
├── provider.tsx
├── hooks.ts
└── utils.ts
```

### Security Utilities
**Location:** `packages/security/src/`
```
packages/security/src/
├── auth/
├── encryption/
├── sanitization/
├── validation/
└── rate-limiting/
```

### Performance Monitoring
**Location:** `packages/monitoring/src/`
```
packages/monitoring/src/
├── metrics/
├── profiling/
├── reporting/
└── alerts/
```

### PDF Generation
**Location:** `packages/pdf/src/`
```
packages/pdf/src/
├── templates/
├── generators/
├── utils/
└── types.ts
```

### Export/Import Handlers
**Location:** `packages/data-exchange/src/`
```
packages/data-exchange/src/
├── exporters/
├── importers/
├── transformers/
├── validators/
└── formats/
```

### Third-Party Integrations
**Location:** `packages/integrations/[service-name]/`
```
packages/integrations/
├── stripe/
├── sendgrid/
├── twilio/
├── aws/
└── google/
```

### CLI Tools
**Location:** `packages/cli/src/`
```
packages/cli/src/
├── commands/
├── utils/
└── index.ts
```

### Docker & Infrastructure
**Location:** Root level
```
.
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
└── infrastructure/
    ├── kubernetes/
    └── terraform/
```

### CI/CD Configuration
**Location:** `.github/` or `.gitlab/`
```
.github/
├── workflows/
├── actions/
└── CODEOWNERS
```

## Special Cases & Exceptions

### When Co-location is Acceptable

1. **Single-use utilities** that are tightly coupled to a component
2. **Component-specific styles** (CSS modules)
3. **Test fixtures** specific to a test file
4. **Private helpers** not meant for reuse
5. **Configuration** specific to an app

### When to Break the Rules

**Never.** If you think you need to break a rule:
1. Re-read the rule
2. Check if there's a pattern for your use case
3. Discuss with the team
4. Update the documentation if a new pattern is needed

## Code Ownership

### Package Owners
Each package should have a designated owner:

```
packages/web-ui         → Frontend Team
packages/finance-server → Finance Team
packages/db            → Backend Team
packages/utils         → Shared (all teams)
```

## Performance Considerations

### Bundle Size Rules
- Components in `web-ui` should be tree-shakeable
- Utilities should be individually importable
- Heavy dependencies should be lazy-loaded
- Monitor bundle size with each PR

### Code Splitting Boundaries
```
// Page-level splitting (automatic in Next.js)
pages/invoices → separate bundle

// Component-level splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Module-level splitting
const financeModule = () => import('@ria/finance-server');
```

## Testing Organization

### Test File Locations
```
// Unit tests - co-located
Button.tsx
Button.test.tsx

// Integration tests
packages/[name]/tests/integration/

// E2E tests
tests/e2e/

// Performance tests
tests/performance/
```

### Mock Data
**Location:** `packages/test-utils/src/mocks/`
```
packages/test-utils/src/mocks/
├── users.ts
├── invoices.ts
├── api.ts
└── database.ts
```

## Documentation Standards

### Where Documentation Lives
```
// Package-level documentation
packages/[name]/README.md

// API documentation
packages/[name]/docs/api.md

// Component documentation
packages/web-ui/src/[Component]/README.md

// Architecture decisions
docs/architecture/decisions/

// Module guides
docs/modules/[module-name].md
```

### Documentation Requirements
Every package MUST have:
1. README.md with purpose and usage
2. API documentation for public exports
3. Examples for complex features
4. Migration guides for breaking changes

## Monitoring & Observability

### Logging Standards
```typescript
// Use structured logging
logger.info('Invoice created', {
  invoiceId: invoice.id,
  userId: user.id,
  amount: invoice.amount,
  timestamp: new Date().toISOString(),
});

// Log levels
logger.debug()  // Development only
logger.info()   // Normal operations
logger.warn()   // Potential issues
logger.error()  // Errors that need attention
```

### Metrics Collection
```typescript
// Location: packages/monitoring/src/metrics.ts
metrics.increment('api.request.count', { endpoint: '/invoices' });
metrics.timing('database.query.duration', duration);
metrics.gauge('queue.depth', queueSize);
```

## Database Conventions

### Table Naming
- Singular, PascalCase: `User`, `Invoice`, `Payment`
- Join tables: `UserGroup`, `InvoiceItem`

### Column Naming
- camelCase: `createdAt`, `isActive`, `totalAmount`
- Foreign keys: `userId`, `invoiceId` (entityId pattern)

### Index Naming
- Pattern: `idx_table_column1_column2`
- Example: `idx_invoice_tenantId_createdAt`

## API Conventions

### Endpoint Naming
```
GET    /api/invoices        # List
GET    /api/invoices/:id    # Get one
POST   /api/invoices        # Create
PUT    /api/invoices/:id    # Update (full)
PATCH  /api/invoices/:id    # Update (partial)
DELETE /api/invoices/:id    # Delete
```

### Response Format
```typescript
// Success
{
  success: true,
  data: { ... },
  metadata: { ... }
}

// Error
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input',
    details: { ... }
  }
}
```

## Git Conventions

### Branch Naming
```
feature/INV-123-add-payment-processing
bugfix/INV-124-fix-calculation-error
hotfix/critical-security-patch
chore/update-dependencies
```

### Commit Messages
```
feat: Add invoice payment processing
fix: Correct tax calculation error
docs: Update API documentation
style: Format code with prettier
refactor: Extract payment logic to service
test: Add unit tests for invoice service
chore: Update dependencies
```

## Remember

Every decision about where code lives should be:
1. **Predictable** - Anyone should guess correctly
2. **Discoverable** - Easy to find when needed
3. **Maintainable** - Clear ownership and boundaries
4. **Scalable** - Pattern works at 10x scale

When in doubt, refer to:
- CODE_ORGANIZATION.md for the main rules
- This document for special cases
- The finance module for patterns
- The team for new patterns