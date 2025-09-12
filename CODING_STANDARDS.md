# Coding Standards for Ria Management Software

> Comprehensive coding standards for a massive, scalable business management platform

## Overview

This document establishes coding standards based on existing patterns in the Ria codebase and industry best practices for large-scale TypeScript applications. These standards are designed to prevent build errors, maintain consistency, and ensure scalability.

## 1. TypeScript Configuration Standards

### Strict TypeScript Enforcement

All packages MUST use strict TypeScript configuration:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Type Safety Rules

- **NO `any` types** - Use proper typing or `unknown`
- **NO non-null assertions** (`!`) without justification
- **NO type casting** without validation
- **PREFER type guards** over type assertions

```typescript
// ✅ CORRECT
function processUser(user: unknown): User | null {
  if (isUser(user)) {
    return user;
  }
  return null;
}

// ❌ INCORRECT
function processUser(user: any): User {
  return user as User;
}
```

## 2. Import/Export Organization

### Import Order (ESLint Enforced)

```typescript
// 1. Node modules
import React from 'react';
import { create } from 'zustand';

// 2. Internal packages (absolute imports)
import { BaseRepository } from '@ria/client';
import { Button } from '@ria/web-ui';

// 3. Relative imports (grouped by distance)
import type { LocalType } from '../types';
import { utilityFunction } from './utils';

// 4. Type-only imports (separate section)
import type { ComponentProps } from 'react';
```

### Export Standards

- **PREFER named exports** over default exports
- **USE barrel exports** in index.ts files
- **SEPARATE type exports** with `export type`

```typescript
// ✅ CORRECT - Named exports
export interface UserProfile {
  id: string;
  name: string;
}

export class UserRepository extends BaseRepository<UserProfile> {
  protected endpoint = '/users';
}

// ✅ CORRECT - Barrel exports
export * from './components/Button';
export type { UserProfile } from './types';
```

## 3. Naming Conventions

### Files and Directories
- **PascalCase** for components: `Button.tsx`, `UserProfile.tsx`
- **camelCase** for utilities: `dateUtils.ts`, `apiClient.ts`  
- **kebab-case** for packages: `@ria/web-ui`, `@ria/finance-server`
- **Descriptive** test files: `Button.test.tsx`, `userRepository.test.ts`

### Code Elements
- **Interfaces**: PascalCase with descriptive names
- **Types**: PascalCase, often with suffix
- **Constants**: SCREAMING_SNAKE_CASE for app-level constants
- **Functions**: camelCase, descriptive verbs
- **Components**: PascalCase

```typescript
// ✅ CORRECT Examples
interface UserPreferences { }
type EventHandler<T> = (event: T) => void;
const API_ENDPOINTS = { } as const;
function validateEmail(email: string): boolean { }
export function UserDashboard() { }
```

## 4. Component Development Standards

### Component Structure Template

```typescript
import React, { forwardRef } from 'react';
import type { ComponentPropsWithRef } from 'react';
import { cn } from '@ria/utils';

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode; // Explicit, not optional
}

/**
 * Button component with multiple variants and states
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ 
    variant = 'primary', 
    size = 'md', 
    className, 
    children, 
    loading = false,
    disabled,
    ...props 
  }, ref) {
    const isDisabled = disabled || loading;
    
    return (
      <button
        ref={ref}
        className={cn(
          'btn-base',
          `btn-${variant}`,
          `btn-${size}`,
          { 'btn-loading': loading },
          className
        )}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && <LoadingSpinner />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

## 5. State Management Standards (Zustand)

### Store Structure Template

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Separate interfaces for state and actions
export interface UserState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

export interface UserActions {
  fetchUsers: () => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  clearError: () => void;
  reset: () => void;
}

type UserStore = UserState & UserActions;

const initialState: UserState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
};

export const useUserStore = create<UserStore>()(
  devtools(
    immer((set, get) => ({
      ...initialState,

      fetchUsers: async () => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          const response = await userRepository.findAll();
          set(state => {
            state.users = response.data;
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Unknown error';
            state.loading = false;
          });
        }
      },

      setCurrentUser: (user) => {
        set(state => {
          state.currentUser = user;
        });
      },

      clearError: () => {
        set(state => {
          state.error = null;
        });
      },

      reset: () => {
        set(() => initialState);
      },
    })),
    { name: 'UserStore' }
  )
);
```

## 6. Repository Pattern Standards

