// -------------------- Core Types --------------------

export type FeedbackType = 
  | 'suggestion' 
  | 'bug_report' 
  | 'feature_request' 
  | 'complaint' 
  | 'compliment' 
  | 'general' 
  | 'support' 
  | 'question';

export type FeedbackStatus = 
  | 'submitted' 
  | 'acknowledged' 
  | 'in_review' 
  | 'planned' 
  | 'in_progress' 
  | 'implemented' 
  | 'rejected' 
  | 'on_hold' 
  | 'duplicate' 
  | 'archived';

export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical' | 'urgent';
export type FeedbackSource = 
  | 'web_form' 
  | 'email' 
  | 'phone' 
  | 'chat' 
  | 'survey' 
  | 'social_media' 
  | 'app' 
  | 'api' 
  | 'import';

export type FeedbackSentiment = 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';

export type FeedbackActivityType = 
  | 'created'
  | 'status_changed'
  | 'priority_changed'
  | 'assigned'
  | 'unassigned'
  | 'commented'
  | 'voted'
  | 'linked'
  | 'unlinked'
  | 'category_changed'
  | 'resolution_added'
  | 'tagged'
  | 'followed'
  | 'unfollowed'
  | 'duplicated'
  | 'archived'
  | 'restored';

export interface Feedback {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  
  // Classification
  type: FeedbackType;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  source: FeedbackSource;
  
  // Sentiment Analysis
  sentiment?: FeedbackSentiment;
  sentimentScore?: number; // -1.00 to 1.00
  sentimentConfidence?: number; // 0.00 to 1.00
  
  // Contact Information
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactCompany?: string;
  userId?: string; // If authenticated user
  
  // Categorization
  categoryId?: string;
  subcategoryId?: string;
  tags: string[];
  
  // Product/Feature Context
  productArea?: string; // Which part of the product
  featureContext?: string; // Specific feature
  pageUrl?: string;
  userAgent?: string;
  browserInfo?: any; // Browser/device information
  
  // Urgency & Impact
  urgency?: string; // low, medium, high, critical
  businessImpact?: string; // low, medium, high
  customerImpact?: string; // Estimated number of affected customers
  
  // Internal Processing
  assignedTo?: string;
  assignedAt?: string;
  estimatedEffort?: string; // hours, days, weeks
  actualEffort?: string;
  
  // Resolution
  resolution?: string;
  resolutionType?: string; // implemented, rejected, duplicate, etc.
  resolvedAt?: string;
  resolvedBy?: string;
  
  // External References
  issueNumber?: string; // Internal issue tracking number
  externalId?: string; // External system ID (Jira, GitHub, etc.)
  externalUrl?: string;
  
  // Voting & Engagement
  upvotes: number;
  downvotes: number;
  viewCount: number;
  followerCount: number;
  
  // Settings
  isPublic: boolean;
  allowVoting: boolean;
  allowComments: boolean;
  isArchived: boolean;
  
  // Auto-generated
  slug: string;
  referenceNumber: string; // Human-friendly reference like FB-2024-001
  
  // Metadata
  submittedBy?: string;
  createdAt: string;
  updatedAt: string;
  lastActivity: string;
}

export interface FeedbackCategory {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  
  // Visual
  color?: string;
  icon?: string;
  
  // Settings
  isActive: boolean;
  sortOrder: number;
  
