# Finance Module

The Finance centre provides a unified place to manage your organisation’s money
flows. It handles sales (invoices), purchases (bills), operating expenses,
payments and basic bookkeeping constructs such as tax rates, chart of
accounts and journal entries. This module lays the foundation for more
advanced capabilities like multi‑currency support, recurring invoices,
automated reconciliation and detailed financial reporting.

## Invoices

- **Customers** are represented by `Contact` records. Each invoice belongs to
  a customer and has a status lifecycle (`draft → open → paid → void →
  uncollectible`).
- **Line items** (`InvoiceLine`) describe what was sold: a description,
  quantity, unit price and total. Lines cascade when their parent invoice
  is deleted.
- **Payments** record partial or full settlements of an invoice. Multiple
  payments can be attached to a single invoice. When the invoice balance
  reaches zero, your application can automatically update its status to
  `paid`.
- **Currency**: all monetary amounts are stored as integer cents with an
  associated ISO currency code. Extend this model if you need multi‑
  currency invoices or exchange rate tracking.

## Bills

- **Bills** mirror invoices but represent amounts owed to vendors (also
  stored as `Contact`). Bills follow the same lifecycle and support
  multiple line items (`BillLine`).
- Recording bills helps you track accounts payable and cash flow. You can
  mark a bill as `paid` when the sum of its associated payments equals
  the total.

## Expenses and Receipts

- **Expenses** capture out‑of‑pocket purchases, travel costs or any
  spending not tied to a specific bill. Expenses can optionally link to
  a project, vendor or invoice.
- **Financial documents** store receipts, statements, contracts and other
  relevant files. Each document has an S3/R2 key, optional OCR output and a
  list of linked entities. Use the receipts pipeline to ingest files,
  extract data and auto‑match them to existing expenses or invoices.

## Tax Rates

- **Tax rates** (`TaxRate`) store percentages for VAT/GST or sales tax.
  Records include country and region codes so you can handle jurisdictional
  differences. Add effective dates if rates change over time.
- When generating invoices or bills, you can compute tax amounts based on
  these rates and display them on line items or at the invoice total level.

## Chart of Accounts

- The finance module defines an **account** model (`Account`) to build
  your chart of accounts. Each account has a code, a name and a type
  (e.g. asset, liability, expense, revenue).
- Defining a clear chart of accounts allows you to produce standard
  financial statements and categorise transactions consistently.

## Journal Entries

- **Journal entries** (`JournalEntry`) represent accounting events like
  recognising revenue, recording payments or accruing expenses. Each entry
  has one or more **journal lines** (`JournalLine`) specifying debit and
  credit amounts against accounts.
- Your application logic must ensure that the sum of debit amounts
  equals the sum of credit amounts for each journal entry. The current
  schema does not enforce this at the database layer; implement checks in
  services or use database constraints if desired.

## Future Directions

- **Multi‑currency**: add tables for exchange rates and store both home and
  foreign currency amounts on transactions. Compute realised and unrealised
  gains automatically.
- **Recurring invoices** and **subscriptions**: automate generation of
  invoices at regular intervals with proration rules.
- **Bank import & reconciliation**: ingest bank feeds (via APIs like Plaid)
  or CSV uploads, categorise transactions automatically and match them
  against invoices, bills or expenses.
- **Reports & dashboards**: build views to analyse revenue, costs, profit
  margins, receivables ageing and payables schedules.

This finance module is designed to be extended as your organisation’s
needs evolve. Keep business logic (like invoice balance checks and tax
calculations) in the application layer so you can customise behaviour
without changing the underlying data model.