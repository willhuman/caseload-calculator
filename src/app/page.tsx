'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpenseInputs } from '@/components/ExpenseInputs';
import { TimeOffInputs } from '@/components/TimeOffInputs';
import { LiveResultsDashboard } from '@/components/LiveResultsDashboard';
import { calculateProjection, formatCurrency } from '@/lib/calculations';
import { trackEvent } from '@/lib/analytics';
import { CalculatorStructuredData } from '@/components/StructuredData';
import { FAQStructuredData } from '@/components/FAQStructuredData';
import type { SessionInputs, ExpenseInputs as ExpenseInputsType, TimeOffInputs as TimeOffInputsType, ProjectionResults } from '@/lib/types';

export function Home() {
  // Session inputs state
  const [session, setSession] = useState<SessionInputs>({
    sessionFee: 150,
    clientsScheduledPerWeek: 15,
    sessionLengthMinutes: 50,
    cancellationRate: 10, // Percentage
    docAdminTimeMinutes: 20,
  });

  // Expense inputs state (always enabled, starts at 0)
  const [expenses, setExpenses] = useState<ExpenseInputsType>({
    rentUtilities: 0,
    marketing: 0,
    software: 0,
    insurance: 0,
    continuingEd: 0,
    conferences: 0,
    other: 0,
    customExpenses: [],
  });

  // Time off inputs state
  const [timeOff, setTimeOff] = useState<TimeOffInputsType>({
    vacationWeeks: 0,
  });

  // Results state
  const [results, setResults] = useState<ProjectionResults | null>(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState('session');

  // Mobile results visibility state (hide when near Results section)
  const [showMobileResultsBar, setShowMobileResultsBar] = useState(true);

  // Track scroll position to hide bar when Financial Projections card is visible
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const financialProjectionsCard = document.getElementById('financial-projections-card');
      if (!financialProjectionsCard) return;

      // Get the position of the Financial Projections card
      const rect = financialProjectionsCard.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Hide bar when the Financial Projections card header is visible in viewport
      // (when top of card is above the bottom of the viewport)
      const isCardVisible = rect.top < windowHeight;

      setShowMobileResultsBar(!isCardVisible);
    };

    window.addEventListener('scroll', handleScroll);
    // Also check on initial load
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Function to scroll to Results section
  const scrollToResults = () => {
    if (typeof window === 'undefined') return;

    // Find the mobile Results section and scroll to it
    const resultsSection = document.getElementById('mobile-results-section');
    if (resultsSection) {
      resultsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Calculate results whenever inputs change
  useEffect(() => {
    const calculatedResults = calculateProjection(session, timeOff, expenses);
    setResults(calculatedResults);

    // Track analytics on first load
    if (results === null) {
      trackEvent({
        action: 'calculator_loaded',
        category: 'projection_calculator',
        data: {
          sessionFee: session.sessionFee,
          clientsScheduled: session.clientsScheduledPerWeek,
        }
      });
    }
  }, [session, expenses, timeOff]); // eslint-disable-line react-hooks/exhaustive-deps

  const sessionFeeDisplay = formatCurrency(session.sessionFee);

  return (
    <div className="min-h-screen bg-gradient-to-b from-nesso-sand/30 to-white">
      <CalculatorStructuredData />
      <FAQStructuredData />
      <Header />

      <main className="max-w-6xl mx-auto px-4 pt-4 pb-8 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Inputs (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-6 pb-20 lg:pb-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="session">Session Details</TabsTrigger>
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
                <TabsTrigger value="timeoff">Time Off</TabsTrigger>
              </TabsList>

              {/* Session Details Tab */}
              <TabsContent value="session" className="space-y-6">
                <Card className="border border-nesso-navy/10">
                  <CardContent className="px-5 md:px-6 py-4 md:py-5 space-y-6">
                    <h2 className="text-lg font-semibold text-nesso-ink">Session Details</h2>

                    {/* Session Fee Slider */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <span className="text-lg">💵</span>
                          Session fee
                        </label>
                        <div className="text-xl font-bold text-nesso-navy">
                          {sessionFeeDisplay}
                        </div>
                      </div>
                      <Slider
                        value={[session.sessionFee]}
                        onValueChange={(value) =>
                          setSession({ ...session, sessionFee: value[0] })
                        }
                        min={50}
                        max={500}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-nesso-ink/50">
                        <span>$50</span>
                        <span>$500</span>
                      </div>
                    </div>

                    {/* Clients Scheduled Slider */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <span className="text-lg">👥</span>
                          <span>
                            Clients scheduled per week
                          </span>
                        </label>
                        <div className="text-xl font-bold text-nesso-navy whitespace-nowrap">
                          {session.clientsScheduledPerWeek}
                        </div>
                      </div>
                      <Slider
                        value={[session.clientsScheduledPerWeek]}
                        onValueChange={(value) =>
                          setSession({ ...session, clientsScheduledPerWeek: value[0] })
                        }
                        min={5}
                        max={40}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-nesso-ink/50">
                        <span>5 clients</span>
                        <span>40 clients</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Assumptions Card */}
                <Card className="border border-nesso-navy/10">
                  <CardContent className="px-5 md:px-6 py-4 md:py-5 space-y-4">
                    <h2 className="text-lg font-semibold text-nesso-ink">Assumptions</h2>

                    {/* Session Length */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-nesso-ink/70">
                          Session length
                        </label>
                        <span className="text-xs font-semibold text-nesso-navy">
                          {session.sessionLengthMinutes} min
                        </span>
                      </div>
                      <Slider
                        value={[session.sessionLengthMinutes]}
                        onValueChange={(value) =>
                          setSession({ ...session, sessionLengthMinutes: value[0] })
                        }
                        min={30}
                        max={90}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    {/* Cancellation Rate */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-nesso-ink/70">
                          Cancellation rate (10% is common)
                        </label>
                        <span className="text-xs font-semibold text-nesso-navy">
                          {session.cancellationRate}%
                        </span>
                      </div>
                      <Slider
                        value={[session.cancellationRate]}
                        onValueChange={(value) =>
                          setSession({ ...session, cancellationRate: value[0] })
                        }
                        min={0}
                        max={30}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Doc & Admin Time */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-nesso-ink/70">
                          Documentation & admin time per session
                        </label>
                        <span className="text-xs font-semibold text-nesso-navy">
                          {session.docAdminTimeMinutes} min
                        </span>
                      </div>
                      <Slider
                        value={[session.docAdminTimeMinutes]}
                        onValueChange={(value) =>
                          setSession({ ...session, docAdminTimeMinutes: value[0] })
                        }
                        min={0}
                        max={60}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Expenses Tab */}
              <TabsContent value="expenses">
                <ExpenseInputs expenses={expenses} onChange={setExpenses} />
              </TabsContent>

              {/* Time Off Tab */}
              <TabsContent value="timeoff">
                <TimeOffInputs timeOff={timeOff} onChange={setTimeOff} />
              </TabsContent>
            </Tabs>

            {/* Mobile: Full Results Section */}
            <div id="mobile-results-section" className="lg:hidden">
              <h2 className="text-xl font-bold text-nesso-ink mb-4">Results</h2>
              <LiveResultsDashboard results={results} />
            </div>
          </div>

          {/* Right Column: Live Results (1/3 width on desktop, full width on mobile) */}
          <div className="lg:col-span-1">
            {/* Desktop: Sticky to top */}
            <div className="hidden lg:block lg:sticky lg:top-4 space-y-4">
              <h2 className="text-xl font-bold text-nesso-ink">Results</h2>
              <LiveResultsDashboard results={results} />
            </div>
          </div>
        </div>

        {/* Mobile: Results Navigation Bar - Shows at top, hides when scrolled to bottom */}
        {showMobileResultsBar && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-br from-blue-50 to-indigo-50 border-t-2 border-navy/20 shadow-2xl transition-all duration-500 ease-in-out">
            <button
              onClick={scrollToResults}
              className="w-full px-4 py-3 text-left"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-navy mb-1">Results</div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-navy/70">Monthly:</span>
                    <span className="font-bold text-navy">
                      {results ? formatCurrency(results.hasExpenses ? results.monthlyAverageNetIncome : results.monthlyAverageGrossIncome) : '$0'}
                    </span>
                    <span className="text-navy/30">•</span>
                    <span className="text-navy/70">Yearly:</span>
                    <span className="font-bold text-navy">
                      {results ? formatCurrency(results.hasExpenses ? results.yearlyTotalNetIncome : results.yearlyTotalGrossIncome) : '$0'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap text-black" style={{ backgroundColor: '#FAB5A7' }}>
                  View Details
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Nesso Mission Footer */}
        <div className="mt-6 mb-6 lg:mb-0">
          <p className="text-sm text-center text-nesso-navy">
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
      </main>

      <footer className="mb-20 lg:mb-0">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="bg-white rounded-lg py-4 px-4">
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

export default Home;
