import React from 'react';

interface FeeSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function FeeSlider({
  value,
  onChange,
  min = 75,
  max = 300,
  step = 5
}: FeeSliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value, 10));
  };

  // Calculate percentage for visual positioning
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      {/* Fee Display */}
      <div className="text-center">
        <div className="text-xs text-nesso-ink/60 mb-1">Your session fee</div>
        <div className="text-3xl font-bold text-nesso-navy">
          ${value}
        </div>
      </div>

      {/* Slider */}
      <div className="relative pt-4 pb-1">
        {/* Custom styled range input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="w-full h-2 bg-nesso-sand/40 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, #1A3B5D 0%, #1A3B5D ${percentage}%, #F5E6D3 ${percentage}%, #F5E6D3 100%)`
          }}
        />

        {/* Min/Max Labels */}
        <div className="flex justify-between mt-1 text-xs text-nesso-ink/50">
          <span>${min}</span>
          <span>${max}</span>
        </div>
      </div>

      {/* Instruction Text */}
      <p className="text-xs text-center text-nesso-ink/60">
        Adjust to see how that affects your time and money goals
      </p>

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #1A3B5D;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #1A3B5D;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .slider-thumb:focus {
          outline: none;
        }

        .slider-thumb:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(26, 59, 93, 0.2);
        }

        .slider-thumb:focus::-moz-range-thumb {
          box-shadow: 0 0 0 3px rgba(26, 59, 93, 0.2);
        }
      `}</style>
    </div>
  );
}
