/**
 * Receipt Categorization Service
 * 
 * AI-powered smart categorization with learning capabilities
 */

import type {
  Receipt,
  ExpenseCategory,
  SmartCategorizationRule,
  OCRData
} from './types';

/**
 * Smart categorization service with machine learning capabilities
 */
export class ReceiptCategorizer {
  private categories: ExpenseCategory[] = [];
  private rules: SmartCategorizationRule[] = [];
  private learningEnabled: boolean = true;

  constructor(
    categories: ExpenseCategory[] = [],
    rules: SmartCategorizationRule[] = []
  ) {
    this.categories = categories;
    this.rules = rules;
    this.initializeDefaultCategories();
    this.initializeDefaultRules();
  }

  /**
   * Categorize a receipt using AI and rules
   */
  async categorizeReceipt(receipt: Receipt, ocrData?: OCRData): Promise<{
    category: ExpenseCategory;
    confidence: number;
    reasoning: string[];
    suggestedSubcategory?: string;
  }> {
    const text = ocrData?.rawText || `${receipt.vendor} ${receipt.notes || ''}`;
    const amount = receipt.totalAmount;
    
    // Try rule-based categorization first
    const ruleMatch = this.applyRules(receipt, text, amount);
    if (ruleMatch && ruleMatch.confidence > 80) {
      return ruleMatch;
    }

    // Fallback to pattern matching
    const patternMatch = this.applyPatternMatching(receipt, text, amount);
    if (patternMatch) {
      return patternMatch;
    }

    // Default to uncategorized
    const defaultCategory = this.categories.find(c => c.name === 'Uncategorized') || this.categories[0];
    return {
      category: defaultCategory,
      confidence: 20,
      reasoning: ['No matching patterns found', 'Assigned to default category'],
      suggestedSubcategory: undefined
    };
  }

  /**
   * Apply smart categorization rules
   */
  private applyRules(receipt: Receipt, text: string, amount: number): {
    category: ExpenseCategory;
    confidence: number;
    reasoning: string[];
    suggestedSubcategory?: string;
  } | null {
    const textLower = text.toLowerCase();
    const vendor = receipt.vendor.toLowerCase();

    for (const rule of this.rules.filter(r => r.isActive)) {
      let confidence = 0;
      const reasoning: string[] = [];

      // Check merchant patterns
      for (const pattern of rule.merchantPatterns) {
        if (vendor.includes(pattern.toLowerCase()) || textLower.includes(pattern.toLowerCase())) {
          confidence += 30;
          reasoning.push(`Matched merchant pattern: ${pattern}`);
          break;
        }
      }

      // Check description patterns
      for (const pattern of rule.descriptionPatterns) {
        if (textLower.includes(pattern.toLowerCase())) {
          confidence += 25;
          reasoning.push(`Matched description pattern: ${pattern}`);
        }
      }

      // Check amount conditions
      if (rule.amountConditions) {
        const { operator, value } = rule.amountConditions;
        let amountMatch = false;

        switch (operator) {
          case 'gt':
            amountMatch = amount > (value as number);
            break;
          case 'lt':
            amountMatch = amount < (value as number);
            break;
          case 'eq':
            amountMatch = Math.abs(amount - (value as number)) < 0.01;
            break;
          case 'between':
            const [min, max] = value as [number, number];
            amountMatch = amount >= min && amount <= max;
            break;
        }

        if (amountMatch) {
          confidence += 20;
          reasoning.push(`Matched amount condition: ${operator} ${Array.isArray(value) ? value.join('-') : value}`);
        }
      }

      // Apply rule confidence multiplier
      confidence = confidence * (rule.confidence / 100);

      if (confidence >= rule.confidence) {
        const category = this.categories.find(c => c.id === rule.categoryId);
        if (category) {
          // Update rule statistics
          this.updateRuleStats(rule.id, true);

          return {
            category,
            confidence: Math.min(confidence, 95), // Cap at 95% for rule-based
            reasoning,
            suggestedSubcategory: this.suggestSubcategory(category, text, amount)
          };
        }
      }
    }

    return null;
  }

