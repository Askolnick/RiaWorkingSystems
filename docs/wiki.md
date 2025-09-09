# Wiki & Knowledge Management

The wiki module powers collaborative documentation and knowledge capture across the entire platform. It uses a Markdown‑first approach with a **Typist** layer for inline styling and editing.

## Core concepts

* **Docs vs. Sections** – A *doc* is a top‑level document, such as a spec or SOP. A *section* is a reusable snippet. Docs can include sections using special include directives, so content lives in one place and is reused everywhere.
* **Markdown & Typist** – Markdown is stored in the database, providing a diffable source of truth. The editor presents a Typist view that renders the Markdown with tokens and controls for bold, italic, callouts, tables, etc. When you edit in Typist, changes are written back to Markdown.
* **Transclusion** – Include sections in docs using `::include{slug="…"}` or wiki‑style links like `![[section/price-policy]]`. Live includes render the most recent version of the section; snapshot includes lock to a specific version.
* **Real‑time collaboration** – Every doc and section is backed by a Yjs CRDT document. Multiple users can edit simultaneously without conflicts. Changes are merged automatically.
* **Versioning** – Publishing a section or doc creates a new version. Snapshots are stored for audit and rollback. You can always compare versions or restore an older one.

## Publishing

When a doc or section is ready to share, you publish it to an audience. The `Publication` model defines these audiences:

* **Only me** – Keeps the content private.
* **Specific users** – Share with a selected set of members (identified by membership IDs).
* **Groups** – Share with one or more groups. Groups can be based on person tags (e.g. engineers, admins).
* **Internal** – Visible to all internal users in the organization.
* **Clients** – Visible to client users but hidden from internal users.
* **Public** – Visible to anyone. When `showAsBlog` is true, the doc appears on the public blog at the provided slug.

The portal’s publish dialog (see `/portal/publish`) allows you to choose an audience, select users or groups, and optionally set a blog slug when publishing publicly.

## Backlinks & mentions

Every include, link or mention creates a record in the `Mention` or `EntityLink` tables. Editors expose a “backlinks” panel that lists all docs referencing a section, helping authors understand the impact of changes. Mention records also power the knowledge graph and search.