// Re-export all types
export * from './types';

// Export currency utilities and constants
export const MAJOR_CURRENCIES = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', symbolPosition: 'before' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', symbolPosition: 'before' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', symbolPosition: 'before' },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', symbolPosition: 'before' },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', symbolPosition: 'after' },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', symbolPosition: 'before' },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', symbolPosition: 'before' },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', symbolPosition: 'before' },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', symbolPosition: 'before' },
  BRL: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', symbolPosition: 'before' }
} as const;

export const CURRENCY_REGIONS = {
  'North America': ['USD', 'CAD', 'MXN'],
  'Europe': ['EUR', 'GBP', 'CHF', 'SEK', 'NOK', 'DKK'],
  'Asia Pacific': ['JPY', 'CNY', 'INR', 'SGD', 'HKD', 'AUD', 'NZD'],
  'South America': ['BRL', 'ARS', 'CLP', 'PEN'],
  'Africa': ['ZAR', 'NGN', 'EGP'],
  'Middle East': ['AED', 'SAR', 'QAR', 'KWD']
} as const;

// Core currency conversion engine
export class CurrencyConverter {
  private exchangeRates: Map<string, Map<string, number>> = new Map();
  private rateTimestamps: Map<string, Date> = new Map();
  private baseCurrency: string = 'USD';

  constructor(baseCurrency: string = 'USD') {
    this.baseCurrency = baseCurrency;
    this.initializeDefaultRates();
  }

  private initializeDefaultRates() {
    // Initialize with some mock exchange rates
    this.setExchangeRate('USD', 'EUR', 0.85);
    this.setExchangeRate('USD', 'GBP', 0.73);
    this.setExchangeRate('USD', 'JPY', 110.50);
    this.setExchangeRate('USD', 'CAD', 1.25);
    this.setExchangeRate('USD', 'AUD', 1.35);
    this.setExchangeRate('USD', 'CHF', 0.92);
    this.setExchangeRate('USD', 'CNY', 6.45);
    this.setExchangeRate('USD', 'INR', 74.50);
  }

  setExchangeRate(fromCurrency: string, toCurrency: string, rate: number): void {
    if (!this.exchangeRates.has(fromCurrency)) {
      this.exchangeRates.set(fromCurrency, new Map());
    }
    
    this.exchangeRates.get(fromCurrency)!.set(toCurrency, rate);
    this.rateTimestamps.set(`${fromCurrency}-${toCurrency}`, new Date());
    
    // Set inverse rate
    if (!this.exchangeRates.has(toCurrency)) {
      this.exchangeRates.set(toCurrency, new Map());
    }
    this.exchangeRates.get(toCurrency)!.set(fromCurrency, 1 / rate);
    this.rateTimestamps.set(`${toCurrency}-${fromCurrency}`, new Date());
  }

  getExchangeRate(fromCurrency: string, toCurrency: string): number | null {
    if (fromCurrency === toCurrency) return 1;
    
    const fromRates = this.exchangeRates.get(fromCurrency);
    if (fromRates && fromRates.has(toCurrency)) {
      return fromRates.get(toCurrency)!;
    }
    
    // Try to find cross-rate through base currency
    if (fromCurrency !== this.baseCurrency && toCurrency !== this.baseCurrency) {
      const fromToBase = this.getExchangeRate(fromCurrency, this.baseCurrency);
      const baseToTarget = this.getExchangeRate(this.baseCurrency, toCurrency);
      
      if (fromToBase !== null && baseToTarget !== null) {
        return fromToBase * baseToTarget;
      }
    }
    
    return null;
  }

  convert(amount: number, fromCurrency: string, toCurrency: string): number | null {
    const rate = this.getExchangeRate(fromCurrency, toCurrency);
    if (rate === null) return null;
    
    return Math.round((amount * rate) * 100) / 100; // Round to 2 decimal places
  }

  convertWithDetails(request: any): any {
    const { amount, fromCurrency, toCurrency, date } = request;
    
    const rate = this.getExchangeRate(fromCurrency, toCurrency);
    if (rate === null) {
      throw new Error(`Exchange rate not available for ${fromCurrency} to ${toCurrency}`);
    }
    
    const convertedAmount = this.convert(amount, fromCurrency, toCurrency)!;
    
    return {
      originalAmount: amount,
      convertedAmount,
      fromCurrency,
      toCurrency,
      exchangeRate: rate,
      rateSource: 'mock_provider',
      rateDate: new Date().toISOString(),
      confidence: 95,
      formattedOriginal: this.formatAmount(amount, fromCurrency),
      formattedConverted: this.formatAmount(convertedAmount, toCurrency),
      convertedAt: new Date().toISOString()
    };
  }
}

// Currency formatting utilities
export function formatAmount(
  amount: number,
  currencyCode: string,
  locale: string = 'en-US'
): string {
  const currency = MAJOR_CURRENCIES[currencyCode as keyof typeof MAJOR_CURRENCIES];
  
  if (currency) {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    
    return formatted;
  }
  
  // Fallback formatting
  return `${amount.toFixed(2)} ${currencyCode}`;
}

