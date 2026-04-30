import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorFallback } from '../components/ErrorFallback';

describe('ErrorFallback', () => {
  const error = new Error('Something broke');

  it('renders error message', () => {
    render(<ErrorFallback error={error} />);
    expect(screen.getByText('Something broke')).toBeInTheDocument();
  });

  it('renders section name in heading', () => {
    render(<ErrorFallback error={error} sectionName="TransactionHistory" />);
    expect(screen.getByText(/transactionhistory error/i)).toBeInTheDocument();
  });

  it('renders "Reload Section" button when onReset provided', () => {
    const onReset = jest.fn();
    render(<ErrorFallback error={error} onReset={onReset} />);
    fireEvent.click(screen.getByText('Reload Section'));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('does not render Reload Section button without onReset', () => {
    render(<ErrorFallback error={error} />);
    expect(screen.queryByText('Reload Section')).not.toBeInTheDocument();
  });

  it('renders compact variant', () => {
    render(<ErrorFallback error={error} sectionName="Analytics" compact />);
    expect(screen.getByText(/analytics failed to load/i)).toBeInTheDocument();
    expect(screen.queryByText('Reload Section')).not.toBeInTheDocument();
  });

  it('renders compact Retry button when onReset provided', () => {
    const onReset = jest.fn();
    render(<ErrorFallback error={error} compact onReset={onReset} />);
    fireEvent.click(screen.getByText('Retry'));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('has role="alert" for accessibility', () => {
    render(<ErrorFallback error={error} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
