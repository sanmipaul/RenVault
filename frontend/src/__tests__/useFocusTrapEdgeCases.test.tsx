import React, { useRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useFocusTrap } from '../hooks/useFocusTrap';

function Trap({ active, onEscape, children }: { active: boolean; onEscape?: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, active, onEscape);
  return <div ref={ref} tabIndex={-1}>{children}</div>;
}

describe('useFocusTrap edge cases', () => {
  it('does not throw when container has no focusable children', () => {
    expect(() => render(<Trap active={true}><p>no buttons</p></Trap>)).not.toThrow();
  });

  it('ignores non-Tab non-Escape keys', () => {
    const onEscape = jest.fn();
    render(
      <Trap active={true} onEscape={onEscape}>
        <button>btn</button>
      </Trap>
    );
    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(onEscape).not.toHaveBeenCalled();
  });

  it('does not wrap focus when mid-list element is focused', () => {
    render(
      <Trap active={true}>
        <button data-testid="a">A</button>
        <button data-testid="b">B</button>
        <button data-testid="c">C</button>
      </Trap>
    );
    const b = screen.getByTestId('b');
    b.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
    // Focus is NOT on first — the browser handles normal Tab; trap only intercepts at boundaries
    expect(document.activeElement).toBe(b);
  });

  it('handles single focusable element without infinite loop', () => {
    render(
      <Trap active={true}>
        <button data-testid="only">Only</button>
      </Trap>
    );
    const only = screen.getByTestId('only');
    only.focus();
    // Tab from last AND first goes back to same element
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(only);
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(only);
  });

  it('removes keydown listener when active becomes false', () => {
    const onEscape = jest.fn();
    const { rerender } = render(<Trap active={true} onEscape={onEscape}><button>b</button></Trap>);
    rerender(<Trap active={false} onEscape={onEscape}><button>b</button></Trap>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscape).not.toHaveBeenCalled();
  });
});
