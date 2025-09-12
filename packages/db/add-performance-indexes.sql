-- Performance Indexes for RIA Management System
-- These indexes are added to improve query performance on commonly accessed fields

-- User model - frequently queried fields
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_user_tenant_active ON "User"("tenantId", "isActive");

-- Task model - common filters
CREATE INDEX IF NOT EXISTS idx_task_assignee ON "Task"("assigneeId", status);
CREATE INDEX IF NOT EXISTS idx_task_project_status ON "Task"("projectId", status);
CREATE INDEX IF NOT EXISTS idx_task_due_date ON "Task"("dueDate") WHERE "dueDate" IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_task_priority ON "Task"(priority, status);

-- Project model
CREATE INDEX IF NOT EXISTS idx_project_status ON "Project"(status);
CREATE INDEX IF NOT EXISTS idx_project_tenant_status ON "Project"("tenantId", status);

-- Invoice model - financial queries
CREATE INDEX IF NOT EXISTS idx_invoice_client ON "Invoice"("clientId", status);
CREATE INDEX IF NOT EXISTS idx_invoice_due ON "Invoice"("dueDate", status) WHERE status != 'paid';
CREATE INDEX IF NOT EXISTS idx_invoice_tenant_status ON "Invoice"("tenantId", status);

-- WikiPage model - document access
CREATE INDEX IF NOT EXISTS idx_wiki_slug ON "WikiPage"(slug);
CREATE INDEX IF NOT EXISTS idx_wiki_parent ON "WikiPage"("parentId") WHERE "parentId" IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wiki_published ON "WikiPage"("isPublished", "tenantId");

-- Message model - inbox queries
CREATE INDEX IF NOT EXISTS idx_message_recipient ON "Message"("recipientId", "readAt");
CREATE INDEX IF NOT EXISTS idx_message_sender ON "Message"("senderId", "createdAt");

-- EntityLink model - relationship queries
CREATE INDEX IF NOT EXISTS idx_entity_link_from ON "EntityLink"("fromType", "fromId");
CREATE INDEX IF NOT EXISTS idx_entity_link_to ON "EntityLink"("toType", "toId");
CREATE INDEX IF NOT EXISTS idx_entity_link_kind ON "EntityLink"(kind);

-- RoadmapItem model - product management
CREATE INDEX IF NOT EXISTS idx_roadmap_item_status ON "RoadmapItem"(status, priority);
CREATE INDEX IF NOT EXISTS idx_roadmap_item_release ON "RoadmapItem"("releaseId") WHERE "releaseId" IS NOT NULL;

-- Feedback model - customer feedback
CREATE INDEX IF NOT EXISTS idx_feedback_status ON "Feedback"(status, priority);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON "Feedback"("categoryId", status);

-- Employee model - HR queries
CREATE INDEX IF NOT EXISTS idx_employee_department ON "Employee"("departmentId", "isActive");
CREATE INDEX IF NOT EXISTS idx_employee_manager ON "Employee"("managerId") WHERE "managerId" IS NOT NULL;

-- Upload model - file management
CREATE INDEX IF NOT EXISTS idx_upload_folder ON "Upload"("folderId", "createdAt");
CREATE INDEX IF NOT EXISTS idx_upload_mime ON "Upload"("mimeType");

-- Campaign model - marketing
CREATE INDEX IF NOT EXISTS idx_campaign_status ON "Campaign"(status, type);
CREATE INDEX IF NOT EXISTS idx_campaign_schedule ON "Campaign"("scheduledAt") WHERE status = 'scheduled';

-- Product model - inventory
CREATE INDEX IF NOT EXISTS idx_product_sku ON "Product"(sku);
CREATE INDEX IF NOT EXISTS idx_product_category ON "Product"("categoryId", "isActive");

-- Partial indexes for soft deletes (where applicable)
CREATE INDEX IF NOT EXISTS idx_user_active ON "User"("tenantId") WHERE "isActive" = true;
CREATE INDEX IF NOT EXISTS idx_project_active ON "Project"("tenantId") WHERE status != 'archived';

-- Compound indexes for common join queries
CREATE INDEX IF NOT EXISTS idx_task_tenant_project ON "Task"("tenantId", "projectId");
CREATE INDEX IF NOT EXISTS idx_invoice_tenant_client ON "Invoice"("tenantId", "clientId");
CREATE INDEX IF NOT EXISTS idx_message_tenant_thread ON "Message"("tenantId", "threadId");

-- Text search indexes (if using PostgreSQL full-text search)
-- CREATE INDEX IF NOT EXISTS idx_wiki_search ON "WikiPage" USING gin(to_tsvector('english', title || ' ' || content));
-- CREATE INDEX IF NOT EXISTS idx_task_search ON "Task" USING gin(to_tsvector('english', title || ' ' || description));

-- Date range indexes for reporting
CREATE INDEX IF NOT EXISTS idx_invoice_date_range ON "Invoice"("createdAt", "tenantId");
CREATE INDEX IF NOT EXISTS idx_task_created_range ON "Task"("createdAt", "tenantId");

-- Performance monitoring indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON "AuditLog"("entityType", "entityId", "createdAt") WHERE "AuditLog" EXISTS;

ANALYZE; -- Update statistics after adding indexes