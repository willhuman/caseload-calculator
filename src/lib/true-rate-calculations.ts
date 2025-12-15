/**
 * Calculation utilities for the True Hourly Rate Calculator
 */

import type {
  TrueRateFormState,
  TrueRateResults,
  HoursBreakdown,
  CompensationBreakdown,
  PrivatePracticeComparisonRow,
} from './true-rate-types';

const SELF_EMPLOYMENT_TAX_RATE = 0.153; // 15.3%
const WORKING_WEEKS_PER_YEAR = 48;

/**
 * Calculate the hours breakdown per session
 */
function calculateHoursBreakdown(
  state: TrueRateFormState,
  sessionsPerWeek: number
): HoursBreakdown {
  const { universal } = state;

  const sessionMinutes = universal.sessionLengthMinutes;
  const documentationMinutes = universal.documentationTimeMinutes;

  // Pro-rate admin hours across sessions
  const weeklyAdminMinutes = universal.weeklyAdminHours * 60;
  const proratedAdminMinutes = sessionsPerWeek > 0
    ? weeklyAdminMinutes / sessionsPerWeek
    : 0;

  // Pro-rate unpaid meetings/supervision across sessions
  const weeklyMeetingsMinutes = universal.unpaidRequiredHoursPerWeek * 60;
  const proratedMeetingsMinutes = sessionsPerWeek > 0
    ? weeklyMeetingsMinutes / sessionsPerWeek
    : 0;

  const totalMinutes = sessionMinutes + documentationMinutes + proratedAdminMinutes + proratedMeetingsMinutes;

  return {
    sessionMinutes,
    documentationMinutes,
    proratedAdminMinutes: Math.round(proratedAdminMinutes * 10) / 10,
    proratedMeetingsMinutes: Math.round(proratedMeetingsMinutes * 10) / 10,
    totalMinutes: Math.round(totalMinutes * 10) / 10,
    totalHours: Math.round((totalMinutes / 60) * 100) / 100,
  };
}

/**
 * Helper to check if work setting is a platform type
 */
function isPlatformSetting(workSetting: string | null): boolean {
  return workSetting?.startsWith('platform-') ?? false;
}



/**
 * Get sessions per week based on work setting
 */
function getSessionsPerWeek(state: TrueRateFormState): number {
  const { workSetting } = state;

  if (workSetting === 'group-practice-w2') {
    const inputs = state.groupPracticeW2;
    if (!inputs) return 0;
    if (inputs.compensationType === 'salary') {
      return inputs.expectedSessionsPerWeek || 0;
    }
    return inputs.expectedSessionsPerWeek || 20;
  }

  if (workSetting === 'group-practice-1099') {
    return 20;
  }

  if (isPlatformSetting(workSetting)) {
    const inputs = state.platform;
    if (!inputs) return 0;
    const monthlyFromAlma = inputs.almaSessionsPerMonth || 0;
    const monthlyCashPay = inputs.cashPaySessionsPerMonth || 0;
    const totalMonthly = monthlyFromAlma + monthlyCashPay;
    return totalMonthly > 0 ? totalMonthly / 4 : 20;
  }

  if (workSetting === 'agency-w2') {
    const inputs = state.agencyW2;
    return inputs?.productivityRequirement || 20;
  }

  if (workSetting === 'agency-1099') {
    const inputs = state.agency1099;
    return inputs?.productivityRequirement || 20;
  }

  return 20;
}

/**
 * Calculate gross pay per session before deductions
 */
