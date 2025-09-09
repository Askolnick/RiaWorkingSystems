# Ria Living Systems — Starter Monorepo (Updated)

This starter project sets up the skeleton for your all‑in‑one management platform. It includes:

- **Modular monolith** with TypeScript across client and server via a pnpm workspace.
- **Prisma v0.3 schema** with a `TaskAssignee` join table, membership‑scoped foreign keys, and a `Mention` table for backlinks.
- **Next.js portal** using design tokens for light/dark modes and soft, rounded UI.
- **NestJS API stub**, ready for domain modules and your own endpoints.
- **UI primitives** (`Button`, `Input`, `Select`, `FormField`) and **hooks** (`useDisclosure`, `useIdempotentMutation`) to avoid duplicated markup and logic.
- **Utilities** for class names, date/currency formatting, and entity reference helpers.
- **Docker compose** for local development with Postgres, Redis, search, and Minio.

This extended version adds a **Finance module** with a simple chart of accounts, journal entries, bills, payments and AI‑assisted posting.  The schema includes models for posting policies, AI suggestions and prompt logs.  A starter server package (`@ria/finance-server`) exposes helper functions for evaluating rules, calling a mock AI adapter and computing balance sheets.

## Quickstart

```bash
pnpm install # install dependencies
docker compose -f docker-compose.dev.yml up -d # start db, redis, search, storage
pnpm dev # run web/api/workers in watch mode
```

The design tokens live under `packages/web-ui/tokens`, and the portal app demonstrates how to use them.