export function parseAmount(amountString: string, currencyCode: string): number {
  // Remove currency symbols and formatting
  const cleaned = amountString
    .replace(/[^\d.-]/g, '') // Remove everything except digits, dots, and minus signs
    .replace(/,/g, ''); // Remove commas
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatAmountWithSymbol(
  amount: number,
  currencyCode: string,
  showSymbol: boolean = true
): string {
  const currency = MAJOR_CURRENCIES[currencyCode as keyof typeof MAJOR_CURRENCIES];
  
  if (!currency) return `${amount.toFixed(2)} ${currencyCode}`;
  
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  if (!showSymbol) return formattedAmount;
  
  return currency.symbolPosition === 'before' 
    ? `${currency.symbol}${formattedAmount}`
    : `${formattedAmount} ${currency.symbol}`;
}

// Exchange rate utilities
export function calculateCrossRate(
  rate1: number, // EUR/USD
  rate2: number  // GBP/USD
): number {
  // Calculate EUR/GBP cross rate
  return rate1 / rate2;
}

export function calculateRateChange(currentRate: number, previousRate: number): {
  change: number;
  changePercentage: number;
  direction: 'up' | 'down' | 'unchanged';
} {
  const change = currentRate - previousRate;
  const changePercentage = previousRate !== 0 ? (change / previousRate) * 100 : 0;
  
  let direction: 'up' | 'down' | 'unchanged' = 'unchanged';
  if (Math.abs(changePercentage) > 0.01) {
    direction = change > 0 ? 'up' : 'down';
  }
  
  return {
    change: Math.round(change * 10000) / 10000, // 4 decimal places
    changePercentage: Math.round(changePercentage * 100) / 100, // 2 decimal places
    direction
  };
}

export function calculateVolatility(rates: number[]): number {
  if (rates.length < 2) return 0;
  
  // Calculate daily returns
  const returns = [];
  for (let i = 1; i < rates.length; i++) {
    returns.push((rates[i] - rates[i - 1]) / rates[i - 1]);
  }
  
  // Calculate standard deviation
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  
  return Math.sqrt(variance) * 100; // Return as percentage
}

// Risk management utilities
export function assessCurrencyRisk(exposures: Record<string, number>, baseCurrency: string): {
  overallRisk: 'low' | 'medium' | 'high';
  concentrationRisk: number;
  diversificationScore: number;
  recommendations: string[];
} {
  const totalExposure = Object.values(exposures).reduce((sum, exp) => sum + Math.abs(exp), 0);
  const baseCurrencyExposure = exposures[baseCurrency] || 0;
  
  // Calculate concentration risk
  const concentrationRisk = Math.abs(baseCurrencyExposure) / totalExposure * 100;
  
  // Calculate diversification score
  const currencyCount = Object.keys(exposures).length;
  const diversificationScore = Math.min(currencyCount * 10, 100);
  
  // Assess overall risk
  let overallRisk: 'low' | 'medium' | 'high' = 'low';
  if (concentrationRisk > 70 || currencyCount < 3) {
    overallRisk = 'high';
  } else if (concentrationRisk > 50 || currencyCount < 5) {
    overallRisk = 'medium';
  }
  
  // Generate recommendations
  const recommendations: string[] = [];
  if (concentrationRisk > 60) {
    recommendations.push('Consider diversifying currency exposure');
  }
  if (currencyCount < 3) {
    recommendations.push('Increase currency diversification');
  }
  if (Object.values(exposures).some(exp => Math.abs(exp) > totalExposure * 0.4)) {
    recommendations.push('Consider hedging large currency positions');
  }
  
  return {
    overallRisk,
    concentrationRisk,
    diversificationScore,
    recommendations
  };
}

// Historical data utilities
export function generateHistoricalRates(
  baseCurrency: string,
  targetCurrency: string,
  days: number,
  startRate: number,
  volatility: number = 0.02
): Array<{ date: string; rate: number }> {
  const rates = [];
  let currentRate = startRate;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add random volatility
    const change = (Math.random() - 0.5) * volatility * currentRate;
    currentRate = Math.max(0.01, currentRate + change);
    
    rates.push({
      date: date.toISOString().split('T')[0],
      rate: Math.round(currentRate * 10000) / 10000
    });
  }
  
  return rates;
}

// Mock data generators
export function generateMockCurrencies(): any[] {
  return Object.entries(MAJOR_CURRENCIES).map(([code, details]) => ({
    code,
    name: details.name,
    symbol: details.symbol,
    symbolPosition: details.symbolPosition,
    decimalPlaces: code === 'JPY' ? 0 : 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    displayFormat: details.symbolPosition === 'before' ? '{symbol}{amount}' : '{amount} {symbol}',
    isActive: true,
    country: getCurrencyCountry(code),
    region: getCurrencyRegion(code),
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }));
}

