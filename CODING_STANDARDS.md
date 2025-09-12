# Coding Standards

## CSS and Styling Rules

### 1. NO INLINE STYLES
- **NEVER** use inline styles (`style={{...}}`)
- **ALWAYS** use CSS classes first
- If dynamic styling is needed, use CSS variables or utility classes

### 2. Style Priority Order
1. **CSS Modules** - For component-specific styles
2. **Utility Classes** (Tailwind) - For common patterns
3. **Styled Components** - Only when dynamic theming is required
4. **Component Props** - For variant-based styling

### Bad Example ❌
```jsx
<div style={{ marginTop: '20px', backgroundColor: 'blue' }}>
  <span style={{ color: 'white' }}>Text</span>
</div>
```

### Good Example ✅
```jsx
<div className="mt-5 bg-blue-500">
  <span className="text-white">Text</span>
</div>
```

### Dynamic Styles Example ✅
```jsx
// Use CSS variables for dynamic values
<div 
  className="dynamic-component"
  style={{ '--spacing': `${spacing}px` } as React.CSSProperties}
>
```

```css
.dynamic-component {
  margin-top: var(--spacing);
}
```

## Performance Guidelines

### 1. Code Splitting
- Use dynamic imports for heavy components
- Lazy load route components
- Split vendor bundles appropriately

### 2. Import Optimization
- Avoid barrel exports that re-export everything
- Import only what you need
- Use tree-shaking friendly imports

### Bad Example ❌
```js
import * as everything from '@ria/web-ui';
```

### Good Example ✅
```js
import { Button, Input } from '@ria/web-ui/components';
```

### 3. Bundle Size
- Monitor bundle size with `next-bundle-analyzer`
- Keep initial load under 200KB
- Lazy load heavy dependencies

## Component Guidelines

### 1. Component Structure
```tsx
// 1. Imports (grouped and sorted)
import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './Component.module.css';

// 2. Types
interface ComponentProps {
  // ...
}

// 3. Component
export function Component({ prop }: ComponentProps) {
  // 4. Hooks first
  const router = useRouter();
  
  // 5. State
  const [state, setState] = useState();
  
  // 6. Effects
  useEffect(() => {}, []);
  
  // 7. Handlers
  const handleClick = () => {};
  
  // 8. Render
  return <div className={styles.container}>...</div>;
}
```

### 2. File Organization
```
components/
  ComponentName/
    ComponentName.tsx       # Component logic
    ComponentName.module.css # Styles
    ComponentName.test.tsx  # Tests
    index.ts               # Export
```

## TypeScript Rules

### 1. Always use strict types
- No `any` types
- Explicit return types for functions
- Proper null/undefined handling

### 2. Interface over Type
- Use `interface` for object shapes
- Use `type` for unions/intersections

## Testing Standards

### 1. Test Coverage
- Minimum 80% coverage for utilities
- Integration tests for critical paths
- E2E tests for user flows

### 2. Test Structure
```tsx
describe('ComponentName', () => {
  it('should render correctly', () => {});
  it('should handle user interaction', () => {});
  it('should handle edge cases', () => {});
});
```

## Git Commit Standards

### 1. Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)
```

Types: feat, fix, docs, style, refactor, test, chore

### 2. Examples
```
feat(auth): add password reset functionality
fix(ui): resolve button alignment issue
refactor(api): optimize database queries
```

## Review Checklist

Before submitting code:
- [ ] No inline styles
- [ ] No console.logs
- [ ] TypeScript errors resolved
- [ ] Tests passing
- [ ] Bundle size checked
- [ ] Performance metrics acceptable