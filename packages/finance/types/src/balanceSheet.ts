/*
 * Balance sheet computation for a given date.  This module reads
 * journal lines grouped by account type and rolls up balances into
 * Assets, Liabilities and Equity.  It returns a tree representation
 * that can be rendered in the UI along with top‑level totals.
 */
import type { Account, JournalLine } from '@prisma/client';

export interface BalanceTreeNode {
  account: Account;
  balance: number;
  children: BalanceTreeNode[];
}

export interface BalanceSheetResult {
  assets: number;
  liabilities: number;
  equity: number;
  profit: number;
  tree: BalanceTreeNode[];
}

/**
 * Compute the balance sheet as of a specific date.
 *
 * @param accounts Full chart of accounts
 * @param lines Journal lines up to the as‑of date
 * @returns A balance sheet result with totals and a tree
 */
export function computeBalanceSheet(accounts: Account[], lines: JournalLine[]): BalanceSheetResult {
  // Build a map of account balances
  const balanceMap: Record<string, number> = {};
  for (const line of lines) {
    const accId = line.accountId;
    const debit = line.debitCents || 0;
    const credit = line.creditCents || 0;
    balanceMap[accId] = (balanceMap[accId] || 0) + debit - credit;
  }
  // Build the tree from the chart
  const nodeMap: Record<string, BalanceTreeNode> = {};
  for (const account of accounts) {
    nodeMap[account.id] = { account, balance: balanceMap[account.id] || 0, children: [] };
  }
  const roots: BalanceTreeNode[] = [];
  for (const account of accounts) {
    const node = nodeMap[account.id];
    if (account.parentId) {
      nodeMap[account.parentId].children.push(node);
    } else {
      roots.push(node);
    }
  }
  // Roll up balances from children to parents
  function rollUp(node: BalanceTreeNode): number {
    let total = node.balance;
    for (const child of node.children) {
      total += rollUp(child);
    }
    node.balance = total;
    return total;
  }
  for (const root of roots) rollUp(root);
  // Aggregate by account type
  let assets = 0;
  let liabilities = 0;
  let equity = 0;
  let revenue = 0;
  let expense = 0;
  for (const node of roots) {
    const type = node.account.type;
    const bal = node.balance;
    if (type === 'asset') assets += bal;
    else if (type === 'liability') liabilities += bal;
    else if (type === 'equity') equity += bal;
    else if (type === 'revenue') revenue += bal;
    else if (type === 'expense') expense += bal;
  }
  const profit = revenue - expense;
  const equityWithProfit = equity + profit;
  return {
    assets,
    liabilities,
    equity: equityWithProfit,
    profit,
    tree: roots
  };
}