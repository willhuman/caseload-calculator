'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { analytics } from '@/lib/analytics';

interface FormData {
  monthlyIncome: string;
  sessionFee: string;
}

interface ValidationErrors {
  monthlyIncome?: string;
  sessionFee?: string;
}

function PlanPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize from URL params if present
  const [formData, setFormData] = useState<FormData>({
    monthlyIncome: searchParams.get('income') ? `$${searchParams.get('income')}` : '',
    sessionFee: searchParams.get('fee') ? `$${searchParams.get('fee')}` : ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
    monthlyIncome: false,
    sessionFee: false
  });

  // Currency formatting utilities
  const formatCurrency = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    const number = parseInt(digits, 10);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  const parseCurrency = (value: string): number => {
    const digits = value.replace(/\D/g, '');
    return parseInt(digits, 10) || 0;
  };

  const validateField = (name: keyof FormData, value: string): string | undefined => {
    const trimmedValue = value.trim();

    switch (name) {
      case 'monthlyIncome':
        if (!trimmedValue) return 'Monthly income is required';
        const income = parseCurrency(trimmedValue);
        if (income <= 0) return 'Monthly income must be greater than 0';
        break;
      case 'sessionFee':
        if (!trimmedValue) return 'Session fee is required';
        const fee = parseCurrency(trimmedValue);
        if (fee <= 0) return 'Session fee must be greater than 0';
        break;
    }
    return undefined;
  };

  const validateAllFields = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof FormData>).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const isFormValid = (): boolean => {
    const hasAllContent = Object.values(formData).every(value => value.trim() !== '');
    if (!hasAllContent) return false;

    const fieldsToValidate: Array<keyof FormData> = ['monthlyIncome', 'sessionFee'];
    const hasValidationErrors = fieldsToValidate.some(field => {
      const error = validateField(field, formData[field]);
      return error !== undefined;
    });

    if (hasValidationErrors) return false;

    try {
      const income = parseCurrency(formData.monthlyIncome);
      const fee = parseCurrency(formData.sessionFee);
      return income > 0 && fee > 0;
    } catch {
      return false;
    }
  };

  const handleInputChange = (name: keyof FormData, value: string) => {
    const processedValue = formatCurrency(value);
    setFormData(prev => ({ ...prev, [name]: processedValue }));

    const error = validateField(name, processedValue);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[name] = error;
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
  };

  const handleBlur = (name: keyof FormData) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      monthlyIncome: true,
      sessionFee: true
    });

    if (validateAllFields()) {
      const income = parseCurrency(formData.monthlyIncome);
      const fee = parseCurrency(formData.sessionFee);

      analytics.calculateClicked({
        weeklyHours: 0, // Not used in new version
        monthlyIncome: income,
        sessionFee: fee,
        noShowRate: 0 // Not used in new version
      });

      // Navigate to review with query params
      const params = new URLSearchParams({
        income: income.toString(),
        fee: fee.toString()
      });

      router.push(`/review?${params.toString()}`);
    }
  };

  return (
    <div className="min-h-screen bg-nesso-bg flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto max-w-6xl px-4 py-8 md:py-12 space-y-8 md:space-y-10">
        {/* Hero Section */}
        <section className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-nesso-navy">
            Plan your sustainable caseload
          </h1>
        </section>

        {/* Input Form */}
        <section>
          <Card className="w-full max-w-xl mx-auto bg-nesso-card rounded-xl ring-1 ring-black/5 shadow-sm">
            <CardContent className="p-5 md:p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Monthly Income */}
                <div className="space-y-1.5">
                  <Label htmlFor="monthlyIncome" className="text-sm font-medium text-nesso-navy">
                    Desired income per month
                  </Label>
                  <Input
                    id="monthlyIncome"
                    type="text"
                    value={formData.monthlyIncome}
                    onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                    onBlur={() => handleBlur('monthlyIncome')}
                    className={`transition-colors placeholder:text-nesso-ink/40 h-11 ${
                      errors.monthlyIncome && touched.monthlyIncome
                        ? 'border-red-500 focus:border-red-500'
                        : 'focus:border-nesso-peach'
                    }`}
                    aria-describedby={errors.monthlyIncome && touched.monthlyIncome ? 'monthlyIncome-error' : undefined}
                    placeholder="$8,000"
                  />
                  {errors.monthlyIncome && touched.monthlyIncome && (
                    <p id="monthlyIncome-error" className="text-sm text-red-600" role="alert">
                      {errors.monthlyIncome}
                    </p>
                  )}
                </div>

                {/* Session Fee */}
                <div className="space-y-1.5">
                  <Label htmlFor="sessionFee" className="text-sm font-medium text-nesso-navy">
                    Current session fee
                  </Label>
                  <Input
                    id="sessionFee"
                    type="text"
                    value={formData.sessionFee}
                    onChange={(e) => handleInputChange('sessionFee', e.target.value)}
                    onBlur={() => handleBlur('sessionFee')}
                    className={`transition-colors placeholder:text-nesso-ink/40 h-11 ${
                      errors.sessionFee && touched.sessionFee
                        ? 'border-red-500 focus:border-red-500'
                        : 'focus:border-nesso-peach'
                    }`}
                    aria-describedby={errors.sessionFee && touched.sessionFee ? 'sessionFee-error' : undefined}
                    placeholder="$150"
                  />
                  {errors.sessionFee && touched.sessionFee && (
                    <p id="sessionFee-error" className="text-sm text-red-600" role="alert">
                      {errors.sessionFee}
                    </p>
                  )}
                </div>

                <div className="flex justify-center pt-3">
                  <Button
                    type="submit"
                    disabled={!isFormValid()}
                    className="w-full md:w-auto px-8 py-2.5 h-11 rounded-xl bg-nesso-coral hover:bg-nesso-coral/90 text-black font-medium transition-colors focus:ring-2 focus:ring-nesso-coral disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Calculate
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-nesso-card border-t border-black/5 py-8">
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

export default function PlanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PlanPageContent />
    </Suspense>
  );
}
