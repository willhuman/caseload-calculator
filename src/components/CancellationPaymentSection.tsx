'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectOption } from '@/components/ui/select';
import type { PaidForCancellations, CancellationPayType } from '@/lib/true-rate-types';

interface CancellationPaymentSectionProps {
  paidForCancellations: PaidForCancellations;
  cancellationPayType?: CancellationPayType;
  cancellationPayPercentage?: number;
  inputId: string;
  onPaidChange: (value: PaidForCancellations) => void;
  onPayTypeChange: (value: CancellationPayType | undefined) => void;
  onPayPercentageChange: (value: number) => void;
}

export function CancellationPaymentSection({
  paidForCancellations,
  cancellationPayType,
  cancellationPayPercentage,
  inputId,
  onPaidChange,
  onPayTypeChange,
  onPayPercentageChange,
}: CancellationPaymentSectionProps) {
  return (
    <>
      <div className="space-y-2 lg:space-y-1.5">
        <Label className="text-xs">Do you get paid for No Shows or Late Cancels?</Label>
        <Select
          value={paidForCancellations}
          onChange={(e) => {
            const value = e.target.value as PaidForCancellations;
            onPaidChange(value);
            if (value === 'no') {
              onPayTypeChange(undefined);
              onPayPercentageChange(0);
            }
          }}
          className="text-sm"
        >
          <SelectOption value="no">No</SelectOption>
          <SelectOption value="yes">Yes</SelectOption>
        </Select>
      </div>

      {paidForCancellations === 'yes' && (
        <div className="space-y-2 lg:space-y-1.5">
          <Label className="text-xs">Do you get paid your full rate or partial?</Label>
          <Select
            value={cancellationPayType || ''}
            onChange={(e) => {
              const value = e.target.value as CancellationPayType;
              onPayTypeChange(value || undefined);
              if (value === 'full') {
                onPayPercentageChange(0);
              }
            }}
            className="text-sm"
          >
            <SelectOption value="">Select...</SelectOption>
            <SelectOption value="full">Full rate</SelectOption>
            <SelectOption value="partial">Partial rate</SelectOption>
          </Select>
        </div>
      )}

      {paidForCancellations === 'yes' && cancellationPayType === 'partial' && (
        <div className="space-y-2 lg:space-y-1.5">
          <Label htmlFor={inputId} className="text-xs">What percentage of your rate do you receive?</Label>
          <div className="flex items-center gap-2">
            <Input
              id={inputId}
              type="number"
              min={0}
              max={100}
              value={cancellationPayPercentage || ''}
              onChange={(e) => onPayPercentageChange(parseFloat(e.target.value) || 0)}
              placeholder="50"
              className="w-24 text-sm"
            />
            <span className="text-sm text-nesso-ink/70">%</span>
          </div>
        </div>
      )}
    </>
  );
}
