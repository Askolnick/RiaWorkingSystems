# Management System — App Schema (Pages, Features & UI)

*Last updated: 2025-09-11*

This document captures the **current, end‑to‑end blueprint** for the app: sitemap, pages, features, UI specs, key data models, and cross‑cutting concerns (auth, roles, design system, performance, and testing). It’s structured to be implementation‑friendly and easy to iterate.

---

## 0) Summary at a Glance

* **Core pillars:** Portal (custom dashboard), Inventory & Manufacturing, Finance, CRM/People, Projects & Tasks, Communications, Maps & Field Ops, Storefront, Admin.
* **Tech guardrails:** React + Tailwind + shadcn/ui; Recharts; Framer Motion; React Router (`<Routes>` + `OptimizedAppPageRouter` for lazy mapping); Firestore backend (with Cloud Functions); Meshtastic/Beacon integration roadmap.
* **Primary UX patterns:** grid‑based widgets, drawer overlays, command palette, universal search, structured sidebars, mobile‑first responsive.

---

## 1) Global Navigation & Layout

### 1.1 Top‑level Sections

1. **Portal** (home dashboard; user‑customizable)
2. **Inventory** (objects, tools, supplies; BOMs; stock; manufacturing flows)
3. **Projects** (projects, tasks, sprints, templates)
4. **People** (contacts, orgs, roles; lightweight CRM)
5. **Finance** (accounts, ledger, invoices, P\&L, balance sheet)
6. **Comms** (messages, announcements, incident mode, activity)
7. **Maps** (resources, hazards, hubs; incidents; routes)
8. **Store** (public/private storefront backed by Inventory)
9. **Admin** (settings, roles, audit, theming, integrations)

### 1.2 App Shell

* **Left Sidebar:** section nav, recent items, favorites.
* **Top Bar:** global search (Cmd/Ctrl+K), quick actions, notifications, user menu.
* **Right Rail (contextual):** selection details, insights, checklist, comments.
* **Main Content:** page content area with grid/kanban/table/map views.
* **Drawers/Modals:** create/edit forms, wizards, filters, and incident overlays.

### 1.3 Routing

* **Hybrid:**

  * Declarative routes via `<Routes>` for core pages.
  * `OptimizedAppPageRouter` loads page components from route config (lazy import, code‑split per section). Ensure route metadata: `title`, `icon`, `roles`, `featureFlags`.
* **Example path map:**

  * `/` → Portal
  * `/inventory`, `/inventory/:id`, `/inventory/boms/:id`, `/inventory/manufacturing`
  * `/projects`, `/projects/:id`, `/projects/:id/tasks`
  * `/people`, `/people/:id`
  * `/finance`, `/finance/reports/balance-sheet`, `/finance/ledger`
  * `/comms`, `/comms/incident`
  * `/maps`, `/maps/incidents/:id`
  * `/store`, `/store/product/:slug`
  * `/admin` (sub‑routes below)

---

## 2) Portal (Customizable Dashboard)

### 2.1 Purpose

Give each user a **personal command center** of widgets (data & quick actions), arranged on a **snap‑to‑grid** canvas with drag/resize.

### 2.2 Features

* **Widget library:** KPIs, charts, tables, cards, countdowns, checklists, shortcuts, embedded pages/components (incl. FreeCAD viewer placeholder), weather, incidents near me.
* **Builder mode:** add/remove, drag‑to‑reorder, corner‑resize with grid snapping (1×1 up to n×m). Save multiple layouts (workspaces) + shareable templates.
* **Data binding:** pick any data source (Firestore collections/queries; computed functions; recent activity; project/task filters). Lightweight expression builder (e.g., filter, group, aggregate).
* **Permissions:** widgets can be private, team, or public.
* **Themable:** light/dark, card density, compact mode, metric units.

### 2.3 UI

* Grid canvas (responsive), ghost previews while dragging, alignment guides.
* Widget chrome: title, menu (⋯), refresh, timeframe, filter chips.
* Empty‑state with suggested templates and “Start from data”.

---

## 3) Inventory & Manufacturing

### 3.1 Inventory Objects

* **Item types:** tools, equipment, consumables, components, finished goods, office supplies.
* **Attributes:** SKU, name, images, category, unit, location, owner, status, min/max, suppliers, cost, serial/lot, lifecycle (in service, repair, retired).
* **Stock:** multi‑location bins, batch/lot, reorder points, cycle counts.
* **Movements:** receive, issue, transfer, adjust; audit trail.

