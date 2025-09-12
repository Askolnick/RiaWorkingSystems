import { BaseRepository, MockRepository } from './base.repository';
import type { PaginatedResponse } from '../types';

// Income Statement Types (copied from server package)
export interface IncomeStatement {
  id: string;
  tenantId: string;
  
  // Period Information
  periodStart: string;
  periodEnd: string;
  periodType: 'monthly' | 'quarterly' | 'annual';
  fiscalYear: number;
  quarter?: number;
  month?: number;
  
  // Revenue
  revenue: Revenue;
  totalRevenue: number;
  
  // Cost of Goods Sold
  costOfGoodsSold: CostOfGoodsSold;
  totalCOGS: number;
  
  // Gross Profit
  grossProfit: number;
  grossProfitMargin: number;
  
  // Operating Expenses
  operatingExpenses: OperatingExpenses;
  totalOperatingExpenses: number;
  
  // Operating Income
  operatingIncome: number;
  operatingMargin: number;
  
  // Other Income/Expenses
  otherIncomeExpenses: OtherIncomeExpenses;
  totalOtherIncomeExpenses: number;
  
  // Pre-tax Income
  incomeBeforeTax: number;
  
  // Taxes
  incomeTax: number;
  effectiveTaxRate: number;
  
  // Net Income
  netIncome: number;
  netProfitMargin: number;
  
  // Earnings Per Share (if applicable)
  earningsPerShare?: number;
  dilutedEPS?: number;
  
  // Metadata
  currency: string;
  status: 'draft' | 'pending_review' | 'approved' | 'published';
  generatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  
  // Audit Trail
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export interface Revenue {
  productRevenue: number;
  serviceRevenue: number;
  subscriptionRevenue: number;
  revenueByCategory: RevenueCategory[];
  salesReturns: number;
  salesDiscounts: number;
  allowances: number;
  netRevenue: number;
  yearOverYearGrowth?: number;
  quarterOverQuarterGrowth?: number;
  monthOverMonthGrowth?: number;
}

export interface RevenueCategory {
  category: string;
  amount: number;
  percentage: number;
  unitsSold?: number;
  averagePrice?: number;
}

export interface CostOfGoodsSold {
  directMaterials: number;
  directLabor: number;
  manufacturingOverhead: number;
  beginningInventory: number;
  purchases: number;
  endingInventory: number;
  freight: number;
  customsDuties: number;
  otherDirectCosts: number;
  totalCOGS: number;
}

export interface OperatingExpenses {
  salesAndMarketing: SalesAndMarketingExpenses;
  totalSalesAndMarketing: number;
  generalAndAdministrative: GeneralAdministrativeExpenses;
  totalGeneralAndAdministrative: number;
  researchAndDevelopment: ResearchDevelopmentExpenses;
  totalResearchAndDevelopment: number;
  depreciation: number;
  amortization: number;
  totalDepreciationAmortization: number;
  otherOperatingExpenses: number;
}

export interface SalesAndMarketingExpenses {
  advertising: number;
  promotions: number;
  salesSalaries: number;
  salesCommissions: number;
  travelAndEntertainment: number;
  marketingMaterials: number;
  digitalMarketing: number;
  tradeShows: number;
  other: number;
}

export interface GeneralAdministrativeExpenses {
  administrativeSalaries: number;
  officeRent: number;
  utilities: number;
  insurance: number;
  professionalFees: number;
  officeSupplies: number;
  telecommunications: number;
  softwareSubscriptions: number;
  bankFees: number;
  badDebtExpense: number;
  other: number;
}

export interface ResearchDevelopmentExpenses {
  rdSalaries: number;
  rdMaterials: number;
  rdEquipment: number;
  rdContractors: number;
  patents: number;
  prototypes: number;
  testing: number;
  other: number;
}

export interface OtherIncomeExpenses {
  interestIncome: number;
  dividendIncome: number;
  rentalIncome: number;
  gainOnSaleOfAssets: number;
  foreignExchangeGain: number;
  otherIncome: number;
  totalOtherIncome: number;
  interestExpense: number;
  lossOnSaleOfAssets: number;
  foreignExchangeLoss: number;
  writeDowns: number;
  restructuringCosts: number;
  legalSettlements: number;
  otherExpenses: number;
  totalOtherExpenses: number;
}

export interface ComparativeIncomeStatement {
  currentPeriod: IncomeStatement;
  previousPeriod?: IncomeStatement;
  yearToDate?: IncomeStatement;
  changes: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    operatingExpenses: number;
    operatingIncome: number;
    netIncome: number;
  };
  percentageChanges: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    operatingExpenses: number;
    operatingIncome: number;
    netIncome: number;
  };
}

