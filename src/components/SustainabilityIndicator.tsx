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
      className={`p-6 rounded-xl border-2 transition-all ${
        isSustainable
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-2xl ${
            isSustainable ? 'bg-green-100' : 'bg-red-100'
          }`}
        >
          {isSustainable ? '💚' : '⚠️'}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3
            className={`text-lg font-semibold mb-1 ${
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
