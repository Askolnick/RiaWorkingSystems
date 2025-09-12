'use client';

import { useEffect, useState } from 'react';
import { 
  Card, 
  Button, 
  Table, 
  Badge, 
  Modal, 
  Input, 
  Select, 
  LoadingCard, 
  Alert,
  Tabs,
  Tab
} from '@ria/web-ui';
import { 
  Upload,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Check,
  X,
  FileText,
  Camera,
  TrendingUp
} from 'lucide-react';
import { useReceiptsStore } from '@ria/client';

export default function ReceiptsPage() {
  const {
    receipts,
    statistics,
    loading,
    uploading,
    error,
    filters,
    selectedIds,
    fetchReceipts,
    fetchStatistics,
    uploadReceipt,
    categorizeReceipt,
    approveReceipt,
    rejectReceipt,
    bulkApprove,
    bulkCategorize,
    exportReceipts,
    setFilters,
    clearFilters,
    toggleSelection,
    selectAll,
    clearSelection,
    clearError
  } = useReceiptsStore();

  const [activeTab, setActiveTab] = useState('receipts');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchReceipts();
    fetchStatistics();
  }, [fetchReceipts, fetchStatistics]);

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    try {
      await uploadReceipt(selectedFile);
      setUploadModalOpen(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    await bulkApprove(selectedIds, 'Bulk approved');
  };

  const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
    try {
      const result = await exportReceipts(format, filters);
      // In production, this would trigger download
      window.open(result.url, '_blank');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      verified: { color: 'bg-green-100 text-green-800', text: 'Verified' },
      matched: { color: 'bg-blue-100 text-blue-800', text: 'Matched' },
      archived: { color: 'bg-gray-100 text-gray-800', text: 'Archived' },
      deleted: { color: 'bg-red-100 text-red-800', text: 'Deleted' }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  if (loading && receipts.length === 0) return <LoadingCard />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Receipt Manager</h1>
          <p className="text-gray-600">Digitize and manage receipts with OCR and smart categorization</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setFilterModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Receipt
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert type="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <Tab value="receipts" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Receipts ({receipts.length})
        </Tab>
        <Tab value="statistics" className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Analytics
        </Tab>
      </Tabs>

      {activeTab === 'receipts' && (
        <>
          {/* Actions Bar */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {selectedIds.length} selected
                  </span>
                  <Button size="sm" onClick={handleBulkApprove}>
                    Approve All
                  </Button>
                  <Button size="sm" variant="outline" onClick={clearSelection}>
                    Clear
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search receipts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select
                value=""
                onValueChange={(value) => handleExport(value as any)}
                placeholder="Export"
              >
                <option value="pdf">Export as PDF</option>
                <option value="csv">Export as CSV</option>
                <option value="excel">Export as Excel</option>
              </Select>
            </div>
          </div>

          {/* Receipts Table */}
          <Card>
            <Table
              data={receipts.filter(receipt => 
                receipt.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                receipt.category.toLowerCase().includes(searchTerm.toLowerCase())
              )}
              columns={[
                {
                  key: 'select',
                  header: (
                    <input
                      type="checkbox"
                      checked={selectedIds.length === receipts.length}
                      onChange={(e) => e.target.checked ? selectAll() : clearSelection()}
                    />
                  ),
                  render: (receipt: any) => (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(receipt.id)}
                      onChange={() => toggleSelection(receipt.id)}
                    />
                  )
                },
                {
                  key: 'receiptNumber',
                  header: 'Receipt #',
                  render: (receipt: any) => (
                    <div className="font-mono text-sm">{receipt.receiptNumber}</div>
                  )
                },
                {
                  key: 'vendor',
                  header: 'Vendor',
                  render: (receipt: any) => (
                    <div>
                      <div className="font-medium">{receipt.vendor}</div>
                      <div className="text-sm text-gray-500">{receipt.transactionDate}</div>
                    </div>
                  )
                },
                {
                  key: 'category',
                  header: 'Category',
                  render: (receipt: any) => (
                    <div>
                      <div>{receipt.category}</div>
                      {receipt.subcategory && (
                        <div className="text-sm text-gray-500">{receipt.subcategory}</div>
                      )}
                    </div>
                  )
                },
                {
                  key: 'amount',
                  header: 'Amount',
                  render: (receipt: any) => (
                    <div className="text-right">
                      <div className="font-medium">${receipt.totalAmount.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">
                        Tax: ${receipt.tax.toFixed(2)}
                      </div>
                    </div>
                  )
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (receipt: any) => getStatusBadge(receipt.status)
                },
                {
                  key: 'match',
                  header: 'Match',
                  render: (receipt: any) => (
                    <div>
                      {receipt.matchStatus === 'matched' && (
                        <Badge className="bg-blue-100 text-blue-800">
                          {receipt.matchConfidence}%
                        </Badge>
                      )}
                      {receipt.matchStatus === 'unmatched' && (
                        <Badge className="bg-gray-100 text-gray-800">
                          No Match
                        </Badge>
                      )}
                    </div>
                  )
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (receipt: any) => (
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="p-1">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="p-1">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      {receipt.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="p-1 text-green-600"
                            onClick={() => approveReceipt(receipt.id)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="p-1 text-red-600"
                            onClick={() => rejectReceipt(receipt.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  )
                }
              ]}
              loading={loading}
            />
          </Card>
        </>
      )}

      {activeTab === 'statistics' && statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Overview Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Overview</h3>
            <div className="space-y-4">
              <div>
                <div className="text-2xl font-bold">{statistics.totalReceipts}</div>
                <div className="text-gray-600">Total Receipts</div>
              </div>
              <div>
                <div className="text-2xl font-bold">${statistics.totalAmount.toFixed(2)}</div>
                <div className="text-gray-600">Total Amount</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{statistics.matchRate.toFixed(1)}%</div>
                <div className="text-gray-600">Match Rate</div>
              </div>
            </div>
          </Card>

          {/* By Status */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">By Status</h3>
            <div className="space-y-2">
              {Object.entries(statistics.byStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between">
                  <span className="capitalize">{status}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Categories */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Categories</h3>
            <div className="space-y-2">
              {Object.entries(statistics.byCategory)
                .sort(([,a], [,b]) => b.amount - a.amount)
                .slice(0, 5)
                .map(([category, data]) => (
                  <div key={category} className="flex justify-between">
                    <span>{category}</span>
                    <div className="text-right">
                      <div className="font-medium">${data.amount.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">{data.count} receipts</div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* Top Vendors */}
          <Card className="p-6 md:col-span-2 lg:col-span-3">
            <h3 className="text-lg font-semibold mb-4">Top Vendors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statistics.byVendor.slice(0, 6).map((vendor) => (
                <div key={vendor.vendor} className="border rounded-lg p-4">
                  <div className="font-medium">{vendor.vendor}</div>
                  <div className="text-lg font-bold">${vendor.amount.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">{vendor.count} receipts</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Upload Modal */}
      <Modal 
        isOpen={uploadModalOpen} 
        onClose={() => setUploadModalOpen(false)}
        title="Upload Receipt"
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {selectedFile ? (
              <div>
                <FileText className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                <div className="font-medium">{selectedFile.name}</div>
                <div className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            ) : (
              <>
                <Camera className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <div className="text-lg font-medium mb-2">Upload Receipt</div>
                <div className="text-gray-500 mb-4">
                  Drag and drop a file, or click to select
                </div>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="receipt-upload"
                />
                <label htmlFor="receipt-upload">
                  <Button as="span">Choose File</Button>
                </label>
              </>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleFileUpload}
              disabled={!selectedFile || uploading}
              loading={uploading}
            >
              Upload & Process
            </Button>
          </div>
        </div>
      </Modal>

      {/* Filter Modal */}
      <Modal 
        isOpen={filterModalOpen} 
        onClose={() => setFilterModalOpen(false)}
        title="Filter Receipts"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select
              value={filters.status?.[0] || ''}
              onValueChange={(value) => 
                setFilters({ status: value ? [value] : undefined })
              }
              placeholder="All statuses"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="matched">Matched</option>
              <option value="archived">Archived</option>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date From</label>
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters({ dateFrom: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date To</label>
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters({ dateTo: e.target.value })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount Min</label>
              <Input
                type="number"
                step="0.01"
                value={filters.amountMin || ''}
                onChange={(e) => setFilters({ amountMin: parseFloat(e.target.value) || undefined })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount Max</label>
              <Input
                type="number"
                step="0.01"
                value={filters.amountMax || ''}
                onChange={(e) => setFilters({ amountMax: parseFloat(e.target.value) || undefined })}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={clearFilters}>
              Clear All
            </Button>
            <Button onClick={() => setFilterModalOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}