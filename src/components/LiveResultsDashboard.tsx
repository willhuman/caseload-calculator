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
    <div className="space-y-3 lg:space-y-4">
      {/* Main Financial Projections */}
      <Card id="financial-projections-card" className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-navy/20">
        <CardHeader className="pb-2 lg:pb-3">
          <CardTitle className="text-navy text-base lg:text-lg">Financial Projections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 lg:space-y-4">
          {/* Monthly Breakdown */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Monthly Average
            </h4>
            <div className="space-y-2">
              {!results.hasExpenses ? (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Revenue</span>
                  <span className="text-2xl font-bold text-navy">
                    {formatCurrency(results.monthlyAverageGrossIncome)}
                  </span>
                </div>
              ) : (
                <>
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
                    <span className="text-2xl font-bold text-navy">
                      {formatCurrency(results.monthlyAverageNetIncome)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Yearly Breakdown */}
          <div className="pt-3 border-t border-navy/20">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Yearly Total
            </h4>
            <div className="space-y-2">
              {!results.hasExpenses ? (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Revenue</span>
                  <span className="text-2xl font-bold text-navy">
                    {formatCurrency(results.yearlyTotalGrossIncome)}
                  </span>
                </div>
              ) : (
                <>
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
                    <span className="text-2xl font-bold text-navy">
                      {formatCurrency(results.yearlyTotalNetIncome)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tip for adding expenses */}
          {!results.hasExpenses && (
            <div className="pt-3 border-t border-navy/20">
              <p className="text-xs text-navy">
                💡 Add your business expenses in the <strong>Expenses</strong> tab to see your net income calculations.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Hours Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Weekly Time Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
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
              <span className="text-lg font-bold text-navy">
                {results.totalHoursPerWeek}h/week
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Working Weeks Info */}
      {results.workingWeeksPerYear < 52 && (
        <Card className="bg-blue/5 border-blue/20">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📅</div>
              <div className="flex-1">
                <p className="text-sm text-navy font-medium">
                  Vacation time: {52 - results.workingWeeksPerYear} weeks per year
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Working {results.workingWeeksPerYear} weeks per year
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
