# Code Organization Manifest for Ria Living Systems

## Overview
This document defines where EVERY piece of code should live in the monorepo. No exceptions. This prevents duplication, ensures consistency, and maintains architectural integrity.

## The Golden Rule
**If you write it twice, you're doing it wrong.** Extract, centralize, and reuse.

## Code Artifact Location Map

### 🎨 UI Components
**Location:** `packages/web-ui/src/`
**Import:** `import { Button } from '@ria/web-ui'`
**Rule:** ALL visual components must live here. No exceptions.

### 🪝 React Hooks
**Location:** `packages/web-hooks/src/`
**Import:** `import { useDebounce } from '@ria/web-hooks'`
**Rule:** ALL custom hooks must be centralized here.

### 🛠️ Utility Functions
**Location:** `packages/utils/src/`
**Import:** `import { formatMoney } from '@ria/utils'`
**Rule:** Pure functions that don't depend on React or business logic.

### 💼 Business Logic
**Location:** `packages/[module]-server/src/`
**Import:** `import { calculateInvoiceTotal } from '@ria/finance-server'`
**Rule:** Module-specific business logic lives in dedicated packages.

### 🔌 API Clients & Services
**Location:** `packages/client/src/`
**Import:** `import { apiClient } from '@ria/client'`
**Rule:** All API communication and service layers.

### 📊 Database Models & Queries
**Location:** `packages/db/`
**Import:** `import { prisma } from '@ria/db'`
**Rule:** All database schemas, migrations, and query helpers.

### 🎯 TypeScript Types & Interfaces
**Location:** Within relevant package `/types.ts` or `/types/`
**Import:** `import type { Invoice } from '@ria/finance-server/types'`
**Rule:** Co-locate types with their implementation.

### 📝 Constants & Configurations
**Location:** `packages/[relevant]/src/constants.ts`
**Import:** `import { INVOICE_STATUSES } from '@ria/finance-server/constants'`
**Rule:** Package-specific constants stay with package.

### 🧪 Test Utilities & Mocks
**Location:** `packages/test-utils/src/`
**Import:** `import { mockUser } from '@ria/test-utils'`
**Rule:** Shared test helpers and mock data.

### 📜 Scripts & CLI Tools
**Location:** `scripts/` (root level)
**Usage:** `pnpm run script:name`
**Rule:** Build scripts, migrations, and CLI tools.

## Detailed Guidelines by Category

## 1. HOOKS Library (`packages/web-hooks`)

### Structure
```
packages/web-hooks/src/
├── state/                    # State management hooks
│   ├── useLocalStorage.ts   # Persist to localStorage
│   ├── useSessionStorage.ts # Persist to sessionStorage
│   ├── usePrevious.ts       # Track previous value
│   └── useToggle.ts         # Boolean toggle helper
├── effects/                  # Side effect hooks
│   ├── useDebounce.ts       # Debounce values
│   ├── useThrottle.ts       # Throttle functions
│   ├── useInterval.ts       # Safe interval hook
│   └── useTimeout.ts        # Safe timeout hook
├── dom/                      # DOM interaction hooks
│   ├── useClickOutside.ts   # Detect outside clicks
│   ├── useIntersectionObserver.ts
│   ├── useResizeObserver.ts
│   └── useMediaQuery.ts     # Responsive design
├── async/                    # Async operation hooks
│   ├── useFetch.ts          # Data fetching
│   ├── useAsync.ts          # Async state management
│   ├── useMutation.ts       # Mutation handling
│   └── useInfiniteScroll.ts # Infinite pagination
├── form/                     # Form-specific hooks
│   ├── useForm.ts           # Form state management
│   ├── useFieldValidation.ts # Field validation
│   └── useFormSubmit.ts     # Submit handling
└── business/                 # Business logic hooks
    ├── useAuth.ts           # Authentication state
    ├── useTenant.ts         # Current tenant context
    ├── usePermissions.ts    # Permission checking
    └── useEntityLink.ts     # Entity relationship

```

