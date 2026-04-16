import React, { useRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useFocusTrap } from '../hooks/useFocusTrap';

function Trap({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, active);
  return (
    <div ref={ref} tabIndex={-1}>
      <a href="#first" data-testid="link">Link</a>
      <button data-testid="btn">Button</button>
      <select data-testid="sel"><option>opt</option></select>
      <textarea data-testid="ta" />
    </div>
  );
}

describe('useFocusTrap focusable element types', () => {
  it('includes anchor links in the focus cycle', () => {
    render(<Trap active={true} />);
    // First focusable is the anchor
    expect(document.activeElement).toBe(screen.getByTestId('link'));
  });

  it('wraps from textarea (last) back to anchor (first) on Tab', () => {
    render(<Trap active={true} />);
    const ta = screen.getByTestId('ta');
    ta.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(screen.getByTestId('link'));
  });

  it('includes select and textarea in the focusable set', () => {
    render(<Trap active={true} />);
    // Shift+Tab from anchor goes to textarea (last focusable)
    const link = screen.getByTestId('link');
    link.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(screen.getByTestId('ta'));
  });
});
