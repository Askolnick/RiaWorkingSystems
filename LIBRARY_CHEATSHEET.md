# 🚀 Ria Living Systems - Master Library Cheat Sheet

## Quick Import Reference
```typescript
import { Button, Card, Badge, Stack, Input, Select, FormField } from '@ria/web-ui';
import { cn, formatMoney, entityRef } from '@ria/utils';
import { useDisclosure, useIdempotentMutation } from '@ria/web-hooks';
import { prisma } from '@ria/db';
import type { Invoice, Payment, User } from '@ria/types';
```

---

## 🎨 UI Components (`@ria/web-ui`)

### ✅ READY TO USE

#### Button
```tsx
import { Button } from '@ria/web-ui';

// Variants
<Button variant="default">Default</Button>
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="danger">Delete</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// States
<Button disabled>Disabled</Button>
<Button loading>Loading...</Button>

// With icon
<Button leftIcon={<Icon />}>With Icon</Button>
```

#### Input
```tsx
import { Input } from '@ria/web-ui';

<Input placeholder="Enter email" />
<Input type="password" />
<Input disabled />
<Input error="Invalid email" />
<Input value={value} onChange={(e) => setValue(e.target.value)} />
```

#### Select
```tsx
import { Select } from '@ria/web-ui';

<Select>
  <option value="">Choose...</option>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</Select>

<Select value={selected} onChange={(e) => setSelected(e.target.value)}>
  {options.map(opt => (
    <option key={opt.id} value={opt.id}>{opt.label}</option>
  ))}
</Select>
```

#### FormField
```tsx
import { FormField } from '@ria/web-ui';

<FormField label="Email" error={errors.email} required>
  <Input name="email" type="email" />
</FormField>

<FormField label="Country" helperText="Select your country">
  <Select name="country">
    <option>United States</option>
    <option>Canada</option>
  </Select>
</FormField>
```

#### Card
```tsx
import { Card } from '@ria/web-ui';

// Basic card
<Card>
  <h2>Card Title</h2>
  <p>Card content goes here</p>
</Card>

// Variants
<Card variant="default">Default Card</Card>
<Card variant="bordered">Bordered Card</Card>
<Card variant="elevated">Elevated Card</Card>
<Card variant="ghost">Ghost Card</Card>

// Padding options
<Card padding="none">No Padding</Card>
<Card padding="sm">Small Padding</Card>
<Card padding="md">Medium Padding</Card>
<Card padding="lg">Large Padding</Card>
<Card padding="xl">Extra Large Padding</Card>

// Interactive
<Card hoverable onClick={() => console.log('clicked')}>
  Clickable Card
</Card>
```

#### Badge
```tsx
import { Badge } from '@ria/web-ui';

// Status badges
<Badge variant="default">Default</Badge>
<Badge variant="success">Paid</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Overdue</Badge>
<Badge variant="info">New</Badge>
<Badge variant="neutral">Draft</Badge>

// Sizes
<Badge size="xs">XS</Badge>
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>

// Rounded
<Badge rounded>Rounded Badge</Badge>
```

#### Stack
```tsx
import { Stack } from '@ria/web-ui';

// Vertical stack (default)
<Stack spacing="md">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Stack>

// Horizontal stack
<Stack direction="horizontal" spacing="lg">
  <Button>Save</Button>
  <Button>Cancel</Button>
</Stack>

// Alignment and justification
<Stack 
  direction="horizontal" 
  align="center" 
  justify="between"
  spacing="md"
>
  <h2>Title</h2>
  <Button>Action</Button>
</Stack>

// Spacing options: none, xs, sm, md, lg, xl
// Align options: start, center, end, stretch
// Justify options: start, center, end, between, around, evenly
```

### 🔄 PLANNED COMPONENTS (Not Yet Implemented)

```typescript
// Layout Components
import { Container, Grid, Divider } from '@ria/web-ui';

// Navigation
import { Tabs, Breadcrumb, Sidebar, Navigation } from '@ria/web-ui';

// Data Display
import { Table, Avatar, List, Stat } from '@ria/web-ui';

// Feedback
import { Alert, Toast, Modal, Drawer, Loading, Skeleton, Progress } from '@ria/web-ui';

// Form Components
import { Checkbox, Radio, Switch, Textarea, DatePicker, FileUpload } from '@ria/web-ui';

// Typography
import { Heading, Text, Link } from '@ria/web-ui';

// Utility Components
import { Tooltip, Popover, Dropdown, ContextMenu } from '@ria/web-ui';

// Business Components
import { EntityLink, MoneyInput, UserMention, StatusIndicator, EmptyState } from '@ria/web-ui';
```

---

## 🪝 React Hooks (`@ria/web-hooks`)

### ✅ READY TO USE

