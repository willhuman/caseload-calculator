'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ACCESS_KEY = 'nesso2025';

// Types
type PayType = '' | 'salary' | 'hourly' | 'per-session';
type EmploymentType = '' | 'self-employed' | 'w2' | '1099';
type TaxStatus = 'w2' | '1099'; // Keep for backwards compatibility in calculations
type IncomeSourceType = '' | 'private-practice' | 'group-practice' | 'agency' | 'workshops' | 'supervision' | 'coaching' | 'other';

const EMPLOYMENT_TYPE_OPTIONS: { value: EmploymentType; label: string; disabled?: boolean }[] = [
  { value: '', label: 'Select an employment type to continue', disabled: true },
  { value: 'self-employed', label: 'Self-employed' },
  { value: 'w2', label: 'Employee (W-2)' },
  { value: '1099', label: 'Contractor (1099)' },
];

const INCOME_SOURCE_OPTIONS: { value: IncomeSourceType; label: string; disabled?: boolean }[] = [
  { value: '', label: 'Select a type of work to begin', disabled: true },
  { value: 'private-practice', label: 'My Private Practice' },
  { value: 'group-practice', label: 'Group Practice' },
  { value: 'agency', label: 'Agency Work' },
  { value: 'workshops', label: 'Workshops' },
  { value: 'supervision', label: 'Supervision' },
  { value: 'coaching', label: 'Coaching' },
  { value: 'other', label: 'Other' },
];

const PAY_TYPE_OPTIONS: { value: PayType; label: string; disabled?: boolean }[] = [
  { value: '', label: 'Select how you are paid', disabled: true },
  { value: 'salary', label: 'Salary' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'per-session', label: 'Per Session' },
];

// Rate tier for different client rates (full rate, reduced rate, insurance, etc.)
interface RateTier {
  id: string;
  label: string;
  rate: number;
  sessionsPerWeek: number;
}

interface IncomeSource {
  id: string;
  sourceType: IncomeSourceType;
  employmentType: EmploymentType;
  payType: PayType;
  taxStatus: TaxStatus; // Derived from employmentType for calculations
  annualSalary?: number;
  hourlyRate?: number;
  hoursPerWeek?: number;
  ratePerSession?: number;
  sessionsPerWeek?: number;
  // Private Practice specific fields - rate tiers for different client rates
  rateTiers: RateTier[];
  // Per-source time settings
  sessionLengthMinutes: number;
  documentationMinutes: number;
  weeklyAdminHours: number;
  // Progressive reveal state
  showResults: boolean;
  isCalculating: boolean;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const createRateTier = (label: string = 'Full rate'): RateTier => ({
  id: generateId(),
  label,
  rate: 0,
  sessionsPerWeek: 0,
});

const createIncomeSource = (): IncomeSource => ({
  id: generateId(),
  sourceType: '',
  employmentType: '',
  payType: '',
  taxStatus: '1099', // self-employed uses 1099 tax treatment
  sessionsPerWeek: 0,
  ratePerSession: 0,
  rateTiers: [createRateTier('Full rate')],
  sessionLengthMinutes: 50,
  documentationMinutes: 10,
  weeklyAdminHours: 3,
  showResults: false,
  isCalculating: false,
});

const calculateWeeklyIncome = (source: IncomeSource): number => {
  // Private Practice uses rate tiers
  if (source.sourceType === 'private-practice') {
    return source.rateTiers.reduce((total, tier) => {
      return total + (tier.rate * tier.sessionsPerWeek);
    }, 0);
  }

  switch (source.payType) {
    case 'salary':
      return (source.annualSalary || 0) / 52;
    case 'hourly':
      return (source.hourlyRate || 0) * (source.hoursPerWeek || 0);
    case 'per-session':
      return (source.ratePerSession || 0) * (source.sessionsPerWeek || 0);
    default:
      return 0;
  }
};

const getSessionsPerWeek = (source: IncomeSource): number => {
  // Private Practice sums sessions from all rate tiers
  if (source.sourceType === 'private-practice') {
    return source.rateTiers.reduce((total, tier) => total + tier.sessionsPerWeek, 0);
  }
  return source.sessionsPerWeek || 0;
};

const formatCurrency = (amount: number, showCents = false): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(amount);
};

