'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
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
type PayType = 'salary' | 'hourly' | 'per-session';
type TaxStatus = 'w2' | '1099';
type IncomeSourceType = 'private-practice' | 'group-practice' | 'agency' | 'workshops' | 'supervision' | 'coaching' | 'other';

const INCOME_SOURCE_OPTIONS: { value: IncomeSourceType; label: string }[] = [
  { value: 'private-practice', label: 'Private Practice' },
  { value: 'group-practice', label: 'Group Practice' },
  { value: 'agency', label: 'Agency Work' },
  { value: 'workshops', label: 'Workshops' },
  { value: 'supervision', label: 'Supervision' },
  { value: 'coaching', label: 'Coaching' },
  { value: 'other', label: 'Other' },
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
  payType: PayType;
  taxStatus: TaxStatus;
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
  sourceType: 'private-practice',
  payType: 'per-session',
  taxStatus: '1099',
  sessionsPerWeek: 0,
  ratePerSession: 0,
  rateTiers: [createRateTier('Full rate')],
  sessionLengthMinutes: 50,
  documentationMinutes: 10,
  weeklyAdminHours: 3,
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

// Results Panel Component
function ResultsPanel({ source, sourceLabel }: { source: IncomeSource; sourceLabel: string }) {
  const [hoursExpanded, setHoursExpanded] = useState(false);
  const results = calculateSourceResults(source);
  const is1099 = source.taxStatus === '1099';

  return (
    <div className="bg-[#E0EAE0] rounded-lg p-4 space-y-3">
      <h3 className="text-base font-semibold text-nesso-ink">
        {sourceLabel} Results
      </h3>

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
                  Self-employment tax covers Social Security (12.4%) and Medicare (2.9%) that W-2 employees split with their employer. When you're self-employed or a 1099 contractor, you pay both portions.
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

      {/* Divider */}
      <div className="h-px bg-navy/30" />

      {/* True Hourly Rate - The Result */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-navy">True hourly rate</span>
          <span className="text-xl font-bold text-navy">
            {formatCurrency(results.trueHourlyRate, true)}
          </span>
        </div>
        <div className="text-xs text-gray-500 text-right">
          {formatCurrency(results.effectiveWeeklyIncome)} ÷ {results.totalWeeklyHours.toFixed(1)}h
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
  const [hoursExpanded, setHoursExpanded] = useState(false);
  const combined = calculateCombinedResults(sources);
  const { totals, blendedHourlyRate, sortedByRate } = combined;

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

  return (
    <Card className="border-2 border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Combined Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Combined Results */}
        <div className="bg-white rounded-lg p-4 space-y-3">
          {/* Total Weekly Income */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Total weekly income</span>
            <span className="font-medium text-navy">{formatCurrency(totals.weeklyIncome)}</span>
          </div>

          {/* SE Taxes - if any */}
          {totals.weeklySETax > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">SE taxes</span>
              <span className="font-medium text-red-600">-{formatCurrency(totals.weeklySETax)}</span>
            </div>
          )}

          {/* Net Weekly Income */}
          {totals.weeklySETax > 0 && (
            <>
              <div className="h-px bg-navy/20" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Net weekly income</span>
                <span className="font-medium text-navy">{formatCurrency(totals.effectiveWeeklyIncome)}</span>
              </div>
            </>
          )}

          {/* Total Work Hours - Expandable */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setHoursExpanded(!hoursExpanded)}
              className="w-full flex justify-between items-center text-left hover:bg-navy/5 -mx-1 px-1 py-0.5 rounded transition-colors text-sm"
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
              <span className="font-medium text-navy">{totals.totalWeeklyHours.toFixed(1)}h</span>
            </button>

            {/* Expanded Hours Breakdown by Source */}
            {hoursExpanded && (
              <div className="mt-2 ml-2 pl-2 border-l-2 border-navy/10 space-y-1 text-xs">
                {hoursBySource.map(({ label, hours, percentage }) => (
                  <div key={label} className="flex justify-between items-center text-gray-500">
                    <span>{label}</span>
                    <span>{hours.toFixed(1)}h ({percentage.toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-navy/30" />

          {/* Blended True Hourly Rate */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-navy">Blended hourly rate</span>
              <span className="text-xl font-bold text-navy">
                {formatCurrency(blendedHourlyRate, true)}
              </span>
            </div>
            <div className="text-xs text-gray-500 text-right">
              {formatCurrency(totals.effectiveWeeklyIncome)} ÷ {totals.totalWeeklyHours.toFixed(1)}h
            </div>
          </div>
        </div>

        {/* Per-Source Comparison */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-nesso-ink">Rate by source</h4>
          <div className="space-y-2">
            {sortedByRate.map(({ label, results }, index) => (
              <div
                key={label}
                className={`flex justify-between items-center text-sm p-2 rounded-md ${
                  index === 0 && results.trueHourlyRate > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                }`}
              >
                <span className="text-gray-700 flex items-center gap-1.5">
                  {index === 0 && results.trueHourlyRate > 0 && (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  )}
                  {label}
                </span>
                <span className={`font-semibold ${index === 0 && results.trueHourlyRate > 0 ? 'text-green-700' : 'text-navy'}`}>
                  {formatCurrency(results.trueHourlyRate, true)}/hr
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        {hasMultipleRates && rateDifference > 5 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
            <h4 className="text-sm font-semibold text-amber-800 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Insight
            </h4>
            <p className="text-sm text-amber-900">
              Your <span className="font-semibold">{highestPaying.label}</span> pays{' '}
              <span className="font-semibold">{formatCurrency(rateDifference, true)}/hr more</span> than {lowestPaying.label}.
              {highestPaying.results.totalWeeklyHours < lowestPaying.results.totalWeeklyHours && (
                <> Shifting more hours to {highestPaying.label} could increase your overall earnings.</>
              )}
            </p>
          </div>
        )}

        {/* Tax Note */}
        <p className="text-xs text-navy/60">
          Federal and state income taxes not included.
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
          {incomeSources.map((source, index) => {
            const sourceLabel = INCOME_SOURCE_OPTIONS.find(o => o.value === source.sourceType)?.label || 'Income Source';
            const isSelfEmployed = source.sourceType === 'private-practice';

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
                      {/* Income Details Section */}
                      <div className="space-y-4 lg:space-y-3">
                        {/* Source Type */}
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-nesso-ink/70">Type of work</label>
                          <select
                            value={source.sourceType}
                            onChange={(e) => {
                              const newType = e.target.value as IncomeSourceType;
                              if (newType === 'private-practice') {
                                updateIncomeSource(source.id, {
                                  sourceType: newType,
                                  taxStatus: '1099',
                                  payType: 'per-session'
                                });
                              } else {
                                updateIncomeSource(source.id, { sourceType: newType });
                              }
                            }}
                            className="w-full h-11 lg:h-9 px-3 py-2 lg:py-1.5 text-base md:text-sm rounded-md border border-input bg-transparent shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                          >
                            {INCOME_SOURCE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Private Practice - Rate Tiers UI */}
                        {isSelfEmployed ? (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">
                                Self-employed
                              </span>
                            </div>

                            {/* Rate Tiers */}
                            <div className="space-y-3">
                              {source.rateTiers.map((tier, tierIndex) => (
                                <div key={tier.id} className="space-y-2">
                                  {/* Tier header with label and remove button */}
                                  <div className="flex items-center justify-between">
                                    {tierIndex === 0 ? (
                                      <span className="text-xs font-medium text-nesso-ink/70">
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
                                        className="text-xs font-medium text-nesso-ink/70 bg-transparent border-b border-dashed border-gray-300 focus:border-primary px-0.5 py-0.5 focus:outline-none focus:ring-0"
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
                                    <div className="space-y-1">
                                      <label className="text-xs font-medium text-nesso-ink/50">
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
                                    <div className="space-y-1">
                                      <label className="text-xs font-medium text-nesso-ink/50">Sessions/week</label>
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
                              <div className="flex justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const suggestedLabels = ['Reduced rate', 'Sliding scale', 'Insurance rate', 'Pro bono'];
                                    const usedLabels = source.rateTiers.map(t => t.label);
                                    const nextLabel = suggestedLabels.find(l => !usedLabels.includes(l)) || `Rate ${source.rateTiers.length + 1}`;
                                    const updatedTiers = [...source.rateTiers, createRateTier(nextLabel)];
                                    updateIncomeSource(source.id, { rateTiers: updatedTiers });
                                  }}
                                  className="text-xs font-medium text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                  Add additional rate
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Tax Status */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-nesso-ink/70">Employment type</label>
                              <div className="grid grid-cols-2 gap-2">
                                {(['w2', '1099'] as TaxStatus[]).map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => updateIncomeSource(source.id, { taxStatus: status })}
                                    className={`py-2 px-3 rounded-md border text-sm font-medium transition-all ${
                                      source.taxStatus === status
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-gray-200 hover:border-gray-300 text-nesso-ink'
                                    }`}
                                  >
                                    {status === 'w2' ? 'W-2 Employee' : '1099 Contractor'}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Pay Type */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-nesso-ink/70">How are you paid?</label>
                              <div className="grid grid-cols-3 gap-2">
                                {([
                                  { value: 'salary', label: 'Salary' },
                                  { value: 'hourly', label: 'Hourly' },
                                  { value: 'per-session', label: 'Per Session' },
                                ] as { value: PayType; label: string }[]).map((option) => (
                                  <button
                                    key={option.value}
                                    onClick={() => updateIncomeSource(source.id, { payType: option.value })}
                                    className={`py-2 px-3 rounded-md border text-sm font-medium transition-all ${
                                      source.payType === option.value
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-gray-200 hover:border-gray-300 text-nesso-ink'
                                    }`}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Pay Details */}
                            {source.payType === 'salary' && (
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-xs font-medium text-nesso-ink/70">Annual salary</label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <Input
                                      type="number"
                                      min={0}
                                      className="pl-7"
                                      value={source.annualSalary || ''}
                                      onChange={(e) => updateIncomeSource(source.id, { annualSalary: parseFloat(e.target.value) || 0 })}
                                      placeholder="60000"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-medium text-nesso-ink/70">Sessions/week</label>
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
                                <div className="space-y-1">
                                  <label className="text-xs font-medium text-nesso-ink/70">Hourly rate</label>
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
                                <div className="space-y-1">
                                  <label className="text-xs font-medium text-nesso-ink/70">Hours/week</label>
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
                                <div className="space-y-1">
                                  <label className="text-xs font-medium text-nesso-ink/70">Rate per session</label>
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
                                <div className="space-y-1">
                                  <label className="text-xs font-medium text-nesso-ink/70">Sessions/week</label>
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

                      {/* Your Time Section */}
                      <div className="pt-4 lg:pt-3 border-t border-sand space-y-4 lg:space-y-2.5">
                        <h3 className="text-base font-semibold text-nesso-ink">Your Time</h3>

                        {/* Session Length */}
                        <div className="space-y-3 lg:space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Average session length</label>
                            <div className="text-xl lg:text-base font-bold text-nesso-navy">
                              {source.sessionLengthMinutes} min
                            </div>
                          </div>
                          <Slider
                            value={[source.sessionLengthMinutes]}
                            onValueChange={(v) => updateIncomeSource(source.id, { sessionLengthMinutes: v[0] })}
                            min={30}
                            max={90}
                            step={5}
                          />
                          <div className="flex justify-between text-xs text-nesso-ink/50">
                            <span>30 min</span>
                            <span>90 min</span>
                          </div>
                        </div>
                      </div>

                      {/* Assumptions Section */}
                      <div className="pt-4 lg:pt-3 border-t border-sand space-y-4 lg:space-y-2">
                        <h3 className="text-base font-semibold text-nesso-ink">Assumptions</h3>

                        {/* Documentation Time */}
                        <div className="space-y-1.5 lg:space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-nesso-ink/70">Documentation time per session</label>
                            <span className="text-xs font-semibold text-nesso-navy">{source.documentationMinutes} min</span>
                          </div>
                          <Slider
                            value={[source.documentationMinutes]}
                            onValueChange={(v) => updateIncomeSource(source.id, { documentationMinutes: v[0] })}
                            min={0}
                            max={30}
                            step={5}
                          />
                        </div>

                        {/* Weekly Admin */}
                        <div className="space-y-1.5 lg:space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-nesso-ink/70">Weekly admin hours</label>
                            <span className="text-xs font-semibold text-nesso-navy">{source.weeklyAdminHours} hrs</span>
                          </div>
                          <Slider
                            value={[source.weeklyAdminHours]}
                            onValueChange={(v) => updateIncomeSource(source.id, { weeklyAdminHours: v[0] })}
                            min={0}
                            max={15}
                            step={1}
                          />
                        </div>
                      </div>

                      {/* Mobile: Results Section (shown below inputs on mobile) */}
                      <div className="lg:hidden pt-4 border-t-2 border-navy/20">
                        <ResultsPanel source={source} sourceLabel={sourceLabel} />
                      </div>

                      {/* Mobile: Add Another Source button */}
                      {index === incomeSources.length - 1 && (
                        <div className="lg:hidden flex justify-end pt-4 mt-4">
                          <button
                            onClick={addIncomeSource}
                            className="text-xs font-medium text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add income source
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Results (Desktop only - sticky) */}
                    <div className="hidden lg:flex lg:flex-col lg:col-span-2">
                      <div className="sticky top-4">
                        <ResultsPanel source={source} sourceLabel={sourceLabel} />
                      </div>

                      {/* Desktop: Add Another Source button - bottom right of card */}
                      {index === incomeSources.length - 1 && (
                        <div className="flex justify-end mt-auto pt-4">
                          <button
                            onClick={addIncomeSource}
                            className="text-xs font-medium text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add income source
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Combined Summary Panel - shown when 2+ income sources */}
          {incomeSources.length >= 2 && (
            <CombinedSummaryPanel sources={incomeSources} />
          )}

          {/* Nesso Mission Footer */}
          <div className="mt-6 mb-6 lg:mb-0">
            <div className="bg-nesso-navy/5 rounded-lg p-4 border border-nesso-navy/10">
              <p className="text-base text-center text-nesso-navy">
                This planning tool is a free service from <span className="font-semibold">Nesso</span>, a new kind of EHR built to help therapists grow their practice and grow as business owners.
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