#### useDisclosure
```tsx
import { useDisclosure } from '@ria/web-hooks';

const { isOpen, onOpen, onClose, onToggle } = useDisclosure();

// Usage
<Button onClick={onOpen}>Open Modal</Button>
<Modal isOpen={isOpen} onClose={onClose}>
  Content
</Modal>
```

#### useIdempotentMutation
```tsx
import { useIdempotentMutation } from '@ria/web-hooks';

const mutation = useIdempotentMutation(
  async (data) => {
    return await api.createInvoice(data);
  },
  'create-invoice'
);

// Usage
<Button onClick={() => mutation.mutate(formData)}>
  {mutation.isLoading ? 'Saving...' : 'Save'}
</Button>
```

### 🔄 PLANNED HOOKS (Not Yet Implemented)

```typescript
// State Management
import { useLocalStorage, useSessionStorage, usePrevious, useToggle } from '@ria/web-hooks';

// Effects
import { useDebounce, useThrottle, useInterval, useTimeout } from '@ria/web-hooks';

// DOM
import { useClickOutside, useIntersectionObserver, useResizeObserver, useMediaQuery } from '@ria/web-hooks';

// Async
import { useFetch, useAsync, useMutation, useInfiniteScroll } from '@ria/web-hooks';

// Forms
import { useForm, useFieldValidation, useFormSubmit } from '@ria/web-hooks';

// Business
import { useAuth, useTenant, usePermissions, useEntityLink } from '@ria/web-hooks';
```

---

## 🛠️ Utilities (`@ria/utils`)

### ✅ READY TO USE

#### cn (Class Names)
```tsx
import { cn } from '@ria/utils';

// Combine class names
<div className={cn('base-class', isActive && 'active', className)} />

// With Tailwind
<div className={cn(
  'px-4 py-2 rounded',
  variant === 'primary' && 'bg-blue-500 text-white',
  variant === 'secondary' && 'bg-gray-500 text-white',
  disabled && 'opacity-50 cursor-not-allowed'
)} />
```

#### Entity Reference
```tsx
import { entityRef } from '@ria/utils';

// Create entity reference
const ref = entityRef('Invoice', invoice.id);

// Parse entity reference
const { type, id } = parseEntityRef(ref);
```

#### Format Utilities
```tsx
import { format } from '@ria/utils';

// These are planned but structure exists
format.money(1234.56); // $1,234.56
format.date(new Date()); // Jan 1, 2024
format.number(1234567); // 1,234,567
```

### 🔄 PLANNED UTILITIES (Not Yet Implemented)

```typescript
// Formatting
import { formatMoney, formatDate, formatNumber, formatPhone } from '@ria/utils/format';

// Validation
import { validateEmail, validatePhone, validateTaxId } from '@ria/utils/validation';

// Collections
import { groupBy, sortBy, uniqBy, chunk } from '@ria/utils/collections';

// Performance
import { debounce, throttle, memoize } from '@ria/utils/performance';

// Crypto
import { hash, encrypt, generateToken } from '@ria/utils/crypto';
```

---

## 💼 Business Logic Packages

### Finance Server (`@ria/finance-server`)
```typescript
// Planned structure - files exist but are stubs
import { 
  calculateInvoiceTotal,
  applyTaxRate,
  generateJournalEntry,
  validateAccountingEntry
} from '@ria/finance-server';

import { AIAdapter } from '@ria/finance-server/ai';
import { PostingRules } from '@ria/finance-server/posting';
import { BalanceSheet } from '@ria/finance-server/balance';
```

---

## 📊 Database (`@ria/db`)

### Prisma Client
```typescript
import { prisma } from '@ria/db';

// Usage examples (when connected)
const invoices = await prisma.invoice.findMany({
  where: { tenantId: tenant.id }
});

const user = await prisma.user.create({
  data: { email, name }
});
```

### Available Models (40+ defined)
```typescript
// Core Models
prisma.organization
prisma.user
prisma.membership
prisma.project
prisma.task

// Finance Models
prisma.invoice
prisma.bill
prisma.payment
prisma.account
prisma.journalEntry
prisma.taxRate

// Content Models
prisma.wikiPage
prisma.post
prisma.emailThread
prisma.contact

// And many more...
```

---

## 🎨 Design Tokens

### CSS Variables Available
```css
/* Colors */
var(--bg)          /* Background */
var(--text)        /* Text color */
var(--theme)       /* Primary theme color */
var(--secondary)   /* Secondary color */
var(--inactive)    /* Inactive state */
var(--attention)   /* Attention/warning */

/* Spacing */
var(--space-1) through var(--space-8)

/* Border Radius */
var(--radius)      /* Default radius */
var(--radius-sm)   /* Small radius */
var(--radius-lg)   /* Large radius */

/* Shadows */
var(--shadow-1)    /* Light shadow */
var(--shadow-2)    /* Medium shadow */
var(--shadow-3)    /* Heavy shadow */

/* Animation Durations */
var(--dur-100)     /* 100ms */
var(--dur-200)     /* 200ms */
var(--dur-300)     /* 300ms */
```

