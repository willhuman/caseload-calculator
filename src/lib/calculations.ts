/**
 * Calculation utilities for the Therapist Caseload Calculator
 */

export interface CalculationInputs {
  monthlyIncome: number;
  sessionFee: number;
  adminHours?: number; // Default: 6
  documentationMinutesPerClient?: number; // Default: 20
  cancellationRate?: number; // Default: 0.10 (10%)
  capacityTarget?: number; // Auto-determined from income or set manually
}

export interface CalculationResults {
  // Core metrics
  sessionsPerMonth: number;
  sessionsPerWeek: number;
  scheduledSessionsPerWeek: number;
  attendedSessionsPerWeek: number;

  // Hours breakdown
  sessionHours: number;
  docHours: number;
  adminHours: number;
  totalHours: number;

  // Revenue
  revenueMonthly: number;

  // Capacity and wellness
  capacityTarget: number;
  caseloadRange: { low: number; high: number };

  // Wellness checks
  financialOK: boolean;
  timeOK: boolean;
  qualityOK: boolean;
  overallLabel: 'sustainable' | 'challenging' | 'room-to-grow';
  overallSnippet: string;

  // Hours comparison
  hoursLeft: number;
  hoursOver: number;
}

// Constants
const WEEKS_PER_MONTH = 4.33;
const AVERAGE_SESSION_LENGTH_HOURS = 50 / 60; // 50 minutes = 0.833 hours
const DEFAULT_DOC_AND_ADMIN_MINUTES_PER_CLIENT = 20; // Combined documentation + admin time per client
const DEFAULT_DOCUMENTATION_MINUTES = 20; // Documentation minutes per client
const DEFAULT_ADMIN_HOURS = 6; // Weekly admin hours
const DEFAULT_CANCELLATION_RATE = 0.10; // 10%
const DEFAULT_SESSION_MINUTES = 50; // 50-minute sessions
const HEALTHY_HOURS_THRESHOLD = 34; // Default healthy weekly hours threshold

export function calculateCaseload(inputs: CalculationInputs): CalculationResults {
  // Apply defaults
  const adminHours = inputs.adminHours ?? DEFAULT_ADMIN_HOURS;
  const documentationMinutesPerClient = inputs.documentationMinutesPerClient ?? DEFAULT_DOCUMENTATION_MINUTES;
  const cancellationRate = inputs.cancellationRate ?? DEFAULT_CANCELLATION_RATE;
  const capacityTarget = inputs.capacityTarget ?? HEALTHY_HOURS_THRESHOLD;

  const { monthlyIncome, sessionFee } = inputs;

  // Step 1: Sessions per month = income ÷ session fee
  const sessionsPerMonth = monthlyIncome / sessionFee;

  // Step 2: Sessions per week = sessions per month ÷ 4.33
  const sessionsPerWeek = sessionsPerMonth / WEEKS_PER_MONTH;

  // Step 3: Scheduled sessions = sessions needed ÷ (1 - cancellation rate)
  // If 10% cancel, we need to schedule more to ensure we get the sessions we need
  const scheduledSessionsPerWeek = sessionsPerWeek / (1 - cancellationRate);

  // Step 4: Attended sessions = what we actually need
  const attendedSessionsPerWeek = sessionsPerWeek;

  // Step 5: Calculate hours
  const sessionHours = attendedSessionsPerWeek * AVERAGE_SESSION_LENGTH_HOURS;
  const docHours = (attendedSessionsPerWeek * documentationMinutesPerClient) / 60;
  const totalHours = sessionHours + docHours + adminHours;

  // Step 6: Revenue (actual attended sessions)
  const revenueMonthly = attendedSessionsPerWeek * sessionFee * WEEKS_PER_MONTH;

  // Step 7: Caseload range (handle fractional clients)
  const caseloadRange = getCaseloadRange(attendedSessionsPerWeek);

  // Step 8: Wellness checks (updated threshold logic)
  const financialOK = revenueMonthly >= monthlyIncome;
  const timeOK = totalHours <= capacityTarget;
  const qualityOK = financialOK && timeOK;

  // Step 9: Overall label and snippet
  const { overallLabel, overallSnippet } = getOverallAssessment(
    financialOK,
    timeOK,
    totalHours,
    capacityTarget
  );

  // Step 10: Hours comparison
  const hoursLeft = Math.max(capacityTarget - totalHours, 0);
  const hoursOver = Math.max(totalHours - capacityTarget, 0);

  return {
    sessionsPerMonth,
    sessionsPerWeek,
    scheduledSessionsPerWeek,
    attendedSessionsPerWeek,
    sessionHours,
    docHours,
    adminHours,
    totalHours,
    revenueMonthly,
    capacityTarget,
    caseloadRange,
    financialOK,
    timeOK,
    qualityOK,
    overallLabel,
    overallSnippet,
    hoursLeft,
    hoursOver
  };
}

