import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../components/ErrorBoundary';

const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('The above error occurred')) return;
    originalError(...args);
  };
});
afterAll(() => { console.error = originalError; });

function Crasher({ id }: { id: number }) {
  if (id === 0) throw new Error(`crash-${id}`);
  return <span>id={id}</span>;
}

describe('ErrorBoundary edge cases', () => {
  it('renders fallback for deeply nested throw', () => {
    function Inner() { throw new Error('deep'); }
    function Middle() { return <Inner />; }
    render(
      <ErrorBoundary fallback={<div>caught deep</div>}>
        <Middle />
      </ErrorBoundary>
    );
    expect(screen.getByText('caught deep')).toBeInTheDocument();
  });

  it('recovers with resetOnPropsChange when children change', () => {
    const { rerender } = render(
      <ErrorBoundary resetOnPropsChange>
        <Crasher id={0} />
      </ErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(
      <ErrorBoundary resetOnPropsChange>
        <Crasher id={1} />
      </ErrorBoundary>
    );
    expect(screen.getByText('id=1')).toBeInTheDocument();
  });

  it('onError receives componentStack in errorInfo', () => {
    const onError = jest.fn();
    render(
      <ErrorBoundary onError={onError}>
        <Crasher id={0} />
      </ErrorBoundary>
    );
    const [, errorInfo] = onError.mock.calls[0];
    expect(typeof errorInfo.componentStack).toBe('string');
    expect(errorInfo.componentStack.length).toBeGreaterThan(0);
  });

  it('does not crash when no fallback and no sectionName', () => {
    render(
      <ErrorBoundary>
        <Crasher id={0} />
      </ErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows "Try Again" button in default fallback', () => {
    render(
      <ErrorBoundary>
        <Crasher id={0} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });
});
