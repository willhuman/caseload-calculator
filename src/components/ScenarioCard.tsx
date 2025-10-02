import { useState } from 'react';
import { CalculationResults, formatCurrency, formatRange } from '@/lib/calculations';
import { DonutChart } from './DonutChart';

interface ScenarioCardProps {
  title: string;
  results: CalculationResults;
  incomeGoal: number;
  sessionFee: number;
  onEmailClick: () => void;
}

// Define tips for each scenario
const getTipsForScenario = (title: string): { heading: string; tips: string[] } => {
  switch (title) {
    case 'Current Path':
      return {
        heading: '📊 Understanding this baseline',
        tips: [
          'This is your starting point - it shows what your practice looks like today.',
          'Use this as a reference to compare the other approaches.'
        ]
      };
    case 'Higher Fee Path':
      return {
        heading: '💡 Tips for implementing this plan',
        tips: [
          'Start by researching rates in your area: Check the Psychology Today directory or your professional association\'s resources to see what others with similar experience and specialties are charging.',
          'Give existing clients advance notice: When talking with current clients, give them notice well in advance. They\'ll appreciate your thoughtfulness: "I\'ll be adjusting my fee in two months. I wanted to give you time to prepare."',
          'Consider grandfathering long-term clients at a slightly lower rate if that feels right.',
          'Start with new clients first: Apply your updated fee to any new clients you take on moving forward.',
          'Remember: most clients understand and accept reasonable fee increases, especially when communicated clearly.'
        ]
      };
    case 'Lighter Caseload Path':
      return {
        heading: '💡 Tips for implementing this plan',
        tips: [
          'A small fee increase means you can see fewer clients while maintaining your income - giving you space to breathe and show up fully present.',
          'Fewer clients means more energy for each person you see. When you\'re not stretched thin, the quality of care naturally improves.',
          'Consider starting gradually - raise fees for new clients first, then transition existing clients over time.',
          'The extra time can be a gift to yourself - whether that\'s rest, supervision, continuing education, or just having margin in your week.',
          'Clients often notice and appreciate when their therapist is well-rested and energized - it shows in your presence.'
        ]
      };
    case 'Reduced Cancellations Path':
      return {
        heading: '💡 Tips for implementing this plan',
        tips: [
          'A clear 24-48 hour cancellation policy, put in writing, helps both you and clients. Most therapists see cancellation rates drop to 5-8% once a policy is in place.',
          'Consider a cancellation fee (50-100% of session cost) for late cancellations - this protects the time you\'ve set aside.',
          'Send appointment reminders 24-48 hours in advance via text or email - a gentle nudge helps clients remember.',
          'Be consistent - enforce your policy fairly with all clients to maintain healthy boundaries.',
          'Remember: clients who value the work will respect reasonable boundaries around scheduling.'
        ]
      };
    case 'Streamlined Admin Path':
      return {
        heading: '💡 Tips for implementing this plan',
        tips: [
          'Try batching similar tasks together - set aside specific blocks for billing, scheduling, or emails instead of scattering them throughout your week. You might be surprised how much faster it goes.',
          'Consider practice management software that handles scheduling and billing automatically - it can feel like having an assistant without the cost.',
          'For progress notes, AI tools like Nesso (nessoapp.com) can help you write thorough, accurate notes in a fraction of the time - so you can focus on your clients, not paperwork.',
          'Set boundaries around when you do admin work. Evenings and weekends can be sacred time if you protect them.',
          'Think about what tasks could be delegated or eliminated altogether - not everything on your list truly needs your expertise.'
        ]
      };
    case 'Optimized Path':
      return {
        heading: '💡 Tips for implementing this plan',
        tips: [
          'You\'re in a sweet spot right now - meeting your goals with time to spare. This is a chance to be intentional about what comes next.',
          'Think about what would make your practice feel more aligned with your values: Maybe it\'s offering sliding scale spots, pursuing additional training, or simply protecting this balance you\'ve created.',
          'You have the gift of choice here - no urgent changes needed. Take time to reflect on what would bring you the most satisfaction in your work.'
        ]
      };
    default:
      return {
        heading: '💡 Tips for implementing this plan',
        tips: [
          'Take time to consider what feels right for your practice.',
          'Small, consistent changes often work better than dramatic shifts.',
          'Talk to colleagues about what\'s worked for them.'
        ]
      };
  }
};

