// -------------------- AI Categorization Core Types --------------------

export interface ExpenseCategory {
  id: string;
  name: string;
  parentId?: string;
  level: number;
  path: string; // e.g., "Office > Supplies > Software"
  isActive: boolean;
  
  // AI learning data
  keywords: string[];
  vendorPatterns: string[];
  amountRanges?: Array<{ min?: number; max?: number }>;
  seasonality?: Array<{ months: number[]; likelihood: number }>;
  
  // Tax and accounting
  taxDeductible: boolean;
  accountCode?: string;
  description?: string;
  
  // Usage statistics
  usageCount: number;
  lastUsed?: string;
  averageAmount?: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface CategorizationRule {
  id: string;
  tenantId: string;
  
  // Rule configuration
  name: string;
  description?: string;
  priority: number; // higher = more important
  isActive: boolean;
  
  // Matching criteria
  criteria: {
    // Vendor/merchant matching
    vendorNames?: string[];
    vendorPatterns?: string[]; // regex patterns
    merchantCodes?: string[]; // MCC codes
    
    // Description matching
    descriptionContains?: string[];
    descriptionPatterns?: string[]; // regex patterns
    descriptionExcludes?: string[];
    
    // Amount criteria
    amountRange?: { min?: number; max?: number };
    amountExact?: number[];
    
    // Transaction details
    paymentMethods?: string[];
    transactionTypes?: string[];
    
    // Temporal criteria
    dateRange?: { start?: string; end?: string };
    daysOfWeek?: number[]; // 0-6, Sunday = 0
    timeOfDay?: { start?: string; end?: string };
    months?: number[]; // 1-12
    
    // Location (if available)
    locations?: string[];
    cities?: string[];
    states?: string[];
    countries?: string[];
  };
  
  // Actions
  actions: {
    setCategoryId: string;
    setConfidence?: number;
    addTags?: string[];
    setMemo?: string;
    requireReview?: boolean;
    autoApprove?: boolean;
  };
  
  // Learning and feedback
  learningEnabled: boolean;
  feedbackCount: number;
  accuracyRate: number; // percentage
  
  // Statistics
  timesApplied: number;
  lastAppliedAt?: string;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategorizationPrediction {
  transactionId: string;
  
  // Primary prediction
  predictedCategoryId: string;
  confidence: number; // 0-100
  
  // Alternative suggestions
  alternatives: Array<{
    categoryId: string;
    confidence: number;
    reason: string;
  }>;
  
  // Reasoning
  reasons: Array<{
    type: 'vendor_match' | 'description_match' | 'amount_pattern' | 'historical_pattern' | 'rule_based';
    explanation: string;
    weight: number;
  }>;
  
  // Model information
  modelVersion: string;
  modelType: 'rule_based' | 'ml_trained' | 'llm_powered' | 'hybrid';
  
  // Quality metrics
  dataQuality: {
    completeness: number; // 0-100
    richness: number; // 0-100
    consistency: number; // 0-100
  };
  
  predictedAt: string;
  processingTime: number; // milliseconds
}

export interface CategorizationFeedback {
  id: string;
  tenantId: string;
  transactionId: string;
  predictionId?: string;
  
  // User feedback
  actualCategoryId: string;
  wasCorrect: boolean;
  userConfidence: number; // 1-5 stars
  
  // Correction details
  correctionReason?: string;
  userNotes?: string;
  
  // Learning data
  improvesPrediction: boolean;
  suggestedRuleChanges?: string[];
  
  providedBy: string;
  providedAt: string;
}

export interface LearningDataset {
  id: string;
  tenantId: string;
  
  // Dataset information
  name: string;
  description?: string;
  version: string;
  
  // Training data
  transactions: Array<{
    id: string;
    vendor: string;
    description: string;
    amount: number;
    date: string;
    categoryId: string;
    tags?: string[];
    location?: string;
    paymentMethod?: string;
  }>;
  
  // Dataset statistics
  totalTransactions: number;
  uniqueVendors: number;
  uniqueCategories: number;
  dateRange: { start: string; end: string };
  
  // Quality metrics
  completenessScore: number; // 0-100
  balanceScore: number; // how evenly distributed across categories
  diversityScore: number; // variety of vendors and descriptions
  
  // Training results
  lastTraining?: {
    trainedAt: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    confusionMatrix?: Record<string, Record<string, number>>;
  };
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// -------------------- AI Model Types --------------------

export interface AIModel {
  id: string;
  tenantId: string;
  
  // Model information
  name: string;
  type: 'rule_based' | 'naive_bayes' | 'random_forest' | 'neural_network' | 'transformer';
  version: string;
  description?: string;
  
  // Training information
  trainedOn: string; // dataset ID
  trainingMetrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    trainingTime: number; // seconds
    sampleSize: number;
  };
  
  // Model configuration
  hyperparameters?: Record<string, any>;
  features: string[]; // list of features used
  
  // Performance tracking
  productionMetrics: {
    predictionsCount: number;
    averageConfidence: number;
    accuracyRate: number;
    averageResponseTime: number; // milliseconds
    lastEvaluated: string;
  };
  
  // Model lifecycle
  status: 'training' | 'trained' | 'deployed' | 'deprecated';
  deployedAt?: string;
  retiredAt?: string;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModelEvaluation {
  id: string;
  modelId: string;
  evaluationType: 'cross_validation' | 'holdout' | 'time_series' | 'production';
  
  // Test dataset
  testDatasetId?: string;
  testSampleSize: number;
  
  // Results
  overallAccuracy: number;
  categoryMetrics: Array<{
    categoryId: string;
    precision: number;
    recall: number;
    f1Score: number;
    support: number; // number of true instances
  }>;
  
  // Confusion matrix
  confusionMatrix: Record<string, Record<string, number>>;
  
  // Error analysis
  commonErrors: Array<{
    actualCategory: string;
    predictedCategory: string;
    frequency: number;
    examples: string[];
  }>;
  
  evaluatedBy: string;
  evaluatedAt: string;
}

// -------------------- Integration Types --------------------

export interface CategorizationJob {
  id: string;
  tenantId: string;
  
  // Job configuration
  type: 'batch_categorization' | 'model_training' | 'rule_optimization' | 'data_import';
  name: string;
  description?: string;
  
  // Input data
  inputSource: {
    type: 'transaction_ids' | 'date_range' | 'uploaded_file' | 'database_query';
    parameters: Record<string, any>;
  };
  
  // Processing options
  options: {
    overwriteExisting: boolean;
    minimumConfidence: number;
    requireReview: boolean;
    batchSize: number;
    modelId?: string;
  };
  
  // Job status
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  
  // Results
  results?: {
    totalProcessed: number;
    successful: number;
    failed: number;
    skipped: number;
    averageConfidence: number;
    executionTime: number; // seconds
  };
  
  // Error handling
  errors?: Array<{
    itemId: string;
    errorCode: string;
    errorMessage: string;
  }>;
  
  startedBy: string;
  startedAt: string;
  completedAt?: string;
}

export interface CategorizationSettings {
  tenantId: string;
  
  // General settings
  autoCategorizationEnabled: boolean;
  minimumConfidenceThreshold: number; // 0-100
  requireReviewThreshold: number; // confidence below this requires review
  
  // Model preferences
  preferredModelType: 'rule_based' | 'ml_trained' | 'llm_powered' | 'hybrid';
  fallbackStrategy: 'use_rules' | 'prompt_user' | 'leave_uncategorized';
  
  // Learning settings
  learningEnabled: boolean;
  autoCreateRules: boolean;
  feedbackWeight: number; // how much user feedback affects learning
  
  // Notification settings
  notifications: {
    lowConfidencePredictions: boolean;
    newCategoryDetection: boolean;
    modelRetrainingNeeded: boolean;
    accuracyThresholdBreach: boolean;
  };
  
  // Data retention
  retainPredictionHistory: boolean;
  predictionHistoryDays: number;
  anonymizeTrainingData: boolean;
  
  updatedBy: string;
  updatedAt: string;
}

// -------------------- Analytics Types --------------------

export interface CategorizationAnalytics {
  tenantId: string;
  periodStart: string;
  periodEnd: string;
  
  // Overall performance
  performance: {
    totalPredictions: number;
    averageConfidence: number;
    accuracyRate: number;
    userSatisfactionScore: number; // 1-5
    processingTime: {
      average: number;
      median: number;
      p95: number;
    };
  };
  
  // Category distribution
  categoryDistribution: Array<{
    categoryId: string;
    categoryName: string;
    transactionCount: number;
    totalAmount: number;
    averageConfidence: number;
    accuracyRate: number;
  }>;
  
  // Model performance by type
  modelPerformance: Array<{
    modelType: string;
    predictionsCount: number;
    averageConfidence: number;
    accuracyRate: number;
    averageResponseTime: number;
  }>;
  
  // Learning trends
  learningTrends: Array<{
    date: string;
    newRulesCreated: number;
    feedbackReceived: number;
    accuracyImprovement: number;
  }>;
  
  // Error analysis
  errorAnalysis: {
    commonMisclassifications: Array<{
      fromCategory: string;
      toCategory: string;
      frequency: number;
      avgConfidence: number;
    }>;
    problematicVendors: Array<{
      vendor: string;
      errorRate: number;
      transactionCount: number;
    }>;
    lowConfidenceCategories: Array<{
      categoryId: string;
      averageConfidence: number;
      needsAttention: boolean;
    }>;
  };
}

export interface VendorInsights {
  vendor: string;
  
  // Transaction patterns
  totalTransactions: number;
  totalAmount: number;
  averageAmount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'irregular';
  
  // Categorization insights
  primaryCategory: string;
  categoryConfidence: number;
  alternativeCategories: Array<{
    categoryId: string;
    percentage: number;
  }>;
  
  // Temporal patterns
  seasonality: Array<{
    month: number;
    transactionCount: number;
    averageAmount: number;
  }>;
  
  dayOfWeekPattern: Array<{
    dayOfWeek: number;
    transactionCount: number;
  }>;
  
  // Anomaly detection
  anomalies: Array<{
    date: string;
    amount: number;
    expectedAmount: number;
    deviation: number;
    reason: string;
  }>;
  
  // Recommendations
  recommendations: Array<{
    type: 'create_rule' | 'split_category' | 'review_transactions' | 'set_budget';
    description: string;
    confidence: number;
  }>;
}