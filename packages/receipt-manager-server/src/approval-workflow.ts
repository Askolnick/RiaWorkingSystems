/**
 * Expense Approval Workflow Service
 * 
 * Multi-level approval workflow with automated rules and notifications
 */

import type {
  Receipt,
  ReceiptStatus,
  ExpenseCategory
} from './types';

/**
 * Approval workflow configuration
 */
export interface ApprovalWorkflowConfig {
  tenantId: string;
  rules: ApprovalRule[];
  notifications: NotificationConfig;
  escalationRules: EscalationRule[];
  isActive: boolean;
}

export interface ApprovalRule {
  id: string;
  name: string;
  description?: string;
  
  // Conditions
  conditions: ApprovalCondition[];
  
  // Actions
  action: 'auto_approve' | 'require_approval' | 'reject';
  approvers: ApproverConfig[];
  
  // Settings
  priority: number;
  isActive: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalCondition {
  field: 'amount' | 'category' | 'vendor' | 'user' | 'department' | 'custom';
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'contains';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface ApproverConfig {
  userId: string;
  userName: string;
  userEmail: string;
  level: number; // 1 = first level, 2 = second level, etc.
  isRequired: boolean; // If true, this approver must approve
  canDelegate: boolean;
  maxAmount?: number; // Maximum amount this approver can approve
}

export interface NotificationConfig {
  enableEmail: boolean;
  enableInApp: boolean;
  enableSlack: boolean;
  reminderIntervals: number[]; // Hours: [24, 48, 72]
  escalationDelay: number; // Hours before escalation
}

export interface EscalationRule {
  id: string;
  name: string;
  triggerAfterHours: number;
  escalateTo: ApproverConfig[];
  action: 'notify' | 'auto_approve' | 'reject';
  conditions?: ApprovalCondition[];
}

/**
 * Approval request tracking
 */
export interface ApprovalRequest {
  id: string;
  tenantId: string;
  receiptId: string;
  
  // Request details
  requestedBy: string;
  requestedAt: string;
  amount: number;
  category: string;
  vendor: string;
  description: string;
  
  // Workflow state
  status: ApprovalStatus;
  currentLevel: number;
  totalLevels: number;
  
  // Approvers
  approvers: ApprovalEntry[];
  
  // Timeline
  submittedAt: string;
  completedAt?: string;
  expiresAt?: string;
  
  // Comments and attachments
  comments: ApprovalComment[];
  attachments: string[];
  
  // Metadata
  workflowId: string;
  ruleId?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface ApprovalEntry {
  approver: ApproverConfig;
  status: 'pending' | 'approved' | 'rejected' | 'delegated' | 'expired';
  approvedAt?: string;
  rejectedAt?: string;
  delegatedTo?: string;
  comments?: string;
  signature?: string; // Digital signature if required
}

export interface ApprovalComment {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  timestamp: string;
  attachments?: string[];
}

export type ApprovalStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'withdrawn'
  | 'escalated';

/**
 * Main approval workflow service
 */
export class ApprovalWorkflowService {
  constructor(private config: ApprovalWorkflowConfig) {}

  /**
   * Submit receipt for approval
   */
  async submitForApproval(
    receipt: Receipt,
    submittedBy: string,
    comments?: string
  ): Promise<ApprovalRequest | null> {
    if (!this.config.isActive) {
      return null; // Auto-approve if workflow is disabled
    }

    // Find matching approval rule
    const matchingRule = this.findMatchingRule(receipt, submittedBy);
    
    if (!matchingRule) {
      throw new Error('No matching approval rule found');
    }

    // Handle auto-approval
    if (matchingRule.action === 'auto_approve') {
      await this.autoApproveReceipt(receipt, matchingRule);
      return null; // No approval request needed
    }

    // Handle auto-rejection
    if (matchingRule.action === 'reject') {
      await this.autoRejectReceipt(receipt, matchingRule);
      return null; // No approval request needed
    }

    // Create approval request
    const approvalRequest: ApprovalRequest = {
      id: `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId: receipt.tenantId,
      receiptId: receipt.id,
      
      requestedBy: submittedBy,
      requestedAt: new Date().toISOString(),
      amount: receipt.totalAmount,
      category: receipt.category,
      vendor: receipt.vendor,
      description: receipt.notes || `Expense from ${receipt.vendor}`,
      
      status: 'pending',
      currentLevel: 1,
      totalLevels: Math.max(...matchingRule.approvers.map(a => a.level)),
      
      approvers: matchingRule.approvers.map(approver => ({
        approver,
        status: 'pending'
      })),
      
      submittedAt: new Date().toISOString(),
      expiresAt: this.calculateExpirationDate(),
      
      comments: comments ? [{
        id: `comment_${Date.now()}`,
        userId: submittedBy,
        userName: 'Submitter', // Would get from user service
        comment: comments,
        timestamp: new Date().toISOString()
      }] : [],
      attachments: [receipt.fileUrl || ''].filter(Boolean),
      
      workflowId: this.config.tenantId,
      ruleId: matchingRule.id,
      priority: this.calculatePriority(receipt)
    };

    // Send initial notifications
    await this.sendNotifications(approvalRequest, 'submitted');

    return approvalRequest;
  }

  /**
   * Process approval decision
   */
  async processApproval(
    requestId: string,
    approverId: string,
    decision: 'approve' | 'reject' | 'delegate',
    comments?: string,
    delegateTo?: string
  ): Promise<ApprovalRequest> {
    // In a real implementation, this would fetch from database
    const request = await this.getApprovalRequest(requestId);
    
    if (!request) {
      throw new Error('Approval request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Request is not pending approval');
    }

    // Find the approver entry
    const approverEntry = request.approvers.find(
      a => a.approver.userId === approverId && a.status === 'pending'
    );

    if (!approverEntry) {
      throw new Error('Approver not found or not authorized');
    }

    // Process the decision
    const timestamp = new Date().toISOString();

    switch (decision) {
      case 'approve':
        approverEntry.status = 'approved';
        approverEntry.approvedAt = timestamp;
        approverEntry.comments = comments;
        break;

      case 'reject':
        approverEntry.status = 'rejected';
        approverEntry.rejectedAt = timestamp;
        approverEntry.comments = comments;
        request.status = 'rejected';
        request.completedAt = timestamp;
        break;

      case 'delegate':
        if (!delegateTo) {
          throw new Error('Delegation target not specified');
        }
        approverEntry.status = 'delegated';
        approverEntry.delegatedTo = delegateTo;
        approverEntry.comments = comments;
        // Would create new approver entry for delegate
        break;
    }

    // Add comment
    if (comments) {
      request.comments.push({
        id: `comment_${Date.now()}`,
        userId: approverId,
        userName: approverEntry.approver.userName,
        comment: comments,
        timestamp
      });
    }

    // Check if request is complete
    if (decision !== 'reject') {
      const isComplete = await this.checkApprovalComplete(request);
      if (isComplete) {
        request.status = 'approved';
        request.completedAt = timestamp;
        await this.finalizeApproval(request);
      } else {
        // Move to next level if applicable
        await this.advanceToNextLevel(request);
      }
    }

    // Send notifications
    await this.sendNotifications(request, decision);

    return request;
  }

  /**
   * Find matching approval rule for receipt
   */
  private findMatchingRule(receipt: Receipt, submittedBy: string): ApprovalRule | null {
    const activeRules = this.config.rules
      .filter(r => r.isActive)
      .sort((a, b) => b.priority - a.priority); // Higher priority first

    for (const rule of activeRules) {
      if (this.evaluateRuleConditions(rule.conditions, receipt, submittedBy)) {
        return rule;
      }
    }

    return null;
  }

  /**
   * Evaluate rule conditions
   */
  private evaluateRuleConditions(
    conditions: ApprovalCondition[],
    receipt: Receipt,
    submittedBy: string
  ): boolean {
    if (conditions.length === 0) return true;

    let result = true;
    let currentLogicalOp: 'AND' | 'OR' = 'AND';

    for (let i = 0; i < conditions.length; i++) {
      const condition = conditions[i];
      const conditionResult = this.evaluateCondition(condition, receipt, submittedBy);

      if (i === 0) {
        result = conditionResult;
      } else {
        if (currentLogicalOp === 'AND') {
          result = result && conditionResult;
        } else {
          result = result || conditionResult;
        }
      }

      // Set logical operator for next iteration
      if (condition.logicalOperator) {
        currentLogicalOp = condition.logicalOperator;
      }
    }

    return result;
  }

  /**
   * Evaluate single condition
   */
  private evaluateCondition(
    condition: ApprovalCondition,
    receipt: Receipt,
    submittedBy: string
  ): boolean {
    let fieldValue: any;

    switch (condition.field) {
      case 'amount':
        fieldValue = receipt.totalAmount;
        break;
      case 'category':
        fieldValue = receipt.category;
        break;
      case 'vendor':
        fieldValue = receipt.vendor;
        break;
      case 'user':
        fieldValue = submittedBy;
        break;
      default:
        return false;
    }

    switch (condition.operator) {
      case 'eq':
        return fieldValue === condition.value;
      case 'ne':
        return fieldValue !== condition.value;
      case 'gt':
        return fieldValue > condition.value;
      case 'gte':
        return fieldValue >= condition.value;
      case 'lt':
        return fieldValue < condition.value;
      case 'lte':
        return fieldValue <= condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
      case 'contains':
        return typeof fieldValue === 'string' && fieldValue.toLowerCase().includes(condition.value.toLowerCase());
      default:
        return false;
    }
  }

  /**
   * Auto-approve receipt
   */
  private async autoApproveReceipt(receipt: Receipt, rule: ApprovalRule): Promise<void> {
    // Update receipt status
    receipt.status = 'verified';
    receipt.verificationStatus = 'auto_verified';
    receipt.notes = (receipt.notes || '') + ` [Auto-approved by rule: ${rule.name}]`;
    receipt.updatedAt = new Date().toISOString();

    // Log approval
    console.log(`Auto-approved receipt ${receipt.id} using rule: ${rule.name}`);
  }

  /**
   * Auto-reject receipt
   */
  private async autoRejectReceipt(receipt: Receipt, rule: ApprovalRule): Promise<void> {
    // Update receipt status
    receipt.status = 'deleted';
    receipt.verificationStatus = 'failed';
    receipt.notes = (receipt.notes || '') + ` [Auto-rejected by rule: ${rule.name}]`;
    receipt.updatedAt = new Date().toISOString();

    // Log rejection
    console.log(`Auto-rejected receipt ${receipt.id} using rule: ${rule.name}`);
  }

  /**
   * Check if approval is complete
   */
  private async checkApprovalComplete(request: ApprovalRequest): Promise<boolean> {
    // Check if all required approvers have approved
    const requiredApprovers = request.approvers.filter(a => a.approver.isRequired);
    const approvedRequired = requiredApprovers.filter(a => a.status === 'approved');
    
    if (approvedRequired.length < requiredApprovers.length) {
      return false;
    }

    // Check if current level is complete
    const currentLevelApprovers = request.approvers.filter(
      a => a.approver.level === request.currentLevel
    );
    const currentLevelApproved = currentLevelApprovers.filter(
      a => a.status === 'approved'
    );

    // Need at least one approval per level (unless all are optional)
    if (currentLevelApproved.length === 0 && currentLevelApprovers.some(a => a.approver.isRequired)) {
      return false;
    }

    // Check if we've reached the final level
    return request.currentLevel >= request.totalLevels;
  }

  /**
   * Advance to next approval level
   */
  private async advanceToNextLevel(request: ApprovalRequest): Promise<void> {
    if (request.currentLevel < request.totalLevels) {
      request.currentLevel++;
      await this.sendNotifications(request, 'level_advance');
    }
  }

  /**
   * Finalize approval
   */
  private async finalizeApproval(request: ApprovalRequest): Promise<void> {
    // Update the original receipt
    // In a real implementation, this would update the database
    console.log(`Finalizing approval for receipt ${request.receiptId}`);
    
    // Send final notifications
    await this.sendNotifications(request, 'approved');
  }

  /**
   * Calculate expiration date
   */
  private calculateExpirationDate(): string {
    const expirationHours = this.config.notifications.escalationDelay || 72;
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + expirationHours);
    return expirationDate.toISOString();
  }

  /**
   * Calculate request priority
   */
  private calculatePriority(receipt: Receipt): 'low' | 'normal' | 'high' | 'urgent' {
    const amount = receipt.totalAmount;
    
    if (amount > 10000) return 'urgent';
    if (amount > 5000) return 'high';
    if (amount > 1000) return 'normal';
    return 'low';
  }

  /**
   * Send notifications
   */
  private async sendNotifications(
    request: ApprovalRequest,
    event: 'submitted' | 'approve' | 'reject' | 'delegate' | 'approved' | 'level_advance'
  ): Promise<void> {
    if (!this.config.notifications.enableEmail && !this.config.notifications.enableInApp) {
      return;
    }

    // In a real implementation, this would send actual notifications
    console.log(`Sending notification for approval request ${request.id}, event: ${event}`);
    
    // Determine recipients based on event
    let recipients: string[] = [];
    
    switch (event) {
      case 'submitted':
        recipients = request.approvers
          .filter(a => a.approver.level === 1)
          .map(a => a.approver.userEmail);
        break;
      case 'approved':
        recipients = [request.requestedBy]; // Notify requester
        break;
      case 'reject':
        recipients = [request.requestedBy]; // Notify requester
        break;
      case 'level_advance':
        recipients = request.approvers
          .filter(a => a.approver.level === request.currentLevel)
          .map(a => a.approver.userEmail);
        break;
    }

    // Log notification (in real implementation, send emails/messages)
    console.log(`Would notify: ${recipients.join(', ')}`);
  }

  /**
   * Get approval request by ID
   */
  private async getApprovalRequest(id: string): Promise<ApprovalRequest | null> {
    // In a real implementation, this would fetch from database
    // For now, return null to indicate not found
    return null;
  }

  /**
   * Get pending approvals for user
   */
  async getPendingApprovalsForUser(userId: string): Promise<ApprovalRequest[]> {
    // In a real implementation, this would query the database
    return [];
  }

  /**
   * Get approval history for receipt
   */
  async getApprovalHistory(receiptId: string): Promise<ApprovalRequest[]> {
    // In a real implementation, this would query the database
    return [];
  }

  /**
   * Cancel approval request
   */
  async cancelApprovalRequest(requestId: string, cancelledBy: string, reason?: string): Promise<void> {
    // In a real implementation, this would update the database
    console.log(`Cancelling approval request ${requestId} by ${cancelledBy}: ${reason || 'No reason provided'}`);
  }
}

/**
 * Default approval workflow configurations
 */
export const DEFAULT_APPROVAL_CONFIGS = {
  basic: {
    tenantId: 'default',
    rules: [
      {
        id: 'auto_approve_small',
        name: 'Auto-approve small expenses',
        description: 'Automatically approve expenses under $100',
        conditions: [
          { field: 'amount', operator: 'lt', value: 100 }
        ],
        action: 'auto_approve',
        approvers: [],
        priority: 100,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'require_approval_large',
        name: 'Require approval for large expenses',
        description: 'Require manager approval for expenses over $100',
        conditions: [
          { field: 'amount', operator: 'gte', value: 100 }
        ],
        action: 'require_approval',
        approvers: [
          {
            userId: 'manager_1',
            userName: 'Manager',
            userEmail: 'manager@company.com',
            level: 1,
            isRequired: true,
            canDelegate: true,
            maxAmount: 5000
          }
        ],
        priority: 90,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    notifications: {
      enableEmail: true,
      enableInApp: true,
      enableSlack: false,
      reminderIntervals: [24, 48, 72],
      escalationDelay: 72
    },
    escalationRules: [],
    isActive: true
  }
} as const;