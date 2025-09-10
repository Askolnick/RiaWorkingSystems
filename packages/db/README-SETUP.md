# Ria Unified Prisma Schema — Notes

## Postgres extensions you likely want
Enable once per database (via SQL migration):
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
```
(You can use `gen_random_uuid()` from `pgcrypto` if you prefer DB-side IDs.)

## Full-text search (FTS) examples
Prisma doesn't model `tsvector` yet. Add columns & indexes via SQL migrations.

**Option A — Generic `SearchIndex` table (easy)**
```sql
-- Add tsvector on SearchIndex and GIN index
ALTER TABLE "SearchIndex" ADD COLUMN IF NOT EXISTS searchVec tsvector;
CREATE INDEX IF NOT EXISTS searchindex_search_gin ON "SearchIndex" USING GIN (searchVec);

-- Refresh vector when content changes (trigger)
CREATE OR REPLACE FUNCTION searchindex_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.searchVec := to_tsvector('simple', coalesce(NEW.title,'') || ' ' || coalesce(NEW.snippet,'') || ' ' || NEW.content);
  RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_searchindex_vector_update ON "SearchIndex";
CREATE TRIGGER trg_searchindex_vector_update
BEFORE INSERT OR UPDATE ON "SearchIndex"
FOR EACH ROW EXECUTE FUNCTION searchindex_vector_update();
```

**Option B — Per-entity generated columns (advanced)**
You can create a `tsvector` generated column on `LibraryDoc` or `Task` and index it. Keep canonical text (`bodyMd`, `description`) in the entity and use a trigger to update the vector.

## Recommended GIN indexes (JSON/tags/arrays)
```sql
-- Tags/labels arrays
CREATE INDEX IF NOT EXISTS task_labels_gin ON "Task" USING GIN (labels);
CREATE INDEX IF NOT EXISTS task_assignees_gin ON "Task" USING GIN (assigneeIds);
CREATE INDEX IF NOT EXISTS doc_tags_gin ON "library_docs" USING GIN (tags);
```

## Row Level Security (RLS) skeleton
When you move to managed Postgres, enable RLS and add policies keyed on `tenantId`. Example for `Task`:

```sql
ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;

-- Assume app sets `app.current_tenant` and `app.user_id` as GUCs per session.
CREATE POLICY task_tenant_isolation ON "Task"
USING (tenantId::uuid = current_setting('app.current_tenant', true)::uuid);

-- Optional: per-role policies (read/write) checking membership/roles table
-- or a materialized mapping of user->roles for the current tenant.
```

## ID strategy
This schema uses Prisma `uuid()` by default. If you prefer **UUIDv7** for better index locality,
generate IDs in app code and pass them in.

## Soft deletes
Most entities include `deletedAt`; keep your queries filtering on `WHERE deletedAt IS NULL` where applicable.

## Incremental task numbers
`Task.number` is unique per tenant. Assign inside a transaction to avoid races:
- Query max number for tenant `FOR UPDATE`
- Insert with `max + 1`

## What’s included
- Tenants, Users, Memberships, Roles & Permissions (RBAC 1.0)
- Groups (for targeted publishing and access)
- Generic Tags + Tagging
- Generic EntityLink (cross-hub relationships)
- Files (S3/MinIO) + Attachments (polymorphic)
- Messaging (channels, threads, messages)
- Tasks (task, comment)
- Library (docs, sections, publishing)
- Notifications (user-specific) & Activity (system audit)
- SearchIndex (FTS-ready)

## What’s intentionally not in here
- Finance models (Invoices, Payments) — we can add as a separate module.
- Realtime collaboration snapshots — add Yjs/CRDT tables when you’re ready.

---

**Next steps I can package for you:**
- A **Prisma migration** folder with SQL for FTS, GIN indexes, and RLS policies.
- Seed scripts that create a demo tenant, users, and sample docs/tasks/threads.
- A type-safe access control layer (`can(user).do("write","task")`) driven by `PermissionGrant`.