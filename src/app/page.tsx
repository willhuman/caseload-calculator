'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ExpenseInputs } from '@/components/ExpenseInputs';
import { LiveResultsDashboard } from '@/components/LiveResultsDashboard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    taxPrep: 0,
    professionalDues: 0,
    other: 0,
    customExpenses: [],
  });

  // Time off inputs state
  const [timeOff, setTimeOff] = useState<TimeOffInputsType>({
    vacationWeeks: 4,
  });

  // Results state
  const [results, setResults] = useState<ProjectionResults | null>(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState('session');

  // Mobile results visibility state (hide when near Results section)
  const [showMobileResultsBar, setShowMobileResultsBar] = useState(true);


  const shareText = "Take a look at this really cool app I found to help me plan the financial details of my practice, caseloadcalculator.com";

  const handleShareSelect = (platform: string) => {
    if (!results) return;

    switch (platform) {
      case "text":
        // Use SMS protocol to directly open messages app with pre-filled text
        window.location.href = `sms:?&body=${encodeURIComponent(shareText)}`;
        break;

      case "whatsapp":
        // Open WhatsApp directly with pre-filled text
        window.location.href = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
        break;

      case "email":
        // Open email client with pre-filled content
        const emailSubject = "Check out this Caseload Calculator";
        window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(shareText)}`;
        break;
    }
  };

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
    <div className="min-h-screen" style={{ backgroundColor: '#F4F7F3' }}>
      <CalculatorStructuredData />
      <FAQStructuredData />
      <Header
        rightContent={
          results ? (
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
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
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
          ) : null
        }
      />

      <main className="max-w-6xl mx-auto px-4 pt-2 lg:pt-3 pb-4 lg:pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-4">
          {/* Left Column: Inputs (60% width on desktop) */}
          <div className="lg:col-span-3 space-y-6 lg:space-y-3 pb-20 lg:pb-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:hidden">
                <TabsTrigger value="session">Your Practice</TabsTrigger>
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
              </TabsList>

              {/* Session Details Tab */}
              <TabsContent value="session" className="space-y-6 lg:space-y-3 lg:mt-0">
                <Card>
                  <CardContent className="space-y-6 lg:space-y-4">
                    {/* Workload and Fees Section */}
                    <div className="space-y-4 lg:space-y-2.5">
                      <h3 className="text-base font-semibold text-nesso-ink">Workload and Fees</h3>

                      {/* Session Fee Slider */}
                      <div className="space-y-3 lg:space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label htmlFor="sessionFee" className="text-sm font-medium">
                            Session fee
                          </label>
                          <div className="text-xl lg:text-base font-bold text-nesso-navy">
                            {sessionFeeDisplay}
                          </div>
                        </div>
                        <Slider
                          id="sessionFee"
                          aria-label="Session fee"
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
                      <div className="space-y-3 lg:space-y-1.5">
                        <div className="flex items-center justify-between gap-3">
                          <label htmlFor="clientsScheduled" className="text-sm font-medium">
                            Clients scheduled per week
                          </label>
                          <div className="text-xl lg:text-base font-bold text-nesso-navy whitespace-nowrap">
                            {session.clientsScheduledPerWeek}
                          </div>
                        </div>
                        <Slider
                          id="clientsScheduled"
                          aria-label="Clients scheduled per week"
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
                    </div>

                    {/* Assumptions Section */}
                    <div className="pt-4 lg:pt-3 border-t border-sand space-y-4 lg:space-y-2">
                      <h3 className="text-base font-semibold text-nesso-ink">Assumptions</h3>

                      {/* Session Length */}
                      <div className="space-y-1.5 lg:space-y-1">
                        <div className="flex items-center justify-between">
                          <label htmlFor="sessionLength" className="text-xs font-medium text-nesso-ink/70">
                            Session length
                          </label>
                          <span className="text-xs font-semibold text-nesso-navy">
                            {session.sessionLengthMinutes} min
                          </span>
                        </div>
                        <Slider
                          id="sessionLength"
                          aria-label="Session length in minutes"
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
                      <div className="space-y-1.5 lg:space-y-1">
                        <div className="flex items-center justify-between">
                          <label htmlFor="cancellationRate" className="text-xs font-medium text-nesso-ink/70">
                            Cancellation rate (10% is common)
                          </label>
                          <span className="text-xs font-semibold text-nesso-navy">
                            {session.cancellationRate}%
                          </span>
                        </div>
                        <Slider
                          id="cancellationRate"
                          aria-label="Cancellation rate percentage"
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
                      <div className="space-y-1.5 lg:space-y-1">
                        <div className="flex items-center justify-between">
                          <label htmlFor="docAdminTime" className="text-xs font-medium text-nesso-ink/70">
                            Documentation & admin time per session
                          </label>
                          <span className="text-xs font-semibold text-nesso-navy">
                            {session.docAdminTimeMinutes} min
                          </span>
                        </div>
                        <Slider
                          id="docAdminTime"
                          aria-label="Documentation and admin time per session in minutes"
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
                    </div>

                    {/* Time Off Planning Section */}
                    <div className="pt-4 lg:pt-3 border-t border-sand space-y-4 lg:space-y-2">
                      <h3 className="text-base font-semibold text-nesso-ink">Time Off</h3>

                      <div className="space-y-4 lg:space-y-2">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label htmlFor="vacationWeeks" className="text-sm font-medium">Total weeks off per year</label>
                            <span className="text-xl lg:text-base font-bold text-navy">
                              {timeOff.vacationWeeks}
                            </span>
                          </div>
                          <p className="text-xs text-nesso-ink/60 mb-3">
                            (Includes holidays, vacation, sick time, and personal days)
                          </p>
                        </div>

                        <Slider
                          id="vacationWeeks"
                          min={0}
                          max={12}
                          step={1}
                          value={[timeOff.vacationWeeks]}
                          onValueChange={(value) =>
                            setTimeOff({
                              ...timeOff,
                              vacationWeeks: value[0],
                            })
                          }
                          className="w-full"
                        />

                        <div className="flex justify-between text-xs text-nesso-ink/50">
                          <span>0 weeks</span>
                          <span>12 weeks</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Desktop: Show Expenses below in same view */}
                <div className="hidden lg:block">
                  <ExpenseInputs expenses={expenses} onChange={setExpenses} />
                </div>
              </TabsContent>

              {/* Expenses Tab - Mobile only */}
              <TabsContent value="expenses" className="lg:hidden">
                <ExpenseInputs expenses={expenses} onChange={setExpenses} />
              </TabsContent>
            </Tabs>

            {/* Mobile: Full Results Section */}
            <div id="mobile-results-section" className="lg:hidden">
              <LiveResultsDashboard results={results} />
            </div>
          </div>

          {/* Right Column: Live Results (40% width on desktop, full width on mobile) */}
          <div className="lg:col-span-2 lg:self-start lg:sticky lg:top-4">
            {/* Desktop: Sticky to top */}
            <div className="hidden lg:block">
              <LiveResultsDashboard results={results} />
            </div>
          </div>
        </div>

        {/* Mobile: Results Navigation Bar - Shows at top, hides when scrolled to bottom */}
        {showMobileResultsBar && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t-2 border-navy/20 shadow-2xl transition-all duration-500 ease-in-out" style={{ backgroundColor: '#E0EAE0' }}>
            <button
              onClick={scrollToResults}
              className="w-full px-4 py-3 text-left"
              aria-label="View detailed financial results"
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
                <div className="flex items-center justify-center px-3 py-2 rounded-lg text-black" style={{ backgroundColor: '#FAB5A7' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Nesso Mission Footer */}
        <div className="mt-6 mb-6 lg:mb-0">
          <p className="text-base text-center text-nesso-navy">
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

export default Home;
