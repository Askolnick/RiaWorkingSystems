import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { 
  multiCurrencyRepository, 
  type Currency, 
  type ExchangeRate,
  type MultiCurrencyTransaction,
  type CurrencyAccount,
  type MultiCurrencySettings,
  type CurrencyConversionRequest,
  type CurrencyConversionResult,
  type BulkConversionRequest,
  type BulkConversionResult
} from '../repositories';

interface MultiCurrencyState {
  // Currencies
  currencies: Currency[];
  activeCurrencies: Currency[];
  currenciesLoading: boolean;
  currenciesError: string | null;

  // Exchange rates
  exchangeRates: ExchangeRate[];
  ratesLoading: boolean;
  ratesError: string | null;
  lastRateUpdate: string | null;

  // Currency conversion
  conversionHistory: CurrencyConversionResult[];
  conversionLoading: boolean;
  conversionError: string | null;

  // Multi-currency transactions
  transactions: MultiCurrencyTransaction[];
  transactionsLoading: boolean;
  transactionsError: string | null;

  // Currency accounts
  currencyAccounts: CurrencyAccount[];
  accountsLoading: boolean;
  accountsError: string | null;

  // Settings
  settings: MultiCurrencySettings | null;
  settingsLoading: boolean;
  settingsError: string | null;

  // UI state
  selectedBaseCurrency: string;
  selectedDisplayCurrency: string;
  conversionCalculator: {
    fromCurrency: string;
    toCurrency: string;
    amount: number;
    result: CurrencyConversionResult | null;
  };
}

interface MultiCurrencyActions {
  // Currency management
  fetchCurrencies: (activeOnly?: boolean) => Promise<void>;
  createCurrency: (currency: Partial<Currency>) => Promise<void>;
  updateCurrency: (code: string, currency: Partial<Currency>) => Promise<void>;
  toggleCurrencyStatus: (code: string) => Promise<void>;

  // Exchange rate management
  fetchExchangeRates: (fromCurrency?: string, toCurrency?: string) => Promise<void>;
  createExchangeRate: (rate: Partial<ExchangeRate>) => Promise<void>;
  syncExchangeRates: (providerId?: string) => Promise<void>;
  refreshRates: () => Promise<void>;

  // Currency conversion
  convertCurrency: (request: CurrencyConversionRequest) => Promise<CurrencyConversionResult>;
  bulkConvert: (request: BulkConversionRequest) => Promise<BulkConversionResult>;
  clearConversionHistory: () => void;

  // Currency calculator
  updateCalculatorAmount: (amount: number) => void;
  updateCalculatorFromCurrency: (currency: string) => void;
  updateCalculatorToCurrency: (currency: string) => void;
  swapCalculatorCurrencies: () => void;
  calculateConversion: () => Promise<void>;

  // Transaction management
  fetchTransactions: (params?: any) => Promise<void>;
  createTransaction: (transaction: Partial<MultiCurrencyTransaction>) => Promise<void>;

  // Account management
  fetchCurrencyAccounts: () => Promise<void>;
  createCurrencyAccount: (account: Partial<CurrencyAccount>) => Promise<void>;
  updateAccountBalance: (accountId: string, currency: string, amount: number) => Promise<void>;

  // Settings management
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<MultiCurrencySettings>) => Promise<void>;
  updateBaseCurrency: (currency: string) => Promise<void>;

  // Utility actions
  getExchangeRate: (fromCurrency: string, toCurrency: string) => ExchangeRate | null;
  formatAmount: (amount: number, currency: string) => string;
  getCurrencySymbol: (currency: string) => string;
  clearErrors: () => void;
}

type MultiCurrencyStore = MultiCurrencyState & MultiCurrencyActions;

