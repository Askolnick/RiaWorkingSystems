// -------------------- Core Types --------------------

export type RoadmapStatus = 'planning' | 'active' | 'paused' | 'completed' | 'cancelled' | 'archived';
export type RoadmapVisibility = 'public' | 'internal' | 'private';
export type ItemStatus = 'idea' | 'planned' | 'in_progress' | 'in_review' | 'completed' | 'cancelled' | 'on_hold';
export type ItemType = 'feature' | 'enhancement' | 'bug_fix' | 'research' | 'integration' | 'infrastructure' | 'maintenance' | 'epic';
export type ItemPriority = 'low' | 'medium' | 'high' | 'critical' | 'urgent';
export type RoadmapActivityType = 
  | 'item_created' 
  | 'item_updated' 
  | 'status_changed' 
  | 'priority_changed' 
  | 'target_date_changed' 
  | 'progress_updated' 
  | 'comment_added' 
  | 'vote_added' 
  | 'watcher_added' 
  | 'attachment_added' 
  | 'moved_to_release' 
  | 'moved_to_category';

export interface ProductRoadmap {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  
  // Status & Visibility
  status: RoadmapStatus;
  visibility: RoadmapVisibility;
  
  // Timeline
  startDate?: string;
  endDate?: string;
  
  // Configuration
  color?: string;
  icon?: string;
  
  // Settings
  allowVoting: boolean;
  allowComments: boolean;
  requireApproval: boolean;
  
