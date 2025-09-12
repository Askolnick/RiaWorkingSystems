# Email Module Drop‑In (React + TypeScript)

**Version:** 2025-09-11

This package drops into your existing React app (Tailwind + shadcn/ui assumed) and provides:
- Email UI (MessageList, ThreadView, Composer) with a unified **EmailPage**
- Actions: **Create Task from Email**, **Link to Project/Inventory/Order**, **Start Campaign**
- Protocol adapter for **JMAP** (preferred) with a simple fetch-based client
- **OpenPGP.js** integration stubs (optional E2EE)
- Campaign adapters for **Listmonk** or **Mautic**
- A linking model to store cross-references (e.g., email ↔ task) via injectable data adapters (e.g., Firestore)

> The code is dependency-light and framework-agnostic where possible. You wire your own auth, data layer, and router.

---

## Install

1) Copy the `src/email` folder into your codebase (or import as a package).
2) Install peer deps you don't already have:

```bash
npm i openpgp jmap-client # if using E2EE + a JMAP lib (or keep the bare fetch client)
# shadcn/ui + lucide-react + framer-motion assumed in your app already
```

3) Add routes. If using your `OptimizedAppPageRouter`, register:

```ts
// routes.tsx (example)
export const emailRoutes = [
  { path: "/comms/email", element: <EmailPage /> , title: "Email", icon: "Mail", roles: ["Staff","Manager"]},
  { path: "/comms/email/:threadId", element: <EmailPage /> , hidden: true },
];
```

4) Provide adapters (examples in `lib/adapters.examples.ts`):
- **AuthAdapter**: returns auth headers / tokens for JMAP server.
- **JMAPAdapter**: optionally replace the fetch client with an SDK.
- **DataAdapter**: create/read `mail_links`, create tasks, fetch people/orgs.
- **CampaignAdapter**: start Listmonk/Mautic campaigns.

5) Configure JMAP endpoint (see `hooks/useJMAP.ts`).

6) (Optional) Enable E2EE: fill in `lib/openpgp.ts` (key management, encrypt/decrypt).

---

## Linking Model

We use the RFC `Message-ID` as a stable key. In your DB, store docs like:

```ts
type MailLink = { messageId: string; type: "task"|"project"|"order"|"inventory"; refId: string; quote?: string; createdBy: string; createdAt: number }
```

Recommended collection: `mail_links` (or a subcollection under `messages`).

---

## UI Overview

- **MessageList**: left pane with folders/search; center pane with thread list; right pane shows **ThreadView**.
- **ThreadView**: messages, participants, attachments, security badges (E2EE), and actions (Reply/Forward/Create Task/Link/Start Campaign).
- **Composer**: full-screen dialog or drawer; supports drafts, attachments, and optional PGP encrypt/sign.
- **EmailPage**: orchestrates panes, state, and adapters via React context.

The components use shadcn/ui primitives where helpful. Styling assumes Tailwind.

---

## Security Notes

- All network calls go through your adapters; add CSRF, auth headers, and TLS.
- If enabling E2EE, **private keys should never leave the client**.
- Sanitize HTML when rendering emails (we include a very conservative sanitizer toggle).

---

## TODO hooks for your app

- Wire "Create Task" to your Tasks API; store back-links in `mail_links`.
- Wire People/Orgs lookups to your CRM collections.
- Decide on Listmonk vs Mautic and set base URLs + API keys in server-side proxies.

---

## License

MIT for this scaffolding. Note: If you copy significant code from GPL/AGPL projects, ensure license compliance.
