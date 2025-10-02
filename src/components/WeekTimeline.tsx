import React from 'react';

interface WeekTimelineProps {
  sessionHours: number;
  docHours: number;
  adminHours: number;
  totalHours: number;
  sustainability?: 'sustainable' | 'not-sustainable';
  sustainabilityMessage?: string;
}

export function WeekTimeline({
  sessionHours,
  docHours,
  adminHours,
  totalHours,
  sustainability,
  sustainabilityMessage
}: WeekTimelineProps) {
  // Calculate percentages for visual display
  const sessionPercent = (sessionHours / totalHours) * 100;
  const docPercent = (docHours / totalHours) * 100;
  const adminPercent = (adminHours / totalHours) * 100;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-nesso-navy">Here&apos;s what your week would look like</h3>

      {/* Visual Bar */}
      <div className="relative h-12 rounded-lg overflow-hidden bg-nesso-sand/20 flex">
        {/* Sessions */}
        <div
          className="bg-nesso-navy h-full flex items-center justify-center text-white text-sm font-medium transition-all duration-300"
          style={{ width: `${sessionPercent}%` }}
        >
          {sessionPercent > 15 && `${sessionHours}h`}
        </div>

        {/* Documentation */}
        <div
          className="bg-nesso-purple h-full flex items-center justify-center text-white text-sm font-medium transition-all duration-300"
          style={{ width: `${docPercent}%` }}
        >
          {docPercent > 15 && `${docHours}h`}
        </div>

        {/* Admin */}
        <div
          className="bg-nesso-coral h-full flex items-center justify-center text-black text-sm font-medium transition-all duration-300"
          style={{ width: `${adminPercent}%` }}
        >
          {adminPercent > 15 && `${adminHours}h`}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-nesso-navy"></div>
          <div>
            <div className="font-medium text-nesso-ink">{sessionHours} hours</div>
            <div className="text-nesso-ink/60">Sessions with clients</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-nesso-purple"></div>
          <div>
            <div className="font-medium text-nesso-ink">{docHours} hours</div>
            <div className="text-nesso-ink/60">Notes and documentation</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-nesso-coral"></div>
          <div>
            <div className="font-medium text-nesso-ink">{adminHours} hours</div>
            <div className="text-nesso-ink/60">Admin (billing, emails)</div>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="pt-3 border-t border-nesso-sand">
        <div className="flex justify-between items-center">
          <span className="text-sm text-nesso-ink/60">Total</span>
          <span className="text-lg font-semibold text-nesso-navy">{totalHours} hours</span>
        </div>
      </div>

      {/* Sustainability Assessment */}
      {sustainability && sustainabilityMessage && (
        <div
          className={`mt-4 p-3 rounded-lg border ${
            sustainability === 'sustainable'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-start gap-2">
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                sustainability === 'sustainable' ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              {sustainability === 'sustainable' ? '💚' : '⚠️'}
            </div>
            <div className="flex-1">
              <h4
                className={`text-sm font-semibold mb-0.5 ${
                  sustainability === 'sustainable' ? 'text-green-900' : 'text-red-900'
                }`}
              >
                {sustainability === 'sustainable' ? 'Sustainable' : 'Not sustainable'}
              </h4>
              <p
                className={`text-xs leading-relaxed ${
                  sustainability === 'sustainable' ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {sustainabilityMessage}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
