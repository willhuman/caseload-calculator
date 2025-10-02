import React from 'react';

interface SustainabilityIndicatorProps {
  status: 'sustainable' | 'not-sustainable';
  message: string;
}

export function SustainabilityIndicator({
  status,
  message
}: SustainabilityIndicatorProps) {
  const isSustainable = status === 'sustainable';

  return (
    <div
      className={`p-4 rounded-lg border transition-all ${
        isSustainable
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xl ${
            isSustainable ? 'bg-green-100' : 'bg-red-100'
          }`}
        >
          {isSustainable ? '💚' : '⚠️'}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3
            className={`text-base font-semibold mb-0.5 ${
              isSustainable ? 'text-green-900' : 'text-red-900'
            }`}
          >
            {isSustainable ? 'Sustainable' : 'Not sustainable'}
          </h3>
          <p
            className={`text-sm leading-relaxed ${
              isSustainable ? 'text-green-800' : 'text-red-800'
            }`}
          >
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
