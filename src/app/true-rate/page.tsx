'use client';

import { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectOption } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { CancellationPaymentSection } from '@/components/CancellationPaymentSection';
import { calculateTrueRate, formatCurrency } from '@/lib/true-rate-calculations';
import {
  DEFAULT_UNIVERSAL_INPUTS,
  DEFAULT_PRIVATE_PRACTICE_COMPARISON,
  EMPLOYMENT_TYPE_LABELS,
  PLATFORM_LABELS,
} from '@/lib/true-rate-types';
import type {
  TrueRateFormState,
  TrueRateResults,
  PrimaryWorkSetting,
  EmploymentType,
  Platform,
  CompensationType,
  AlmaMembership,
  UniversalInputs,
  GroupPracticeW2Inputs,
  GroupPractice1099Inputs,
  PlatformInputs,
  AgencyW2Inputs,
  Agency1099Inputs,
} from '@/lib/true-rate-types';

const ACCESS_KEY = 'nesso2025';

// Panel types for the wizard
// W-2 employees: 1=Work Setting, 2=Session Details, 3=Compensation, 4=Benefits, 5=Results
// 1099/Platform: 1=Work Setting, 2=Session Details, 3=Compensation, 4=Results (skip Benefits)
type WizardPanel = 1 | 2 | 3 | 4 | 5;

// Helper to check if work setting is W-2 (needs Benefits step)
const isW2WorkSetting = (workSetting: string | null): boolean => {
  return workSetting === 'group-practice-w2' ||
         workSetting === 'agency-w2';
};

// Get panel titles based on whether Benefits step is shown
const getPanelTitles = (showBenefits: boolean): Record<number, string> => {
  if (showBenefits) {
    return {
      1: 'Work Setting',
      2: 'Session Details',
      3: 'Compensation',
      4: 'Benefits',
      5: 'Results',
    };
  }
  return {
    1: 'Work Setting',
    2: 'Session Details',
    3: 'Compensation',
    4: 'Results',
  };
};

// Get the total number of panels
const getTotalPanels = (showBenefits: boolean): number => showBenefits ? 5 : 4;

// Get the Results panel number
const getResultsPanel = (showBenefits: boolean): WizardPanel => showBenefits ? 5 : 4;

// Work setting card data with icons
const WORK_SETTING_CARDS: { key: PrimaryWorkSetting; label: string; description: string; icon: string }[] = [
  {
    key: 'group-practice',
    label: 'Group Practice',
    description: 'Private group practice',
    icon: '👥',
  },
  {
    key: 'platform',
    label: 'Platform',
    description: 'Alma, Headway, Grow Therapy',
    icon: '💻',
  },
  {
    key: 'agency',
    label: 'Agency / Health System',
    description: 'Hospitals, CMHCs, clinics, health systems',
    icon: '🏥',
  },
];

// Live preview widget component
function LivePreviewWidget({ results, currentPanel, resultsPanel }: { results: TrueRateResults | null; currentPanel: WizardPanel; resultsPanel: WizardPanel }) {
  if (currentPanel === resultsPanel || !results) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 md:hidden">
      <div className="bg-nesso-navy text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
        <span className="text-xs text-white/70">True Rate:</span>
        <span className="font-bold">{formatCurrency(results.trueHourlyRate, true)}/hr</span>
      </div>
    </div>
  );
}