### Hook Naming Conventions
- **MUST** start with `use` prefix
- **SHOULD** be descriptive: `useInvoiceCalculation` not `useCalc`
- **MUST** return consistent shape: `{ data, loading, error }`

### Example Hook
```typescript
// packages/web-hooks/src/async/useFetch.ts
export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    // Implementation
  }, [url]);
  
  return { data, loading, error };
}
```

## 2. UTILITIES Library (`packages/utils`)

### Structure
```
packages/utils/src/
├── format/                   # Formatting utilities
│   ├── money.ts             # Currency formatting
│   ├── date.ts              # Date formatting
│   ├── number.ts            # Number formatting
│   └── string.ts            # String manipulation
├── validation/              # Validation functions
│   ├── email.ts            # Email validation
│   ├── phone.ts            # Phone validation
│   ├── tax.ts              # Tax ID validation
│   └── schema.ts           # Schema validation
├── transform/               # Data transformation
│   ├── normalize.ts        # Data normalization
│   ├── serialize.ts        # Serialization
│   └── parse.ts            # Parsing utilities
├── crypto/                  # Cryptographic utilities
│   ├── hash.ts             # Hashing functions
│   ├── encrypt.ts          # Encryption
│   └── token.ts            # Token generation
├── collections/             # Array/Object utilities
│   ├── array.ts            # Array helpers
│   ├── object.ts           # Object helpers
│   └── set.ts              # Set operations
└── performance/             # Performance utilities
    ├── debounce.ts         # Debouncing
    ├── throttle.ts         # Throttling
    └── memoize.ts          # Memoization
```

### Utility Function Rules
- **MUST** be pure functions (no side effects)
- **MUST** have single responsibility
- **MUST** be fully typed with generics where applicable
- **SHOULD** have JSDoc comments

### Example Utility
```typescript
// packages/utils/src/format/money.ts
/**
 * Formats a number as currency
 * @param amount - The amount to format
 * @param currency - ISO 4217 currency code
 * @returns Formatted currency string
 */
export function formatMoney(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
```

## 3. BUSINESS LOGIC (`packages/[module]-server`)

### Structure Pattern
```
packages/finance-server/src/
├── index.ts                 # Public API exports
├── types.ts                 # TypeScript types
├── constants.ts             # Module constants
├── services/                # Service layer
│   ├── InvoiceService.ts   # Invoice business logic
│   ├── PaymentService.ts   # Payment processing
│   └── TaxService.ts       # Tax calculations
├── validators/              # Business validation
│   ├── invoice.ts          # Invoice validation rules
│   └── payment.ts          # Payment validation
├── calculators/             # Complex calculations
│   ├── tax.ts              # Tax calculation
│   └── discount.ts         # Discount logic
└── ai/                      # AI integrations
    ├── adapter.ts          # AI service adapter
    └── prompts.ts          # AI prompt templates
```

### Business Logic Rules
- **MUST** be framework-agnostic (no React, no Next.js)
- **MUST** handle all business rules and validation
- **SHOULD** use dependency injection for testability
- **MUST** export clear service interfaces

## 4. API CLIENTS (`packages/client`)

### Structure
```
packages/client/src/
├── api.ts                   # Main API client
├── types.ts                 # API types
├── endpoints/               # Endpoint definitions
│   ├── auth.ts             # Auth endpoints
│   ├── invoices.ts         # Invoice endpoints
│   └── users.ts            # User endpoints
├── interceptors/            # Request/Response interceptors
│   ├── auth.ts             # Auth token injection
│   └── error.ts            # Error handling
└── utils/                   # Client utilities
    ├── retry.ts            # Retry logic
    └── cache.ts            # Response caching
```

## 5. NAMING CONVENTIONS

