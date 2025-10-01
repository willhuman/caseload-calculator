'use client';

import { useState } from 'react';
import { SustainabilityMeter } from './SustainabilityMeter';
import { CalculationResults, CalculationInputs, calculateCaseload, formatRange, formatCurrency, getCalculationBreakdown } from '@/lib/calculations';
import { analytics } from '@/lib/analytics';

interface ResultsGridProps {
  results: CalculationResults;
  originalInputs: CalculationInputs;
  onInputsChange: (inputs: CalculationInputs) => void;
}

export function ResultsGrid({ originalInputs, onInputsChange }: ResultsGridProps) {
  const [whatIfFee, setWhatIfFee] = useState(originalInputs.sessionFee);
  const [showCalculation, setShowCalculation] = useState(false);

  // Current working inputs (combines original inputs with goal changes and fee changes)
  const [currentInputs, setCurrentInputs] = useState(originalInputs);

  // Calculate what-if results with all current inputs
  const workingInputs = { ...currentInputs, sessionFee: whatIfFee };
  const whatIfResults = calculateCaseload(workingInputs);

  const handleSliderChange = (newFee: number) => {
    setWhatIfFee(newFee);

    if (newFee !== originalInputs.sessionFee) {
      analytics.sessionFeeSliderChanged(newFee);
    }
  };

  const handleGoalsChange = (weeklyHours: number, monthlyIncome: number) => {
    const newInputs = { ...currentInputs, weeklyHours, monthlyIncome };
    setCurrentInputs(newInputs);
    onInputsChange(newInputs);
  };

  const handleAllInputsChange = (weeklyHours: number, monthlyIncome: number, sessionFee: number, weeklyCancellations: number) => {
    const newInputs = { ...currentInputs, weeklyHours, monthlyIncome, sessionFee, noShowRate: weeklyCancellations };
    setCurrentInputs(newInputs);
    setWhatIfFee(sessionFee);
    onInputsChange(newInputs);
  };

  const handleEmailReport = () => {
    analytics.emailReportOpened();
    // This will be handled by the parent component
    const event = new CustomEvent('openEmailModal');
    window.dispatchEvent(event);
  };

  const handleRestart = () => {
    // This will be handled by the parent component
    const event = new CustomEvent('restartCalculator');
    window.dispatchEvent(event);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Single Clean Results Card */}
      <div className="bg-nesso-card rounded-2xl ring-1 ring-black/5 shadow-sm p-8 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700"
           style={{ opacity: 1 }}>

        {/* Caseload and Revenue */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-medium text-nesso-navy mb-2">Weekly caseload needed</h3>
            <div className="text-3xl font-semibold text-nesso-navy mb-1">
              {formatRange(whatIfResults.caseloadRange.low, whatIfResults.caseloadRange.high, ' clients')}
            </div>
            <p className="text-sm text-nesso-ink/60">
              To meet your monthly income goal of {formatCurrency(currentInputs.monthlyIncome)} in {currentInputs.weeklyHours}hrs/week, you&apos;d need {formatRange(whatIfResults.caseloadRange.low, whatIfResults.caseloadRange.high)} clients per week at {formatCurrency(whatIfFee)}.
            </p>
          </div>

          <div className="text-center md:text-left">
            <h3 className="text-lg font-medium text-nesso-navy mb-2">Actual revenue projection</h3>
            <div className="text-3xl font-semibold text-nesso-navy mb-1">
              {formatCurrency(whatIfResults.revenueProjection)}
            </div>
            <p className="text-sm text-nesso-ink/60">per month</p>
          </div>
        </div>

        {/* Workload vs Goal Bar */}
        <div>
          <SustainabilityMeter
            targetHours={currentInputs.weeklyHours}
            sessionHours={whatIfResults.sessionHours}
            docHours={whatIfResults.docHours}
            totalHours={whatIfResults.totalHours}
            monthlyIncome={currentInputs.monthlyIncome}
            sessionFee={currentInputs.sessionFee}
            weeklyCancellations={currentInputs.noShowRate}
            currentSessionFee={whatIfFee}
            originalSessionFee={originalInputs.sessionFee}
            onSessionFeeChange={handleSliderChange}
            onGoalsChange={handleGoalsChange}
            onInputsChange={handleAllInputsChange}
            previewResults={whatIfFee !== originalInputs.sessionFee ? {
              caseloadRange: whatIfResults.caseloadRange,
              revenueProjection: whatIfResults.revenueProjection
            } : undefined}
          />
        </div>

        {/* Show Calculation Button */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowCalculation(!showCalculation)}
            className="text-sm text-nesso-purple hover:text-nesso-purple/80 transition-colors underline decoration-dotted underline-offset-4"
          >
            {showCalculation ? 'Hide calculation' : 'Show calculation'}
          </button>
        </div>

        {/* Calculation Breakdown */}
        {showCalculation && (
          <div className="mt-6 p-4 sm:p-6 bg-nesso-navy/5 rounded-xl w-full">
            <h4 className="font-semibold text-nesso-navy mb-4 text-sm sm:text-base">How we calculated this</h4>
            <ul className="space-y-3 sm:space-y-4 text-sm text-nesso-navy">
              {getCalculationBreakdown(currentInputs, whatIfResults).map((step) => (
                <li key={step.step} className="w-full">
                  {/* Mobile: Stack vertically */}
                  <div className="flex flex-col gap-1 sm:hidden">
                    <span className="font-semibold text-nesso-navy">
                      • {step.label}:
                    </span>
                    <span className="text-nesso-navy/90 leading-relaxed">
                      {step.result}
                    </span>
                  </div>

                  {/* Desktop: Side by side with proper wrapping */}
                  <div className="hidden sm:flex sm:items-start sm:gap-3">
                    <span className="font-semibold flex-shrink-0 min-w-fit">
                      • {step.label}:
                    </span>
                    <span className="flex-1 leading-relaxed">
                      {step.result}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer CTAs */}
      <div className="flex justify-center gap-4 flex-wrap">
        <button
          onClick={handleRestart}
          className="px-8 py-3 text-base rounded-xl border border-nesso-navy/20 text-nesso-navy hover:bg-nesso-navy/5 transition-colors focus:ring-2 focus:ring-nesso-navy/20"
        >
          Adjust goals
        </button>
        <button
          onClick={handleEmailReport}
          className="px-8 py-3 text-base rounded-xl bg-nesso-coral hover:bg-nesso-coral/90 text-black font-medium shadow-sm transition-colors focus:ring-2 focus:ring-nesso-coral"
        >
          Email me my caseload plan
        </button>
      </div>
    </div>
  );
}