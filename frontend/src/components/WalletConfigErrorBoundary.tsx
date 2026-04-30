import React, { Component, ErrorInfo, ReactNode } from 'react';
import { WalletConfigError } from '../types/walletConfig';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  validationWarnings?: WalletConfigError[];
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class WalletConfigErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Wallet configuration error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Wallet Configuration Error</h2>
          <p>Unable to load wallet configuration. Please refresh the page.</p>
          {this.state.error && (
            <p style={{ color: '#e53e3e', fontSize: '0.875rem' }}>{this.state.error.message}</p>
          )}
        </div>
      );
    }

    const { validationWarnings } = this.props;
    return (
      <>
        {validationWarnings && validationWarnings.length > 0 && (
          <div
            role="alert"
            aria-label="Wallet configuration warnings"
            style={{ background: '#fffbeb', border: '1px solid #f6e05e', borderRadius: 6, padding: '8px 12px', marginBottom: 8 }}
          >
            {validationWarnings.map((w, i) => (
              <p key={i} style={{ margin: 0, fontSize: '0.8rem', color: '#92400e' }}>
                ⚠ {w.field}: {w.message}
              </p>
            ))}
          </div>
        )}
        {this.props.children}
      </>
    );
  }
}