  // Auto-generated fields
  slug: string;
  itemCount: number;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapItem {
  id: string;
  tenantId: string;
  roadmapId: string;
  parentId?: string;
  
  // Basic Info
  title: string;
  description?: string;
  type: ItemType;
  status: ItemStatus;
  priority: ItemPriority;
  
  // Timeline & Effort
  startDate?: string;
  targetDate?: string;
  completedAt?: string;
  estimatedEffort?: string;
  actualEffort?: string;
  
  // Progress
  progressPercentage: number;
  
  // Categorization
  categoryId?: string;
  releaseId?: string;
  tags: string[];
  
  // External Links
  externalUrl?: string;
  githubIssue?: string;
  jiraTicket?: string;
  figmaLink?: string;
  
  // Engagement
  upvotes: number;
  downvotes: number;
  viewCount: number;
  
  // Settings
  allowVoting: boolean;
  allowComments: boolean;
  isPublic: boolean;
  
  // Auto-generated
  slug: string;
  sortOrder: number;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapCategory {
  id: string;
  tenantId: string;
  roadmapId: string;
  
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  sortOrder: number;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapRelease {
  id: string;
  tenantId: string;
  roadmapId: string;
  
  name: string;
  description?: string;
  version?: string;
  
  // Timeline
  startDate?: string;
  targetDate?: string;
  releaseDate?: string;
  
  // Status
  isReleased: boolean;
  
  // Auto-generated
  slug: string;
  itemCount: number;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapReleaseNote {
  id: string;
  tenantId: string;
  releaseId: string;
  
  title: string;
  content: string;
  type: string; // feature, improvement, bugfix, breaking
  sortOrder: number;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapItemComment {
  id: string;
  tenantId: string;
  itemId: string;
  parentId?: string;
  
  content: string;
  isPrivate: boolean;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapItemVote {
  id: string;
  tenantId: string;
  itemId: string;
  userId: string;
  
  isUpvote: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapItemWatcher {
  id: string;
  tenantId: string;
  itemId: string;
  userId: string;
  
  // Notification preferences
  notifyOnStatusChange: boolean;
  notifyOnComments: boolean;
  notifyOnProgress: boolean;
  
  createdAt: string;
}

export interface RoadmapItemActivity {
  id: string;
  tenantId: string;
  itemId: string;
  
  type: RoadmapActivityType;
  title: string;
  details?: string;
  
  // Activity data (JSON for flexibility)
  oldValue?: any;
  newValue?: any;
  
  createdBy: string;
  createdAt: string;
}

export interface RoadmapItemAttachment {
  id: string;
  tenantId: string;
  itemId: string;
  
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  
  uploadedBy: string;
  uploadedAt: string;
}

export interface RoadmapContributor {
  id: string;
  tenantId: string;
  roadmapId: string;
  userId: string;
  
  role: string; // "owner", "admin", "contributor", "viewer"
  
  // Permissions
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canInvite: boolean;
  
  addedBy: string;
  addedAt: string;
}

export interface RoadmapFollower {
  id: string;
  tenantId: string;
  roadmapId: string;
  userId: string;
  
  // Notification preferences
  notifyOnNewItem: boolean;
  notifyOnRelease: boolean;
  notifyOnMilestone: boolean;
  emailNotifications: boolean;
  
  followedAt: string;
}

export interface RoadmapCustomField {
  id: string;
  tenantId: string;
  roadmapId: string;
  
  name: string;
  type: string; // "text", "number", "date", "select", "multiselect", "boolean", "url"
  
  // Configuration
  isRequired: boolean;
  options?: any; // For select/multiselect types
  
  // Display
  label?: string;
  placeholder?: string;
  helpText?: string;
  sortOrder: number;
  
  isActive: boolean;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapItemCustomValue {
  id: string;
  tenantId: string;
  itemId: string;
  fieldId: string;
  
  value: string;
  
  createdAt: string;
  updatedAt: string;
}

// -------------------- Extended Types with Relations --------------------

export interface ProductRoadmapWithRelations extends ProductRoadmap {
  items: RoadmapItem[];
  categories: RoadmapCategory[];
  releases: RoadmapRelease[];
  contributors: RoadmapContributor[];
  followers: RoadmapFollower[];
  customFields: RoadmapCustomField[];
  
  // Computed fields
  completedItemsCount: number;
  inProgressItemsCount: number;
  plannedItemsCount: number;
  totalUpvotes: number;
  activeContributorsCount: number;
  followerCount: number;
}

export interface RoadmapItemWithRelations extends RoadmapItem {
  category?: RoadmapCategory;
  release?: RoadmapRelease;
  parent?: RoadmapItem;
  children: RoadmapItem[];
  comments: RoadmapItemComment[];
  votes: RoadmapItemVote[];
  watchers: RoadmapItemWatcher[];
  activities: RoadmapItemActivity[];
  attachments: RoadmapItemAttachment[];
  customValues: RoadmapItemCustomValue[];
  
  // Computed fields
  userVote?: RoadmapItemVote;
  isWatching?: boolean;
  commentCount: number;
  voteScore: number; // upvotes - downvotes
  timeToComplete?: number; // days from start to completion
  isOverdue?: boolean;
  daysUntilTarget?: number;
}

export interface RoadmapReleaseWithRelations extends RoadmapRelease {
  items: RoadmapItem[];
  notes: RoadmapReleaseNote[];
  
  // Computed fields
  completedItemsCount: number;
  totalItemsCount: number;
  completionPercentage: number;
  averageProgress: number;
  highPriorityItemsCount: number;
  isOnTrack: boolean;
  daysUntilRelease?: number;
}

export interface RoadmapCategoryWithStats extends RoadmapCategory {
  items: RoadmapItem[];
  itemCount: number;
  completedItemsCount: number;
  completionPercentage: number;
  averagePriority: number;
  totalUpvotes: number;
  lastActivity?: string;
}

export interface RoadmapItemCommentWithRelations extends RoadmapItemComment {
  parent?: RoadmapItemComment;
  children: RoadmapItemComment[];
  authorName?: string;
  authorAvatar?: string;
  
  // Computed fields
  childrenCount: number;
  depth: number;
}

// -------------------- Create/Update Types --------------------

export interface CreateRoadmapData {
  name: string;
  description?: string;
  status?: RoadmapStatus;
  visibility?: RoadmapVisibility;
  startDate?: string;
  endDate?: string;
  color?: string;
  icon?: string;
  allowVoting?: boolean;
  allowComments?: boolean;
  requireApproval?: boolean;
}

export interface UpdateRoadmapData extends Partial<CreateRoadmapData> {
  itemCount?: number;
}

export interface CreateRoadmapItemData {
  roadmapId: string;
  title: string;
  description?: string;
  type?: ItemType;
  status?: ItemStatus;
  priority?: ItemPriority;
  parentId?: string;
  categoryId?: string;
  releaseId?: string;
  startDate?: string;
  targetDate?: string;
  estimatedEffort?: string;
  tags?: string[];
  externalUrl?: string;
  githubIssue?: string;
  jiraTicket?: string;
  figmaLink?: string;
  allowVoting?: boolean;
  allowComments?: boolean;
  isPublic?: boolean;
}

export interface UpdateRoadmapItemData extends Partial<CreateRoadmapItemData> {
  completedAt?: string;
  actualEffort?: string;
  progressPercentage?: number;
  upvotes?: number;
  downvotes?: number;
  viewCount?: number;
  sortOrder?: number;
}

export interface CreateRoadmapCategoryData {
  roadmapId: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  sortOrder?: number;
}

export interface UpdateRoadmapCategoryData extends Partial<Omit<CreateRoadmapCategoryData, 'roadmapId'>> {}

export interface CreateRoadmapReleaseData {
  roadmapId: string;
  name: string;
  description?: string;
  version?: string;
  startDate?: string;
  targetDate?: string;
}

export interface UpdateRoadmapReleaseData extends Partial<Omit<CreateRoadmapReleaseData, 'roadmapId'>> {
  releaseDate?: string;
  isReleased?: boolean;
  itemCount?: number;
}

export interface CreateRoadmapReleaseNoteData {
  releaseId: string;
  title: string;
  content: string;
  type?: string;
  sortOrder?: number;
}

export interface CreateRoadmapItemCommentData {
  itemId: string;
  content: string;
  parentId?: string;
  isPrivate?: boolean;
}

export interface CreateRoadmapContributorData {
  roadmapId: string;
  userId: string;
  role?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  canApprove?: boolean;
  canInvite?: boolean;
}

export interface UpdateRoadmapContributorData extends Partial<Omit<CreateRoadmapContributorData, 'roadmapId' | 'userId'>> {}

export interface CreateRoadmapFollowerData {
  roadmapId: string;
  notifyOnNewItem?: boolean;
  notifyOnRelease?: boolean;
  notifyOnMilestone?: boolean;
  emailNotifications?: boolean;
}

export interface CreateRoadmapCustomFieldData {
  roadmapId: string;
  name: string;
  type: string;
  isRequired?: boolean;
  options?: any;
  label?: string;
  placeholder?: string;
  helpText?: string;
  sortOrder?: number;
}

export interface UpdateRoadmapCustomFieldData extends Partial<Omit<CreateRoadmapCustomFieldData, 'roadmapId'>> {
  isActive?: boolean;
}

export interface CreateRoadmapItemCustomValueData {
  itemId: string;
  fieldId: string;
  value: string;
}

// -------------------- Filter/Search Types --------------------

export interface RoadmapFilters {
  status?: RoadmapStatus | RoadmapStatus[];
  visibility?: RoadmapVisibility | RoadmapVisibility[];
  createdBy?: string;
  startDate?: string;
  endDate?: string;
  hasItems?: boolean;
  search?: string;
}

export interface RoadmapItemFilters {
  roadmapId?: string;
  status?: ItemStatus | ItemStatus[];
  type?: ItemType | ItemType[];
  priority?: ItemPriority | ItemPriority[];
  categoryId?: string;
  releaseId?: string;
  parentId?: string;
  assignedTo?: string;
  createdBy?: string;
  startDate?: string;
  targetDate?: string;
  completedDate?: string;
  hasVotes?: boolean;
  hasComments?: boolean;
  tags?: string[];
  search?: string;
  isOverdue?: boolean;
  progressMin?: number;
  progressMax?: number;
}

export interface RoadmapSort {
  field: keyof ProductRoadmap | 'itemCount' | 'followerCount' | 'completionRate';
  direction: 'asc' | 'desc';
}

export interface RoadmapItemSort {
  field: keyof RoadmapItem | 'categoryName' | 'releaseName' | 'voteScore' | 'commentCount' | 'authorName';
  direction: 'asc' | 'desc';
}

// -------------------- Stats Types --------------------

export interface RoadmapStats {
  totalRoadmaps: number;
  activeRoadmaps: number;
  completedRoadmaps: number;
  totalItems: number;
  completedItems: number;
  inProgressItems: number;
  overdueItems: number;
  
  avgCompletionRate: number;
  avgItemsPerRoadmap: number;
  avgTimeToComplete: number; // days
  
  recentActivity: RoadmapItemActivity[];
  topContributors: Array<{
    userId: string;
    userName: string;
    contributionCount: number;
    roadmapsCount: number;
    itemsCreated: number;
    commentsCount: number;
  }>;
  
  statusDistribution: Array<{
    status: ItemStatus;
    count: number;
    percentage: number;
  }>;
  
  priorityDistribution: Array<{
    priority: ItemPriority;
    count: number;
    percentage: number;
  }>;
  
  typeDistribution: Array<{
    type: ItemType;
    count: number;
    percentage: number;
  }>;
  
  completionTrend: Array<{
    date: string;
    completed: number;
    created: number;
    completionRate: number;
  }>;
  
  upcomingDeadlines: RoadmapItem[];
  mostVotedItems: RoadmapItem[];
  recentlyCompletedItems: RoadmapItem[];
}

export interface RoadmapAnalytics {
  roadmapId: string;
  timeRange: {
    from: string;
    to: string;
  };
  
  // Progress metrics
  itemsCreated: number;
  itemsCompleted: number;
  itemsInProgress: number;
  completionRate: number;
  velocityTrend: Array<{
    week: string;
    itemsCompleted: number;
    storyPointsCompleted: number;
  }>;
  
  // Engagement metrics
  totalVotes: number;
  totalComments: number;
  activeUsers: number;
  newFollowers: number;
  engagementRate: number;
  
  // Performance metrics
  avgTimeToComplete: number;
  onTimeDeliveryRate: number;
  scopeChangeRate: number;
  
  // Category & Release breakdown
  categoryPerformance: Array<{
    categoryId: string;
    categoryName: string;
    itemsCount: number;
    completionRate: number;
    avgTimeToComplete: number;
  }>;
  
  releaseProgress: Array<{
    releaseId: string;
    releaseName: string;
    targetDate: string;
    completionRate: number;
    isOnTrack: boolean;
    riskLevel: 'low' | 'medium' | 'high';
  }>;
  
  // User engagement
  topContributors: Array<{
    userId: string;
    userName: string;
    itemsCreated: number;
    commentsCount: number;
    votesGiven: number;
    engagementScore: number;
  }>;
  
  // Predictive insights
  projectedCompletion: string;
  riskFactors: string[];
  recommendations: string[];
}

// -------------------- Bulk Operations --------------------

export interface BulkRoadmapItemAction {
  action: 'update_status' | 'update_priority' | 'assign_category' | 'assign_release' | 'delete' | 'archive';
  itemIds: string[];
  parameters?: {
    status?: ItemStatus;
    priority?: ItemPriority;
    categoryId?: string;
    releaseId?: string;
  };
}

export interface BulkRoadmapItemUpdate {
  itemIds: string[];
  updates: Partial<UpdateRoadmapItemData>;
}

// -------------------- Import/Export Types --------------------

export interface RoadmapExportOptions {
  format: 'json' | 'csv' | 'excel' | 'pdf';
  roadmapIds?: string[];
  includeItems: boolean;
  includeComments: boolean;
  includeVotes: boolean;
  includeAttachments: boolean;
  filters?: RoadmapItemFilters;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface RoadmapImportData {
  roadmap: Partial<CreateRoadmapData>;
  categories?: CreateRoadmapCategoryData[];
  releases?: CreateRoadmapReleaseData[];
  items: Array<CreateRoadmapItemData & {
    categoryName?: string;
    releaseName?: string;
    parentTitle?: string; // For hierarchical imports
  }>;
  customFields?: CreateRoadmapCustomFieldData[];
}

export interface RoadmapImportResult {
  success: boolean;
  roadmapId?: string;
  errors: string[];
  warnings: string[];
  imported: {
    roadmap: boolean;
    categoriesCount: number;
    releasesCount: number;
    itemsCount: number;
    customFieldsCount: number;
  };
  skipped: {
    categories: string[];
    releases: string[];
    items: string[];
  };
}

// -------------------- Integration Types --------------------

export interface RoadmapIntegration {
  id: string;
  tenantId: string;
  roadmapId: string;
  type: 'github' | 'jira' | 'trello' | 'asana' | 'slack' | 'teams';
  config: {
    apiKey?: string;
    repositoryUrl?: string;
    projectKey?: string;
    boardId?: string;
    workspaceId?: string;
    webhookUrl?: string;
    syncDirection: 'import' | 'export' | 'bidirectional';
    autoSync: boolean;
    syncFrequency?: 'hourly' | 'daily' | 'weekly';
    fieldMappings: Record<string, string>;
  };
  isActive: boolean;
  lastSyncAt?: string;
  lastSyncStatus?: 'success' | 'error' | 'partial';
  syncErrors?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapSyncResult {
  integrationId: string;
  syncType: 'full' | 'incremental';
  startedAt: string;
  completedAt?: string;
  status: 'running' | 'completed' | 'error' | 'cancelled';
  
  itemsProcessed: number;
  itemsCreated: number;
  itemsUpdated: number;
  itemsSkipped: number;
  itemsErrored: number;
  
  errors: Array<{
    itemId?: string;
    error: string;
    field?: string;
  }>;
  
  warnings: string[];
}

// -------------------- Template Types --------------------

export interface RoadmapTemplate {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  category: 'product' | 'engineering' | 'marketing' | 'general';
  
  template: {
    roadmap: Partial<CreateRoadmapData>;
    categories: CreateRoadmapCategoryData[];
    releases?: CreateRoadmapReleaseData[];
    items: CreateRoadmapItemData[];
    customFields?: CreateRoadmapCustomFieldData[];
  };
  
  isPublic: boolean;
  usageCount: number;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapTemplateApplication {
  templateId: string;
  roadmapName: string;
  roadmapDescription?: string;
  includeCategories: boolean;
  includeReleases: boolean;
  includeItems: boolean;
  includeCustomFields: boolean;
  
  // Date adjustments
  adjustDates: boolean;
  startDate?: string;
  dateOffset?: number; // days to shift all dates
}

// -------------------- Notification Types --------------------

export interface RoadmapNotification {
  id: string;
  tenantId: string;
  type: 'item_created' | 'item_updated' | 'item_completed' | 'release_created' | 'milestone_reached' | 'deadline_approaching' | 'comment_added' | 'vote_received';
  roadmapId?: string;
  itemId?: string;
  releaseId?: string;
  userId: string;
  
  title: string;
  message: string;
  data?: any;
  
  isRead: boolean;
  readAt?: string;
  
  createdAt: string;
}

export interface RoadmapWebhook {
  id: string;
  tenantId: string;
  roadmapId?: string; // null for all roadmaps
  
  url: string;
  secret?: string;
  events: RoadmapActivityType[];
  isActive: boolean;
  
  // Retry configuration
  retryAttempts: number;
  retryDelay: number; // seconds
  
  lastTriggeredAt?: string;
  lastStatus?: 'success' | 'failed';
  lastError?: string;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// -------------------- View & Dashboard Types --------------------

export interface RoadmapView {
  id: string;
  tenantId: string;
  roadmapId?: string; // null for global views
  
  name: string;
  description?: string;
  viewType: 'list' | 'board' | 'timeline' | 'calendar' | 'gantt';
  
  filters: RoadmapItemFilters;
  sorting: RoadmapItemSort[];
  groupBy?: string;
  
  // View configuration
  config: {
    showCompletedItems?: boolean;
    showSubItems?: boolean;
    showVotes?: boolean;
    showProgress?: boolean;
    showDates?: boolean;
    showAssignees?: boolean;
    showPriority?: boolean;
    showCategory?: boolean;
    showRelease?: boolean;
    columnsVisible?: string[];
    timelinePeriod?: 'week' | 'month' | 'quarter' | 'year';
  };
  
  isPublic: boolean;
  isDefault: boolean;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapDashboard {
  id: string;
  tenantId: string;
  
  name: string;
  description?: string;
  
  widgets: Array<{
    id: string;
    type: 'stats' | 'chart' | 'table' | 'timeline' | 'recent_activity' | 'top_items';
    title: string;
    position: { x: number; y: number; width: number; height: number };
    config: any;
  }>;
  
  refreshInterval?: number; // minutes
  isPublic: boolean;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}