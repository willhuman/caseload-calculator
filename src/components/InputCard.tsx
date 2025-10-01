import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalculationInputs } from '@/lib/calculations';
import { analytics } from '@/lib/analytics';

interface InputCardProps {
  onCalculate: (inputs: CalculationInputs) => void;
  isCalculating?: boolean;
}

interface FormData {
  weeklyHours: string;
  monthlyIncome: string;
  sessionFee: string;
  noShowRate: string;
}

interface ValidationErrors {
  weeklyHours?: string;
  monthlyIncome?: string;
  sessionFee?: string;
  noShowRate?: string;
}

export function InputCard({ onCalculate, isCalculating = false }: InputCardProps) {
  // Single source of truth - all form data as strings
  const [formData, setFormData] = useState<FormData>({
    weeklyHours: '',
    monthlyIncome: '',
    sessionFee: '',
    noShowRate: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
    weeklyHours: false,
    monthlyIncome: false,
    sessionFee: false,
    noShowRate: false
  });

  // Currency formatting utilities
  const formatCurrency = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';

    // Convert to number and format as currency
    const number = parseInt(digits, 10);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  const parseCurrency = (value: string): number => {
    // Remove currency symbols and parse
    const digits = value.replace(/\D/g, '');
    return parseInt(digits, 10) || 0;
  };

  // Parse form data to calculation inputs
  const parseFormData = (): CalculationInputs => {
    return {
      weeklyHours: parseFloat(formData.weeklyHours) || 0,
      monthlyIncome: parseCurrency(formData.monthlyIncome),
      sessionFee: parseCurrency(formData.sessionFee),
      noShowRate: parseFloat(formData.noShowRate) || 0
    };
  };

  // Validation functions
  const validateField = (name: keyof FormData, value: string): string | undefined => {
    const trimmedValue = value.trim();

    switch (name) {
      case 'weeklyHours':
        if (!trimmedValue) return 'Weekly hours is required';
        const hours = parseFloat(trimmedValue);
        if (isNaN(hours) || hours <= 0) return 'Weekly hours must be greater than 0';
        if (hours > 80) return 'Weekly hours should be realistic (≤80)';
        break;
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
      case 'noShowRate':
        if (!trimmedValue) return 'No-show rate is required';
        const rate = parseFloat(trimmedValue);
        if (isNaN(rate) || rate < 0) return 'No-show rate cannot be negative';
        if (rate > 50) return 'No-show rate seems too high (>50%)';
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

  // Form validation - check for meaningful input
  const isFormValid = (): boolean => {
    // Check if all fields have content
    const hasAllContent = Object.values(formData).every(value => value.trim() !== '');
    if (!hasAllContent) {
      return false;
    }

    // Validate each field fresh to ensure no stale errors
    const fieldsToValidate: Array<keyof FormData> = ['weeklyHours', 'monthlyIncome', 'sessionFee', 'noShowRate'];
    const hasValidationErrors = fieldsToValidate.some(field => {
      const error = validateField(field, formData[field]);
      return error !== undefined;
    });

    if (hasValidationErrors) {
      return false;
    }

    // Parse and validate numeric values
    try {
      const parsed = parseFormData();
      return (
        parsed.weeklyHours > 0 && parsed.weeklyHours <= 80 &&
        parsed.monthlyIncome > 0 &&
        parsed.sessionFee > 0 &&
        parsed.noShowRate >= 0 && parsed.noShowRate <= 50
      );
    } catch {
      return false;
    }
  };

  const handleInputChange = (name: keyof FormData, value: string) => {
    let processedValue = value;

    // Apply currency formatting for currency fields
    if (name === 'monthlyIncome' || name === 'sessionFee') {
      processedValue = formatCurrency(value);
    }

    // Update form data
    setFormData(prev => ({ ...prev, [name]: processedValue }));

    // Always validate the field and clear errors when valid
    const error = validateField(name, processedValue);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[name] = error;
      } else {
        // Clear the error if field is now valid
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

    // Mark all fields as touched
    setTouched({
      weeklyHours: true,
      monthlyIncome: true,
      sessionFee: true,
      noShowRate: true
    });

    if (validateAllFields()) {
      const calculationInputs = parseFormData();
      analytics.calculateClicked(calculationInputs);
      onCalculate(calculationInputs);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-nesso-card rounded-2xl ring-1 ring-black/5 shadow-sm">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Goals Column */}
            <div className="space-y-6">
              <div className="border-b border-nesso-navy/10 pb-3">
                <h2 className="text-lg font-semibold text-nesso-navy">Goals</h2>
                <p className="text-sm text-nesso-ink/60">What you want to achieve</p>
              </div>

              {/* Weekly Hours */}
              <div className="space-y-2">
                <Label
                  htmlFor="weeklyHours"
                  className="text-sm font-medium text-nesso-navy"
                >
                  Weekly work hours
                </Label>
                <p className="text-xs text-nesso-ink/60">Include both client sessions and admin time</p>
                <Input
                  id="weeklyHours"
                  type="number"
                  min="1"
                  max="80"
                  value={formData.weeklyHours}
                  onChange={(e) => handleInputChange('weeklyHours', e.target.value)}
                  onBlur={() => handleBlur('weeklyHours')}
                  className={`transition-colors placeholder:text-nesso-ink/40 ${
                    errors.weeklyHours && touched.weeklyHours
                      ? 'border-red-500 focus:border-red-500'
                      : 'focus:border-nesso-peach'
                  }`}
                  aria-describedby={errors.weeklyHours && touched.weeklyHours ? 'weeklyHours-error' : undefined}
                  placeholder="30"
                />
                {errors.weeklyHours && touched.weeklyHours && (
                  <p id="weeklyHours-error" className="text-sm text-red-600" role="alert">
                    {errors.weeklyHours}
                  </p>
                )}
              </div>

              {/* Monthly Income */}
              <div className="space-y-2">
                <Label
                  htmlFor="monthlyIncome"
                  className="text-sm font-medium text-nesso-navy"
                >
                  Desired income per month
                </Label>
                <p className="text-xs text-nesso-ink/60">Your monthly pre-tax income target</p>
                <Input
                  id="monthlyIncome"
                  type="text"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                  onBlur={() => handleBlur('monthlyIncome')}
                  className={`transition-colors placeholder:text-nesso-ink/40 ${
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
            </div>

            {/* Details Column */}
            <div className="space-y-6">
              <div className="border-b border-nesso-navy/10 pb-3">
                <h2 className="text-lg font-semibold text-nesso-navy">Details</h2>
                <p className="text-sm text-nesso-ink/60">About your current practice</p>
              </div>

              {/* Session Fee */}
              <div className="space-y-2">
                <Label
                  htmlFor="sessionFee"
                  className="text-sm font-medium text-nesso-navy"
                >
                  Current session fee
                </Label>
                <p className="text-xs text-nesso-ink/60">Average fee for both self-pay and insurance sessions</p>
                <Input
                  id="sessionFee"
                  type="text"
                  value={formData.sessionFee}
                  onChange={(e) => handleInputChange('sessionFee', e.target.value)}
                  onBlur={() => handleBlur('sessionFee')}
                  className={`transition-colors placeholder:text-nesso-ink/40 ${
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

              {/* No Show Rate */}
              <div className="space-y-2">
                <Label
                  htmlFor="noShowRate"
                  className="text-sm font-medium text-nesso-navy"
                >
                  In a typical week, how many clients cancel or no-show?
                </Label>
                <p className="text-xs text-nesso-ink/60">Average number of cancellations per week</p>
                <Input
                  id="noShowRate"
                  type="number"
                  min="0"
                  max="50"
                  step="1"
                  value={formData.noShowRate}
                  onChange={(e) => handleInputChange('noShowRate', e.target.value)}
                  onBlur={() => handleBlur('noShowRate')}
                  className={`transition-colors placeholder:text-nesso-ink/40 ${
                    errors.noShowRate && touched.noShowRate
                      ? 'border-red-500 focus:border-red-500'
                      : 'focus:border-nesso-peach'
                  }`}
                  aria-describedby={errors.noShowRate && touched.noShowRate ? 'noShowRate-error' : undefined}
                  placeholder="2"
                />
                {errors.noShowRate && touched.noShowRate && (
                  <p id="noShowRate-error" className="text-sm text-red-600" role="alert">
                    {errors.noShowRate}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              disabled={!isFormValid() || isCalculating}
              className="px-8 py-3 h-12 rounded-xl bg-nesso-coral hover:bg-nesso-coral/90 text-black font-medium transition-colors focus:ring-2 focus:ring-nesso-coral disabled:opacity-50 disabled:cursor-not-allowed"
              data-event="calculate-clicked"
              aria-label={isCalculating ? 'Calculating...' : 'Calculate caseload'}
            >
              {isCalculating ? 'Calculating...' : 'Calculate'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}