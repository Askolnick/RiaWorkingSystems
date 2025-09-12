// -------------------- Core Types --------------------

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled' | 'archived';
export type CampaignType = 
  | 'email' 
  | 'sms' 
  | 'social_media' 
  | 'push_notification' 
  | 'direct_mail' 
  | 'webinar' 
  | 'event' 
  | 'survey' 
  | 'multi_channel' 
  | 'drip_sequence' 
  | 'transactional';

export type CampaignObjective = 
  | 'awareness' 
  | 'engagement' 
  | 'lead_generation' 
  | 'conversion' 
  | 'retention' 
  | 're_engagement' 
  | 'upsell' 
  | 'cross_sell' 
  | 'referral' 
  | 'feedback';

export type MessageStatus = 
  | 'draft' 
  | 'scheduled' 
  | 'sending' 
  | 'sent' 
  | 'delivered' 
  | 'opened' 
  | 'clicked' 
  | 'bounced' 
  | 'failed' 
  | 'unsubscribed' 
  | 'spam';

export type AudienceType = 
  | 'all_contacts' 
  | 'segment' 
  | 'list' 
  | 'custom_filter' 
  | 'lookalike' 
  | 'behavioral' 
  | 'demographic' 
  | 'geographic';

export interface Campaign {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  
  // Campaign Details
  type: CampaignType;
  status: CampaignStatus;
  objective: CampaignObjective;
  
  // Scheduling
  startDate?: string;
  endDate?: string;
  timezone: string;
  
  // Targeting
  audienceType: AudienceType;
  audienceConfig?: any; // Audience selection criteria
  targetCount: number;
  
  // Content
  subject?: string; // For email campaigns
  content: any; // Campaign content structure
  template?: any; // Template configuration
  
  // Settings
  priority: number;
  frequency?: string; // For recurring campaigns
  
  // Tracking & Analytics
  trackOpens: boolean;
  trackClicks: boolean;
  trackConversions: boolean;
  conversionGoal?: string; // URL or event to track
  
  // Budget & Costs
  budget?: number;
  costPerSend?: number;
  actualCost: number;
  
  // Performance Metrics (cached)
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  unsubscribedCount: number;
  conversionCount: number;
  
  // Rates (calculated)
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  conversionRate: number;
  roi: number;
  
  // A/B Testing
  isAbTest: boolean;
  parentCampaignId?: string;
  testPercentage?: number; // Percentage of audience for test
  winnerCriteria?: string; // "open_rate", "click_rate", "conversion_rate"
  winnerSelected: boolean;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  completedAt?: string;
}

export interface CampaignMessage {
  id: string;
  tenantId: string;
  campaignId: string;
  contactId: string;
  
  // Message Details
  status: MessageStatus;
  content: any; // Personalized message content
  metadata?: any; // Provider-specific metadata
  
  // Delivery Details
  channel: string; // email, sms, push, etc.
  providerName?: string; // SendGrid, Twilio, etc.
  providerId?: string; // Provider's message ID
  
  // Tracking
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  firstClickAt?: string;
  bouncedAt?: string;
  unsubscribedAt?: string;
  
  // Error Handling
  errorCode?: string;
  errorMessage?: string;
  retryCount: number;
  
  // Analytics Data
  opens: number;
  clicks: number;
  clickedUrls?: any; // Array of clicked URLs with timestamps
  userAgent?: string;
  ipAddress?: string;
  location?: any; // Geo location data
  
  createdAt: string;
  updatedAt: string;
}

export interface CampaignAudience {
  id: string;
  tenantId: string;
  campaignId: string;
  
  name: string;
  description?: string;
  audienceType: AudienceType;
  
  // Audience Definition
  criteria: any; // Filter criteria for dynamic audiences
  contactIds?: any; // Static list of contact IDs
  
  // Statistics
  totalCount: number;
  activeCount: number; // Subscribed/reachable contacts
  
  // Settings
  isActive: boolean;
  lastUpdated: string;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignAnalytics {
  id: string;
  tenantId: string;
  campaignId: string;
  
  // Time Period
  reportDate: string;
  hour?: number; // For hourly analytics
  
  // Core Metrics
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  spam: number;
  
  // Revenue Metrics
  conversions: number;
  revenue: number;
  cost: number;
  
  // Engagement Metrics
  uniqueOpens: number;
  uniqueClicks: number;
  forwardCount: number;
  shareCount: number;
  
  // Device/Platform Breakdown
  deviceData?: any; // Mobile, desktop, tablet stats
  locationData?: any; // Geographic performance data
  
  createdAt: string;
}

export interface CampaignEvent {
  id: string;
  tenantId: string;
  campaignId: string;
  contactId?: string;
  
