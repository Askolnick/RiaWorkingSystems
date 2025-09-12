import { BaseRepository, MockRepository } from './base.repository';
import { 
  Currency, 
  ExchangeRate, 
  MultiCurrencyTransaction,
  CurrencyAccount,
  ExchangeRateProvider,
  MultiCurrencySettings,
  CurrencyConversionRequest,
  CurrencyConversionResult,
  BulkConversionRequest,
  BulkConversionResult,
  CurrencyHistoricalData
} from '@ria/multi-currency-server';

export class MultiCurrencyRepository extends BaseRepository<any> {
  protected endpoint = '/multi-currency';

  // Currency management
  async getCurrencies(active?: boolean): Promise<{ data: Currency[] }> {
    return this.request('GET', `/currencies${active ? '?active=true' : ''}`);
  }

  async createCurrency(currency: Partial<Currency>): Promise<{ data: Currency }> {
    return this.request('POST', '/currencies', currency);
  }

  async updateCurrency(id: string, currency: Partial<Currency>): Promise<{ data: Currency }> {
    return this.request('PUT', `/currencies/${id}`, currency);
  }

  // Exchange rates
  async getExchangeRates(fromCurrency?: string, toCurrency?: string): Promise<{ data: ExchangeRate[] }> {
    const params = new URLSearchParams();
    if (fromCurrency) params.set('from', fromCurrency);
    if (toCurrency) params.set('to', toCurrency);
    return this.request('GET', `/exchange-rates?${params}`);
  }

  async createExchangeRate(rate: Partial<ExchangeRate>): Promise<{ data: ExchangeRate }> {
    return this.request('POST', '/exchange-rates', rate);
  }

  async getHistoricalRates(fromCurrency: string, toCurrency: string, startDate: string, endDate: string): Promise<{ data: CurrencyHistoricalData }> {
    return this.request('GET', `/exchange-rates/historical?from=${fromCurrency}&to=${toCurrency}&start=${startDate}&end=${endDate}`);
  }

  // Currency conversion
  async convertCurrency(request: CurrencyConversionRequest): Promise<{ data: CurrencyConversionResult }> {
    return this.request('POST', '/convert', request);
  }

  async bulkConvert(request: BulkConversionRequest): Promise<{ data: BulkConversionResult }> {
    return this.request('POST', '/convert/bulk', request);
  }

  // Multi-currency transactions
  async getTransactions(params?: any): Promise<{ data: MultiCurrencyTransaction[] }> {
    return this.request('GET', '/transactions', params);
  }

  async createTransaction(transaction: Partial<MultiCurrencyTransaction>): Promise<{ data: MultiCurrencyTransaction }> {
    return this.request('POST', '/transactions', transaction);
  }

  // Currency accounts
  async getCurrencyAccounts(): Promise<{ data: CurrencyAccount[] }> {
    return this.request('GET', '/accounts');
  }

  async createCurrencyAccount(account: Partial<CurrencyAccount>): Promise<{ data: CurrencyAccount }> {
    return this.request('POST', '/accounts', account);
  }

  async updateAccountBalance(accountId: string, currency: string, amount: number): Promise<{ data: CurrencyAccount }> {
    return this.request('POST', `/accounts/${accountId}/balance`, { currency, amount });
  }

  // Settings
  async getSettings(): Promise<{ data: MultiCurrencySettings }> {
    return this.request('GET', '/settings');
  }

  async updateSettings(settings: Partial<MultiCurrencySettings>): Promise<{ data: MultiCurrencySettings }> {
    return this.request('PUT', '/settings', settings);
  }

  // Exchange rate providers
  async getProviders(): Promise<{ data: ExchangeRateProvider[] }> {
    return this.request('GET', '/providers');
  }

  async syncRates(providerId?: string): Promise<{ data: { synced: number, updated: number } }> {
    return this.request('POST', `/sync-rates${providerId ? `?provider=${providerId}` : ''}`);
  }
}

export class MockMultiCurrencyRepository extends MockRepository<any> {
  protected endpoint = '/multi-currency';
  protected storageKey = 'ria_multi_currency';