  /**
   * Apply pattern matching categorization
   */
  private applyPatternMatching(receipt: Receipt, text: string, amount: number): {
    category: ExpenseCategory;
    confidence: number;
    reasoning: string[];
    suggestedSubcategory?: string;
  } | null {
    const textLower = text.toLowerCase();
    const vendor = receipt.vendor.toLowerCase();

    // Score each category
    const categoryScores: Array<{
      category: ExpenseCategory;
      score: number;
      reasoning: string[];
    }> = [];

    for (const category of this.categories) {
      let score = 0;
      const reasoning: string[] = [];

      // Check keywords
      for (const keyword of category.keywords) {
        const keywordLower = keyword.toLowerCase();
        if (vendor.includes(keywordLower)) {
          score += 40;
          reasoning.push(`Vendor contains keyword: ${keyword}`);
        } else if (textLower.includes(keywordLower)) {
          score += 30;
          reasoning.push(`Text contains keyword: ${keyword}`);
        }
      }

      // Check merchant patterns
      for (const pattern of category.merchantPatterns) {
        const patternLower = pattern.toLowerCase();
        if (vendor.includes(patternLower) || textLower.includes(patternLower)) {
          score += 35;
          reasoning.push(`Matched merchant pattern: ${pattern}`);
        }
      }

      // Check amount ranges
      if (category.amountRanges) {
        for (const range of category.amountRanges) {
          const { min = 0, max = Infinity, weight } = range;
          if (amount >= min && amount <= max) {
            score += weight;
            reasoning.push(`Amount ${amount} within range ${min}-${max === Infinity ? '∞' : max}`);
          }
        }
      }

      if (score > 0) {
        categoryScores.push({ category, score, reasoning });
      }
    }

    // Return highest scoring category if confidence is sufficient
    if (categoryScores.length > 0) {
      const best = categoryScores.sort((a, b) => b.score - a.score)[0];
      if (best.score >= 30) {
        return {
          category: best.category,
          confidence: Math.min(best.score, 85), // Cap at 85% for pattern matching
          reasoning: best.reasoning,
          suggestedSubcategory: this.suggestSubcategory(best.category, text, amount)
        };
      }
    }

    return null;
  }

  /**
   * Suggest subcategory based on context
   */
  private suggestSubcategory(category: ExpenseCategory, text: string, amount: number): string | undefined {
    const textLower = text.toLowerCase();

    // Category-specific subcategory logic
    switch (category.name.toLowerCase()) {
      case 'meals & entertainment':
        if (textLower.includes('lunch') || textLower.includes('dinner')) return 'Business Meals';
        if (textLower.includes('coffee') || textLower.includes('starbucks')) return 'Coffee & Beverages';
        if (textLower.includes('uber') || textLower.includes('lyft')) return 'Client Transportation';
        break;

      case 'travel':
        if (textLower.includes('hotel') || textLower.includes('airbnb')) return 'Accommodation';
        if (textLower.includes('airline') || textLower.includes('flight')) return 'Flights';
        if (textLower.includes('gas') || textLower.includes('fuel')) return 'Vehicle Expenses';
        break;

      case 'office supplies':
        if (textLower.includes('paper') || textLower.includes('pen')) return 'Stationery';
        if (textLower.includes('computer') || textLower.includes('laptop')) return 'Equipment';
        break;

      case 'software':
        if (textLower.includes('microsoft') || textLower.includes('adobe')) return 'Business Software';
        if (textLower.includes('subscription') || textLower.includes('/mo')) return 'SaaS Subscriptions';
        break;
    }

    return undefined;
  }

