// Re-export all types
export * from './types';

// Export categorization utilities and engines
export const EXPENSE_CATEGORIES = {
  // Office & Administration
  OFFICE_SUPPLIES: 'office_supplies',
  SOFTWARE_LICENSES: 'software_licenses',
  OFFICE_RENT: 'office_rent',
  UTILITIES: 'utilities',
  PHONE_INTERNET: 'phone_internet',
  
  // Travel & Transportation
  AIRFARE: 'airfare',
  HOTELS: 'hotels',
  CAR_RENTAL: 'car_rental',
  TAXI_UBER: 'taxi_uber',
  PARKING: 'parking',
  MILEAGE: 'mileage',
  
  // Meals & Entertainment
  BUSINESS_MEALS: 'business_meals',
  CLIENT_ENTERTAINMENT: 'client_entertainment',
  TEAM_MEALS: 'team_meals',
  
  // Professional Services
  LEGAL_FEES: 'legal_fees',
  ACCOUNTING_FEES: 'accounting_fees',
  CONSULTING: 'consulting',
  INSURANCE: 'insurance',
  
  // Marketing & Advertising
  ADVERTISING: 'advertising',
  MARKETING_MATERIALS: 'marketing_materials',
  TRADE_SHOWS: 'trade_shows',
  WEBSITE_HOSTING: 'website_hosting',
  
  // Equipment & Assets
  COMPUTER_EQUIPMENT: 'computer_equipment',
  OFFICE_FURNITURE: 'office_furniture',
  MACHINERY: 'machinery',
  
  // Other
  BANK_FEES: 'bank_fees',
  TAXES: 'taxes',
  TRAINING: 'training',
  RESEARCH: 'research',
  UNCATEGORIZED: 'uncategorized'
} as const;

export const VENDOR_PATTERNS = {
  // Common vendor patterns for automatic categorization
  OFFICE_SUPPLIES: [
    /staples/i, /office depot/i, /best buy/i, /amazon.*office/i,
    /costco.*supplies/i, /walmart.*office/i
  ],
  SOFTWARE: [
    /microsoft/i, /adobe/i, /google workspace/i, /office 365/i,
    /slack/i, /zoom/i, /dropbox/i, /github/i, /aws/i, /azure/i
  ],
  UTILITIES: [
    /electric/i, /gas company/i, /water dept/i, /internet/i,
    /verizon/i, /att/i, /comcast/i, /xfinity/i
  ],
  TRAVEL: [
    /airlines?/i, /hotel/i, /marriott/i, /hilton/i, /uber/i, /lyft/i,
    /enterprise/i, /hertz/i, /avis/i, /expedia/i, /booking\.com/i
  ],
  RESTAURANTS: [
    /restaurant/i, /cafe/i, /coffee/i, /starbucks/i, /subway/i,
    /mcdonald/i, /pizza/i, /burger/i, /diner/i
  ],
  GAS_STATIONS: [
    /shell/i, /exxon/i, /bp/i, /chevron/i, /mobil/i, /speedway/i,
    /gas.*station/i, /fuel/i
  ],
  PROFESSIONAL_SERVICES: [
    /law.*firm/i, /attorney/i, /cpa/i, /accountant/i, /consulting/i,
    /insurance/i, /agent/i
  ]
};

// Core categorization engine
export class ExpenseCategorizationEngine {
  private rules: any[] = [];
  private categories: any[] = [];
  private learningData: Map<string, any[]> = new Map();

  constructor() {
    this.initializeDefaultCategories();
    this.initializeDefaultRules();
  }

  private initializeDefaultCategories() {
    this.categories = [
      {
        id: 'office_supplies',
        name: 'Office Supplies',
        keywords: ['paper', 'pens', 'supplies', 'stationery', 'printer'],
        vendorPatterns: VENDOR_PATTERNS.OFFICE_SUPPLIES,
        taxDeductible: true
      },
      {
        id: 'software_licenses',
        name: 'Software & Licenses',
        keywords: ['software', 'license', 'subscription', 'saas', 'cloud'],
        vendorPatterns: VENDOR_PATTERNS.SOFTWARE,
        taxDeductible: true
      },
      {
        id: 'travel',
        name: 'Travel & Transportation',
        keywords: ['flight', 'hotel', 'travel', 'taxi', 'uber', 'rental'],
        vendorPatterns: VENDOR_PATTERNS.TRAVEL,
        taxDeductible: true
      },
      {
        id: 'meals',
        name: 'Meals & Entertainment',
        keywords: ['restaurant', 'meal', 'lunch', 'dinner', 'catering'],
        vendorPatterns: VENDOR_PATTERNS.RESTAURANTS,
        taxDeductible: true,
        amountRanges: [{ min: 5, max: 500 }]
      },
      {
        id: 'utilities',
        name: 'Utilities',
        keywords: ['electric', 'gas', 'water', 'internet', 'phone'],
        vendorPatterns: VENDOR_PATTERNS.UTILITIES,
        taxDeductible: true
      },
      {
        id: 'professional_services',
        name: 'Professional Services',
        keywords: ['legal', 'accounting', 'consulting', 'insurance'],
        vendorPatterns: VENDOR_PATTERNS.PROFESSIONAL_SERVICES,
        taxDeductible: true
      }
    ];
  }

