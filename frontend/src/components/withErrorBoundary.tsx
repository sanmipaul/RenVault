import React, { ComponentType } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { ErrorFallback } from './ErrorFallback';

export interface WithErrorBoundaryOptions {
  sectionName?: string;
  compact?: boolean;
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
): ComponentType<P> {
  const { sectionName, compact = false } = options;
  const displayName = sectionName || WrappedComponent.displayName || WrappedComponent.name || 'Component';

  function Wrapped(props: P) {
    return (
      <ErrorBoundary
        sectionName={displayName}
        fallback={(error, reset) => (
          <ErrorFallback
            error={error}
            sectionName={displayName}
            onReset={reset}
            compact={compact}
          />
        )}
      >
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  }

  Wrapped.displayName = `WithErrorBoundary(${displayName})`;
  return Wrapped;
}
