# Ria Portal — Builder + Server Persistence + Collision Resolution (2025-09-10)

This bundle adds three big upgrades to your Portal dashboard:
1. **Widget Builder** (entity → filters → fields → viz) with live preview
2. **Server persistence** (Prisma patch + NestJS API, or Next.js route fallback)
3. **Collision resolution** so widgets never overlap and compact upward automatically

## Files to copy

### Prisma / SQL
- `prisma/portal_patch.prisma` (merge into your schema, run migrations)
- `db/migrations/2025XXXX_portal.sql` (optional raw SQL)

### API (NestJS option)
- `apps/api/src/portal/portal.module.ts`
- `apps/api/src/portal/portal.repo.ts`  *(replace with Prisma adapter)*
- `apps/api/src/portal/portal.service.ts`
- `apps/api/src/portal/portal.controller.ts`  → `/api/portal/layout` GET/POST

### Web (Next.js option for local dev)
- `apps/web/app/api/portal/layout/route.ts`  → in‑app fallback persistence

### Client (Web)
- `apps/web/lib/portal.api.ts`  → `getLayout(name)`, `saveLayout(layout)`
- `apps/web/components/Portal/GridCollision.tsx`  → grid with collision & compaction
- `apps/web/components/Portal/WidgetBuilder.tsx`  → builder UI with preview
- `apps/web/app/(portal)/portal/page.tsx`  → updated Portal page using server sync & builder

## How it works

### Persistence
- The page loads layout via **GET `/api/portal/layout?name=default`** and debounces **POST** saves on change.
- Replace the demo NestJS repo with Prisma calls for `DashboardLayout` + `DashboardWidget`.

### Collisions
- On drag/resize we resolve overlaps by pushing the moved widget down until clear, then **compact** all widgets upward.
- Widgets are clamped to the grid width.

### Builder
- Users pick **Entity** + **Fields** + **Filters** + **Visualization** + **Limit**.
- The chosen config is saved in `widget.props.query`. Replace the preview with real data fetch (TanStack Query) later.

## Next steps (I can do these next)
- Wire Prisma repo impl (queries + transactions) and auth headers for `tenantId`/`userId`.
- Add **packing heuristics** (left-to-right, bottom gravity) and drag‑shadow previews.
- Add **chart** rendering (Recharts) and query->viz mappers.
- Add **shareable layouts** (org default vs personal overrides) and **RBAC** on layout names.
