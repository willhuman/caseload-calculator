/**
 * Calculation utilities for the Therapist Caseload Calculator
 */

import type { SessionInputs, ExpenseInputs, TimeOffInputs, ProjectionResults } from './types';

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * PROJECTION CALCULATION: Calculate income projections based on session fee and client count
 * This is the main function for the projection-based calculator
 */
export function calculateProjection(
  session: SessionInputs,
  timeOff: TimeOffInputs,
  expenses: ExpenseInputs
): ProjectionResults {
  // Apply defaults
  const sessionMinutes = session.sessionLengthMinutes;
  const docAndAdminMinutesPerClient = session.docAdminTimeMinutes;
  const cancellationRate = session.cancellationRate / 100; // Convert percentage to decimal
  const { sessionFee, clientsScheduledPerWeek } = session;

  // Calculate working weeks per year (accounting for vacation)
  const workingWeeksPerYear = 52 - timeOff.vacationWeeks;

  // Calculate hours per client (session + doc/admin)
  const sessionHours = sessionMinutes / 60;
  const docAndAdminHours = docAndAdminMinutesPerClient / 60;

  // STEP 1: Calculate attended sessions (accounting for cancellations)
  const attendedSessionsPerWeek = Math.round(clientsScheduledPerWeek * (1 - cancellationRate));

  // STEP 2: Calculate hours breakdown per week
  const sessionHoursPerWeek = attendedSessionsPerWeek * sessionHours;
  const docAdminHoursPerWeek = attendedSessionsPerWeek * docAndAdminHours;
  const totalHoursPerWeek = sessionHoursPerWeek + docAdminHoursPerWeek;

  // STEP 3: Calculate weekly gross income (based on attended sessions)
  const weeklyGrossIncome = attendedSessionsPerWeek * sessionFee;

  // STEP 4: Calculate yearly totals
  const yearlyTotalGrossIncome = weeklyGrossIncome * workingWeeksPerYear;

  // STEP 5: Calculate total expenses
  const monthlyExpenses =
    expenses.rentUtilities +
    expenses.marketing +
    expenses.software +
    expenses.insurance;

  // Add annual expenses (prorated monthly)
  const annualExpensesMonthly = (expenses.continuingEd + expenses.conferences) / 12;
  let totalMonthlyExpenses = monthlyExpenses + annualExpensesMonthly;

  // Add custom expenses
  expenses.customExpenses.forEach((exp) => {
    if (exp.frequency === 'monthly') {
      totalMonthlyExpenses += exp.amount;
    } else {
      // Annual - prorate to monthly
      totalMonthlyExpenses += exp.amount / 12;
    }
  });

  const yearlyTotalExpenses = totalMonthlyExpenses * 12;

  // STEP 6: Calculate net income
  const yearlyTotalNetIncome = yearlyTotalGrossIncome - yearlyTotalExpenses;

  // STEP 7: Calculate monthly averages (spread across 12 months)
  const monthlyAverageGrossIncome = yearlyTotalGrossIncome / 12;
  const monthlyAverageExpenses = totalMonthlyExpenses;
  const monthlyAverageNetIncome = yearlyTotalNetIncome / 12;

  // STEP 8: Calculate hourly rates
  const totalHoursPerYear = totalHoursPerWeek * workingWeeksPerYear;
  const grossHourlyRate = yearlyTotalGrossIncome / totalHoursPerYear;
  const netHourlyRate = yearlyTotalNetIncome / totalHoursPerYear;

  // STEP 9: Calculate profit margin
  const hasExpenses = yearlyTotalExpenses > 0;
  const profitMarginPercent = hasExpenses
    ? ((yearlyTotalGrossIncome - yearlyTotalExpenses) / yearlyTotalGrossIncome) * 100
    : undefined;

  return {
    // Input echo
    sessionFee,
    clientsScheduledPerWeek,

    // Calculated attendance
    attendedSessionsPerWeek,

    // Time calculations
    sessionHoursPerWeek: Math.round(sessionHoursPerWeek * 10) / 10,
    docAdminHoursPerWeek: Math.round(docAdminHoursPerWeek * 10) / 10,
    totalHoursPerWeek: Math.round(totalHoursPerWeek * 10) / 10,
    workingWeeksPerYear,

    // Income calculations
    weeklyGrossIncome: Math.round(weeklyGrossIncome),

    // Monthly averages
    monthlyAverageGrossIncome: Math.round(monthlyAverageGrossIncome),
    monthlyAverageExpenses: Math.round(monthlyAverageExpenses),
    monthlyAverageNetIncome: Math.round(monthlyAverageNetIncome),

    // Yearly totals
    yearlyTotalGrossIncome: Math.round(yearlyTotalGrossIncome),
    yearlyTotalExpenses: Math.round(yearlyTotalExpenses),
    yearlyTotalNetIncome: Math.round(yearlyTotalNetIncome),

    // Rate calculations
    grossHourlyRate: Math.round(grossHourlyRate),
    netHourlyRate: Math.round(netHourlyRate),

    // Optional fields
    hasExpenses,
    profitMarginPercent: profitMarginPercent ? Math.round(profitMarginPercent) : undefined,
  };
}
