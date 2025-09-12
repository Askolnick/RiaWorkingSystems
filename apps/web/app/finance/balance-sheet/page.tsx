export default function FinanceBalanceSheetPage() : void {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Balance Sheet</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-2">
        View a snapshot of your assets, liabilities and equity as of a given
        date.  The underlying service sums journal lines by account type
        and ensures your books stay in balance.
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        In a full implementation, you could select a date and see the
        rolled‑up balances along with a drill‑down into individual
        accounts.  For now, this static page shows where the balance
        sheet UI will live.
      </p>
    </div>
  );
}