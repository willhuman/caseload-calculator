// Reusable Tailwind class combinations for consistency and reduced repetition

export const SPACING = {
  // Form input containers
  inputGroup: 'space-y-2 lg:space-y-1.5',
  inputGroupTight: 'space-y-1.5 lg:space-y-1',
  // Slider sections
  sliderSection: 'space-y-3 lg:space-y-1.5',
  // Card content sections
  cardSection: 'space-y-4 lg:space-y-3',
  cardSectionLarge: 'space-y-6 lg:space-y-4',
} as const;

export const FORM = {
  // Currency input icon positioning
  currencyIcon: 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm',
  // Slider range labels
  sliderRange: 'flex justify-between text-[10px] text-nesso-ink/50',
  // Label with value display
  labelRow: 'flex items-center justify-between',
  // Value display next to label
  valueDisplay: 'text-xs font-semibold text-nesso-navy',
  valueDisplayLarge: 'text-sm font-semibold text-nesso-navy',
} as const;

export const BUTTON = {
  // Navigation buttons
  navPrimary: 'flex-1 py-2 px-3 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors',
  navSecondary: 'flex-1 py-2 px-3 border border-gray-300 text-nesso-ink rounded-md text-sm font-medium hover:bg-gray-50 transition-colors',
  // Full width primary
  fullPrimary: 'w-full py-2 px-3 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors',
} as const;

export const TEXT = {
  // Helper/hint text
  hint: 'text-[10px] text-nesso-ink/60',
  hintSmall: 'text-[10px] text-nesso-ink/50',
  // Labels
  label: 'text-xs',
  // Section titles
  sectionTitle: 'text-xs font-medium text-nesso-navy',
} as const;

export const CARD = {
  // Card header with reduced padding
  headerCompact: 'pb-2',
  // Card title sizes
  titleSmall: 'text-sm text-nesso-ink',
} as const;

export const TABLE = {
  // Table cell padding
  cell: 'px-2.5 py-1.5',
  // Table header
  header: 'bg-nesso-navy/5 border-b border-gray-200',
} as const;
