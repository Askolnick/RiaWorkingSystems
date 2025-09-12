# Ria Tasks Upgrades v2 — Query + Persisted DnD + Votes + E2E (2025-09-09)

This bundle adds:
- **TanStack Query** provider + hooks (`useTasksQuery`, `useUpdateTaskOptimistic`).
- **Persisted DnD** with status + rank ordering (lexo-like rank utility).
- **Roadmap Votes** with weighting (role × vote-kind), plus **public embed** route.
- **Playwright** E2E smoke tests for board/list.

## Install (frontend)
1. Copy `apps/web/app/providers/query-client.tsx` and wrap your `(portal)/layout.tsx` with `WithQueryClient` (sample included).
2. Copy `apps/web/lib/api.ts`, `apps/web/lib/tasks.api.ts`, `apps/web/lib/rank.ts`.
3. Copy hooks: `apps/web/hooks/useTasksQuery.ts`.
4. Replace your `/tasks/board` page with `apps/web/app/(portal)/tasks/board/page.tsx` to use persisted DnD.
5. Add embed page: `apps/web/app/(marketing)/embed/roadmap/[slug]/page.tsx`.

## Install (api)
1. Add `apps/api/src/tasks/roadmap.votes.service.ts` and `apps/api/src/tasks/roadmap.controller.extend.ts`.
2. Register `RoadmapVotesService` and `RoadmapVotesController` in your `TasksModule` (or a `RoadmapModule`).

## Persisted Ordering
- Each task has a `rank` string. When dropping into a lane, we compute `rank = mid(beforeRank, afterRank)`.
- Store `rank` via `PATCH /tasks/:id`. Your repo should persist this to the Prisma `Task.rank` column (add `rank String? @db.VarChar(64)` if missing).

## E2E
- Install Playwright (`@playwright/test`) and run `npx playwright install`. Then: `pnpm -w exec playwright test`.

## Notes
- Replace fetch calls with your internal API base or Next API routes.
- The votes service is in-memory; swap to Prisma `Vote` with `itemType='roadmap'` and compute score in SQL or service.