  // Auto-assignment rules
  autoAssignTo?: string;
  defaultPriority: FeedbackPriority;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackSubcategory {
  id: string;
  tenantId: string;
  categoryId: string;
  name: string;
  description?: string;
  
  // Settings
  isActive: boolean;
  sortOrder: number;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackComment {
  id: string;
  tenantId: string;
  feedbackId: string;
  parentId?: string;
  
  content: string;
  isPrivate: boolean; // Internal team comments
  isResolution: boolean; // Is this a resolution comment?
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackVote {
  id: string;
  tenantId: string;
  feedbackId: string;
  userId: string;
  
  isUpvote: boolean; // true for upvote, false for downvote
  
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackAttachment {
  id: string;
  tenantId: string;
  feedbackId: string;
  
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  
  // File metadata
  width?: number;
  height?: number;
  duration?: number; // For video/audio
  
  uploadedBy: string;
  uploadedAt: string;
}

export interface FeedbackActivity {
  id: string;
  tenantId: string;
  feedbackId: string;
  
  type: FeedbackActivityType;
  title: string;
  description?: string;
  
  // Activity data
  oldValue?: any;
  newValue?: any;
  metadata?: any;
  
  createdBy: string;
  createdAt: string;
}

export interface FeedbackFollower {
  id: string;
  tenantId: string;
  feedbackId: string;
  userId: string;
  
  // Notification preferences
  notifyOnStatusChange: boolean;
  notifyOnComments: boolean;
  notifyOnAssignment: boolean;
  notifyOnResolution: boolean;
  emailNotifications: boolean;
  
  followedAt: string;
}

export interface FeedbackLink {
  id: string;
  tenantId: string;
  sourceFeedbackId: string;
  linkedFeedbackId: string;
  
  linkType: string; // duplicate, related, blocks, blocked_by, parent, child
  description?: string;
  
  createdBy: string;
  createdAt: string;
}

export interface FeedbackCustomField {
  id: string;
  tenantId: string;
  
  name: string;
  type: string; // text, number, date, select, multiselect, boolean, url
  
  // Configuration
  isRequired: boolean;
  options?: any; // For select/multiselect types
  
  // Display
  label?: string;
  placeholder?: string;
  helpText?: string;
  sortOrder: number;
  
  // Visibility
  isActive: boolean;
  showInList: boolean;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackCustomValue {
  id: string;
  tenantId: string;
  feedbackId: string;
  fieldId: string;
  
  value: string;
  
  createdAt: string;
  updatedAt: string;
}

// -------------------- Extended Types with Relations --------------------

export interface FeedbackWithRelations extends Feedback {
  category?: FeedbackCategory;
  subcategory?: FeedbackSubcategory;
  user?: {
    id: string;
    displayName: string;
    email: string;
    avatarUrl?: string;
  };
  submitter?: {
    id: string;
    displayName: string;
    email: string;
  };
  assignee?: {
    id: string;
    displayName: string;
    email: string;
    avatarUrl?: string;
  };
  resolver?: {
    id: string;
    displayName: string;
    email: string;
  };
  
  comments: FeedbackComment[];
  votes: FeedbackVote[];
  attachments: FeedbackAttachment[];
  activities: FeedbackActivity[];
  followers: FeedbackFollower[];
  linkedItems: FeedbackLink[];
  linkSources: FeedbackLink[];
  customValues: FeedbackCustomValue[];
  
  // Computed fields
  userVote?: FeedbackVote;
  isFollowing?: boolean;
  commentCount: number;
  voteScore: number; // upvotes - downvotes
  timeToResolution?: number; // days from creation to resolution
  isOverdue?: boolean;
  daysOpen: number;
  timeToFirstResponse?: number; // hours
  responseTime?: number; // average response time in hours
  escalationLevel: 'none' | 'low' | 'medium' | 'high';
}

export interface FeedbackCategoryWithStats extends FeedbackCategory {
  feedbackCount: number;
  openFeedback: number;
  closedFeedback: number;
  averageResolutionTime: number; // days
  satisfactionScore?: number; // 1-5 stars
  trendsUp: boolean; // More feedback this period vs last
  
  subcategories: FeedbackSubcategory[];
  
  // Priority breakdown
  priorityBreakdown: {
    low: number;
    medium: number;
    high: number;
    critical: number;
    urgent: number;
  };
  
  // Type breakdown
  typeBreakdown: {
    suggestion: number;
    bug_report: number;
    feature_request: number;
    complaint: number;
    compliment: number;
    general: number;
    support: number;
    question: number;
  };
}

export interface FeedbackCommentWithDetails extends FeedbackComment {
  author: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  parent?: FeedbackComment;
  replies: FeedbackComment[];
  
  // Computed fields
  replyCount: number;
  depth: number;
  canEdit: boolean;
  canDelete: boolean;
  isFromCustomer: boolean;
  isFromTeam: boolean;
}

// -------------------- Create/Update Types --------------------

export interface CreateFeedbackData {
  title: string;
  description: string;
  type?: FeedbackType;
  priority?: FeedbackPriority;
  source?: FeedbackSource;
  
  // Contact Information (for anonymous submissions)
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactCompany?: string;
  
  // Categorization
  categoryId?: string;
  subcategoryId?: string;
  tags?: string[];
  
  // Product Context
  productArea?: string;
  featureContext?: string;
  pageUrl?: string;
  userAgent?: string;
  browserInfo?: any;
  
  // Impact Assessment
  urgency?: string;
  businessImpact?: string;
  customerImpact?: string;
  
  // External References
  externalId?: string;
  externalUrl?: string;
  
  // Settings
  isPublic?: boolean;
  allowVoting?: boolean;
  allowComments?: boolean;
}

export interface UpdateFeedbackData extends Partial<CreateFeedbackData> {
  status?: FeedbackStatus;
  assignedTo?: string;
  estimatedEffort?: string;
  actualEffort?: string;
  resolution?: string;
  resolutionType?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  issueNumber?: string;
  sentiment?: FeedbackSentiment;
  sentimentScore?: number;
  sentimentConfidence?: number;
  isArchived?: boolean;
}

export interface CreateFeedbackCategoryData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  sortOrder?: number;
  autoAssignTo?: string;
  defaultPriority?: FeedbackPriority;
  isActive?: boolean;
}

export interface UpdateFeedbackCategoryData extends Partial<CreateFeedbackCategoryData> {}

export interface CreateFeedbackSubcategoryData {
  categoryId: string;
  name: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateFeedbackSubcategoryData extends Partial<Omit<CreateFeedbackSubcategoryData, 'categoryId'>> {}

export interface CreateFeedbackCommentData {
  feedbackId: string;
  content: string;
  parentId?: string;
  isPrivate?: boolean;
  isResolution?: boolean;
}

export interface CreateFeedbackFollowerData {
  feedbackId: string;
  notifyOnStatusChange?: boolean;
  notifyOnComments?: boolean;
  notifyOnAssignment?: boolean;
  notifyOnResolution?: boolean;
  emailNotifications?: boolean;
}

export interface UpdateFeedbackFollowerData extends Partial<Omit<CreateFeedbackFollowerData, 'feedbackId'>> {}

export interface CreateFeedbackLinkData {
  sourceFeedbackId: string;
  linkedFeedbackId: string;
  linkType: string;
  description?: string;
}

export interface CreateFeedbackCustomFieldData {
  name: string;
  type: string;
  isRequired?: boolean;
  options?: any;
  label?: string;
  placeholder?: string;
  helpText?: string;
  sortOrder?: number;
  showInList?: boolean;
}

export interface UpdateFeedbackCustomFieldData extends Partial<CreateFeedbackCustomFieldData> {
  isActive?: boolean;
}

export interface CreateFeedbackCustomValueData {
  feedbackId: string;
  fieldId: string;
  value: string;
}

// -------------------- Filter/Search Types --------------------

export interface FeedbackFilters {
  status?: FeedbackStatus | FeedbackStatus[];
  type?: FeedbackType | FeedbackType[];
  priority?: FeedbackPriority | FeedbackPriority[];
  source?: FeedbackSource | FeedbackSource[];
  sentiment?: FeedbackSentiment | FeedbackSentiment[];
  categoryId?: string;
  subcategoryId?: string;
  assignedTo?: string;
  submittedBy?: string;
  userId?: string;
  contactEmail?: string;
  dateFrom?: string;
  dateTo?: string;
  resolvedFrom?: string;
  resolvedTo?: string;
  isPublic?: boolean;
  isArchived?: boolean;
  hasVotes?: boolean;
  hasComments?: boolean;
  hasAttachments?: boolean;
  tags?: string[];
  search?: string;
  productArea?: string;
  featureContext?: string;
  urgency?: string;
  businessImpact?: string;
  isOverdue?: boolean;
  sentimentScore?: {
    min?: number;
    max?: number;
  };
}

export interface FeedbackSort {
  field: keyof Feedback | 'categoryName' | 'assigneeName' | 'voteScore' | 'commentCount' | 'daysOpen';
  direction: 'asc' | 'desc';
}

// -------------------- Analytics Types --------------------

export interface FeedbackStats {
  totalFeedback: number;
  openFeedback: number;
  closedFeedback: number;
  averageResolutionTime: number; // days
  averageResponseTime: number; // hours
  satisfactionScore: number; // 1-5 stars
  
  // Trends (vs previous period)
  feedbackTrend: number; // percentage change
  resolutionTimeTrend: number;
  satisfactionTrend: number;
  
  // Distribution
  statusDistribution: Array<{
    status: FeedbackStatus;
    count: number;
    percentage: number;
  }>;
  
  typeDistribution: Array<{
    type: FeedbackType;
    count: number;
    percentage: number;
  }>;
  
  priorityDistribution: Array<{
    priority: FeedbackPriority;
    count: number;
    percentage: number;
  }>;
  
  sourceDistribution: Array<{
    source: FeedbackSource;
    count: number;
    percentage: number;
  }>;
  
  sentimentDistribution: Array<{
    sentiment: FeedbackSentiment;
    count: number;
    percentage: number;
    averageScore: number;
  }>;
  
  // Top categories
  topCategories: Array<{
    category: FeedbackCategory;
    count: number;
    resolutionTime: number;
    satisfaction: number;
  }>;
  
  // Team performance
  teamPerformance: Array<{
    userId: string;
    userName: string;
    assignedCount: number;
    resolvedCount: number;
    averageResolutionTime: number;
    satisfactionScore: number;
  }>;
  
  // Recent activity
  recentFeedback: Feedback[];
  urgentFeedback: Feedback[];
  overdueFeeback: Feedback[];
  
  // Time series
  timeline: Array<{
    date: string;
    submitted: number;
    resolved: number;
    avgResolutionTime: number;
    satisfaction: number;
  }>;
}

export interface FeedbackAnalytics {
  tenantId: string;
  timeRange: {
    from: string;
    to: string;
  };
  
  // Volume metrics
  totalSubmissions: number;
  totalResolutions: number;
  submissionRate: number; // per day
  resolutionRate: number; // per day
  backlogSize: number;
  
  // Performance metrics
  averageResolutionTime: number; // days
  medianResolutionTime: number; // days
  averageFirstResponseTime: number; // hours
  resolutionSLA: {
    target: number; // days
    metPercentage: number;
    missedCount: number;
  };
  
  // Quality metrics
  customerSatisfaction: {
    averageRating: number;
    totalRatings: number;
    distribution: Record<number, number>; // 1-5 stars
  };
  
  resolutionQuality: {
    implementedRate: number;
    rejectedRate: number;
    duplicateRate: number;
    reopenRate: number;
  };
  
  // Engagement metrics
  votingActivity: {
    totalVotes: number;
    averageVotesPerFeedback: number;
    mostVotedFeedback: Feedback[];
  };
  
  commentActivity: {
    totalComments: number;
    averageCommentsPerFeedback: number;
    responseRate: number; // percentage of feedback with team responses
  };
  
  // Product insights
  productAreas: Array<{
    area: string;
    feedbackCount: number;
    avgSentiment: number;
    commonIssues: string[];
    improvementSuggestions: number;
  }>;
  
  featureRequests: Array<{
    feature: string;
    requestCount: number;
    votes: number;
    estimatedEffort: string;
    businessValue: 'low' | 'medium' | 'high';
  }>;
  
  // Channel analysis
  channelPerformance: Array<{
    source: FeedbackSource;
    volume: number;
    resolutionTime: number;
    satisfaction: number;
    conversionRate?: number; // for leads/prospects
  }>;
  
  // Predictive insights
  trends: {
    volumeTrend: 'increasing' | 'decreasing' | 'stable';
    sentimentTrend: 'improving' | 'declining' | 'stable';
    complexityTrend: 'increasing' | 'decreasing' | 'stable';
  };
  
  forecasts: {
    expectedVolume: number; // next month
    resourceNeeds: number; // additional team members needed
    riskAreas: string[]; // areas requiring attention
  };
  
  // Recommendations
  actionItems: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    description: string;
    impact: string;
    effort: string;
  }>;
}

// -------------------- Workflow Types --------------------

export interface FeedbackWorkflow {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  
  // Trigger conditions
  triggers: Array<{
    type: 'submission' | 'status_change' | 'assignment' | 'time_based' | 'priority_change';
    conditions: any;
  }>;
  
  // Workflow steps
  steps: Array<{
    id: string;
    type: 'notify' | 'assign' | 'update_status' | 'add_comment' | 'create_task' | 'send_email';
    config: any;
    conditions?: any;
    delay?: number; // minutes
  }>;
  
  isActive: boolean;
  executionCount: number;
  lastExecuted?: string;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackNotification {
  id: string;
  tenantId: string;
  type: 'new_feedback' | 'status_change' | 'assignment' | 'resolution' | 'comment' | 'vote' | 'escalation';
  feedbackId: string;
  userId: string;
  
  title: string;
  message: string;
  data?: any;
  
  isRead: boolean;
  readAt?: string;
  
  // Delivery channels
  inApp: boolean;
  email: boolean;
  push: boolean;
  
  createdAt: string;
}

// -------------------- Integration Types --------------------

export interface FeedbackIntegration {
  id: string;
  tenantId: string;
  type: 'jira' | 'github' | 'trello' | 'asana' | 'slack' | 'teams' | 'zendesk' | 'salesforce';
  
  config: {
    apiKey?: string;
    projectKey?: string;
    boardId?: string;
    repositoryUrl?: string;
    webhookUrl?: string;
    fieldMappings: Record<string, string>;
    syncDirection: 'import' | 'export' | 'bidirectional';
    autoSync: boolean;
  };
  
  isActive: boolean;
  lastSyncAt?: string;
  syncErrors?: string[];
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackSyncResult {
  integrationId: string;
  syncType: 'full' | 'incremental';
  direction: 'import' | 'export';
  
  itemsProcessed: number;
  itemsCreated: number;
  itemsUpdated: number;
  itemsSkipped: number;
  itemsErrored: number;
  
  errors: Array<{
    itemId?: string;
    error: string;
    details?: any;
  }>;
  
  startedAt: string;
  completedAt: string;
  duration: number; // seconds
}

// -------------------- Reporting Types --------------------

export interface FeedbackReport {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  
  // Report configuration
  type: 'summary' | 'detailed' | 'performance' | 'satisfaction' | 'trends';
  filters: FeedbackFilters;
  timeRange: {
    from: string;
    to: string;
    period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  };
  
  // Visualization
  charts: Array<{
    type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
    title: string;
    data: any[];
  }>;
  
  // Schedule
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    format: 'email' | 'pdf' | 'csv';
  };
  
  isPublic: boolean;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastGenerated?: string;
}

// -------------------- Bulk Operations --------------------

export interface BulkFeedbackAction {
  action: 'update_status' | 'assign' | 'update_priority' | 'add_tags' | 'archive' | 'delete' | 'export';
  feedbackIds: string[];
  parameters?: {
    status?: FeedbackStatus;
    assignedTo?: string;
    priority?: FeedbackPriority;
    tags?: string[];
    archiveReason?: string;
  };
}

export interface BulkFeedbackResult {
  totalItems: number;
  successfulItems: number;
  failedItems: number;
  errors: Array<{
    feedbackId: string;
    error: string;
  }>;
  skippedItems: Array<{
    feedbackId: string;
    reason: string;
  }>;
}

// -------------------- Import/Export Types --------------------

export interface FeedbackImportData {
  feedback: Array<Partial<CreateFeedbackData>>;
  categories?: Array<CreateFeedbackCategoryData>;
  customFields?: Array<CreateFeedbackCustomFieldData>;
}

export interface FeedbackImportResult {
  success: boolean;
  imported: {
    feedback: number;
    categories: number;
    customFields: number;
  };
  failed: {
    feedback: Array<{ data: any; error: string }>;
    categories: Array<{ data: any; error: string }>;
    customFields: Array<{ data: any; error: string }>;
  };
  warnings: string[];
}

export interface FeedbackExportOptions {
  format: 'csv' | 'excel' | 'json' | 'pdf';
  feedbackIds?: string[];
  includeComments: boolean;
  includeAttachments: boolean;
  includeActivities: boolean;
  filters?: FeedbackFilters;
  dateRange?: {
    from: string;
    to: string;
  };
}

// -------------------- Public API Types --------------------

export interface PublicFeedbackForm {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  
  // Form configuration
  fields: Array<{
    id: string;
    type: string;
    label: string;
    placeholder?: string;
    isRequired: boolean;
    options?: string[];
    validation?: any;
  }>;
  
  // Appearance
  theme: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    logoUrl?: string;
  };
  
  // Settings
  isActive: boolean;
  requireEmail: boolean;
  allowAnonymous: boolean;
  autoAssignCategory?: string;
  thankYouMessage: string;
  redirectUrl?: string;
  
  // Analytics
  submissionCount: number;
  conversionRate: number;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicFeedbackSubmission {
  formId: string;
  data: Record<string, any>;
  browserInfo?: any;
  source?: string;
  referrer?: string;
}

// -------------------- Widget Types --------------------

export interface FeedbackWidget {
  id: string;
  tenantId: string;
  name: string;
  
  // Widget type
  type: 'floating_button' | 'inline_form' | 'modal' | 'sidebar' | 'embedded';
  
  // Appearance
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  theme: {
    primaryColor: string;
    buttonText: string;
    icon?: string;
  };
  
  // Behavior
  triggers: Array<{
    type: 'time_on_page' | 'scroll_percentage' | 'exit_intent' | 'manual';
    value?: number;
  }>;
  
  targeting: {
    urls?: string[]; // URL patterns
    excludeUrls?: string[];
    userSegments?: string[];
    devices?: ('desktop' | 'mobile' | 'tablet')[];
  };
  
  // Form settings
  collectEmail: boolean;
  collectName: boolean;
  categories: string[];
  customFields: string[];
  
  // Analytics
  impressions: number;
  interactions: number;
  submissions: number;
  conversionRate: number;
  
  isActive: boolean;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// -------------------- AI/ML Types --------------------

export interface FeedbackInsight {
  id: string;
  tenantId: string;
  
  type: 'trend' | 'anomaly' | 'pattern' | 'recommendation';
  category: 'volume' | 'sentiment' | 'resolution' | 'satisfaction' | 'product';
  
  title: string;
  description: string;
  
  data: {
    confidence: number; // 0-1
    impact: 'low' | 'medium' | 'high';
    timeframe: string;
    metrics: any;
  };
  
  // Actions
  suggestedActions: Array<{
    action: string;
    description: string;
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
  }>;
  
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  
  createdAt: string;
  expiresAt?: string;
}

export interface SentimentAnalysisResult {
  feedbackId: string;
  sentiment: FeedbackSentiment;
  score: number; // -1 to 1
  confidence: number; // 0 to 1
  
  // Detailed breakdown
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
  };
  
  // Key phrases
  positiveKeywords: string[];
  negativeKeywords: string[];
  topics: string[];
  
  // Context
  language: string;
  processingTime: number; // ms
  model: string;
  version: string;
}

export interface FeedbackClassification {
  feedbackId: string;
  
  // Auto-detected classification
  suggestedType: FeedbackType;
  suggestedPriority: FeedbackPriority;
  suggestedCategory?: string;
  
  // Confidence scores
  typeConfidence: number;
  priorityConfidence: number;
  categoryConfidence: number;
  
  // Reasoning
  reasoning: {
    type: string[];
    priority: string[];
    category: string[];
  };
  
  // Similar feedback
  similarFeedback: Array<{
    id: string;
    title: string;
    similarity: number;
    status: FeedbackStatus;
  }>;
  
  processingTime: number; // ms
  model: string;
  version: string;
}