  private initializeDefaultRules() {
    this.rules = [
      {
        id: 'rule_1',
        priority: 100,
        criteria: {
          vendorPatterns: [/amazon.*office/i, /staples/i, /office depot/i],
          amountRange: { min: 1, max: 500 }
        },
        actions: { setCategoryId: 'office_supplies', setConfidence: 85 }
      },
      {
        id: 'rule_2',
        priority: 90,
        criteria: {
          descriptionContains: ['microsoft', 'adobe', 'software', 'license'],
          amountRange: { min: 10, max: 1000 }
        },
        actions: { setCategoryId: 'software_licenses', setConfidence: 90 }
      },
      {
        id: 'rule_3',
        priority: 80,
        criteria: {
          vendorPatterns: [/uber/i, /lyft/i, /taxi/i],
          amountRange: { min: 5, max: 200 }
        },
        actions: { setCategoryId: 'travel', setConfidence: 95 }
      },
      {
        id: 'rule_4',
        priority: 75,
        criteria: {
          descriptionContains: ['restaurant', 'cafe', 'lunch', 'dinner'],
          amountRange: { min: 5, max: 300 }
        },
        actions: { setCategoryId: 'meals', setConfidence: 80 }
      }
    ];
  }

  // Main categorization method
  categorizeExpense(expense: {
    vendor: string;
    description: string;
    amount: number;
    date: string;
  }): any {
    const predictions: any[] = [];

    // Rule-based categorization
    const rulePrediction = this.applyRules(expense);
    if (rulePrediction) {
      predictions.push(rulePrediction);
    }

    // Pattern-based categorization
    const patternPrediction = this.applyPatterns(expense);
    if (patternPrediction) {
      predictions.push(patternPrediction);
    }

    // Historical analysis
    const historicalPrediction = this.analyzeHistoricalPatterns(expense);
    if (historicalPrediction) {
      predictions.push(historicalPrediction);
    }

    // Combine predictions and select the best one
    const finalPrediction = this.combinePredictions(predictions);

    return {
      transactionId: `txn_${Date.now()}`,
      predictedCategoryId: finalPrediction.categoryId,
      confidence: finalPrediction.confidence,
      alternatives: predictions.slice(1, 4).map(p => ({
        categoryId: p.categoryId,
        confidence: p.confidence,
        reason: p.reason
      })),
      reasons: finalPrediction.reasons,
      modelVersion: '1.0.0',
      modelType: 'hybrid',
      dataQuality: this.assessDataQuality(expense),
      predictedAt: new Date().toISOString(),
      processingTime: Math.random() * 100 + 50 // Mock processing time
    };
  }

  private applyRules(expense: any): any | null {
    const matchingRules = this.rules
      .filter(rule => this.evaluateRuleCriteria(rule.criteria, expense))
      .sort((a, b) => b.priority - a.priority);

    if (matchingRules.length > 0) {
      const rule = matchingRules[0];
      return {
        categoryId: rule.actions.setCategoryId,
        confidence: rule.actions.setConfidence || 75,
        reason: 'Matched categorization rule',
        reasons: [{
          type: 'rule_based',
          explanation: `Matched rule: ${rule.id}`,
          weight: 0.8
        }]
      };
    }

    return null;
  }

  private evaluateRuleCriteria(criteria: any, expense: any): boolean {
    // Vendor pattern matching
    if (criteria.vendorPatterns) {
      const vendorMatch = criteria.vendorPatterns.some((pattern: RegExp) => 
        pattern.test(expense.vendor) || pattern.test(expense.description)
      );
      if (!vendorMatch) return false;
    }

    // Description matching
    if (criteria.descriptionContains) {
      const descMatch = criteria.descriptionContains.some((keyword: string) =>
        expense.description.toLowerCase().includes(keyword.toLowerCase()) ||
        expense.vendor.toLowerCase().includes(keyword.toLowerCase())
      );
      if (!descMatch) return false;
    }

    // Amount range
    if (criteria.amountRange) {
      const amount = Math.abs(expense.amount);
      if (criteria.amountRange.min && amount < criteria.amountRange.min) return false;
      if (criteria.amountRange.max && amount > criteria.amountRange.max) return false;
    }

    return true;
  }

