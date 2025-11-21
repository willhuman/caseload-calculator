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
          <div className="lg:col-span-2 space-y-6 pb-[50vh] lg:pb-0">
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
          </div>

          {/* Right Column: Live Results (1/3 width on desktop, full width on mobile) */}
          <div className="lg:col-span-1">
            {/* Desktop: Sticky to top */}
            <div className="hidden lg:block lg:sticky lg:top-4 space-y-4">
              <h2 className="text-xl font-bold text-nesso-ink">Results</h2>
              <LiveResultsDashboard results={results} />
            </div>

            {/* Mobile: Sticky to bottom */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-navy/20 shadow-2xl max-h-[50vh] overflow-y-auto">
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-nesso-ink">Results</h2>
                </div>
                <LiveResultsDashboard results={results} />
              </div>
            </div>
          </div>
        </div>

        {/* Nesso Mission Footer */}
        <div className="mt-12">
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

      <footer className="py-4">
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
