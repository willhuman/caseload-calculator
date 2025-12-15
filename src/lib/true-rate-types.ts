// Types for the True Hourly Rate Calculator

// Primary work setting categories (Step 1)
export type PrimaryWorkSetting =
  | 'group-practice'
  | 'platform'
  | 'agency'; // Combines hospitals, CMHCs, clinics, health systems

// Employment type for non-platform settings (Step 2)
export type EmploymentType = 'w2' | '1099';

// Full work setting after both steps
export type WorkSetting =
  | 'group-practice-w2'
  | 'group-practice-1099'
  | 'platform-alma'
  | 'platform-headway'
  | 'platform-grow-therapy'
  | 'platform-other'
  | 'agency-w2'
  | 'agency-1099';

export type Platform = 'alma' | 'headway' | 'grow-therapy' | 'other';
export type AlmaMembership = 'monthly' | 'annual';
export type CompensationType = 'salary' | 'hourly' | 'per-session' | 'percentage';
export type PaidForCancellations = 'yes' | 'no';
export type CancellationPayType = 'full' | 'partial';

// Universal questions that apply to all settings
export interface UniversalInputs {
  sessionLengthMinutes: number; // 15-120 min
  documentationTimeMinutes: number; // 5-30 min
  weeklyAdminHours: number; // 1-20 hours
  cancellationRate: number; // 0-30%
  paidForCancellations: PaidForCancellations;
  cancellationPayType?: CancellationPayType; // Only if paidForCancellations is 'yes'
  cancellationPayPercentage?: number; // Only if cancellationPayType is 'partial' (0-100)
  unpaidRequiredHoursPerWeek: number; // supervision, trainings, meetings
  paidTimeOffWeeks: number; // 0-6 weeks, only for W-2 employees
}

// Group Practice W-2 specific inputs
export interface GroupPracticeW2Inputs {
  compensationType: CompensationType;
  // Salary-based
  annualSalary?: number;
  expectedSessionsPerWeek?: number;
  // Hourly-based
  clinicalHourlyRate?: number;
  adminHourlyRate?: number;
  // Per-session
  ratePerSession?: number;
  // Percentage split
  splitPercentage?: number;
  averageCollectionPerSession?: number;
  // Benefits
  includeBenefits: boolean;
  monthlyBenefitsValue?: number;
}

// Group Practice 1099 specific inputs
export interface GroupPractice1099Inputs {
  compensationType: 'per-session' | 'percentage';
  // Per-session
  ratePerSession?: number;
  // Percentage split
  splitPercentage?: number;
  averageCollectionPerSession?: number;
  // Tax
  includeSelfEmploymentTax: boolean;
}

// Platform (Aggregator) specific inputs
export interface PlatformInputs {
  platform: Platform;
  averageReimbursementPerSession: number;
  // Alma-specific
  almaMembershipType?: AlmaMembership;
  almaSessionsPerMonth?: number;
  // Cash-pay
  seesCashPayClients: boolean;
  cashPaySessionsPerMonth?: number; // For Grow Therapy 5% fee
  // Tax
  includeSelfEmploymentTax: boolean;
}

// Agency / Health System W-2 specific inputs (hospitals, CMHCs, clinics, health systems)
export interface AgencyW2Inputs {
  compensationType: 'salary' | 'hourly';
  annualSalary?: number;
  hourlyRate?: number;
  expectedHoursPerWeek: number;
  productivityRequirement: number; // Required billable sessions/week
  includeBenefits: boolean;
  monthlyBenefitsValue?: number;
}

// Agency / Health System 1099 specific inputs
export interface Agency1099Inputs {
  compensationType: 'per-session' | 'hourly' | 'daily';
  ratePerSession?: number;
  hourlyRate?: number;
  dailyRate?: number;
  expectedSessionsPerDay?: number; // For daily rate calculation
  expectedHoursPerWeek: number;
  productivityRequirement: number; // Required billable sessions/week
  includeSelfEmploymentTax: boolean;
}

// Private practice comparison inputs
export interface PrivatePracticeComparisonInputs {
  sessionRate: number; // $100-250, default $150
  monthlyExpenses: number; // default $500
}

// Combined form state
export interface TrueRateFormState {
  // Multi-step selection
  primaryWorkSetting: PrimaryWorkSetting | null;
  employmentType: EmploymentType | null; // For group practice, agency
  selectedPlatform: Platform | null; // For platform
  // Derived full work setting
  workSetting: WorkSetting | null;
  universal: UniversalInputs;
  groupPracticeW2?: GroupPracticeW2Inputs;
  groupPractice1099?: GroupPractice1099Inputs;
  platform?: PlatformInputs;
  agencyW2?: AgencyW2Inputs;
  agency1099?: Agency1099Inputs;
  privatePracticeComparison: PrivatePracticeComparisonInputs;
}

// Hours breakdown per session
export interface HoursBreakdown {
  sessionMinutes: number;
  documentationMinutes: number;
  proratedAdminMinutes: number;
  proratedMeetingsMinutes: number;
  totalMinutes: number;
  totalHours: number;
}

// Compensation breakdown per session
export interface CompensationBreakdown {
  basePay: number;
  platformFee?: number;
  unpaidCancellationsDeduction?: number;
  ptoValue?: number;
  selfEmploymentTaxImpact?: number;
  netPerSession: number;
}

// Private practice comparison row
export interface PrivatePracticeComparisonRow {
  sessionRate: number;
  sessionsPerWeekNeeded: number;
  scheduleWithCancellations: number;
  isSelected: boolean;
}

// Full results
export interface TrueRateResults {
  // Primary result
  trueHourlyRate: number;
  perceivedRatePerSession: number;

  // Breakdowns
  hoursBreakdown: HoursBreakdown;
  compensationBreakdown: CompensationBreakdown;

  // Annual equivalent
  sessionsPerWeek: number;
  annualEquivalent: number;

  // Current work setting info
  isW2: boolean;

  // Private practice comparison
  privatePracticeComparison: PrivatePracticeComparisonRow[];
  currentAnnualIncome: number;
}

// Default values
export const DEFAULT_UNIVERSAL_INPUTS: UniversalInputs = {
  sessionLengthMinutes: 45,
  documentationTimeMinutes: 15,
  weeklyAdminHours: 5,
  cancellationRate: 10,
  paidForCancellations: 'no',
  unpaidRequiredHoursPerWeek: 0,
  paidTimeOffWeeks: 2,
};

export const DEFAULT_PRIVATE_PRACTICE_COMPARISON: PrivatePracticeComparisonInputs = {
  sessionRate: 150,
  monthlyExpenses: 500,
};

export const PRIMARY_WORK_SETTING_LABELS: Record<PrimaryWorkSetting, string> = {
  'group-practice': 'I work for a group practice',
  'platform': 'I work for a platform',
  'agency': 'I work for an agency / health system',
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  'w2': "I'm an employee (W-2)",
  '1099': "I'm a contractor (1099)",
};

export const PLATFORM_LABELS: Record<Platform, string> = {
  'alma': 'Alma',
  'headway': 'Headway',
  'grow-therapy': 'Grow Therapy',
  'other': 'Other',
};

export const SESSION_LENGTH_OPTIONS = [30, 45, 50, 60] as const;