### Tailwind Custom Classes
```tsx
// From tailwind.preset.cjs
<div className="bg-theme text-secondary">
<div className="shadow-1 rounded-sm">
<div className="duration-100">
<div className="mode-dark:bg-gray-900"> // Dark mode variant
```

---

## 📁 Common Patterns

### Page Layout Pattern
```tsx
import { Card, Stack, Badge, Button } from '@ria/web-ui';

export default function InvoicePage() {
  return (
    <Stack spacing="lg">
      <Card padding="lg">
        <Stack direction="horizontal" justify="between" align="center">
          <h1 className="text-2xl font-bold">Invoices</h1>
          <Button variant="primary">New Invoice</Button>
        </Stack>
      </Card>
      
      <Card>
        <Stack spacing="md">
          {invoices.map(invoice => (
            <Stack key={invoice.id} direction="horizontal" justify="between">
              <div>
                <h3>{invoice.number}</h3>
                <p className="text-secondary">{invoice.client}</p>
              </div>
              <Badge variant={invoice.status === 'paid' ? 'success' : 'warning'}>
                {invoice.status}
              </Badge>
            </Stack>
          ))}
        </Stack>
      </Card>
    </Stack>
  );
}
```

### Form Pattern
```tsx
import { Card, Stack, FormField, Input, Select, Button } from '@ria/web-ui';

export default function InvoiceForm() {
  return (
    <Card padding="lg">
      <form onSubmit={handleSubmit}>
        <Stack spacing="md">
          <FormField label="Invoice Number" required>
            <Input name="number" placeholder="INV-001" />
          </FormField>
          
          <FormField label="Client">
            <Select name="clientId">
              <option value="">Select client...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          
          <FormField label="Amount">
            <Input name="amount" type="number" step="0.01" />
          </FormField>
          
          <Stack direction="horizontal" justify="end" spacing="sm">
            <Button variant="ghost">Cancel</Button>
            <Button variant="primary" type="submit">Save Invoice</Button>
          </Stack>
        </Stack>
      </form>
    </Card>
  );
}
```

### List with Empty State Pattern
```tsx
import { Card, Stack, Badge, EmptyState } from '@ria/web-ui';

export default function TaskList({ tasks }) {
  if (tasks.length === 0) {
    return (
      <Card padding="xl">
        <EmptyState
          icon={<TaskIcon />}
          title="No tasks yet"
          description="Create your first task to get started"
          action={<Button variant="primary">Create Task</Button>}
        />
      </Card>
    );
  }
  
  return (
    <Stack spacing="sm">
      {tasks.map(task => (
        <Card key={task.id} padding="md" hoverable>
          <Stack direction="horizontal" justify="between">
            <div>
              <h3>{task.title}</h3>
              <Badge variant="info">{task.status}</Badge>
            </div>
            <Button size="sm">View</Button>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}
```

---

## 🚦 Status Key

- ✅ **Ready to Use** - Implemented and working
- 🔄 **Planned** - Structure exists but not implemented
- ❌ **Not Started** - Needs to be created

---

## 📝 Quick Decision Tree

```
Need a UI element?
  → Check @ria/web-ui components first
  → If not there, compose from existing
  → Last resort: Add to web-ui package

Need business logic?
  → Check @ria/[module]-server
  → Keep UI-free, framework agnostic

Need a utility function?
  → Check @ria/utils
  → Pure functions only

Need React state logic?
  → Check @ria/web-hooks
  → Must start with 'use'

Need to style something?
  → Use design tokens (CSS vars)
  → Use Tailwind classes
  → Never hardcode colors/spacing
```

---

## 🎯 Most Common Imports

```typescript
// For any page/component
import { Button, Card, Stack, Badge, Input, Select, FormField } from '@ria/web-ui';
import { cn } from '@ria/utils';

// For forms
import { useForm } from '@ria/web-hooks'; // (planned)
import { validateEmail } from '@ria/utils'; // (planned)

// For data
import { prisma } from '@ria/db';
import type { Invoice, User } from '@ria/types';

// For API calls
import { apiClient } from '@ria/client'; // (planned)
```

---

## 📚 Remember

1. **Always import from packages**, never create duplicates
2. **Check this cheat sheet first** before creating anything new
3. **Use existing components** - they handle edge cases
4. **Follow the patterns** - consistency is key
5. **Design tokens only** - no hardcoded values

---

## 🔗 Quick Links

- [Component Library Docs](./packages/web-ui/COMPONENT_LIBRARY.md)
- [Code Organization](./CODE_ORGANIZATION.md)
- [Architecture Rules](./ARCHITECTURE_RULES.md)
- [Development Guidelines](./CLAUDE.md)