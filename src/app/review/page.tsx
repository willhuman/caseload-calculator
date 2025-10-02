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
  const [isEditingAssumptions, setIsEditingAssumptions] = useState(false);
  const [assumptions, setAssumptions] = useState({
    sessionMinutes: 50,
    adminHours: 6,
    documentationMinutesPerClient: 20,
    cancellationRate: 0.10
  });
  const [tempAssumptions, setTempAssumptions] = useState(assumptions);

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
    router.push(`/plan?income=${monthlyIncome}&hours=${weeklyHours}`);
  };

  const handleEditAssumptions = () => {
    setTempAssumptions(assumptions);
    setIsEditingAssumptions(true);
  };

  const handleSaveAssumptions = () => {
    setAssumptions(tempAssumptions);
    setIsEditingAssumptions(false);
  };

  const handleCancelEdit = () => {
    setTempAssumptions(assumptions);
    setIsEditingAssumptions(false);
  };

  const handleTempAssumptionChange = (field: string, value: number) => {
    setTempAssumptions(prev => ({ ...prev, [field]: value }));
  };

  // Helper to display client count
  const getClientDisplay = (clientsPerWeek: { min: number; max: number }) => {
    if (clientsPerWeek.min === clientsPerWeek.max) {
      return `${clientsPerWeek.min}`;
    }
    return `${clientsPerWeek.min}-${clientsPerWeek.max}`;
  };

  if (!plan) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-nesso-sand/30 to-white">
      <Header />

      <main className="max-w-3xl mx-auto px-4 pt-6 pb-16">
        {/* Goals Display */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-4 px-5 py-2 bg-white rounded-lg border border-nesso-sand shadow-sm">
            <div className="text-sm">
              <span className="text-nesso-ink/60">Your goals: </span>
              <span className="font-semibold text-nesso-navy">
                Make {formatCurrency(monthlyIncome)}/month working {weeklyHours} hrs/week
              </span>
            </div>
            <button
              onClick={handleAdjustGoals}
              className="px-3 py-1.5 text-xs font-semibold bg-nesso-coral hover:bg-nesso-coral/90 text-black rounded-md transition-colors"
            >
              Adjust goals
            </button>
          </div>
        </div>

        <div className="space-y-5">
          {/* Summary Card */}
          <Card className="p-5 border border-nesso-navy/10 shadow-sm">
            <h2 className="text-xl font-bold text-nesso-navy mb-3">
              To make {formatCurrency(monthlyIncome)} in {weeklyHours} hours:
            </h2>

            <div className="space-y-3">
              <p className="text-base text-nesso-ink leading-relaxed">
                You need to charge <span className="font-bold text-nesso-navy">${sessionFee} per session</span> and
                schedule <span className="font-bold text-nesso-navy">{getClientDisplay(plan.clientsPerWeek)} clients per week</span>.
              </p>

              <div className="pt-3 text-sm text-nesso-ink/70 leading-relaxed">
                <p className="mb-2">
                  We&apos;re using these industry-standard assumptions:
                </p>

                {!isEditingAssumptions ? (
                  <>
                    <div className="flex items-center justify-between py-1">
                      <span>{assumptions.sessionMinutes} min sessions, {(assumptions.cancellationRate * 100).toFixed(0)}% cancellation rate, {assumptions.adminHours}h admin/week, {assumptions.documentationMinutesPerClient} min documentation/client</span>
                      <button
                        onClick={handleEditAssumptions}
                        className="px-3 py-1.5 text-xs font-semibold bg-nesso-coral hover:bg-nesso-coral/90 text-black rounded-md transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="mt-3 p-3 bg-nesso-sand/20 rounded-lg space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="sessionMinutes" className="text-xs mb-1">
                          Session length (minutes)
                        </Label>
                        <Input
                          id="sessionMinutes"
                          type="number"
                          value={tempAssumptions.sessionMinutes}
                          onChange={(e) => handleTempAssumptionChange('sessionMinutes', parseFloat(e.target.value))}
                          className="text-sm h-8"
                          min="30"
                          max="90"
                        />
                      </div>

                      <div>
                        <Label htmlFor="adminHours" className="text-xs mb-1">
                          Admin hours/week
                        </Label>
                        <Input
                          id="adminHours"
                          type="number"
                          value={tempAssumptions.adminHours}
                          onChange={(e) => handleTempAssumptionChange('adminHours', parseFloat(e.target.value))}
                          className="text-sm h-8"
                          min="0"
                          max="40"
                        />
                      </div>

                      <div>
                        <Label htmlFor="docMinutes" className="text-xs mb-1">
                          Doc minutes/client
                        </Label>
                        <Input
                          id="docMinutes"
                          type="number"
                          value={tempAssumptions.documentationMinutesPerClient}
                          onChange={(e) => handleTempAssumptionChange('documentationMinutesPerClient', parseFloat(e.target.value))}
                          className="text-sm h-8"
                          min="0"
                          max="120"
                        />
                      </div>

                      <div>
                        <Label htmlFor="cancellationRate" className="text-xs mb-1">
                          Cancellation rate (%)
                        </Label>
                        <Input
                          id="cancellationRate"
                          type="number"
                          value={(tempAssumptions.cancellationRate * 100).toFixed(0)}
                          onChange={(e) => handleTempAssumptionChange('cancellationRate', parseFloat(e.target.value) / 100)}
                          className="text-sm h-8"
                          min="0"
                          max="50"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        onClick={handleCancelEdit}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveAssumptions}
                        size="sm"
                        className="bg-nesso-coral hover:bg-nesso-coral/90 text-black text-xs h-7"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Fee Slider Card */}
          <Card className="p-5 border border-nesso-navy/10 shadow-sm">
            <FeeSlider
              value={sessionFee}
              onChange={setSessionFee}
              min={50}
              max={500}
              step={5}
            />
          </Card>

          {/* Week Timeline Card */}
          <Card className="p-5 border border-nesso-navy/10 shadow-sm">
            <WeekTimeline
              sessionHours={plan.breakdown.sessionHours}
              docHours={plan.breakdown.docHours}
              adminHours={plan.breakdown.adminHours}
              totalHours={plan.breakdown.totalHours}
              sustainability={plan.sustainability}
              sustainabilityMessage={plan.sustainabilityMessage}
            />
          </Card>
        </div>
      </main>

      <footer className="bg-nesso-card border-t border-black/5 py-8 mt-12">
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

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ReviewPageContent />
    </Suspense>
  );
}