  eventType: string; // sent, delivered, opened, clicked, bounced, unsubscribed, etc.
  eventData?: any; // Additional event-specific data
  
  // Context
  userAgent?: string;
  ipAddress?: string;
  location?: any;
  referrer?: string;
  
  // Timing
  timestamp: string;
}

export interface CampaignAsset {
  id: string;
  tenantId: string;
  campaignId: string;
  
  name: string;
  type: string; // image, document, video, audio, template
  url: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  
  // Asset Properties
  width?: number;
  height?: number;
  duration?: number; // For video/audio in seconds
  
  // Usage Tracking
  isUsed: boolean;
  clickCount: number;
  
  uploadedBy: string;
  uploadedAt: string;
}

export interface CampaignAutomation {
  id: string;
  tenantId: string;
  campaignId: string;
  
  name: string;
  description?: string;
  triggerType: string; // time_based, behavior_based, event_based
  triggerConfig: any; // Trigger configuration
  
  // Actions
  actions: any; // Array of actions to perform
  
  // Conditions
  conditions?: any; // Optional conditions for execution
  
  // Status
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
  
  // Statistics
  triggerCount: number;
  executionCount: number;
  errorCount: number;
  lastError?: string;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignTag {
  id: string;
  tenantId: string;
  campaignId: string;
  
  name: string;
  color?: string;
  
  createdBy: string;
  createdAt: string;
}

// -------------------- Extended Types with Relations --------------------

export interface CampaignWithRelations extends Campaign {
  messages: CampaignMessage[];
  audiences: CampaignAudience[];
  analytics: CampaignAnalytics[];
  events: CampaignEvent[];
  assets: CampaignAsset[];
  automations: CampaignAutomation[];
  tags: CampaignTag[];
  parentCampaign?: Campaign;
  childCampaigns: Campaign[];
  
  // Computed fields
  totalMessages: number;
  avgEngagement: number;
  costPerConversion: number;
  expectedCompletion?: string;
  performanceScore: number; // 0-100 based on objectives
  recentActivity: CampaignEvent[];
  topPerformingContent?: any;
}

export interface CampaignMessageWithDetails extends CampaignMessage {
  campaign: Campaign;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  
  // Computed fields
  engagementScore: number;
  timeToOpen?: number; // seconds from sent to opened
  timeToClick?: number; // seconds from opened to clicked
  isEngaged: boolean;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  lastActivity?: string;
}

export interface CampaignAudienceWithStats extends CampaignAudience {
  // Performance metrics
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  conversionCount: number;
  
  // Rates
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  
  // Engagement
  avgEngagementScore: number;
  topPerformers: Array<{
    contactId: string;
    contactName: string;
    engagementScore: number;
  }>;
  
  // Demographics
  demographics?: {
    ageGroups: Record<string, number>;
    locations: Record<string, number>;
    industries: Record<string, number>;
  };
}

export interface CampaignAnalyticsWithTrends extends CampaignAnalytics {
  trends: {
    sentTrend: number; // percentage change from previous period
    openTrend: number;
    clickTrend: number;
    conversionTrend: number;
    revenueTrend: number;
  };
  
  benchmarks: {
    industryOpenRate: number;
    industryClickRate: number;
    industryConversionRate: number;
  };
  
  insights: string[];
  recommendations: string[];
}

// -------------------- Create/Update Types --------------------

export interface CreateCampaignData {
  name: string;
  description?: string;
  type: CampaignType;
  objective: CampaignObjective;
  status?: CampaignStatus;
  
  // Scheduling
  startDate?: string;
  endDate?: string;
  timezone?: string;
  
  // Targeting
  audienceType?: AudienceType;
  audienceConfig?: any;
  
  // Content
  subject?: string;
  content?: any;
  template?: any;
  
  // Settings
  priority?: number;
  frequency?: string;
  
  // Tracking
  trackOpens?: boolean;
  trackClicks?: boolean;
  trackConversions?: boolean;
  conversionGoal?: string;
  
