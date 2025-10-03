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
  const [cancellationsPerWeek, setCancellationsPerWeek] = useState(3);
  const [docAndAdminMinutes, setDocAndAdminMinutes] = useState(20);

  // UI state
  const [hasCalculated, setHasCalculated] = useState(false);
  const [results, setResults] = useState<GoalBasedResults | null>(null);

  // Calculate results whenever inputs change (but only show after initial calculate)
  useEffect(() => {
    if (hasCalculated) {
      const newResults = calculateGoalBasedPlan({
        monthlyIncome,
        weeklyHours,
        sessionMinutes,
        docAndAdminMinutesPerClient: docAndAdminMinutes,
        cancellationsPerWeek
      });
      setResults(newResults);
    }
  }, [monthlyIncome, weeklyHours, sessionMinutes, docAndAdminMinutes, cancellationsPerWeek, hasCalculated]);

  const handleCalculate = () => {
    const calculatedResults = calculateGoalBasedPlan({
      monthlyIncome,
      weeklyHours,
      sessionMinutes,
      docAndAdminMinutesPerClient: docAndAdminMinutes,
      cancellationsPerWeek
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
  const clientsDisplay = results ? results.clientsPerWeekRange.high.toString() : '0';

  return (
    <div className="min-h-screen bg-gradient-to-b from-nesso-sand/30 to-white">
      <Header />

      <main className="max-w-2xl mx-auto px-4 pt-8 pb-16">
        {/* Goals Card */}
        <Card className="border border-nesso-navy/10 shadow-sm mb-6">
          <CardContent className="p-5 md:p-6 space-y-6">
            {/* Time and Money Goals Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-nesso-ink">Time and Money Goals</h2>

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
                    Weekly work hours (Clients + Notes + Admin)
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
            </div>

            {/* Additional Info Section */}
            <div className="space-y-4 border-t border-nesso-navy/10 pt-6">
              <h2 className="text-lg font-semibold text-nesso-ink">Additional Info</h2>

              {/* Session Length */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-nesso-ink/70">Session length</label>
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

              {/* Cancellations Per Week */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-nesso-ink/70">Number of cancellations or no-shows in a typical week</label>
                  <span className="text-xs font-semibold text-nesso-navy">{cancellationsPerWeek}</span>
                </div>
                <Slider
                  value={[cancellationsPerWeek]}
                  onValueChange={(value) => setCancellationsPerWeek(value[0])}
                  min={0}
                  max={10}
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

            {/* Calculate Button (shown only before first calculation) */}
            {!hasCalculated && (
              <Button
                onClick={handleCalculate}
                className="w-full py-4 text-sm bg-nesso-coral hover:bg-nesso-coral/90 text-black font-semibold rounded-lg transition-colors"
              >
                Calculate my plan →
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results Card (shown after calculation) */}
        {hasCalculated && results && (
          <Card className="border border-nesso-navy/10 shadow-sm">
            <CardContent className="p-5 md:p-6 space-y-6">
              {/* Header */}
              <h2 className="text-xl font-bold text-nesso-ink">Caseload Plan</h2>

              {/* Your Goals Section */}
              <div className="bg-nesso-sand/20 rounded-lg p-4 border border-nesso-navy/10">
                <h3 className="text-sm font-semibold text-nesso-ink mb-3">Your Goals</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-base">💰</span>
                    <span className="text-nesso-ink/90">Earn <strong className="text-nesso-navy">{monthlyIncomeDisplay}/month</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-base">⏰</span>
                    <span className="text-nesso-ink/90">Work <strong className="text-nesso-navy">{weeklyHours} hours/week</strong></span>
                  </div>
                </div>
              </div>

              {/* Your Plan Section */}
              <div className="bg-white rounded-lg p-4 border border-nesso-navy/10">
                <h3 className="text-sm font-semibold text-nesso-ink mb-3">Your Plan</h3>
                <p className="text-sm text-nesso-ink/80 mb-3">To meet your goals, here&apos;s what you need to do:</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-nesso-navy font-bold">•</span>
                    <span className="text-nesso-ink/90">Charge <strong className="text-nesso-navy">{sessionFeeDisplay} per session</strong></span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-nesso-navy font-bold">•</span>
                    <span className="text-nesso-ink/90">Schedule <strong className="text-nesso-navy">{clientsDisplay} clients per week</strong>*</span>
                  </div>
                </div>
                <p className="text-xs text-nesso-ink/60 mt-3 italic">
                  *Accounting for {cancellationsPerWeek} expected cancellations/no-shows
                </p>

                {/* Summary Box */}
                <div className="mt-4 bg-nesso-sand/20 rounded-lg p-3 border border-nesso-navy/10">
                  <p className="text-xs font-medium text-nesso-ink/70 mb-2">Following this plan means:</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-base">📊</span>
                      <span className="text-nesso-ink/90"><strong className="text-nesso-navy">{results.breakdown.totalHours} hours</strong> of work per week</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-base">💵</span>
                      <span className="text-nesso-ink/90"><strong className="text-nesso-navy">{monthlyIncomeDisplay}</strong> in monthly revenue</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Your Week Breakdown Section */}
              <div className="bg-white rounded-lg p-4 border border-nesso-navy/10">
                <h3 className="text-sm font-semibold text-nesso-ink mb-3">Your Week Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-nesso-ink/70">Client Sessions ({Math.round(results.attendedSessionsPerWeek || 0)} sessions)</span>
                    <span className="font-semibold text-nesso-navy">{results.breakdown.sessionHours}h</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-nesso-ink/70">Documentation & Admin</span>
                    <span className="font-semibold text-nesso-navy">{results.breakdown.docAndAdminHours}h</span>
                  </div>
                  <div className="border-t border-nesso-navy/10 pt-2 mt-2"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-nesso-ink">Total Work Hours</span>
                    <span className="text-base font-bold text-nesso-navy">{results.breakdown.totalHours}h</span>
                  </div>
                </div>
              </div>

              {/* Start Over Button */}
              <div className="pt-2">
                <Button
                  onClick={() => {
                    setHasCalculated(false);
                    setResults(null);
                  }}
                  variant="outline"
                  className="w-full py-2 text-xs border-nesso-navy/20 text-nesso-navy hover:bg-nesso-sand/30 transition-colors"
                >
                  ← Start over
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
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