```typescript
import { BaseRepository, QueryParams, PaginatedResponse } from './base.repository';

export interface UserQueryParams extends QueryParams {
  status?: 'active' | 'inactive';
  role?: string;
}

export class UserRepository extends BaseRepository<User, CreateUserDTO, UpdateUserDTO> {
  protected endpoint = '/users';

  async findByDepartment(departmentId: string): Promise<PaginatedResponse<User>> {
    return this.request('GET', `/by-department?departmentId=${departmentId}`);
  }

  async updateStatus(id: string, status: 'active' | 'inactive'): Promise<User> {
    return this.request('PATCH', `/${id}/status`, { status });
  }
}

export const userRepository = new UserRepository();
```

## 7. Error Handling Standards

### Custom Error Types

```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}
```

### Error Boundaries

```typescript
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorFallback />;
    }
    return this.props.children;
  }
}
```

## 8. Testing Standards

### Test Structure

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { UserForm } from '../UserForm';

describe('UserForm', () => {
  const mockCreateUser = jest.fn();
  const defaultProps = {
    onSubmit: mockCreateUser,
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(<UserForm {...defaultProps} />);
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<UserForm {...defaultProps} />);
    
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(mockCreateUser).not.toHaveBeenCalled();
  });
});
```

## 9. Anti-Patterns to Avoid

### TypeScript Anti-patterns
```typescript
// ❌ DON'T: Use 'any'
const userData: any = fetchUser();

// ❌ DON'T: Non-null assertion without reason
const user = getUser()!;

// ❌ DON'T: Ignore async/await
fetchUsers().then(users => setUsers(users));

// ❌ DON'T: Mutate state directly
state.users.push(newUser);
```

### Component Anti-patterns
```typescript
// ❌ DON'T: Default exports
export default function Button() { }

// ❌ DON'T: Missing keys in lists
{users.map(user => <UserCard user={user} />)}

// ❌ DON'T: Inline object creation
<Component style={{margin: 10}} />
```

### Import Anti-patterns
```typescript
// ❌ DON'T: Deep imports
import { Button } from '@ria/web-ui/src/components/Button/Button';

// ❌ DON'T: Side-effect imports in libraries
import './styles.css'; // Avoid in shared packages
```

## 10. Build Configuration

### Package.json Standards

```json
{
  "name": "@ria/package-name",
  "private": true,
  "version": "0.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "jest",
    "lint": "eslint src --ext .ts,.tsx",
    "typecheck": "tsc --noEmit"
  }
}
```

### TypeScript Configuration

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "**/*.test.*", "**/*.stories.*"]
}
```

## Enforcement

These standards are enforced through:

1. **ESLint configuration** with custom rules
2. **TypeScript strict mode** in all packages
3. **Pre-commit hooks** for linting and formatting
4. **Code cleanup agent** that fixes violations automatically
5. **CI/CD pipeline** that blocks non-compliant code

## Tools and Scripts

- `pnpm lint` - Run ESLint across all packages
- `pnpm typecheck` - Run TypeScript type checking
- `npx tsx scripts/code-cleaner.ts` - Fix coding standard violations
- `pnpm build` - Verify all packages build correctly

## Migration Strategy

1. **Phase 1**: Establish ESLint configuration and fix import order
2. **Phase 2**: Enable TypeScript strict mode package by package
3. **Phase 3**: Migrate components to forwardRef pattern
4. **Phase 4**: Standardize store and repository patterns
5. **Phase 5**: Add comprehensive testing

## 11. Component vs CSS Class Decision Framework

### When to Create React Components ✅

**Interactive Elements:**
```typescript
// ✅ CORRECT - Has interactive logic
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ onClick, disabled, loading, children, ...props }, ref) => {
    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !loading) onClick?.(e);
    };
    
    return (
      <button 
        ref={ref}
        onClick={handleClick}
        disabled={disabled || loading}
        className={cn('btn-primary', { 'btn-loading': loading })}
        {...props}
      >
        {loading ? <Spinner /> : children}
      </button>
    );
  }
);
```

**Complex Logic & State:**
```typescript
// ✅ CORRECT - Has internal state and complex logic
export const SearchInput = ({ onSearch }: Props) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const debouncedQuery = useDebounce(query, 300);
  
  useEffect(() => {
    if (debouncedQuery) {
      fetchSuggestions(debouncedQuery).then(setSuggestions);
    }
  }, [debouncedQuery]);
  
  return (
    <div className="search-input-container">
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {suggestions.length > 0 && <SuggestionsList suggestions={suggestions} />}
    </div>
  );
};
```

