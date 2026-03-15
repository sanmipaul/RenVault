import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../components/ErrorBoundary';

// Suppress console.error noise from React's error boundary in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('The above error occurred') ||
        args[0].includes('Error: Uncaught'))
    ) {
      return;
    }
    originalError(...args);
  };
});
afterAll(() => {
  console.error = originalError;
});

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test explosion');
  return <div>Safe content</div>;
}

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('renders default fallback when a child throws', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('displays the error message in the fallback', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Test explosion')).toBeInTheDocument();
  });

  it('shows sectionName in the fallback when provided', () => {
    render(
      <ErrorBoundary sectionName="Analytics">
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText(/analytics encountered an error/i)).toBeInTheDocument();
  });

  it('renders custom fallback ReactNode when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
  });

  it('renders custom fallback function with error and reset args', () => {
    render(
      <ErrorBoundary fallback={(err, reset) => (
        <button onClick={reset}>Reset: {err.message}</button>
      )}>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Reset: Test explosion')).toBeInTheDocument();
  });

  it('calls onError callback when a child throws', () => {
    const onError = jest.fn();
    render(
      <ErrorBoundary onError={onError}>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test explosion' }),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('recovers after reset is called', () => {
    const { rerender } = render(
      <ErrorBoundary fallback={(_, reset) => (
        <button onClick={reset}>reset</button>
      )}>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );
    fireEvent.click(screen.getByText('reset'));
    rerender(
      <ErrorBoundary fallback={(_, reset) => (
        <button onClick={reset}>reset</button>
      )}>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });
});
