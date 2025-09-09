# Ria Component Library

## Overview
This is the centralized component library for Ria Living Systems. All UI components must be defined here and imported from `@ria/web-ui` to ensure consistency and prevent code duplication.

## Core Principles

### 1. Single Source of Truth
- **NEVER** create components directly in apps/web
- **ALWAYS** define components in packages/web-ui first
- **IMPORT** from `@ria/web-ui` in all applications

### 2. Design System Integration
- All components use design tokens from `tokens/ria.css`
- Tailwind classes use custom properties defined in tokens
- No hardcoded colors, sizes, or spacing values

### 3. Composition Over Configuration
- Build complex UIs by composing simple components
- Keep individual components focused and single-purpose
- Use compound components for related functionality

## Component Categories

### Core Components
Essential building blocks used throughout the application.

| Component | Purpose | Status |
|-----------|---------|--------|
| Button | Interactive actions | ✅ Implemented |
| Input | Text input fields | ✅ Implemented |
| Select | Dropdown selections | ✅ Implemented |
| FormField | Form field wrapper with label/error | ✅ Implemented |

### Layout Components
Structure and organize content on the page.

| Component | Purpose | Status |
|-----------|---------|--------|
| Card | Content container | ✅ Implemented |
| Container | Max-width wrapper | 🔄 Planned |
| Grid | CSS Grid wrapper | 🔄 Planned |
| Stack | Flexbox wrapper | ✅ Implemented |
| Divider | Visual separator | 🔄 Planned |

### Navigation Components
Help users navigate through the application.

| Component | Purpose | Status |
|-----------|---------|--------|
| Tabs | Tab-based navigation | 🔄 Planned |
| Breadcrumb | Hierarchical navigation | 🔄 Planned |
| Sidebar | Side navigation panel | 🔄 Planned |
| Navigation | Top navigation bar | 🔄 Planned |

### Data Display Components
Present data and information to users.

| Component | Purpose | Status |
|-----------|---------|--------|
| Table | Tabular data display | 🔄 Planned |
| Badge | Status/category indicators | ✅ Implemented |
| Avatar | User profile images | 🔄 Planned |
| List | Structured lists | 🔄 Planned |
| Stat | Statistical displays | 🔄 Planned |

### Feedback Components
Provide feedback and communicate state to users.

| Component | Purpose | Status |
|-----------|---------|--------|
| Alert | Inline notifications | 🔄 Planned |
| Toast | Temporary notifications | 🔄 Planned |
| Modal | Overlay dialogs | 🔄 Planned |
| Drawer | Slide-out panels | 🔄 Planned |
| Loading | Loading indicators | 🔄 Planned |
| Skeleton | Loading placeholders | 🔄 Planned |
| Progress | Progress indicators | 🔄 Planned |

### Form Components
Advanced form inputs beyond basic text fields.

| Component | Purpose | Status |
|-----------|---------|--------|
| Checkbox | Boolean selection | 🔄 Planned |
| Radio | Single choice selection | 🔄 Planned |
| Switch | Toggle control | 🔄 Planned |
| Textarea | Multi-line text input | 🔄 Planned |
| DatePicker | Date selection | 🔄 Planned |
| FileUpload | File upload control | 🔄 Planned |

### Typography Components
Text and content styling components.

| Component | Purpose | Status |
|-----------|---------|--------|
| Heading | Section headings (h1-h6) | 🔄 Planned |
| Text | Body text with variants | 🔄 Planned |
| Link | Navigation links | 🔄 Planned |

### Utility Components
Helper components for common UI patterns.

| Component | Purpose | Status |
|-----------|---------|--------|
| Tooltip | Hover information | 🔄 Planned |
| Popover | Click-triggered overlay | 🔄 Planned |
| Dropdown | Menu dropdowns | 🔄 Planned |
| ContextMenu | Right-click menus | 🔄 Planned |

### Business Components
Domain-specific components for Ria's business logic.

| Component | Purpose | Status |
|-----------|---------|--------|
| EntityLink | Links to other entities | 🔄 Planned |
| MoneyInput | Currency input field | 🔄 Planned |
| UserMention | @mention functionality | 🔄 Planned |
| StatusIndicator | Entity status display | 🔄 Planned |
| EmptyState | No data displays | 🔄 Planned |

## Component API Standards

### Props Interface
Every component must have a TypeScript interface defining its props:

```typescript
export interface ComponentProps {
  // Required props first
  children?: ReactNode;
  
  // Variants and appearance
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  
  // State props
  disabled?: boolean;
  loading?: boolean;
  
  // Event handlers
  onClick?: () => void;
  onChange?: (value: any) => void;
  
  // Styling escape hatch
  className?: string;
}
```

### Variant System
Components should support variants for different visual styles:

```typescript
const variants = {
  default: 'bg-white border-gray-200',
  primary: 'bg-theme text-white',
  secondary: 'bg-secondary text-white',
  ghost: 'bg-transparent hover:bg-gray-50',
  danger: 'bg-red-500 text-white',
};
```

### Size System
Consistent sizing across all components:

```typescript
const sizes = {
  xs: 'text-xs px-2 py-1',    // Extra small
  sm: 'text-sm px-3 py-1.5',  // Small
  md: 'text-base px-4 py-2',  // Medium (default)
  lg: 'text-lg px-5 py-2.5',  // Large
  xl: 'text-xl px-6 py-3',    // Extra large
};
```

## Usage Examples

### Basic Usage
```tsx
import { Button, Card, Stack, Badge } from '@ria/web-ui';

function MyComponent() {
  return (
    <Card padding="lg">
      <Stack spacing="md">
        <h2>Invoice Details</h2>
        <Badge variant="success">Paid</Badge>
        <Button variant="primary" onClick={handleEdit}>
          Edit Invoice
        </Button>
      </Stack>
    </Card>
  );
}
```