  // Budget
  budget?: number;
  costPerSend?: number;
  
  // A/B Testing
  isAbTest?: boolean;
  testPercentage?: number;
  winnerCriteria?: string;
}

export interface UpdateCampaignData extends Partial<CreateCampaignData> {
  // Performance updates (typically system-generated)
  sentCount?: number;
  deliveredCount?: number;
  openedCount?: number;
  clickedCount?: number;
  bouncedCount?: number;
  unsubscribedCount?: number;
  conversionCount?: number;
  actualCost?: number;
  
  // Status updates
  sentAt?: string;
  completedAt?: string;
  winnerSelected?: boolean;
}

export interface CreateCampaignAudienceData {
  campaignId: string;
  name: string;
  description?: string;
  audienceType: AudienceType;
  criteria?: any;
  contactIds?: string[];
}

export interface UpdateCampaignAudienceData extends Partial<Omit<CreateCampaignAudienceData, 'campaignId'>> {
  totalCount?: number;
  activeCount?: number;
  isActive?: boolean;
}

export interface CreateCampaignAssetData {
  campaignId: string;
  name: string;
  type: string;
  url: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number;
}

export interface CreateCampaignAutomationData {
  campaignId: string;
  name: string;
  description?: string;
  triggerType: string;
  triggerConfig: any;
  actions: any;
  conditions?: any;
  isActive?: boolean;
}

export interface UpdateCampaignAutomationData extends Partial<Omit<CreateCampaignAutomationData, 'campaignId'>> {
  lastRun?: string;
  nextRun?: string;
  triggerCount?: number;
  executionCount?: number;
  errorCount?: number;
  lastError?: string;
}

export interface CreateCampaignTagData {
  campaignId: string;
  name: string;
  color?: string;
}

// -------------------- Message Management --------------------

export interface SendCampaignRequest {
  campaignId: string;
  sendNow?: boolean;
  scheduledFor?: string;
  testMode?: boolean;
  testContacts?: string[]; // Contact IDs for test sends
}

export interface SendCampaignResponse {
  success: boolean;
  campaignId: string;
  messagesQueued: number;
  estimatedDelivery?: string;
  errors: string[];
  warnings: string[];
}

export interface CampaignMessageUpdate {
  messageId: string;
  status: MessageStatus;
  providerId?: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  firstClickAt?: string;
  bouncedAt?: string;
  unsubscribedAt?: string;
  errorCode?: string;
  errorMessage?: string;
  metadata?: any;
}

export interface BulkMessageUpdate {
  campaignId: string;
  updates: CampaignMessageUpdate[];
}

// -------------------- Filter/Search Types --------------------

export interface CampaignFilters {
  status?: CampaignStatus | CampaignStatus[];
  type?: CampaignType | CampaignType[];
  objective?: CampaignObjective | CampaignObjective[];
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
  sentFrom?: string;
  sentTo?: string;
  hasMessages?: boolean;
  isAbTest?: boolean;
  tags?: string[];
  search?: string;
  
  // Performance filters
  minOpenRate?: number;
  maxOpenRate?: number;
  minClickRate?: number;
  maxClickRate?: number;
  minConversions?: number;
  maxConversions?: number;
}

export interface CampaignMessageFilters {
  campaignId?: string;
  status?: MessageStatus | MessageStatus[];
  channel?: string;
  contactId?: string;
  sentFrom?: string;
  sentTo?: string;
  hasOpened?: boolean;
  hasClicked?: boolean;
  hasBounced?: boolean;
  hasUnsubscribed?: boolean;
  providerName?: string;
  errorCode?: string;
}

export interface CampaignSort {
  field: keyof Campaign | 'totalMessages' | 'engagementRate' | 'conversionRate' | 'roi';
  direction: 'asc' | 'desc';
}

// -------------------- Analytics Types --------------------

export interface CampaignPerformanceReport {
  campaignId: string;
  campaignName: string;
  timeRange: {
    from: string;
    to: string;
  };
  
  // Summary metrics
  summary: {
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    totalConversions: number;
    totalRevenue: number;
    totalCost: number;
    
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    roi: number;
    costPerConversion: number;
  };
  
  // Time series data
  timeline: Array<{
    date: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    conversions: number;
    revenue: number;
  }>;
  
  // Audience breakdown
  audiencePerformance: Array<{
    audienceId: string;
    audienceName: string;
    sent: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    revenue: number;
  }>;
  