### 3.2 BOMs & Assemblies

* **BOM versions**, alternates, substitutions, routing steps.
* **Explosion/Implosion:** material requirements, where‑used.
* **Cost roll‑up:** materials + labor + overhead.

### 3.3 Manufacturing

* **Work orders:** status (planned → kitting → in‑progress → QA → done), traveler, timestamps, operator notes, scrap.
* **Stations & Routing:** station capacity, queue, WIP tracking, takt time.
* **Resupply:** reorder rules, supplier POs, lead times, receiving.

### 3.4 UI

* Inventory list (table): columns chooser, saved views, quick filters, bulk actions.
* Item detail: gallery, specs, stock by location, BOM/where‑used, history.
* BOM editor (tree), drag‑insert components, version compare.
* Manufacturing board (kanban by step), station dashboard, WO timeline.
* Movement & receiving drawers with barcode/QR support (camera input).

---

## 4) Store (Front‑End)

* **Product catalog:** driven by Inventory with publish flags, pricing tiers, stock visibility, variants.
* **Pages:** home, categories, search, product detail, cart/quote, checkout (quote or order), account.
* **UI:** marketing hero, featured products, filters, reviews (internal), stock badges (in/out/low), delivery estimates.
* **Flows:** quote requests (internal approval), fulfillment picks from Inventory, shipping/hand‑off.

---

## 5) Projects & Tasks

* **Projects:** goals, milestones, docs, links, owners, tags.
* **Tasks:** assignee, status, priority, due, dependencies, checklists, time logs.
* **Views:** list, kanban, calendar, Gantt (lightweight), workload.
* **Templates:** reusable project/task templates.
* **UI:** split‑pane (task list + detail), inline quick add, bulk edit.

---

## 6) People (CRM‑lite)

* **Entities:** people, organizations, roles, skills, certifications, availability.
* **Interactions:** notes, emails (logged), tasks, relationship graph.
* **UI:** contact list/table, profile page (timeline, files, linked projects), org view.

---

## 7) Finance

### 7.1 Foundations

* **Chart of Accounts (CoA)** with types: Assets, Liabilities, Equity, Revenue, Expenses.
* **Double‑entry ledger** (immutable journal); documents post entries (invoices, bills, inventory movements with valuation, payroll summaries).
* **Inventory valuation:** FIFO (default), with option for weighted avg.

### 7.2 Modules

* **Banking:** accounts, statements import, reconciliation.
* **Sales:** invoices, payments, credit notes; AR aging.
* **Purchasing:** bills, vendor credits; AP aging.
* **Inventory ↔ Finance:** auto postings for receive/issue/COGS, WIP capitalization, finished‑goods.

### 7.3 Reports (UI + Integrity)

* **Profit & Loss**, **Balance Sheet**, **Cash Flow**, **Trial Balance**.
* **Balance Sheet accuracy checks:**

  * sum(Assets) − sum(Liabilities) − Equity = 0 (assert zero).
  * Ledger invariants: total debits = total credits per period.
  * Recalc hooks after data mutation; red banner if out of balance + “drill to offending entries”.
* **UI:** report filters (date range, basis, entity), expand/collapse accounts, export CSV/PDF.

---

## 8) Communications

* **Channels:** announcements (broadcast), team threads, incident mode.
* **Incident Mode:** full‑screen overlay, status, roles, assignments, checklists, live feed, map pane.
* **Activity Feed:** system events and approvals with filters.
* **UI:** left channel list, center thread, right incident panel; composer with slash commands.

---

## 9) Maps & Field Ops

* **Layers:** resources (hubs, shelters, tools), hazards, incidents, routes, user pins.
* **Reports:** weather, incidents, map item updates (ties to Buoy system).
* **Routing:** preferred + fallback routes; redirect logic (Navigator integration).
* **UI:** map canvas, layer toggles, search, object drawer, batch edits, offline tiles (roadmap).

---

## 10) Admin & Settings

* **Org:** name, logo, locales, units.
* **Users & Roles:** RBAC (see §12), invitations, SSO.
* **Permissions Matrix:** per‑module and per‑record policies.
* **Integrations:** Meshtastic/Beacon, email, webhooks, payment (store), accounting export.
* **Theming:** brand colors, typography scale, UI density.
* **Audit Logs:** read/write events, export.