// Calculate results for a single income source
const calculateSourceResults = (source: IncomeSource) => {
  const selfEmploymentTaxRate = 0.153;
  const weeklyIncome = calculateWeeklyIncome(source);
  const sessionsPerWeek = getSessionsPerWeek(source);

  // SE tax only applies to 1099 income
  const weeklySETax = source.taxStatus === '1099' ? weeklyIncome * selfEmploymentTaxRate : 0;
  const effectiveWeeklyIncome = weeklyIncome - weeklySETax;

  const sessionTimeHours = source.sessionLengthMinutes / 60;
  const docTimeHours = source.documentationMinutes / 60;

  const clientFacingHours = sessionsPerWeek * sessionTimeHours;
  const documentationHours = sessionsPerWeek * docTimeHours;
  const totalWeeklyHours = clientFacingHours + documentationHours + source.weeklyAdminHours;

  const trueHourlyRate = totalWeeklyHours > 0 ? effectiveWeeklyIncome / totalWeeklyHours : 0;
  const annualIncome = effectiveWeeklyIncome * 52;

  return {
    weeklyIncome,
    weeklySETax,
    effectiveWeeklyIncome,
    sessionsPerWeek,
    clientFacingHours,
    documentationHours,
    totalWeeklyHours,
    trueHourlyRate,
    annualIncome,
  };
};

// Calculate combined results across all income sources
const calculateCombinedResults = (sources: IncomeSource[]) => {
  const sourceResults = sources.map(source => ({
    source,
    results: calculateSourceResults(source),
    label: INCOME_SOURCE_OPTIONS.find(o => o.value === source.sourceType)?.label || 'Income Source',
  }));

  const totals = sourceResults.reduce(
    (acc, { results }) => ({
      weeklyIncome: acc.weeklyIncome + results.weeklyIncome,
      weeklySETax: acc.weeklySETax + results.weeklySETax,
      effectiveWeeklyIncome: acc.effectiveWeeklyIncome + results.effectiveWeeklyIncome,
      totalWeeklyHours: acc.totalWeeklyHours + results.totalWeeklyHours,
      clientFacingHours: acc.clientFacingHours + results.clientFacingHours,
      documentationHours: acc.documentationHours + results.documentationHours,
    }),
    {
      weeklyIncome: 0,
      weeklySETax: 0,
      effectiveWeeklyIncome: 0,
      totalWeeklyHours: 0,
      clientFacingHours: 0,
      documentationHours: 0,
    }
  );

  const blendedHourlyRate = totals.totalWeeklyHours > 0
    ? totals.effectiveWeeklyIncome / totals.totalWeeklyHours
    : 0;

  // Sort by true hourly rate (highest first) for insights
  const sortedByRate = [...sourceResults].sort(
    (a, b) => b.results.trueHourlyRate - a.results.trueHourlyRate
  );

  return {
    sourceResults,
    totals,
    blendedHourlyRate,
    sortedByRate,
  };
};

// Helper to check if income step is complete
const isIncomeStepComplete = (source: IncomeSource): boolean => {
  if (source.sourceType === 'private-practice') {
    // Check if at least one rate tier has both rate and sessions
    return source.rateTiers.some(tier => tier.rate > 0 && tier.sessionsPerWeek > 0);
  }

  switch (source.payType) {
    case 'salary':
      return (source.annualSalary || 0) > 0 && (source.sessionsPerWeek || 0) > 0;
    case 'hourly':
      return (source.hourlyRate || 0) > 0 && (source.hoursPerWeek || 0) > 0;
    case 'per-session':
      return (source.ratePerSession || 0) > 0 && (source.sessionsPerWeek || 0) > 0;
    default:
      return false;
  }
};

// Loading Results Component
function LoadingResults() {
  return (
    <div className="bg-[#E0EAE0] rounded-lg p-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-center gap-3">
        <svg className="w-5 h-5 text-nesso-navy animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-base font-medium text-nesso-navy">Calculating your true rate...</span>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-nesso-navy/10 rounded w-3/4" />
        <div className="h-4 bg-nesso-navy/10 rounded w-1/2" />
        <div className="h-6 bg-nesso-navy/20 rounded w-2/3 mt-4" />
      </div>
    </div>
  );
}