export interface GenerateIncomeStatementData {
  periodStart: string;
  periodEnd: string;
  periodType: 'monthly' | 'quarterly' | 'annual';
  includeComparison?: boolean;
  includeBudget?: boolean;
  includeSegments?: boolean;
  currency?: string;
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeDetails?: boolean;
  includeCharts?: boolean;
  includeComparisons?: boolean;
  includeBudget?: boolean;
}

export interface ExportResult {
  url: string;
  filename: string;
  size: number;
  generatedAt: string;
}

// Repository Implementation
export class IncomeStatementRepository extends BaseRepository<IncomeStatement> {
  protected endpoint = '/finance/income-statements';

  async generate(data: GenerateIncomeStatementData): Promise<IncomeStatement> {
    return this.request('POST', '/generate', data);
  }

  async getComparative(id: string): Promise<ComparativeIncomeStatement> {
    return this.request('GET', `/${id}/comparative`);
  }

  async approve(id: string, notes?: string): Promise<IncomeStatement> {
    return this.request('POST', `/${id}/approve`, { notes });
  }

  async export(id: string, options: ExportOptions): Promise<ExportResult> {
    return this.request('POST', `/${id}/export`, options);
  }
}

// Mock Implementation
export class MockIncomeStatementRepository extends MockRepository<IncomeStatement> {
  protected storageKey = 'ria_income_statements';
  protected endpoint = '/finance/income-statements';

