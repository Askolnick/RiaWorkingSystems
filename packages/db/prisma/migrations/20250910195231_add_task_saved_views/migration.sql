-- CreateTable
CREATE TABLE "public"."TaskSavedView" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "viewType" TEXT NOT NULL,
    "filters" TEXT NOT NULL,
    "sorting" TEXT NOT NULL,
    "groupBy" TEXT,
    "columns" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskSavedView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaskSavedView_tenantId_createdBy_idx" ON "public"."TaskSavedView"("tenantId", "createdBy");

-- CreateIndex
CREATE INDEX "TaskSavedView_tenantId_isDefault_idx" ON "public"."TaskSavedView"("tenantId", "isDefault");

-- CreateIndex
CREATE INDEX "TaskSavedView_tenantId_isShared_idx" ON "public"."TaskSavedView"("tenantId", "isShared");

-- CreateIndex
CREATE UNIQUE INDEX "TaskSavedView_tenantId_name_key" ON "public"."TaskSavedView"("tenantId", "name");

-- AddForeignKey
ALTER TABLE "public"."TaskSavedView" ADD CONSTRAINT "TaskSavedView_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskSavedView" ADD CONSTRAINT "TaskSavedView_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