### Files and Folders
```typescript
// Components (PascalCase)
Button.tsx
InvoiceCard.tsx

// Hooks (camelCase)
useAuth.ts
useInvoiceCalculation.ts

// Utilities (camelCase)
formatMoney.ts
validateEmail.ts

// Services/Classes (PascalCase)
InvoiceService.ts
AuthenticationProvider.ts

// Constants (SCREAMING_SNAKE_CASE in file, camelCase filename)
constants.ts → export const MAX_RETRY_ATTEMPTS = 3;

// Types/Interfaces (PascalCase)
types.ts → export interface InvoiceData {}
```

### Variables and Functions
```typescript
// Variables (camelCase)
const userName = 'John';
const isLoggedIn = true;

// Constants (SCREAMING_SNAKE_CASE)
const MAX_FILE_SIZE = 5242880; // 5MB
const API_BASE_URL = 'https://api.ria.com';

// Functions (camelCase)
function calculateTotal() {}
const formatDate = () => {};

// Classes (PascalCase)
class InvoiceManager {}
class PaymentProcessor {}

// Interfaces/Types (PascalCase, I/T prefix optional but discouraged)
interface UserProfile {}
type PaymentStatus = 'pending' | 'completed';

// Enums (PascalCase for name, SCREAMING_SNAKE_CASE for values)
enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
}

// React Components (PascalCase)
function InvoiceList() {}
const PaymentForm = () => {};

// React Hooks (camelCase with 'use' prefix)
function useInvoiceData() {}
const usePaymentStatus = () => {};
```

### Import Organization
```typescript
// 1. External libraries
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// 2. Internal packages
import { Button, Card } from '@ria/web-ui';
import { formatMoney } from '@ria/utils';
import { useAuth } from '@ria/web-hooks';

// 3. Relative imports
import { InvoiceService } from './services/InvoiceService';
import type { InvoiceData } from './types';

// 4. Style imports
import styles from './Invoice.module.css';
```

## 6. SHARED TYPES (`packages/types`)

### When to Create Shared Types
- Types used across multiple packages
- API contract types
- Domain model types
- Common utility types

### Structure
```
packages/types/src/
├── api/                     # API contract types
│   ├── request.ts          # Request types
│   └── response.ts         # Response types
├── domain/                  # Domain models
│   ├── user.ts             # User model
│   ├── invoice.ts          # Invoice model
│   └── tenant.ts           # Tenant model
├── utility/                 # Utility types
│   ├── helpers.ts          # Type helpers
│   └── guards.ts           # Type guards
└── index.ts                # Public exports
```

## 7. CONFIGURATION FILES

### Location Rules
```
.
├── .env.example            # Root: Example environment variables
├── .eslintrc.js           # Root: ESLint config
├── .prettierrc            # Root: Prettier config
├── turbo.json             # Root: Turborepo config
├── tsconfig.json          # Root: Base TypeScript config
├── apps/
│   └── web/
│       ├── next.config.js # App-specific configs
│       └── tsconfig.json  # Extends root tsconfig
└── packages/
    └── web-ui/
        └── tsconfig.json  # Package-specific config
```

## 8. ENVIRONMENT VARIABLES

### Naming Convention
```bash
# Public variables (accessible in browser)
NEXT_PUBLIC_API_URL=https://api.ria.com
NEXT_PUBLIC_STRIPE_KEY=pk_live_xxx

# Server-only variables
DATABASE_URL=postgresql://...
JWT_SECRET=xxx
STRIPE_SECRET_KEY=sk_live_xxx

# Module-specific (use prefixes)
FINANCE_TAX_API_KEY=xxx
WIKI_SEARCH_API_KEY=xxx
AI_OPENAI_API_KEY=xxx
```

## 9. ERROR HANDLING

### Custom Error Classes
```typescript
// packages/utils/src/errors/
export class BusinessError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'BusinessError';
  }
}

export class ValidationError extends BusinessError {
  constructor(message: string, public fields: Record<string, string>) {
    super(message, 'VALIDATION_ERROR');
  }
}
```

## 10. LOGGING & DEBUGGING