  constructor() {
    super();
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Skip initialization during SSR
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      const existing = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      if (!existing || existing.length === 0) {
        const mockStatements = this.generateMockStatements();
        localStorage.setItem(this.storageKey, JSON.stringify(mockStatements));
      }
    } catch (error) {
      // If localStorage fails, just generate fresh data
      const mockStatements = this.generateMockStatements();
      localStorage.setItem(this.storageKey, JSON.stringify(mockStatements));
    }
  }

  private generateMockStatements(): IncomeStatement[] {
    const statements: IncomeStatement[] = [];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    // Generate last 12 months of income statements
    for (let i = 11; i >= 0; i--) {
      const month = (currentMonth - i + 12) % 12;
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
      
      statements.push(this.generateMonthlyStatement(year, month));
    }

    // Add quarterly statements
    for (let q = 1; q <= 4; q++) {
      if (year === currentYear && q > Math.floor(currentMonth / 3) + 1) continue;
      statements.push(this.generateQuarterlyStatement(currentYear, q));
    }

    // Add annual statement for last year
    statements.push(this.generateAnnualStatement(currentYear - 1));

    return statements;
  }

  private generateMonthlyStatement(year: number, month: number): IncomeStatement {
    const baseRevenue = 500000 + Math.random() * 200000;
    const baseCOGS = baseRevenue * (0.35 + Math.random() * 0.1);
    const baseOpEx = baseRevenue * (0.25 + Math.random() * 0.1);
    
    const revenue: Revenue = {
      productRevenue: baseRevenue * 0.6,
      serviceRevenue: baseRevenue * 0.25,
      subscriptionRevenue: baseRevenue * 0.15,
      revenueByCategory: [
        { category: 'Enterprise', amount: baseRevenue * 0.4, percentage: 40, unitsSold: 12, averagePrice: 15000 },
        { category: 'SMB', amount: baseRevenue * 0.35, percentage: 35, unitsSold: 45, averagePrice: 3500 },
        { category: 'Startup', amount: baseRevenue * 0.25, percentage: 25, unitsSold: 120, averagePrice: 1000 }
      ],
      salesReturns: baseRevenue * 0.02,
      salesDiscounts: baseRevenue * 0.03,
      allowances: baseRevenue * 0.01,
      netRevenue: baseRevenue * 0.94,
      yearOverYearGrowth: 15 + Math.random() * 10,
      monthOverMonthGrowth: 2 + Math.random() * 5
    };

    const cogs: CostOfGoodsSold = {
      directMaterials: baseCOGS * 0.4,
      directLabor: baseCOGS * 0.35,
      manufacturingOverhead: baseCOGS * 0.15,
      beginningInventory: 50000,
      purchases: baseCOGS * 0.8,
      endingInventory: 45000,
      freight: baseCOGS * 0.05,
      customsDuties: baseCOGS * 0.03,
      otherDirectCosts: baseCOGS * 0.02,
      totalCOGS: baseCOGS
    };

    const salesAndMarketing: SalesAndMarketingExpenses = {
      advertising: 25000,
      promotions: 15000,
      salesSalaries: 80000,
      salesCommissions: baseRevenue * 0.03,
      travelAndEntertainment: 12000,
      marketingMaterials: 8000,
      digitalMarketing: 35000,
      tradeShows: 20000,
      other: 5000
    };

    const generalAdmin: GeneralAdministrativeExpenses = {
      administrativeSalaries: 120000,
      officeRent: 25000,
      utilities: 5000,
      insurance: 12000,
      professionalFees: 18000,
      officeSupplies: 3000,
      telecommunications: 4000,
      softwareSubscriptions: 15000,
      bankFees: 2000,
      badDebtExpense: baseRevenue * 0.005,
      other: 8000
    };

    const rd: ResearchDevelopmentExpenses = {
      rdSalaries: 150000,
      rdMaterials: 20000,
      rdEquipment: 15000,
      rdContractors: 30000,
      patents: 5000,
      prototypes: 12000,
      testing: 8000,
      other: 10000
    };

    const totalSalesMarketing = Object.values(salesAndMarketing).reduce((a, b) => a + b, 0);
    const totalGeneralAdmin = Object.values(generalAdmin).reduce((a, b) => a + b, 0);
    const totalRD = Object.values(rd).reduce((a, b) => a + b, 0);

    const operatingExpenses: OperatingExpenses = {
      salesAndMarketing,
      totalSalesAndMarketing,
      generalAndAdministrative: generalAdmin,
      totalGeneralAndAdministrative: totalGeneralAdmin,
      researchAndDevelopment: rd,
      totalResearchAndDevelopment: totalRD,
      depreciation: 15000,
      amortization: 8000,
      totalDepreciationAmortization: 23000,
      otherOperatingExpenses: 12000
    };

    const totalOperatingExpenses = totalSalesMarketing + totalGeneralAdmin + totalRD + 23000 + 12000;
    const grossProfit = revenue.netRevenue - cogs.totalCOGS;
    const operatingIncome = grossProfit - totalOperatingExpenses;

    const otherIncomeExpenses: OtherIncomeExpenses = {
      interestIncome: 2000,
      dividendIncome: 1500,
      rentalIncome: 5000,
      gainOnSaleOfAssets: 0,
      foreignExchangeGain: 500,
      otherIncome: 1000,
      totalOtherIncome: 10000,
      interestExpense: 8000,
      lossOnSaleOfAssets: 0,
      foreignExchangeLoss: 1000,
      writeDowns: 0,
      restructuringCosts: 0,
      legalSettlements: 0,
      otherExpenses: 2000,
      totalOtherExpenses: 11000
    };

    const totalOtherIncomeExpenses = otherIncomeExpenses.totalOtherIncome - otherIncomeExpenses.totalOtherExpenses;
    const incomeBeforeTax = operatingIncome + totalOtherIncomeExpenses;
    const incomeTax = incomeBeforeTax * 0.21;
    const netIncome = incomeBeforeTax - incomeTax;

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    return {
      id: `stmt-${year}-${String(month + 1).padStart(2, '0')}`,
      tenantId: 'tenant-123',
      periodStart: startDate.toISOString().split('T')[0],
      periodEnd: endDate.toISOString().split('T')[0],
      periodType: 'monthly',
      fiscalYear: year,
      month: month + 1,
      revenue,
      totalRevenue: revenue.netRevenue,
      costOfGoodsSold: cogs,
      totalCOGS: cogs.totalCOGS,
      grossProfit,
      grossProfitMargin: (grossProfit / revenue.netRevenue) * 100,
      operatingExpenses,
      totalOperatingExpenses,
      operatingIncome,
      operatingMargin: (operatingIncome / revenue.netRevenue) * 100,
      otherIncomeExpenses,
      totalOtherIncomeExpenses,
      incomeBeforeTax,
      incomeTax,
      effectiveTaxRate: 21,
      netIncome,
      netProfitMargin: (netIncome / revenue.netRevenue) * 100,
      earningsPerShare: netIncome / 1000000,
      dilutedEPS: netIncome / 1100000,
      currency: 'USD',
      status: month === new Date().getMonth() ? 'draft' : 'published',
      generatedAt: new Date().toISOString(),
      approvedBy: month === new Date().getMonth() ? undefined : 'John Smith',
      approvedAt: month === new Date().getMonth() ? undefined : new Date(year, month + 1, 5).toISOString(),
      notes: 'Auto-generated monthly income statement',
      createdBy: 'system',
      createdAt: new Date(year, month + 1, 1).toISOString(),
      updatedBy: 'system',
      updatedAt: new Date().toISOString()
    };
  }

  private generateQuarterlyStatement(year: number, quarter: number): IncomeStatement {
    const baseRevenue = 1600000 + Math.random() * 400000;
    const statement = this.generateMonthlyStatement(year, (quarter - 1) * 3);
    
    // Scale up the quarterly numbers
    statement.id = `stmt-${year}-Q${quarter}`;
    statement.periodType = 'quarterly';
    statement.quarter = quarter;
    statement.month = undefined;
    statement.periodStart = new Date(year, (quarter - 1) * 3, 1).toISOString().split('T')[0];
    statement.periodEnd = new Date(year, quarter * 3, 0).toISOString().split('T')[0];
    
    // Multiply all revenue figures by ~3
    Object.keys(statement.revenue).forEach(key => {
      if (typeof statement.revenue[key] === 'number') {
        statement.revenue[key] *= 3.1;
      }
    });
    
    // Multiply all COGS figures by ~3
    Object.keys(statement.costOfGoodsSold).forEach(key => {
      if (typeof statement.costOfGoodsSold[key] === 'number') {
        statement.costOfGoodsSold[key] *= 3.1;
      }
    });
    
    // Update totals
    statement.totalRevenue *= 3.1;
    statement.totalCOGS *= 3.1;
    statement.grossProfit *= 3.1;
    statement.totalOperatingExpenses *= 3.1;
    statement.operatingIncome *= 3.1;
    statement.netIncome *= 3.1;
    
    return statement;
  }

  private generateAnnualStatement(year: number): IncomeStatement {
    const baseRevenue = 6500000 + Math.random() * 1500000;
    const statement = this.generateMonthlyStatement(year, 0);
    
    // Scale up the annual numbers
    statement.id = `stmt-${year}-annual`;
    statement.periodType = 'annual';
    statement.quarter = undefined;
    statement.month = undefined;
    statement.periodStart = new Date(year, 0, 1).toISOString().split('T')[0];
    statement.periodEnd = new Date(year, 11, 31).toISOString().split('T')[0];
    
    // Multiply all revenue figures by ~12
    Object.keys(statement.revenue).forEach(key => {
      if (typeof statement.revenue[key] === 'number') {
        statement.revenue[key] *= 12.2;
      }
    });
    
    // Multiply all COGS figures by ~12
    Object.keys(statement.costOfGoodsSold).forEach(key => {
      if (typeof statement.costOfGoodsSold[key] === 'number') {
        statement.costOfGoodsSold[key] *= 12.2;
      }
    });
    
    // Update totals
    statement.totalRevenue *= 12.2;
    statement.totalCOGS *= 12.2;
    statement.grossProfit *= 12.2;
    statement.totalOperatingExpenses *= 12.2;
    statement.operatingIncome *= 12.2;
    statement.netIncome *= 12.2;
    
    statement.status = 'published';
    statement.approvedBy = 'CFO';
    statement.approvedAt = new Date(year + 1, 0, 15).toISOString();
    
    return statement;
  }

  async generate(data: GenerateIncomeStatementData): Promise<IncomeStatement> {
    // Simulate generating a new income statement
    const year = new Date(data.periodEnd).getFullYear();
    const month = new Date(data.periodEnd).getMonth();
    
    let statement: IncomeStatement;
    if (data.periodType === 'monthly') {
      statement = this.generateMonthlyStatement(year, month);
    } else if (data.periodType === 'quarterly') {
      const quarter = Math.floor(month / 3) + 1;
      statement = this.generateQuarterlyStatement(year, quarter);
    } else {
      statement = this.generateAnnualStatement(year);
    }
    
    statement.periodStart = data.periodStart;
    statement.periodEnd = data.periodEnd;
    statement.currency = data.currency || 'USD';
    statement.status = 'draft';
    statement.generatedAt = new Date().toISOString();
    
    const existing = this.getFromStorage();
    this.saveToStorage([...existing, statement]);
    
    return statement;
  }

  async getComparative(id: string): Promise<ComparativeIncomeStatement> {
    const statements = this.getFromStorage();
    const currentPeriod = statements.find(s => s.id === id);
    
    if (!currentPeriod) {
      throw new Error('Income statement not found');
    }
    
    // Find previous period
    let previousPeriod: IncomeStatement | undefined;
    if (currentPeriod.periodType === 'monthly' && currentPeriod.month) {
      const prevMonth = currentPeriod.month === 1 ? 12 : currentPeriod.month - 1;
      const prevYear = currentPeriod.month === 1 ? currentPeriod.fiscalYear - 1 : currentPeriod.fiscalYear;
      previousPeriod = statements.find(s => 
        s.periodType === 'monthly' && 
        s.month === prevMonth && 
        s.fiscalYear === prevYear
      );
    } else if (currentPeriod.periodType === 'quarterly' && currentPeriod.quarter) {
      const prevQuarter = currentPeriod.quarter === 1 ? 4 : currentPeriod.quarter - 1;
      const prevYear = currentPeriod.quarter === 1 ? currentPeriod.fiscalYear - 1 : currentPeriod.fiscalYear;
      previousPeriod = statements.find(s => 
        s.periodType === 'quarterly' && 
        s.quarter === prevQuarter && 
        s.fiscalYear === prevYear
      );
    }
    
    // Calculate changes
    const changes = previousPeriod ? {
      revenue: currentPeriod.totalRevenue - previousPeriod.totalRevenue,
      cogs: currentPeriod.totalCOGS - previousPeriod.totalCOGS,
      grossProfit: currentPeriod.grossProfit - previousPeriod.grossProfit,
      operatingExpenses: currentPeriod.totalOperatingExpenses - previousPeriod.totalOperatingExpenses,
      operatingIncome: currentPeriod.operatingIncome - previousPeriod.operatingIncome,
      netIncome: currentPeriod.netIncome - previousPeriod.netIncome
    } : {
      revenue: 0,
      cogs: 0,
      grossProfit: 0,
      operatingExpenses: 0,
      operatingIncome: 0,
      netIncome: 0
    };
    
    const percentageChanges = previousPeriod ? {
      revenue: (changes.revenue / previousPeriod.totalRevenue) * 100,
      cogs: (changes.cogs / previousPeriod.totalCOGS) * 100,
      grossProfit: (changes.grossProfit / previousPeriod.grossProfit) * 100,
      operatingExpenses: (changes.operatingExpenses / previousPeriod.totalOperatingExpenses) * 100,
      operatingIncome: (changes.operatingIncome / previousPeriod.operatingIncome) * 100,
      netIncome: (changes.netIncome / previousPeriod.netIncome) * 100
    } : {
      revenue: 0,
      cogs: 0,
      grossProfit: 0,
      operatingExpenses: 0,
      operatingIncome: 0,
      netIncome: 0
    };
    
    return {
      currentPeriod,
      previousPeriod,
      changes,
      percentageChanges
    };
  }

  async approve(id: string, notes?: string): Promise<IncomeStatement> {
    const statements = this.getFromStorage();
    const index = statements.findIndex(s => s.id === id);
    
    if (index === -1) {
      throw new Error('Income statement not found');
    }
    
    statements[index].status = 'approved';
    statements[index].approvedBy = 'Current User';
    statements[index].approvedAt = new Date().toISOString();
    if (notes) {
      statements[index].notes = notes;
    }
    
    this.saveToStorage(statements);
    return statements[index];
  }

  async export(id: string, options: ExportOptions): Promise<ExportResult> {
    const statements = this.getFromStorage();
    const statement = statements.find(s => s.id === id);
    
    if (!statement) {
      throw new Error('Income statement not found');
    }
    
    // Simulate export
    const filename = `income-statement-${statement.periodStart}-to-${statement.periodEnd}.${options.format}`;
    const size = Math.floor(Math.random() * 500000) + 100000;
    
    return {
      url: `blob:mock-export-${id}`,
      filename,
      size,
      generatedAt: new Date().toISOString()
    };
  }
}

export const incomeStatementRepository = new MockIncomeStatementRepository();