**Reusable Interactive Patterns:**
```typescript
// ✅ CORRECT - Reusable pattern with behavior
export const Modal = ({ isOpen, onClose, children }: Props) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};
```

### When to Use CSS Classes Instead ❌

**Text-Only Components:**
```typescript
// ❌ WRONG - Unnecessary React component
export const Heading = ({ children }: { children: React.ReactNode }) => {
  return <h2 className="large-heading">{children}</h2>;
};

// ✅ CORRECT - Just use the CSS class
<h2 className="large-heading">My Title</h2>
```

**Simple Styling Wrappers:**
```typescript
// ❌ WRONG - Unnecessary wrapper component
export const Container = ({ children }: { children: React.ReactNode }) => {
  return <div className="max-w-4xl mx-auto px-4">{children}</div>;
};

// ✅ CORRECT - Use CSS class directly
<div className="container">{content}</div>

/* In CSS */
.container {
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 1rem;
}
```

**Static Content:**
```typescript
// ❌ WRONG - Component for static content
export const WelcomeMessage = () => {
  return <p className="welcome-text">Welcome to our application!</p>;
};

// ✅ CORRECT - Use constants and CSS
const WELCOME_MESSAGE = "Welcome to our application!";
<p className="welcome-text">{WELCOME_MESSAGE}</p>
```

**Simple Icon Wrappers:**
```typescript
// ❌ WRONG - Wrapper component for icons
export const HomeIcon = () => {
  return <HomeIcon className="w-5 h-5" />;
};

// ✅ CORRECT - Import and use directly
import { HomeIcon } from '@heroicons/react/24/outline';
<HomeIcon className="w-5 h-5" />
```

### Decision Tree

```
Need React Component?
├─ Has interactive logic (onClick, onChange, etc.)? → YES, create component
├─ Has internal state (useState, useEffect, etc.)? → YES, create component  
├─ Needs ref forwarding? → YES, create component
├─ Complex conditional rendering? → YES, create component
├─ Reusable business logic? → YES, create component
└─ Just styling or static content? → NO, use CSS class

Examples of Interactive Logic:
• Form validation
• Click handlers with business logic
• Keyboard navigation
• Focus management  
• Animation triggers
• Data fetching
• Conditional rendering based on props

Examples of CSS Class Usage:
• Typography styling (.large-heading, .body)
• Layout utilities (.container, .grid, .flex)
• Color utilities (.text-theme, .bg-background)
• Spacing utilities (.p-4, .mb-2)
• Static content display
```

### CSS Class Naming Conventions

```css
/* Semantic Typography */
.large-heading { /* 30px, bold, theme color */ }
.medium-heading { /* 24px, semi-bold, theme color */ }
.small-heading { /* 18px, medium, theme color */ }
.body { /* 16px, normal, theme color */ }
.small-body { /* 14px, normal, theme color */ }

/* Layout Utilities */
.container { /* max-width, centered, padding */ }
.grid-2 { /* 2-column grid */ }
.flex-between { /* justify-between */ }
.flex-center { /* center items */ }

/* Component-Specific Classes */
.btn-primary { /* Primary button styling */ }
.form-input { /* Input field styling */ }
.card { /* Card container styling */ }

/* State Classes */
.is-loading { /* Loading state */ }
.is-active { /* Active state */ }
.is-disabled { /* Disabled state */ }
```

### Anti-Patterns to Avoid

```typescript
// ❌ Component that only applies className
const RedText = ({ children }) => <span className="text-red-500">{children}</span>;

// ❌ Component for single HTML element
const Paragraph = ({ children }) => <p className="body">{children}</p>;

// ❌ Wrapper without logic
const Section = ({ children }) => <section className="py-8">{children}</section>;

// ❌ Static component
const LoadingText = () => <div>Loading...</div>;

// ❌ Simple icon wrapper  
const CheckIcon = () => <CheckIcon className="w-4 h-4 text-green-500" />;
```

### Component Complexity Threshold

**Create Component If:**
- 3+ lines of logic OR
- Has useState/useEffect OR
- Needs props validation OR
- Has event handlers OR
- Conditional rendering OR
- Will be reused with different behavior

**Use CSS Class If:**
- Pure styling OR
- Static content OR  
- Simple HTML wrapper OR
- Typography variant OR
- Layout utility

Following these standards ensures the Ria Management Software remains maintainable, scalable, and free from build errors as it grows to a massive application.