### Composition Pattern
```tsx
import { Card, Stack, Button, Input, FormField } from '@ria/web-ui';

function InvoiceForm() {
  return (
    <Card>
      <Stack spacing="lg">
        <FormField label="Invoice Number" error={errors.number}>
          <Input
            value={invoice.number}
            onChange={handleChange}
            placeholder="INV-001"
          />
        </FormField>
        
        <Stack direction="horizontal" justify="end" spacing="sm">
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Invoice
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
```

## Implementation Guidelines

### 1. Start Simple
Begin with basic functionality and add features progressively:
```typescript
// Version 1: Basic button
<Button>Click me</Button>

// Version 2: Add variants
<Button variant="primary">Click me</Button>

// Version 3: Add sizes
<Button variant="primary" size="lg">Click me</Button>

// Version 4: Add loading state
<Button variant="primary" loading>Saving...</Button>
```

### 2. Use Design Tokens
Always reference design tokens instead of hardcoding values:
```typescript
// ❌ Bad
className="bg-blue-500 p-4 rounded-lg"

// ✅ Good
className="bg-theme p-4 rounded-lg"

// ✅ Better (using CSS variables)
style={{ backgroundColor: 'var(--theme)' }}
```

### 3. Accessibility First
Every component must be accessible:
```typescript
// Include ARIA attributes
<Button
  aria-label="Save invoice"
  aria-disabled={disabled}
  role="button"
  tabIndex={0}
>
  Save
</Button>

// Support keyboard navigation
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleClick();
  }
}}
```

### 4. Forward Refs
Components that render native elements should forward refs:
```typescript
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn('...', className)}
        {...props}
      />
    );
  }
);
```

## Testing Requirements

### Component Tests
Each component must have:
1. **Render test** - Component renders without errors
2. **Props test** - All props work as expected
3. **Interaction test** - User interactions trigger correct callbacks
4. **Accessibility test** - Component meets WCAG standards

### Example Test
```typescript
describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('respects disabled state', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

## Storybook Documentation

Every component must have a Storybook story:

```typescript
// Button.stories.tsx
export default {
  title: 'Core/Button',
  component: Button,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'secondary', 'danger'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
  },
};

export const Default = {
  args: {
    children: 'Button',
  },
};

export const AllVariants = () => (
  <Stack direction="horizontal" spacing="md">
    <Button variant="default">Default</Button>
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="danger">Danger</Button>
  </Stack>
);
```

## Migration Strategy

### For Existing Code
When you find duplicate components in the codebase:

1. **Identify** - Find all instances of similar components
2. **Abstract** - Create the component in web-ui package
3. **Replace** - Update all usages to import from @ria/web-ui
4. **Remove** - Delete the duplicate implementations

### Example Migration
```typescript
// Before: Component defined in apps/web/components/Card.tsx
function Card({ children }) {
  return <div className="p-4 border rounded">{children}</div>;
}

// After: Import from centralized library
import { Card } from '@ria/web-ui';

// Usage remains the same, but now consistent everywhere
<Card padding="md">{children}</Card>
```

## Component Checklist

Before considering a component complete:

- [ ] TypeScript interface defined
- [ ] All props documented with JSDoc
- [ ] Design tokens used for styling
- [ ] Accessibility attributes included
- [ ] Keyboard navigation supported
- [ ] Component exported from index.ts
- [ ] Unit tests written
- [ ] Storybook story created
- [ ] README documentation added
- [ ] Used in at least one place in the app

## Common Patterns

### Compound Components
For complex components, use compound pattern:
```typescript
<Table>
  <Table.Header>
    <Table.Row>
      <Table.Cell>Name</Table.Cell>
      <Table.Cell>Email</Table.Cell>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row>
      <Table.Cell>John Doe</Table.Cell>
      <Table.Cell>john@example.com</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table>
```

### Polymorphic Components
Allow components to render as different elements:
```typescript
<Button as="a" href="/invoices">
  View Invoices
</Button>

<Button as={Link} to="/dashboard">
  Dashboard
</Button>
```

### Controlled vs Uncontrolled
Support both patterns when appropriate:
```typescript
// Controlled
<Input value={value} onChange={setValue} />

// Uncontrolled
<Input defaultValue="initial" />
```

## Performance Guidelines

1. **Memoize expensive components** with React.memo
2. **Use lazy loading** for heavy components
3. **Optimize re-renders** with proper dependency arrays
4. **Bundle size awareness** - check impact of new dependencies
5. **Code split** by route when possible

## Maintenance

### Regular Reviews
- Monthly review of component usage metrics
- Quarterly design system alignment check
- Remove unused components after deprecation period
- Update documentation with new patterns

### Version Strategy
- Use semantic versioning for the package
- Document breaking changes in CHANGELOG
- Provide migration guides for major updates
- Maintain backwards compatibility when possible

## Contributing

### Adding New Components
1. Check if similar component exists
2. Discuss in team if needed
3. Follow the structure of existing components
4. Add comprehensive tests and stories
5. Update this documentation
6. Get code review before merging

### Improving Existing Components
1. Check current usage across codebase
2. Ensure changes are backwards compatible
3. Add deprecation warnings if needed
4. Update tests and stories
5. Document the changes

## Resources

- [Design Tokens](/packages/web-ui/tokens/ria.css)
- [Tailwind Config](/packages/web-ui/tokens/tailwind.preset.cjs)
- [Storybook](http://localhost:6006) (when running)
- [Component Tests](/packages/web-ui/src/__tests__)

Remember: **Every UI element should come from this library!**