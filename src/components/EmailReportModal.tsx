'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalculationResults, CalculationInputs } from '@/lib/calculations';
import { analytics } from '@/lib/analytics';
import { toast } from 'sonner';

interface EmailReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: CalculationResults;
  inputs: CalculationInputs;
}

// Function stub for backend integration
async function sendReport(email: string, results: CalculationResults, inputs: CalculationInputs): Promise<void> {
  // TODO: Replace with actual API call
  console.log('Sending report to:', email);
  console.log('Report data:', { results, inputs });

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // For demo purposes, just log the payload
  console.log('Report sent successfully');
}

export function EmailReportModal({ isOpen, onClose, results, inputs }: EmailReportModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }
    // Block @icloud email addresses
    if (email.toLowerCase().includes('@icloud.com')) {
      return false;
    }
    return true;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);

    // Clear errors if the field is empty
    if (!value) {
      setEmailError('');
      return;
    }

    // Real-time validation as user types
    if (value && !validateEmail(value)) {
      if (value.toLowerCase().includes('@icloud.com')) {
        setEmailError('iCloud email addresses are not supported. Please use a different email provider.');
      } else if (value.includes('@') && !(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) {
        setEmailError('Please enter a valid email address');
      }
    } else if (value && validateEmail(value)) {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      if (email.toLowerCase().includes('@icloud.com')) {
        setEmailError('iCloud email addresses are not supported. Please use a different email provider.');
      } else {
        setEmailError('Please enter a valid email address');
      }
      return;
    }

    setIsSubmitting(true);

    try {
      await sendReport(email, results, inputs);
      analytics.emailReportSubmitted(email);

      toast.success('Report sent successfully!', {
        description: 'Check your email for your detailed caseload analysis.'
      });

      // Close modal and reset form
      onClose();
      setEmail('');
      setEmailError('');
    } catch (error) {
      console.error('Failed to send report:', error);
      toast.error('Failed to send report', {
        description: 'Please try again or contact support if the problem persists.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setEmail('');
      setEmailError('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-nesso-navy">
            Get Your Full Report
          </DialogTitle>
          <DialogDescription>
            Enter your email to receive a detailed PDF report with your caseload analysis,
            recommendations, and actionable insights.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-nesso-navy">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className={`transition-colors placeholder:text-nesso-ink/30 ${
                emailError
                  ? 'border-red-500 focus:border-red-500'
                  : 'focus:border-nesso-blue'
              }`}
              aria-describedby={emailError ? 'email-error' : undefined}
              disabled={isSubmitting}
            />
            {emailError && (
              <p id="email-error" className="text-sm text-red-600" role="alert">
                {emailError}
              </p>
            )}
          </div>

          <div className="bg-nesso-bg p-4 rounded-lg text-xs text-nesso-ink/80">
            <p className="font-medium mb-2">What you&apos;ll receive:</p>
            <ul className="space-y-1">
              <li>• Detailed caseload breakdown and sustainability analysis</li>
              <li>• Revenue optimization recommendations</li>
              <li>• Workload management strategies</li>
              <li>• Customizable planning templates</li>
            </ul>
          </div>

          <div className="text-xs text-nesso-ink/60">
            By submitting this form, you agree to our{' '}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-nesso-peach hover:underline underline-offset-2"
              onClick={(e) => e.stopPropagation()}
            >
              Privacy Policy
            </a>{' '}
            and{' '}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-nesso-peach hover:underline underline-offset-2"
              onClick={(e) => e.stopPropagation()}
            >
              Terms of Service
            </a>
            .
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !email || !validateEmail(email)}
              className="bg-nesso-coral hover:bg-nesso-coral/90 focus:ring-2 focus:ring-nesso-coral text-black"
              data-event="email-report-submitted"
            >
              {isSubmitting ? 'Sending...' : 'Send Report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}