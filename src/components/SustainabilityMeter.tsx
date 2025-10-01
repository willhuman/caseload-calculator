import { useState, useEffect, useCallback } from 'react';
// import { Slider } from '@/components/ui/slider';
// import { formatCurrency, formatRange } from '@/lib/calculations';

interface SustainabilityMeterProps {
  targetHours: number;
  sessionHours: number;
  docHours: number;
  totalHours: number;
  monthlyIncome: number;
  sessionFee: number;
  weeklyCancellations: number;
  // Props for session fee variation
  currentSessionFee: number;
  originalSessionFee: number;
  onSessionFeeChange: (fee: number) => void;
  onGoalsChange: (weeklyHours: number, monthlyIncome: number) => void;
  onInputsChange: (weeklyHours: number, monthlyIncome: number, sessionFee: number, weeklyCancellations: number) => void;
  previewResults?: {
    caseloadRange: { low: number; high: number };
    revenueProjection: number;
  };
}

export function SustainabilityMeter({
  targetHours,
  sessionHours,
  docHours,
  totalHours,
  monthlyIncome,
  sessionFee,
  weeklyCancellations,
  // currentSessionFee,
  // originalSessionFee,
  onSessionFeeChange,
  // onGoalsChange,
  onInputsChange,
  // previewResults
}: SustainabilityMeterProps) {
  // Local state for all editable inputs with debouncing
  const [localWeeklyHours, setLocalWeeklyHours] = useState(targetHours);
  const [localMonthlyIncome, setLocalMonthlyIncome] = useState(monthlyIncome);
  const [localSessionFee, setLocalSessionFee] = useState(sessionFee);
  const [localWeeklyCancellations, setLocalWeeklyCancellations] = useState(weeklyCancellations);
  const [showInputsPanel, setShowInputsPanel] = useState(false);

  // Debounced callback for all input changes (simplified inline version)
  const debouncedInputsChange = useCallback((weeklyHours: number, income: number, fee: number, cancellations: number) => {
    const timeout = setTimeout(() => {
      onInputsChange(weeklyHours, income, fee, cancellations);
    }, 300);
    return () => clearTimeout(timeout);
  }, [onInputsChange]);

  // Update local state when props change
  useEffect(() => {
    setLocalWeeklyHours(targetHours);
  }, [targetHours]);

  useEffect(() => {
    setLocalMonthlyIncome(monthlyIncome);
  }, [monthlyIncome]);

  useEffect(() => {
    setLocalSessionFee(sessionFee);
  }, [sessionFee]);

  useEffect(() => {
    setLocalWeeklyCancellations(weeklyCancellations);
  }, [weeklyCancellations]);

  // Handle input changes with validation
  const handleWeeklyHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(5, Math.min(80, parseFloat(e.target.value) || 0));
    setLocalWeeklyHours(value);
    debouncedInputsChange(value, localMonthlyIncome, localSessionFee, localWeeklyCancellations);
  };

  const handleMonthlyIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0);
    setLocalMonthlyIncome(value);
    debouncedInputsChange(localWeeklyHours, value, localSessionFee, localWeeklyCancellations);
  };

  const handleSessionFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0);
    setLocalSessionFee(value);
    // Also update the slider state
    onSessionFeeChange(value);
    debouncedInputsChange(localWeeklyHours, localMonthlyIncome, value, localWeeklyCancellations);
  };

  const handleWeeklyCancellationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Math.min(20, parseInt(e.target.value) || 0));
    setLocalWeeklyCancellations(value);
    debouncedInputsChange(localWeeklyHours, localMonthlyIncome, localSessionFee, value);
  };

  // Calculate new status based on updated requirements
  const getStatus = () => {
    if (totalHours <= 0.7 * targetHours) return 'under-goal';
    if (totalHours <= targetHours) return 'sustainable';
    return 'over-goal';
  };

  const currentStatus = getStatus();

  const getStatusText = () => {
    switch (currentStatus) {
      case 'sustainable':
        return 'Balanced';
      case 'over-goal':
        return 'Not sustainable';
      case 'under-goal':
        return 'Room to spare';
    }
  };


  // Calculate message variables
  const hoursLeft = Math.max(targetHours - totalHours, 0);
  const hoursOver = Math.max(totalHours - targetHours, 0);

  const getStatusMessage = () => {
    switch (currentStatus) {
      case 'under-goal':
        return `This plan uses about ${totalHours.toFixed(1)}h, leaving ${hoursLeft.toFixed(1)}h within your ${targetHours}h goal.`;
      case 'sustainable':
        return `This plan fits within your ${targetHours}h goal. Right on target.`;
      case 'over-goal':
        return `This plan requires ${totalHours.toFixed(1)}h, which is ${hoursOver.toFixed(1)}h over your ${targetHours}h goal.`;
    }
  };

  // Enhanced accessibility announcement
  const getAccessibilityAnnouncement = () => {
    const statusText = getStatusText();
    const baseAnnouncement = `Projected workload ${totalHours.toFixed(1)} hours. Goal ${targetHours} hours.`;

    switch (currentStatus) {
      case 'under-goal':
        return `${baseAnnouncement} You have ${hoursLeft.toFixed(1)} hours available. Status: ${statusText}.`;
      case 'sustainable':
        return `${baseAnnouncement} You are right on target. Status: ${statusText}.`;
      case 'over-goal':
        return `${baseAnnouncement} You are ${hoursOver.toFixed(1)} hours over. Status: ${statusText}.`;
    }
  };

  // Calculate bar fill percentages
  const sessionPercentage = Math.min((sessionHours / targetHours) * 100, 100);
  const docPercentage = Math.min((docHours / targetHours) * 100, 100 - sessionPercentage);
  const isOverGoal = totalHours > targetHours;

  return (
    <div className="space-y-4">
      {/* Comprehensive Inputs Panel */}
      <div className="md:hidden">
        {/* Mobile: Collapsed summary with toggle */}
        <button
          onClick={() => setShowInputsPanel(!showInputsPanel)}
          className="w-full flex items-center justify-between p-3 bg-nesso-navy/5 rounded-lg text-sm font-medium text-nesso-navy"
          aria-expanded={showInputsPanel}
        >
          <span>Edit inputs</span>
          <span className={`transform transition-transform ${showInputsPanel ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {showInputsPanel && (
          <div className="mt-3 space-y-3 p-4 bg-nesso-navy/5 rounded-lg">
            {/* Mobile: Stacked inputs */}
            <div className="space-y-3">
              <div>
                <label htmlFor="weekly-hours-mobile" className="block text-sm font-medium text-nesso-navy mb-1">
                  Weekly work hours
                </label>
                <input
                  id="weekly-hours-mobile"
                  type="number"
                  min="5"
                  max="80"
                  step="1"
                  value={localWeeklyHours}
                  onChange={handleWeeklyHoursChange}
                  className="w-full px-3 py-2 text-sm border border-nesso-navy/20 rounded focus:border-nesso-peach focus:outline-none"
                  aria-label="Weekly work hours"
                />
              </div>

              <div>
                <label htmlFor="monthly-income-mobile" className="block text-sm font-medium text-nesso-navy mb-1">
                  Desired monthly income
                </label>
                <input
                  id="monthly-income-mobile"
                  type="text"
                  value={`$${localMonthlyIncome.toLocaleString()}`}
                  onChange={handleMonthlyIncomeChange}
                  className="w-full px-3 py-2 text-sm border border-nesso-navy/20 rounded focus:border-nesso-peach focus:outline-none"
                  aria-label="Desired monthly income goal"
                />
              </div>

              <div>
                <label htmlFor="session-fee-mobile" className="block text-sm font-medium text-nesso-navy mb-1">
                  Current session fee
                </label>
                <input
                  id="session-fee-mobile"
                  type="text"
                  value={`$${localSessionFee.toLocaleString()}`}
                  onChange={handleSessionFeeChange}
                  className="w-full px-3 py-2 text-sm border border-nesso-navy/20 rounded focus:border-nesso-peach focus:outline-none"
                  aria-label="Current session fee"
                />
              </div>

              <div>
                <label htmlFor="weekly-cancellations-mobile" className="block text-sm font-medium text-nesso-navy mb-1">
                  In a typical week, how many clients cancel or no-show?
                </label>
                <input
                  id="weekly-cancellations-mobile"
                  type="number"
                  min="0"
                  max="20"
                  step="1"
                  value={localWeeklyCancellations}
                  onChange={handleWeeklyCancellationsChange}
                  className="w-full px-3 py-2 text-sm border border-nesso-navy/20 rounded focus:border-nesso-peach focus:outline-none"
                  aria-label="Weekly cancellations and no-shows"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop: 2x2 Grid */}
      <div className="hidden md:grid md:grid-cols-2 gap-4 p-4 bg-nesso-navy/5 rounded-lg">
        <div>
          <label htmlFor="weekly-hours-desktop" className="block text-sm font-medium text-nesso-navy mb-1">
            Weekly work hours
          </label>
          <input
            id="weekly-hours-desktop"
            type="number"
            min="5"
            max="80"
            step="1"
            value={localWeeklyHours}
            onChange={handleWeeklyHoursChange}
            className="w-full px-3 py-2 text-sm border border-nesso-navy/20 rounded focus:border-nesso-peach focus:outline-none"
            aria-label="Weekly work hours"
          />
        </div>

        <div>
          <label htmlFor="monthly-income-desktop" className="block text-sm font-medium text-nesso-navy mb-1">
            Monthly income
          </label>
          <input
            id="monthly-income-desktop"
            type="text"
            value={`$${localMonthlyIncome.toLocaleString()}`}
            onChange={handleMonthlyIncomeChange}
            className="w-full px-3 py-2 text-sm border border-nesso-navy/20 rounded focus:border-nesso-peach focus:outline-none"
            aria-label="Monthly income goal"
          />
        </div>

        <div>
          <label htmlFor="session-fee-desktop" className="block text-sm font-medium text-nesso-navy mb-1">
            Current session fee
          </label>
          <input
            id="session-fee-desktop"
            type="text"
            value={`$${localSessionFee.toLocaleString()}`}
            onChange={handleSessionFeeChange}
            className="w-full px-3 py-2 text-sm border border-nesso-navy/20 rounded focus:border-nesso-peach focus:outline-none"
            aria-label="Current session fee"
          />
        </div>

        <div>
          <label htmlFor="weekly-cancellations-desktop" className="block text-sm font-medium text-nesso-navy mb-1">
            In a typical week, how many clients cancel or no-show?
          </label>
          <input
            id="weekly-cancellations-desktop"
            type="number"
            min="0"
            max="20"
            step="1"
            value={localWeeklyCancellations}
            onChange={handleWeeklyCancellationsChange}
            className="w-full px-3 py-2 text-sm border border-nesso-navy/20 rounded focus:border-nesso-peach focus:outline-none"
            aria-label="Weekly cancellations and no-shows"
          />
        </div>
      </div>

      {/* Self-explanatory workload bar */}
      <div className="space-y-3">
        {/* Container with fixed width to prevent overflow */}
        <div className="relative w-full">
          {/* Bar container with overflow containment */}
          <div className="relative w-full h-8 overflow-hidden">
            {/* Base bar track representing the weekly goal */}
            <div className="absolute inset-0 bg-nesso-navy/10 rounded-md" />

            {/* Progress fill container - controlled overflow */}
            <div className="relative h-full flex overflow-hidden">
              {/* Sessions segment A */}
              <div
                className="bg-nesso-coral flex items-center justify-center text-black text-xs font-medium min-w-0 relative"
                style={{
                  width: `${(sessionHours / targetHours) * 100}%`,
                }}
                title={`Sessions: ${sessionHours.toFixed(1)}h`}
              >
                {/* Desktop: inline label */}
                <span className="hidden md:block text-xs font-medium truncate">
                  {sessionHours > 3 && sessionPercentage > 20 ? `Sessions ${sessionHours.toFixed(1)}h` : ''}
                </span>
              </div>

              {/* Documentation segment B */}
              <div
                className="bg-nesso-purple flex items-center justify-center text-white text-xs font-medium min-w-0 relative"
                style={{
                  width: `${(docHours / targetHours) * 100}%`,
                }}
                title={`Documentation: ${docHours.toFixed(1)}h`}
              >
                {/* Desktop: inline label */}
                <span className="hidden md:block text-xs font-medium truncate">
                  {docHours > 2 && docPercentage > 15 ? `Documentation ${docHours.toFixed(1)}h` : ''}
                </span>
              </div>
            </div>

            {/* Overflow indicator - absolutely positioned */}
            {isOverGoal && (
              <div
                className="absolute top-0 bg-red-500 h-full flex items-center justify-center text-white text-xs font-medium"
                style={{
                  left: '100%',
                  width: `${Math.min(((totalHours - targetHours) / targetHours) * 100, 50)}%`,
                }}
                title={`Over goal by ${hoursOver.toFixed(1)}h`}
              >
                <span className="text-xs font-medium">Over</span>
              </div>
            )}
          </div>

          {/* Fixed edge labels */}
          <div className="flex justify-between items-center mt-1">
            <div className="text-xs text-nesso-ink/60 font-medium">0hrs</div>
            <div className="text-xs text-nesso-ink/60 font-medium">Goal: {targetHours}hrs</div>
          </div>

          {/* Legend under the bar */}
          <div className="mt-3 flex flex-wrap gap-4 justify-center text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-nesso-coral rounded-sm"></div>
              <span>Sessions {sessionHours.toFixed(1)}h</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-nesso-purple rounded-sm"></div>
              <span>Documentation time {docHours.toFixed(1)}h</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-nesso-navy/20 rounded-sm"></div>
              <span>Available hours {Math.max(0, targetHours - totalHours).toFixed(1)}h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Single insight sentence with enhanced aria-live */}
      <div
        className="text-sm text-nesso-ink/80"
        aria-live="polite"
        aria-atomic="true"
        aria-label={`Projected ${totalHours.toFixed(1)} hours of ${targetHours} hour goal`}
      >
        <div className="flex items-start gap-3">
          <p className="flex-1">{getStatusMessage()}</p>
          <div className={`
            inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0
            ${currentStatus === 'under-goal' ? 'bg-green-100 text-green-800' : ''}
            ${currentStatus === 'sustainable' ? 'bg-blue-100 text-blue-800' : ''}
            ${currentStatus === 'over-goal' ? 'bg-red-100 text-red-800' : ''}
          `}>
            {getStatusText()}
          </div>
        </div>
        {/* Documentation note with info icon */}
        <div className="flex items-center gap-2 mt-2 text-xs text-nesso-ink/60">
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v1.75a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 8h-1.5Z" clipRule="evenodd" />
          </svg>
          <span>This assumes 20 minutes per client per week for documentation.</span>
        </div>
        {/* Hidden accessibility announcement for screen readers */}
        <span className="sr-only">
          {getAccessibilityAnnouncement()}. Sessions take {sessionHours.toFixed(1)} hours, documentation takes {docHours.toFixed(1)} hours.
        </span>
      </div>

    </div>
  );
}