function getCaseloadRange(clients: number): { low: number; high: number } {
  const floor = Math.floor(clients);
  const ceil = Math.ceil(clients);

  // If very close to a whole number (within 0.1), show single number
  if (clients - floor < 0.1 || ceil - clients < 0.1) {
    const rounded = Math.round(clients);
    return { low: rounded, high: rounded };
  }

  return { low: floor, high: ceil };
}

function getOverallAssessment(
  financialOK: boolean,
  timeOK: boolean,
  totalHours: number,
  capacityTarget: number
): { overallLabel: 'sustainable' | 'challenging' | 'room-to-grow'; overallSnippet: string } {
  // Sustainable: Both financial and time are OK
  if (financialOK && timeOK) {
    return {
      overallLabel: 'sustainable',
      overallSnippet: "This plan is balanced across income and time. You're well positioned to sustain quality care."
    };
  }

  // Room to Grow: Time OK but not meeting financial, or using <80% of capacity
  if ((timeOK && !financialOK) || (financialOK && totalHours <= capacityTarget * 0.8)) {
    return {
      overallLabel: 'room-to-grow',
      overallSnippet: 'You have capacity to expand. You could take on more clients or explore higher fees if it feels right.'
    };
  }

  // Challenging: Everything else (over capacity or not meeting goals)
  return {
    overallLabel: 'challenging',
    overallSnippet: 'This plan may be difficult to sustain. Consider adjusting your fees or reducing cancellations.'
  };
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
  return low === high ? `${low}${suffix}` : `${low}-${high}${suffix}`;
}

export function formatPercentage(decimal: number): string {
  return `${Math.round(decimal * 100)}%`;
}

// Helper function to round fee to clean amounts
export function roundToCleanFee(fee: number): number {
  // Round to nearest $5 for fees under $200
  if (fee < 200) {
    return Math.round(fee / 5) * 5;
  }
  // Round to nearest $10 for fees $200+
  return Math.round(fee / 10) * 10;
}

// Recommendation types
export type RecommendationType =
  | 'higher-fee'
  | 'lighter-caseload'
  | 'reduced-cancellations'
  | 'streamlined-admin'
  | 'optimized';

export interface Recommendation {
  type: RecommendationType;
  title: string;
  description: string;
  inputs: CalculationInputs;
  newSessionFee: number;
}

