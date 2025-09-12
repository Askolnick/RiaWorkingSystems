/**
 * Receipt Manager Server
 * 
 * OCR-powered receipt management with transaction matching and audit compliance
 */

import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
import pdfParse from 'pdf-parse';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

import type {
  Receipt,
  ReceiptStatus,
  OCRData,
  OCRLineItem,
  CreateReceiptData,
  BankTransaction,
  TransactionMatch,
  MatchingRule,
  ReceiptFilters,
  ReceiptStatistics,
  MatchingStatistics,
  AuditReport
} from './types';

export * from './types';
export * from './categorization';
export * from './approval-workflow';

/**
 * Core Receipt Manager service
 */
export class ReceiptManager {
  private ocrWorker: any = null;
  private isInitialized = false;

  constructor(
    private config: {
      uploadPath: string;
      maxFileSize: number;
      allowedTypes: string[];
      ocrLanguage: string;
      confidenceThreshold: number;
    }
  ) {}

  /**
   * Initialize OCR worker
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.ocrWorker = await createWorker(this.config.ocrLanguage || 'eng');
    await this.ocrWorker.setParameters({
      tessedit_pageseg_mode: '6', // Uniform block of text
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,/$-+():',
    });

    this.isInitialized = true;
  }

  /**
   * Process uploaded receipt file
   */
  async processReceipt(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    tenantId: string,
    uploadedById: string
  ): Promise<{ receipt: Partial<Receipt>; ocrData: OCRData }> {
    await this.initialize();

    // Validate file
    this.validateFile(fileBuffer, mimeType);

    // Generate unique file path
    const fileHash = createHash('md5').update(fileBuffer).digest('hex');
    const ext = path.extname(fileName);
    const uniqueFileName = `${fileHash}_${Date.now()}${ext}`;
    const filePath = path.join(this.config.uploadPath, tenantId, uniqueFileName);

    // Save file
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, fileBuffer);

    // Extract text based on file type
    let ocrData: OCRData;
    if (mimeType.startsWith('image/')) {
      ocrData = await this.processImage(fileBuffer, filePath);
    } else if (mimeType === 'application/pdf') {
      ocrData = await this.processPDF(fileBuffer);
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    // Parse structured data from OCR text
    const parsedData = this.parseReceiptData(ocrData);

    // Create receipt object
    const receipt: Partial<Receipt> = {
      tenantId,
      receiptNumber: this.generateReceiptNumber(),
      vendor: parsedData.vendor || 'Unknown Vendor',
      transactionDate: parsedData.date || new Date().toISOString().split('T')[0],
      amount: parsedData.subtotal || parsedData.total || 0,
      tax: parsedData.tax || 0,
      totalAmount: parsedData.total || 0,
      currency: parsedData.currency || 'USD',
      paymentMethod: 'unknown',
      category: 'uncategorized',
      expenseType: 'business',
      lineItems: parsedData.items || [],
      fileUrl: `/uploads/${tenantId}/${uniqueFileName}`,
      ocrData,
      imageUrls: [filePath],
      matchStatus: 'unmatched',
      status: 'pending',
      verificationStatus: 'unverified',
      notes: '',
      tags: [],
      createdBy: uploadedById,
      createdAt: new Date().toISOString(),
      updatedBy: uploadedById,
      updatedAt: new Date().toISOString()
    };

    return { receipt, ocrData };
  }

  /**
   * Process image file with OCR
   */
  private async processImage(buffer: Buffer, filePath: string): Promise<OCRData> {
    // Optimize image for OCR
    const optimizedBuffer = await sharp(buffer)
      .grayscale()
      .normalize()
      .sharpen()
      .threshold(128)
      .png()
      .toBuffer();

    // Run OCR
    const { data } = await this.ocrWorker.recognize(optimizedBuffer);
    
    return {
      vendor: undefined,
      date: undefined,
      amount: undefined,
      tax: undefined,
      total: undefined,
      currency: 'USD',
      items: [],
      rawText: data.text,
      confidence: data.confidence,
      provider: 'tesseract'
    };
  }

