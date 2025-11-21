"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { TimeOffInputs as TimeOffInputsType } from "@/lib/types";

interface TimeOffInputsProps {
  timeOff: TimeOffInputsType;
  onChange: (timeOff: TimeOffInputsType) => void;
}

export function TimeOffInputs({ timeOff, onChange }: TimeOffInputsProps) {
  const workingWeeks = 52 - timeOff.vacationWeeks;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Off Planning</CardTitle>
        <CardDescription>
          Plan for vacation and see how it affects your caseload
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="vacationWeeks">Weeks of Vacation Per Year</Label>
            <span className="text-2xl font-bold text-navy">
              {timeOff.vacationWeeks}
            </span>
          </div>

          <Slider
            id="vacationWeeks"
            min={0}
            max={12}
            step={1}
            value={[timeOff.vacationWeeks]}
            onValueChange={(value) =>
              onChange({
                ...timeOff,
                vacationWeeks: value[0],
              })
            }
            className="py-4"
          />

          <div className="flex justify-between text-sm text-gray-600">
            <span>0 weeks</span>
            <span>12 weeks</span>
          </div>
        </div>

        <div className="pt-4 border-t border-sand space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-navy">Working weeks per year</span>
            <span className="text-lg font-semibold text-navy">{workingWeeks} weeks</span>
          </div>

          {timeOff.vacationWeeks > 0 && (
            <div className="bg-blue/10 border border-blue/20 rounded-lg p-4">
              <p className="text-sm text-navy">
                Your income projections are calculated across {workingWeeks} working weeks,
                with vacation time excluded from the calculations.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