// Results Panel Component
function ResultsPanel({ source, sourceLabel }: { source: IncomeSource; sourceLabel: string }) {
  const [hoursExpanded, setHoursExpanded] = useState(false);
  const results = calculateSourceResults(source);
  const is1099 = source.taxStatus === '1099';

  return (
    <div className="bg-[#E0EAE0] rounded-lg p-4 space-y-3">
      {/* Main Result Header */}
      <div className="text-center pb-2">
        <p className="text-sm text-nesso-ink/70 mb-1">
          Your true hourly rate for your {sourceLabel === 'My Private Practice' ? 'private practice' : sourceLabel.toLowerCase()} work is
        </p>
        <p className="text-3xl font-bold text-nesso-navy">
          {formatCurrency(results.trueHourlyRate, true)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {formatCurrency(results.effectiveWeeklyIncome)}/week ÷ {results.totalWeeklyHours.toFixed(1)}h
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-navy/20" />

      {/* Calculation Breakdown */}
      <div className="space-y-2 text-sm">
        {/* Weekly Income */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Weekly income</span>
          <span className="font-medium text-navy">{formatCurrency(results.weeklyIncome)}</span>
        </div>

        {/* SE Taxes - only show for 1099 */}
        {is1099 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600 flex items-center gap-1">
              SE taxes (15.3%)
              <button
                type="button"
                className="relative group"
                onClick={(e) => e.currentTarget.focus()}
              >
                <svg className="w-3.5 h-3.5 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-nesso-navy text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity pointer-events-none w-56 text-left z-10 shadow-lg">
                  Self-employment tax covers Social Security (12.4%) and Medicare (2.9%) that W-2 employees split with their employer. When you&apos;re self-employed or a 1099 contractor, you pay both portions. This is separate from federal and state income taxes.
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-nesso-navy" />
                </span>
              </button>
            </span>
            <span className="font-medium text-red-600">-{formatCurrency(results.weeklySETax)}</span>
          </div>
        )}

        {/* Net Weekly Income - only show if there are taxes */}
        {is1099 && (
          <>
            <div className="h-px bg-navy/20" />
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Net weekly income</span>
              <span className="font-medium text-navy">{formatCurrency(results.effectiveWeeklyIncome)}</span>
            </div>
          </>
        )}

        {/* Total Work Hours - Expandable */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setHoursExpanded(!hoursExpanded)}
            className="w-full flex justify-between items-center text-left hover:bg-navy/5 -mx-1 px-1 py-0.5 rounded transition-colors"
          >
            <span className="text-gray-600 flex items-center gap-1">
              Total work hours
              <svg
                className={`w-3.5 h-3.5 text-gray-400 transition-transform ${hoursExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
            <span className="font-medium text-navy">{results.totalWeeklyHours.toFixed(1)}h</span>
          </button>

          {/* Expanded Hours Breakdown */}
          {hoursExpanded && (
            <div className="mt-2 ml-2 pl-2 border-l-2 border-navy/10 space-y-1 text-xs">
              <div className="flex justify-between items-center text-gray-500">
                <span>Time with clients ({results.sessionsPerWeek} sessions)</span>
                <span>{results.clientFacingHours.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span>Documentation</span>
                <span>{results.documentationHours.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span>Admin</span>
                <span>{source.weeklyAdminHours}h</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tax Note */}
      <div className="pt-2">
        <p className="text-xs text-navy/60">
          Federal and state income taxes not included.
        </p>
      </div>
    </div>
  );
}

// Combined Summary Panel for multiple income sources
function CombinedSummaryPanel({ sources }: { sources: IncomeSource[] }) {
  const combined = calculateCombinedResults(sources);
  const { totals, blendedHourlyRate, sortedByRate } = combined;

  // Find the max rate for scaling the bars
  const maxRate = Math.max(...sortedByRate.map(s => s.results.trueHourlyRate));

  // Generate insights
  const hasMultipleRates = sortedByRate.length >= 2 &&
    sortedByRate[0].results.trueHourlyRate > 0 &&
    sortedByRate[sortedByRate.length - 1].results.trueHourlyRate > 0;

  const highestPaying = sortedByRate[0];
  const lowestPaying = sortedByRate[sortedByRate.length - 1];
  const rateDifference = hasMultipleRates
    ? highestPaying.results.trueHourlyRate - lowestPaying.results.trueHourlyRate
    : 0;

  // Calculate hours percentage by source
  const hoursBySource = sortedByRate.map(({ label, results }) => ({
    label,
    hours: results.totalWeeklyHours,
    percentage: totals.totalWeeklyHours > 0
      ? (results.totalWeeklyHours / totals.totalWeeklyHours) * 100
      : 0,
    rate: results.trueHourlyRate,
  }));

  // Subtle colors that match the app style (using nesso-navy based tones)
  const sourceColors = [
    { bg: 'bg-nesso-navy', light: 'bg-nesso-navy/10' },
    { bg: 'bg-nesso-navy/60', light: 'bg-nesso-navy/10' },
    { bg: 'bg-nesso-navy/40', light: 'bg-nesso-navy/10' },
    { bg: 'bg-nesso-navy/25', light: 'bg-nesso-navy/10' },
  ];

  return (
    <Card className="border border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-nesso-ink">
          Combined Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Blended Rate - Hero Section */}
        <div className="bg-[#E0EAE0] rounded-lg p-4 text-center">
          <p className="text-xs text-nesso-ink/60 mb-0.5">Your blended hourly rate</p>
          <p className="text-2xl font-bold text-nesso-navy">
            {formatCurrency(blendedHourlyRate, true)}
          </p>
          <p className="text-xs text-nesso-ink/50 mt-1">
            {formatCurrency(totals.effectiveWeeklyIncome)}/week ÷ {totals.totalWeeklyHours.toFixed(1)}h
          </p>
        </div>

        {/* Rate Comparison - Visual Bars */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-nesso-ink/70">Rate comparison</h4>
          <div className="space-y-2">
            {sortedByRate.map(({ label, results }, index) => {
              const barWidth = maxRate > 0 ? (results.trueHourlyRate / maxRate) * 100 : 0;
              const colors = sourceColors[index % sourceColors.length];
              const isHighest = index === 0 && results.trueHourlyRate > 0;

              return (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-nesso-ink/70 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${colors.bg}`} />
                      {label}
                      {isHighest && (
                        <span className="text-[10px] text-primary font-medium">
                          Highest
                        </span>
                      )}
                    </span>
                    <span className="font-medium text-nesso-navy">
                      {formatCurrency(results.trueHourlyRate, true)}/hr
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors.bg} rounded-full transition-all duration-500`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hours Distribution - Stacked Bar */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-nesso-ink/70">Weekly hours breakdown</h4>
          <div className="space-y-2">
            {/* Stacked horizontal bar */}
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
              {hoursBySource.map(({ label, percentage }, index) => {
                const colors = sourceColors[index % sourceColors.length];
                return (
                  <div
                    key={label}
                    className={`h-full ${colors.bg} transition-all duration-500 first:rounded-l-full last:rounded-r-full`}
                    style={{ width: `${percentage}%` }}
                    title={`${label}: ${percentage.toFixed(0)}%`}
                  />
                );
              })}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {hoursBySource.map(({ label, hours }, index) => {
                const colors = sourceColors[index % sourceColors.length];
                return (
                  <div key={label} className="flex items-center gap-1 text-[11px] text-nesso-ink/60">
                    <span className={`w-2 h-2 rounded-full ${colors.bg}`} />
                    <span>{label}</span>
                    <span className="text-nesso-ink/40">({hours.toFixed(1)}h)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Income Summary */}
        <div className="space-y-1.5 pt-2 border-t border-gray-100">
          <div className="flex justify-between items-center text-xs">
            <span className="text-nesso-ink/60">Weekly income</span>
            <span className="font-medium text-nesso-navy">{formatCurrency(totals.weeklyIncome)}</span>
          </div>
          {totals.weeklySETax > 0 && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-nesso-ink/60">SE taxes (15.3%)</span>
              <span className="font-medium text-red-600">-{formatCurrency(totals.weeklySETax)}</span>
            </div>
          )}
          {totals.weeklySETax > 0 && (
            <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-100">
              <span className="text-nesso-ink/70 font-medium">Net weekly income</span>
              <span className="font-semibold text-nesso-navy">{formatCurrency(totals.effectiveWeeklyIncome)}</span>
            </div>
          )}
        </div>

        {/* Insights */}
        {hasMultipleRates && rateDifference > 5 && (
          <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
            <p className="text-xs text-nesso-ink/80">
              <span className="font-medium">{highestPaying.label}</span> pays{' '}
              <span className="font-medium">{formatCurrency(rateDifference, true)}/hr more</span> than {lowestPaying.label}.
              {highestPaying.results.totalWeeklyHours < lowestPaying.results.totalWeeklyHours && (
                <> Shifting more hours there could increase your earnings.</>
              )}
            </p>
          </div>
        )}

        {/* Tax Note */}
        <p className="text-[10px] text-center text-nesso-ink/40">
          Federal and state income taxes not included
        </p>
      </CardContent>
    </Card>
  );
}

function TrueRateContent() {
  const searchParams = useSearchParams();
  const accessParam = searchParams.get('access');
  const hasAccess = accessParam === ACCESS_KEY;

  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([createIncomeSource()]);

  const shareText = "Check out this True Hourly Rate Calculator - it helps therapists understand what they're really earning: https://www.caseloadcalculator.com/true-rate";

  const handleShareSelect = (platform: string) => {
    switch (platform) {
      case "text":
        window.location.href = `sms:?&body=${encodeURIComponent(shareText)}`;
        break;
      case "whatsapp":
        window.location.href = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
        break;
      case "email":
        const emailSubject = "Check out this True Hourly Rate Calculator";
        window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(shareText)}`;
        break;
    }
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4F7F3' }}>
        <Card className="max-w-md mx-4">
          <CardContent className="py-12 text-center">
            <h1 className="text-xl font-semibold text-nesso-navy mb-4">Access Required</h1>
            <p className="text-nesso-ink/70">
              This page is currently in development and requires an access key.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const addIncomeSource = () => {
    setIncomeSources(prev => [...prev, createIncomeSource()]);
  };

  const removeIncomeSource = (id: string) => {
    setIncomeSources(prev => prev.filter(s => s.id !== id));
  };

  const updateIncomeSource = (id: string, updates: Partial<IncomeSource>) => {
    setIncomeSources(prev =>
      prev.map(s => s.id === id ? { ...s, ...updates } : s)
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4F7F3' }}>
      <Header
        title="True Hourly Rate Calculator"
        rightContent={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#493944] hover:text-[#493944] hover:bg-[#493944]/5 md:size-auto md:h-10 md:px-4 md:gap-2 font-semibold"
                aria-label="Share"
              >
                <svg
                  className="size-4 rotate-45"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0V3"
                  />
                </svg>
                <span className="hidden md:inline">Share</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Share via</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleShareSelect('text')} className="gap-2">
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShareSelect('email')} className="gap-2">
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShareSelect('whatsapp')} className="gap-2">
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <main className="max-w-6xl mx-auto px-4 pt-2 lg:pt-3 pb-4 lg:pb-4">
        <div className="space-y-6 lg:space-y-4 pb-20 lg:pb-0">
          {/* Intro section - shown until user selects a work type */}
          {incomeSources.length === 1 && incomeSources[0].sourceType === '' && (
            <div className="text-center max-w-2xl mx-auto py-4 space-y-3">
              <p className="text-lg text-nesso-ink">
                As a therapist, your session rate doesn&apos;t tell the whole story.
              </p>
              <p className="text-base text-nesso-ink/70">
                This calculator factors in taxes, documentation time, and admin work to reveal what you&apos;re actually earning per hour across all your income sources.
              </p>
            </div>
          )}

          {incomeSources.map((source, index) => {
            const sourceLabel = INCOME_SOURCE_OPTIONS.find(o => o.value === source.sourceType)?.label || 'Income Source';
            const isSelfEmployed = source.sourceType === 'private-practice';
            const hasSelectedWorkType = source.sourceType !== '';
            // For private practice, employment type is auto-set to self-employed, so consider it selected
            const hasSelectedEmploymentType = isSelfEmployed || source.employmentType !== '';
            // For non-private-practice, user must select pay type before entering details
            const hasSelectedPayType = source.payType !== '';

            return (
              <Card key={source.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {incomeSources.length > 1 ? `Income Source ${index + 1}` : 'Your Income Source'}
                    </CardTitle>
                    {incomeSources.length > 1 && (
                      <button
                        onClick={() => removeIncomeSource(source.id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Two-column layout on desktop */}
                  <div className="lg:grid lg:grid-cols-5 lg:gap-6">
                    {/* Left Column: Inputs */}
                    <div className="lg:col-span-3 space-y-6 lg:space-y-4">
                      {/* Step 1: What type of work? */}
                      <div className="space-y-4 lg:space-y-3">
                        <h3 className="text-base font-semibold text-nesso-ink">
                          <span className="text-nesso-ink/40 font-normal">1.</span> What type of work?
                        </h3>
                        <select
                            value={source.sourceType}
                            onChange={(e) => {
                              const newType = e.target.value as IncomeSourceType;
                              if (newType === 'private-practice') {
                                updateIncomeSource(source.id, {
                                  sourceType: newType,
                                  employmentType: 'self-employed',
                                  taxStatus: '1099',
                                  payType: 'per-session',
                                  showResults: false
                                });
                              } else {
                                // Reset employment type and pay type when switching to non-private-practice
                                updateIncomeSource(source.id, {
                                  sourceType: newType,
                                  employmentType: '',
                                  payType: '',
                                  showResults: false
                                });
                              }
                            }}
                            className="w-full h-11 lg:h-9 px-3 py-2 lg:py-1.5 text-base md:text-sm rounded-md border border-input bg-transparent shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                          >
                            {INCOME_SOURCE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value} disabled={option.disabled}>
                                {option.label}
                              </option>
                            ))}
                          </select>

                        {/* Employment Type - only show after work type selected */}
                        {hasSelectedWorkType && !isSelfEmployed && (
                          <h3 className="text-base font-semibold text-nesso-ink pt-2">
                            <span className="text-nesso-ink/40 font-normal">2.</span> What is your employment type?
                          </h3>
                        )}
                        {hasSelectedWorkType && (
                          <div className="space-y-1.5">
                            {isSelfEmployed && <label className="text-sm font-medium text-nesso-ink/70">Employment type</label>}
                            <select
                              value={source.employmentType}
                              onChange={(e) => {
                                const newEmploymentType = e.target.value as EmploymentType;
                                // Map employment type to tax status for calculations
                                const newTaxStatus: TaxStatus = newEmploymentType === 'w2' ? 'w2' : '1099';
                                updateIncomeSource(source.id, {
                                  employmentType: newEmploymentType,
                                  taxStatus: newTaxStatus,
                                  showResults: false
                                });
                              }}
                              disabled={isSelfEmployed}
                              className={`w-full h-11 lg:h-9 px-3 py-2 lg:py-1.5 text-base md:text-sm rounded-md border border-input bg-transparent shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none ${isSelfEmployed ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}`}
                            >
                              {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                                <option
                                  key={option.value}
                                  value={option.value}
                                  disabled={option.disabled || (isSelfEmployed && option.value !== 'self-employed')}
                                >
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            {isSelfEmployed && (
                              <p className="text-xs text-nesso-ink/50">Private practice owners are self-employed</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Step 3: How are you paid? - Only show for non-private-practice after employment type selected */}
                      {hasSelectedEmploymentType && !isSelfEmployed && (
                      <div className="space-y-4 lg:space-y-3">
                        <h3 className="text-base font-semibold text-nesso-ink">
                          <span className="text-nesso-ink/40 font-normal">3.</span> How are you paid?
                        </h3>
                        <select
                          value={source.payType}
                          onChange={(e) => updateIncomeSource(source.id, { payType: e.target.value as PayType, showResults: false })}
                          className="w-full h-11 lg:h-9 px-3 py-2 lg:py-1.5 text-base md:text-sm rounded-md border border-input bg-transparent shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                        >
                          {PAY_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value} disabled={option.disabled}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      )}

                      {/* Step 4: Pay Details - Only show after pay type selected (or for private practice after employment type) */}
                      {((isSelfEmployed && hasSelectedEmploymentType) || (!isSelfEmployed && hasSelectedPayType)) && (
                      <div className="space-y-4 lg:space-y-3">
                        <h3 className="text-base font-semibold text-nesso-ink">
                          <span className="text-nesso-ink/40 font-normal">{isSelfEmployed ? '2' : '4'}.</span> How much do you earn?
                        </h3>

                        {isSelfEmployed ? (
                          <>
                            {/* Rate Tiers */}
                            <div className="space-y-3">
                              {source.rateTiers.map((tier, tierIndex) => (
                                <div key={tier.id} className="space-y-2">
                                  {/* Tier header with label and remove button */}
                                  <div className="flex items-center justify-between">
                                    {tierIndex === 0 ? (
                                      <span className="text-sm font-medium text-nesso-ink/70">
                                        Your standard rate
                                      </span>
                                    ) : (
                                      <input
                                        type="text"
                                        value={tier.label}
                                        onChange={(e) => {
                                          const updatedTiers = source.rateTiers.map(t =>
                                            t.id === tier.id ? { ...t, label: e.target.value } : t
                                          );
                                          updateIncomeSource(source.id, { rateTiers: updatedTiers });
                                        }}
                                        className="text-sm font-medium text-nesso-ink/70 bg-transparent border-b border-dashed border-gray-300 focus:border-primary px-0.5 py-0.5 focus:outline-none focus:ring-0"
                                        placeholder="Name this rate"
                                      />
                                    )}
                                    {source.rateTiers.length > 1 && tierIndex > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updatedTiers = source.rateTiers.filter(t => t.id !== tier.id);
                                          updateIncomeSource(source.id, { rateTiers: updatedTiers });
                                        }}
                                        className="text-xs text-red-500 hover:text-red-700"
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                      <label className="text-sm font-medium text-nesso-ink/70">
                                        {tierIndex === 0 ? 'Fee per session' : 'Rate'}
                                      </label>
                                      <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <Input
                                          type="number"
                                          min={0}
                                          className="pl-7"
                                          value={tier.rate || ''}
                                          onChange={(e) => {
                                            const updatedTiers = source.rateTiers.map(t =>
                                              t.id === tier.id ? { ...t, rate: parseFloat(e.target.value) || 0 } : t
                                            );
                                            updateIncomeSource(source.id, { rateTiers: updatedTiers });
                                          }}
                                          placeholder={tierIndex === 0 ? '150' : '80'}
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-sm font-medium text-nesso-ink/70">Sessions/week</label>
                                      <Input
                                        type="number"
                                        min={0}
                                        value={tier.sessionsPerWeek || ''}
                                        onChange={(e) => {
                                          const updatedTiers = source.rateTiers.map(t =>
                                            t.id === tier.id ? { ...t, sessionsPerWeek: parseFloat(e.target.value) || 0 } : t
                                          );
                                          updateIncomeSource(source.id, { rateTiers: updatedTiers });
                                        }}
                                        placeholder={tierIndex === 0 ? '15' : '5'}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {/* Add Rate Tier Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  const suggestedLabels = ['Reduced rate', 'Sliding scale', 'Insurance rate', 'Pro bono'];
                                  const usedLabels = source.rateTiers.map(t => t.label);
                                  const nextLabel = suggestedLabels.find(l => !usedLabels.includes(l)) || `Rate ${source.rateTiers.length + 1}`;
                                  const updatedTiers = [...source.rateTiers, createRateTier(nextLabel)];
                                  updateIncomeSource(source.id, { rateTiers: updatedTiers });
                                }}
                                className="w-full mt-2 py-2.5 px-3 bg-gray-50 hover:bg-primary/5 border border-dashed border-gray-300 hover:border-primary/50 rounded-md transition-colors flex items-center justify-center gap-2 text-sm text-nesso-ink/60 hover:text-primary"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add another rate (sliding scale, insurance, etc.)
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Pay Details */}
                            {source.payType === 'salary' && (
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                  <label className="text-sm font-medium text-nesso-ink/70">Annual salary</label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <Input
                                      type="text"
                                      inputMode="numeric"
                                      className="pl-7"
                                      value={source.annualSalary ? source.annualSalary.toLocaleString('en-US') : ''}
                                      onChange={(e) => {
                                        const rawValue = e.target.value.replace(/,/g, '');
                                        const numValue = parseFloat(rawValue) || 0;
                                        updateIncomeSource(source.id, { annualSalary: numValue });
                                      }}
                                      placeholder="60,000"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-sm font-medium text-nesso-ink/70">Sessions/week</label>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={source.sessionsPerWeek || ''}
                                    onChange={(e) => updateIncomeSource(source.id, { sessionsPerWeek: parseFloat(e.target.value) || 0 })}
                                    placeholder="25"
                                  />
                                </div>
                              </div>
                            )}

                            {source.payType === 'hourly' && (
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                  <label className="text-sm font-medium text-nesso-ink/70">Hourly rate</label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <Input
                                      type="number"
                                      min={0}
                                      className="pl-7"
                                      value={source.hourlyRate || ''}
                                      onChange={(e) => updateIncomeSource(source.id, { hourlyRate: parseFloat(e.target.value) || 0 })}
                                      placeholder="45"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-sm font-medium text-nesso-ink/70">Hours/week</label>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={source.hoursPerWeek || ''}
                                    onChange={(e) => updateIncomeSource(source.id, { hoursPerWeek: parseFloat(e.target.value) || 0 })}
                                    placeholder="40"
                                  />
                                </div>
                              </div>
                            )}

                            {source.payType === 'per-session' && (
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                  <label className="text-sm font-medium text-nesso-ink/70">Rate per session</label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <Input
                                      type="number"
                                      min={0}
                                      className="pl-7"
                                      value={source.ratePerSession || ''}
                                      onChange={(e) => updateIncomeSource(source.id, { ratePerSession: parseFloat(e.target.value) || 0 })}
                                      placeholder="75"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-sm font-medium text-nesso-ink/70">Sessions/week</label>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={source.sessionsPerWeek || ''}
                                    onChange={(e) => updateIncomeSource(source.id, { sessionsPerWeek: parseFloat(e.target.value) || 0 })}
                                    placeholder="25"
                                  />
                                </div>
                              </div>
                            )}

                          </>
                        )}
                      </div>
                      )}

                      {/* Step 5: How do you spend your time? - Only show after income is entered */}
                      {isIncomeStepComplete(source) && (
                      <div className="space-y-4 lg:space-y-3">
                        <h3 className="text-base font-semibold text-nesso-ink">
                          <span className="text-nesso-ink/40 font-normal">{isSelfEmployed ? '3' : '5'}.</span> How do you spend your time?
                        </h3>

                        <div className="grid grid-cols-3 gap-3">
                          {/* Session Length */}
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-nesso-ink/70">Session length</label>
                            <div className="relative">
                              <Input
                                type="number"
                                min={15}
                                max={120}
                                value={source.sessionLengthMinutes || ''}
                                onChange={(e) => updateIncomeSource(source.id, { sessionLengthMinutes: parseInt(e.target.value) || 0 })}
                                placeholder="50"
                                className="pr-12"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">min</span>
                            </div>
                          </div>

                          {/* Documentation Time */}
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-nesso-ink/70">Documentation</label>
                            <div className="relative">
                              <Input
                                type="number"
                                min={0}
                                max={60}
                                value={source.documentationMinutes || ''}
                                onChange={(e) => updateIncomeSource(source.id, { documentationMinutes: parseInt(e.target.value) || 0 })}
                                placeholder="10"
                                className="pr-12"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">min</span>
                            </div>
                          </div>

                          {/* Weekly Admin */}
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-nesso-ink/70">Admin hours</label>
                            <div className="relative">
                              <Input
                                type="number"
                                min={0}
                                max={40}
                                value={source.weeklyAdminHours || ''}
                                onChange={(e) => updateIncomeSource(source.id, { weeklyAdminHours: parseInt(e.target.value) || 0 })}
                                placeholder="3"
                                className="pr-12"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">hrs</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      )}

                      {/* Show Results Button - Only show after income is entered and results not yet shown */}
                      {isIncomeStepComplete(source) && !source.showResults && (
                        <div className="pt-4">
                          <button
                            type="button"
                            onClick={() => {
                              updateIncomeSource(source.id, { isCalculating: true });
                              // Simulate calculation delay for effect
                              setTimeout(() => {
                                updateIncomeSource(source.id, { isCalculating: false, showResults: true });
                              }, 1200);
                            }}
                            className="w-full py-3 px-6 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Show me my results
                          </button>
                        </div>
                      )}

                      {/* Mobile: Results Section (shown below inputs on mobile) */}
                      {source.isCalculating && (
                        <div className="lg:hidden pt-4 border-t-2 border-navy/20">
                          <LoadingResults />
                        </div>
                      )}
                      {source.showResults && !source.isCalculating && (
                        <div className="lg:hidden pt-4 border-t-2 border-navy/20">
                          <ResultsPanel source={source} sourceLabel={sourceLabel} />
                        </div>
                      )}
                    </div>

                    {/* Right Column: Results (Desktop only - sticky) */}
                    <div className="hidden lg:block lg:col-span-2">
                      <div className="sticky top-4">
                        {source.isCalculating ? (
                          <LoadingResults />
                        ) : source.showResults ? (
                          <ResultsPanel source={source} sourceLabel={sourceLabel} />
                        ) : (
                          <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-200 text-center">
                            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm text-gray-400">
                              {isIncomeStepComplete(source)
                                ? 'Click "Show me my results" to see your true hourly rate'
                                : 'Enter your income details to calculate your true hourly rate'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Add Income Source Button - Outside cards */}
          <button
            onClick={addIncomeSource}
            className="w-full py-3 px-4 bg-white border border-gray-200 hover:border-primary/50 hover:bg-primary/5 rounded-lg text-sm font-medium text-nesso-ink/70 hover:text-primary transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add another income source
          </button>

          {/* Combined Summary Panel - shown when 2+ income sources */}
          {incomeSources.length >= 2 && (
            <CombinedSummaryPanel sources={incomeSources} />
          )}

          {/* Nesso Mission Footer */}
          <div className="mt-6 mb-6 lg:mb-0">
            <div className="bg-nesso-navy/5 rounded-lg p-4 border border-nesso-navy/10">
              <p className="text-base text-center text-nesso-navy">
                This tool is a free service from <span className="font-semibold">Nesso</span>, a new kind of EHR built to help therapists grow their practice and grow as business owners.
                <br className="md:hidden" />
                <span className="hidden md:inline"> </span>
                <a
                  href="https://nessoapp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-nesso-navy underline hover:no-underline font-medium"
                >
                  Learn more
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="mb-20 lg:mb-0" style={{ backgroundColor: '#F4F7F3' }}>
        <div className="container mx-auto max-w-6xl px-4">
          <div className="rounded-lg py-4 px-4" style={{ backgroundColor: '#F4F7F3' }}>
            <div className="flex justify-center items-center space-x-8 text-sm">
              <a href="/privacy" className="text-nesso-ink/60 hover:text-nesso-navy transition-colors">
                Privacy
              </a>
              <a href="/terms" className="text-nesso-ink/60 hover:text-nesso-navy transition-colors">
                Terms
              </a>
              <div className="text-nesso-ink/50">
                © 2025 Nesso Labs, Inc
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4F7F3' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="h-8 w-64 bg-gray-200 rounded-lg mx-auto animate-pulse mb-8" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-lg p-6">
              <div className="lg:grid lg:grid-cols-5 lg:gap-6">
                <div className="lg:col-span-3 space-y-4">
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-20 bg-gray-100 rounded animate-pulse" />
                  <div className="h-32 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="hidden lg:block lg:col-span-2">
                  <div className="h-64 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TrueRatePage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <TrueRateContent />
    </Suspense>
  );
}