  /**
   * Process PDF file
   */
  private async processPDF(buffer: Buffer): Promise<OCRData> {
    const pdfData = await pdfParse(buffer);
    
    return {
      vendor: undefined,
      date: undefined,
      amount: undefined,
      tax: undefined,
      total: undefined,
      currency: 'USD',
      items: [],
      rawText: pdfData.text,
      confidence: 95, // PDFs usually have high text confidence
      provider: 'pdf-parse'
    };
  }

  /**
   * Parse structured data from OCR text
   */
  private parseReceiptData(ocrData: OCRData): {
    vendor?: string;
    date?: string;
    total?: number;
    subtotal?: number;
    tax?: number;
    currency?: string;
    items?: OCRLineItem[];
  } {
    const text = ocrData.rawText.toLowerCase();
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    const result: any = {};

    // Extract total amount
    const totalPatterns = [
      /total[\s:]*\$?(\d+\.?\d*)/i,
      /amount[\s:]*\$?(\d+\.?\d*)/i,
      /^[\s]*\$?(\d+\.\d{2})[\s]*$/i
    ];

    for (const pattern of totalPatterns) {
      for (const line of lines) {
        const match = line.match(pattern);
        if (match) {
          result.total = parseFloat(match[1]);
          break;
        }
      }
      if (result.total) break;
    }

    // Extract tax amount
    const taxPatterns = [
      /tax[\s:]*\$?(\d+\.?\d*)/i,
      /vat[\s:]*\$?(\d+\.?\d*)/i,
      /gst[\s:]*\$?(\d+\.?\d*)/i
    ];

    for (const pattern of taxPatterns) {
      for (const line of lines) {
        const match = line.match(pattern);
        if (match) {
          result.tax = parseFloat(match[1]);
          break;
        }
      }
      if (result.tax) break;
    }

    // Extract date
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
      /(\d{1,2}-\d{1,2}-\d{2,4})/,
      /(\d{4}-\d{1,2}-\d{1,2})/
    ];

    for (const pattern of datePatterns) {
      for (const line of lines) {
        const match = line.match(pattern);
        if (match) {
          result.date = this.normalizeDate(match[1]);
          break;
        }
      }
      if (result.date) break;
    }

    // Extract vendor (usually first few lines)
    const vendorCandidates = lines.slice(0, 5).filter(line => 
      line.length > 2 && 
      !line.match(/^\d+$/) && 
      !line.match(/^[\d\.\-\/\s]+$/) &&
      !line.toLowerCase().includes('receipt')
    );
    
    if (vendorCandidates.length > 0) {
      result.vendor = vendorCandidates[0];
    }

    // Calculate subtotal if we have total and tax
    if (result.total && result.tax) {
      result.subtotal = result.total - result.tax;
    }

    return result;
  }

  /**
   * Normalize date format to YYYY-MM-DD
   */
  private normalizeDate(dateStr: string): string {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  }

  /**
   * Generate unique receipt number
   */
  private generateReceiptNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `RCP-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Validate uploaded file
   */
  private validateFile(buffer: Buffer, mimeType: string): void {
    if (buffer.length > this.config.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.config.maxFileSize} bytes`);
    }

    if (!this.config.allowedTypes.includes(mimeType)) {
      throw new Error(`File type ${mimeType} is not allowed`);
    }
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    if (this.ocrWorker) {
      await this.ocrWorker.terminate();
      this.ocrWorker = null;
    }
    this.isInitialized = false;
  }
}

/**
 * Transaction Matching service
 */
export class TransactionMatcher {
  constructor(private matchingRules: MatchingRule[] = []) {}

