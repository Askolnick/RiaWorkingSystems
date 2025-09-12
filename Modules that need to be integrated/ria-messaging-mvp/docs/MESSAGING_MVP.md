# Omnichannel Messaging — MVP

This package gives you a unified inbox that aggregates internal chat, email and social messages into **Conversations**, with basic filters, assignment, status, tags and templates.

## What’s included
- **Prisma add-ons**: `Inbox`, `Conversation`, `ConversationParticipant`, `Message`, `Template`, `RoutingRule`.
- **Client SDK**: `@ria/messaging-client` (in-memory mock backend).
- **Integrations interfaces**: `@ria/integrations` with mock connectors (email/slack/social) you can replace with real ones.
- **UI**: `/portal/messaging` home (filters + list), `/:id` thread view, and `/settings` stubs.
- **Composer**: reply as chat or email; template button is stubbed.

## Wire-up notes
- Append `_messaging.prisma` to your schema and run migrations.
- Replace `createMockMessaging()` with a server adapter once your API is live.
- Use `RoutingRule` records to route new inbound messages into the right `Inbox` and tag/assign them.
- Add background jobs to poll connectors or receive webhooks (e.g., `/api/webhooks/email`, `/api/webhooks/slack`, `/api/webhooks/social`).

## Next steps (easy upgrades)
- SLA timers & auto-escalation; queue views like “Mine”, “Unassigned”, “Priority”.
- Templates with variables; signatures per inbox; customer context sidebar.
- OAuth connectors (Gmail/Outlook, Slack, X/IG/FB/LinkedIn) + webhook ingestion.
- Email threading via `Message.inReplyToId`/`externalId`; upload attachments using your Files package.