function calculateGrossPayPerSession(state: TrueRateFormState): number {
  const { workSetting } = state;

  if (workSetting === 'group-practice-w2') {
    const inputs = state.groupPracticeW2;
    if (!inputs) return 0;

    switch (inputs.compensationType) {
      case 'salary': {
        const sessions = inputs.expectedSessionsPerWeek || 1;
        const weeklyPay = (inputs.annualSalary || 0) / 52;
        return weeklyPay / sessions;
      }
      case 'hourly': {
        const sessionHours = state.universal.sessionLengthMinutes / 60;
        return (inputs.clinicalHourlyRate || 0) * sessionHours;
      }
      case 'per-session':
        return inputs.ratePerSession || 0;
      case 'percentage': {
        const collection = inputs.averageCollectionPerSession || 0;
        const split = (inputs.splitPercentage || 0) / 100;
        return collection * split;
      }
      default:
        return 0;
    }
  }

  if (workSetting === 'group-practice-1099') {
    const inputs = state.groupPractice1099;
    if (!inputs) return 0;

    if (inputs.compensationType === 'per-session') {
      return inputs.ratePerSession || 0;
    } else {
      const collection = inputs.averageCollectionPerSession || 0;
      const split = (inputs.splitPercentage || 0) / 100;
      return collection * split;
    }
  }

  if (isPlatformSetting(workSetting)) {
    const inputs = state.platform;
    return inputs?.averageReimbursementPerSession || 0;
  }

  if (workSetting === 'agency-w2') {
    const inputs = state.agencyW2;
    if (!inputs) return 0;

    const sessions = inputs.productivityRequirement || 20;
    if (inputs.compensationType === 'salary') {
      const weeklyPay = (inputs.annualSalary || 0) / 52;
      return weeklyPay / sessions;
    } else {
      // Hourly
      const hoursPerSession = (state.universal.sessionLengthMinutes + state.universal.documentationTimeMinutes) / 60;
      return (inputs.hourlyRate || 0) * hoursPerSession;
    }
  }

  if (workSetting === 'agency-1099') {
    const inputs = state.agency1099;
    if (!inputs) return 0;

    switch (inputs.compensationType) {
      case 'per-session':
        return inputs.ratePerSession || 0;
      case 'hourly': {
        const hoursPerSession = (state.universal.sessionLengthMinutes + state.universal.documentationTimeMinutes) / 60;
        return (inputs.hourlyRate || 0) * hoursPerSession;
      }
      case 'daily': {
        const sessionsPerDay = inputs.expectedSessionsPerDay || 6;
        return (inputs.dailyRate || 0) / sessionsPerDay;
      }
      default:
        return 0;
    }
  }

  return 0;
}

/**
 * Calculate platform fees per session (if applicable)
 */
function calculatePlatformFeePerSession(state: TrueRateFormState): number {
  if (!isPlatformSetting(state.workSetting)) return 0;

  const inputs = state.platform;
  if (!inputs) return 0;

  let fee = 0;

  // Alma membership fee (pro-rated per session)
  if (state.workSetting === 'platform-alma' && inputs.almaMembershipType && inputs.almaSessionsPerMonth) {
    const monthlyFee = inputs.almaMembershipType === 'monthly' ? 125 : 1140 / 12;
    fee += monthlyFee / inputs.almaSessionsPerMonth;
  }

  // Grow Therapy 5% of cash-pay
  if (state.workSetting === 'platform-grow-therapy' && inputs.seesCashPayClients && inputs.cashPaySessionsPerMonth) {
    const cashPayRevenue = inputs.averageReimbursementPerSession * inputs.cashPaySessionsPerMonth;
    const growFee = cashPayRevenue * 0.05;
    const totalSessions = inputs.almaSessionsPerMonth || inputs.cashPaySessionsPerMonth || 1;
    fee += growFee / totalSessions;
  }

  return fee;
}

/**
 * Calculate cancellation deduction per session
 */
function calculateCancellationDeduction(state: TrueRateFormState, grossPayPerSession: number): number {
  const { universal } = state;

  // If paid for cancellations at full rate, no deduction
  if (universal.paidForCancellations === 'yes' && universal.cancellationPayType === 'full') {
    return 0;
  }

  const cancellationRate = universal.cancellationRate / 100;

  // If paid partial, only deduct the unpaid portion
  if (universal.paidForCancellations === 'yes' && universal.cancellationPayType === 'partial') {
    const paidPercentage = (universal.cancellationPayPercentage || 0) / 100;
    const unpaidPercentage = 1 - paidPercentage;
    return grossPayPerSession * cancellationRate * unpaidPercentage;
  }

  // Not paid for cancellations - full deduction
  return grossPayPerSession * cancellationRate;
}

