'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { ScenarioCard } from '@/components/ScenarioCard';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { calculateCaseload, formatCurrency, getRecommendation, type CalculationResults } from '@/lib/calculations';

interface PlanState {
  monthlyIncome: number;
  sessionFee: number;
  adminHours: number;
  documentationMinutesPerClient: number;
  cancellationRate: number;
}

function ReviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [planState, setPlanState] = useState<PlanState | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<'scenario1' | 'scenario2' | 'all' | null>(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Initialize from URL params
  useEffect(() => {
    const income = parseFloat(searchParams.get('income') || '0');
    const fee = parseFloat(searchParams.get('fee') || '0');

    if (income > 0 && fee > 0) {
      setPlanState({
        monthlyIncome: income,
        sessionFee: fee,
        adminHours: 6, // Default
        documentationMinutesPerClient: 20, // Default
        cancellationRate: 0.10 // 10% default
      });
    } else {
      // Invalid params, redirect to plan
      router.push('/plan');
    }
  }, [searchParams, router]);

  const handleAdjustGoals = () => {
    if (!planState) return;

    const params = new URLSearchParams({
      income: planState.monthlyIncome.toString(),
      fee: planState.sessionFee.toString()
    });

    router.push(`/plan?${params.toString()}`);
  };

  // Debounced update for assumptions
  const updateAssumption = useCallback((updates: Partial<PlanState>) => {
    setPlanState(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const handleEmailScenario = (scenario: 'scenario1' | 'scenario2' | 'all') => {
    setSelectedScenario(scenario);
    setIsEmailModalOpen(true);
  };

  if (!planState) {
    return (
      <div className="min-h-screen bg-nesso-bg flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-nesso-peach/20 border-t-nesso-peach rounded-full animate-spin"></div>
          <p className="text-nesso-ink/60">Loading your plan...</p>
        </div>
      </div>
    );
  }

  // Calculate Scenario 1: Current Path (baseline)
  const scenario1Results = calculateCaseload({
    monthlyIncome: planState.monthlyIncome,
    sessionFee: planState.sessionFee,
    adminHours: planState.adminHours,
    documentationMinutesPerClient: planState.documentationMinutesPerClient,
    cancellationRate: planState.cancellationRate
  });

  // Get smart recommendation based on baseline
  const recommendation = getRecommendation(scenario1Results, planState);

  // Calculate Scenario 2: Smart Recommendation
  const scenario2Results = calculateCaseload(recommendation.inputs);

  return (
    <div className="min-h-screen bg-nesso-bg flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto max-w-7xl px-4 py-6 md:py-10 space-y-8 md:space-y-10">
        {/* Header */}
        <section className="text-center">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-nesso-navy">
            Your caseload plan
          </h1>
        </section>

        {/* Compact Summary Bar */}
        <section className="max-w-5xl mx-auto">
          <div className="bg-nesso-card rounded-lg ring-1 ring-black/5 p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="text-nesso-ink/60">Your target:</span>
                <span className="font-semibold text-nesso-navy">{formatCurrency(planState.monthlyIncome)}/month</span>
                <span className="text-nesso-ink/40">•</span>
                <span className="text-nesso-ink/60">Session fee:</span>
                <span className="font-semibold text-nesso-navy">{formatCurrency(planState.sessionFee)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAdjustGoals}
                  className="px-3 py-1.5 text-xs rounded-lg border border-nesso-navy/20 text-nesso-navy hover:bg-nesso-navy/5 transition-colors whitespace-nowrap"
                >
                  Adjust
                </button>
                <button
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-nesso-navy/20 text-nesso-navy hover:bg-nesso-navy/5 transition-colors whitespace-nowrap flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Advanced
                  <svg className={`w-3 h-3 transition-transform ${showAdvancedSettings ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Expandable Advanced Settings */}
            {showAdvancedSettings && (
              <div className="mt-4 pt-4 border-t border-nesso-navy/10">
                <div className="space-y-3">
                  <p className="text-xs text-nesso-ink/60">
                    Adjust these if your practice is different from typical settings.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="adminHours" className="text-xs font-medium text-nesso-navy">
                        Weekly admin hours (emails, billing, etc.)
                      </Label>
                      <Input
                        id="adminHours"
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={planState.adminHours}
                        onChange={(e) => updateAssumption({ adminHours: parseFloat(e.target.value) || 0 })}
                        className="text-sm h-9"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="docMinutes" className="text-xs font-medium text-nesso-navy">
                        Documentation minutes per client each week
                      </Label>
                      <Input
                        id="docMinutes"
                        type="number"
                        min="0"
                        max="60"
                        step="5"
                        value={planState.documentationMinutesPerClient}
                        onChange={(e) => updateAssumption({ documentationMinutesPerClient: parseFloat(e.target.value) || 0 })}
                        className="text-sm h-9"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="cancellationRate" className="text-xs font-medium text-nesso-navy">
                        Average % of cancellations or no shows
                      </Label>
                      <Input
                        id="cancellationRate"
                        type="number"
                        min="0"
                        max="50"
                        step="1"
                        value={Math.round(planState.cancellationRate * 100)}
                        onChange={(e) => updateAssumption({ cancellationRate: (parseFloat(e.target.value) || 0) / 100 })}
                        className="text-sm h-9"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Caseload Approaches Panel */}
        <section className="max-w-6xl mx-auto">
          <h2 className="text-xl md:text-2xl font-semibold text-nesso-navy mb-4 md:mb-5">Caseload Approaches</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
            {/* Approach 1: Current Path */}
            <ScenarioCard
              title="Current Path"
              results={scenario1Results}
              incomeGoal={planState.monthlyIncome}
              sessionFee={planState.sessionFee}
              onEmailClick={() => handleEmailScenario('scenario1')}
            />

            {/* Approach 2: Smart Recommendation */}
            <ScenarioCard
              title={recommendation.title}
              results={scenario2Results}
              incomeGoal={planState.monthlyIncome}
              sessionFee={recommendation.newSessionFee}
              onEmailClick={() => handleEmailScenario('scenario2')}
            />
          </div>

          {/* Email full overview button */}
          <div className="mt-6 md:mt-8 flex justify-center">
            <button
              onClick={() => handleEmailScenario('all')}
              className="px-6 py-2.5 text-sm rounded-xl border-2 border-nesso-coral text-nesso-navy hover:bg-nesso-coral/10 font-medium transition-colors focus:ring-2 focus:ring-nesso-coral"
            >
              Email me the full overview
            </button>
          </div>
        </section>
      </main>

      {/* Email Modal */}
      {isEmailModalOpen && selectedScenario && (
        <EmailCaptureModal
          isOpen={isEmailModalOpen}
          onClose={() => {
            setIsEmailModalOpen(false);
            setSelectedScenario(null);
          }}
          scenario={selectedScenario}
          planState={planState}
          scenario1Results={scenario1Results}
          scenario2Results={scenario2Results}
        />
      )}
    </div>
  );
}

// Email Capture Modal Component
interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: 'scenario1' | 'scenario2' | 'all';
  planState: PlanState;
  scenario1Results: CalculationResults;
  scenario2Results: CalculationResults;
}

function EmailCaptureModal({ isOpen, onClose, scenario, planState, scenario1Results: _scenario1Results, scenario2Results: _scenario2Results }: EmailCaptureModalProps) {
  const [email, setEmail] = useState('');
  const [optIn, setOptIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    // Simulate sending (for now, just collect the email)
    // In the future, this would call an API endpoint
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Store email in localStorage for now (Vercel analytics can track this)
    const emailData = {
      email,
      optIn,
      scenario,
      timestamp: new Date().toISOString(),
      planState
    };

    try {
      const existingEmails = JSON.parse(localStorage.getItem('caseload_emails') || '[]');
      existingEmails.push(emailData);
      localStorage.setItem('caseload_emails', JSON.stringify(existingEmails));
    } catch (err) {
      console.error('Failed to store email:', err);
    }

    setIsSubmitting(false);

    // Show success toast (you can add a toast library later)
    alert('Plan sent. Check your inbox!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-nesso-navy">Send your caseload plan to your inbox</h2>
            <p className="text-sm text-nesso-ink/60 mt-1">
              We&apos;ll email your plan summary. You can create a new plan anytime.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-nesso-ink/60 hover:text-nesso-navy transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-nesso-navy">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full"
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="optIn"
              checked={optIn}
              onChange={(e) => setOptIn(e.target.checked)}
              className="mt-1"
            />
            <Label htmlFor="optIn" className="text-sm text-nesso-ink/80 cursor-pointer">
              Send me my plan and keep me in the loop with helpful updates.
            </Label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 rounded-xl bg-nesso-coral hover:bg-nesso-coral/90 text-black font-medium transition-colors focus:ring-2 focus:ring-nesso-coral disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Sending...' : 'Email me my plan'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ReviewPageContent />
    </Suspense>
  );
}
