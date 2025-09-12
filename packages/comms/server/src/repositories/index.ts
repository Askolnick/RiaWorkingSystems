// Base repository exports
export { BaseRepository, MockRepository, type PaginationParams, type PaginatedResponse, type QueryParams, RepositoryError } from './base.repository';

// Repository class exports (without instances)
export { AuthRepository } from './auth.repository';
export { PortalRepository, MockPortalRepository } from './portal.repository';
export { TasksRepository, MockTasksRepository } from './tasks.repository';
export { InvoicesRepository, MockInvoicesRepository } from './invoices.repository';
export { BillsRepository, MockBillsRepository } from './bills.repository';
export { LibraryRepository, MockLibraryRepository } from './library.repository';
export { MessagingRepository, MockMessagingRepository } from './messaging.repository';
export { RoadmapRepository, MockRoadmapRepository } from './roadmap.repository';
export { ContactsRepository, MockContactsRepository } from './contacts.repository';
export { MessageTemplatesRepository, MockMessageTemplatesRepository } from './messageTemplates.repository';
export { WikiRepository, MockWikiRepository } from './wiki.repository';
export { SectionsRepository, MockSectionsRepository } from './sections.repository';
export { EntityLinkRepositoryImpl, MockEntityLinkRepository } from './entity-link.repository';
export { ReportsRepository, MockReportsRepository } from './reports.repository';
export { BankReconciliationRepository, MockBankReconciliationRepository } from './bank-reconciliation.repository';
export { MultiCurrencyRepository, MockMultiCurrencyRepository } from './multi-currency.repository';
export { RecurringTransactionsRepository, MockRecurringTransactionsRepository } from './recurring-transactions.repository';
export { TemplatesRepository, MockTemplatesRepository } from './templates.repository';
export { ReceiptManagerRepository, MockReceiptManagerRepository } from './receipt-manager.repository';
export { BalanceSheetRepository, MockBalanceSheetRepository } from './balance-sheet.repository';
export { IncomeStatementRepository, MockIncomeStatementRepository } from './income-statement.repository';
export { CashFlowStatementRepository, MockCashFlowStatementRepository } from './cash-flow.repository';
export { AccountsReceivableRepository, MockAccountsReceivableRepository } from './accounts-receivable.repository';
export { EmailRepository } from './email.repository';

// Singleton instances for immediate use
export { authRepository } from './auth.repository';
export { portalRepository } from './portal.repository';
export { tasksRepository } from './tasks.repository';
export { invoicesRepository } from './invoices.repository';
export { billsRepository } from './bills.repository';
export { libraryRepository } from './library.repository';
export { messagingRepository } from './messaging.repository';
export { roadmapRepository } from './roadmap.repository';
export { wikiRepository } from './wiki.repository';
export { sectionsRepository } from './sections.repository';
export { contactsRepository } from './contacts.repository';
export { messageTemplatesRepository } from './messageTemplates.repository';
export { entityLinkRepository } from './entity-link.repository';
export { reportsRepository } from './reports.repository';
export { bankReconciliationRepository } from './bank-reconciliation.repository';
export { multiCurrencyRepository } from './multi-currency.repository';
export { recurringTransactionsRepository } from './recurring-transactions.repository';
export { templatesRepository } from './templates.repository';
export { receiptManagerRepository } from './receipt-manager.repository';
export { balanceSheetRepository } from './balance-sheet.repository';
export { incomeStatementRepository } from './income-statement.repository';
export { cashFlowStatementRepository } from './cash-flow.repository';
export { accountsReceivableRepository } from './accounts-receivable.repository';
export { emailRepository } from './email.repository';