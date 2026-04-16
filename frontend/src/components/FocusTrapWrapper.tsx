import React, { useRef, ReactNode } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useAriaHideBackground } from '../hooks/useAriaHideBackground';

interface FocusTrapWrapperProps {
  active: boolean;
  onEscape?: () => void;
  children: ReactNode;
  className?: string;
}

/**
 * Wraps modal content so that:
 * - Keyboard focus is trapped inside while active.
 * - Background siblings are hidden from screen readers via aria-hidden.
 */
export function FocusTrapWrapper({ active, onEscape, children, className }: FocusTrapWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, active, onEscape);
  useAriaHideBackground(active);

  return (
    <div
      ref={ref}
      className={className}
      tabIndex={-1}
      style={{ outline: 'none' }}
    >
      {children}
    </div>
  );
}
