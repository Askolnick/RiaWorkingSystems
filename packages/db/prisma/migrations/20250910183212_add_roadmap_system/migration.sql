-- CreateTable
CREATE TABLE "public"."RoadmapItem" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "projectId" UUID,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "public" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoadmapItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RoadmapComment" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "roadmapItemId" UUID NOT NULL,
    "authorId" UUID,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoadmapComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoadmapItem_slug_key" ON "public"."RoadmapItem"("slug");

-- CreateIndex
CREATE INDEX "RoadmapItem_tenantId_status_idx" ON "public"."RoadmapItem"("tenantId", "status");

-- CreateIndex
CREATE INDEX "RoadmapItem_tenantId_public_idx" ON "public"."RoadmapItem"("tenantId", "public");

-- CreateIndex
CREATE INDEX "RoadmapComment_tenantId_roadmapItemId_createdAt_idx" ON "public"."RoadmapComment"("tenantId", "roadmapItemId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."RoadmapItem" ADD CONSTRAINT "RoadmapItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoadmapComment" ADD CONSTRAINT "RoadmapComment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoadmapComment" ADD CONSTRAINT "RoadmapComment_roadmapItemId_fkey" FOREIGN KEY ("roadmapItemId") REFERENCES "public"."RoadmapItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
