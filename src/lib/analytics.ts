/**
 * Analytics tracking utility
 * Provides a simple interface that can be later connected to real analytics tools
 */

export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  data?: unknown;
}

export function trackEvent(event: AnalyticsEvent): void {
  // For now, log to console with a clear format
  console.log(`[Analytics] ${event.category}: ${event.action}`, {
    label: event.label,
    value: event.value,
    data: event.data,
    timestamp: new Date().toISOString()
  });

  // TODO: Replace with real analytics service integration
  // Examples:
  // - Google Analytics 4: gtag('event', event.action, { ... })
  // - Mixpanel: mixpanel.track(event.action, { ... })
  // - Custom analytics API: fetch('/api/analytics', { ... })
}

// Predefined event tracking functions for common actions
export const analytics = {
  calculateClicked: (data?: unknown) => {
    trackEvent({
      action: 'calculate_clicked',
      category: 'caseload_calculator',
      label: 'primary_calculation',
      data
    });
  },

  emailReportOpened: () => {
    trackEvent({
      action: 'email_report_opened',
      category: 'caseload_calculator',
      label: 'modal_opened'
    });
  },

  emailReportSubmitted: (email: string) => {
    trackEvent({
      action: 'email_report_submitted',
      category: 'caseload_calculator',
      label: 'form_submitted',
      data: { email }
    });
  },

  sessionFeeSliderChanged: (value: number) => {
    trackEvent({
      action: 'session_fee_slider_changed',
      category: 'caseload_calculator',
      label: 'what_if_tool',
      value
    });
  }
};