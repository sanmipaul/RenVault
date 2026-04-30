import { logBoundaryError, BoundaryErrorReport } from '../utils/errorBoundaryLogger';
import { ErrorInfo } from 'react';

describe('logBoundaryError', () => {
  const error = new Error('test error');
  const errorInfo: ErrorInfo = { componentStack: '\n  at Foo\n  at Bar', digest: undefined };

  it('logs to console in development', () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as any).NODE_ENV = 'development';
    const groupSpy = jest.spyOn(console, 'group').mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const groupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => {});

    logBoundaryError(error, errorInfo, 'TestSection');

    expect(groupSpy).toHaveBeenCalledWith('[ErrorBoundary] — TestSection');
    expect(errorSpy).toHaveBeenCalledWith('Error:', error);

    groupSpy.mockRestore();
    errorSpy.mockRestore();
    groupEndSpy.mockRestore();
    (process.env as any).NODE_ENV = originalEnv;
  });

  it('does not throw when called without sectionName', () => {
    expect(() => logBoundaryError(error, errorInfo)).not.toThrow();
  });

  it('does not throw when sendBeacon is unavailable', () => {
    const originalSendBeacon = navigator.sendBeacon;
    Object.defineProperty(navigator, 'sendBeacon', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    expect(() => logBoundaryError(error, errorInfo, 'Section')).not.toThrow();
    Object.defineProperty(navigator, 'sendBeacon', {
      value: originalSendBeacon,
      writable: true,
      configurable: true,
    });
  });
});
