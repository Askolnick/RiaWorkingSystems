-- CreateEnum
CREATE TYPE "public"."RoleName" AS ENUM ('super_admin', 'admin', 'moderator', 'member', 'guest', 'client');

-- CreateEnum
CREATE TYPE "public"."PermissionAction" AS ENUM ('read', 'write', 'update', 'delete', 'admin');

-- CreateEnum
CREATE TYPE "public"."LinkKind" AS ENUM ('references', 'duplicates', 'relates', 'depends_on', 'blocked_by');

-- CreateEnum
CREATE TYPE "public"."DocKind" AS ENUM ('wiki', 'spec', 'policy', 'howto', 'memo', 'brief');

-- CreateEnum
CREATE TYPE "public"."DocStatus" AS ENUM ('draft', 'review', 'scheduled', 'published', 'archived');

-- CreateEnum
CREATE TYPE "public"."PublishScope" AS ENUM ('private', 'users', 'groups', 'internal', 'clients', 'public');

-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('todo', 'doing', 'review', 'blocked', 'done', 'canceled');

-- CreateEnum
CREATE TYPE "public"."TaskPriority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "public"."MessageChannelKind" AS ENUM ('email', 'chat', 'social', 'sms', 'internal');

-- CreateTable
CREATE TABLE "public"."Tenant" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Membership" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "roleId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Group" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MembershipGroup" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "membershipId" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MembershipGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Role" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "name" "public"."RoleName" NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PermissionGrant" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "resource" TEXT NOT NULL,
    "action" "public"."PermissionAction" NOT NULL,
    "condition" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PermissionGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tag" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tagging" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "tagId" UUID NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tagging_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EntityLink" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "fromType" TEXT NOT NULL,
    "fromId" UUID NOT NULL,
    "toType" TEXT NOT NULL,
    "toId" UUID NOT NULL,
    "kind" "public"."LinkKind" NOT NULL DEFAULT 'relates',
    "note" TEXT,
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntityLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FileAsset" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "bucket" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sha256" TEXT,
    "uploaderId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Attachment" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "fileId" UUID NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MessageChannel" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "kind" "public"."MessageChannelKind" NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Thread" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "channelId" UUID NOT NULL,
    "subject" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "assigneeId" UUID,
    "labels" TEXT[],
    "lastAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "threadId" UUID NOT NULL,
    "authorId" UUID,
    "authorAddr" TEXT,
    "bodyText" TEXT NOT NULL,
    "bodyMd" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Task" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."TaskStatus" NOT NULL DEFAULT 'todo',
    "priority" "public"."TaskPriority" NOT NULL DEFAULT 'medium',
    "assigneeIds" TEXT[],
    "labels" TEXT[],
    "dueAt" TIMESTAMP(3),
    "createdBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TaskComment" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "authorId" UUID,
    "bodyMd" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."library_docs" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "kind" "public"."DocKind" NOT NULL DEFAULT 'wiki',
    "status" "public"."DocStatus" NOT NULL DEFAULT 'draft',
    "ownerId" UUID,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "bodyMd" TEXT,
    "bodyTypist" JSONB,

    CONSTRAINT "library_docs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."library_sections" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "bodyMd" TEXT,
    "bodyTypist" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."doc_section_links" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "docId" UUID NOT NULL,
    "sectionId" UUID NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "params" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doc_section_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."doc_publishes" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "docId" UUID NOT NULL,
    "scope" "public"."PublishScope" NOT NULL,
    "userIds" TEXT[],
    "groupIds" TEXT[],
    "urlPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doc_publishes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" UUID NOT NULL,
    "kind" TEXT NOT NULL,
    "payload" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Watch" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Watch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ActivityEvent" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "actorId" UUID,
    "entityType" TEXT NOT NULL,
    "entityId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SearchIndex" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" UUID NOT NULL,
    "title" TEXT,
    "snippet" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchIndex_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "public"."Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "Membership_tenantId_idx" ON "public"."Membership"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_tenantId_userId_key" ON "public"."Membership"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "Group_tenantId_name_idx" ON "public"."Group"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Group_tenantId_slug_key" ON "public"."Group"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "MembershipGroup_tenantId_groupId_idx" ON "public"."MembershipGroup"("tenantId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "MembershipGroup_membershipId_groupId_key" ON "public"."MembershipGroup"("membershipId", "groupId");