### Logger Location
```typescript
// packages/utils/src/logger.ts
export const logger = {
  info: (message: string, meta?: any) => {},
  warn: (message: string, meta?: any) => {},
  error: (message: string, error?: Error) => {},
  debug: (message: string, data?: any) => {},
};
```

### Debug Namespaces
```typescript
// Use debug namespaces for different modules
const debug = createDebugger('ria:finance:invoice');
debug('Processing invoice %s', invoiceId);
```

## Decision Tree: Where Does My Code Go?

```
Is it a visual component?
  → YES: packages/web-ui/src/
  → NO: Continue...

Is it a React hook?
  → YES: packages/web-hooks/src/
  → NO: Continue...

Is it business logic?
  → YES: packages/[module]-server/src/
  → NO: Continue...

Is it a utility function?
  → YES: packages/utils/src/
  → NO: Continue...

Is it API communication?
  → YES: packages/client/src/
  → NO: Continue...

Is it database-related?
  → YES: packages/db/
  → NO: Continue...

Is it a type/interface used across packages?
  → YES: packages/types/src/
  → NO: Co-locate with implementation

Still unsure?
  → Ask: "Will this be used in multiple places?"
    → YES: Extract to appropriate package
    → NO: Co-locate with usage
```

## Anti-Patterns to Avoid

### ❌ DON'T: Inline Complex Logic
```typescript
// Bad
function InvoiceList() {
  const total = invoices.reduce((sum, inv) => {
    const tax = inv.amount * 0.1;
    const discount = inv.customer.isVip ? inv.amount * 0.05 : 0;
    return sum + inv.amount + tax - discount;
  }, 0);
}

// Good
import { calculateInvoiceTotal } from '@ria/finance-server';

function InvoiceList() {
  const total = calculateInvoiceTotal(invoices);
}
```

### ❌ DON'T: Duplicate Utilities
```typescript
// Bad - defined in multiple files
const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

// Good - centralized
import { formatMoney } from '@ria/utils';
```

### ❌ DON'T: Mix Concerns
```typescript
// Bad - UI component with business logic
function InvoiceForm() {
  const calculateTax = (amount) => {
    // Complex tax calculation logic here
  };
}

// Good - separated concerns
import { calculateTax } from '@ria/finance-server';

function InvoiceForm() {
  const tax = calculateTax(amount);
}
```

### ❌ DON'T: Hardcode Configuration
```typescript
// Bad
const apiUrl = 'https://api.ria.com/v1';

// Good
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

## Code Review Checklist

Before approving any PR, verify:

- [ ] No duplicate components (check packages/web-ui)
- [ ] No duplicate hooks (check packages/web-hooks)
- [ ] No duplicate utilities (check packages/utils)
- [ ] Business logic in appropriate package
- [ ] Types are properly exported
- [ ] Naming conventions followed
- [ ] No inline complex logic
- [ ] Proper error handling
- [ ] Environment variables used for config
- [ ] Imports organized correctly

## Migration Guide

When you find code in the wrong place:

1. **Identify** all instances of the code
2. **Extract** to the appropriate package
3. **Update** all imports to use the package
4. **Test** that everything still works
5. **Remove** the old code
6. **Document** the change in CHANGELOG

## Quick Reference

| What | Where | Import From |
|------|-------|-------------|
| UI Components | `packages/web-ui/src/` | `@ria/web-ui` |
| React Hooks | `packages/web-hooks/src/` | `@ria/web-hooks` |
| Utilities | `packages/utils/src/` | `@ria/utils` |
| Business Logic | `packages/[module]-server/src/` | `@ria/[module]-server` |
| API Clients | `packages/client/src/` | `@ria/client` |
| Database | `packages/db/` | `@ria/db` |
| Types | `packages/types/src/` or co-located | `@ria/types` or local |
| Constants | Co-located with usage | Local import |
| Test Utils | `packages/test-utils/src/` | `@ria/test-utils` |

## Remember

> "There should be one-- and preferably only one --obvious way to do it." - The Zen of Python

This principle applies to code organization. Every piece of code has ONE correct location. No exceptions.