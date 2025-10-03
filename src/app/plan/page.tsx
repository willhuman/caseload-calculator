'use client';

import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { calculateGoalBasedPlan, formatCurrency, type GoalBasedResults } from '@/lib/calculations';
import { trackEvent } from '@/lib/analytics';

export default function PlanPage() {
  // Input state
  const [monthlyIncome, setMonthlyIncome] = useState(16000);
  const [weeklyHours, setWeeklyHours] = useState(30);

  // Assumptions state
  const [sessionMinutes, setSessionMinutes] = useState(50);
  const [cancellationRate, setCancellationRate] = useState(10); // Percentage (10%)
  const [docAndAdminMinutes, setDocAndAdminMinutes] = useState(20);

  // UI state
  const [hasCalculated, setHasCalculated] = useState(false);
  const [results, setResults] = useState<GoalBasedResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

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
    setIsCalculating(true);
    setShowResults(false);

    // Calculate results
    const calculatedResults = calculateGoalBasedPlan({
      monthlyIncome,
      weeklyHours,
      sessionMinutes,
      docAndAdminMinutesPerClient: docAndAdminMinutes,
      cancellationRate: cancellationRate / 100
    });

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

    // Delayed reveal (1400ms for more anticipation)
    setTimeout(() => {
      setResults(calculatedResults);
      setHasCalculated(true);
      setIsCalculating(false);
      setShowResults(true);

      // Gradual smooth scroll to results after a brief moment for render
      setTimeout(() => {
        if (resultsRef.current) {
          const targetPosition = resultsRef.current.getBoundingClientRect().top + window.pageYOffset - 100;
          const startPosition = window.pageYOffset;
          const distance = targetPosition - startPosition;
          const duration = 1200; // Longer duration for slower scroll
          let start: number | null = null;

          const easeInOutCubic = (t: number): number => {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
          };

          const animation = (currentTime: number) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const progress = Math.min(timeElapsed / duration, 1);
            const ease = easeInOutCubic(progress);

            window.scrollTo(0, startPosition + distance * ease);

            if (timeElapsed < duration) {
              requestAnimationFrame(animation);
            }
          };

          requestAnimationFrame(animation);
        }
      }, 150);
    }, 1400);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    if (email.toLowerCase().endsWith('@icloud.com')) {
      setEmailError('iCloud email addresses are not accepted');
      return false;
    }

    setEmailError('');
    return true;
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      return;
    }

    // TODO: Implement actual email submission

    // Show success toast
    setShowEmailModal(false);
    setShowToast(true);
    setEmail('');

    // Hide toast after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
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
                    <span className="text-lg">💵</span>
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
                  max={20000}
                  step={500}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-nesso-ink/50">
                  <span>$3,000</span>
                  <span>$20,000</span>
                </div>
              </div>

              {/* Hours Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <span className="text-lg">⏰</span>
                    <span>
                      Weekly work hours
                      <br className="md:hidden" />
                      <span className="hidden md:inline"> </span>(sessions + notes + admin)
                    </span>
                  </label>
                  <div className="text-xl font-bold text-nesso-navy whitespace-nowrap">
                    {weeklyHours} hrs
                  </div>
                </div>
                <Slider
                  value={[weeklyHours]}
                  onValueChange={(value) => setWeeklyHours(value[0])}
                  min={5}
                  max={50}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-nesso-ink/50">
                  <span>5 hours</span>
                  <span>50 hours</span>
                </div>
              </div>
            </div>

            {/* Assumptions Section */}
            <div className="space-y-4 border-t border-nesso-navy/10 pt-6">
              <h2 className="text-lg font-semibold text-nesso-ink">Assumptions</h2>

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

              {/* Cancellation Rate */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-nesso-ink/70">Cancellation rate (10% is common)</label>
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
                  min={0}
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
                disabled={isCalculating}
                className="w-full py-4 text-sm bg-nesso-coral hover:bg-nesso-coral/90 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Calculate my plan
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {isCalculating && (
          <Card className="border border-nesso-navy/10 shadow-sm animate-pulse">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 border-4 border-nesso-navy/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-nesso-coral border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-sm font-medium text-nesso-ink/70">Calculating your plan...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Card (shown after calculation) */}
        {hasCalculated && results && showResults && (
          <Card
            ref={resultsRef}
            className="border border-nesso-navy/10 shadow-sm animate-fade-in"
            style={{
              animation: 'fadeIn 0.6s ease-out forwards'
            }}
          >
            <CardContent className="p-5 md:p-6 space-y-6">
              {/* Header */}
              <h2 className="text-xl font-bold text-nesso-ink">Caseload Plan</h2>

              {/* Your Goals Section */}
              <div className="bg-nesso-sand/20 rounded-lg p-4 border border-nesso-navy/10">
                <h3 className="text-sm font-semibold text-nesso-ink mb-3">Your Goals</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-base">💵</span>
                    <span className="text-nesso-ink/90">Earn <strong className="text-nesso-navy">{monthlyIncomeDisplay}/month</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-base">⏰</span>
                    <span className="text-nesso-ink/90">Work <strong className="text-nesso-navy">{weeklyHours} hours/week</strong></span>
                  </div>
                </div>
              </div>

              {/* Your Plan Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-nesso-ink mb-3">Your Plan</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Session Fee Widget */}
                  <div className="bg-white rounded-lg p-4 border border-nesso-navy/10">
                    <div className="text-xs text-nesso-ink/60 mb-2">Charge</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-2xl font-bold text-nesso-navy">{sessionFeeDisplay}</div>
                      <div className="text-xs text-nesso-ink/60">Per session</div>
                    </div>
                  </div>

                  {/* Scheduled Clients Widget */}
                  <div className="bg-white rounded-lg p-4 border border-nesso-navy/10">
                    <div className="text-xs text-nesso-ink/60 mb-2">Schedule</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-2xl font-bold text-nesso-navy">{clientsDisplay}</div>
                      <div className="text-xs text-nesso-ink/60">Clients per week</div>
                    </div>
                    <p className="text-xs text-nesso-ink/60 mt-2 italic">
                      *Assuming {cancellationRate}% of these will cancel
                    </p>
                  </div>
                </div>
              </div>

              {/* Your Week Breakdown Section */}
              <div className="bg-white rounded-lg p-4 border border-nesso-navy/10">
                <h3 className="text-sm font-semibold text-nesso-ink mb-3">Here&apos;s What Your Week Will Look Like</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-nesso-ink/70">Time with clients ({Math.round(results.attendedSessionsPerWeek || 0)} sessions)</span>
                    <span className="font-semibold text-nesso-navy">{Math.ceil(results.breakdown.sessionHours)}h</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-nesso-ink/70">Time on documentation & admin tasks</span>
                    <span className="font-semibold text-nesso-navy">{Math.ceil(results.breakdown.docAndAdminHours)}h</span>
                  </div>
                  <div className="border-t border-nesso-navy/10 pt-2 mt-2"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-nesso-ink">Total Work Hours</span>
                    <span className="text-base font-bold text-nesso-navy">{Math.ceil(results.breakdown.sessionHours) + Math.ceil(results.breakdown.docAndAdminHours)}h</span>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    onClick={() => {
                      // Scroll back to top smoothly
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    variant="outline"
                    className="w-full py-2 text-sm border-nesso-navy/20 text-nesso-navy hover:bg-nesso-coral/40 hover:border-nesso-navy/30 hover:text-nesso-ink transition-colors"
                  >
                    Update my plan
                  </Button>
                  <Button
                    onClick={() => setShowEmailModal(true)}
                    className="w-full py-2 text-sm bg-nesso-coral hover:bg-nesso-coral/90 text-black font-semibold transition-colors"
                  >
                    Email me my plan
                  </Button>
                </div>
              </div>

              {/* Nesso Mission Footer */}
              <div className="pt-3 border-t border-nesso-navy/10 mt-3">
                <p className="text-xs text-center text-nesso-ink/60">
                  At Nesso, we stand for small private practices.
                  <br className="md:hidden" />
                  <span className="hidden md:inline"> </span>
                  <a
                    href="https://www.nessoapp.com/about"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-nesso-navy underline hover:no-underline font-medium"
                  >
                    Learn why
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowEmailModal(false)}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-nesso-ink mb-4">Email Your Plan</h3>
              <p className="text-sm text-nesso-ink/70 mb-4">
                Get your personalized caseload plan delivered to your inbox.
                <br /><br />
                We&apos;ll also send occasional updates with tools and insights made for therapists like you.
              </p>
              <form onSubmit={handleEmailSubmit}>
                <div className="mb-4">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                    }}
                    required
                    className="w-full px-4 py-2 border border-nesso-navy/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nesso-coral"
                  />
                  {emailError && (
                    <p className="text-xs text-red-600 mt-1">{emailError}</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    variant="outline"
                    className="flex-1 py-2 text-sm border-nesso-navy/20 text-nesso-navy hover:bg-nesso-coral/40 hover:border-nesso-navy/30 hover:text-nesso-ink transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 py-2 text-sm bg-nesso-coral hover:bg-nesso-coral/90 text-black font-semibold transition-colors"
                  >
                    Send My Plan
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {showToast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-nesso-navy text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
            <p className="text-sm font-medium">✓ Your plan has been sent to your email!</p>
          </div>
        )}
      </main>

      <footer className="py-8">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="bg-white rounded-lg py-6 px-4">
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
