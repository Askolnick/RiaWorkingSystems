'use client';

import { useEffect, useState } from 'react';
import { useBankReconciliationStore } from '@ria/client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Table,
  Badge,
  LoadingCard,
  ErrorAlert,
  Select,
  Input,
  Modal,
  Alert,
  Checkbox,
  ErrorBoundary,
  EmptyState
} from '@ria/web-ui';

export default function ReconciliationPage() {
  const {
    // State
    bankAccounts,
    currentAccount,
    bankTransactions,
    filteredTransactions,
    currentSession,
    reconciliationSessions,
    suggestions,
    outstandingItems,
    transactionFilters,
    selectedTransactions,
    // Loading states
    accountsLoading,
    transactionsLoading,
    matchingLoading,
    importLoading,
    loading,
    error,
    importError,
    // Actions
    fetchBankAccounts,
    setCurrentAccount,
    fetchBankTransactions,
    createReconciliationSession,
    setCurrentSession,
    runAutoMatching,
    acceptSuggestion,
    rejectSuggestion,
    matchTransaction,
    setTransactionFilters,
    toggleTransactionSelection,
    selectAllTransactions,
    clearSelection,
    importBankStatement,
    clearError,
    clearImportError
  } = useBankReconciliationStore();

  const [showImportModal, setShowImportModal] = useState(false);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [activeTab, setActiveTab] = useState('transactions');

  useEffect(() => {
    fetchBankAccounts();
  }, [fetchBankAccounts]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'matched': return 'success';
      case 'reconciled': return 'success';
      case 'unreconciled': return 'warning';
      case 'ignored': return 'secondary';
      default: return 'default';
    }
  };

  const handleStartReconciliation = async () => {
    if (!currentAccount) return;
    
    const sessionData = {
      tenantId: 'demo-tenant', // Replace with actual tenant
      bankAccountId: currentAccount.id,
      sessionName: `Reconciliation - ${new Date().toLocaleDateString()}`,
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      status: 'in_progress' as const,
      startingBookBalance: currentAccount.bookBalance,
      endingBookBalance: currentAccount.bookBalance,
      startingBankBalance: currentAccount.bankBalance,
      endingBankBalance: currentAccount.bankBalance,
      adjustmentAmount: 0,
      totalTransactions: 0,
      matchedTransactions: 0,
      unmatchedBankTransactions: 0,
      unmatchedBookTransactions: 0,
      createdBy: 'current-user' // Replace with actual user
    };

    await createReconciliationSession(sessionData);
    setShowNewSessionModal(false);
  };

  const handleAutoMatch = async () => {
    if (!currentAccount) return;
    await runAutoMatching(currentAccount.id, currentSession?.id);
  };

  const handleImportStatement = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentAccount) return;
    
    const formData = new FormData(event.currentTarget);
    const file = formData.get('file') as File;
    
    if (file) {
      const format = {
        fileType: 'csv',
        fieldMapping: {
          date: 'Date',
          description: 'Description', 
          amount: 'Amount'
        },
        hasHeader: true
      };
      
      await importBankStatement(currentAccount.id, file, format);
      setShowImportModal(false);
    }
  };

  if (accountsLoading) {
    return <LoadingCard />;
  }

  if (error && !bankAccounts.length) {
    return <ErrorAlert>{error}</ErrorAlert>;
  }

  return (
    <ErrorBoundary>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Bank Reconciliation</h1>
            <p className="text-gray-600">Match bank statements with your accounting records</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowImportModal(true)}
              disabled={!currentAccount}
            >
              Import Statement
            </Button>
            <Button 
              onClick={() => setShowNewSessionModal(true)}
              disabled={!currentAccount}
            >
              Start Reconciliation
            </Button>
          </div>
        </div>

        {/* Account Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Bank Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Account</label>
                <Select
                  value={currentAccount?.id || ''}
                  onValueChange={(value) => {
                    const account = bankAccounts.find(a => a.id === value);
                    setCurrentAccount(account || null);
                  }}
                >
                  {bankAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.accountName} - {account.accountNumber.slice(-4)}
                    </option>
                  ))}
                </Select>
              </div>
              
              {currentAccount && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Book Balance</label>
                    <div className="text-lg font-semibold text-green-600">
                      {formatCurrency(currentAccount.bookBalance)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Bank Balance</label>
                    <div className="text-lg font-semibold text-blue-600">
                      {formatCurrency(currentAccount.bankBalance)}
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            {error}
            <Button variant="outline" size="sm" onClick={clearError} className="ml-2">
              Dismiss
            </Button>
          </Alert>
        )}

        {importError && (
          <Alert variant="destructive">
            Import Error: {importError}
            <Button variant="outline" size="sm" onClick={clearImportError} className="ml-2">
              Dismiss
            </Button>
          </Alert>
        )}

        {currentAccount && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="matching">Auto-Matching</TabsTrigger>
              <TabsTrigger value="sessions">Reconciliation Sessions</TabsTrigger>
              <TabsTrigger value="outstanding">Outstanding Items</TabsTrigger>
              <TabsTrigger value="variance">Variance Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Bank Transactions</CardTitle>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search transactions..."
                        value={transactionFilters.searchTerm}
                        onChange={(e) => setTransactionFilters({ searchTerm: e.target.value })}
                        className="w-64"
                      />
                      <Select
                        value={transactionFilters.status}
                        onValueChange={(value) => setTransactionFilters({ status: value })}
                      >
                        <option value="all">All Status</option>
                        <option value="unreconciled">Unreconciled</option>
                        <option value="matched">Matched</option>
                        <option value="reconciled">Reconciled</option>
                        <option value="ignored">Ignored</option>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {transactionsLoading ? (
                    <LoadingCard />
                  ) : filteredTransactions.length === 0 ? (
                    <EmptyState>
                      <p className="text-center text-gray-500">No transactions found</p>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowImportModal(true)}
                        className="mt-4"
                      >
                        Import Bank Statement
                      </Button>
                    </EmptyState>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedTransactions.length === filteredTransactions.length}
                            onCheckedChange={(checked) => {
                              checked ? selectAllTransactions() : clearSelection();
                            }}
                          />
                          <span className="text-sm text-gray-600">
                            {selectedTransactions.length} of {filteredTransactions.length} selected
                          </span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={selectedTransactions.length === 0}
                        >
                          Bulk Actions
                        </Button>
                      </div>
                      
                      <Table>
                        <thead>
                          <tr>
                            <th></th>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTransactions.map((transaction) => (
                            <tr key={transaction.id}>
                              <td>
                                <Checkbox
                                  checked={selectedTransactions.includes(transaction.id)}
                                  onCheckedChange={() => toggleTransactionSelection(transaction.id)}
                                />
                              </td>
                              <td>{formatDate(transaction.date)}</td>
                              <td className="max-w-xs truncate">{transaction.description}</td>
                              <td className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {formatCurrency(transaction.amount)}
                              </td>
                              <td>
                                <Badge variant={getStatusBadgeVariant(transaction.status)}>
                                  {transaction.status}
                                </Badge>
                              </td>
                              <td>
                                <Button variant="outline" size="sm">
                                  Match
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="matching" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Auto-Matching</CardTitle>
                    <Button 
                      onClick={handleAutoMatch}
                      disabled={matchingLoading}
                    >
                      Run Auto-Match
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {suggestions.length === 0 ? (
                    <EmptyState>
                      <p className="text-center text-gray-500">No matching suggestions found</p>
                      <p className="text-center text-sm text-gray-400 mt-2">
                        Run auto-match to find potential transaction matches
                      </p>
                    </EmptyState>
                  ) : (
                    <div className="space-y-4">
                      {suggestions.map((suggestion) => (
                        <Card key={suggestion.id} className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">Match Confidence: {suggestion.matchConfidence}%</div>
                              <div className="text-sm text-gray-600 mt-1">
                                {suggestion.matchReason}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => acceptSuggestion(suggestion)}
                              >
                                Accept
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => rejectSuggestion(suggestion.id)}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reconciliation Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  {reconciliationSessions.length === 0 ? (
                    <EmptyState>
                      <p className="text-center text-gray-500">No reconciliation sessions</p>
                      <Button 
                        onClick={() => setShowNewSessionModal(true)}
                        className="mt-4"
                      >
                        Start New Session
                      </Button>
                    </EmptyState>
                  ) : (
                    <div className="space-y-4">
                      {reconciliationSessions.map((session) => (
                        <Card 
                          key={session.id} 
                          className={`p-4 cursor-pointer ${currentSession?.id === session.id ? 'ring-2 ring-blue-500' : ''}`}
                          onClick={() => setCurrentSession(session)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{session.sessionName}</div>
                              <div className="text-sm text-gray-600">
                                {formatDate(session.startDate)} - {formatDate(session.endDate)}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {session.matchedTransactions} of {session.totalTransactions} matched
                              </div>
                            </div>
                            <Badge variant={session.status === 'completed' ? 'success' : 'warning'}>
                              {session.status}
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="outstanding" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Outstanding Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {outstandingItems.length === 0 ? (
                    <EmptyState>
                      <p className="text-center text-gray-500">No outstanding items</p>
                    </EmptyState>
                  ) : (
                    <Table>
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Description</th>
                          <th>Amount</th>
                          <th>Days Outstanding</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {outstandingItems.map((item) => (
                          <tr key={item.id}>
                            <td>{item.type.replace('_', ' ')}</td>
                            <td>{item.description}</td>
                            <td>{formatCurrency(item.amount)}</td>
                            <td>{item.daysOutstanding}</td>
                            <td>
                              <Badge variant={item.status === 'cleared' ? 'success' : 'warning'}>
                                {item.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="variance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600">Balance Difference</div>
                    <div className="text-2xl font-bold text-red-600">
                      {currentAccount ? formatCurrency(currentAccount.bookBalance - currentAccount.bankBalance) : '$0.00'}
                    </div>
                    <div className="text-xs text-gray-500">Book vs Bank Balance</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600">Unreconciled Transactions</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {filteredTransactions.filter(t => t.status === 'unreconciled').length}
                    </div>
                    <div className="text-xs text-gray-500">Requires attention</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600">Outstanding Items</div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {outstandingItems.length}
                    </div>
                    <div className="text-xs text-gray-500">In transit</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600">Match Rate</div>
                    <div className="text-2xl font-bold text-green-600">
                      {filteredTransactions.length > 0 
                        ? Math.round((filteredTransactions.filter(t => t.status === 'matched' || t.status === 'reconciled').length / filteredTransactions.length) * 100)
                        : 0}%
                    </div>
                    <div className="text-xs text-gray-500">Transaction matching</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Reconciliation Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentSession ? (
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Session Period:</span>
                          <span className="font-medium">
                            {formatDate(currentSession.startDate)} - {formatDate(currentSession.endDate)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Starting Book Balance:</span>
                          <span className="font-medium">{formatCurrency(currentSession.startingBookBalance)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Starting Bank Balance:</span>
                          <span className="font-medium">{formatCurrency(currentSession.startingBankBalance)}</span>
                        </div>
                        <hr />
                        <div className="flex justify-between">
                          <span>Ending Book Balance:</span>
                          <span className="font-medium">{formatCurrency(currentSession.endingBookBalance)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ending Bank Balance:</span>
                          <span className="font-medium">{formatCurrency(currentSession.endingBankBalance)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Adjustments:</span>
                          <span className="font-medium">{formatCurrency(currentSession.adjustmentAmount)}</span>
                        </div>
                        <hr />
                        <div className="flex justify-between text-lg font-semibold">
                          <span>Net Difference:</span>
                          <span className={currentSession.endingBookBalance - currentSession.endingBankBalance !== 0 ? 'text-red-600' : 'text-green-600'}>
                            {formatCurrency(currentSession.endingBookBalance - currentSession.endingBankBalance - currentSession.adjustmentAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Transactions:</span>
                          <span className="font-medium">{currentSession.totalTransactions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Matched Transactions:</span>
                          <span className="font-medium text-green-600">{currentSession.matchedTransactions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Unmatched Bank:</span>
                          <span className="font-medium text-orange-600">{currentSession.unmatchedBankTransactions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Unmatched Book:</span>
                          <span className="font-medium text-orange-600">{currentSession.unmatchedBookTransactions}</span>
                        </div>
                      </div>
                    ) : (
                      <EmptyState>
                        <p className="text-center text-gray-500">No active reconciliation session</p>
                        <Button 
                          onClick={() => setShowNewSessionModal(true)}
                          className="mt-4"
                        >
                          Start New Session
                        </Button>
                      </EmptyState>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Variance Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Transaction Status Breakdown</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span>Reconciled:</span>
                            <Badge variant="success">
                              {filteredTransactions.filter(t => t.status === 'reconciled').length}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Matched:</span>
                            <Badge variant="success">
                              {filteredTransactions.filter(t => t.status === 'matched').length}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Unreconciled:</span>
                            <Badge variant="warning">
                              {filteredTransactions.filter(t => t.status === 'unreconciled').length}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Ignored:</span>
                            <Badge variant="secondary">
                              {filteredTransactions.filter(t => t.status === 'ignored').length}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium mb-2">Outstanding Items Analysis</h4>
                        <div className="space-y-2 text-sm">
                          {outstandingItems.length > 0 ? (
                            <>
                              <div className="flex justify-between">
                                <span>0-30 days:</span>
                                <span className="font-medium text-green-600">
                                  {outstandingItems.filter(item => item.ageCategory === '0-30').length}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>31-60 days:</span>
                                <span className="font-medium text-yellow-600">
                                  {outstandingItems.filter(item => item.ageCategory === '31-60').length}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>61-90 days:</span>
                                <span className="font-medium text-orange-600">
                                  {outstandingItems.filter(item => item.ageCategory === '61-90').length}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>90+ days:</span>
                                <span className="font-medium text-red-600">
                                  {outstandingItems.filter(item => item.ageCategory === '90+').length}
                                </span>
                              </div>
                            </>
                          ) : (
                            <p className="text-gray-500 text-center">No outstanding items</p>
                          )}
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <h4 className="font-medium mb-2">Reconciliation Health</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Balance Variance:</span>
                            <span className={Math.abs(currentAccount?.bookBalance - currentAccount?.bankBalance || 0) > 100 ? 'font-medium text-red-600' : 'font-medium text-green-600'}>
                              {Math.abs(currentAccount?.bookBalance - currentAccount?.bankBalance || 0) < 0.01 ? 'Balanced' : 'Variance exists'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Reconciliation:</span>
                            <span className="font-medium">
                              {currentAccount?.lastReconciliationDate ? formatDate(currentAccount.lastReconciliationDate) : 'Never'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Days Since Last:</span>
                            <span className="font-medium">
                              {currentAccount?.lastReconciliationDate 
                                ? Math.floor((new Date().getTime() - new Date(currentAccount.lastReconciliationDate).getTime()) / (1000 * 60 * 60 * 24))
                                : 'N/A'} days
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Reconciliation Report</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Export PDF
                      </Button>
                      <Button variant="outline" size="sm">
                        Export Excel
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      Generate detailed reconciliation reports for auditing and compliance purposes.
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Summary Report</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          High-level reconciliation summary with key metrics and variances.
                        </p>
                        <Button variant="outline" size="sm" className="w-full">
                          Generate Summary
                        </Button>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Detailed Report</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Complete transaction-by-transaction reconciliation details.
                        </p>
                        <Button variant="outline" size="sm" className="w-full">
                          Generate Detailed
                        </Button>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Exception Report</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Focus on unmatched transactions and outstanding items.
                        </p>
                        <Button variant="outline" size="sm" className="w-full">
                          Generate Exceptions
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Import Modal */}
        <Modal 
          open={showImportModal} 
          onClose={() => setShowImportModal(false)}
          title="Import Bank Statement"
        >
          <form onSubmit={handleImportStatement} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Statement File</label>
              <Input 
                type="file" 
                name="file" 
                accept=".csv,.qif,.ofx"
                required
              />
              <p className="text-sm text-gray-600 mt-1">
                Supported formats: CSV, QIF, OFX
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowImportModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={importLoading}>
                Import
              </Button>
            </div>
          </form>
        </Modal>

        {/* New Session Modal */}
        <Modal
          open={showNewSessionModal}
          onClose={() => setShowNewSessionModal(false)}
          title="Start New Reconciliation"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              This will create a new reconciliation session for {currentAccount?.accountName}.
            </p>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowNewSessionModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleStartReconciliation} disabled={loading}>
                Start Reconciliation
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ErrorBoundary>
  );
}