export const useMultiCurrencyStore = create<MultiCurrencyStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      currencies: [],
      activeCurrencies: [],
      currenciesLoading: false,
      currenciesError: null,

      exchangeRates: [],
      ratesLoading: false,
      ratesError: null,
      lastRateUpdate: null,

      conversionHistory: [],
      conversionLoading: false,
      conversionError: null,

      transactions: [],
      transactionsLoading: false,
      transactionsError: null,

      currencyAccounts: [],
      accountsLoading: false,
      accountsError: null,

      settings: null,
      settingsLoading: false,
      settingsError: null,

      selectedBaseCurrency: 'USD',
      selectedDisplayCurrency: 'USD',
      conversionCalculator: {
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: 100,
        result: null
      },

      // Actions
      fetchCurrencies: async (activeOnly = false) => {
        set(state => {
          state.currenciesLoading = true;
          state.currenciesError = null;
        });

        try {
          const response = await multiCurrencyRepository.getCurrencies(activeOnly);
          set(state => {
            state.currencies = response.data;
            state.activeCurrencies = response.data.filter(c => c.isActive);
            state.currenciesLoading = false;
          });
        } catch (error: any) {
          set(state => {
            state.currenciesError = error.message;
            state.currenciesLoading = false;
          });
        }
      },

      createCurrency: async (currency: Partial<Currency>) => {
        set(state => {
          state.currenciesLoading = true;
          state.currenciesError = null;
        });

        try {
          const response = await multiCurrencyRepository.createCurrency(currency);
          set(state => {
            state.currencies.push(response.data);
            if (response.data.isActive) {
              state.activeCurrencies.push(response.data);
            }
            state.currenciesLoading = false;
          });
        } catch (error: any) {
          set(state => {
            state.currenciesError = error.message;
            state.currenciesLoading = false;
          });
        }
      },

      updateCurrency: async (code: string, currency: Partial<Currency>) => {
        set(state => {
          state.currenciesLoading = true;
          state.currenciesError = null;
        });

        try {
          const response = await multiCurrencyRepository.updateCurrency(code, currency);
          set(state => {
            const index = state.currencies.findIndex(c => c.code === code);
            if (index !== -1) {
              state.currencies[index] = response.data;
            }
            
            const activeIndex = state.activeCurrencies.findIndex(c => c.code === code);
            if (response.data.isActive && activeIndex === -1) {
              state.activeCurrencies.push(response.data);
            } else if (!response.data.isActive && activeIndex !== -1) {
              state.activeCurrencies.splice(activeIndex, 1);
            } else if (response.data.isActive && activeIndex !== -1) {
              state.activeCurrencies[activeIndex] = response.data;
            }
            
            state.currenciesLoading = false;
          });
        } catch (error: any) {
          set(state => {
            state.currenciesError = error.message;
            state.currenciesLoading = false;
          });
        }
      },

      toggleCurrencyStatus: async (code: string) => {
        const currency = get().currencies.find(c => c.code === code);
        if (!currency) return;

        await get().updateCurrency(code, { isActive: !currency.isActive });
      },

      fetchExchangeRates: async (fromCurrency?: string, toCurrency?: string) => {
        set(state => {
          state.ratesLoading = true;
          state.ratesError = null;
        });

        try {
          const response = await multiCurrencyRepository.getExchangeRates(fromCurrency, toCurrency);
          set(state => {
            state.exchangeRates = response.data;
            state.lastRateUpdate = new Date().toISOString();
            state.ratesLoading = false;
          });
        } catch (error: any) {
          set(state => {
            state.ratesError = error.message;
            state.ratesLoading = false;
          });
        }
      },

      createExchangeRate: async (rate: Partial<ExchangeRate>) => {
        set(state => {
          state.ratesLoading = true;
          state.ratesError = null;
        });

        try {
          const response = await multiCurrencyRepository.createExchangeRate(rate);
          set(state => {
            // Update or add the rate
            const existingIndex = state.exchangeRates.findIndex(r => 
              r.fromCurrency === response.data.fromCurrency && 
              r.toCurrency === response.data.toCurrency
            );
            
            if (existingIndex !== -1) {
              state.exchangeRates[existingIndex] = response.data;
            } else {
              state.exchangeRates.push(response.data);
            }
            state.ratesLoading = false;
          });
        } catch (error: any) {
          set(state => {
            state.ratesError = error.message;
            state.ratesLoading = false;
          });
        }
      },

      syncExchangeRates: async (providerId?: string) => {
        set(state => {
          state.ratesLoading = true;
          state.ratesError = null;
        });

        try {
          await multiCurrencyRepository.syncRates(providerId);
          // Refresh rates after sync
          await get().fetchExchangeRates();
        } catch (error: any) {
          set(state => {
            state.ratesError = error.message;
            state.ratesLoading = false;
          });
        }
      },

      refreshRates: async () => {
        await get().fetchExchangeRates();
      },

      convertCurrency: async (request: CurrencyConversionRequest) => {
        set(state => {
          state.conversionLoading = true;
          state.conversionError = null;
        });

        try {
          const response = await multiCurrencyRepository.convertCurrency(request);
          set(state => {
            state.conversionHistory.unshift(response.data);
            // Keep only last 50 conversions
            if (state.conversionHistory.length > 50) {
              state.conversionHistory = state.conversionHistory.slice(0, 50);
            }
            state.conversionLoading = false;
          });
          return response.data;
        } catch (error: any) {
          set(state => {
            state.conversionError = error.message;
            state.conversionLoading = false;
          });
          throw error;
        }
      },

      bulkConvert: async (request: BulkConversionRequest) => {
        set(state => {
          state.conversionLoading = true;
          state.conversionError = null;
        });

        try {
          const response = await multiCurrencyRepository.bulkConvert(request);
          set(state => {
            // Add successful conversions to history
            response.data.conversions.forEach(conversion => {
              state.conversionHistory.unshift(conversion);
            });
            // Keep only last 50 conversions
            if (state.conversionHistory.length > 50) {
              state.conversionHistory = state.conversionHistory.slice(0, 50);
            }
            state.conversionLoading = false;
          });
          return response.data;
        } catch (error: any) {
          set(state => {
            state.conversionError = error.message;
            state.conversionLoading = false;
          });
          throw error;
        }
      },

      clearConversionHistory: () => {
        set(state => {
          state.conversionHistory = [];
        });
      },

      updateCalculatorAmount: (amount: number) => {
        set(state => {
          state.conversionCalculator.amount = amount;
        });
      },

      updateCalculatorFromCurrency: (currency: string) => {
        set(state => {
          state.conversionCalculator.fromCurrency = currency;
        });
      },

      updateCalculatorToCurrency: (currency: string) => {
        set(state => {
          state.conversionCalculator.toCurrency = currency;
        });
      },

      swapCalculatorCurrencies: () => {
        set(state => {
          const temp = state.conversionCalculator.fromCurrency;
          state.conversionCalculator.fromCurrency = state.conversionCalculator.toCurrency;
          state.conversionCalculator.toCurrency = temp;
        });
      },

      calculateConversion: async () => {
        const { fromCurrency, toCurrency, amount } = get().conversionCalculator;
        
        try {
          const result = await get().convertCurrency({
            amount,
            fromCurrency,
            toCurrency
          });
          
          set(state => {
            state.conversionCalculator.result = result;
          });
        } catch (error) {
          // Error handled in convertCurrency
        }
      },

      fetchTransactions: async (params?: any) => {
        set(state => {
          state.transactionsLoading = true;
          state.transactionsError = null;
        });

        try {
          const response = await multiCurrencyRepository.getTransactions(params);
          set(state => {
            state.transactions = response.data;
            state.transactionsLoading = false;
          });
        } catch (error: any) {
          set(state => {
            state.transactionsError = error.message;
            state.transactionsLoading = false;
          });
        }
      },

      createTransaction: async (transaction: Partial<MultiCurrencyTransaction>) => {
        set(state => {
          state.transactionsLoading = true;
          state.transactionsError = null;
        });

        try {
          const response = await multiCurrencyRepository.createTransaction(transaction);
          set(state => {
            state.transactions.unshift(response.data);
            state.transactionsLoading = false;
          });
        } catch (error: any) {
          set(state => {
            state.transactionsError = error.message;
            state.transactionsLoading = false;
          });
        }
      },

      fetchCurrencyAccounts: async () => {
        set(state => {
          state.accountsLoading = true;
          state.accountsError = null;
        });

        try {
          const response = await multiCurrencyRepository.getCurrencyAccounts();
          set(state => {
            state.currencyAccounts = response.data;
            state.accountsLoading = false;
          });
        } catch (error: any) {
          set(state => {
            state.accountsError = error.message;
            state.accountsLoading = false;
          });
        }
      },

      createCurrencyAccount: async (account: Partial<CurrencyAccount>) => {
        set(state => {
          state.accountsLoading = true;
          state.accountsError = null;
        });

        try {
          const response = await multiCurrencyRepository.createCurrencyAccount(account);
          set(state => {
            state.currencyAccounts.push(response.data);
            state.accountsLoading = false;
          });
        } catch (error: any) {
          set(state => {
            state.accountsError = error.message;
            state.accountsLoading = false;
          });
        }
      },

      updateAccountBalance: async (accountId: string, currency: string, amount: number) => {
        set(state => {
          state.accountsLoading = true;
          state.accountsError = null;
        });

        try {
          const response = await multiCurrencyRepository.updateAccountBalance(accountId, currency, amount);
          set(state => {
            const index = state.currencyAccounts.findIndex(a => a.id === accountId);
            if (index !== -1) {
              state.currencyAccounts[index] = response.data;
            }
            state.accountsLoading = false;
          });
        } catch (error: any) {
          set(state => {
            state.accountsError = error.message;
            state.accountsLoading = false;
          });
        }
      },

      fetchSettings: async () => {
        set(state => {
          state.settingsLoading = true;
          state.settingsError = null;
        });

        try {
          const response = await multiCurrencyRepository.getSettings();
          set(state => {
            state.settings = response.data;
            state.selectedBaseCurrency = response.data.baseCurrency;
            state.selectedDisplayCurrency = response.data.displayCurrency || response.data.baseCurrency;
            state.settingsLoading = false;
          });
        } catch (error: any) {
          set(state => {
            state.settingsError = error.message;
            state.settingsLoading = false;
          });
        }
      },

      updateSettings: async (settings: Partial<MultiCurrencySettings>) => {
        set(state => {
          state.settingsLoading = true;
          state.settingsError = null;
        });

        try {
          const response = await multiCurrencyRepository.updateSettings(settings);
          set(state => {
            state.settings = response.data;
            if (settings.baseCurrency) {
              state.selectedBaseCurrency = settings.baseCurrency;
            }
            if (settings.displayCurrency) {
              state.selectedDisplayCurrency = settings.displayCurrency;
            }
            state.settingsLoading = false;
          });
        } catch (error: any) {
          set(state => {
            state.settingsError = error.message;
            state.settingsLoading = false;
          });
        }
      },

      updateBaseCurrency: async (currency: string) => {
        await get().updateSettings({ baseCurrency: currency });
      },

      // Utility functions
      getExchangeRate: (fromCurrency: string, toCurrency: string) => {
        if (fromCurrency === toCurrency) return null;
        
        return get().exchangeRates.find(rate => 
          rate.fromCurrency === fromCurrency && 
          rate.toCurrency === toCurrency && 
          rate.isActive
        ) || null;
      },

      formatAmount: (amount: number, currencyCode: string) => {
        const currency = get().currencies.find(c => c.code === currencyCode);
        if (!currency) {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode
          }).format(amount);
        }

        const formattedNumber = new Intl.NumberFormat('en-US', {
          minimumFractionDigits: currency.decimalPlaces,
          maximumFractionDigits: currency.decimalPlaces
        }).format(amount);

        return currency.displayFormat
          .replace('{symbol}', currency.symbol)
          .replace('{amount}', formattedNumber);
      },

      getCurrencySymbol: (currencyCode: string) => {
        const currency = get().currencies.find(c => c.code === currencyCode);
        return currency?.symbol || currencyCode;
      },

      clearErrors: () => {
        set(state => {
          state.currenciesError = null;
          state.ratesError = null;
          state.conversionError = null;
          state.transactionsError = null;
          state.accountsError = null;
          state.settingsError = null;
        });
      }
    })),
    { name: 'multi-currency-store' }
  )
);