// Smart recommendation engine
export function getRecommendation(
  baselineResults: CalculationResults,
  planState: {
    monthlyIncome: number;
    sessionFee: number;
    adminHours: number;
    documentationMinutesPerClient: number;
    cancellationRate: number;
  }
): Recommendation {
  const { financialOK, timeOK, totalHours, capacityTarget } = baselineResults;

  // Priority 1: If financially insufficient, recommend higher fees
  if (!financialOK) {
    const newFee = roundToCleanFee(planState.sessionFee * 1.10);
    return {
      type: 'higher-fee',
      title: 'Higher Fee Path',
      description: 'Increase your session fee to meet your income goal',
      inputs: {
        ...planState,
        sessionFee: newFee
      },
      newSessionFee: newFee
    };
  }

  // Priority 2: If time-intensive (>40 hours), recommend lighter caseload with small fee bump
  if (!timeOK && totalHours > 40) {
    const newFee = roundToCleanFee(planState.sessionFee * 1.08);
    return {
      type: 'lighter-caseload',
      title: 'Lighter Caseload Path',
      description: 'Small fee increase to maintain income with fewer clients',
      inputs: {
        ...planState,
        sessionFee: newFee
      },
      newSessionFee: newFee
    };
  }

  // Priority 3: If high cancellation rate (>12%), recommend tightening policy
  if (planState.cancellationRate > 0.12) {
    return {
      type: 'reduced-cancellations',
      title: 'Reduced Cancellations Path',
      description: 'Implement stricter cancellation policy to reduce no-shows',
      inputs: {
        ...planState,
        cancellationRate: Math.max(0.05, planState.cancellationRate - 0.05)
      },
      newSessionFee: planState.sessionFee
    };
  }

  // Priority 4: If high admin burden (>8 hours), recommend streamlining
  if (planState.adminHours > 8) {
    return {
      type: 'streamlined-admin',
      title: 'Streamlined Admin Path',
      description: 'Reduce admin time with better systems and workflows',
      inputs: {
        ...planState,
        adminHours: Math.max(3, planState.adminHours - 3)
      },
      newSessionFee: planState.sessionFee
    };
  }

  // Priority 5: If sustainable with room to grow, recommend optimized path
  if (financialOK && timeOK && totalHours < capacityTarget * 0.8) {
    const newFee = roundToCleanFee(planState.sessionFee * 1.10);
    return {
      type: 'optimized',
      title: 'Optimized Path',
      description: 'You have room to grow - consider increasing your fee',
      inputs: {
        ...planState,
        sessionFee: newFee
      },
      newSessionFee: newFee
    };
  }

  // Default fallback: Higher fee path
  const newFee = roundToCleanFee(planState.sessionFee * 1.10);
  return {
    type: 'higher-fee',
    title: 'Higher Fee Path',
    description: 'Increase your session fee for more sustainable income',
    inputs: {
      ...planState,
      sessionFee: newFee
    },
    newSessionFee: newFee
  };
}

/**
 * NEW: Calculate reality-based plan from time and money goals
 * Given desired income and hours, solve for what session fee is needed
 */
export interface RealityPlanInputs {
  monthlyIncome: number;
  weeklyHours: number;
  sessionFee: number; // User adjustable via slider
  sessionMinutes?: number; // Default: 50
  adminHours?: number;
  documentationMinutesPerClient?: number;
  cancellationRate?: number;
}

export interface RealityPlanResults {
  // What they asked for
  goalIncome: number;
  goalHours: number;

  // What they need
  sessionFee: number;
  clientsPerWeek: { min: number; max: number };

  // Breakdown
  breakdown: {
    sessionHours: number;
    docHours: number;
    adminHours: number;
    totalHours: number;
  };

  // Reality check
  meetsIncome: boolean;
  meetsTime: boolean;
  sustainability: 'sustainable' | 'not-sustainable';
  sustainabilityMessage: string;

  // For displaying
  hoursOverGoal: number;
  hoursUnderGoal: number;
}