export function ScenarioCard({ title, results, incomeGoal, sessionFee, onEmailClick }: ScenarioCardProps) {
  const [showTips, setShowTips] = useState(false);
  const tipsData = getTipsForScenario(title);
  return (
    <div className="bg-nesso-card rounded-xl ring-1 ring-black/5 shadow-sm p-4 md:p-5 space-y-4 flex flex-col h-full">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-nesso-navy mb-1.5">{title}</h3>
        <p className="text-xs text-nesso-ink/60">
          Targeting {formatCurrency(incomeGoal)}/month at {formatCurrency(sessionFee)} per session
        </p>
      </div>

      {/* Section 1: What this looks like */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-semibold text-nesso-navy uppercase tracking-wide">What this looks like</h4>
        <p className="text-sm text-nesso-ink/80 leading-relaxed">
          You&apos;d see around {formatRange(results.caseloadRange.low, results.caseloadRange.high)} clients each week. This accounts for
          the reality that some sessions get cancelled or rescheduled.
        </p>
      </div>

      {/* Section 2: Your weekly time breakdown */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-nesso-navy uppercase tracking-wide">Your weekly time breakdown</h4>
        <p className="text-sm text-nesso-ink/80 leading-relaxed">
          This adds up to about <span className="font-semibold text-nesso-navy">{results.totalHours.toFixed(1)} hours per week</span> when you include sessions,
          documentation time, and admin work.
        </p>

        {/* Donut Chart */}
        <DonutChart
          sessionHours={results.sessionHours}
          docHours={results.docHours}
          adminHours={results.adminHours}
          totalHours={results.totalHours}
          size="small"
        />
      </div>

      {/* Section 3: How sustainable is this? */}
      <div className="space-y-2.5 pt-2.5 border-t border-nesso-navy/10 flex-grow">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs font-semibold text-nesso-navy uppercase tracking-wide">How sustainable is this?</h4>
          <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            results.overallLabel === 'sustainable' ? 'bg-blue-100 text-blue-800' :
            results.overallLabel === 'room-to-grow' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {results.overallLabel === 'sustainable' && 'Sustainable'}
            {results.overallLabel === 'room-to-grow' && 'Room to grow'}
            {results.overallLabel === 'challenging' && 'Challenging'}
          </div>
        </div>

        {/* Wellness check icons */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded flex items-center justify-center ${
                results.financialOK ? 'bg-green-100' : 'bg-gray-100'
              }`}
              aria-label={`Financial wellness: ${results.financialOK ? 'met' : 'not met'}`}
            >
              {results.financialOK && (
                <svg className="w-3 h-3 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="text-xs text-nesso-ink">You&apos;d meet your income goal</span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded flex items-center justify-center ${
                results.timeOK ? 'bg-green-100' : 'bg-gray-100'
              }`}
              aria-label={`Time balance: ${results.timeOK ? 'met' : 'not met'}`}
            >
              {results.timeOK && (
                <svg className="w-3 h-3 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="text-xs text-nesso-ink">Your schedule stays manageable</span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded flex items-center justify-center ${
                results.qualityOK ? 'bg-green-100' : 'bg-gray-100'
              }`}
              aria-label={`Quality care: ${results.qualityOK ? 'met' : 'not met'}`}
            >
              {results.qualityOK && (
                <svg className="w-3 h-3 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="text-xs text-nesso-ink">You have time for quality care</span>
          </div>
        </div>

        {/* Summary sentence */}
        <p className="text-xs text-nesso-ink/80 pt-1 leading-relaxed" aria-live="polite">
          {results.overallSnippet}
        </p>
      </div>

      {/* Tips Section */}
      <div className="pt-2 border-t border-nesso-navy/10">
        <button
          onClick={() => setShowTips(!showTips)}
          className="w-full flex items-center justify-between text-left group"
        >
          <span className="text-xs font-semibold text-nesso-navy uppercase tracking-wide group-hover:text-nesso-coral transition-colors">
            {tipsData.heading}
          </span>
          <svg
            className={`w-4 h-4 text-nesso-navy transition-transform ${showTips ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showTips && (
          <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {tipsData.tips.map((tip, index) => (
              <div key={index} className="flex gap-2">
                <span className="text-nesso-coral text-xs mt-0.5">•</span>
                <p className="text-xs text-nesso-ink/80 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="pt-3">
        <button
          onClick={onEmailClick}
          className="w-full px-4 py-2 text-sm rounded-lg bg-nesso-coral hover:bg-nesso-coral/90 text-black font-medium transition-colors focus:ring-2 focus:ring-nesso-coral"
        >
          Email me this plan
        </button>
      </div>
    </div>
  );
}
