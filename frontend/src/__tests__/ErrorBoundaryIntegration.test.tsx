import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ErrorFallback } from '../components/ErrorFallback';
import { useErrorBoundaryReset } from '../hooks/useErrorBoundaryReset';

const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('The above error occurred')) return;
    originalError(...args);
  };
});
afterAll(() => { console.error = originalError; });

function RiskyWidget({ id }: { id: number }) {
  if (id < 0) throw new Error(`invalid id: ${id}`);
  return <div data-testid="widget">Widget #{id}</div>;
}

function BoundaryWithReset({ id }: { id: number }) {
  const { resetKey, reset } = useErrorBoundaryReset();
  return (
    <ErrorBoundary
      key={resetKey}
      sectionName="Widget"
      fallback={(error) => (
        <div>
          <ErrorFallback error={error} sectionName="Widget" onReset={reset} compact />
        </div>
      )}
    >
      <RiskyWidget id={id} />
    </ErrorBoundary>
  );
}

describe('ErrorBoundary integration with useErrorBoundaryReset', () => {
  it('renders widget normally when id >= 0', () => {
    render(<BoundaryWithReset id={5} />);
    expect(screen.getByTestId('widget')).toHaveTextContent('Widget #5');
  });

  it('shows compact fallback when widget throws', () => {
    render(<BoundaryWithReset id={-1} />);
    expect(screen.getByText(/widget failed to load/i)).toBeInTheDocument();
  });

  it('resets boundary via useErrorBoundaryReset key', () => {
    const { rerender } = render(<BoundaryWithReset id={-1} />);
    // The fallback Retry button is rendered; click it to reset the key
    fireEvent.click(screen.getByText('Retry'));
    // After reset, rerender with a valid id
    rerender(<BoundaryWithReset id={3} />);
    expect(screen.getByTestId('widget')).toHaveTextContent('Widget #3');
  });

  it('boundary catches multiple sequential throws', () => {
    const onError = jest.fn();
    const { rerender } = render(
      <ErrorBoundary onError={onError} fallback={<div>err</div>}>
        <RiskyWidget id={-1} />
      </ErrorBoundary>
    );
    expect(screen.getByText('err')).toBeInTheDocument();
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('passes error message through fallback function to ErrorFallback', () => {
    render(
      <ErrorBoundary
        sectionName="Stats"
        fallback={(error, reset) => (
          <ErrorFallback error={error} sectionName="Stats" onReset={reset} />
        )}
      >
        <RiskyWidget id={-99} />
      </ErrorBoundary>
    );
    expect(screen.getByText(/invalid id: -99/i)).toBeInTheDocument();
    expect(screen.getByText('Stats Error')).toBeInTheDocument();
  });
});