export function calculateRealityPlan(inputs: RealityPlanInputs): RealityPlanResults {
  // Apply defaults
  const sessionMinutes = inputs.sessionMinutes ?? DEFAULT_SESSION_MINUTES;
  const adminHours = inputs.adminHours ?? DEFAULT_ADMIN_HOURS;
  const documentationMinutesPerClient = inputs.documentationMinutesPerClient ?? DEFAULT_DOCUMENTATION_MINUTES;
  const cancellationRate = inputs.cancellationRate ?? DEFAULT_CANCELLATION_RATE;

  const { monthlyIncome, weeklyHours, sessionFee } = inputs;

  // Calculate based on their chosen session fee
  const sessionsPerMonth = monthlyIncome / sessionFee;
  const sessionsPerWeek = sessionsPerMonth / WEEKS_PER_MONTH;

  // Account for cancellations - need to schedule more
  const scheduledSessionsPerWeek = sessionsPerWeek / (1 - cancellationRate);

  // Calculate hours breakdown using actual session minutes
  const sessionLengthHours = sessionMinutes / 60;
  const sessionHours = sessionsPerWeek * sessionLengthHours;
  const docHours = (sessionsPerWeek * documentationMinutesPerClient) / 60;
  const totalHours = sessionHours + docHours + adminHours;

  // Caseload range
  const clientsPerWeek = getCaseloadRange(scheduledSessionsPerWeek);

  // Reality checks
  const actualRevenue = sessionsPerWeek * sessionFee * WEEKS_PER_MONTH;
  const meetsIncome = actualRevenue >= monthlyIncome;
  const meetsTime = totalHours <= weeklyHours;

  // Sustainability assessment
  const hoursOverGoal = Math.max(0, totalHours - weeklyHours);
  const hoursUnderGoal = Math.max(0, weeklyHours - totalHours);

  let sustainability: 'sustainable' | 'not-sustainable';
  let sustainabilityMessage: string;

  if (meetsTime && meetsIncome) {
    sustainability = 'sustainable';
    // If total hours is 40 or less, show the "manageable for most therapists" message
    if (totalHours <= 40) {
      sustainabilityMessage = `This feels manageable for most therapists and it falls within your ${weeklyHours}-hour per week goal.`;
    } else {
      // If over 40 hours but still within their goal, just mention it falls within their goal
      sustainabilityMessage = `This falls within your ${weeklyHours}-hour per week goal.`;
    }
  } else if (!meetsTime) {
    sustainability = 'not-sustainable';
    sustainabilityMessage = `This would require ${totalHours.toFixed(1)} hours per week, which exceeds your ${weeklyHours}-hour per week goal.`;
  } else {
    sustainability = 'not-sustainable';
    sustainabilityMessage = 'This combination may not meet your income goal.';
  }

  return {
    goalIncome: monthlyIncome,
    goalHours: weeklyHours,
    sessionFee,
    clientsPerWeek: { min: clientsPerWeek.low, max: clientsPerWeek.high },
    breakdown: {
      sessionHours: Math.round(sessionHours * 10) / 10,
      docHours: Math.round(docHours * 10) / 10,
      adminHours,
      totalHours: Math.round(totalHours * 10) / 10
    },
    meetsIncome,
    meetsTime,
    sustainability,
    sustainabilityMessage,
    hoursOverGoal: Math.round(hoursOverGoal * 10) / 10,
    hoursUnderGoal: Math.round(hoursUnderGoal * 10) / 10
  };
}

/**
 * NEW APPROACH: Calculate what's needed to meet income and hours goals
 * This is the main function for the new single-page calculator
 */
export interface GoalBasedInputs {
  monthlyIncome: number;
  weeklyHours: number;
  sessionMinutes?: number; // Default: 50
  docAndAdminMinutesPerClient?: number; // Default: 20
  cancellationRate?: number; // Default: 0.10
}

export interface GoalBasedResults {
  // What they need to do
  sessionFee: number;
  clientsPerWeek: number;
  clientsPerWeekRange: { low: number; high: number };

  // Breakdown of their week
  breakdown: {
    sessionHours: number;
    docAndAdminHours: number;
    totalHours: number;
  };

  // Sustainability check
  meetsGoal: boolean;
  sustainability: 'sustainable' | 'challenging' | 'room-to-grow';
  sustainabilityMessage: string;
}

