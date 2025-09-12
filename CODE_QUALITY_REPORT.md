# Code Quality & Architecture Report

*Generated: 2025-09-11*

## Executive Summary

The codebase has significant architectural violations that need immediate attention. While some good patterns are in place (repository pattern, Zustand stores), there are critical issues with component organization, TypeScript errors, and routing.

## 🚨 Critical Issues (Fix Immediately)

### 1. TypeScript Errors (100+ errors)
**Count**: 100+ errors across the codebase
**Impact**: HIGH - Prevents proper type checking and builds

**Most Common Issues**:
- Missing exports from `@ria/client` (createEntityRef, User) - **FIXED**
- Type mismatches in component props
- Incorrect route types 
- Missing React dependency in client package - **FIXED**

### 2. Components Outside packages/web-ui (18 files)
**Impact**: HIGH - Violates clean architecture

**Components that MUST be moved**:
```
apps/web/app/_components/
  - AppLayout.tsx
  - NavigationDock.tsx  
  - CenterGrid.tsx

apps/web/app/library/_components/
  - AttachmentPicker.tsx
  - LibraryTabs.tsx

apps/web/app/library/uploads/_components/
  - FileGrid.tsx
  - FolderSidebar.tsx

apps/web/app/library/learning/_components/
  - LessonList.tsx
  - QuizBuilder.tsx
  - CourseCard.tsx

apps/web/components/
  - CommandPalette.tsx
  - SearchButton.tsx
  - Topbar.tsx
  - ThemeToggle.tsx
  - contacts/ (5 components)
```

### 3. Duplicate Table Components (4 instances)
**Impact**: MEDIUM - Maintenance overhead

**Locations**:
1. `apps/web/components/contacts/SimpleTable.tsx`
2. `packages/web-ui/src/components/atoms/Table.tsx`
3. `packages/web-ui/src/components/atoms/SimpleTable.tsx`
4. `packages/web-ui/src/Table/Table.tsx`

**Action**: Consolidate into ONE Table component in web-ui

## 🔥 Architecture Violations

### 1. Direct API Calls
**Location**: `apps/web/app/auth/sign-up/page.tsx:43`
```typescript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  // ...
});
```
**Fix**: Use auth repository pattern

### 2. Hardcoded Routes (8+ instances)
**Examples**:
- `/roadmap/page.tsx:37`: `router.push('/roadmap/${item.slug}')`
- `/wiki/page.tsx:35`: `router.push('/wiki/spaces/new')`
- `/finance/page.tsx:135`: `router.push('/finance/invoices/new')`

**Fix**: Use ROUTES constants from `@ria/utils`

### 3. Local State Instead of Stores
**Count**: 15+ files using `useState` for shared data
**Fix**: Move to Zustand stores for data that needs to be shared

## ✅ What's Working Well

1. **Repository Pattern**: Properly implemented in most places
2. **Error Boundaries**: Used in 7+ components
3. **Design System**: Most components use `@ria/web-ui`
4. **Some ROUTES usage**: Auth pages properly use constants

## 📋 Action Plan (Priority Order)

### Phase 1: Critical Fixes (Today)
- [x] Fix missing exports in `@ria/client`
- [x] Add React to client package
- [ ] Move all 18 components to `packages/web-ui`
- [ ] Consolidate Table components

### Phase 2: TypeScript Cleanup (This Week)
- [ ] Fix remaining type errors
- [ ] Add proper types for all props
- [ ] Fix route type definitions

### Phase 3: Architecture Compliance (Next Week)
- [ ] Replace all hardcoded routes with ROUTES constants
- [ ] Convert direct API calls to repository pattern
- [ ] Evaluate and convert appropriate useState to Zustand

### Phase 4: Quality Improvements
- [ ] Add error boundaries to all pages
- [ ] Add loading states consistently
- [ ] Implement proper caching

## 🛠 Quick Fix Commands

```bash
# Check TypeScript errors
cd apps/web && npx tsc --noEmit

# Find components outside web-ui
find apps/web -name "*.tsx" -not -path "*/page.tsx" -not -path "*/layout.tsx"

# Find hardcoded routes
grep -r "router.push('" apps/web --include="*.tsx"

# Find direct fetch calls
grep -r "fetch(" apps/web --include="*.tsx"
```

## 📊 Metrics

| Category | Count | Severity |
|----------|-------|----------|
| TypeScript Errors | 100+ | HIGH |
| Components Outside web-ui | 18 | HIGH |
| Duplicate Components | 4 | MEDIUM |
| Direct API Calls | 1+ | HIGH |
| Hardcoded Routes | 8+ | MEDIUM |
| Missing Error Boundaries | Many | MEDIUM |

## 🎯 Success Criteria

A clean codebase should have:
- ✅ 0 TypeScript errors
- ✅ ALL components in `packages/web-ui`
- ✅ NO duplicate components
- ✅ NO direct API calls in components
- ✅ ALL routes using ROUTES constants
- ✅ Zustand stores for shared state
- ✅ Error boundaries on all pages
- ✅ Consistent loading/error states

## Notes

1. **NEVER** create components in `apps/web` - they MUST go in `packages/web-ui`
2. **ALWAYS** use the repository pattern - no direct fetch calls
3. **ALWAYS** use ROUTES constants - no hardcoded paths
4. **PREFER** Zustand stores over useState for shared data
5. **ENSURE** error boundaries wrap all page content

This report should be reviewed weekly and updated as issues are resolved.