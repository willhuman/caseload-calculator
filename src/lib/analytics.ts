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
}