function TrueRateContent() {
  const searchParams = useSearchParams();
  const accessParam = searchParams.get('access');
  const hasAccess = accessParam === ACCESS_KEY;

  const [formState, setFormState] = useState<TrueRateFormState>({
    primaryWorkSetting: null,
    employmentType: null,
    selectedPlatform: null,
    workSetting: null,
    universal: { ...DEFAULT_UNIVERSAL_INPUTS },
    privatePracticeComparison: { ...DEFAULT_PRIVATE_PRACTICE_COMPARISON },
  });

  const [results, setResults] = useState<TrueRateResults | null>(null);

  // Wizard state
  const [currentPanel, setCurrentPanel] = useState<WizardPanel>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Determine if Benefits step should be shown (W-2 employees only)
  const showBenefitsStep = isW2WorkSetting(formState.workSetting);
  const totalPanels = getTotalPanels(showBenefitsStep);
  const panelTitles = getPanelTitles(showBenefitsStep);
  const resultsPanel = getResultsPanel(showBenefitsStep);

  // Derive workSetting from primary + secondary selections
  const { primaryWorkSetting, employmentType, selectedPlatform, workSetting } = formState;
  useEffect(() => {
    let newWorkSetting: TrueRateFormState['workSetting'] = null;

    if (primaryWorkSetting === 'group-practice' && employmentType) {
      newWorkSetting = employmentType === 'w2' ? 'group-practice-w2' : 'group-practice-1099';
    } else if (primaryWorkSetting === 'platform' && selectedPlatform) {
      newWorkSetting = `platform-${selectedPlatform}` as TrueRateFormState['workSetting'];
    } else if (primaryWorkSetting === 'agency' && employmentType) {
      newWorkSetting = employmentType === 'w2' ? 'agency-w2' : 'agency-1099';
    }

    if (newWorkSetting !== workSetting) {
      setFormState(prev => ({ ...prev, workSetting: newWorkSetting }));
    }
  }, [primaryWorkSetting, employmentType, selectedPlatform, workSetting]);

  // Recalculate results when form state changes
  useEffect(() => {
    if (formState.workSetting) {
      const newResults = calculateTrueRate(formState);
      setResults(newResults);
    } else {
      setResults(null);
    }
  }, [formState]);

  // Initialize setting-specific state when work setting changes
  const { groupPracticeW2, groupPractice1099, platform, agencyW2, agency1099 } = formState;
  useEffect(() => {
    if (workSetting === 'group-practice-w2' && !groupPracticeW2) {
      setFormState(prev => ({
        ...prev,
        groupPracticeW2: {
          compensationType: 'salary',
          includeBenefits: false,
        },
      }));
    } else if (workSetting === 'group-practice-1099' && !groupPractice1099) {
      setFormState(prev => ({
        ...prev,
        groupPractice1099: {
          compensationType: 'per-session',
          includeSelfEmploymentTax: false,
        },
      }));
    } else if (workSetting?.startsWith('platform-') && !platform) {
      setFormState(prev => ({
        ...prev,
        platform: {
          platform: prev.selectedPlatform || 'alma',
          averageReimbursementPerSession: 0,
          seesCashPayClients: false,
          includeSelfEmploymentTax: false,
        },
      }));
    } else if (workSetting === 'agency-w2' && !agencyW2) {
      setFormState(prev => ({
        ...prev,
        agencyW2: {
          compensationType: 'salary',
          expectedHoursPerWeek: 40,
          productivityRequirement: 25,
          includeBenefits: false,
        },
      }));
    } else if (workSetting === 'agency-1099' && !agency1099) {
      setFormState(prev => ({
        ...prev,
        agency1099: {
          compensationType: 'per-session',
          expectedHoursPerWeek: 40,
          productivityRequirement: 25,
          includeSelfEmploymentTax: false,
        },
      }));
    }
  }, [workSetting, groupPracticeW2, groupPractice1099, platform, agencyW2, agency1099, selectedPlatform]);

  const handlePrimarySettingChange = (value: string) => {
    setFormState(prev => ({
      ...prev,
      primaryWorkSetting: value as PrimaryWorkSetting || null,
      employmentType: null,
      selectedPlatform: null,
      workSetting: null,
      // Reset all setting-specific data
      groupPracticeW2: undefined,
      groupPractice1099: undefined,
      platform: undefined,
      agencyW2: undefined,
      agency1099: undefined,
      // Reset universal inputs to defaults when changing work setting
      universal: { ...DEFAULT_UNIVERSAL_INPUTS },
    }));
    // Reset to panel 1 when work setting changes
    setCurrentPanel(1);
  };

  const handleEmploymentTypeChange = (value: string) => {
    setFormState(prev => ({
      ...prev,
      employmentType: value as EmploymentType || null,
    }));
  };

  const handlePlatformChange = (value: string) => {
    setFormState(prev => ({
      ...prev,
      selectedPlatform: value as Platform || null,
      platform: undefined, // Reset platform data when changing platform
    }));
  };

  const updateUniversal = (field: keyof UniversalInputs, value: UniversalInputs[keyof UniversalInputs]) => {
    setFormState(prev => ({
      ...prev,
      universal: { ...prev.universal, [field]: value },
    }));
  };

  const updateGroupPracticeW2 = (field: keyof GroupPracticeW2Inputs, value: GroupPracticeW2Inputs[keyof GroupPracticeW2Inputs]) => {
    setFormState(prev => ({
      ...prev,
      groupPracticeW2: prev.groupPracticeW2 ? { ...prev.groupPracticeW2, [field]: value } : undefined,
    }));
  };

  const updateGroupPractice1099 = (field: keyof GroupPractice1099Inputs, value: GroupPractice1099Inputs[keyof GroupPractice1099Inputs]) => {
    setFormState(prev => ({
      ...prev,
      groupPractice1099: prev.groupPractice1099 ? { ...prev.groupPractice1099, [field]: value } : undefined,
    }));
  };

  const updatePlatform = (field: keyof PlatformInputs, value: PlatformInputs[keyof PlatformInputs]) => {
    setFormState(prev => ({
      ...prev,
      platform: prev.platform ? { ...prev.platform, [field]: value } : undefined,
    }));
  };

  const updateAgencyW2 = (field: keyof AgencyW2Inputs, value: AgencyW2Inputs[keyof AgencyW2Inputs]) => {
    setFormState(prev => ({
      ...prev,
      agencyW2: prev.agencyW2 ? { ...prev.agencyW2, [field]: value } : undefined,
    }));
  };

  const updateAgency1099 = (field: keyof Agency1099Inputs, value: Agency1099Inputs[keyof Agency1099Inputs]) => {
    setFormState(prev => ({
      ...prev,
      agency1099: prev.agency1099 ? { ...prev.agency1099, [field]: value } : undefined,
    }));
  };

  const updatePrivatePractice = (field: 'sessionRate' | 'monthlyExpenses', value: number) => {
    setFormState(prev => ({
      ...prev,
      privatePracticeComparison: { ...prev.privatePracticeComparison, [field]: value },
    }));
  };

  // Validation functions for each panel
  const validatePanel1 = useCallback((): string | null => {
    if (!formState.primaryWorkSetting) {
      return 'Please select your work setting';
    }
    if (formState.primaryWorkSetting === 'platform' && !formState.selectedPlatform) {
      return 'Please select your platform';
    }
    if (formState.primaryWorkSetting !== 'platform' && !formState.employmentType) {
      return 'Please select your employment type';
    }
    return null;
  }, [formState.primaryWorkSetting, formState.selectedPlatform, formState.employmentType]);

  const validatePanel2 = useCallback((): string | null => {
    // Panel 2 has all default values, so it's always valid
    return null;
  }, []);

  const validatePanel3 = useCallback((): string | null => {
    const { workSetting } = formState;

    if (workSetting === 'group-practice-w2') {
      const inputs = formState.groupPracticeW2;
      if (!inputs) return 'Please complete compensation details';
      if (inputs.compensationType === 'salary') {
        if (!inputs.annualSalary || inputs.annualSalary <= 0) return 'Please enter your annual salary';
        if (!inputs.expectedSessionsPerWeek || inputs.expectedSessionsPerWeek <= 0) return 'Please enter expected sessions per week';
      }
      if (inputs.compensationType === 'hourly') {
        if (!inputs.clinicalHourlyRate || inputs.clinicalHourlyRate <= 0) return 'Please enter your clinical hourly rate';
      }
    }

    if (workSetting === 'group-practice-1099') {
      const inputs = formState.groupPractice1099;
      if (!inputs) return 'Please complete compensation details';
      if (inputs.compensationType === 'per-session' && (!inputs.ratePerSession || inputs.ratePerSession <= 0)) {
        return 'Please set your rate per session';
      }
      if (inputs.compensationType === 'percentage') {
        if (!inputs.splitPercentage || inputs.splitPercentage <= 0) return 'Please set your split percentage';
        if (!inputs.averageCollectionPerSession || inputs.averageCollectionPerSession <= 0) return 'Please set average collection per session';
      }
    }

    if (workSetting?.startsWith('platform-')) {
      const inputs = formState.platform;
      if (!inputs) return 'Please complete platform details';
      if (!inputs.averageReimbursementPerSession || inputs.averageReimbursementPerSession <= 0) {
        return 'Please enter your average reimbursement per session';
      }
      if (workSetting === 'platform-alma' && (!inputs.almaSessionsPerMonth || inputs.almaSessionsPerMonth <= 0)) {
        return 'Please enter sessions per month for Alma';
      }
    }

    if (workSetting === 'agency-w2') {
      const inputs = formState.agencyW2;
      if (!inputs) return 'Please complete compensation details';
      if (inputs.compensationType === 'salary' && (!inputs.annualSalary || inputs.annualSalary <= 0)) {
        return 'Please enter your annual salary';
      }
      if (inputs.compensationType === 'hourly' && (!inputs.hourlyRate || inputs.hourlyRate <= 0)) {
        return 'Please enter your hourly rate';
      }
    }

    if (workSetting === 'agency-1099') {
      const inputs = formState.agency1099;
      if (!inputs) return 'Please complete compensation details';
      if (inputs.compensationType === 'per-session' && (!inputs.ratePerSession || inputs.ratePerSession <= 0)) {
        return 'Please enter your rate per session';
      }
      if (inputs.compensationType === 'hourly' && (!inputs.hourlyRate || inputs.hourlyRate <= 0)) {
        return 'Please enter your hourly rate';
      }
      if (inputs.compensationType === 'daily') {
        if (!inputs.dailyRate || inputs.dailyRate <= 0) {
          return 'Please enter your daily rate';
        }
        if (!inputs.expectedSessionsPerDay || inputs.expectedSessionsPerDay <= 0) {
          return 'Please enter expected sessions per day';
        }
      }
    }

    return null;
  }, [formState]);

  // Panel 4 validation (Benefits - W-2 only)
  const validatePanel4 = useCallback((): string | null => {
    // Benefits panel is optional - no required fields
    // PTO and benefits value have sensible defaults
    return null;
  }, []);

  // Navigation functions
  const goToPanel = useCallback((panel: WizardPanel) => {
    // Can always go back
    if (panel < currentPanel) {
      setCurrentPanel(panel);
      return;
    }

    // Validate before going forward
    if (panel > currentPanel) {
      // Validate all panels between current and target
      for (let p = currentPanel; p < panel; p++) {
        let error: string | null = null;
        if (p === 1) error = validatePanel1();
        else if (p === 2) error = validatePanel2();
        else if (p === 3) error = validatePanel3();
        else if (p === 4 && showBenefitsStep) error = validatePanel4();

        if (error) {
          // Stay on the panel that failed validation
          setCurrentPanel(p as WizardPanel);
          return;
        }
      }
    }

    setCurrentPanel(panel);
  }, [currentPanel, validatePanel1, validatePanel2, validatePanel3, validatePanel4, showBenefitsStep]);

  const goBack = useCallback(() => {
    if (currentPanel > 1) {
      setCurrentPanel((currentPanel - 1) as WizardPanel);
    }
  }, [currentPanel]);

  const goNext = useCallback(() => {
    if (currentPanel < totalPanels) {
      goToPanel((currentPanel + 1) as WizardPanel);
    }
  }, [currentPanel, totalPanels, goToPanel]);

  // Touch handlers for swipe gestures
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50; // minimum swipe distance

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentPanel < totalPanels) {
        // Swipe left - go next
        goNext();
      } else if (diff < 0 && currentPanel > 1) {
        // Swipe right - go back
        goBack();
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  }, [currentPanel, totalPanels, goNext, goBack]);

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4F7F3' }}>
        <Card className="max-w-md mx-4">
          <CardContent className="py-12 text-center">
            <h1 className="text-xl font-semibold text-nesso-navy mb-4">Access Required</h1>
            <p className="text-nesso-ink/70">
              This page is currently in development and requires an access key.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#F4F7F3' }}>
      <Header title="True Hourly Rate Calculator" />

      <main className="flex-1 overflow-hidden max-w-6xl w-full mx-auto px-3 pt-1 pb-1 flex flex-col">
        {/* Step Progress Indicator - Compact */}
        <div className="mb-4">
          <div className="flex items-center justify-center gap-0.5 md:gap-1">
            {Array.from({ length: totalPanels }, (_, i) => i + 1).map((panel, index) => {
              const isActive = currentPanel >= panel;
              const isCurrent = currentPanel === panel;
              const isResultsPanel = panel === resultsPanel;

              return (
                <div key={panel} className="flex items-center">
                  <button
                    onClick={() => goToPanel(panel as WizardPanel)}
                    className="flex flex-col items-center group cursor-pointer p-1.5 -m-1.5 rounded-lg hover:bg-black/5 active:bg-black/10 transition-colors"
                    aria-label={`Go to step ${panel}: ${panelTitles[panel]}`}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    <div
                      className={`w-7 h-7 md:w-6 md:h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                        isCurrent
                          ? 'bg-primary text-white ring-2 ring-primary/30 ring-offset-1 scale-110'
                          : isActive
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 text-gray-500 group-hover:bg-gray-300'
                      }`}
                    >
                      {isResultsPanel && results ? '✓' : panel}
                    </div>
                    <span className={`text-[10px] mt-1 transition-colors whitespace-nowrap ${isCurrent ? 'text-nesso-navy font-medium' : isActive ? 'text-nesso-ink' : 'text-gray-400'}`}>
                      {panelTitles[panel]}
                    </span>
                  </button>
                  {index < totalPanels - 1 && (
                    <div
                      className={`w-5 md:w-8 lg:w-12 h-0.5 mx-0.5 mb-4 transition-colors ${
                        currentPanel > panel ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Horizontal Wizard Container */}
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-300 ease-in-out h-full"
            style={{ transform: `translateX(-${(currentPanel - 1) * 100}%)` }}
          >
            {/* Panel 1: Work Setting */}
            <div className="w-full flex-shrink-0 px-1 h-full overflow-y-auto">
              <div className="max-w-xl mx-auto">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-nesso-ink">Where do you work?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Visual work setting cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {WORK_SETTING_CARDS.map((card) => (
                        <button
                          key={card.key}
                          onClick={() => handlePrimarySettingChange(card.key)}
                          className={`p-2.5 rounded-md border-2 text-left transition-all hover:shadow-sm active:scale-[0.98] ${
                            formState.primaryWorkSetting === card.key
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="text-lg mb-1">{card.icon}</div>
                          <div className={`font-medium text-xs ${formState.primaryWorkSetting === card.key ? 'text-primary' : 'text-nesso-navy'}`}>
                            {card.label}
                          </div>
                          <div className="text-[10px] text-nesso-ink/60 mt-0.5 leading-tight">
                            {card.description}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Secondary selection based on primary */}
                    {formState.primaryWorkSetting && (
                      <div className="pt-3 border-t border-gray-100">
                        {formState.primaryWorkSetting === 'platform' ? (
                          <div className="space-y-2">
                            <Label className="text-nesso-ink font-medium text-xs">Which platform?</Label>
                            <div className="grid grid-cols-2 gap-1.5">
                              {(Object.keys(PLATFORM_LABELS) as Platform[]).map((key) => (
                                <button
                                  key={key}
                                  onClick={() => handlePlatformChange(key)}
                                  className={`py-2 px-3 rounded-md border-2 text-xs font-medium transition-all ${
                                    formState.selectedPlatform === key
                                      ? 'border-primary bg-primary/5 text-primary'
                                      : 'border-gray-200 hover:border-gray-300 text-nesso-ink'
                                  }`}
                                >
                                  {PLATFORM_LABELS[key]}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label className="text-nesso-ink font-medium text-xs">What is your employment status?</Label>
                            <div className="grid grid-cols-2 gap-1.5">
                              {(Object.keys(EMPLOYMENT_TYPE_LABELS) as EmploymentType[]).map((key) => (
                                <button
                                  key={key}
                                  onClick={() => handleEmploymentTypeChange(key)}
                                  className={`py-2 px-3 rounded-md border-2 text-xs font-medium transition-all ${
                                    formState.employmentType === key
                                      ? 'border-primary bg-primary/5 text-primary'
                                      : 'border-gray-200 hover:border-gray-300 text-nesso-ink'
                                  }`}
                                >
                                  {key === 'w2' ? 'Employee (W-2)' : 'Contractor (1099)'}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Next Button */}
                    <div className="pt-3 relative group">
                      <button
                        onClick={goNext}
                        disabled={!!validatePanel1()}
                        className={`w-full py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                          validatePanel1()
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-primary text-white hover:bg-primary/90'
                        }`}
                      >
                        Continue to Session Details
                      </button>
                      {validatePanel1() && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          {validatePanel1()}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Panel 2: Session Details */}
            <div className="w-full flex-shrink-0 px-1 h-full overflow-y-auto">
              <div className="max-w-xl mx-auto">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-nesso-ink">Your Session Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 lg:space-y-3">
                    {/* Session Length */}
                    <div className="space-y-1.5 lg:space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Average session length</Label>
                        <span className="text-xs font-semibold text-nesso-navy">
                          {formState.universal.sessionLengthMinutes} min
                        </span>
                      </div>
                      <Slider
                        value={[formState.universal.sessionLengthMinutes]}
                        onValueChange={(value) => updateUniversal('sessionLengthMinutes', value[0])}
                        min={15}
                        max={120}
                        step={5}
                      />
                      <div className="flex justify-between text-[10px] text-nesso-ink/50">
                        <span>15 min</span>
                        <span>120 min</span>
                      </div>
                    </div>

                    {/* Documentation Time */}
                    <div className="space-y-1.5 lg:space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Documentation time per session</Label>
                        <span className="text-xs font-semibold text-nesso-navy">
                          {formState.universal.documentationTimeMinutes} min
                        </span>
                      </div>
                      <Slider
                        value={[formState.universal.documentationTimeMinutes]}
                        onValueChange={(value) => updateUniversal('documentationTimeMinutes', value[0])}
                        min={5}
                        max={30}
                        step={1}
                      />
                      <div className="flex justify-between text-[10px] text-nesso-ink/50">
                        <span>5 min</span>
                        <span>30 min</span>
                      </div>
                      {/* Impact hint */}
                      <p className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                        Adds {formState.universal.documentationTimeMinutes} min to each session&apos;s true time cost
                      </p>
                    </div>

                    {/* Weekly Admin Hours */}
                    <div className="space-y-1.5 lg:space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Weekly admin hours</Label>
                        <span className="text-xs font-semibold text-nesso-navy">
                          {formState.universal.weeklyAdminHours} hrs
                        </span>
                      </div>
                      <p className="text-[10px] text-nesso-ink/60">
                        Emails, coordination, treatment plans, phone calls, etc.
                      </p>
                      <Slider
                        value={[formState.universal.weeklyAdminHours]}
                        onValueChange={(value) => updateUniversal('weeklyAdminHours', value[0])}
                        min={1}
                        max={20}
                        step={1}
                      />
                      <div className="flex justify-between text-[10px] text-nesso-ink/50">
                        <span>1 hr</span>
                        <span>20 hrs</span>
                      </div>
                    </div>

                    {/* Cancellation Rate */}
                    <div className="space-y-1.5 lg:space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Cancellation rate</Label>
                        <span className="text-xs font-semibold text-nesso-navy">
                          {formState.universal.cancellationRate}%
                        </span>
                      </div>
                      <p className="text-[10px] text-nesso-ink/60">
                        Percentage of sessions cancelled or no-showed
                      </p>
                      <Slider
                        value={[formState.universal.cancellationRate]}
                        onValueChange={(value) => updateUniversal('cancellationRate', value[0])}
                        min={0}
                        max={30}
                        step={1}
                      />
                      <div className="flex justify-between text-[10px] text-nesso-ink/50">
                        <span>0%</span>
                        <span>30%</span>
                      </div>
                      {/* Impact hint */}
                      {formState.universal.cancellationRate > 0 && formState.universal.paidForCancellations === 'no' && (
                        <p className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                          Reduces your effective pay by ~{formState.universal.cancellationRate}% per session
                        </p>
                      )}
                    </div>

                    {/* Unpaid Required Time */}
                    <div className="space-y-1.5 lg:space-y-1">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs">Unpaid time per week (supervision, meetings, etc.)</Label>
                        <span className="text-xs font-semibold text-nesso-navy">
                          {formState.universal.unpaidRequiredHoursPerWeek} hrs
                        </span>
                      </div>
                      <Slider
                        value={[formState.universal.unpaidRequiredHoursPerWeek]}
                        onValueChange={(value) => updateUniversal('unpaidRequiredHoursPerWeek', value[0])}
                        min={0}
                        max={10}
                        step={1}
                      />
                      <div className="flex justify-between text-[10px] text-nesso-ink/50">
                        <span>0 hrs</span>
                        <span>10 hrs</span>
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="pt-3 flex gap-2">
                      <button
                        onClick={goBack}
                        className="flex-1 py-2 px-3 border border-gray-300 text-nesso-ink rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={goNext}
                        className="flex-1 py-2 px-3 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        Continue to Compensation
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Panel 3: Compensation Details */}
            <div className="w-full flex-shrink-0 px-1 h-full overflow-y-auto">
              <div className="max-w-xl mx-auto">
                {/* Group Practice W2 */}
                {formState.workSetting === 'group-practice-w2' && formState.groupPracticeW2 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-nesso-ink">Compensation Details</CardTitle>
                    </CardHeader>
              <CardContent className="space-y-4 lg:space-y-3">
                <div className="space-y-1.5 lg:space-y-1">
                  <Label className="text-xs">Compensation type</Label>
                  <Select
                    value={formState.groupPracticeW2.compensationType}
                    onChange={(e) => updateGroupPracticeW2('compensationType', e.target.value as CompensationType)}
                    className="text-sm"
                  >
                    <SelectOption value="salary">Salary</SelectOption>
                    <SelectOption value="hourly">Hourly</SelectOption>
                    <SelectOption value="per-session">Per-session</SelectOption>
                    <SelectOption value="percentage">Percentage split</SelectOption>
                  </Select>
                </div>

                {formState.groupPracticeW2.compensationType === 'salary' && (
                  <>
                    <div className="space-y-2 lg:space-y-1.5">
                      <Label htmlFor="annualSalary">Annual salary</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          id="annualSalary"
                          type="number"
                          min={0}
                          className="pl-7"
                          value={formState.groupPracticeW2.annualSalary || ''}
                          onChange={(e) => updateGroupPracticeW2('annualSalary', parseFloat(e.target.value) || 0)}
                          placeholder="60000"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 lg:space-y-1.5">
                      <Label htmlFor="expectedSessions">Expected sessions per week</Label>
                      <Input
                        id="expectedSessions"
                        type="number"
                        min={1}
                        max={40}
                        value={formState.groupPracticeW2.expectedSessionsPerWeek || ''}
                        onChange={(e) => updateGroupPracticeW2('expectedSessionsPerWeek', parseFloat(e.target.value) || 0)}
                        placeholder="25"
                      />
                    </div>
                  </>
                )}

                {formState.groupPracticeW2.compensationType === 'hourly' && (
                  <>
                    <div className="space-y-2 lg:space-y-1.5">
                      <Label htmlFor="clinicalRate">Clinical hourly rate</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          id="clinicalRate"
                          type="number"
                          min={0}
                          className="pl-7"
                          value={formState.groupPracticeW2.clinicalHourlyRate || ''}
                          onChange={(e) => updateGroupPracticeW2('clinicalHourlyRate', parseFloat(e.target.value) || 0)}
                          placeholder="45"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 lg:space-y-1.5">
                      <Label htmlFor="adminRate">Admin hourly rate</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          id="adminRate"
                          type="number"
                          min={0}
                          className="pl-7"
                          value={formState.groupPracticeW2.adminHourlyRate || ''}
                          onChange={(e) => updateGroupPracticeW2('adminHourlyRate', parseFloat(e.target.value) || 0)}
                          placeholder="25"
                        />
                      </div>
                    </div>
                  </>
                )}

                {formState.groupPracticeW2.compensationType === 'per-session' && (
                  <div className="space-y-3 lg:space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label>Rate per session</Label>
                      <span className="text-sm font-semibold text-nesso-navy">
                        ${formState.groupPracticeW2.ratePerSession || 0}
                      </span>
                    </div>
                    <Slider
                      value={[formState.groupPracticeW2.ratePerSession ?? 0]}
                      onValueChange={(value) => updateGroupPracticeW2('ratePerSession', value[0])}
                      min={0}
                      max={200}
                      step={5}
                    />
                    <div className="flex justify-between text-xs text-nesso-ink/50">
                      <span>$0</span>
                      <span>$200</span>
                    </div>
                  </div>
                )}

                {formState.groupPracticeW2.compensationType === 'percentage' && (
                  <>
                    <div className="space-y-3 lg:space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label>Your split percentage</Label>
                        <span className="text-sm font-semibold text-nesso-navy">
                          {formState.groupPracticeW2.splitPercentage || 0}%
                        </span>
                      </div>
                      <Slider
                        value={[formState.groupPracticeW2.splitPercentage || 50]}
                        onValueChange={(value) => updateGroupPracticeW2('splitPercentage', value[0])}
                        min={0}
                        max={100}
                        step={1}
                      />
                      <div className="flex justify-between text-xs">
                        <span className="text-nesso-ink/70">You: <span className="font-medium text-nesso-navy">{formState.groupPracticeW2.splitPercentage || 0}%</span></span>
                        <span className="text-nesso-ink/70">Practice: <span className="font-medium text-nesso-navy">{100 - (formState.groupPracticeW2.splitPercentage || 0)}%</span></span>
                      </div>
                    </div>
                    <div className="space-y-3 lg:space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label>What do you earn per session?</Label>
                        <span className="text-sm font-semibold text-nesso-navy">
                          ${formState.groupPracticeW2.averageCollectionPerSession || 0}
                        </span>
                      </div>
                      <Slider
                        value={[formState.groupPracticeW2.averageCollectionPerSession || 100]}
                        onValueChange={(value) => updateGroupPracticeW2('averageCollectionPerSession', value[0])}
                        min={20}
                        max={200}
                        step={5}
                      />
                      <div className="flex justify-between text-xs text-nesso-ink/50">
                        <span>$20</span>
                        <span>$200</span>
                      </div>
                    </div>
                  </>
                )}

                <CancellationPaymentSection
                  paidForCancellations={formState.universal.paidForCancellations}
                  cancellationPayType={formState.universal.cancellationPayType}
                  cancellationPayPercentage={formState.universal.cancellationPayPercentage}
                  inputId="cancellationPayPercentageW2"
                  onPaidChange={(value) => updateUniversal('paidForCancellations', value)}
                  onPayTypeChange={(value) => updateUniversal('cancellationPayType', value)}
                  onPayPercentageChange={(value) => updateUniversal('cancellationPayPercentage', value)}
                />

              </CardContent>
            </Card>
          )}

          {/* Group Practice 1099 */}
          {formState.workSetting === 'group-practice-1099' && formState.groupPractice1099 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-nesso-ink">Compensation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 lg:space-y-4">
                <div className="space-y-2 lg:space-y-1.5">
                  <Label>Compensation type</Label>
                  <Select
                    value={formState.groupPractice1099.compensationType}
                    onChange={(e) => updateGroupPractice1099('compensationType', e.target.value as 'per-session' | 'percentage')}
                  >
                    <SelectOption value="per-session">Per-session</SelectOption>
                    <SelectOption value="percentage">Percentage split</SelectOption>
                  </Select>
                </div>

                {formState.groupPractice1099.compensationType === 'per-session' && (
                  <div className="space-y-3 lg:space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label>Rate per session</Label>
                      <span className="text-sm font-semibold text-nesso-navy">
                        ${formState.groupPractice1099.ratePerSession || 0}
                      </span>
                    </div>
                    <Slider
                      value={[formState.groupPractice1099.ratePerSession ?? 0]}
                      onValueChange={(value) => updateGroupPractice1099('ratePerSession', value[0])}
                      min={0}
                      max={200}
                      step={5}
                    />
                    <div className="flex justify-between text-xs text-nesso-ink/50">
                      <span>$0</span>
                      <span>$200</span>
                    </div>
                  </div>
                )}

                {formState.groupPractice1099.compensationType === 'percentage' && (
                  <>
                    <div className="space-y-3 lg:space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label>Your split percentage</Label>
                        <span className="text-sm font-semibold text-nesso-navy">
                          {formState.groupPractice1099.splitPercentage || 0}%
                        </span>
                      </div>
                      <Slider
                        value={[formState.groupPractice1099.splitPercentage || 70]}
                        onValueChange={(value) => updateGroupPractice1099('splitPercentage', value[0])}
                        min={0}
                        max={100}
                        step={1}
                      />
                      <div className="flex justify-between text-xs">
                        <span className="text-nesso-ink/70">You: <span className="font-medium text-nesso-navy">{formState.groupPractice1099.splitPercentage || 0}%</span></span>
                        <span className="text-nesso-ink/70">Practice: <span className="font-medium text-nesso-navy">{100 - (formState.groupPractice1099.splitPercentage || 0)}%</span></span>
                      </div>
                    </div>
                    <div className="space-y-3 lg:space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label>What do you earn per session?</Label>
                        <span className="text-sm font-semibold text-nesso-navy">
                          ${formState.groupPractice1099.averageCollectionPerSession || 0}
                        </span>
                      </div>
                      <Slider
                        value={[formState.groupPractice1099.averageCollectionPerSession || 100]}
                        onValueChange={(value) => updateGroupPractice1099('averageCollectionPerSession', value[0])}
                        min={20}
                        max={200}
                        step={5}
                      />
                      <div className="flex justify-between text-xs text-nesso-ink/50">
                        <span>$20</span>
                        <span>$200</span>
                      </div>
                    </div>
                  </>
                )}

                <CancellationPaymentSection
                  paidForCancellations={formState.universal.paidForCancellations}
                  cancellationPayType={formState.universal.cancellationPayType}
                  cancellationPayPercentage={formState.universal.cancellationPayPercentage}
                  inputId="cancellationPayPercentage1099"
                  onPaidChange={(value) => updateUniversal('paidForCancellations', value)}
                  onPayTypeChange={(value) => updateUniversal('cancellationPayType', value)}
                  onPayPercentageChange={(value) => updateUniversal('cancellationPayPercentage', value)}
                />

                <div className="flex items-center justify-between pt-2 border-t border-sand">
                  <div>
                    <Label htmlFor="groupPractice1099SETax">Include self-employment tax in calculation?</Label>
                    <p className="text-xs text-nesso-ink/60 mt-1">15.3% for Social Security and Medicare</p>
                  </div>
                  <Toggle
                    id="groupPractice1099SETax"
                    checked={formState.groupPractice1099.includeSelfEmploymentTax}
                    onCheckedChange={(checked) => updateGroupPractice1099('includeSelfEmploymentTax', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Platform - Alma */}
          {formState.workSetting === 'platform-alma' && formState.platform && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-nesso-ink">Alma Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 lg:space-y-4">
                <div className="space-y-2 lg:space-y-1.5">
                  <Label>Membership type</Label>
                  <Select
                    value={formState.platform.almaMembershipType || 'monthly'}
                    onChange={(e) => updatePlatform('almaMembershipType', e.target.value as AlmaMembership)}
                  >
                    <SelectOption value="monthly">Monthly ($125/month)</SelectOption>
                    <SelectOption value="annual">Annual ($1,140/year)</SelectOption>
                  </Select>
                </div>

                <div className="space-y-2 lg:space-y-1.5">
                  <Label htmlFor="almaSessions">Sessions per month (to amortize membership fee)</Label>
                  <Input
                    id="almaSessions"
                    type="number"
                    min={1}
                    value={formState.platform.almaSessionsPerMonth || ''}
                    onChange={(e) => updatePlatform('almaSessionsPerMonth', parseFloat(e.target.value) || 0)}
                    placeholder="60"
                  />
                </div>

                <div className="space-y-2 lg:space-y-1.5">
                  <Label htmlFor="avgReimbursement">Average reimbursement per session</Label>
                  <p className="text-xs text-nesso-ink/60">Check your platform dashboard for this</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="avgReimbursement"
                      type="number"
                      min={0}
                      className="pl-7"
                      value={formState.platform.averageReimbursementPerSession || ''}
                      onChange={(e) => updatePlatform('averageReimbursementPerSession', parseFloat(e.target.value) || 0)}
                      placeholder="120"
                    />
                  </div>
                </div>

                <CancellationPaymentSection
                  paidForCancellations={formState.universal.paidForCancellations}
                  cancellationPayType={formState.universal.cancellationPayType}
                  cancellationPayPercentage={formState.universal.cancellationPayPercentage}
                  inputId="cancellationPayPercentageAlma"
                  onPaidChange={(value) => updateUniversal('paidForCancellations', value)}
                  onPayTypeChange={(value) => updateUniversal('cancellationPayType', value)}
                  onPayPercentageChange={(value) => updateUniversal('cancellationPayPercentage', value)}
                />

                <div className="flex items-center justify-between pt-2 border-t border-sand">
                  <div>
                    <Label htmlFor="almaSETax">Include self-employment tax in calculation?</Label>
                    <p className="text-xs text-nesso-ink/60 mt-1">15.3% for Social Security and Medicare</p>
                  </div>
                  <Toggle
                    id="almaSETax"
                    checked={formState.platform.includeSelfEmploymentTax}
                    onCheckedChange={(checked) => updatePlatform('includeSelfEmploymentTax', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Platform - Grow Therapy */}
          {formState.workSetting === 'platform-grow-therapy' && formState.platform && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-nesso-ink">Grow Therapy Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 lg:space-y-4">
                <div className="space-y-2 lg:space-y-1.5">
                  <Label htmlFor="avgReimbursementGrow">Average reimbursement per session</Label>
                  <p className="text-xs text-nesso-ink/60">Check your platform dashboard for this</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="avgReimbursementGrow"
                      type="number"
                      min={0}
                      className="pl-7"
                      value={formState.platform.averageReimbursementPerSession || ''}
                      onChange={(e) => updatePlatform('averageReimbursementPerSession', parseFloat(e.target.value) || 0)}
                      placeholder="120"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-sand">
                  <Label htmlFor="cashPayClients">Do you see cash-pay clients through the platform?</Label>
                  <Toggle
                    id="cashPayClients"
                    checked={formState.platform.seesCashPayClients}
                    onCheckedChange={(checked) => updatePlatform('seesCashPayClients', checked)}
                  />
                </div>

                {formState.platform.seesCashPayClients && (
                  <div className="space-y-2 lg:space-y-1.5">
                    <Label htmlFor="cashPaySessions">Cash-pay sessions per month</Label>
                    <p className="text-xs text-nesso-ink/60">Grow Therapy takes 5% of cash-pay sessions</p>
                    <Input
                      id="cashPaySessions"
                      type="number"
                      min={0}
                      value={formState.platform.cashPaySessionsPerMonth || ''}
                      onChange={(e) => updatePlatform('cashPaySessionsPerMonth', parseFloat(e.target.value) || 0)}
                      placeholder="10"
                    />
                  </div>
                )}

                <CancellationPaymentSection
                  paidForCancellations={formState.universal.paidForCancellations}
                  cancellationPayType={formState.universal.cancellationPayType}
                  cancellationPayPercentage={formState.universal.cancellationPayPercentage}
                  inputId="cancellationPayPercentageGrow"
                  onPaidChange={(value) => updateUniversal('paidForCancellations', value)}
                  onPayTypeChange={(value) => updateUniversal('cancellationPayType', value)}
                  onPayPercentageChange={(value) => updateUniversal('cancellationPayPercentage', value)}
                />

                <div className="flex items-center justify-between pt-2 border-t border-sand">
                  <div>
                    <Label htmlFor="growSETax">Include self-employment tax in calculation?</Label>
                    <p className="text-xs text-nesso-ink/60 mt-1">15.3% for Social Security and Medicare</p>
                  </div>
                  <Toggle
                    id="growSETax"
                    checked={formState.platform.includeSelfEmploymentTax}
                    onCheckedChange={(checked) => updatePlatform('includeSelfEmploymentTax', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Platform - Headway or Other */}
          {(formState.workSetting === 'platform-headway' || formState.workSetting === 'platform-other') && formState.platform && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-nesso-ink">{formState.selectedPlatform === 'headway' ? 'Headway' : 'Platform'} Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 lg:space-y-4">
                <div className="space-y-2 lg:space-y-1.5">
                  <Label htmlFor="avgReimbursementOther">Average reimbursement per session</Label>
                  <p className="text-xs text-nesso-ink/60">Check your platform dashboard for this</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="avgReimbursementOther"
                      type="number"
                      min={0}
                      className="pl-7"
                      value={formState.platform.averageReimbursementPerSession || ''}
                      onChange={(e) => updatePlatform('averageReimbursementPerSession', parseFloat(e.target.value) || 0)}
                      placeholder="120"
                    />
                  </div>
                </div>

                <CancellationPaymentSection
                  paidForCancellations={formState.universal.paidForCancellations}
                  cancellationPayType={formState.universal.cancellationPayType}
                  cancellationPayPercentage={formState.universal.cancellationPayPercentage}
                  inputId="cancellationPayPercentageOther"
                  onPaidChange={(value) => updateUniversal('paidForCancellations', value)}
                  onPayTypeChange={(value) => updateUniversal('cancellationPayType', value)}
                  onPayPercentageChange={(value) => updateUniversal('cancellationPayPercentage', value)}
                />

                <div className="flex items-center justify-between pt-2 border-t border-sand">
                  <div>
                    <Label htmlFor="otherPlatformSETax">Include self-employment tax in calculation?</Label>
                    <p className="text-xs text-nesso-ink/60 mt-1">15.3% for Social Security and Medicare</p>
                  </div>
                  <Toggle
                    id="otherPlatformSETax"
                    checked={formState.platform.includeSelfEmploymentTax}
                    onCheckedChange={(checked) => updatePlatform('includeSelfEmploymentTax', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Agency / Health System - W2 */}
          {formState.workSetting === 'agency-w2' && formState.agencyW2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-nesso-ink">Compensation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 lg:space-y-4">
                <div className="space-y-2 lg:space-y-1.5">
                  <Label>How are you paid?</Label>
                  <Select
                    value={formState.agencyW2.compensationType}
                    onChange={(e) => updateAgencyW2('compensationType', e.target.value as 'salary' | 'hourly')}
                  >
                    <SelectOption value="salary">Salary</SelectOption>
                    <SelectOption value="hourly">Hourly</SelectOption>
                  </Select>
                </div>

                {formState.agencyW2.compensationType === 'salary' && (
                  <div className="space-y-2 lg:space-y-1.5">
                    <Label htmlFor="agencySalary">Annual salary</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id="agencySalary"
                        type="number"
                        min={0}
                        className="pl-7"
                        value={formState.agencyW2.annualSalary || ''}
                        onChange={(e) => updateAgencyW2('annualSalary', parseFloat(e.target.value) || 0)}
                        placeholder="55000"
                      />
                    </div>
                  </div>
                )}

                {formState.agencyW2.compensationType === 'hourly' && (
                  <div className="space-y-2 lg:space-y-1.5">
                    <Label htmlFor="agencyHourly">Hourly rate</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id="agencyHourly"
                        type="number"
                        min={0}
                        className="pl-7"
                        value={formState.agencyW2.hourlyRate || ''}
                        onChange={(e) => updateAgencyW2('hourlyRate', parseFloat(e.target.value) || 0)}
                        placeholder="28"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2 lg:space-y-1.5">
                  <Label htmlFor="agencyHours">Expected hours per week (contracted hours)</Label>
                  <Input
                    id="agencyHours"
                    type="number"
                    min={0}
                    max={60}
                    value={formState.agencyW2.expectedHoursPerWeek || ''}
                    onChange={(e) => updateAgencyW2('expectedHoursPerWeek', parseFloat(e.target.value) || 0)}
                    placeholder="40"
                  />
                </div>

                <div className="space-y-2 lg:space-y-1.5">
                  <Label htmlFor="agencyProductivity">Productivity requirement (required billable sessions/week)</Label>
                  <Input
                    id="agencyProductivity"
                    type="number"
                    min={0}
                    max={40}
                    value={formState.agencyW2.productivityRequirement || ''}
                    onChange={(e) => updateAgencyW2('productivityRequirement', parseFloat(e.target.value) || 0)}
                    placeholder="25"
                  />
                </div>

                <CancellationPaymentSection
                  paidForCancellations={formState.universal.paidForCancellations}
                  cancellationPayType={formState.universal.cancellationPayType}
                  cancellationPayPercentage={formState.universal.cancellationPayPercentage}
                  inputId="cancellationPayPercentageAgencyW2"
                  onPaidChange={(value) => updateUniversal('paidForCancellations', value)}
                  onPayTypeChange={(value) => updateUniversal('cancellationPayType', value)}
                  onPayPercentageChange={(value) => updateUniversal('cancellationPayPercentage', value)}
                />
              </CardContent>
            </Card>
          )}

          {/* Agency / Health System - 1099 */}
          {formState.workSetting === 'agency-1099' && formState.agency1099 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-nesso-ink">Compensation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 lg:space-y-4">
                <div className="space-y-2 lg:space-y-1.5">
                  <Label>How are you paid?</Label>
                  <Select
                    value={formState.agency1099.compensationType}
                    onChange={(e) => updateAgency1099('compensationType', e.target.value as 'per-session' | 'hourly' | 'daily')}
                  >
                    <SelectOption value="per-session">Per session</SelectOption>
                    <SelectOption value="hourly">Hourly</SelectOption>
                    <SelectOption value="daily">Daily rate</SelectOption>
                  </Select>
                </div>

                {formState.agency1099.compensationType === 'per-session' && (
                  <div className="space-y-2 lg:space-y-1.5">
                    <Label htmlFor="agency1099Rate">Rate per session</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id="agency1099Rate"
                        type="number"
                        min={0}
                        className="pl-7"
                        value={formState.agency1099.ratePerSession || ''}
                        onChange={(e) => updateAgency1099('ratePerSession', parseFloat(e.target.value) || 0)}
                        placeholder="75"
                      />
                    </div>
                  </div>
                )}

                {formState.agency1099.compensationType === 'hourly' && (
                  <div className="space-y-2 lg:space-y-1.5">
                    <Label htmlFor="agency1099Hourly">Hourly rate</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id="agency1099Hourly"
                        type="number"
                        min={0}
                        className="pl-7"
                        value={formState.agency1099.hourlyRate || ''}
                        onChange={(e) => updateAgency1099('hourlyRate', parseFloat(e.target.value) || 0)}
                        placeholder="50"
                      />
                    </div>
                  </div>
                )}

                {formState.agency1099.compensationType === 'daily' && (
                  <>
                    <div className="space-y-2 lg:space-y-1.5">
                      <Label htmlFor="agency1099Daily">Daily rate</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          id="agency1099Daily"
                          type="number"
                          min={0}
                          className="pl-7"
                          value={formState.agency1099.dailyRate || ''}
                          onChange={(e) => updateAgency1099('dailyRate', parseFloat(e.target.value) || 0)}
                          placeholder="400"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 lg:space-y-1.5">
                      <Label htmlFor="agency1099SessionsPerDay">Expected sessions per day</Label>
                      <Input
                        id="agency1099SessionsPerDay"
                        type="number"
                        min={1}
                        max={12}
                        value={formState.agency1099.expectedSessionsPerDay || ''}
                        onChange={(e) => updateAgency1099('expectedSessionsPerDay', parseFloat(e.target.value) || 0)}
                        placeholder="6"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2 lg:space-y-1.5">
                  <Label htmlFor="agency1099Hours">Expected hours per week</Label>
                  <Input
                    id="agency1099Hours"
                    type="number"
                    min={0}
                    max={60}
                    value={formState.agency1099.expectedHoursPerWeek || ''}
                    onChange={(e) => updateAgency1099('expectedHoursPerWeek', parseFloat(e.target.value) || 0)}
                    placeholder="40"
                  />
                </div>

                <div className="space-y-2 lg:space-y-1.5">
                  <Label htmlFor="agency1099Productivity">Productivity requirement (required billable sessions/week)</Label>
                  <Input
                    id="agency1099Productivity"
                    type="number"
                    min={0}
                    max={40}
                    value={formState.agency1099.productivityRequirement || ''}
                    onChange={(e) => updateAgency1099('productivityRequirement', parseFloat(e.target.value) || 0)}
                    placeholder="25"
                  />
                </div>

                <CancellationPaymentSection
                  paidForCancellations={formState.universal.paidForCancellations}
                  cancellationPayType={formState.universal.cancellationPayType}
                  cancellationPayPercentage={formState.universal.cancellationPayPercentage}
                  inputId="cancellationPayPercentageAgency1099"
                  onPaidChange={(value) => updateUniversal('paidForCancellations', value)}
                  onPayTypeChange={(value) => updateUniversal('cancellationPayType', value)}
                  onPayPercentageChange={(value) => updateUniversal('cancellationPayPercentage', value)}
                />

                <div className="flex items-center justify-between pt-2 border-t border-sand">
                  <div>
                    <Label htmlFor="agency1099SETax">Include self-employment tax in calculation?</Label>
                    <p className="text-xs text-nesso-ink/60 mt-1">15.3% for Social Security and Medicare</p>
                  </div>
                  <Toggle
                    id="agency1099SETax"
                    checked={formState.agency1099.includeSelfEmploymentTax || false}
                    onCheckedChange={(checked) => updateAgency1099('includeSelfEmploymentTax', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons - shown when a work setting is selected */}
          {formState.workSetting && (
            <div className="pt-3 flex gap-2">
              <button
                onClick={goBack}
                className="flex-1 py-2 px-3 border border-gray-300 text-nesso-ink rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <div className="flex-1 relative group">
                <button
                  onClick={goNext}
                  disabled={!!validatePanel3()}
                  className={`w-full py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    validatePanel3()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary/90'
                  }`}
                >
                  {showBenefitsStep ? 'Continue to Benefits' : 'Continue to Results'}
                </button>
                {validatePanel3() && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {validatePanel3()}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Show placeholder when no work setting selected yet */}
          {!formState.workSetting && (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="text-2xl mb-3">💰</div>
                <p className="text-nesso-ink font-medium text-sm mb-1">Enter your compensation details</p>
                <p className="text-nesso-ink/60 text-xs">First, tell us where you work and your session details.</p>
              </CardContent>
            </Card>
          )}
              </div>
            </div>

            {/* Panel 4: Benefits (W-2 only) */}
            {showBenefitsStep && (
              <div className="w-full flex-shrink-0 px-1 h-full overflow-y-auto">
                <div className="max-w-xl mx-auto">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-nesso-ink">Benefits & Time Off</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 lg:space-y-3">
                      {/* Paid Time Off */}
                      <div className="space-y-1.5 lg:space-y-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Weeks of paid time off per year</Label>
                          <span className="text-xs font-semibold text-nesso-navy">
                            {formState.universal.paidTimeOffWeeks} weeks
                          </span>
                        </div>
                        <p className="text-[10px] text-nesso-ink/60">
                          Vacation, sick days, holidays as a W-2 employee
                        </p>
                        <Slider
                          value={[formState.universal.paidTimeOffWeeks]}
                          onValueChange={(value) => updateUniversal('paidTimeOffWeeks', value[0])}
                          min={0}
                          max={6}
                          step={1}
                        />
                        <div className="flex justify-between text-[10px] text-nesso-ink/50">
                          <span>0 weeks</span>
                          <span>6 weeks</span>
                        </div>
                      </div>

                      {/* Include Benefits Toggle */}
                      <div className="flex items-center justify-between pt-2 border-t border-sand">
                        <div>
                          <Label htmlFor="benefitsToggle">Include benefits in calculation?</Label>
                          <p className="text-xs text-nesso-ink/60 mt-1">Health insurance, retirement, etc.</p>
                        </div>
                        <Toggle
                          id="benefitsToggle"
                          checked={
                            formState.workSetting === 'group-practice-w2'
                              ? formState.groupPracticeW2?.includeBenefits || false
                              : formState.agencyW2?.includeBenefits || false
                          }
                          onCheckedChange={(checked) => {
                            if (formState.workSetting === 'group-practice-w2') {
                              updateGroupPracticeW2('includeBenefits', checked);
                            } else if (formState.workSetting === 'agency-w2') {
                              updateAgencyW2('includeBenefits', checked);
                            }
                          }}
                        />
                      </div>

                      {/* Monthly Benefits Value - show when benefits are included */}
                      {((formState.workSetting === 'group-practice-w2' && formState.groupPracticeW2?.includeBenefits) ||
                        (formState.workSetting === 'agency-w2' && formState.agencyW2?.includeBenefits)) && (
                        <div className="space-y-2 lg:space-y-1.5">
                          <Label htmlFor="benefitsValue">Estimated monthly benefits value</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <Input
                              id="benefitsValue"
                              type="number"
                              min={0}
                              className="pl-7"
                              value={
                                formState.workSetting === 'group-practice-w2'
                                  ? formState.groupPracticeW2?.monthlyBenefitsValue || ''
                                  : formState.agencyW2?.monthlyBenefitsValue || ''
                              }
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                if (formState.workSetting === 'group-practice-w2') {
                                  updateGroupPracticeW2('monthlyBenefitsValue', value);
                                } else if (formState.workSetting === 'agency-w2') {
                                  updateAgencyW2('monthlyBenefitsValue', value);
                                }
                              }}
                              placeholder="1000"
                            />
                          </div>
                          <p className="text-[10px] text-nesso-ink/60">
                            Total value of health insurance, retirement contributions, etc.
                          </p>
                        </div>
                      )}

                      {/* Navigation Buttons */}
                      <div className="pt-3 flex gap-2">
                        <button
                          onClick={goBack}
                          className="flex-1 py-2 px-3 border border-gray-300 text-nesso-ink rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={goNext}
                          className="flex-1 py-2 px-3 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                          Continue to Results
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Panel 4/5: Results */}
            <div className="w-full flex-shrink-0 px-1 h-full overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                {/* Two column layout on desktop: Results left, Private Practice Comparison right */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {/* Results Column (Left) */}
                  {results ? (
                    <Card style={{ backgroundColor: '#E0EAE0' }}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-nesso-ink flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Your Results
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Hero result - prominent display */}
                        <div className="text-center py-4 bg-white/70 rounded-lg shadow-sm">
                          <p className="text-xs text-nesso-ink/70 mb-1">Your True Hourly Rate</p>
                          <p className="text-3xl font-bold text-nesso-navy tracking-tight">{formatCurrency(results.trueHourlyRate, true)}</p>
                          <p className="text-[10px] text-nesso-ink/50 mt-1">per hour of actual work</p>
                        </div>

                        {/* Annual summary - always visible */}
                        <div className="bg-white/50 rounded-md p-2.5 text-center">
                          <p className="text-xs text-nesso-ink/70">
                            At <span className="font-semibold">{results.sessionsPerWeek} sessions/week</span> for <span className="font-semibold">{results.isW2 ? 52 - formState.universal.paidTimeOffWeeks : 48} weeks</span>
                          </p>
                          <p className="text-lg font-bold text-nesso-navy mt-0.5">{formatCurrency(results.annualEquivalent)}/year</p>
                        </div>

                        {/* Tax note */}
                        <div className="bg-white/50 rounded-md p-2 text-center space-y-1">
                          <p className="text-[10px] text-nesso-ink/70">
                            {results.isW2
                              ? 'As a W-2 employee, self-employment taxes are handled by your employer.'
                              : results.compensationBreakdown.selfEmploymentTaxImpact
                                ? 'Self-employment taxes (15.3%) are already included in this calculation.'
                                : 'Self-employment taxes (15.3%) not included in this calculation.'}
                          </p>
                          <p className="text-[10px] text-nesso-ink/70">
                            Federal and state income taxes are not included. Consult a tax professional for guidance specific to your situation.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <div className="text-2xl mb-3">📊</div>
                        <p className="text-nesso-ink font-medium text-sm mb-1">Your results will appear here</p>
                        <p className="text-nesso-ink/60 text-xs">Complete all steps to calculate your true hourly rate.</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Private Practice Comparison Column (Right) */}
                  {results ? (
                    <div className="space-y-3">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-nesso-ink flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            Private Practice Comparison
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-1.5 lg:space-y-1">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">What would you charge per session?</Label>
                              <span className="text-sm font-bold text-nesso-navy">
                                {formatCurrency(formState.privatePracticeComparison.sessionRate)}
                              </span>
                            </div>
                            <Slider
                              value={[formState.privatePracticeComparison.sessionRate]}
                              onValueChange={(value) => updatePrivatePractice('sessionRate', value[0])}
                              min={100}
                              max={250}
                              step={5}
                            />
                            <div className="flex justify-between text-[10px] text-nesso-ink/50">
                              <span>$100</span>
                              <span>$250</span>
                            </div>
                          </div>

                          <div className="space-y-1.5 lg:space-y-1">
                            <Label htmlFor="monthlyExpenses" className="text-xs">Estimated monthly expenses</Label>
                            <p className="text-[10px] text-nesso-ink/60">EHR, liability insurance, office space, marketing, etc.</p>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                              <Input
                                id="monthlyExpenses"
                                type="number"
                                min={0}
                                className="pl-7 text-sm"
                                value={formState.privatePracticeComparison.monthlyExpenses || ''}
                                onChange={(e) => updatePrivatePractice('monthlyExpenses', parseFloat(e.target.value) || 0)}
                                placeholder="500"
                              />
                            </div>
                          </div>

                          <div className="pt-3 border-t border-sand">
                            <p className="text-xs font-medium text-nesso-navy mb-2">
                              Sessions needed to match your current income:
                            </p>
                            <div className="bg-white/50 rounded-md overflow-hidden">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="bg-nesso-navy/5 border-b border-gray-200">
                                    <th className="px-2.5 py-1.5 text-left font-semibold text-nesso-ink">Rate</th>
                                    <th className="px-2.5 py-1.5 text-right font-semibold text-nesso-ink">Sessions/Week</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {results.privatePracticeComparison.map((row) => (
                                    <tr
                                      key={row.sessionRate}
                                      className={`border-b border-gray-200 ${row.isSelected ? 'bg-primary/10 font-semibold' : ''}`}
                                    >
                                      <td className="px-2.5 py-1.5 text-nesso-navy">{formatCurrency(row.sessionRate)}</td>
                                      <td className="px-2.5 py-1.5 text-right text-nesso-navy">{row.sessionsPerWeekNeeded}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Tax notes for Private Practice Comparison */}
                          <div className="space-y-2">
                            {results.isW2 ? (
                              <div className="bg-amber-50 border border-amber-200 rounded-md p-2">
                                <p className="text-[10px] text-amber-800">
                                  <span className="font-semibold">Note:</span> In private practice, you&apos;d pay an extra ~15.3% in self-employment taxes (Social Security + Medicare). This is already factored into the comparison.
                                </p>
                              </div>
                            ) : results.compensationBreakdown.selfEmploymentTaxImpact ? (
                              <div className="bg-amber-50 border border-amber-200 rounded-md p-2">
                                <p className="text-[10px] text-amber-800">
                                  <span className="font-semibold">Note:</span> Since you&apos;ve included self-employment taxes in your current rate, this comparison assumes the same tax treatment in private practice.
                                </p>
                              </div>
                            ) : (
                              <div className="bg-amber-50 border border-amber-200 rounded-md p-2">
                                <p className="text-[10px] text-amber-800">
                                  <span className="font-semibold">Note:</span> Self-employment taxes (~15.3%) apply in private practice and are factored into this comparison.
                                </p>
                              </div>
                            )}
                            <div className="bg-gray-50 border border-gray-200 rounded-md p-2">
                              <p className="text-[10px] text-gray-600">
                                Federal and state income taxes are not included. Consult a tax professional for guidance specific to your situation.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <div className="text-2xl mb-2">🔄</div>
                        <p className="text-nesso-ink font-medium text-sm mb-1">Private practice comparison</p>
                        <p className="text-nesso-ink/60 text-xs">See how many sessions you&apos;d need in private practice to match your current income.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Navigation Buttons - centered below both cards */}
                {results && (
                  <div className="pt-4 flex justify-center gap-3 max-w-md mx-auto">
                    <button
                      onClick={goBack}
                      className="flex-1 py-2 px-4 border border-gray-300 text-nesso-ink rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setCurrentPanel(1)}
                      className="flex-1 py-2 px-4 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Start Over
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Live preview widget for mobile - shows on steps 2-3 when results available */}
      <LivePreviewWidget results={results} currentPanel={currentPanel} resultsPanel={resultsPanel} />

      {/* Fixed bottom section */}
      <div className="flex-shrink-0 px-4 pb-2" style={{ backgroundColor: '#F4F7F3' }}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-nesso-navy/5 rounded-lg p-4 border border-nesso-navy/10 mb-2">
            <p className="text-base text-center text-nesso-navy">
              This tool is a free service from <span className="font-semibold">Nesso</span>, a new kind of EHR built to help therapists grow their practice and grow as business owners.
              <br className="md:hidden" />
              <span className="hidden md:inline"> </span>
              <a
                href="https://nessoapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-nesso-navy underline hover:no-underline font-medium"
              >
                Learn more
              </a>
            </p>
          </div>
          <div className="flex justify-center items-center space-x-6 text-xs text-nesso-ink/50">
            <a href="/privacy" className="hover:text-nesso-navy transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-nesso-navy transition-colors">Terms</a>
            <span>© 2025 Nesso Labs, Inc</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton loading component
function LoadingSkeleton() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4F7F3' }}>
      <div className="max-w-6xl mx-auto px-4 pt-8">
        {/* Header skeleton */}
        <div className="text-center space-y-4 mb-8">
          <div className="h-8 w-64 bg-gray-200 rounded-lg mx-auto animate-pulse" />
          <div className="h-4 w-48 bg-gray-200 rounded mx-auto animate-pulse" />
        </div>

        {/* Progress indicator skeleton */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              <div className="w-16 h-3 bg-gray-200 rounded animate-pulse hidden md:block" />
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg p-6 space-y-4">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrueRatePage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <TrueRateContent />
    </Suspense>
  );
}
