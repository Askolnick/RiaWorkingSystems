// -------------------- Core Types --------------------

export type EmploymentStatus = 
  | 'active' 
  | 'inactive' 
  | 'terminated' 
  | 'on_leave' 
  | 'contractor' 
  | 'intern' 
  | 'part_time' 
  | 'full_time' 
  | 'consultant';

export type EmploymentType = 
  | 'permanent' 
  | 'contract' 
  | 'internship' 
  | 'freelance' 
  | 'consultant' 
  | 'temporary' 
  | 'seasonal' 
  | 'part_time' 
  | 'full_time';

export type LeaveType = 
  | 'vacation' 
  | 'sick' 
  | 'personal' 
  | 'maternity' 
  | 'paternity' 
  | 'bereavement' 
  | 'jury_duty' 
  | 'military' 
  | 'sabbatical' 
  | 'unpaid';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'in_progress' | 'completed';

export interface Employee {
  id: string;
  tenantId: string;
  userId?: string; // Link to User account if exists
  
  // Personal Information
  firstName: string;
  lastName: string;
  middleName?: string;
  displayName: string;
  email: string;
  phone?: string;
  alternateEmail?: string;
  
  // Employment Details
  employeeNumber: string;
  status: EmploymentStatus;
  type: EmploymentType;
  
  // Job Information
  jobTitle: string;
  departmentId?: string;
  managerId?: string; // Reports to
  locationId?: string;
  
  // Dates
  hireDate: string;
  startDate?: string; // Different from hire for rehires
  endDate?: string; // Termination/resignation date
  
  // Compensation
  salary?: number;
  hourlyRate?: number;
  currency: string;
  payGrade?: string;
  payFrequency?: string; // weekly, biweekly, monthly, etc.
  
  // Contact & Emergency
  address?: any; // Home address
  emergencyContact?: any; // Emergency contact info
  
  // Documents & Compliance
  taxId?: string; // SSN or equivalent
  workEligibility: boolean;
  backgroundCheck: boolean;
  
  // Benefits
  healthInsurance: boolean;
  dentalInsurance: boolean;
  visionInsurance: boolean;
  retirementPlan: boolean;
  ptoBalance: number; // PTO hours
  sickBalance: number; // Sick hours
  
  // Performance & Development
  lastReviewDate?: string;
  nextReviewDate?: string;
  performanceRating?: string;
  goals?: any; // Performance goals
  skills: string[];
  certifications?: any; // Professional certifications
  
  // Settings
  isActive: boolean;
  notes?: string;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  
  // Hierarchy
  parentId?: string;
  
  // Leadership
  headId?: string; // Department head
  
  // Budget & Metrics
  budget?: number;
  budgetYear?: number;
  headcount: number;
  
  // Settings
  isActive: boolean;
  costCenter?: string;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  
  // Address
  address: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  
  // Contact
  phone?: string;
  email?: string;
  
  // Details
  timezone: string;
  capacity?: number; // Maximum occupancy
  
  // Settings
  isActive: boolean;
  isHeadquarters: boolean;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  
  type: LeaveType;
  status: LeaveStatus;
  
  // Dates
  startDate: string;
  endDate: string;
  returnDate?: string; // Actual return date
  
  // Details
  totalDays: number;
  reason?: string;
  notes?: string;
  
