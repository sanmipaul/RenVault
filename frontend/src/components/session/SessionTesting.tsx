// components/session/SessionTesting.tsx
import React, { useState } from 'react';
import { SessionTesting, SessionTestSuite, SessionTestResult } from '../../utils/sessionTesting';
import './SessionTesting.css';

interface SessionTestingProps {
  onTestComplete?: (suite: SessionTestSuite) => void;
  onTestError?: (error: string) => void;
}

export const SessionTestingComponent: React.FC<SessionTestingProps> = ({
  onTestComplete,
  onTestError
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTestSuite, setCurrentTestSuite] = useState<SessionTestSuite | null>(null);
  const [runningTest, setRunningTest] = useState<string | null>(null);

  const sessionTesting = SessionTesting.getInstance();

  const handleRunFullSuite = async () => {
    setIsRunning(true);
    setCurrentTestSuite(null);
    setRunningTest('Initializing test suite...');

    try {
      // Create a custom test runner that updates progress
      const testSuite = await runTestSuiteWithProgress();
      setCurrentTestSuite(testSuite);
      onTestComplete?.(testSuite);
    } catch (error) {
      console.error('Test suite failed:', error);
      onTestError?.('Test suite execution failed');
    } finally {
      setIsRunning(false);
      setRunningTest(null);
    }
  };

  const runTestSuiteWithProgress = async (): Promise<SessionTestSuite> => {
    const startTime = Date.now();
    const tests: SessionTestResult[] = [];

    const testMethods = [
      { name: 'Session Storage', method: 'testSessionStorage' },
      { name: 'Session Persistence', method: 'testSessionPersistence' },
      { name: 'Session Encryption', method: 'testSessionEncryption' },
      { name: 'Session Validation', method: 'testSessionValidation' },
      { name: 'Session Manager', method: 'testSessionManager' },
      { name: 'Session Reconnection', method: 'testSessionReconnection' },
      { name: 'Session Cleanup', method: 'testSessionCleanup' },
      { name: 'Session Monitoring', method: 'testSessionMonitoring' },
      { name: 'Event Tracking', method: 'testEventTracking' },
      { name: 'Storage Performance', method: 'testStoragePerformance' },
      { name: 'Concurrent Access', method: 'testConcurrentAccess' }
    ];

    for (const test of testMethods) {
      setRunningTest(`Running: ${test.name}`);
      try {
        // Call the test method dynamically
        const result = await (sessionTesting as any)[test.method]();
        tests.push(result);
      } catch (error) {
        tests.push({
          testName: test.name,
          passed: false,
          duration: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const totalTests = tests.length;
    const passedTests = tests.filter(t => t.passed).length;
    const failedTests = totalTests - passedTests;
    const duration = Date.now() - startTime;

    return {
      name: 'Session System Test Suite',
      tests,
      totalTests,
      passedTests,
      failedTests,
      duration
    };
  };

  const getTestStatusIcon = (passed: boolean) => {
    return passed ? '✅' : '❌';
  };

  const getTestStatusClass = (passed: boolean) => {
    return passed ? 'test-passed' : 'test-failed';
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getOverallStatus = (suite: SessionTestSuite) => {
    if (suite.failedTests === 0) return { text: 'All Tests Passed', class: 'status-success' };
    if (suite.passedTests > suite.failedTests) return { text: 'Mostly Passing', class: 'status-warning' };
    return { text: 'Tests Failing', class: 'status-error' };
  };

  return (
    <div className="session-testing">
      <div className="testing-header">
        <h3>Session System Testing</h3>
        <p>Run comprehensive tests to validate session functionality and performance</p>
      </div>

      <div className="testing-controls">
        <button
          className="btn-primary"
          onClick={handleRunFullSuite}
          disabled={isRunning}
        >
          {isRunning ? 'Running Tests...' : 'Run Full Test Suite'}
        </button>

        {runningTest && (
          <div className="running-indicator">
            <div className="spinner"></div>
            <span>{runningTest}</span>
          </div>
        )}
      </div>

      {currentTestSuite && (
        <div className="test-results">
          <div className="suite-summary">
            <h4>Test Suite Results</h4>
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Total Tests</span>
                <span className="stat-value">{currentTestSuite.totalTests}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Passed</span>
                <span className="stat-value passed">{currentTestSuite.passedTests}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Failed</span>
                <span className="stat-value failed">{currentTestSuite.failedTests}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Duration</span>
                <span className="stat-value">{formatDuration(currentTestSuite.duration)}</span>
              </div>
            </div>

            <div className={`overall-status ${getOverallStatus(currentTestSuite).class}`}>
              {getOverallStatus(currentTestSuite).text}
            </div>
          </div>

          <div className="test-details">
            <h4>Test Details</h4>
            <div className="test-list">
              {currentTestSuite.tests.map((test, index) => (
                <div key={index} className={`test-item ${getTestStatusClass(test.passed)}`}>
                  <div className="test-header">
                    <span className="test-icon">{getTestStatusIcon(test.passed)}</span>
                    <span className="test-name">{test.testName}</span>
                    <span className="test-duration">{formatDuration(test.duration)}</span>
                  </div>

                  {test.error && (
                    <div className="test-error">
                      <strong>Error:</strong> {test.error}
                    </div>
                  )}

                  {test.details && (
                    <div className="test-details-content">
                      <pre>{JSON.stringify(test.details, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="testing-info">
        <div className="info-section">
          <h5>Test Coverage</h5>
          <ul>
            <li><strong>Session Storage:</strong> Data persistence, encryption, validation</li>
            <li><strong>Session Persistence:</strong> Cross-session data integrity</li>
            <li><strong>Session Encryption:</strong> Data security and decryption</li>
            <li><strong>Session Validation:</strong> Data integrity checks</li>
            <li><strong>Session Manager:</strong> Lifecycle management</li>
            <li><strong>Session Reconnection:</strong> Auto-reconnection logic</li>
            <li><strong>Session Cleanup:</strong> Maintenance operations</li>
            <li><strong>Session Monitoring:</strong> Analytics and health tracking</li>
            <li><strong>Event Tracking:</strong> Event recording and retrieval</li>
            <li><strong>Storage Performance:</strong> Speed and efficiency tests</li>
            <li><strong>Concurrent Access:</strong> Multi-threaded operation safety</li>
          </ul>
        </div>

        <div className="info-section">
          <h5>Testing Guidelines</h5>
          <ul>
            <li>Tests run in isolation and don't affect production data</li>
            <li>Performance tests ensure operations complete within thresholds</li>
            <li>Concurrent access tests validate thread safety</li>
            <li>All tests include proper cleanup to avoid data pollution</li>
            <li>Failed tests provide detailed error information for debugging</li>
          </ul>
        </div>
      </div>
    </div>
  );
};