  private applyPatterns(expense: any): any | null {
    const text = `${expense.vendor} ${expense.description}`.toLowerCase();
    
    // Check against category patterns
    for (const category of this.categories) {
      let score = 0;
      let matchReasons: string[] = [];

      // Keyword matching
      if (category.keywords) {
        const keywordMatches = category.keywords.filter((keyword: string) =>
          text.includes(keyword.toLowerCase())
        ).length;
        score += (keywordMatches / category.keywords.length) * 40;
        if (keywordMatches > 0) {
          matchReasons.push(`Keyword matches: ${keywordMatches}`);
        }
      }

      // Vendor pattern matching
      if (category.vendorPatterns) {
        const patternMatches = category.vendorPatterns.filter((pattern: RegExp) =>
          pattern.test(text)
        ).length;
        score += (patternMatches / category.vendorPatterns.length) * 60;
        if (patternMatches > 0) {
          matchReasons.push(`Vendor pattern matches: ${patternMatches}`);
        }
      }

      // Amount range matching
      if (category.amountRanges) {
        const amount = Math.abs(expense.amount);
        const inRange = category.amountRanges.some((range: any) =>
          (!range.min || amount >= range.min) && (!range.max || amount <= range.max)
        );
        if (inRange) {
          score += 20;
          matchReasons.push('Amount in expected range');
        }
      }

      if (score > 50) {
        return {
          categoryId: category.id,
          confidence: Math.min(score, 95),
          reason: matchReasons.join(', '),
          reasons: [{
            type: 'description_match',
            explanation: matchReasons.join(', '),
            weight: score / 100
          }]
        };
      }
    }

    return null;
  }

