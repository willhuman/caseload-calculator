import React from 'react';

interface SustainabilityIndicatorProps {
  status: 'sustainable' | 'challenging' | 'room-to-grow';
  message: string;
}

export function SustainabilityIndicator({
  status,
  message
}: SustainabilityIndicatorProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'sustainable':
        return 'bg-green-50 border-green-200';
      case 'challenging':
        return 'bg-red-50 border-red-200';
      case 'room-to-grow':
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getIconBgColor = () => {
    switch (status) {
      case 'sustainable':
        return 'bg-green-100';
      case 'challenging':
        return 'bg-red-100';
      case 'room-to-grow':
        return 'bg-blue-100';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'sustainable':
        return '✓';
      case 'challenging':
        return '⚠️';
      case 'room-to-grow':
        return '↗️';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'sustainable':
        return 'Sustainable';
      case 'challenging':
        return 'Challenging';
      case 'room-to-grow':
        return 'Room to Grow';
    }
  };

  const getTextColor = () => {
    switch (status) {
      case 'sustainable':
        return 'text-green-900';
      case 'challenging':
        return 'text-red-900';
      case 'room-to-grow':
        return 'text-blue-900';
    }
  };

  const getMessageColor = () => {
    switch (status) {
      case 'sustainable':
        return 'text-green-800';
      case 'challenging':
        return 'text-red-800';
      case 'room-to-grow':
        return 'text-blue-800';
    }
  };

  return (
    <div className={`p-4 rounded-lg border transition-all ${getStatusColor()}`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xl ${getIconBgColor()}`}>
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className={`text-base font-semibold mb-0.5 ${getTextColor()}`}>
            {getStatusLabel()}
          </h3>
          <p className={`text-sm leading-relaxed ${getMessageColor()}`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