/**
 * Check if the current setting is W-2 (affects SE tax calculation)
 */
function isW2Setting(state: TrueRateFormState): boolean {
  const { workSetting } = state;
  return workSetting === 'group-practice-w2' ||
         workSetting === 'agency-w2';
}

/**
 * Calculate self-employment tax impact per session
 */
function calculateSETaxImpact(state: TrueRateFormState, netBeforeTax: number): number {
  const { workSetting } = state;

  // W-2 employees don't pay SE tax directly
  if (isW2Setting(state)) return 0;

  // Check if user wants to include SE tax
  if (workSetting === 'group-practice-1099') {
    if (!state.groupPractice1099?.includeSelfEmploymentTax) return 0;
  } else if (isPlatformSetting(workSetting)) {
    if (!state.platform?.includeSelfEmploymentTax) return 0;
  } else if (workSetting === 'agency-1099') {
    if (!state.agency1099?.includeSelfEmploymentTax) return 0;
  }

  return netBeforeTax * SELF_EMPLOYMENT_TAX_RATE;
}

/**
 * Calculate monthly benefits value per session
 */
function calculateBenefitsPerSession(state: TrueRateFormState, sessionsPerWeek: number): number {
  const { workSetting } = state;
  const sessionsPerMonth = sessionsPerWeek * 4;

  if (sessionsPerMonth === 0) return 0;

  if (workSetting === 'group-practice-w2') {
    const inputs = state.groupPracticeW2;
    if (!inputs?.includeBenefits || !inputs.monthlyBenefitsValue) return 0;
    return inputs.monthlyBenefitsValue / sessionsPerMonth;
  }

  if (workSetting === 'agency-w2') {
    const inputs = state.agencyW2;
    if (!inputs?.includeBenefits || !inputs.monthlyBenefitsValue) return 0;
    return inputs.monthlyBenefitsValue / sessionsPerMonth;
  }

  return 0;
}

/**
 * Calculate paid time off value per session
 * For W-2 employees, PTO adds value because they're paid for weeks they don't work
 */
function calculatePTOValuePerSession(state: TrueRateFormState, sessionsPerWeek: number, grossPayPerSession: number): number {
  // Only W-2 employees get paid time off
  if (!isW2Setting(state)) return 0;

  const ptoWeeks = state.universal.paidTimeOffWeeks || 0;
  if (ptoWeeks === 0 || sessionsPerWeek === 0) return 0;

  // Calculate total annual PTO value (pay for weeks not worked)
  const weeklyPay = grossPayPerSession * sessionsPerWeek;
  const annualPTOValue = weeklyPay * ptoWeeks;

  // Distribute PTO value across all working sessions in the year
  const workingWeeks = 52 - ptoWeeks;
  const totalWorkingSessions = sessionsPerWeek * workingWeeks;

  return totalWorkingSessions > 0 ? annualPTOValue / totalWorkingSessions : 0;
}

/**
 * Calculate compensation breakdown per session
 */
function calculateCompensationBreakdown(
  state: TrueRateFormState,
  sessionsPerWeek: number
): CompensationBreakdown {
  const basePay = calculateGrossPayPerSession(state);
  const platformFee = calculatePlatformFeePerSession(state);
  const cancellationDeduction = calculateCancellationDeduction(state, basePay);
  const benefitsValue = calculateBenefitsPerSession(state, sessionsPerWeek);
  const ptoValue = calculatePTOValuePerSession(state, sessionsPerWeek, basePay);

  const netBeforeTax = basePay - platformFee - cancellationDeduction + benefitsValue + ptoValue;
  const seTaxImpact = calculateSETaxImpact(state, netBeforeTax);

  const netPerSession = netBeforeTax - seTaxImpact;

  return {
    basePay: Math.round(basePay * 100) / 100,
    platformFee: platformFee > 0 ? Math.round(platformFee * 100) / 100 : undefined,
    unpaidCancellationsDeduction: cancellationDeduction > 0 ? Math.round(cancellationDeduction * 100) / 100 : undefined,
    ptoValue: ptoValue > 0 ? Math.round(ptoValue * 100) / 100 : undefined,
    selfEmploymentTaxImpact: seTaxImpact > 0 ? Math.round(seTaxImpact * 100) / 100 : undefined,
    netPerSession: Math.round(netPerSession * 100) / 100,
  };
}

