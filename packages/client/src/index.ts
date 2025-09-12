// src/index.ts
// Optimized exports to prevent bundle bloat

// Core types and utilities  
export * from './types';
export * from './api';
export * from './auth';
export * from './library';
export * from './libraryAPI';
export * from './links';
export * from './mock';

// Critical imports only - others should be lazy loaded
export { useAuthStore } from './stores/auth.store';
export { usePortalStore } from './stores/portal.store';
export { useUIStore } from './stores/ui.store';
export { useFinanceStore } from './stores/finance.store';
export { authRepository } from './repositories/auth.repository';
export { BaseRepository, RepositoryError } from './repositories/base.repository';

// Export all stores directly since they're being used as hooks
export { useLibraryStore } from './stores/library.store';
export { useTasksStore } from './stores/tasks.store';
export { useBillsStore } from './stores/bills.store';
export { useLearningStore } from './stores/learning.store';
export { useUploadsStore } from './stores/uploads.store';
export { useAdminStore } from './stores/admin.store';
export { useCampaignsStore } from './stores/campaigns.store';
export { useInsightsStore } from './stores/insights.store';
export { useMessagingStore } from './stores/messaging.store';
export { useMessageTemplatesStore } from './stores/messageTemplates.store';
export { useRoadmapStore } from './stores/roadmap.store';
export { useContactsStore } from './stores/contacts.store';
export { useWikiStore } from './stores/wiki.store';
export { useSectionsStore } from './stores/sections.store';
export { useInvoicesStore } from './stores/invoices.store';
export { useReportsStore } from './stores/reports.store';
export { useBankReconciliationStore } from './stores/bank-reconciliation.store';
export { useMultiCurrencyStore } from './stores/multi-currency.store';
export { useRecurringTransactionsStore } from './stores/recurring-transactions.store';
export { useReceiptsStore } from './stores/receipts.store';
export { useTemplatesStore } from './stores/templates.store';
export { useBalanceSheetStore } from './stores/balance-sheet.store';
export { useIncomeStatementStore } from './stores/income-statement.store';
export { useCashFlowStatementStore } from './stores/cash-flow.store';
export { useAccountsReceivableStore } from './stores/accounts-receivable.store';
export { useEmailStore } from './stores/email.store';

// Export types from repositories
export type { 
  CashFlowStatement, 
  GenerateCashFlowStatementData,
  ComparativeCashFlowStatement 
} from './repositories/cash-flow.repository';

// Lazy loading functions for repositories  
export const getLibraryRepository = () => import('./repositories/library.repository').then(m => m.libraryRepository);
export const getTasksRepository = () => import('./repositories/tasks.repository').then(m => m.tasksRepository);
export const getFinanceRepository = () => import('./repositories/finance.repository').then(m => m.invoicesRepository);

// Export entity link service
export { entityLinkRepository as entityLinkService } from './repositories/entity-link.repository';

// New enhanced functionality from Buoy integration
export * from './hooks/useSettings';
export * from './hooks/useAppState';
export * from './hooks/useDataManager';
export * from './services/data-aggregator';

// Entity Link types (only export what actually exists)
export { 
  ENTITY_TYPES,
  LINK_KINDS,
  EntityLinkError,
  EntityLinkErrorCode,
  isValidEntityType,
  isValidLinkKind,
  isValidEntityRef,
  canLink,
  createEntityRef
} from './types/entity-link.types';

// Export types that exist from links.ts
export type { LinkKind as LinkKindType, EntityLink as EntityLinkType } from './links';

// Export EntityRef from links module (avoiding conflict with entity-link.types)
export type { EntityRef } from './links';

// WebSocket and real-time messaging exports
export * from '@ria/websocket-client';