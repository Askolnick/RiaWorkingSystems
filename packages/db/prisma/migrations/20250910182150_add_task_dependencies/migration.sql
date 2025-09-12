-- CreateEnum
CREATE TYPE "public"."TaskDependencyType" AS ENUM ('FS', 'SS', 'FF', 'SF');

-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "rank" VARCHAR(64);

-- CreateTable
CREATE TABLE "public"."TaskDependency" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "predecessorId" UUID NOT NULL,
    "successorId" UUID NOT NULL,
    "type" "public"."TaskDependencyType" NOT NULL DEFAULT 'FS',
    "lagMinutes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskDependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DashboardLayout" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID,
    "name" TEXT NOT NULL DEFAULT 'default',
    "widgets" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardLayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaskDependency_tenantId_predecessorId_idx" ON "public"."TaskDependency"("tenantId", "predecessorId");

-- CreateIndex
CREATE INDEX "TaskDependency_tenantId_successorId_idx" ON "public"."TaskDependency"("tenantId", "successorId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskDependency_predecessorId_successorId_key" ON "public"."TaskDependency"("predecessorId", "successorId");

-- CreateIndex
CREATE INDEX "DashboardLayout_tenantId_userId_idx" ON "public"."DashboardLayout"("tenantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardLayout_tenantId_userId_name_key" ON "public"."DashboardLayout"("tenantId", "userId", "name");

-- CreateIndex
CREATE INDEX "Task_tenantId_status_rank_idx" ON "public"."Task"("tenantId", "status", "rank");

-- AddForeignKey
ALTER TABLE "public"."TaskDependency" ADD CONSTRAINT "TaskDependency_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskDependency" ADD CONSTRAINT "TaskDependency_predecessorId_fkey" FOREIGN KEY ("predecessorId") REFERENCES "public"."Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskDependency" ADD CONSTRAINT "TaskDependency_successorId_fkey" FOREIGN KEY ("successorId") REFERENCES "public"."Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DashboardLayout" ADD CONSTRAINT "DashboardLayout_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