  /**
   * Find potential matches for a receipt
   */
  async findMatches(
    receipt: Receipt,
    transactions: BankTransaction[],
    threshold: number = 70
  ): Promise<TransactionMatch[]> {
    const matches: TransactionMatch[] = [];

    for (const transaction of transactions) {
      if (transaction.matchStatus !== 'unmatched') continue;

      const confidence = this.calculateMatchConfidence(transaction, receipt);
      
      if (confidence >= threshold) {
        const match: Partial<TransactionMatch> = {
          tenantId: receipt.tenantId,
          transactionId: transaction.id,
          receiptId: receipt.id,
          overallConfidence: confidence,
          amountMatchScore: this.calculateAmountMatch(transaction, receipt),
          dateMatchScore: this.calculateDateMatch(transaction, receipt),
          vendorMatchScore: this.calculateVendorMatch(transaction, receipt),
          matchMethod: confidence > 95 ? 'exact' : 'fuzzy',
          matchRules: ['default'],
          discrepancies: this.findDiscrepancies(transaction, receipt),
          status: confidence > 90 ? 'auto_approved' : 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        matches.push(match as TransactionMatch);
      }
    }

    return matches.sort((a, b) => b.overallConfidence - a.overallConfidence);
  }

  /**
   * Calculate overall match confidence
   */
  private calculateMatchConfidence(transaction: BankTransaction, receipt: Receipt): number {
    const amountScore = this.calculateAmountMatch(transaction, receipt);
    const dateScore = this.calculateDateMatch(transaction, receipt);
    const vendorScore = this.calculateVendorMatch(transaction, receipt);

    // Weighted average
    return Math.round((amountScore * 0.4) + (dateScore * 0.3) + (vendorScore * 0.3));
  }

  /**
   * Calculate amount matching score
   */
  private calculateAmountMatch(transaction: BankTransaction, receipt: Receipt): number {
    const diff = Math.abs(Math.abs(transaction.amount) - receipt.totalAmount);
    const percentage = (diff / receipt.totalAmount) * 100;
    
    if (percentage === 0) return 100;
    if (percentage <= 1) return 95;
    if (percentage <= 5) return 80;
    if (percentage <= 10) return 60;
    return Math.max(0, 40 - percentage);
  }

  /**
   * Calculate date matching score
   */
  private calculateDateMatch(transaction: BankTransaction, receipt: Receipt): number {
    const transactionDate = new Date(transaction.transactionDate);
    const receiptDate = new Date(receipt.transactionDate);
    const diffDays = Math.abs(transactionDate.getTime() - receiptDate.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 0) return 100;
    if (diffDays <= 1) return 90;
    if (diffDays <= 3) return 70;
    if (diffDays <= 7) return 50;
    return Math.max(0, 30 - diffDays);
  }

  /**
   * Calculate vendor matching score
   */
  private calculateVendorMatch(transaction: BankTransaction, receipt: Receipt): number {
    const merchantName = (transaction.merchantName || transaction.description || '').toLowerCase();
    const receiptVendor = receipt.vendor.toLowerCase();

    if (merchantName.includes(receiptVendor) || receiptVendor.includes(merchantName)) {
      return 100;
    }

    // Calculate string similarity
    return this.calculateStringSimilarity(merchantName, receiptVendor);
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 100;

    const maxLen = Math.max(s1.length, s2.length);
    if (maxLen === 0) return 100;

    const distance = this.levenshteinDistance(s1, s2);
    return Math.round((1 - distance / maxLen) * 100);
  }

  /**
   * Calculate Levenshtein distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Find discrepancies between transaction and receipt
   */
  private findDiscrepancies(transaction: BankTransaction, receipt: Receipt): any[] {
    const discrepancies = [];

    // Amount discrepancy
    const amountDiff = Math.abs(Math.abs(transaction.amount) - receipt.totalAmount);
    if (amountDiff > 0.01) {
      discrepancies.push({
        field: 'amount',
        transactionValue: Math.abs(transaction.amount),
        receiptValue: receipt.totalAmount,
        difference: amountDiff,
        severity: amountDiff > (receipt.totalAmount * 0.1) ? 'high' : 'medium'
      });
    }

    // Date discrepancy
    const transactionDate = new Date(transaction.transactionDate);
    const receiptDate = new Date(receipt.transactionDate);
    const dateDiff = Math.abs(transactionDate.getTime() - receiptDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (dateDiff > 1) {
      discrepancies.push({
        field: 'date',
        transactionValue: transaction.transactionDate,
        receiptValue: receipt.transactionDate,
        difference: `${Math.round(dateDiff)} days`,
        severity: dateDiff > 7 ? 'high' : 'medium'
      });
    }

    return discrepancies;
  }
}

/**
 * Receipt Statistics service
 */
export class ReceiptStatsService {
  /**
   * Generate receipt statistics for a tenant
   */
  async generateStats(
    receipts: Receipt[],
    transactions: BankTransaction[]
  ): Promise<ReceiptStatistics> {
    const matchedReceipts = receipts.filter(r => r.matchStatus === 'matched' || r.matchStatus === 'confirmed');
    
    const stats: ReceiptStatistics = {
      totalReceipts: receipts.length,
      totalAmount: receipts.reduce((sum, r) => sum + r.totalAmount, 0),
      averageAmount: receipts.length > 0 ? receipts.reduce((sum, r) => sum + r.totalAmount, 0) / receipts.length : 0,
      
      matchedCount: matchedReceipts.length,
      unmatchedCount: receipts.length - matchedReceipts.length,
      matchRate: receipts.length > 0 ? (matchedReceipts.length / receipts.length) * 100 : 0,
      
      byStatus: this.groupByStatus(receipts),
      byCategory: this.groupByCategory(receipts),
      byVendor: this.groupByVendor(receipts),
      byPaymentMethod: this.groupByPaymentMethod(receipts),
      
      recentActivity: this.calculateRecentActivity(receipts)
    };

    return stats;
  }

  private groupByStatus(receipts: Receipt[]): Record<ReceiptStatus, number> {
    const grouped: Record<ReceiptStatus, number> = {
      draft: 0,
      pending: 0,
      verified: 0,
      matched: 0,
      archived: 0,
      deleted: 0
    };

    receipts.forEach(receipt => {
      grouped[receipt.status]++;
    });

    return grouped;
  }

  private groupByCategory(receipts: Receipt[]): Record<string, { count: number; amount: number }> {
    const grouped: Record<string, { count: number; amount: number }> = {};

    receipts.forEach(receipt => {
      if (!grouped[receipt.category]) {
        grouped[receipt.category] = { count: 0, amount: 0 };
      }
      grouped[receipt.category].count++;
      grouped[receipt.category].amount += receipt.totalAmount;
    });

    return grouped;
  }

  private groupByVendor(receipts: Receipt[]): Array<{ vendor: string; count: number; amount: number }> {
    const grouped: Record<string, { count: number; amount: number }> = {};

    receipts.forEach(receipt => {
      if (!grouped[receipt.vendor]) {
        grouped[receipt.vendor] = { count: 0, amount: 0 };
      }
      grouped[receipt.vendor].count++;
      grouped[receipt.vendor].amount += receipt.totalAmount;
    });

    return Object.entries(grouped)
      .map(([vendor, data]) => ({ vendor, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }

  private groupByPaymentMethod(receipts: Receipt[]): Record<string, number> {
    const grouped: Record<string, number> = {};

    receipts.forEach(receipt => {
      grouped[receipt.paymentMethod] = (grouped[receipt.paymentMethod] || 0) + 1;
    });

    return grouped;
  }

  private calculateRecentActivity(receipts: Receipt[]): Array<{ date: string; receiptsAdded: number; receiptsMatched: number }> {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const dayReceipts = receipts.filter(r => r.createdAt.split('T')[0] === date);
      const matchedToday = receipts.filter(r => 
        r.matchedAt && r.matchedAt.split('T')[0] === date
      );

      return {
        date,
        receiptsAdded: dayReceipts.length,
        receiptsMatched: matchedToday.length
      };
    });
  }
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG = {
  uploadPath: './uploads/receipts',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'application/pdf'
  ],
  ocrLanguage: 'eng',
  confidenceThreshold: 60
};