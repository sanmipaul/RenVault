import { useCallback, useState } from 'react';

/**
 * Provides a stable reset key that can be passed to a component tree to force
 * it to remount, effectively resetting any error boundary state.
 *
 * Usage:
 *   const { resetKey, reset } = useErrorBoundaryReset();
 *   return <ErrorBoundary key={resetKey}>...</ErrorBoundary>;
 */
export function useErrorBoundaryReset(): { resetKey: number; reset: () => void } {
  const [resetKey, setResetKey] = useState(0);

  const reset = useCallback(() => {
    setResetKey(k => k + 1);
  }, []);

  return { resetKey, reset };
}