  // Geographic performance
  geographic: Array<{
    country: string;
    region?: string;
    sent: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
  }>;
  
  // Device breakdown
  devices: Array<{
    deviceType: string;
    percentage: number;
    openRate: number;
    clickRate: number;
  }>;
  
  // Top performing content
  topContent: Array<{
    contentType: string;
    subject?: string;
    opens: number;
    clicks: number;
    conversions: number;
  }>;
}

export interface CampaignBenchmarkReport {
  campaignId: string;
  industry: string;
  campaignType: CampaignType;
  
  metrics: {
    openRate: {
      value: number;
      industryAverage: number;
      percentile: number;
      status: 'below' | 'average' | 'above' | 'excellent';
    };
    clickRate: {
      value: number;
      industryAverage: number;
      percentile: number;
      status: 'below' | 'average' | 'above' | 'excellent';
    };
    conversionRate: {
      value: number;
      industryAverage: number;
      percentile: number;
      status: 'below' | 'average' | 'above' | 'excellent';
    };
    unsubscribeRate: {
      value: number;
      industryAverage: number;
      percentile: number;
      status: 'below' | 'average' | 'above' | 'excellent';
    };
  };
  
  insights: string[];
  recommendations: Array<{
    category: string;
    recommendation: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
  }>;
}

export interface CampaignROIAnalysis {
  campaignId: string;
  
  costs: {
    platform: number;
    content: number;
    design: number;
    advertising: number;
    other: number;
    total: number;
  };
  
  revenue: {
    direct: number; // Attributed to campaign
    influenced: number; // Influenced by campaign
    total: number;
  };
  
  metrics: {
    roi: number;
    roas: number; // Return on Ad Spend
    cpa: number; // Cost Per Acquisition
    ltv: number; // Customer Lifetime Value
    paybackPeriod: number; // Days
  };
  
  attribution: {
    firstTouch: number;
    lastTouch: number;
    multiTouch: number;
  };
  
  projections: {
    expectedRevenue: number;
    projectedROI: number;
    breakEvenDate: string;
  };
}

// -------------------- A/B Testing --------------------

export interface ABTestConfiguration {
  testName: string;
  testType: 'subject_line' | 'content' | 'send_time' | 'from_name' | 'call_to_action';
  testPercentage: number; // 10-50%
  duration: number; // hours
  winnerCriteria: 'open_rate' | 'click_rate' | 'conversion_rate' | 'revenue';
  minSampleSize: number;
  confidenceLevel: number; // 90, 95, 99
  
  variants: Array<{
    name: string;
    percentage: number; // Split within test audience
    changes: any; // Specific changes for this variant
  }>;
}

export interface ABTestResult {
  campaignId: string;
  testConfiguration: ABTestConfiguration;
  
  results: Array<{
    variantName: string;
    metrics: {
      sent: number;
      opened: number;
      clicked: number;
      conversions: number;
      revenue: number;
      openRate: number;
      clickRate: number;
      conversionRate: number;
    };
    confidenceInterval: {
      lower: number;
      upper: number;
    };
    isWinner: boolean;
    significantDifference: boolean;
  }>;
  
  recommendation: {
    winnerVariant?: string;
    confidence: number;
    reason: string;
    expectedImprovement: number; // percentage
  };
  
  completedAt: string;
  isSignificant: boolean;
}

// -------------------- Integration Types --------------------

export interface CampaignProvider {
  id: string;
  tenantId: string;
  name: string; // "SendGrid", "Mailchimp", "Twilio", etc.
  type: CampaignType;
  
  config: {
    apiKey?: string;
    apiSecret?: string;
    accountId?: string;
    fromEmail?: string;
    fromName?: string;
    webhookUrl?: string;
    customFields?: Record<string, string>;
  };
  
  capabilities: {
    supportsTracking: boolean;
    supportsTemplates: boolean;
    supportsScheduling: boolean;
    supportsAbTesting: boolean;
    maxRecipientsPerHour: number;
    supportedFormats: string[];
  };
  
  isActive: boolean;
  isDefault: boolean;
  
