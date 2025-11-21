"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { ExpenseInputs as ExpenseInputsType } from "@/lib/types";

interface ExpenseInputsProps {
  expenses: ExpenseInputsType;
  onChange: (expenses: ExpenseInputsType) => void;
}

export function ExpenseInputs({ expenses, onChange }: ExpenseInputsProps) {
  const handleExpenseChange = (field: keyof Omit<ExpenseInputsType, 'customExpenses'>, value: string) => {
    const numValue = parseFloat(value) || 0;
    onChange({
      ...expenses,
      [field]: numValue,
    });
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>, field: keyof Omit<ExpenseInputsType, 'customExpenses'>) => {
    if (e.target.value === '0') {
      e.target.value = '';
      handleExpenseChange(field, '');
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>, field: keyof Omit<ExpenseInputsType, 'customExpenses'>) => {
    if (e.target.value === '') {
      handleExpenseChange(field, '0');
    }
  };

  const handleCustomExpenseFocus = (e: React.FocusEvent<HTMLInputElement>, currentValue: number) => {
    if (currentValue === 0) {
      e.target.value = '';
    }
  };

  const handleCustomExpenseBlur = (e: React.FocusEvent<HTMLInputElement>, expenseId: string, onChange: (value: number) => void) => {
    if (e.target.value === '') {
      onChange(0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Expenses</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Monthly Expenses */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-navy">Monthly Expenses</h3>

            <div className="space-y-2">
              <Label htmlFor="rentUtilities">Office Rent and Utilities</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: expenses.rentUtilities === 0 ? 'rgb(156 163 175)' : 'rgb(107 114 128)' }}>$</span>
                <Input
                  id="rentUtilities"
                  type="number"
                  min="0"
                  step="1"
                  value={expenses.rentUtilities || ''}
                  onChange={(e) => handleExpenseChange("rentUtilities", e.target.value)}
                  onFocus={(e) => handleFocus(e, "rentUtilities")}
                  onBlur={(e) => handleBlur(e, "rentUtilities")}
                  className="pl-7 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  style={{ color: expenses.rentUtilities === 0 ? 'rgb(156 163 175)' : 'inherit' }}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="marketing">Marketing (Google Ads, Website, etc.)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: expenses.marketing === 0 ? 'rgb(156 163 175)' : 'rgb(107 114 128)' }}>$</span>
                <Input
                  id="marketing"
                  type="number"
                  min="0"
                  step="1"
                  value={expenses.marketing || ''}
                  onChange={(e) => handleExpenseChange("marketing", e.target.value)}
                  onFocus={(e) => handleFocus(e, "marketing")}
                  onBlur={(e) => handleBlur(e, "marketing")}
                  className="pl-7 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  style={{ color: expenses.marketing === 0 ? 'rgb(156 163 175)' : 'inherit' }}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="software">Software Tools (EHR, CRM, etc.)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: expenses.software === 0 ? 'rgb(156 163 175)' : 'rgb(107 114 128)' }}>$</span>
                <Input
                  id="software"
                  type="number"
                  min="0"
                  step="1"
                  value={expenses.software || ''}
                  onChange={(e) => handleExpenseChange("software", e.target.value)}
                  onFocus={(e) => handleFocus(e, "software")}
                  onBlur={(e) => handleBlur(e, "software")}
                  className="pl-7 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  style={{ color: expenses.software === 0 ? 'rgb(156 163 175)' : 'inherit' }}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="insurance">Liability Insurance</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: expenses.insurance === 0 ? 'rgb(156 163 175)' : 'rgb(107 114 128)' }}>$</span>
                <Input
                  id="insurance"
                  type="number"
                  min="0"
                  step="1"
                  value={expenses.insurance || ''}
                  onChange={(e) => handleExpenseChange("insurance", e.target.value)}
                  onFocus={(e) => handleFocus(e, "insurance")}
                  onBlur={(e) => handleBlur(e, "insurance")}
                  className="pl-7 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  style={{ color: expenses.insurance === 0 ? 'rgb(156 163 175)' : 'inherit' }}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otherMonthly">Other Expenses</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: (expenses.customExpenses.find(e => e.id === 'other-monthly')?.amount || 0) === 0 ? 'rgb(156 163 175)' : 'rgb(107 114 128)' }}>$</span>
                <Input
                  id="otherMonthly"
                  type="number"
                  min="0"
                  step="1"
                  value={expenses.customExpenses.find(e => e.id === 'other-monthly')?.amount || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    const otherExpenses = expenses.customExpenses.filter(e => e.id !== 'other-monthly');
                    if (value > 0) {
                      otherExpenses.push({
                        id: 'other-monthly',
                        name: 'Other Monthly Expenses',
                        amount: value,
                        frequency: 'monthly'
                      });
                    }
                    onChange({
                      ...expenses,
                      customExpenses: otherExpenses
                    });
                  }}
                  onFocus={(e) => handleCustomExpenseFocus(e, expenses.customExpenses.find(exp => exp.id === 'other-monthly')?.amount || 0)}
                  onBlur={(e) => handleCustomExpenseBlur(e, 'other-monthly', (value) => {
                    const otherExpenses = expenses.customExpenses.filter(exp => exp.id !== 'other-monthly');
                    if (value > 0) {
                      otherExpenses.push({
                        id: 'other-monthly',
                        name: 'Other Monthly Expenses',
                        amount: value,
                        frequency: 'monthly'
                      });
                    }
                    onChange({
                      ...expenses,
                      customExpenses: otherExpenses
                    });
                  })}
                  className="pl-7 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  style={{ color: (expenses.customExpenses.find(e => e.id === 'other-monthly')?.amount || 0) === 0 ? 'rgb(156 163 175)' : 'inherit' }}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Annual Expenses */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-navy">Annual Expenses</h3>

            <div className="space-y-2">
              <Label htmlFor="continuingEd">Continuing Education</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: expenses.continuingEd === 0 ? 'rgb(156 163 175)' : 'rgb(107 114 128)' }}>$</span>
                <Input
                  id="continuingEd"
                  type="number"
                  min="0"
                  step="1"
                  value={expenses.continuingEd || ''}
                  onChange={(e) => handleExpenseChange("continuingEd", e.target.value)}
                  onFocus={(e) => handleFocus(e, "continuingEd")}
                  onBlur={(e) => handleBlur(e, "continuingEd")}
                  className="pl-7 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  style={{ color: expenses.continuingEd === 0 ? 'rgb(156 163 175)' : 'inherit' }}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conferences">Conferences & Training</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: expenses.conferences === 0 ? 'rgb(156 163 175)' : 'rgb(107 114 128)' }}>$</span>
                <Input
                  id="conferences"
                  type="number"
                  min="0"
                  step="1"
                  value={expenses.conferences || ''}
                  onChange={(e) => handleExpenseChange("conferences", e.target.value)}
                  onFocus={(e) => handleFocus(e, "conferences")}
                  onBlur={(e) => handleBlur(e, "conferences")}
                  className="pl-7 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  style={{ color: expenses.conferences === 0 ? 'rgb(156 163 175)' : 'inherit' }}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otherAnnual">Other Expenses</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: (expenses.customExpenses.find(e => e.id === 'other-annual')?.amount || 0) === 0 ? 'rgb(156 163 175)' : 'rgb(107 114 128)' }}>$</span>
                <Input
                  id="otherAnnual"
                  type="number"
                  min="0"
                  step="1"
                  value={expenses.customExpenses.find(e => e.id === 'other-annual')?.amount || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    const otherExpenses = expenses.customExpenses.filter(e => e.id !== 'other-annual');
                    if (value > 0) {
                      otherExpenses.push({
                        id: 'other-annual',
                        name: 'Other Annual Expenses',
                        amount: value,
                        frequency: 'annual'
                      });
                    }
                    onChange({
                      ...expenses,
                      customExpenses: otherExpenses
                    });
                  }}
                  onFocus={(e) => handleCustomExpenseFocus(e, expenses.customExpenses.find(exp => exp.id === 'other-annual')?.amount || 0)}
                  onBlur={(e) => handleCustomExpenseBlur(e, 'other-annual', (value) => {
                    const otherExpenses = expenses.customExpenses.filter(exp => exp.id !== 'other-annual');
                    if (value > 0) {
                      otherExpenses.push({
                        id: 'other-annual',
                        name: 'Other Annual Expenses',
                        amount: value,
                        frequency: 'annual'
                      });
                    }
                    onChange({
                      ...expenses,
                      customExpenses: otherExpenses
                    });
                  })}
                  className="pl-7 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  style={{ color: (expenses.customExpenses.find(e => e.id === 'other-annual')?.amount || 0) === 0 ? 'rgb(156 163 175)' : 'inherit' }}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-sand">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-navy">Total Monthly Expenses</span>
            <span className="text-lg font-semibold text-navy">
              ${calculateTotalMonthly(expenses).toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function calculateTotalMonthly(expenses: ExpenseInputsType): number {
  const monthly =
    expenses.rentUtilities +
    expenses.marketing +
    expenses.software +
    expenses.insurance;

  const annualProrated = (expenses.continuingEd + expenses.conferences) / 12;

  // Add custom expenses
  let customTotal = 0;
  expenses.customExpenses.forEach((exp) => {
    if (exp.frequency === 'monthly') {
      customTotal += exp.amount;
    } else {
      customTotal += exp.amount / 12;
    }
  });

  return Math.round(monthly + annualProrated + customTotal);
}
