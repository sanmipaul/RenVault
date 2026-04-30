import React, { useRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useFocusTrap } from '../hooks/useFocusTrap';

function Trap({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, active);
  return (
    <div ref={ref} tabIndex={-1}>
      <button disabled data-testid="disabled-btn">Disabled</button>
      <button data-testid="enabled-btn">Enabled</button>
      <input disabled data-testid="disabled-input" />
      <input data-testid="enabled-input" />
    </div>
  );
}

describe('useFocusTrap disabled element filtering', () => {
  it('skips disabled buttons and focuses first enabled element', () => {
    render(<Trap active={true} />);
    expect(document.activeElement).toBe(screen.getByTestId('enabled-btn'));
  });

  it('does not include disabled inputs in Tab cycle', () => {
    render(<Trap active={true} />);
    // Last focusable should be enabled-input (not disabled-input)
    const enabledInput = screen.getByTestId('enabled-input');
    enabledInput.focus();
    // Tab from last wraps to first enabled
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(screen.getByTestId('enabled-btn'));
  });
});
