'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormData {
  monthlyIncome: string;
  weeklyHours: string;
}

interface ValidationErrors {
  monthlyIncome?: string;
  weeklyHours?: string;
}

function PlanPageContent() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    monthlyIncome: '',
    weeklyHours: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  // Currency formatting
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

  const parseHours = (value: string): number => {
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
        if (income < 1000) return 'Monthly income seems low - please check';
        break;
      case 'weeklyHours':
        if (!trimmedValue) return 'Weekly hours is required';
        const hours = parseHours(trimmedValue);
        if (hours <= 0) return 'Weekly hours must be greater than 0';
        if (hours > 80) return 'Weekly hours seems very high - please check';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'monthlyIncome') {
      const formatted = formatCurrency(value);
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAllFields()) {
      return;
    }

    const income = parseCurrency(formData.monthlyIncome);
    const hours = parseHours(formData.weeklyHours);

    // Navigate to review page with goals
    const params = new URLSearchParams({
      income: income.toString(),
      hours: hours.toString()
    });

    router.push(`/review?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-nesso-sand/30 to-white">
      <Header />

      <main className="max-w-2xl mx-auto px-4 pt-12 pb-24">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-nesso-ink mb-4">
            What are your goals?
          </h1>
          <p className="text-lg text-nesso-ink/70">
            Tell us what you want, and we&apos;ll show you what it takes.
          </p>
        </div>

        {/* Form Card */}
        <Card className="border-2 border-nesso-navy/10 shadow-lg">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Monthly Income */}
              <div className="space-y-3">
                <Label htmlFor="monthlyIncome" className="text-base font-medium flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  Monthly income goal
                </Label>
                <Input
                  id="monthlyIncome"
                  name="monthlyIncome"
                  type="text"
                  placeholder="$8,000"
                  value={formData.monthlyIncome}
                  onChange={handleChange}
                  className={`text-xl py-6 placeholder:text-gray-400 ${errors.monthlyIncome ? 'border-red-500' : ''}`}
                />
                {errors.monthlyIncome && (
                  <p className="text-sm text-red-600">{errors.monthlyIncome}</p>
                )}
              </div>

              {/* Weekly Hours */}
              <div className="space-y-3">
                <Label htmlFor="weeklyHours" className="text-base font-medium flex items-center gap-2">
                  <span className="text-2xl">⏰</span>
                  Weekly hours goal
                </Label>
                <div className="relative">
                  <Input
                    id="weeklyHours"
                    name="weeklyHours"
                    type="number"
                    placeholder="30"
                    value={formData.weeklyHours}
                    onChange={handleChange}
                    className={`text-xl py-6 placeholder:text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${errors.weeklyHours ? 'border-red-500' : ''}`}
                    min="1"
                    max="80"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-nesso-ink/50">
                    hours
                  </span>
                </div>
                {errors.weeklyHours && (
                  <p className="text-sm text-red-600">{errors.weeklyHours}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full py-6 text-lg bg-nesso-coral hover:bg-nesso-coral/90 text-black font-semibold rounded-xl transition-colors"
              >
                Calculate my plan →
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

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
