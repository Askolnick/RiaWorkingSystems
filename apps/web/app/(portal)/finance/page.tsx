import Link from 'next/link';

export default function FinancePage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Finance</h1>
      <p className="text-gray-700 dark:text-gray-300">
        This section provides a unified view of your organisation’s finances.  You
        can manage invoices, bills, payments, expenses and chart of accounts.  An
        experimental AI engine can categorise transactions and suggest
        balanced journal entries.
      </p>
      <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
        <li>
          <Link href="./finance/invoices" className="text-blue-600 dark:text-blue-400 hover:underline">
            Invoices
          </Link>
        </li>
        <li>
          <Link href="./finance/bills" className="text-blue-600 dark:text-blue-400 hover:underline">
            Bills
          </Link>
        </li>
        <li>
          <Link href="./finance/expenses" className="text-blue-600 dark:text-blue-400 hover:underline">
            Expenses
          </Link>
        </li>
        <li>
          <Link href="./finance/balance-sheet" className="text-blue-600 dark:text-blue-400 hover:underline">
            Balance Sheet
          </Link>
        </li>
      </ul>
    </div>
  );
}