---

## 11) Design System & Components

* **Base:** Tailwind + shadcn/ui; icons via lucide-react; motion via Framer Motion.
* **Primitives:** Button, Input, Select, Switch, Tabs, Tooltip, Dialog, Drawer, Sheet, DropdownMenu, Command (palette), Toast, Menubar, Breadcrumbs, Pagination.
* **Data Display:** Card, Table (virtualized for large sets), DataGrid (filters, grouping), Badge, Avatar, Progress, Timeline, EmptyState.
* **Patterns:**

  * **Overlay trio:** Drawer (edit), Dialog (confirm), Sheet (auxiliary).
  * **List + Detail** split panes.
  * **Grid widgets** with resize handles and snap‑to‑grid.
  * **Search Overlay** using `@react-spring/web` + `@use-gesture/react` (already in project).

---

## 12) Roles & Permissions (RBAC)

* **Roles (suggested):** Owner, Admin, Manager, Finance, Manufacturing, Inventory, Staff, Viewer, External (Store customer).
* **Policy examples:**

  * Inventory.Staff: create movements, view stock; no CoGS overrides.
  * Finance: post journal entries, view sensitive reports.
  * Store.External: browse/purchase published items only.
* **Row‑level rules:** ownerId/teamId scoping; draft vs published.
* **UI:** feature gating via route metadata; hide or disable with tooltip.

---

## 13) Data Model (Key Collections)

> Firestore collections (top‑level); subcollections noted with `/`.

* `users` — profile, roles, preferences, portals/boards.
* `widgets` — schema, bindings, layout instances.
* `inventory_items` — core item data.
* `stock_levels` — {itemId, locationId, qty, lot/serial, min/max}.
* `inventory_movements` — type, qty, from/to, valuation link.
* `locations` — warehouses, rooms, bins.
* `suppliers` — org data, terms, lead times.
* `boms` — {itemId, version, lines\[]: {componentId, qty, altGroup}}.
* `work_orders` — {bomVersion, qty, routing\[], status, timestamps}.
* `manufacturing_stations` — capacity, queue.
* `projects` — meta, milestones.
* `tasks` — {projectId, assigneeId, status, due, deps\[]}.
* `people` — contacts; link to `orgs`.
* `orgs` — organizations/customers/vendors.
* `ledger_entries` — double‑entry journal lines (doc per line).
* `invoices`, `bills`, `payments` — AR/AP docs.
* `bank_accounts`, `bank_txns` — statements + reconciliation.
* `announcements`, `threads`, `messages` — comms.
* `incidents` — status, location, assignments, logs.
* `map_items` — resources/hazards/hubs with geo.
* `store_products` — publishable views of inventory items, pricing, SEO.
* `orders` / `quotes` — storefront docs.
* `audit_logs` — actor, verb, target, old→new.
* `files` — references to storage (if/when enabled).

**Indexing:** composite indexes for common queries (e.g., `inventory_movements` by `itemId+createdAt`, `tasks` by `projectId+status`, `ledger_entries` by `accountId+date`).

**Ledger integrity:** Cloud Function validates that for each `documentId`, sum(debits)=sum(credits). Failing documents are quarantined with error status.

---

## 14) Data Flows & Integrations

* **Inventory ↔ Finance:** movement triggers valuation entry; WO completion moves WIP→FG and posts COGS on issue.
* **Projects ↔ People:** task assignment, capacity view.
* **Store ↔ Inventory:** order reserves stock; fulfillment decrements; backorders create POs.
* **Comms ↔ Incident:** incident updates broadcast to channel and push toast.
* **Maps ↔ Navigator/Buoy:** incidents and resources sync; route advisories appear in Maps & Portal widgets.

---

## 15) Search & Discovery

* **Global search (Cmd/Ctrl+K):** federated across collections; recent/shortcut suggestions; keyboard nav; fuzzy matching.
* **Scoped search:** per‑module quick filters; saved searches.

---

## 16) Performance & Offline

* **Code‑split** per route via `OptimizedAppPageRouter`.
* **Virtualized lists** for large tables.
* **Optimistic updates** on create/edit; reconcile with server.
* **Caching:** SWR/React Query patterns; snapshot listeners where useful.
* **Offline (roadmap):** cache essentials (Portal widgets, critical forms); background sync.