  // Approval
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  
  // Coverage
  coveringEmployeeId?: string;
  handoverNotes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntry {
  id: string;
  tenantId: string;
  employeeId: string;
  
  // Time tracking
  date: string;
  clockIn?: string;
  clockOut?: string;
  breakStart?: string;
  breakEnd?: string;
  
  // Hours
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
  
  // Project/Task allocation
  projectId?: string;
  taskId?: string;
  description?: string;
  
  // Status
  status: string; // draft, submitted, approved, rejected
  approvedBy?: string;
  approvedAt?: string;
  
  // Location tracking
  location?: string;
  ipAddress?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceReview {
  id: string;
  tenantId: string;
  employeeId: string;
  reviewerId: string;
  
  // Review period
  periodStart: string;
  periodEnd: string;
  
  // Review details
  type: string; // annual, mid-year, quarterly, probationary
  status: string; // draft, in_progress, completed, acknowledged
  
  // Ratings
  overallRating?: number; // 1.00 to 5.00
  goalAchievement?: number;
  competencyRating?: number;
  
  // Content
  strengths?: string;
  improvements?: string;
  accomplishments?: string;
  goals?: any; // Goals for next period
  development?: any; // Development plan
  
  // Comments
  managerComments?: string;
  employeeComments?: string;
  hrComments?: string;
  
  // Workflow
  employeeAcknowledged: boolean;
  acknowledgedAt?: string;
  
  // Next review
  nextReviewDate?: string;
  
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeBenefit {
  id: string;
  tenantId: string;
  employeeId: string;
  
  benefitType: string; // health, dental, vision, retirement, life_insurance, etc.
  planName: string;
  provider?: string;
  
  // Coverage
  coverage: string; // employee, spouse, family
  
  // Financial
  employeeContribution?: number;
  employerContribution?: number;
  totalCost?: number;
  
  // Dates
  effectiveDate: string;
  endDate?: string;
  
  // Status
  isActive: boolean;
  
  // Metadata
  enrolledBy?: string;
  enrolledAt: string;
  notes?: string;
}

export interface EmployeeDocument {
  id: string;
  tenantId: string;
  employeeId: string;
  
  // Document details
  name: string;
  type: string; // contract, handbook, tax_form, performance_review, etc.
  description?: string;
  
  // File info
  filename: string;
  fileSize: number;
  mimeType: string;
  url: string;
  
  // Classification
  isConfidential: boolean;
  isRequired: boolean;
  category?: string;
  
  // Signatures/Acknowledgment
  requiresSignature: boolean;
  signedAt?: string;
  acknowledgedAt?: string;
  
  // Expiration
  expiresAt?: string;
  
  // Access control
  accessLevel: string; // employee, manager, hr, admin
  
  uploadedBy: string;
  uploadedAt: string;
  updatedAt: string;
}

export interface EmployeeSkill {
  id: string;
  tenantId: string;
  employeeId: string;
  
  skillName: string;
  category?: string; // technical, soft_skill, language, certification, etc.
  level: string; // beginner, intermediate, advanced, expert
  
  // Evidence/Validation
  yearsOfExperience?: number;
  certificationName?: string;
  certificationDate?: string;
  expirationDate?: string;
  
  // Assessment
  selfRating?: number; // 1-5 scale
  managerRating?: number; // 1-5 scale
  lastAssessed?: string;
  
  // Development
  isTargetSkill: boolean; // Skill being developed
  targetLevel?: string;
  developmentPlan?: string;
  
  // Visibility
  isPublic: boolean; // Show in employee directory
  
  createdAt: string;
  updatedAt: string;
}

export interface CompensationHistory {
  id: string;
  tenantId: string;
  employeeId: string;
  
  // Change details
  changeType: string; // promotion, raise, adjustment, bonus, etc.
  reason?: string;
  
  // Before/After values
  previousSalary?: number;
  newSalary?: number;
  previousJobTitle?: string;
  newJobTitle?: string;
  
  // Bonus/One-time payments
  bonusAmount?: number;
  bonusType?: string; // performance, retention, signing, etc.
  
  // Equity
  equityShares?: number;
  equityValue?: number;
  vestingSchedule?: any;
  
  // Effective date
  effectiveDate: string;
  
  // Approval
  approvedBy: string;
  approvedAt: string;
  
  // Notes
  notes?: string;
  
  createdAt: string;
}

// -------------------- Extended Types with Relations --------------------

export interface EmployeeWithRelations extends Employee {
  department?: Department;
  manager?: Employee;
  directReports: Employee[];
  location?: Location;
  user?: {
    id: string;
    displayName: string;
    email: string;
    avatarUrl?: string;
  };
  
  leaveRequests: LeaveRequest[];
  timeEntries: TimeEntry[];
  performanceReviews: PerformanceReview[];
  employeeBenefits: EmployeeBenefit[];
  employeeDocuments: EmployeeDocument[];
  employeeSkills: EmployeeSkill[];
  compensationHistory: CompensationHistory[];
  
  // Computed fields
  fullName: string;
  timeWithCompany: number; // years
  currentAge?: number;
  reportsCount: number;
  currentSalary?: number;
  nextReviewDue?: string;
  ptoUsedThisYear: number;
  totalCompensation?: number;
  lastPerformanceRating?: number;
  skillCount: number;
}

export interface DepartmentWithRelations extends Department {
  parent?: Department;
  children: Department[];
  head?: Employee;
  employees: Employee[];
  
  // Computed fields
  totalEmployees: number;
  activeEmployees: number;
  averageSalary?: number;
  averageTenure: number; // years
  budgetUtilization?: number; // percentage
  childDepartmentCount: number;
}

export interface LocationWithRelations extends Location {
  employees: Employee[];
  
  // Computed fields
  employeeCount: number;
  occupancyRate?: number; // percentage of capacity
  averageCommute?: number; // if tracked
  departments: string[]; // Department names at this location
}

export interface LeaveRequestWithDetails extends LeaveRequest {
  employee: {
    id: string;
    displayName: string;
    email: string;
    department?: string;
  };
  approver?: {
    id: string;
    displayName: string;
  };
  coveringEmployee?: {
    id: string;
    displayName: string;
  };
  
  // Computed fields
  daysRemaining?: number;
  isOverdue?: boolean;
  balanceAfter?: number; // PTO balance after leave
}

// -------------------- Create/Update Types --------------------

export interface CreateEmployeeData {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  alternateEmail?: string;
  
  // Employment
  employeeNumber?: string; // Auto-generated if not provided
  status?: EmploymentStatus;
  type?: EmploymentType;
  jobTitle: string;
  departmentId?: string;
  managerId?: string;
  locationId?: string;
  
  // Dates
  hireDate: string;
  startDate?: string;
  
  // Compensation
  salary?: number;
  hourlyRate?: number;
  currency?: string;
  payGrade?: string;
  payFrequency?: string;
  
  // Contact
  address?: any;
  emergencyContact?: any;
  
  // Benefits
  healthInsurance?: boolean;
  dentalInsurance?: boolean;
  visionInsurance?: boolean;
  retirementPlan?: boolean;
  ptoBalance?: number;
  sickBalance?: number;
  
  // Compliance
  taxId?: string;
  workEligibility?: boolean;
  backgroundCheck?: boolean;
  
  notes?: string;
}

export interface UpdateEmployeeData extends Partial<CreateEmployeeData> {
  endDate?: string;
  lastReviewDate?: string;
  nextReviewDate?: string;
  performanceRating?: string;
  goals?: any;
  skills?: string[];
  certifications?: any;
  isActive?: boolean;
}

export interface CreateDepartmentData {
  name: string;
  description?: string;
  parentId?: string;
  headId?: string;
  budget?: number;
  budgetYear?: number;
  costCenter?: string;
  isActive?: boolean;
}

export interface UpdateDepartmentData extends Partial<CreateDepartmentData> {
  headcount?: number;
}

export interface CreateLocationData {
  name: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  timezone?: string;
  capacity?: number;
  isActive?: boolean;
  isHeadquarters?: boolean;
}

export interface UpdateLocationData extends Partial<CreateLocationData> {}

export interface CreateLeaveRequestData {
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
  notes?: string;
  coveringEmployeeId?: string;
  handoverNotes?: string;
}

export interface UpdateLeaveRequestData extends Partial<Omit<CreateLeaveRequestData, 'employeeId'>> {
  status?: LeaveStatus;
  approvedBy?: string;
  rejectedReason?: string;
  returnDate?: string;
}

export interface CreateTimeEntryData {
  employeeId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  breakStart?: string;
  breakEnd?: string;
  regularHours?: number;
  overtimeHours?: number;
  projectId?: string;
  taskId?: string;
  description?: string;
  location?: string;
}

export interface UpdateTimeEntryData extends Partial<CreateTimeEntryData> {
  status?: string;
  approvedBy?: string;
}

// -------------------- Filter/Search Types --------------------

export interface EmployeeFilters {
  status?: EmploymentStatus | EmploymentStatus[];
  type?: EmploymentType | EmploymentType[];
  departmentId?: string;
  managerId?: string;
  locationId?: string;
  jobTitle?: string;
  hireDateFrom?: string;
  hireDateTo?: string;
  isActive?: boolean;
  skills?: string[];
  search?: string;
  payGrade?: string;
  hasUpcomingReview?: boolean;
  hasOverdueReview?: boolean;
}

export interface LeaveRequestFilters {
  employeeId?: string;
  type?: LeaveType | LeaveType[];
  status?: LeaveStatus | LeaveStatus[];
  startDateFrom?: string;
  startDateTo?: string;
  approvedBy?: string;
  departmentId?: string;
  search?: string;
}

export interface TimeEntryFilters {
  employeeId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  projectId?: string;
  departmentId?: string;
  approvedBy?: string;
}

export interface EmployeeSort {
  field: keyof Employee | 'departmentName' | 'managerName' | 'timeWithCompany';
  direction: 'asc' | 'desc';
}

// -------------------- Analytics Types --------------------

export interface PeopleAnalytics {
  tenantId: string;
  timeRange: {
    from: string;
    to: string;
  };
  
  // Headcount metrics
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
  terminations: number;
  netGrowth: number;
  turnoverRate: number; // percentage
  retentionRate: number; // percentage
  
  // Demographics
  employeesByDepartment: Array<{
    departmentId: string;
    departmentName: string;
    count: number;
    percentage: number;
  }>;
  
  employeesByLocation: Array<{
    locationId: string;
    locationName: string;
    count: number;
    percentage: number;
  }>;
  
  employeesByType: Array<{
    type: EmploymentType;
    count: number;
    percentage: number;
  }>;
  
  employeesByTenure: Array<{
    range: string; // "0-1 years", "1-3 years", etc.
    count: number;
    percentage: number;
  }>;
  
  // Performance metrics
  averagePerformanceRating: number;
  reviewCompletionRate: number; // percentage
  overdueReviews: number;
  topPerformers: Employee[];
  
  // Compensation analysis
  averageSalary: number;
  medianSalary: number;
  salaryByDepartment: Array<{
    departmentName: string;
    averageSalary: number;
    medianSalary: number;
  }>;
  
  salaryByLevel: Array<{
    level: string;
    averageSalary: number;
    count: number;
  }>;
  
  // Time off analysis
  averagePtoUsage: number;
  ptoUtilizationRate: number; // percentage
  leaveRequestsByType: Array<{
    type: LeaveType;
    count: number;
    totalDays: number;
  }>;
  
  leaveRequestsByMonth: Array<{
    month: string;
    approved: number;
    pending: number;
    rejected: number;
  }>;
  
  // Skills analysis
  topSkills: Array<{
    skillName: string;
    employeeCount: number;
    averageLevel: string;
  }>;
  
  skillGaps: Array<{
    skillName: string;
    currentCount: number;
    targetCount: number;
    gap: number;
  }>;
  
  // Time tracking
  averageHoursPerWeek: number;
  overtimeHours: number;
  productivityTrends: Array<{
    week: string;
    averageHours: number;
    productivityScore?: number;
  }>;
}

export interface DepartmentAnalytics {
  departmentId: string;
  departmentName: string;
  
  // Team metrics
  teamSize: number;
  directReports: number;
  totalSpan: number; // Including indirect reports
  
  // Performance
  averageRating: number;
  topPerformer?: Employee;
  improvementOpportunities: number;
  
  // Retention
  turnoverRate: number;
  averageTenure: number;
  atRiskEmployees: number; // Based on various factors
  
  // Budget & Compensation
  totalCompensation: number;
  averageCompensation: number;
  budgetUtilization: number; // percentage
  costPerEmployee: number;
  
  // Skills & Development
  totalSkills: number;
  uniqueSkills: number;
  skillGaps: string[];
  trainingParticipation: number; // percentage
  
  // Trends
  growthRate: number; // headcount growth
  productivityTrend: 'increasing' | 'stable' | 'decreasing';
  satisfactionScore?: number;
}

// -------------------- Reporting Types --------------------

export interface EmployeeReport {
  employeeId: string;
  reportType: 'profile' | 'performance' | 'compensation' | 'time_off' | 'skills';
  
  generatedAt: string;
  generatedBy: string;
  
  data: any; // Report-specific data structure
  
  // Export options
  format: 'pdf' | 'excel' | 'csv';
  includeConfidential: boolean;
  includeHistory: boolean;
}

export interface ComplianceReport {
  reportType: 'i9_verification' | 'background_checks' | 'certifications' | 'training';
  
  totalEmployees: number;
  compliantEmployees: number;
  nonCompliantEmployees: number;
  complianceRate: number; // percentage
  
  expiringItems: Array<{
    employeeId: string;
    employeeName: string;
    item: string;
    expirationDate: string;
    daysUntilExpiration: number;
  }>;
  
  missingItems: Array<{
    employeeId: string;
    employeeName: string;
    missingItem: string;
    required: boolean;
  }>;
}

// -------------------- Integration Types --------------------

export interface HRISIntegration {
  id: string;
  tenantId: string;
  provider: 'bamboo_hr' | 'workday' | 'adp' | 'namely' | 'custom';
  
  config: {
    apiUrl?: string;
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
    fieldMappings: Record<string, string>;
    syncFrequency: 'hourly' | 'daily' | 'weekly' | 'manual';
  };
  
  isActive: boolean;
  lastSyncAt?: string;
  syncStatus?: 'success' | 'error' | 'in_progress';
  syncErrors?: string[];
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollIntegration {
  id: string;
  tenantId: string;
  provider: 'gusto' | 'paychex' | 'adp' | 'quickbooks' | 'custom';
  
  config: {
    apiUrl?: string;
    credentials: Record<string, string>;
    payrollSchedule: 'weekly' | 'biweekly' | 'monthly' | 'semi_monthly';
    autoSync: boolean;
  };
  
  isActive: boolean;
  lastPayrollRun?: string;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// -------------------- Workflow Types --------------------

export interface OnboardingWorkflow {
  id: string;
  tenantId: string;
  name: string;
  
  steps: Array<{
    id: string;
    type: 'document' | 'training' | 'meeting' | 'system_access' | 'equipment';
    title: string;
    description: string;
    assignedTo: 'hr' | 'manager' | 'it' | 'employee';
    dueInDays: number;
    isRequired: boolean;
    dependencies: string[];
  }>;
  
  isActive: boolean;
  defaultForNewHires: boolean;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingInstance {
  id: string;
  tenantId: string;
  workflowId: string;
  employeeId: string;
  
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  startDate: string;
  expectedCompletionDate: string;
  actualCompletionDate?: string;
  
  steps: Array<{
    stepId: string;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    assignedTo: string;
    dueDate: string;
    completedDate?: string;
    notes?: string;
  }>;
  
  completionRate: number; // percentage
  
  createdAt: string;
  updatedAt: string;
}