  private currencies: Currency[] = [
    {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      symbolPosition: 'before',
      decimalPlaces: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.',
      isActive: true,
      country: 'United States',
      region: 'North America',
      displayFormat: '{symbol}{amount}',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      symbolPosition: 'before',
      decimalPlaces: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.',
      isActive: true,
      country: 'European Union',
      region: 'Europe',
      displayFormat: '{symbol}{amount}',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      code: 'GBP',
      name: 'British Pound',
      symbol: '£',
      symbolPosition: 'before',
      decimalPlaces: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.',
      isActive: true,
      country: 'United Kingdom',
      region: 'Europe',
      displayFormat: '{symbol}{amount}',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      code: 'JPY',
      name: 'Japanese Yen',
      symbol: '¥',
      symbolPosition: 'before',
      decimalPlaces: 0,
      thousandsSeparator: ',',
      decimalSeparator: '.',
      isActive: true,
      country: 'Japan',
      region: 'Asia',
      displayFormat: '{symbol}{amount}',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      code: 'CAD',
      name: 'Canadian Dollar',
      symbol: 'C$',
      symbolPosition: 'before',
      decimalPlaces: 2,
      thousandsSeparator: ',',
      decimalSeparator: '.',
      isActive: true,
      country: 'Canada',
      region: 'North America',
      displayFormat: '{symbol}{amount}',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  private exchangeRates: ExchangeRate[] = [
    {
      id: 'rate-1',
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      rate: 0.85,
      inverseRate: 1.176,
      source: 'api',
      provider: 'xe.com',
      effectiveDate: new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
      confidence: 95,
      spread: 0.002,
      rateChange: 0.005,
      rateChangePercentage: 0.6,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'rate-2',
      fromCurrency: 'USD',
      toCurrency: 'GBP',
      rate: 0.73,
      inverseRate: 1.37,
      source: 'api',
      provider: 'xe.com',
      effectiveDate: new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
      confidence: 94,
      spread: 0.003,
      rateChange: -0.002,
      rateChangePercentage: -0.3,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'rate-3',
      fromCurrency: 'USD',
      toCurrency: 'JPY',
      rate: 110.5,
      inverseRate: 0.009,
      source: 'api',
      provider: 'xe.com',
      effectiveDate: new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
      confidence: 96,
      spread: 0.1,
      rateChange: 1.2,
      rateChangePercentage: 1.1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  private currencyAccounts: CurrencyAccount[] = [
    {
      id: 'account-1',
      tenantId: 'tenant-1',
      name: 'Main USD Account',
      accountType: 'bank',
      baseCurrency: 'USD',
      supportedCurrencies: ['USD', 'EUR', 'GBP'],
      balances: [
        { currency: 'USD', amount: 50000, lastUpdated: new Date().toISOString() },
        { currency: 'EUR', amount: 15000, lastUpdated: new Date().toISOString() }
      ],
      baseCurrencyBalance: 67650,
      baseCurrencyBalanceDate: new Date().toISOString(),
      allowMultiCurrency: true,
      autoConvertToBase: false,
      bankName: 'First National Bank',
      isActive: true,
      createdBy: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  private settings: MultiCurrencySettings = {
    tenantId: 'tenant-1',
    baseCurrency: 'USD',
    displayCurrency: 'USD',
    activeCurrencies: ['USD', 'EUR', 'GBP', 'JPY', 'CAD'],
    allowedCurrencies: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF'],
    exchangeRateSettings: {
      autoUpdate: true,
      updateFrequency: 'daily',
      primaryProvider: 'xe.com',
      fallbackProviders: ['fixer.io'],
      rateValidityPeriod: 24,
      allowManualRates: true,
      requireApprovalForManualRates: false
    },
    conversionSettings: {
      autoConvertToBase: false,
      roundingMode: 'round',
      decimalPlaces: 2
    },
    reportingSettings: {
      defaultReportingCurrency: 'USD',
      includeExchangeRateInfo: true,
      showCurrencySymbols: true,
      dateFormat: 'YYYY-MM-DD'
    },
    riskSettings: {
      enableExposureAlerts: true,
      maxExposurePerCurrency: 50,
      hedgingThreshold: 10000
    },
    complianceSettings: {
      requireDocumentationForLargeAmounts: true,
      largeAmountThreshold: 10000,
      auditTrailRetentionDays: 2555
    },
    updatedBy: 'user-1',
    updatedAt: new Date().toISOString()
  };

  async getCurrencies(active?: boolean): Promise<{ data: Currency[] }> {
    await this.simulateDelay();
    let currencies = [...this.currencies];
    if (active !== undefined) {
      currencies = currencies.filter(c => c.isActive === active);
    }
    return { data: currencies };
  }

  async createCurrency(currency: Partial<Currency>): Promise<{ data: Currency }> {
    await this.simulateDelay();
    const newCurrency: Currency = {
      code: currency.code!,
      name: currency.name!,
      symbol: currency.symbol!,
      symbolPosition: currency.symbolPosition || 'before',
      decimalPlaces: currency.decimalPlaces || 2,
      thousandsSeparator: currency.thousandsSeparator || ',',
      decimalSeparator: currency.decimalSeparator || '.',
      isActive: currency.isActive !== false,
      displayFormat: currency.displayFormat || '{symbol}{amount}',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...currency
    };
    this.currencies.push(newCurrency);
    return { data: newCurrency };
  }

  async updateCurrency(id: string, currency: Partial<Currency>): Promise<{ data: Currency }> {
    await this.simulateDelay();
    const index = this.currencies.findIndex(c => c.code === id);
    if (index === -1) throw new Error('Currency not found');
    
    this.currencies[index] = {
      ...this.currencies[index],
      ...currency,
      updatedAt: new Date().toISOString()
    };
    return { data: this.currencies[index] };
  }

  async getExchangeRates(fromCurrency?: string, toCurrency?: string): Promise<{ data: ExchangeRate[] }> {
    await this.simulateDelay();
    let rates = [...this.exchangeRates];
    
    if (fromCurrency) {
      rates = rates.filter(r => r.fromCurrency === fromCurrency);
    }
    if (toCurrency) {
      rates = rates.filter(r => r.toCurrency === toCurrency);
    }
    
    return { data: rates };
  }

  async convertCurrency(request: CurrencyConversionRequest): Promise<{ data: CurrencyConversionResult }> {
    await this.simulateDelay();
    
    const rate = this.exchangeRates.find(r => 
      r.fromCurrency === request.fromCurrency && r.toCurrency === request.toCurrency
    );
    
    if (!rate) {
      throw new Error(`Exchange rate not found for ${request.fromCurrency} to ${request.toCurrency}`);
    }

    const convertedAmount = request.amount * rate.rate;
    const fromCurrency = this.currencies.find(c => c.code === request.fromCurrency);
    const toCurrency = this.currencies.find(c => c.code === request.toCurrency);

    const result: CurrencyConversionResult = {
      originalAmount: request.amount,
      convertedAmount: Number(convertedAmount.toFixed(toCurrency?.decimalPlaces || 2)),
      fromCurrency: request.fromCurrency,
      toCurrency: request.toCurrency,
      exchangeRate: rate.rate,
      rateSource: rate.provider || 'api',
      rateDate: rate.effectiveDate,
      confidence: rate.confidence,
      formattedOriginal: this.formatAmount(request.amount, fromCurrency!),
      formattedConverted: this.formatAmount(convertedAmount, toCurrency!),
      convertedAt: new Date().toISOString()
    };

    return { data: result };
  }

  async bulkConvert(request: BulkConversionRequest): Promise<{ data: BulkConversionResult }> {
    await this.simulateDelay();
    
    const conversions: (CurrencyConversionResult & { id: string })[] = [];
    const totalOriginalAmount: { [currency: string]: number } = {};
    const totalConvertedAmount: { [currency: string]: number } = {};
    let successful = 0;
    let failed = 0;

    for (const item of request.amounts) {
      try {
        const conversionResult = await this.convertCurrency({
          amount: item.amount,
          fromCurrency: item.fromCurrency,
          toCurrency: item.toCurrency,
          date: request.date,
          rateSource: request.rateSource
        });
        
        conversions.push({
          ...conversionResult.data,
          id: item.id
        });

        totalOriginalAmount[item.fromCurrency] = (totalOriginalAmount[item.fromCurrency] || 0) + item.amount;
        totalConvertedAmount[item.toCurrency] = (totalConvertedAmount[item.toCurrency] || 0) + conversionResult.data.convertedAmount;
        successful++;
      } catch (error) {
        failed++;
      }
    }

    const exchangeRatesUsed = Array.from(new Set(
      conversions.map(c => `${c.fromCurrency}-${c.toCurrency}`)
    )).map(pair => {
      const [fromCurrency, toCurrency] = pair.split('-');
      const conversion = conversions.find(c => c.fromCurrency === fromCurrency && c.toCurrency === toCurrency);
      return {
        fromCurrency,
        toCurrency,
        rate: conversion!.exchangeRate,
        source: conversion!.rateSource
      };
    });

    return {
      data: {
        conversions,
        summary: {
          totalRequests: request.amounts.length,
          successful,
          failed,
          totalOriginalAmount,
          totalConvertedAmount
        },
        exchangeRatesUsed
      }
    };
  }

  async getCurrencyAccounts(): Promise<{ data: CurrencyAccount[] }> {
    await this.simulateDelay();
    return { data: [...this.currencyAccounts] };
  }

  async getSettings(): Promise<{ data: MultiCurrencySettings }> {
    await this.simulateDelay();
    return { data: { ...this.settings } };
  }

  async updateSettings(settings: Partial<MultiCurrencySettings>): Promise<{ data: MultiCurrencySettings }> {
    await this.simulateDelay();
    this.settings = {
      ...this.settings,
      ...settings,
      updatedAt: new Date().toISOString()
    };
    return { data: { ...this.settings } };
  }

  private formatAmount(amount: number, currency: Currency): string {
    const formattedNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces
    }).format(amount);

    return currency.displayFormat
      .replace('{symbol}', currency.symbol)
      .replace('{amount}', formattedNumber);
  }
}

export const multiCurrencyRepository = new MockMultiCurrencyRepository();