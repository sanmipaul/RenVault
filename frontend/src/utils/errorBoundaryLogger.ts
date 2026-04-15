import { logger } from './logger';
import { ErrorInfo } from 'react';

export interface BoundaryErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  section?: string;
  timestamp: string;
  url: string;
}

export function logBoundaryError(error: Error, errorInfo: ErrorInfo, section?: string): void {
  const report: BoundaryErrorReport = {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack ?? undefined,
    section,
    timestamp: new Date().toISOString(),
    url: window.location.href,
  };

  // Always log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.group('[ErrorBoundary]' + (section ? ` — ${section}` : ''));
    logger.error('Error:', error);
    logger.error('Component stack:', errorInfo.componentStack);
    console.groupEnd();
  }

  // Send to analytics endpoint if available
  try {
    const analyticsUrl = (window as any).__RENVAULT_ANALYTICS_URL__;
    if (analyticsUrl) {
      navigator.sendBeacon(analyticsUrl + '/errors', JSON.stringify(report));
    }
  } catch {
    // sendBeacon may fail silently — that's acceptable
  }
}
