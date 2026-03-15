import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { withErrorBoundary } from '../components/withErrorBoundary';

const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('The above error occurred')) return;
    originalError(...args);
  };
});
afterAll(() => {
  console.error = originalError;
});

function BombComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('HOC bomb');
  return <div>HOC safe</div>;
}

describe('withErrorBoundary', () => {
  it('renders wrapped component normally', () => {
    const Safe = withErrorBoundary(BombComponent, { sectionName: 'BombSection' });
    render(<Safe shouldThrow={false} />);
    expect(screen.getByText('HOC safe')).toBeInTheDocument();
  });

  it('renders compact fallback when compact option is set', () => {
    const Safe = withErrorBoundary(BombComponent, { sectionName: 'BombSection', compact: true });
    render(<Safe shouldThrow={true} />);
    expect(screen.getByText(/bombsection failed to load/i)).toBeInTheDocument();
  });

  it('renders full fallback when compact option is not set', () => {
    const Safe = withErrorBoundary(BombComponent, { sectionName: 'BombSection' });
    render(<Safe shouldThrow={true} />);
    expect(screen.getByText(/bombsection error/i)).toBeInTheDocument();
  });

  it('sets displayName on the wrapped component', () => {
    const Safe = withErrorBoundary(BombComponent, { sectionName: 'BombSection' });
    expect(Safe.displayName).toBe('WithErrorBoundary(BombSection)');
  });

  it('resets and re-renders after clicking Retry', () => {
    const Safe = withErrorBoundary(BombComponent, { sectionName: 'BombSection', compact: true });
    const { rerender } = render(<Safe shouldThrow={true} />);
    fireEvent.click(screen.getByText('Retry'));
    rerender(<Safe shouldThrow={false} />);
    expect(screen.getByText('HOC safe')).toBeInTheDocument();
  });
});
