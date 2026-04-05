// hooks/useStatusMessage.ts
import { useState, useEffect } from 'react';

interface UseStatusMessageResult {
  status: string;
  setStatus: (msg: string) => void;
  clearStatus: () => void;
}

export const useStatusMessage = (autoClearMs = 10000): UseStatusMessageResult => {
  const [status, setStatusState] = useState<string>('');

  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatusState(''), autoClearMs);
    return () => clearTimeout(timer);
  }, [status, autoClearMs]);

  const setStatus = (msg: string) => setStatusState(msg);
  const clearStatus = () => setStatusState('');

  return { status, setStatus, clearStatus };
};