export function calculateGoalBasedPlan(inputs: GoalBasedInputs): GoalBasedResults {
  // Apply defaults
  const sessionMinutes = inputs.sessionMinutes ?? DEFAULT_SESSION_MINUTES;
  const docAndAdminMinutesPerClient = inputs.docAndAdminMinutesPerClient ?? DEFAULT_DOC_AND_ADMIN_MINUTES_PER_CLIENT;
  const cancellationRate = inputs.cancellationRate ?? DEFAULT_CANCELLATION_RATE;

  const { monthlyIncome, weeklyHours } = inputs;

  // Calculate hours per client (session + doc/admin)
  const sessionHours = sessionMinutes / 60;
  const docAndAdminHours = docAndAdminMinutesPerClient / 60;
  const hoursPerClient = sessionHours + docAndAdminHours;

  // Strategy: Recommend using AS CLOSE TO their maximum hours as possible
  // Calculate the maximum number of scheduled clients they can handle
  const maxScheduledClients = weeklyHours / hoursPerClient;
  const maxAttendedSessions = maxScheduledClients * (1 - cancellationRate);

  // Calculate the session fee needed if they work close to maximum hours
  const maxSessionsPerMonth = maxAttendedSessions * WEEKS_PER_MONTH;
  let calculatedSessionFee = monthlyIncome / maxSessionsPerMonth;

  // Round DOWN to a clean fee (to ensure they need more clients, not fewer)
  // This keeps them closer to their time goal
  let sessionFee = Math.floor(calculatedSessionFee / 5) * 5;
  if (sessionFee < 50) sessionFee = 50; // Minimum reasonable fee

  // Calculate how many clients they need with this fee
  let requiredSessionsPerMonth = monthlyIncome / sessionFee;
  let requiredSessionsPerWeek = requiredSessionsPerMonth / WEEKS_PER_MONTH;
  let requiredScheduledSessionsPerWeek = requiredSessionsPerWeek / (1 - cancellationRate);

  // Calculate hours with this approach
  let actualSessionHours = requiredSessionsPerWeek * sessionHours;
  let actualDocAndAdminHours = requiredSessionsPerWeek * docAndAdminHours;
  let totalHours = actualSessionHours + actualDocAndAdminHours;

  // If this puts us over the time limit, we need to increase the fee
  if (totalHours > weeklyHours) {
    // Recalculate with the minimum fee needed
    calculatedSessionFee = monthlyIncome / maxSessionsPerMonth;
    sessionFee = roundToCleanFee(calculatedSessionFee);
    requiredSessionsPerMonth = monthlyIncome / sessionFee;
    requiredSessionsPerWeek = requiredSessionsPerMonth / WEEKS_PER_MONTH;
    requiredScheduledSessionsPerWeek = requiredSessionsPerWeek / (1 - cancellationRate);
    actualSessionHours = requiredSessionsPerWeek * sessionHours;
    actualDocAndAdminHours = requiredSessionsPerWeek * docAndAdminHours;
    totalHours = actualSessionHours + actualDocAndAdminHours;
  }

  // Caseload range for display
  const clientsPerWeekRange = getCaseloadRange(requiredScheduledSessionsPerWeek);

  // Sustainability assessment
  const meetsGoal = totalHours <= weeklyHours;
  let sustainability: 'sustainable' | 'challenging' | 'room-to-grow';
  let sustainabilityMessage: string;

  if (meetsGoal) {
    const hoursUtilization = totalHours / weeklyHours;
    if (totalHours <= 40 && hoursUtilization >= 0.85) {
      sustainability = 'sustainable';
      sustainabilityMessage = `This feels manageable for most therapists and uses your available time efficiently.`;
    } else if (totalHours <= 40) {
      sustainability = 'sustainable';
      sustainabilityMessage = `This feels manageable for most therapists and falls within your ${weeklyHours}-hour per week goal.`;
    } else if (hoursUtilization >= 0.85) {
      sustainability = 'sustainable';
      sustainabilityMessage = `This uses your ${weeklyHours} hours efficiently to maximize your income goal.`;
    } else {
      sustainability = 'sustainable';
      sustainabilityMessage = `This falls within your ${weeklyHours}-hour per week goal.`;
    }
  } else {
    sustainability = 'challenging';
    sustainabilityMessage = `This would require ${totalHours.toFixed(1)} hours per week, which exceeds your ${weeklyHours}-hour goal. Consider adjusting your goals.`;
  }

  return {
    sessionFee,
    clientsPerWeek: requiredScheduledSessionsPerWeek,
    clientsPerWeekRange: { low: clientsPerWeekRange.low, high: clientsPerWeekRange.high },
    breakdown: {
      sessionHours: Math.round(actualSessionHours * 10) / 10,
      docAndAdminHours: Math.round(actualDocAndAdminHours * 10) / 10,
      totalHours: Math.round(totalHours * 10) / 10
    },
    meetsGoal,
    sustainability,
    sustainabilityMessage
  };
}