export function generateMockExchangeRates(): any[] {
  const rates = [];
  const baseCurrency = 'USD';
  const currencies = Object.keys(MAJOR_CURRENCIES).filter(c => c !== baseCurrency);
  
  currencies.forEach(currency => {
    const rate = getMockExchangeRate(baseCurrency, currency);
    rates.push({
      id: `rate_${baseCurrency}_${currency}`,
      fromCurrency: baseCurrency,
      toCurrency: currency,
      rate: rate,
      inverseRate: 1 / rate,
      source: 'api',
      provider: 'mock_provider',
      effectiveDate: new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
      confidence: 95,
      previousRate: rate * (0.98 + Math.random() * 0.04), // ±2% variation
      rateChange: rate * (Math.random() - 0.5) * 0.02,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });
  
  return rates;
}

export function generateMockMultiCurrencyTransactions(): any[] {
  const transactions = [];
  const currencies = Object.keys(MAJOR_CURRENCIES);
  const baseCurrency = 'USD';
  
  for (let i = 0; i < 20; i++) {
    const originalCurrency = currencies[Math.floor(Math.random() * currencies.length)];
    const amount = Math.random() * 5000 + 100;
    const rate = getMockExchangeRate(originalCurrency, baseCurrency);
    
    transactions.push({
      id: `txn_${Date.now()}_${i}`,
      tenantId: 'demo-tenant',
      type: Math.random() > 0.6 ? 'expense' : 'income',
      description: getRandomTransactionDescription(),
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      originalAmount: {
        amount: Math.round(amount * 100) / 100,
        currency: originalCurrency,
        formattedAmount: formatAmount(amount, originalCurrency)
      },
      baseCurrencyAmount: {
        amount: Math.round(amount * rate * 100) / 100,
        currency: baseCurrency,
        exchangeRate: rate,
        exchangeRateDate: new Date().toISOString().split('T')[0],
        formattedAmount: formatAmount(amount * rate, baseCurrency)
      },
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  return transactions;
}

// Helper functions
function getCurrencyCountry(currencyCode: string): string {
  const countryMap: Record<string, string> = {
    USD: 'United States',
    EUR: 'European Union',
    GBP: 'United Kingdom',
    JPY: 'Japan',
    CHF: 'Switzerland',
    CAD: 'Canada',
    AUD: 'Australia',
    CNY: 'China',
    INR: 'India',
    BRL: 'Brazil'
  };
  return countryMap[currencyCode] || 'Unknown';
}

function getCurrencyRegion(currencyCode: string): string {
  for (const [region, currencies] of Object.entries(CURRENCY_REGIONS)) {
    if (currencies.includes(currencyCode)) {
      return region;
    }
  }
  return 'Other';
}

function getMockExchangeRate(fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return 1;
  
  // Mock exchange rates (base: USD)
  const usdRates: Record<string, number> = {
    EUR: 0.85,
    GBP: 0.73,
    JPY: 110.50,
    CHF: 0.92,
    CAD: 1.25,
    AUD: 1.35,
    CNY: 6.45,
    INR: 74.50,
    BRL: 5.20
  };
  
  if (fromCurrency === 'USD') {
    return usdRates[toCurrency] || 1;
  }
  
  if (toCurrency === 'USD') {
    return 1 / (usdRates[fromCurrency] || 1);
  }
  
  // Cross rate calculation
  const fromToUsd = 1 / (usdRates[fromCurrency] || 1);
  const usdToTarget = usdRates[toCurrency] || 1;
  return fromToUsd * usdToTarget;
}

function getRandomTransactionDescription(): string {
  const descriptions = [
    'International software license',
    'Overseas consulting services',
    'Foreign supplier payment',
    'International travel expenses',
    'Cross-border marketing campaign',
    'Global conference registration',
    'International shipping costs',
    'Foreign exchange transaction',
    'Overseas office rent',
    'International equipment purchase'
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// Currency validation utilities
export function isValidCurrencyCode(code: string): boolean {
  return /^[A-Z]{3}$/.test(code) && code in MAJOR_CURRENCIES;
}

export function validateAmount(amount: number, currency: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (isNaN(amount) || !isFinite(amount)) {
    errors.push('Amount must be a valid number');
  }
  
  if (amount < 0) {
    errors.push('Amount cannot be negative');
  }
  
  if (amount > 999999999.99) {
    errors.push('Amount exceeds maximum allowed value');
  }
  
  if (!isValidCurrencyCode(currency)) {
    errors.push('Invalid currency code');
  }
  
  // Check decimal places
  const currencyInfo = MAJOR_CURRENCIES[currency as keyof typeof MAJOR_CURRENCIES];
  if (currencyInfo) {
    const decimalPlaces = currencyInfo.code === 'JPY' ? 0 : 2;
    const decimals = (amount.toString().split('.')[1] || '').length;
    if (decimals > decimalPlaces) {
      errors.push(`Too many decimal places for ${currency}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Export default converter instance
export const defaultCurrencyConverter = new CurrencyConverter();