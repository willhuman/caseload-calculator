"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import type { ProjectionResults } from "@/lib/types";

interface LiveResultsDashboardProps {
  results: ProjectionResults | null;
}

export function LiveResultsDashboard({ results }: LiveResultsDashboardProps) {
  if (!results) {
    return (
      <Card className="bg-sand/50 border-2 border-dashed border-gray-300">
        <CardContent className="py-6 lg:py-12 text-center">
          <p className="text-sm lg:text-base text-gray-500">
            Adjust your inputs to see your income projections
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="financial-projections-card" style={{ backgroundColor: '#E0EAE0' }} aria-live="polite" aria-atomic="true">
      <CardHeader>
        <CardTitle>Your Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 lg:space-y-4">
        {/* Financial Summary */}
        <div className="space-y-4 lg:space-y-2.5">
          <h3 className="text-base font-semibold text-nesso-ink">Financial Summary</h3>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Monthly Average
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Revenue</span>
              <span className="font-semibold text-navy">
                {formatCurrency(results.monthlyAverageGrossIncome)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Expenses</span>
              <span className="font-semibold text-red-600">
                -{formatCurrency(results.monthlyAverageExpenses)}
              </span>
            </div>
            <div className="h-px bg-navy/20" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-navy">Net Income</span>
              <span className="text-2xl lg:text-lg font-bold text-navy">
                {formatCurrency(results.monthlyAverageNetIncome)}
              </span>
            </div>
          </div>
        </div>

        {/* Yearly Breakdown */}
        <div className="pt-3 border-t border-navy/20">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Yearly Total
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Revenue</span>
              <span className="font-semibold text-navy">
                {formatCurrency(results.yearlyTotalGrossIncome)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Expenses</span>
              <span className="font-semibold text-red-600">
                -{formatCurrency(results.yearlyTotalExpenses)}
              </span>
            </div>
            <div className="h-px bg-navy/20" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-navy">Net Income</span>
              <span className="text-2xl lg:text-lg font-bold text-navy">
                {formatCurrency(results.yearlyTotalNetIncome)}
              </span>
            </div>
          </div>
        </div>

        {/* Tip for adding expenses */}
        {!results.hasExpenses && (
          <div className="mt-2">
            <p className="text-xs text-navy/70">
              💡 Add your business expenses in the <strong>Expenses</strong> tab to get a more accurate view of your net income.
            </p>
          </div>
        )}

        {/* Your Weekly Workload */}
        <div className="pt-3 lg:pt-2.5 border-t border-navy/20 space-y-4 lg:space-y-2.5">
          <h3 className="text-base font-semibold text-nesso-ink">Your Weekly Workload</h3>
          <div className="space-y-3 lg:space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Time with clients ({results.attendedSessionsPerWeek} sessions)
              </span>
              <span className="font-semibold text-navy">
                {results.sessionHoursPerWeek}h
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Documentation & admin</span>
              <span className="font-semibold text-navy">
                {results.docAdminHoursPerWeek}h
              </span>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-navy">Total work hours</span>
              <span className="text-lg lg:text-sm font-bold text-navy">
                {results.totalHoursPerWeek}h/week
              </span>
            </div>
          </div>
        </div>

        {/* Working Weeks */}
        <div className="pt-3 lg:pt-2.5 border-t border-navy/20 space-y-4 lg:space-y-2.5">
          <h3 className="text-base font-semibold text-nesso-ink">Working Weeks</h3>
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">🗓️</span>
            <div className="flex-1">
              <p className="text-sm text-navy font-medium">
                Your plan includes <strong>{results.workingWeeksPerYear} working weeks</strong> this year.
              </p>
              {results.workingWeeksPerYear === 52 && (
                <p className="text-xs text-navy/70 mt-2">
                  Right now your plan includes working all year. If you want a more realistic estimate, try adding some weeks off to account for holidays, vacation, etc.
                </p>
              )}
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