  private analyzeHistoricalPatterns(expense: any): any | null {
    // Mock historical analysis
    const vendorHistory = this.learningData.get(expense.vendor.toLowerCase());
    
    if (vendorHistory && vendorHistory.length > 2) {
      const categoryFrequency = vendorHistory.reduce((acc, hist) => {
        acc[hist.categoryId] = (acc[hist.categoryId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostFrequent = Object.entries(categoryFrequency)
        .sort(([,a], [,b]) => b - a)[0];

      if (mostFrequent) {
        const confidence = (mostFrequent[1] / vendorHistory.length) * 100;
        
        return {
          categoryId: mostFrequent[0],
          confidence: Math.min(confidence, 85),
          reason: `Historical pattern with ${expense.vendor}`,
          reasons: [{
            type: 'historical_pattern',
            explanation: `${mostFrequent[1]} of ${vendorHistory.length} past transactions`,
            weight: confidence / 100
          }]
        };
      }
    }

    return null;
  }

  private combinePredictions(predictions: any[]): any {
    if (predictions.length === 0) {
      return {
        categoryId: 'uncategorized',
        confidence: 0,
        reasons: [{
          type: 'rule_based',
          explanation: 'No matching patterns found',
          weight: 0
        }]
      };
    }

    // Sort by confidence and return the highest
    predictions.sort((a, b) => b.confidence - a.confidence);
    return predictions[0];
  }

  private assessDataQuality(expense: any): any {
    let completeness = 0;
    let richness = 0;

    // Completeness (required fields)
    if (expense.vendor) completeness += 25;
    if (expense.description) completeness += 25;
    if (expense.amount) completeness += 25;
    if (expense.date) completeness += 25;

    // Richness (detail level)
    if (expense.vendor && expense.vendor.length > 5) richness += 20;
    if (expense.description && expense.description.length > 10) richness += 20;
    if (expense.amount && expense.amount !== 0) richness += 20;
    if (expense.location) richness += 20;
    if (expense.paymentMethod) richness += 20;

    return {
      completeness,
      richness,
      consistency: 85 // Mock consistency score
    };
  }

  // Learning methods
  addFeedback(feedback: {
    vendor: string;
    description: string;
    amount: number;
    actualCategoryId: string;
    wasCorrect: boolean;
  }) {
    const vendorKey = feedback.vendor.toLowerCase();
    if (!this.learningData.has(vendorKey)) {
      this.learningData.set(vendorKey, []);
    }
    
    this.learningData.get(vendorKey)!.push({
      categoryId: feedback.actualCategoryId,
      amount: feedback.amount,
      description: feedback.description,
      timestamp: new Date().toISOString()
    });

    // Auto-create rules if we see consistent patterns
    this.considerNewRule(feedback);
  }

  private considerNewRule(feedback: any) {
    const vendorHistory = this.learningData.get(feedback.vendor.toLowerCase());
    
    if (vendorHistory && vendorHistory.length >= 3) {
      const sameCategory = vendorHistory.filter(h => h.categoryId === feedback.actualCategoryId);
      
      if (sameCategory.length >= 3) {
        // High confidence pattern - could create a new rule
        console.log(`Potential new rule: ${feedback.vendor} -> ${feedback.actualCategoryId}`);
      }
    }
  }
}

// Utility functions
export function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

export function extractVendorFromDescription(description: string): string {
  // Remove common transaction prefixes/suffixes
  let vendor = description
    .replace(/^(purchase|payment|charge|debit|credit)\s+/i, '')
    .replace(/\s+(purchase|payment|charge|pos|online)$/i, '')
    .replace(/\s+\d{2}\/\d{2}$/, '') // Remove dates
    .replace(/\s+#\d+$/, '') // Remove reference numbers
    .trim();

  // Extract vendor name (usually the first part)
  const parts = vendor.split(/\s+/);
  if (parts.length > 0) {
    vendor = parts.slice(0, Math.min(3, parts.length)).join(' ');
  }

  return vendor;
}

export function normalizeAmount(amount: string | number): number {
  if (typeof amount === 'number') return amount;
  
  // Remove currency symbols and clean up
  const cleaned = amount.toString()
    .replace(/[$£€¥₹]/g, '')
    .replace(/,/g, '')
    .replace(/[()]/g, '') // Remove parentheses
    .trim();

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// Mock data generators
export function generateMockExpenseCategories(): any[] {
  return [
    {
      id: 'office_supplies',
      name: 'Office Supplies',
      parentId: 'office',
      level: 2,
      path: 'Office > Supplies',
      isActive: true,
      keywords: ['paper', 'pens', 'supplies', 'stationery'],
      vendorPatterns: ['staples', 'office depot', 'amazon office'],
      taxDeductible: true,
      usageCount: 45,
      averageAmount: 125.50,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'software_licenses',
      name: 'Software & Licenses',
      parentId: 'technology',
      level: 2,
      path: 'Technology > Software',
      isActive: true,
      keywords: ['software', 'license', 'subscription'],
      vendorPatterns: ['microsoft', 'adobe', 'google'],
      taxDeductible: true,
      usageCount: 32,
      averageAmount: 289.99,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'travel',
      name: 'Travel & Transportation',
      parentId: null,
      level: 1,
      path: 'Travel',
      isActive: true,
      keywords: ['flight', 'hotel', 'uber', 'taxi'],
      vendorPatterns: ['airlines', 'marriott', 'uber'],
      taxDeductible: true,
      usageCount: 28,
      averageAmount: 456.75,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    }
  ];
}

export function generateMockCategorizationRules(): any[] {
  return [
    {
      id: 'rule_1',
      tenantId: 'demo-tenant',
      name: 'Office Supply Vendors',
      priority: 100,
      isActive: true,
      criteria: {
        vendorPatterns: ['/staples/i', '/office depot/i'],
        amountRange: { min: 1, max: 500 }
      },
      actions: {
        setCategoryId: 'office_supplies',
        setConfidence: 90
      },
      learningEnabled: true,
      accuracyRate: 92.5,
      timesApplied: 156,
      lastAppliedAt: '2024-01-15T14:22:00Z',
      createdBy: 'system',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T14:22:00Z'
    },
    {
      id: 'rule_2',
      tenantId: 'demo-tenant',
      name: 'Software Subscriptions',
      priority: 95,
      isActive: true,
      criteria: {
        descriptionContains: ['subscription', 'license', 'saas'],
        amountRange: { min: 10, max: 1000 }
      },
      actions: {
        setCategoryId: 'software_licenses',
        setConfidence: 85
      },
      learningEnabled: true,
      accuracyRate: 88.2,
      timesApplied: 89,
      lastAppliedAt: '2024-01-14T09:15:00Z',
      createdBy: 'john.doe@example.com',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-14T09:15:00Z'
    }
  ];
}

export function generateMockPrediction(expense: any): any {
  const engine = new ExpenseCategorizationEngine();
  return engine.categorizeExpense(expense);
}