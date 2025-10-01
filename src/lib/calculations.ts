/**
 * Calculation utilities for the Therapist Caseload Calculator
 */

export interface CalculationInputs {
  weeklyHours: number;
  monthlyIncome: number;
  sessionFee: number;
  noShowRate: number;
}

export interface CalculationResults {
  baseSessionsNeededPerMonth: number;
  baseWeeklyCaseload: number;
  actualSessionsAttended: number;
  weeklyCaseload: number;
  estimatedHoursPerWeek: number;
  sessionHours: number;
  docHours: number;
  totalHours: number;
  revenueProjection: number;
  sustainabilityStatus: 'sustainable' | 'over-goal' | 'under-goal';
  caseloadRange: { low: number; high: number };
  hoursRange: { low: number; high: number };
}

// Constants - easy to change as requested
const MINUTES_PER_SESSION = 60;
const DOC_MINUTES_PER_CLIENT = 20; // Average documentation time per client per week
const ADMIN_MINUTES_PER_CLIENT = 10; // Legacy admin time (for backward compatibility)
const TIME_PER_CLIENT_HOURS = (MINUTES_PER_SESSION + ADMIN_MINUTES_PER_CLIENT) / 60;
const WEEKS_PER_MONTH = 4.33;

export function calculateCaseload(inputs: CalculationInputs): CalculationResults {
  const { weeklyHours, monthlyIncome, sessionFee, noShowRate } = inputs;

  // Step 1: Calculate sessions needed per month (before considering cancellations)
  const baseSessionsNeededPerMonth = monthlyIncome / sessionFee;

  // Step 2: Weekly base caseload = sessions per month / 4.33
  const baseWeeklyCaseload = baseSessionsNeededPerMonth / WEEKS_PER_MONTH;

  // Step 3: Add extra sessions to account for cancellations/no-shows
  // If 2 clients cancel per week, we need to schedule 2 extra to maintain income
  const weeklyCaseload = baseWeeklyCaseload + noShowRate;

  // Step 4: Calculate separate time components
  const sessionHours = weeklyCaseload * (MINUTES_PER_SESSION / 60); // Just session time
  const docHours = (weeklyCaseload * DOC_MINUTES_PER_CLIENT) / 60; // Documentation time
  const totalHours = sessionHours + docHours; // Total working time

  // Legacy calculation for backward compatibility
  const estimatedHoursPerWeek = weeklyCaseload * TIME_PER_CLIENT_HOURS;

  // Step 5: Revenue projection - only count sessions that are actually attended
  // weeklyCaseload includes buffer for cancellations, so subtract those
  const actualSessionsAttended = weeklyCaseload - noShowRate;
  const revenueProjection = actualSessionsAttended * sessionFee * WEEKS_PER_MONTH;

  // Step 6: Sustainability status based on total hours vs weekly goal
  const sustainabilityStatus = getSustainabilityStatus(totalHours, weeklyHours);

  // Single caseload number (rounded to nearest whole number)
  const roundedCaseload = Math.round(weeklyCaseload);
  const caseloadRange = {
    low: roundedCaseload,
    high: roundedCaseload
  };

  // Hours range based on caseload range using total hours
  const hoursRange = {
    low: caseloadRange.low * (MINUTES_PER_SESSION + DOC_MINUTES_PER_CLIENT) / 60,
    high: caseloadRange.high * (MINUTES_PER_SESSION + DOC_MINUTES_PER_CLIENT) / 60
  };

  return {
    baseSessionsNeededPerMonth,
    baseWeeklyCaseload,
    actualSessionsAttended,
    weeklyCaseload,
    estimatedHoursPerWeek, // Keep for backward compatibility
    sessionHours,
    docHours,
    totalHours,
    revenueProjection,
    sustainabilityStatus,
    caseloadRange,
    hoursRange
  };
}

function getSustainabilityStatus(totalHours: number, targetHours: number): 'sustainable' | 'over-goal' | 'under-goal' {
  // Updated status logic based on new requirements:
  // Room to spare (under-goal): totalHours <= 0.7 * weeklyGoal
  // Balanced (sustainable): 0.7 * weeklyGoal < totalHours <= weeklyGoal
  // Over target (over-goal): totalHours > weeklyGoal

  if (totalHours <= 0.7 * targetHours) {
    return 'under-goal';
  } else if (totalHours <= targetHours) {
    return 'sustainable';
  } else {
    return 'over-goal';
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatRange(low: number, high: number, suffix = ''): string {
  return low === high ? `${low}${suffix}` : `${low} to ${high}${suffix}`;
}

export interface CalculationBreakdown {
  step: number;
  label: string;
  formula: string;
  calculation: string;
  result: string;
}

export function getCalculationBreakdown(inputs: CalculationInputs, results: CalculationResults): CalculationBreakdown[] {
  const { monthlyIncome, sessionFee, noShowRate } = inputs;
  const { baseSessionsNeededPerMonth, baseWeeklyCaseload, weeklyCaseload, totalHours } = results;

  return [
    {
      step: 1,
      label: "Income to clients",
      formula: "",
      calculation: "",
      result: `To reach your ${formatCurrency(monthlyIncome)} monthly goal at ${formatCurrency(sessionFee)}/session, you'd need about ${Math.round(baseSessionsNeededPerMonth)} sessions per month (≈\u00A0${Math.round(baseWeeklyCaseload)}\u00A0clients\u00A0per\u00A0week).`
    },
    {
      step: 2,
      label: "Cancellations",
      formula: "",
      calculation: "",
      result: `Adding ${noShowRate} ${noShowRate === 1 ? 'cancellation' : 'cancellations'} per week means scheduling about ${Math.round(weeklyCaseload)}\u00A0clients\u00A0per\u00A0week.`
    },
    {
      step: 3,
      label: "Time commitment",
      formula: "",
      calculation: "",
      result: `That equals about ${Math.round(totalHours)}h/week, including a 20 minute documentation buffer per client.`
    }
  ];
}