-- CreateIndex
CREATE INDEX "Role_tenantId_idx" ON "public"."Role"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_tenantId_name_key" ON "public"."Role"("tenantId", "name");

-- CreateIndex
CREATE INDEX "PermissionGrant_tenantId_resource_action_idx" ON "public"."PermissionGrant"("tenantId", "resource", "action");

-- CreateIndex
CREATE UNIQUE INDEX "PermissionGrant_roleId_resource_action_key" ON "public"."PermissionGrant"("roleId", "resource", "action");

-- CreateIndex
CREATE INDEX "Tag_tenantId_idx" ON "public"."Tag"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_tenantId_label_key" ON "public"."Tag"("tenantId", "label");

-- CreateIndex
CREATE INDEX "Tagging_tenantId_entityType_entityId_idx" ON "public"."Tagging"("tenantId", "entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Tagging_tenantId_tagId_entityType_entityId_key" ON "public"."Tagging"("tenantId", "tagId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "EntityLink_tenantId_fromType_fromId_idx" ON "public"."EntityLink"("tenantId", "fromType", "fromId");

-- CreateIndex
CREATE INDEX "EntityLink_tenantId_toType_toId_idx" ON "public"."EntityLink"("tenantId", "toType", "toId");

-- CreateIndex
CREATE INDEX "EntityLink_tenantId_kind_idx" ON "public"."EntityLink"("tenantId", "kind");

-- CreateIndex
CREATE INDEX "FileAsset_tenantId_createdAt_idx" ON "public"."FileAsset"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "FileAsset_tenantId_objectKey_idx" ON "public"."FileAsset"("tenantId", "objectKey");

-- CreateIndex
CREATE INDEX "Attachment_tenantId_entityType_entityId_idx" ON "public"."Attachment"("tenantId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "MessageChannel_tenantId_kind_idx" ON "public"."MessageChannel"("tenantId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "MessageChannel_tenantId_kind_address_key" ON "public"."MessageChannel"("tenantId", "kind", "address");

-- CreateIndex
CREATE INDEX "Thread_tenantId_lastAt_idx" ON "public"."Thread"("tenantId", "lastAt");

-- CreateIndex
CREATE INDEX "Thread_tenantId_status_idx" ON "public"."Thread"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Thread_tenantId_assigneeId_idx" ON "public"."Thread"("tenantId", "assigneeId");

-- CreateIndex
CREATE INDEX "thread_tenant_idx" ON "public"."Thread"("tenantId");

-- CreateIndex
CREATE INDEX "Message_tenantId_threadId_sentAt_idx" ON "public"."Message"("tenantId", "threadId", "sentAt");

-- CreateIndex
CREATE INDEX "Task_tenantId_status_priority_idx" ON "public"."Task"("tenantId", "status", "priority");

-- CreateIndex
CREATE INDEX "Task_tenantId_updatedAt_idx" ON "public"."Task"("tenantId", "updatedAt");

-- CreateIndex
CREATE INDEX "Task_tenantId_dueAt_idx" ON "public"."Task"("tenantId", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "Task_tenantId_number_key" ON "public"."Task"("tenantId", "number");

-- CreateIndex
CREATE INDEX "TaskComment_tenantId_taskId_createdAt_idx" ON "public"."TaskComment"("tenantId", "taskId", "createdAt");

-- CreateIndex
CREATE INDEX "library_docs_tenantId_status_idx" ON "public"."library_docs"("tenantId", "status");

-- CreateIndex
CREATE INDEX "library_docs_tenantId_kind_idx" ON "public"."library_docs"("tenantId", "kind");

-- CreateIndex
CREATE INDEX "library_docs_tenantId_updatedAt_idx" ON "public"."library_docs"("tenantId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "library_docs_tenantId_slug_key" ON "public"."library_docs"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "library_sections_tenantId_name_idx" ON "public"."library_sections"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "library_sections_tenantId_name_version_key" ON "public"."library_sections"("tenantId", "name", "version");

-- CreateIndex
CREATE INDEX "doc_section_links_tenantId_docId_position_idx" ON "public"."doc_section_links"("tenantId", "docId", "position");

-- CreateIndex
CREATE INDEX "doc_publishes_tenantId_scope_idx" ON "public"."doc_publishes"("tenantId", "scope");

-- CreateIndex
CREATE INDEX "Notification_tenantId_userId_createdAt_idx" ON "public"."Notification"("tenantId", "userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_tenantId_entityType_entityId_idx" ON "public"."Notification"("tenantId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "Watch_tenantId_entityType_entityId_idx" ON "public"."Watch"("tenantId", "entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Watch_tenantId_userId_entityType_entityId_key" ON "public"."Watch"("tenantId", "userId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "ActivityEvent_tenantId_entityType_entityId_createdAt_idx" ON "public"."ActivityEvent"("tenantId", "entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "SearchIndex_tenantId_updatedAt_idx" ON "public"."SearchIndex"("tenantId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SearchIndex_tenantId_entityType_entityId_key" ON "public"."SearchIndex"("tenantId", "entityType", "entityId");

-- AddForeignKey
ALTER TABLE "public"."Membership" ADD CONSTRAINT "Membership_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Membership" ADD CONSTRAINT "Membership_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Group" ADD CONSTRAINT "Group_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MembershipGroup" ADD CONSTRAINT "MembershipGroup_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MembershipGroup" ADD CONSTRAINT "MembershipGroup_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "public"."Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MembershipGroup" ADD CONSTRAINT "MembershipGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Role" ADD CONSTRAINT "Role_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PermissionGrant" ADD CONSTRAINT "PermissionGrant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PermissionGrant" ADD CONSTRAINT "PermissionGrant_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Tag" ADD CONSTRAINT "Tag_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Tagging" ADD CONSTRAINT "Tagging_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Tagging" ADD CONSTRAINT "Tagging_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityLink" ADD CONSTRAINT "EntityLink_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FileAsset" ADD CONSTRAINT "FileAsset_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "public"."FileAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MessageChannel" ADD CONSTRAINT "MessageChannel_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Thread" ADD CONSTRAINT "Thread_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Thread" ADD CONSTRAINT "Thread_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "public"."MessageChannel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "public"."Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskComment" ADD CONSTRAINT "TaskComment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskComment" ADD CONSTRAINT "TaskComment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."library_docs" ADD CONSTRAINT "library_docs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."library_sections" ADD CONSTRAINT "library_sections_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."doc_section_links" ADD CONSTRAINT "doc_section_links_docId_fkey" FOREIGN KEY ("docId") REFERENCES "public"."library_docs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."doc_section_links" ADD CONSTRAINT "doc_section_links_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."library_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."doc_section_links" ADD CONSTRAINT "doc_section_links_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."doc_publishes" ADD CONSTRAINT "doc_publishes_docId_fkey" FOREIGN KEY ("docId") REFERENCES "public"."library_docs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."doc_publishes" ADD CONSTRAINT "doc_publishes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Watch" ADD CONSTRAINT "Watch_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Watch" ADD CONSTRAINT "Watch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ActivityEvent" ADD CONSTRAINT "ActivityEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ActivityEvent" ADD CONSTRAINT "ActivityEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SearchIndex" ADD CONSTRAINT "SearchIndex_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
