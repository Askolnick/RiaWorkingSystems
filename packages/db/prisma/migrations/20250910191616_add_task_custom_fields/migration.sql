-- CreateEnum
CREATE TYPE "public"."CustomFieldType" AS ENUM ('text', 'number', 'boolean', 'date', 'select', 'multiselect', 'user', 'url');

-- CreateTable
CREATE TABLE "public"."TaskCustomField" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."CustomFieldType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "defaultValue" TEXT,
    "options" TEXT,
    "validation" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskCustomField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TaskCustomFieldValue" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "customFieldId" UUID NOT NULL,
    "value" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskCustomFieldValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaskCustomField_tenantId_isActive_sortOrder_idx" ON "public"."TaskCustomField"("tenantId", "isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "TaskCustomField_tenantId_key_key" ON "public"."TaskCustomField"("tenantId", "key");

-- CreateIndex
CREATE INDEX "TaskCustomFieldValue_tenantId_taskId_idx" ON "public"."TaskCustomFieldValue"("tenantId", "taskId");

-- CreateIndex
CREATE INDEX "TaskCustomFieldValue_tenantId_customFieldId_idx" ON "public"."TaskCustomFieldValue"("tenantId", "customFieldId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskCustomFieldValue_taskId_customFieldId_key" ON "public"."TaskCustomFieldValue"("taskId", "customFieldId");

-- AddForeignKey
ALTER TABLE "public"."TaskCustomField" ADD CONSTRAINT "TaskCustomField_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskCustomFieldValue" ADD CONSTRAINT "TaskCustomFieldValue_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskCustomFieldValue" ADD CONSTRAINT "TaskCustomFieldValue_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskCustomFieldValue" ADD CONSTRAINT "TaskCustomFieldValue_customFieldId_fkey" FOREIGN KEY ("customFieldId") REFERENCES "public"."TaskCustomField"("id") ON DELETE CASCADE ON UPDATE CASCADE;
