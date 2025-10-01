'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { InputCard } from '@/components/InputCard';
import { ResultsGrid } from '@/components/ResultsGrid';
import { EmailReportModal } from '@/components/EmailReportModal';
import { CalculationInputs, CalculationResults, calculateCaseload } from '@/lib/calculations';

export default function Home() {
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [currentInputs, setCurrentInputs] = useState<CalculationInputs | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const handleCalculate = async (inputs: CalculationInputs) => {
    setIsCalculating(true);

    // Brief loading transition for professional feel
    await new Promise(resolve => setTimeout(resolve, 625));

    const calculationResults = calculateCaseload(inputs);
    setResults(calculationResults);
    setCurrentInputs(inputs);
    setIsCalculating(false);
    setShowResults(true);
  };

  const handleRestart = () => {
    setShowResults(false);
    setResults(null);
    setCurrentInputs(null);
    setIsEmailModalOpen(false);
  };


  const handleInputsChange = (inputs: CalculationInputs) => {
    const newResults = calculateCaseload(inputs);
    setResults(newResults);
    setCurrentInputs(inputs);
  };

  // Handle custom events from ResultsGrid
  useEffect(() => {
    const handleEmailModalEvent = () => {
      setIsEmailModalOpen(true);
    };

    const handleRestartEvent = () => {
      handleRestart();
    };

    window.addEventListener('openEmailModal', handleEmailModalEvent);
    window.addEventListener('restartCalculator', handleRestartEvent);

    return () => {
      window.removeEventListener('openEmailModal', handleEmailModalEvent);
      window.removeEventListener('restartCalculator', handleRestartEvent);
    };
  }, []);

  return (
    <div className="min-h-screen bg-nesso-bg flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto max-w-6xl px-4 py-12 space-y-12">
        {/* Loading State */}
        {isCalculating && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="w-16 h-16 border-4 border-nesso-peach/20 border-t-nesso-peach rounded-full animate-spin"></div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-nesso-navy">Planning your sustainable caseload…</h2>
              <p className="text-nesso-ink/80">Balancing income goals with your time and energy.</p>
            </div>
          </div>
        )}

        {/* Step 1: Input Form */}
        {!showResults && !isCalculating && (
          <>
            {/* Hero Section */}
            <section className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-nesso-navy mb-4">
                Plan your sustainable caseload
              </h1>
            </section>

            {/* Input Form */}
            <section>
              <InputCard onCalculate={handleCalculate} isCalculating={isCalculating} />
            </section>

            {/* Sustainable Philosophy Box */}
            <section className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-nesso-navy/5 to-nesso-purple/5 rounded-2xl ring-1 ring-nesso-navy/10 p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-nesso-navy mb-3">Our Sustainable Practice Philosophy</h2>
                  <div className="w-16 h-0.5 bg-nesso-purple mx-auto"></div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-nesso-coral rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-nesso-navy">Financial Wellness</h3>
                    <p className="text-sm text-nesso-ink/70 leading-relaxed">
                      Your income goals matter. Plan a caseload that meets your financial needs without compromising your well-being or quality of care.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-nesso-purple rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-nesso-navy">Time Balance</h3>
                    <p className="text-sm text-nesso-ink/70 leading-relaxed">
                      Sustainable practice includes time for documentation, self-care, and life outside of work. Honor your boundaries.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-nesso-navy rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-nesso-navy">Quality Care</h3>
                    <p className="text-sm text-nesso-ink/70 leading-relaxed">
                      When you&apos;re not overwhelmed, you can show up fully for your clients. Sustainable caseloads improve outcomes for everyone.
                    </p>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-sm text-nesso-ink/60 italic max-w-2xl mx-auto">
                    &ldquo;The goal isn&apos;t to maximize client capacity—it&apos;s to find the sweet spot where your professional fulfillment, financial goals, and personal well-being align.&rdquo;
                  </p>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Step 2: Results */}
        {showResults && !isCalculating && results && currentInputs && (
          <>
            {/* Results Header */}
            <section className="text-center space-y-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-nesso-navy mb-2">
                  Your Caseload Plan
                </h1>
              </div>
            </section>

            {/* Results Grid */}
            <section>
              <ResultsGrid results={results} originalInputs={currentInputs} onInputsChange={handleInputsChange} />
            </section>
          </>
        )}
      </main>

      {/* Footer - Only show on input step */}
      {!showResults && !isCalculating && (
        <footer className="bg-nesso-card border-t border-black/5 py-8">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex justify-center space-x-8 text-sm text-gray-600">
                <a
                  href="/privacy"
                  className="text-nesso-ink/60 hover:text-nesso-navy transition-colors"
                >
                  Privacy
                </a>
                <a
                  href="/terms"
                  className="text-nesso-ink/60 hover:text-nesso-navy transition-colors"
                >
                  Terms
                </a>
              </div>
              <div className="text-sm text-nesso-ink/50">
                © 2025 Nesso Labs, Inc
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Email Report Modal */}
      {showResults && results && currentInputs && (
        <EmailReportModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          results={results}
          inputs={currentInputs}
        />
      )}
    </div>
  );
}
