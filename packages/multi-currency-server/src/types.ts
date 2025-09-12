// -------------------- Core Currency Types --------------------

export interface Currency {
  code: string; // ISO 4217 code (e.g., 'USD', 'EUR', 'GBP')
  name: string; // Full name (e.g., 'US Dollar')
  symbol: string; // Currency symbol (e.g., '$', '€', '£')
  symbolPosition: 'before' | 'after'; // Symbol position relative to amount
  decimalPlaces: number; // Number of decimal places (usually 2)
  thousandsSeparator: string; // Thousands separator (',' or '.')
  decimalSeparator: string; // Decimal separator ('.' or ',')
  isActive: boolean; // Whether currency is actively used
  
  // Additional metadata
  country?: string; // Primary country (e.g., 'United States')
  region?: string; // Economic region (e.g., 'North America')
  
  // Display formatting
  displayFormat: string; // Format string (e.g., '{symbol}{amount}')
  
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRate {
  id: string;
  fromCurrency: string; // Base currency code
  toCurrency: string; // Target currency code
  rate: number; // Exchange rate (1 unit of fromCurrency = rate units of toCurrency)
  inverseRate: number; // Inverse rate for quick calculations
  
  // Rate metadata
  source: 'manual' | 'api' | 'bank' | 'market';
  provider?: string; // Rate provider (e.g., 'xe.com', 'fixer.io')
  
  // Validity and timing
  effectiveDate: string; // When this rate becomes effective
  expiryDate?: string; // When this rate expires
  fetchedAt: string; // When the rate was fetched
  
  // Rate quality indicators
  confidence: number; // Confidence in rate accuracy (0-100)
  spread?: number; // Bid-ask spread if available
  
  // Historical tracking
  previousRate?: number;
  rateChange?: number; // Change from previous rate
  rateChangePercentage?: number;
  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MultiCurrencyAmount {
  amount: number;
  currency: string;
  
  // Exchange rate information
  exchangeRate?: number;
  exchangeRateDate?: string;
  
  // Converted amounts (cached for performance)
  convertedAmounts?: Array<{
    currency: string;
    amount: number;
    rate: number;
    convertedAt: string;
  }>;
  
  // Formatting
  formattedAmount?: string;
  displayCurrency?: string; // Currency to display in (may differ from base)
}

// -------------------- Transaction Types --------------------

export interface MultiCurrencyTransaction {
  id: string;
  tenantId: string;
  
  // Transaction details
  type: 'income' | 'expense' | 'transfer' | 'exchange';
  description: string;
  date: string;
  
  // Multi-currency amounts
  originalAmount: MultiCurrencyAmount; // Amount in original currency
  baseCurrencyAmount: MultiCurrencyAmount; // Amount in base currency
  displayAmount?: MultiCurrencyAmount; // Amount in preferred display currency
  
  // Exchange information
  exchangeRateUsed?: ExchangeRate;
  exchangeRateSnapshot?: {
    rate: number;
    date: string;
    source: string;
  };
  
  // Currency conversion details
  currencyConversion?: {
    fromCurrency: string;
    toCurrency: string;
    originalAmount: number;
    convertedAmount: number;
    rate: number;
    fees?: number;
    feesCurrency?: string;
  };
  
  // Related data
  categoryId?: string;
  accountId?: string;
  contactId?: string;
  
  // Metadata
  tags?: string[];
  notes?: string;
  attachments?: string[];
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CurrencyAccount {
  id: string;
  tenantId: string;
  
  // Account details
  name: string;
  accountNumber?: string;
  accountType: 'bank' | 'cash' | 'credit_card' | 'investment' | 'loan';
  
  // Currency information
  baseCurrency: string; // Primary currency for this account
  supportedCurrencies: string[]; // Currencies this account can hold
  
  // Multi-currency balances
  balances: Array<{
    currency: string;
    amount: number;
    lastUpdated: string;
  }>;
  
  // Base currency balance (sum of all balances converted to base currency)
  baseCurrencyBalance: number;
  baseCurrencyBalanceDate: string;
  
  // Account settings
  allowMultiCurrency: boolean;
  autoConvertToBase: boolean;
  defaultCurrency?: string; // Default currency for new transactions
  
  // Bank/Institution details
  bankName?: string;
  branchCode?: string;
  swiftCode?: string;
  iban?: string;
  
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// -------------------- Exchange Rate Management --------------------

export interface ExchangeRateProvider {
  id: string;
  name: string;
  type: 'api' | 'manual' | 'file_import';
  
  // API configuration
  apiConfig?: {
    baseUrl: string;
    apiKey?: string;
    endpoints: {
      rates: string;
      historical?: string;
      currencies?: string;
    };
    rateLimit?: {
      requestsPerMinute: number;
      requestsPerDay: number;
    };
  };
  
  // Supported currencies
  supportedCurrencies: string[];
  baseCurrency: string; // Provider's base currency
  
  // Update settings
  updateFrequency: 'real_time' | 'hourly' | 'daily' | 'weekly' | 'manual';
  lastUpdate?: string;
  nextUpdate?: string;
  
  // Quality metrics
  reliability: number; // 0-100 reliability score
  averageResponseTime: number; // milliseconds
  uptime: number; // percentage
  
  // Cost information
  costPerRequest?: number;
  monthlyQuota?: number;
  requestsUsed?: number;
  
  isActive: boolean;
  priority: number; // Higher number = higher priority
  
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRateAlert {
  id: string;
  tenantId: string;
  
  // Alert configuration
  name: string;
  fromCurrency: string;
  toCurrency: string;
  
  // Trigger conditions
  triggerType: 'above' | 'below' | 'change_percentage' | 'change_amount';
  targetRate?: number;
  changeThreshold?: number; // For percentage or amount changes
  
  // Alert settings
  isActive: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  
  // Notification settings
  notifications: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
    webhook?: string;
  };
  
  // Recipients
  recipients: Array<{
    userId: string;
    email?: string;
    phone?: string;
  }>;
  
  // Alert history
  lastTriggered?: string;
  timesTriggered: number;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// -------------------- Reporting and Analytics --------------------

export interface CurrencyExposureReport {
  tenantId: string;
  reportDate: string;
  baseCurrency: string;
  
  // Overall exposure
  totalExposure: {
    baseCurrencyValue: number;
    currencyBreakdown: Array<{
      currency: string;
      amount: number;
      baseCurrencyValue: number;
      percentage: number;
    }>;
  };
  
  // By account type
  accountExposure: Array<{
    accountType: string;
    currencies: Array<{
      currency: string;
      amount: number;
      baseCurrencyValue: number;
    }>;
  }>;
  
  // Risk metrics
  riskMetrics: {
    concentrationRisk: number; // 0-100 score
    volatilityRisk: number; // Based on currency volatility
    hedgingRatio: number; // Percentage of exposure hedged
  };
  
  // Recommendations
  recommendations: Array<{
    type: 'rebalance' | 'hedge' | 'consolidate' | 'diversify';
    priority: 'high' | 'medium' | 'low';
    description: string;
    currencies: string[];
    potentialImpact: number;
  }>;
}

export interface CurrencyPerformanceMetrics {
  currency: string;
  baseCurrency: string;
  period: string; // '1D', '1W', '1M', '3M', '1Y'
  
  // Performance data
  startRate: number;
  endRate: number;
  changeAmount: number;
  changePercentage: number;
  
  // Statistical measures
  volatility: number; // Standard deviation of daily returns
  averageRate: number;
  highestRate: number;
  lowestRate: number;
  
  // Trend analysis
  trend: 'bullish' | 'bearish' | 'sideways';
  trendStrength: number; // 0-100
  
  // Moving averages
  movingAverages: {
    ma7: number;
    ma30: number;
    ma90: number;
  };
  
  // Volume and liquidity (if available)
  averageVolume?: number;
  liquidityScore?: number; // 0-100
}

// -------------------- Multi-Currency Settings --------------------

export interface MultiCurrencySettings {
  tenantId: string;
  
  // Base currency configuration
  baseCurrency: string; // Organization's primary currency
  displayCurrency?: string; // Preferred display currency (can differ from base)
  
  // Supported currencies
  activeCurrencies: string[]; // Currencies actively used
  allowedCurrencies: string[]; // Currencies allowed for transactions
  
  // Exchange rate settings
  exchangeRateSettings: {
    autoUpdate: boolean;
    updateFrequency: 'real_time' | 'hourly' | 'daily';
    primaryProvider: string;
    fallbackProviders: string[];
    rateValidityPeriod: number; // Hours before rate is considered stale
    allowManualRates: boolean;
    requireApprovalForManualRates: boolean;
  };
  
  // Conversion settings
  conversionSettings: {
    autoConvertToBase: boolean;
    autoConvertThreshold?: number; // Auto-convert amounts above this threshold
    roundingMode: 'round' | 'floor' | 'ceiling';
    decimalPlaces: number; // For converted amounts
  };
  
  // Reporting settings
  reportingSettings: {
    defaultReportingCurrency: string;
    includeExchangeRateInfo: boolean;
    showCurrencySymbols: boolean;
    dateFormat: string;
  };
  
  // Risk management
  riskSettings: {
    enableExposureAlerts: boolean;
    maxExposurePerCurrency: number; // Percentage
    hedgingThreshold: number; // Amount threshold for hedging recommendations
  };
  
  // Compliance settings
  complianceSettings: {
    requireDocumentationForLargeAmounts: boolean;
    largeAmountThreshold: number;
    auditTrailRetentionDays: number;
  };
  
  updatedBy: string;
  updatedAt: string;
}

// -------------------- Currency Conversion Utilities --------------------

export interface CurrencyConversionRequest {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  date?: string; // Use historical rate for this date
  rateSource?: 'current' | 'historical' | 'manual';
  manualRate?: number; // For manual conversions
}

export interface CurrencyConversionResult {
  originalAmount: number;
  convertedAmount: number;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
  
  // Conversion metadata
  rateSource: string;
  rateDate: string;
  confidence: number;
  
  // Additional information
  fees?: number;
  feesCurrency?: string;
  spread?: number;
  
  // Formatting
  formattedOriginal: string;
  formattedConverted: string;
  
  convertedAt: string;
}

export interface BulkConversionRequest {
  amounts: Array<{
    id: string;
    amount: number;
    fromCurrency: string;
    toCurrency: string;
  }>;
  date?: string;
  rateSource?: 'current' | 'historical';
}

export interface BulkConversionResult {
  conversions: Array<CurrencyConversionResult & { id: string }>;
  summary: {
    totalRequests: number;
    successful: number;
    failed: number;
    totalOriginalAmount: { [currency: string]: number };
    totalConvertedAmount: { [currency: string]: number };
  };
  exchangeRatesUsed: Array<{
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    source: string;
  }>;
}

// -------------------- Historical Data --------------------

export interface CurrencyHistoricalData {
  currency: string;
  baseCurrency: string;
  startDate: string;
  endDate: string;
  
  // Rate data
  rates: Array<{
    date: string;
    rate: number;
    high?: number;
    low?: number;
    volume?: number;
    source: string;
  }>;
  
  // Statistical summary
  summary: {
    averageRate: number;
    highestRate: number;
    lowestRate: number;
    volatility: number;
    totalChange: number;
    totalChangePercentage: number;
  };
  
  // Data quality
  dataQuality: {
    completeness: number; // 0-100 percentage
    gaps: Array<{
      startDate: string;
      endDate: string;
      reason: string;
    }>;
  };
}

// -------------------- Import/Export Types --------------------

export interface CurrencyDataImport {
  id: string;
  tenantId: string;
  
  // Import details
  type: 'exchange_rates' | 'transactions' | 'balances';
  fileName: string;
  fileSize: number;
  
  // Processing status
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
  
  // Results
  totalRows: number;
  processedRows: number;
  successfulImports: number;
  errorRows: number;
  
  // Import configuration
  mappings: {
    dateColumn: string;
    fromCurrencyColumn?: string;
    toCurrencyColumn?: string;
    rateColumn?: string;
    amountColumn?: string;
  };
  
  // Validation rules
  validationRules: {
    dateFormat: string;
    allowedCurrencies?: string[];
    maxRate?: number;
    minRate?: number;
  };
  
  // Error details
  errors?: Array<{
    row: number;
    column?: string;
    error: string;
    value?: string;
  }>;
  
  importedBy: string;
  importedAt: string;
  processedAt?: string;
}

// -------------------- API and Integration Types --------------------

export interface CurrencyAPIRequest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  parameters?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface CurrencyAPIResponse {
  success: boolean;
  data?: any;
  error?: string;
  statusCode: number;
  responseTime: number;
  rateLimit?: {
    remaining: number;
    resetTime: string;
  };
}

export interface WebhookEvent {
  id: string;
  type: 'rate_update' | 'rate_alert' | 'conversion_completed' | 'exposure_threshold';
  data: any;
  timestamp: string;
  retryCount: number;
  status: 'pending' | 'delivered' | 'failed';
}