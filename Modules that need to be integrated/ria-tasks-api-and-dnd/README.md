# Ria Tasks — API + DnD Upgrade (2025-09-09)

This bundle adds:
- NestJS **Tasks module** (controllers/services/repo stubs) for Tasks, Dependencies, Custom Fields, Saved Views, Roadmap.
- Frontend **Kanban DnD** using HTML5 drag/drop.
- **Saved View** persistence calls and a public **Roadmap** route wired to the API.

## Install
1) Copy API files under `apps/api/src/tasks/` and import `TasksModule` in `apps/api/src/app.module.ts`:
```ts
import { Module } from '@nestjs/common'
import { TasksModule } from './tasks/tasks.module'
@Module({ imports: [TasksModule] })
export class AppModule { }
```

2) Ensure your API exposes `/api/*` routes (Nest factory with global prefix or Next proxy).

3) Copy web files into your Next app:
- `apps/web/app/(portal)/tasks/board/page.tsx` (replaces/extends board)
- `apps/web/app/(portal)/tasks/list/page.tsx` (adds Save View example)
- `apps/web/components/tasks/KanbanDnD.tsx`
- `apps/web/lib/saved-views.ts`
- `apps/web/app/(marketing)/roadmap/[slug]/page.tsx` (public view, comments gated)

4) Replace **Repo** stubs with Prisma queries against your v0.3 + tasks patch schema.

5) Optional: Add TanStack Query and wrap fetches; add auth and tenant headers (e.g., `X-Tenant-Id`).

## Notes
- The DnD demo performs optimistic UI moves and leaves a TODO to persist via `PATCH /tasks/:id`.
- Saved Views store layout/filters/sort as JSON; use these to render board columns and table columns per team.
- Roadmap comments must require login; the route fetches public items only.
