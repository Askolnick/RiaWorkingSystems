interface ARPayment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  method: string;
}

interface CollectionCase {
  id: string;
  customerId: string;
  status: string;
  priority: string;
  totalAmount: number;
}

interface AgingReport {
  asOfDate: string;
  buckets: AgingBucket[];
  totalOutstanding: number;
}