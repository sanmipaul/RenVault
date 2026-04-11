import React, { useRef, ReactNode } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface FocusTrapWrapperProps {
  active: boolean;
  onEscape?: () => void;
  children: ReactNode;
  className?: string;
}

/**
 * Wraps modal content in a div that traps keyboard focus when active.
 * Drop this around any modal body in place of a plain div.
 */
export function FocusTrapWrapper({ active, onEscape, children, className }: FocusTrapWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, active, onEscape);

  return (
    <div
      ref={ref}
      className={className}
      // Allow container itself to receive focus as fallback
      tabIndex={-1}
      style={{ outline: 'none' }}
    >
      {children}
    </div>
  );
}
