import React, { useRef } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useFocusTrap } from '../hooks/useFocusTrap';

function TestModal({ active, onEscape }: { active: boolean; onEscape?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, active, onEscape);
  return (
    <div ref={ref} data-testid="modal" tabIndex={-1}>
      <button data-testid="btn-first">First</button>
      <button data-testid="btn-second">Second</button>
      <button data-testid="btn-last">Last</button>
    </div>
  );
}

describe('useFocusTrap', () => {
  it('focuses the first focusable element when activated', () => {
    render(<TestModal active={true} />);
    expect(document.activeElement).toBe(screen.getByTestId('btn-first'));
  });

  it('does not change focus when inactive', () => {
    const before = document.activeElement;
    render(<TestModal active={false} />);
    expect(document.activeElement).toBe(before);
  });

  it('calls onEscape when Escape key is pressed', () => {
    const onEscape = jest.fn();
    render(<TestModal active={true} onEscape={onEscape} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('does not call onEscape when inactive', () => {
    const onEscape = jest.fn();
    render(<TestModal active={false} onEscape={onEscape} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscape).not.toHaveBeenCalled();
  });

  it('wraps focus from last to first on Tab', () => {
    render(<TestModal active={true} />);
    const last = screen.getByTestId('btn-last');
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(screen.getByTestId('btn-first'));
  });

  it('wraps focus from first to last on Shift+Tab', () => {
    render(<TestModal active={true} />);
    const first = screen.getByTestId('btn-first');
    first.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(screen.getByTestId('btn-last'));
  });

  it('restores focus to previously focused element on deactivation', () => {
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    outside.focus();

    const { rerender } = render(<TestModal active={true} />);
    expect(document.activeElement).toBe(screen.getByTestId('btn-first'));

    rerender(<TestModal active={false} />);
    expect(document.activeElement).toBe(outside);

    document.body.removeChild(outside);
  });
});