/**
 * Calculate private practice comparison table
 */
function calculatePrivatePracticeComparison(
  state: TrueRateFormState,
  currentAnnualIncome: number
): PrivatePracticeComparisonRow[] {
  const { privatePracticeComparison, universal } = state;
  const isW2 = isW2Setting(state);
  const cancellationRate = universal.cancellationRate / 100;

  // If currently W-2, add SE tax adjustment
  const targetGrossIncome = isW2
    ? currentAnnualIncome + (currentAnnualIncome * SELF_EMPLOYMENT_TAX_RATE)
    : currentAnnualIncome;

  const annualExpenses = privatePracticeComparison.monthlyExpenses * 12;
  const totalGrossNeeded = targetGrossIncome + annualExpenses;

  const rates = [125, 150, 175, 200];
  const selectedRate = privatePracticeComparison.sessionRate;

  return rates.map(rate => {
    const sessionsPerWeekBase = totalGrossNeeded / rate / WORKING_WEEKS_PER_YEAR;
    const scheduleWithCancellations = sessionsPerWeekBase / (1 - cancellationRate);

    return {
      sessionRate: rate,
      sessionsPerWeekNeeded: Math.round(sessionsPerWeekBase * 10) / 10,
      scheduleWithCancellations: Math.round(scheduleWithCancellations * 10) / 10,
      isSelected: rate === selectedRate,
    };
  });
}

/**
 * Get working weeks per year based on PTO
 */
function getWorkingWeeksPerYear(state: TrueRateFormState): number {
  if (isW2Setting(state)) {
    // W-2 employees: subtract PTO weeks from 52
    const ptoWeeks = state.universal.paidTimeOffWeeks || 0;
    return 52 - ptoWeeks;
  }
  // 1099/platform workers: use standard 48 weeks (accounts for unpaid time off)
  return WORKING_WEEKS_PER_YEAR;
}

/**
 * Main calculation function
 */
export function calculateTrueRate(state: TrueRateFormState): TrueRateResults | null {
  if (!state.workSetting) return null;

  const sessionsPerWeek = getSessionsPerWeek(state);
  if (sessionsPerWeek === 0) return null;

  const hoursBreakdown = calculateHoursBreakdown(state, sessionsPerWeek);
  const compensationBreakdown = calculateCompensationBreakdown(state, sessionsPerWeek);

  // True hourly rate = net per session / total hours per session
  const trueHourlyRate = hoursBreakdown.totalHours > 0
    ? compensationBreakdown.netPerSession / hoursBreakdown.totalHours
    : 0;

  // Perceived rate (what they think they're making)
  const perceivedRatePerSession = compensationBreakdown.basePay;

  // Annual equivalent - use actual working weeks for W-2 employees
  const workingWeeks = getWorkingWeeksPerYear(state);
  const annualEquivalent = compensationBreakdown.netPerSession * sessionsPerWeek * workingWeeks;

  // Private practice comparison
  const privatePracticeComparison = calculatePrivatePracticeComparison(state, annualEquivalent);

  return {
    trueHourlyRate: Math.round(trueHourlyRate * 100) / 100,
    perceivedRatePerSession: Math.round(perceivedRatePerSession * 100) / 100,
    hoursBreakdown,
    compensationBreakdown,
    sessionsPerWeek,
    annualEquivalent: Math.round(annualEquivalent),
    isW2: isW2Setting(state),
    privatePracticeComparison,
    currentAnnualIncome: Math.round(annualEquivalent),
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, showDecimals = false): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
}
