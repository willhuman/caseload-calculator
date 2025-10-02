interface DonutChartProps {
  sessionHours: number;
  docHours: number;
  adminHours: number;
  totalHours: number;
  size?: 'small' | 'medium' | 'large';
}

export function DonutChart({ sessionHours, docHours, adminHours, totalHours, size = 'medium' }: DonutChartProps) {
  // Calculate percentages
  const sessionPercent = (sessionHours / totalHours) * 100;
  const docPercent = (docHours / totalHours) * 100;
  const adminPercent = (adminHours / totalHours) * 100;

  // SVG dimensions based on size
  const dimensions = {
    small: { size: 180, stroke: 30, radius: 75 },
    medium: { size: 220, stroke: 35, radius: 92.5 },
    large: { size: 260, stroke: 40, radius: 110 }
  };

  const { size: svgSize, stroke, radius } = dimensions[size];
  const circumference = 2 * Math.PI * radius;

  // Calculate dash arrays for each segment
  const sessionDash = (sessionPercent / 100) * circumference;
  const docDash = (docPercent / 100) * circumference;
  const adminDash = (adminPercent / 100) * circumference;

  // Calculate rotation offsets
  const sessionOffset = 0;
  const docOffset = -sessionDash;
  const adminOffset = -(sessionDash + docDash);

  // Colors matching Nesso palette
  const colors = {
    session: '#F4A261', // nesso-coral
    doc: '#8B5CF6', // nesso-purple
    admin: '#1A3B5D' // nesso-navy
  };

  // Helper to format label
  const formatLabel = (hours: number, percent: number) => {
    if (percent < 3) return ''; // Hide label if too small
    return `${hours.toFixed(1)}h`;
  };

  const ariaLabel = `Weekly time distribution: ${sessionHours.toFixed(1)} hours sessions, ${docHours.toFixed(1)} hours documentation, ${adminHours.toFixed(1)} hours admin, total ${totalHours.toFixed(1)} hours`;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Donut Chart SVG */}
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="transform -rotate-90"
          role="img"
          aria-label={ariaLabel}
        >
          {/* Background circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={stroke}
          />

          {/* Sessions segment */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke={colors.session}
            strokeWidth={stroke}
            strokeDasharray={`${sessionDash} ${circumference - sessionDash}`}
            strokeDashoffset={sessionOffset}
            strokeLinecap="round"
            aria-label={`Sessions: ${sessionHours.toFixed(1)} hours, ${sessionPercent.toFixed(0)}%`}
          />

          {/* Documentation segment */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke={colors.doc}
            strokeWidth={stroke}
            strokeDasharray={`${docDash} ${circumference - docDash}`}
            strokeDashoffset={docOffset}
            strokeLinecap="round"
            aria-label={`Documentation: ${docHours.toFixed(1)} hours, ${docPercent.toFixed(0)}%`}
          />

          {/* Admin segment */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke={colors.admin}
            strokeWidth={stroke}
            strokeDasharray={`${adminDash} ${circumference - adminDash}`}
            strokeDashoffset={adminOffset}
            strokeLinecap="round"
            aria-label={`Admin: ${adminHours.toFixed(1)} hours, ${adminPercent.toFixed(0)}%`}
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-2xl font-bold text-nesso-navy">{totalHours.toFixed(1)}h</div>
          <div className="text-xs text-nesso-ink/60 px-2">per week</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.session }}></div>
          <span className="text-nesso-ink/80">
            Sessions {sessionHours.toFixed(1)}h ({sessionPercent.toFixed(0)}%)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.doc }}></div>
          <span className="text-nesso-ink/80">
            Docs {docHours.toFixed(1)}h ({docPercent.toFixed(0)}%)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.admin }}></div>
          <span className="text-nesso-ink/80">
            Admin {adminHours.toFixed(1)}h ({adminPercent.toFixed(0)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