  // Statistics
  totalSent: number;
  successRate: number;
  avgDeliveryTime: number; // seconds
  lastUsed?: string;
  lastError?: string;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignWebhook {
  id: string;
  tenantId: string;
  campaignId?: string; // null for all campaigns
  providerId?: string;
  
  url: string;
  secret?: string;
  events: string[]; // sent, delivered, opened, clicked, etc.
  isActive: boolean;
  
  // Retry configuration
  retryAttempts: number;
  retryDelay: number; // seconds
  
  // Statistics
  totalTriggers: number;
  successfulTriggers: number;
  lastTriggeredAt?: string;
  lastStatus?: 'success' | 'failed';
  lastError?: string;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// -------------------- Template Types --------------------

export interface CampaignTemplate {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  
  // Template details
  type: CampaignType;
  category: string; // newsletter, promotion, transactional, etc.
  
  // Content
  subject?: string;
  content: any; // Template content structure
  design: any; // Visual design configuration
  
  // Variables
  variables: Array<{
    name: string;
    type: string; // text, number, date, boolean, image, url
    defaultValue?: any;
    isRequired: boolean;
    description?: string;
  }>;
  
  // Settings
  isPublic: boolean;
  allowCustomization: boolean;
  
  // Usage statistics
  usageCount: number;
  averagePerformance: {
    openRate: number;
    clickRate: number;
    conversionRate: number;
  };
  
  // Preview
  thumbnailUrl?: string;
  previewUrl?: string;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateApplication {
  templateId: string;
  campaignData: Partial<CreateCampaignData>;
  variableValues: Record<string, any>;
  customizations?: any;
}

// -------------------- Automation Types --------------------

export interface CampaignWorkflow {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  
  // Workflow configuration
  trigger: {
    type: 'event' | 'schedule' | 'condition';
    config: any;
  };
  
  steps: Array<{
    id: string;
    type: 'campaign' | 'wait' | 'condition' | 'action';
    config: any;
    conditions?: any;
    nextSteps: string[];
  }>;
  
  // Status
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
  
  // Statistics
  totalRuns: number;
  successfulRuns: number;
  totalContacts: number;
  activeContacts: number;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  contactId: string;
  
  currentStep: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  
  history: Array<{
    stepId: string;
    startedAt: string;
    completedAt?: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    result?: any;
    error?: string;
  }>;
  
  startedAt: string;
  completedAt?: string;
  lastActivity: string;
}

// -------------------- Reporting Types --------------------

export interface CampaignDashboard {
  tenantId: string;
  dateRange: {
    from: string;
    to: string;
  };
  
  overview: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalSent: number;
    totalRevenue: number;
    avgOpenRate: number;
    avgClickRate: number;
    avgConversionRate: number;
    avgROI: number;
  };
  
  topPerformers: {
    campaigns: Array<{
      id: string;
      name: string;
      openRate: number;
      clickRate: number;
      conversionRate: number;
      revenue: number;
    }>;
    
    audiences: Array<{
      id: string;
      name: string;
      engagementRate: number;
      conversionRate: number;
      totalRevenue: number;
    }>;
  };
  
  trends: {
    sent: Array<{ date: string; value: number }>;
    openRate: Array<{ date: string; value: number }>;
    clickRate: Array<{ date: string; value: number }>;
    revenue: Array<{ date: string; value: number }>;
  };
  
  channelPerformance: Array<{
    channel: CampaignType;
    campaigns: number;
    sent: number;
    openRate: number;
    clickRate: number;
    revenue: number;
  }>;
  
  insights: Array<{
    type: 'success' | 'warning' | 'info';
    title: string;
    description: string;
    actionable: boolean;
    action?: string;
  }>;
}

// -------------------- Import/Export Types --------------------

export interface CampaignExportOptions {
  format: 'csv' | 'excel' | 'json' | 'pdf';
  campaignIds?: string[];
  includeMessages: boolean;
  includeAnalytics: boolean;
  includeAssets: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
  filters?: CampaignFilters;
}

export interface CampaignImportData {
  campaigns: Array<Partial<CreateCampaignData>>;
  audiences?: Array<CreateCampaignAudienceData>;
  templates?: Array<Partial<CampaignTemplate>>;
}

export interface CampaignImportResult {
  success: boolean;
  imported: {
    campaigns: number;
    audiences: number;
    templates: number;
  };
  failed: {
    campaigns: Array<{ data: any; error: string }>;
    audiences: Array<{ data: any; error: string }>;
    templates: Array<{ data: any; error: string }>;
  };
  warnings: string[];
}