---

## 17) Accessibility & Internationalization

* **A11y:** focus outlines, skip links, ARIA on widgets, high‑contrast theme, keyboard resize/drag options.
* **i18n:** date/number formats; string dictionaries; RTL support.

---

## 18) Security & Compliance

* **Auth:** Firebase Auth + SSO (OIDC/SAML).
* **Rules:** Firestore security rules per collection with role checks; server‑validated sensitive writes.
* **Audit:** all writes are logged; exportable.
* **PII handling:** tag fields; encryption at rest (by platform) and transit; data retention policies.

---

## 19) Analytics & Observability

* **User analytics:** page and feature usage; funnel for Store.
* **System metrics:** function latency, error rates, slow queries.
* **Finance checks:** scheduled integrity job with notification.

---

## 20) Testing & QA

* **Unit:** utilities, validators, reducers.
* **Component:** Storybook for UI; Vitest/RTL.
* **E2E:** Playwright for flows (add item → receive → WO → post COGS → reports balance sheet check).
* **Data fixtures:** seed scripts for demo tenants.

---

## 21) Page‑by‑Page Specs (Condensed)

### Portal

* **Views:** personal, team, template gallery
* **Key UI:** grid canvas, widget library, data binding modal, layout switcher
* **Actions:** add widget, resize/drag, save layout, share, duplicate

### Inventory

* **Views:** list/table, item detail, BOM editor, manufacturing board, movements, suppliers, receiving
* **Key UI:** filters, saved views, barcode scan, import CSV
* **Actions:** create item, post movement, create WO, print labels, version BOM

### Projects

* **Views:** kanban, list, Gantt, calendar, templates
* **Actions:** new project/task, assign, change status, log time, export

### People

* **Views:** contacts, orgs, profiles
* **Actions:** add contact, note, link to project/invoice

### Finance

* **Views:** ledger, accounts, AR/AP, bank rec, reports
* **Actions:** post entry, create invoice/bill, reconcile, export

### Comms

* **Views:** channels, threads, incident
* **Actions:** post, mention, attach, switch to incident mode

### Maps

* **Views:** layers, incidents, routes
* **Actions:** add map item, draw route, link to incident

### Store

* **Views:** catalog, product, cart/quote, checkout, account
* **Actions:** add to cart, request quote, checkout, fulfill

### Admin

* **Views:** org, users & roles, permissions, integrations, audit, theming
* **Actions:** invite user, assign role, toggle feature, configure SSO, export logs

---

## 22) Open Questions / Next Decisions

1. **FreeCAD embedding:** viewer integration on Portal (web assembly or remote render?) and export path → Inventory BOM; permissions for models.
2. **Accounting basis:** cash vs accrual toggles and report variants.
3. **Offline scope:** which modules must be resilient first (Portal, Inventory movements, Incident mode)?
4. **Store payments:** which provider and whether to support quotes‑only initially.
5. **Navigator integration:** exact event schema for route advisories; frequency of sync.

---

## 23) Milestones (Suggested)

1. **MVP‑1:** Portal widgets (KPI, table, shortcut), Inventory basics, simple Store (publish/browse), Projects list+kanban, Comms channels, Finance ledger + P\&L, Auth+RBAC core.
2. **MVP‑2:** BOMs, Work Orders, balance sheet checks, Bank rec, Incident mode, Maps layers, AR/AP.
3. **MVP‑3:** Templates, Gantt, receiving with barcodes, storefront checkout/quotes, Navigator hooks.

---

### Appendix A — Widget Catalog (initial)

* **Data KPI** (single metric)
* **Timeseries Chart** (Recharts)
* **Table View** (paged)
* **Checklists**
* **Quick Actions** (multi‑button)
* **Project Summary**
* **Inventory Low‑Stock**
* **WO Queue**
* **Finance Snapshot** (cash, AR/AP)
* **Incident Ticker**
* **Map Mini** (view only)
* **Embed Frame** (internal component)

### Appendix B — Validation & Error Patterns

* Inline field validation; toast on success; banner on critical integrity failures (finance/inventory); link to diagnostics.

### Appendix C — Import/Export

* CSV importers: inventory items, stock, contacts, ledger entries.
* Exporters: tables → CSV; reports → CSV/PDF; audit logs → CSV.

