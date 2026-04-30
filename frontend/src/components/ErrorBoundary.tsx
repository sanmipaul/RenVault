import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logBoundaryError } from '../utils/errorBoundaryLogger';

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  sectionName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    logBoundaryError(error, errorInfo, this.props.sectionName);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (
      this.state.hasError &&
      this.props.resetOnPropsChange &&
      prevProps.children !== this.props.children
    ) {
      this.reset();
    }
  }

  reset(): void {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, sectionName } = this.props;

    if (hasError && error) {
      if (typeof fallback === 'function') {
        return fallback(error, this.reset);
      }
      if (fallback) {
        return fallback;
      }
      return (
        <DefaultErrorFallback
          error={error}
          sectionName={sectionName}
          onReset={this.reset}
        />
      );
    }

    return children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error;
  sectionName?: string;
  onReset: () => void;
}

function DefaultErrorFallback({ error, sectionName, onReset }: DefaultErrorFallbackProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        padding: '16px',
        border: '1px solid #e53e3e',
        borderRadius: '8px',
        background: '#fff5f5',
        color: '#c53030',
        margin: '8px 0',
      }}
    >
      <strong>
        {sectionName ? `${sectionName} encountered an error` : 'Something went wrong'}
      </strong>
      <p style={{ marginTop: '8px', fontSize: '14px', color: '#744210' }}>
        {error.message || 'An unexpected error occurred.'}
      </p>
      <button
        onClick={onReset}
        style={{
          marginTop: '12px',
          padding: '6px 14px',
          borderRadius: '4px',
          border: 'none',
          background: '#e53e3e',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '13px',
        }}
      >
        Try Again
      </button>
    </div>
  );
}
