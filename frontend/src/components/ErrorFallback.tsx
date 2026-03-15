import React from 'react';

export interface ErrorFallbackProps {
  error: Error;
  sectionName?: string;
  onReset?: () => void;
  compact?: boolean;
}

export function ErrorFallback({ error, sectionName, onReset, compact = false }: ErrorFallbackProps) {
  if (compact) {
    return (
      <div
        role="alert"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          borderRadius: '6px',
          background: '#fff5f5',
          border: '1px solid #feb2b2',
          color: '#c53030',
          fontSize: '13px',
        }}
      >
        <span aria-hidden="true">⚠</span>
        <span>
          {sectionName ? `${sectionName} failed to load.` : 'This section failed to load.'}
        </span>
        {onReset && (
          <button
            onClick={onReset}
            style={{
              marginLeft: 'auto',
              padding: '2px 10px',
              borderRadius: '4px',
              border: '1px solid #fc8181',
              background: 'transparent',
              color: '#c53030',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="card"
      style={{
        borderColor: '#e53e3e',
        background: '#fff5f5',
      }}
    >
      <h3 style={{ color: '#c53030', marginBottom: '8px' }}>
        {sectionName ? `${sectionName} Error` : 'Unexpected Error'}
      </h3>
      <p style={{ color: '#744210', fontSize: '14px', marginBottom: '12px' }}>
        {error.message || 'An unexpected error occurred in this section.'}
      </p>
      <p style={{ color: '#9b2c2c', fontSize: '12px', marginBottom: '16px' }}>
        The rest of the application is still functional. You can try reloading this section or
        refresh the page if the problem persists.
      </p>
      <div style={{ display: 'flex', gap: '10px' }}>
        {onReset && (
          <button className="btn btn-primary" onClick={onReset}>
            Reload Section
          </button>
        )}
        <button
          className="btn btn-secondary"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}
