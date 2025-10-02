'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FeeSlider } from '@/components/FeeSlider';
import { WeekTimeline } from '@/components/WeekTimeline';
import { SustainabilityIndicator } from '@/components/SustainabilityIndicator';
import {
  calculateRealityPlan,
  calculateOptimalSessionFee,
  formatCurrency,
  type RealityPlanResults
} from '@/lib/calculations';

function ReviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get goals from URL
  const monthlyIncome = parseFloat(searchParams.get('income') || '0');
  const weeklyHours = parseFloat(searchParams.get('hours') || '0');

  // Redirect if invalid params
  useEffect(() => {
    if (!monthlyIncome || !weeklyHours) {
      router.push('/plan');
    }
  }, [monthlyIncome, weeklyHours, router]);

  // Calculate optimal starting fee
  const [sessionFee, setSessionFee] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [assumptions, setAssumptions] = useState({
    adminHours: 6,
    documentationMinutesPerClient: 20,
    cancellationRate: 0.10
  });

  // Initialize session fee on mount
  useEffect(() => {
    if (monthlyIncome && weeklyHours && sessionFee === 0) {
      const optimalFee = calculateOptimalSessionFee(
        monthlyIncome,
        weeklyHours,
        assumptions.adminHours,
        assumptions.documentationMinutesPerClient,
        assumptions.cancellationRate
      );
      setSessionFee(optimalFee);
    }
  }, [monthlyIncome, weeklyHours, sessionFee, assumptions]);

  // Calculate reality plan
  let plan: RealityPlanResults | null = null;
  if (monthlyIncome && weeklyHours && sessionFee > 0) {
    plan = calculateRealityPlan({
      monthlyIncome,
      weeklyHours,
      sessionFee,
      ...assumptions
    });
  }

  const handleAdjustGoals = () => {
    router.push(`/plan`);
  };

  const handleAssumptionChange = (field: string, value: number) => {
    setAssumptions(prev => ({ ...prev, [field]: value }));
  };

  if (!plan) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-nesso-sand/30 to-white">
      <Header />

      <main className="max-w-4xl mx-auto px-4 pt-8 pb-24">
        {/* Goals Display */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-6 px-6 py-3 bg-white rounded-xl border border-nesso-sand shadow-sm">
            <div className="text-sm">
              <span className="text-nesso-ink/60">Your goals: </span>
              <span className="font-semibold text-nesso-navy">
                Make {formatCurrency(monthlyIncome)}/month working {weeklyHours} hrs/week
              </span>
            </div>
            <Button
              onClick={handleAdjustGoals}
              variant="ghost"
              size="sm"
              className="text-nesso-coral hover:text-nesso-coral/80"
            >
              ← Adjust goals
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="p-6 border-2 border-nesso-navy/10 shadow-lg">
            <h2 className="text-2xl font-bold text-nesso-navy mb-4">
              To make {formatCurrency(monthlyIncome)} in {weeklyHours} hours:
            </h2>

            <div className="space-y-4">
              <p className="text-lg text-nesso-ink">
                You need to charge <span className="font-bold text-nesso-navy">${sessionFee} per session</span> and
                schedule <span className="font-bold text-nesso-navy">{plan.clientsPerWeek.min}-{plan.clientsPerWeek.max} clients per week</span>.
              </p>

              <div className="pt-4 pb-2 text-sm text-nesso-ink/70 leading-relaxed">
                <p className="mb-2">
                  To calculate this, we&apos;re taking a few additional numbers into account that are pretty standard in your industry:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{(assumptions.cancellationRate * 100).toFixed(0)}% cancellation rate</li>
                  <li>{assumptions.adminHours} hours admin time per week</li>
                  <li>{assumptions.documentationMinutesPerClient} minutes per client for documentation</li>
                </ul>

                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="mt-3 text-nesso-coral hover:text-nesso-coral/80 text-sm font-medium inline-flex items-center gap-1"
                >
                  Adjust these assumptions {showAdvanced ? '▲' : '▼'}
                </button>

                {/* Advanced Settings */}
                {showAdvanced && (
                  <div className="mt-4 p-4 bg-nesso-sand/20 rounded-lg space-y-4">
                    <div>
                      <Label htmlFor="adminHours" className="text-sm">
                        Weekly admin hours (emails, billing, etc.)
                      </Label>
                      <Input
                        id="adminHours"
                        type="number"
                        value={assumptions.adminHours}
                        onChange={(e) => handleAssumptionChange('adminHours', parseFloat(e.target.value))}
                        className="mt-1"
                        min="0"
                        max="40"
                      />
                    </div>

                    <div>
                      <Label htmlFor="docMinutes" className="text-sm">
                        Documentation minutes per client each week
                      </Label>
                      <Input
                        id="docMinutes"
                        type="number"
                        value={assumptions.documentationMinutesPerClient}
                        onChange={(e) => handleAssumptionChange('documentationMinutesPerClient', parseFloat(e.target.value))}
                        className="mt-1"
                        min="0"
                        max="120"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cancellationRate" className="text-sm">
                        Average % of cancellations or no shows
                      </Label>
                      <Input
                        id="cancellationRate"
                        type="number"
                        value={(assumptions.cancellationRate * 100).toFixed(0)}
                        onChange={(e) => handleAssumptionChange('cancellationRate', parseFloat(e.target.value) / 100)}
                        className="mt-1"
                        min="0"
                        max="50"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Fee Slider Card */}
          <Card className="p-6 border-2 border-nesso-navy/10 shadow-lg">
            <FeeSlider
              value={sessionFee}
              onChange={setSessionFee}
              min={75}
              max={300}
              step={5}
            />
          </Card>

          {/* Week Timeline Card */}
          <Card className="p-6 border-2 border-nesso-navy/10 shadow-lg">
            <WeekTimeline
              sessionHours={plan.breakdown.sessionHours}
              docHours={plan.breakdown.docHours}
              adminHours={plan.breakdown.adminHours}
              totalHours={plan.breakdown.totalHours}
            />
          </Card>

          {/* Sustainability Indicator */}
          <SustainabilityIndicator
            status={plan.sustainability}
            message={plan.sustainabilityMessage}
          />
        </div>
      </main>
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
