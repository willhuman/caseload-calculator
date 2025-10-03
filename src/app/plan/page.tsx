'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { calculateGoalBasedPlan, formatCurrency, formatRange, type GoalBasedResults } from '@/lib/calculations';
import { trackEvent } from '@/lib/analytics';

export default function PlanPage() {
  // Input state
  const [monthlyIncome, setMonthlyIncome] = useState(9000);
  const [weeklyHours, setWeeklyHours] = useState(32);

  // Assumptions state
  const [sessionMinutes, setSessionMinutes] = useState(50);
  const [cancellationRate, setCancellationRate] = useState(10);
  const [docAndAdminMinutes, setDocAndAdminMinutes] = useState(20);

  // UI state
  const [hasCalculated, setHasCalculated] = useState(false);
  const [results, setResults] = useState<GoalBasedResults | null>(null);
  const [showAssumptions, setShowAssumptions] = useState(false);

  // Calculate results whenever inputs change (but only show after initial calculate)
  useEffect(() => {
    if (hasCalculated) {
      const newResults = calculateGoalBasedPlan({
        monthlyIncome,
        weeklyHours,
        sessionMinutes,
        docAndAdminMinutesPerClient: docAndAdminMinutes,
        cancellationRate: cancellationRate / 100
      });
      setResults(newResults);
    }
  }, [monthlyIncome, weeklyHours, sessionMinutes, docAndAdminMinutes, cancellationRate, hasCalculated]);

  const handleCalculate = () => {
    const calculatedResults = calculateGoalBasedPlan({
      monthlyIncome,
      weeklyHours,
      sessionMinutes,
      docAndAdminMinutesPerClient: docAndAdminMinutes,
      cancellationRate: cancellationRate / 100
    });
    setResults(calculatedResults);
    setHasCalculated(true);

    // Track analytics
    trackEvent({
      action: 'calculator_calculated',
      category: 'goal_based_calculator',
      data: {
        monthlyIncome,
        weeklyHours,
        sessionFee: calculatedResults.sessionFee,
        clientsPerWeek: calculatedResults.clientsPerWeek
      }
    });
  };

  const monthlyIncomeDisplay = formatCurrency(monthlyIncome);
  const sessionFeeDisplay = results ? formatCurrency(results.sessionFee) : '$0';
  const clientsDisplay = results ? formatRange(results.clientsPerWeekRange.low, results.clientsPerWeekRange.high) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-b from-nesso-sand/30 to-white">
      <Header />

      <main className="max-w-2xl mx-auto px-4 pt-8 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-nesso-ink mb-2">
            Time and Money Goals
          </h1>
          <p className="text-sm text-nesso-ink/70">
            Tell us what you want, and we&apos;ll show you what it takes.
          </p>
        </div>

        {/* Main Card */}
        <Card className="border border-nesso-navy/10 shadow-sm">
          <CardContent className="p-5 md:p-6 space-y-6">
            {/* Income Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  Monthly income goal
                </label>
                <div className="text-xl font-bold text-nesso-navy">
                  {monthlyIncomeDisplay}
                </div>
              </div>
              <Slider
                value={[monthlyIncome]}
                onValueChange={(value) => setMonthlyIncome(value[0])}
                min={3000}
                max={15000}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-nesso-ink/50">
                <span>$3,000</span>
                <span>$15,000</span>
              </div>
            </div>

            {/* Hours Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <span className="text-lg">⏰</span>
                  Weekly hours (Clients + Notes + Admin)
                </label>
                <div className="text-xl font-bold text-nesso-navy">
                  {weeklyHours} hrs
                </div>
              </div>
              <Slider
                value={[weeklyHours]}
                onValueChange={(value) => setWeeklyHours(value[0])}
                min={15}
                max={50}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-nesso-ink/50">
                <span>15 hours</span>
                <span>50 hours</span>
              </div>
            </div>

            {/* Calculate Button (shown only before first calculation) */}
            {!hasCalculated && (
              <Button
                onClick={handleCalculate}
                className="w-full py-4 text-sm bg-nesso-coral hover:bg-nesso-coral/90 text-black font-semibold rounded-lg transition-colors"
              >
                Calculate my plan →
              </Button>
            )}

            {/* Results (shown after calculation) */}
            {hasCalculated && results && (
              <div className="space-y-6 pt-4 border-t border-nesso-navy/10">
                {/* Big Numbers */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Session Fee */}
                  <div className="text-center space-y-1">
                    <div className="text-xs text-nesso-ink/60">Session Fee</div>
                    <div className="text-3xl font-bold text-nesso-navy">{sessionFeeDisplay}</div>
                  </div>

                  {/* Clients Per Week */}
                  <div className="text-center space-y-1">
                    <div className="text-xs text-nesso-ink/60">Clients Per Week</div>
                    <div className="text-3xl font-bold text-nesso-navy">{clientsDisplay}</div>
                  </div>
                </div>

                {/* Explanation Text */}
                <div className="bg-white/50 rounded-lg p-4 border border-nesso-navy/5 space-y-3">
                  <p className="text-sm text-nesso-ink/90 leading-relaxed">
                    To achieve your goal of <strong>{monthlyIncomeDisplay}</strong> per month working a maximum of <strong>{weeklyHours} hours per week</strong>, you need to charge <strong>{sessionFeeDisplay}</strong> per session and schedule <strong>{clientsDisplay} clients per week</strong> (assuming that {cancellationRate}% of those will likely cancel or reschedule).
                  </p>

                  {/* Industry Standards - Collapsible */}
                  <div className="border-t border-nesso-navy/10 pt-3">
                    <button
                      onClick={() => setShowAssumptions(!showAssumptions)}
                      className="flex items-center justify-between w-full text-left group"
                    >
                      <span className="text-xs font-medium text-nesso-ink/80 group-hover:text-nesso-navy transition-colors">
                        Industry-standard assumptions
                      </span>
                      <span className="text-nesso-ink/40 text-xs">
                        {showAssumptions ? '▼' : '▶'}
                      </span>
                    </button>

                    {showAssumptions && (
                      <div className="mt-3 space-y-3">
                        <p className="text-xs text-nesso-ink/60 leading-relaxed">
                          We&apos;re taking into account the following industry-standard assumptions to make this calculation:
                        </p>

                        {/* Session Length */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-nesso-ink/70">Session length (minutes)</label>
                            <span className="text-xs font-semibold text-nesso-navy">{sessionMinutes} min</span>
                          </div>
                          <Slider
                            value={[sessionMinutes]}
                            onValueChange={(value) => setSessionMinutes(value[0])}
                            min={30}
                            max={90}
                            step={5}
                            className="w-full"
                          />
                        </div>

                        {/* Cancellation Rate */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-nesso-ink/70">Cancellation rate</label>
                            <span className="text-xs font-semibold text-nesso-navy">{cancellationRate}%</span>
                          </div>
                          <Slider
                            value={[cancellationRate]}
                            onValueChange={(value) => setCancellationRate(value[0])}
                            min={0}
                            max={30}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        {/* Doc & Admin Time */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-nesso-ink/70">Documentation & admin time per client (minutes/week)</label>
                            <span className="text-xs font-semibold text-nesso-navy">{docAndAdminMinutes} min</span>
                          </div>
                          <Slider
                            value={[docAndAdminMinutes]}
                            onValueChange={(value) => setDocAndAdminMinutes(value[0])}
                            min={5}
                            max={60}
                            step={5}
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Week Breakdown */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-nesso-ink">Here&apos;s what your week would look like</h3>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center py-1.5 border-b border-nesso-navy/10">
                      <span className="text-xs text-nesso-ink/70">Client sessions</span>
                      <span className="text-xs font-medium text-nesso-navy">{results.breakdown.sessionHours}h</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-nesso-navy/10">
                      <span className="text-xs text-nesso-ink/70">Documentation & admin</span>
                      <span className="text-xs font-medium text-nesso-navy">{results.breakdown.docAndAdminHours}h</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 pt-2">
                      <span className="text-sm font-semibold text-nesso-ink">Total hours</span>
                      <span className="text-sm font-bold text-nesso-navy">{results.breakdown.totalHours}h</span>
                    </div>
                  </div>
                </div>

                {/* Start Over Button */}
                <div className="pt-3 border-t border-nesso-navy/10">
                  <Button
                    onClick={() => {
                      setHasCalculated(false);
                      setResults(null);
                      setShowAssumptions(false);
                    }}
                    variant="outline"
                    className="w-full py-2 text-xs border-nesso-navy/20 text-nesso-navy hover:bg-nesso-sand/30 transition-colors"
                  >
                    ← Start over
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="bg-nesso-card border-t border-black/5 py-8">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex justify-center space-x-8 text-sm text-gray-600">
              <a href="/privacy" className="text-nesso-ink/60 hover:text-nesso-navy transition-colors">
                Privacy
              </a>
              <a href="/terms" className="text-nesso-ink/60 hover:text-nesso-navy transition-colors">
                Terms
              </a>
            </div>
            <div className="text-sm text-nesso-ink/50">
              © 2025 Nesso Labs, Inc
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