  /**
   * Learn from user corrections
   */
  async learnFromCorrection(
    receipt: Receipt,
    originalCategory: string,
    correctedCategory: string,
    userFeedback?: string
  ): Promise<void> {
    if (!this.learningEnabled) return;

    const vendor = receipt.vendor.toLowerCase();
    const text = receipt.notes?.toLowerCase() || '';

    // Find or create a rule for this vendor
    let rule = this.rules.find(r => 
      r.merchantPatterns.some(p => p.toLowerCase() === vendor) ||
      r.name === `Auto-learned: ${receipt.vendor}`
    );

    if (!rule) {
      // Create new rule
      const newRule: SmartCategorizationRule = {
        id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tenantId: receipt.tenantId,
        name: `Auto-learned: ${receipt.vendor}`,
        merchantPatterns: [vendor],
        descriptionPatterns: text ? [text] : [],
        categoryId: correctedCategory,
        confidence: 75,
        autoApprove: false,
        successRate: 100,
        timesApplied: 1,
        lastUsed: new Date().toISOString(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.rules.push(newRule);
    } else {
      // Update existing rule
      rule.categoryId = correctedCategory;
      rule.successRate = Math.min(rule.successRate + 5, 100);
      rule.confidence = Math.min(rule.confidence + 2, 90);
      rule.lastUsed = new Date().toISOString();
      rule.updatedAt = new Date().toISOString();
    }

    // Add negative patterns for the wrong category if it was highly confident
    if (originalCategory !== correctedCategory) {
      // Could implement negative pattern learning here
    }
  }

  /**
   * Update rule statistics
   */
  private updateRuleStats(ruleId: string, successful: boolean): void {
    const rule = this.rules.find(r => r.id === ruleId);
    if (!rule) return;

    rule.timesApplied++;
    rule.lastUsed = new Date().toISOString();
    
    if (successful) {
      rule.successRate = ((rule.successRate * (rule.timesApplied - 1)) + 100) / rule.timesApplied;
    } else {
      rule.successRate = ((rule.successRate * (rule.timesApplied - 1)) + 0) / rule.timesApplied;
    }

    // Adjust confidence based on success rate
    if (rule.successRate > 90) {
      rule.confidence = Math.min(rule.confidence + 1, 95);
    } else if (rule.successRate < 60) {
      rule.confidence = Math.max(rule.confidence - 2, 30);
    }

    // Disable rule if it's performing poorly
    if (rule.successRate < 40 && rule.timesApplied > 10) {
      rule.isActive = false;
    }
  }

  /**
   * Initialize default expense categories
   */
  private initializeDefaultCategories(): void {
    if (this.categories.length > 0) return;

    const defaultCategories: Partial<ExpenseCategory>[] = [
      {
        name: 'Meals & Entertainment',
        description: 'Business meals, client entertainment, coffee meetings',
        keywords: ['restaurant', 'lunch', 'dinner', 'coffee', 'starbucks', 'food', 'catering'],
        merchantPatterns: ['restaurant', 'cafe', 'bar', 'pizza', 'burger'],
        taxDeductible: true,
        requiresReceipt: true,
        requiresApproval: true,
        autoApproveUnder: 100
      },
      {
        name: 'Travel',
        description: 'Business travel expenses including flights, hotels, transportation',
        keywords: ['hotel', 'flight', 'airline', 'uber', 'lyft', 'taxi', 'gas', 'parking'],
        merchantPatterns: ['hotel', 'airlines', 'uber', 'lyft', 'shell', 'chevron'],
        taxDeductible: true,
        requiresReceipt: true,
        requiresApproval: true,
        autoApproveUnder: 500
      },
      {
        name: 'Office Supplies',
        description: 'Office equipment, supplies, stationery',
        keywords: ['office', 'paper', 'pen', 'stapler', 'supplies', 'equipment'],
        merchantPatterns: ['staples', 'office depot', 'best buy', 'amazon'],
        taxDeductible: true,
        requiresReceipt: true,
        requiresApproval: false,
        autoApproveUnder: 200
      },
      {
        name: 'Software',
        description: 'Software licenses, SaaS subscriptions, development tools',
        keywords: ['software', 'license', 'subscription', 'saas', 'microsoft', 'adobe', 'github'],
        merchantPatterns: ['microsoft', 'adobe', 'github', 'slack', 'zoom'],
        taxDeductible: true,
        requiresReceipt: false,
        requiresApproval: true,
        autoApproveUnder: 100
      },
      {
        name: 'Marketing',
        description: 'Marketing and advertising expenses',
        keywords: ['marketing', 'advertising', 'ads', 'promotion', 'facebook', 'google'],
        merchantPatterns: ['facebook', 'google ads', 'linkedin', 'twitter'],
        taxDeductible: true,
        requiresReceipt: true,
        requiresApproval: true,
        autoApproveUnder: 1000
      },
      {
        name: 'Professional Services',
        description: 'Legal, accounting, consulting services',
        keywords: ['legal', 'accounting', 'consulting', 'lawyer', 'accountant'],
        merchantPatterns: ['law firm', 'accounting', 'consulting'],
        taxDeductible: true,
        requiresReceipt: true,
        requiresApproval: true,
        autoApproveUnder: 2000
      },
      {
        name: 'Utilities',
        description: 'Internet, phone, electricity, water',
        keywords: ['internet', 'phone', 'electricity', 'water', 'utility'],
        merchantPatterns: ['verizon', 'att', 'comcast', 'electric', 'gas company'],
        taxDeductible: true,
        requiresReceipt: false,
        requiresApproval: false,
        autoApproveUnder: 500
      },
      {
        name: 'Uncategorized',
        description: 'Expenses that need manual categorization',
        keywords: [],
        merchantPatterns: [],
        taxDeductible: false,
        requiresReceipt: true,
        requiresApproval: true
      }
    ];

    this.categories = defaultCategories.map((cat, index) => ({
      id: `cat_${index + 1}`,
      tenantId: 'default',
      parentId: undefined,
      chartOfAccountsId: undefined,
      amountRanges: undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...cat
    } as ExpenseCategory));
  }

  /**
   * Initialize default categorization rules
   */
  private initializeDefaultRules(): void {
    if (this.rules.length > 0) return;

    const mealsCategory = this.categories.find(c => c.name === 'Meals & Entertainment');
    const travelCategory = this.categories.find(c => c.name === 'Travel');
    const softwareCategory = this.categories.find(c => c.name === 'Software');

    if (!mealsCategory || !travelCategory || !softwareCategory) return;

    const defaultRules: Partial<SmartCategorizationRule>[] = [
      {
        name: 'Starbucks Auto-categorization',
        merchantPatterns: ['starbucks', 'coffee'],
        descriptionPatterns: ['coffee', 'latte', 'espresso'],
        categoryId: mealsCategory.id,
        confidence: 90,
        autoApprove: true
      },
      {
        name: 'Uber/Lyft Travel',
        merchantPatterns: ['uber', 'lyft'],
        descriptionPatterns: ['ride', 'trip'],
        categoryId: travelCategory.id,
        confidence: 85,
        autoApprove: false
      },
      {
        name: 'Microsoft/Adobe Software',
        merchantPatterns: ['microsoft', 'adobe', 'github'],
        descriptionPatterns: ['subscription', 'license'],
        categoryId: softwareCategory.id,
        confidence: 95,
        autoApprove: true
      }
    ];

    this.rules = defaultRules.map((rule, index) => ({
      id: `rule_${index + 1}`,
      tenantId: 'default',
      amountConditions: undefined,
      successRate: 85,
      timesApplied: 0,
      lastUsed: undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...rule
    } as SmartCategorizationRule));
  }

  /**
   * Get categorization suggestions for manual review
   */
  async getSuggestions(receipt: Receipt, limit: number = 3): Promise<Array<{
    category: ExpenseCategory;
    confidence: number;
    reasoning: string[];
  }>> {
    const result = await this.categorizeReceipt(receipt);
    
    // For now, return the single best match
    // In a real implementation, this would return multiple possibilities
    return [
      {
        category: result.category,
        confidence: result.confidence,
        reasoning: result.reasoning
      }
    ];
  }

  /**
   * Bulk categorize multiple receipts
   */
  async bulkCategorize(receipts: Receipt[]): Promise<Map<string, {
    category: ExpenseCategory;
    confidence: number;
    reasoning: string[];
  }>> {
    const results = new Map();
    
    for (const receipt of receipts) {
      try {
        const result = await this.categorizeReceipt(receipt);
        results.set(receipt.id, result);
      } catch (error) {
        console.error(`Failed to categorize receipt ${receipt.id}:`, error);
      }
    }
    
    return results;
  }
}