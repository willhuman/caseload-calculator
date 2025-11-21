// Core input types for the enhanced caseload calculator

export interface SessionInputs {
  sessionFee: number; // What the clinician charges per session
  clientsScheduledPerWeek: number; // Number of clients scheduled per week
  sessionLengthMinutes: number;
  cancellationRate: number;
  docAdminTimeMinutes: number;
}

export interface OtherExpense {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'annual';
}

export interface ExpenseInputs {
  rentUtilities: number;
  marketing: number;
  software: number;
  insurance: number;
  continuingEd: number;
  conferences: number;
  taxPrep: number;
  professionalDues: number;
  other: number;
  customExpenses: OtherExpense[];
}

export interface TimeOffInputs {
  vacationWeeks: number;
}

export interface ProjectionResults {
  // Input echo (for reference)
  sessionFee: number;
  clientsScheduledPerWeek: number;

  // Calculated attendance
  attendedSessionsPerWeek: number;

  // Time calculations
  sessionHoursPerWeek: number;
  docAdminHoursPerWeek: number;
  totalHoursPerWeek: number;
  workingWeeksPerYear: number;

  // Income calculations (per working week)
  weeklyGrossIncome: number;

  // Monthly averages (spread across 12 months)
  monthlyAverageGrossIncome: number;
  monthlyAverageExpenses: number;
  monthlyAverageNetIncome: number;

  // Yearly totals
  yearlyTotalGrossIncome: number;
  yearlyTotalExpenses: number;
  yearlyTotalNetIncome: number;

  // Rate calculations
  grossHourlyRate: number;
  netHourlyRate: number;

  // Optional fields when expenses exist
  hasExpenses: boolean;
  profitMarginPercent?: number;
}
