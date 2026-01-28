import React, { useState, useEffect } from 'react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tips?: string[];
  actionUrl?: string;
  actionLabel?: string;
}

interface OnboardingGuideProps {
  onComplete?: () => void;
  onStepChange?: (stepIndex: number) => void;
  variant?: 'compact' | 'full';
  showProgress?: boolean;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'what-is-wallet',
    title: 'What is a wallet?',
    description:
      'A digital wallet allows you to securely store, send, and receive digital assets like STX and Bitcoin. Think of it as your personal bank account that only you control.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="8" width="24" height="18" rx="2" stroke="#4a80f5" strokeWidth="2" />
        <path d="M4 14h24" stroke="#4a80f5" strokeWidth="2" />
        <circle cx="22" cy="19" r="2" fill="#4a80f5" />
      </svg>
    ),
    tips: [
      'Your wallet stores private keys, not actual coins',
      'Never share your seed phrase with anyone',
      'Popular choices: Hiro Wallet, Leather, Xverse'
    ]
  },
  {
    id: 'why-connect',
    title: 'Why connect?',
    description:
      'Connecting your wallet allows RenVault to interact with your funds securely. We can read your address and request transaction signatures, but we never have access to your private keys.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="10" cy="16" r="6" stroke="#10b981" strokeWidth="2" />
        <circle cx="22" cy="16" r="6" stroke="#10b981" strokeWidth="2" />
        <path d="M16 16h-2M18 16h-2" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    tips: [
      'Connection is read-only by default',
      'Every transaction requires your explicit approval',
      'You can disconnect at any time'
    ]
  },
  {
    id: 'is-it-safe',
    title: 'Is it safe?',
    description:
      'Yes! RenVault is non-custodial, meaning we never have access to your funds. Your assets are secured by audited smart contracts on the Stacks blockchain, which inherits Bitcoin\'s security.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path
          d="M16 4L6 9v6c0 7 4.5 13.5 10 15 5.5-1.5 10-8 10-15V9L16 4z"
          stroke="#f59e0b"
          strokeWidth="2"
        />
        <path d="M12 16l3 3 6-6" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    tips: [
      'Smart contracts are publicly audited',
      'Code is open source and verifiable',
      'No one can access your funds but you'
    ]
  },
  {
    id: 'get-started',
    title: 'How to get started?',
    description:
      'Choose a wallet from our recommendations, install the browser extension or mobile app, create your wallet, and securely back up your seed phrase. Then come back and connect!',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="12" stroke="#6366f1" strokeWidth="2" />
        <path d="M16 10v8l5 3" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    tips: [
      'Installation takes about 2 minutes',
      'Write down your seed phrase on paper',
      'Store backup in a safe place'
    ],
    actionUrl: 'https://wallet.hiro.so',
    actionLabel: 'Get Hiro Wallet'
  }
];

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({
  onComplete,
  onStepChange,
  variant = 'compact',
  showProgress = true
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showTips, setShowTips] = useState(false);

  const step = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);

  const handleNext = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    if (currentStep === ONBOARDING_STEPS.length - 1) {
      onComplete?.();
      setCurrentStep(0);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
    setShowTips(false);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setShowTips(false);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    setShowTips(false);
  };

  if (variant === 'compact') {
    return (
      <div className="renvault-onboarding renvault-onboarding--compact">
        <div className="renvault-onboarding__header">
          <div className="renvault-onboarding__icon">{step.icon}</div>
          <h4 className="renvault-onboarding__title">{step.title}</h4>
        </div>

        <p className="renvault-onboarding__description">{step.description}</p>

        {showProgress && (
          <div className="renvault-onboarding__progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="progress-text">
              {currentStep + 1} of {ONBOARDING_STEPS.length}
            </span>
          </div>
        )}

        <div className="renvault-onboarding__nav">
          <div className="step-dots">
            {ONBOARDING_STEPS.map((_, index) => (
              <button
                key={index}
                className={`step-dot ${index === currentStep ? 'active' : ''} ${
                  completedSteps.has(index) ? 'completed' : ''
                }`}
                onClick={() => handleStepClick(index)}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          <div className="nav-buttons">
            <button
              className="nav-btn nav-btn--back"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </button>
            <button className="nav-btn nav-btn--next" onClick={handleNext}>
              {currentStep === ONBOARDING_STEPS.length - 1 ? 'Start Over' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className="renvault-onboarding renvault-onboarding--full">
      <div className="renvault-onboarding__sidebar">
        <h3 className="sidebar-title">Getting Started</h3>
        <div className="step-list">
          {ONBOARDING_STEPS.map((s, index) => (
            <button
              key={s.id}
              className={`step-item ${index === currentStep ? 'active' : ''} ${
                completedSteps.has(index) ? 'completed' : ''
              }`}
              onClick={() => handleStepClick(index)}
            >
              <span className="step-number">{index + 1}</span>
              <span className="step-title">{s.title}</span>
              {completedSteps.has(index) && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="step-check">
                  <circle cx="8" cy="8" r="8" fill="#10b981" />
                  <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="renvault-onboarding__content">
        <div className="content-header">
          <div className="content-icon">{step.icon}</div>
          <h2 className="content-title">{step.title}</h2>
        </div>

        <p className="content-description">{step.description}</p>

        {step.tips && step.tips.length > 0 && (
          <div className="content-tips">
            <button
              className="tips-toggle"
              onClick={() => setShowTips(!showTips)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 7v4M8 5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {showTips ? 'Hide tips' : 'Show tips'}
            </button>
            {showTips && (
              <ul className="tips-list">
                {step.tips.map((tip, index) => (
                  <li key={index}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7l3 3 7-7" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    {tip}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {step.actionUrl && (
          <a
            href={step.actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="content-action"
          >
            {step.actionLabel || 'Learn more'}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 11l8-8M5 3h6v6" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </a>
        )}

        <div className="content-nav">
          <button
            className="nav-btn nav-btn--back"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Previous
          </button>
          <button className="nav-btn nav-btn--next" onClick={handleNext}>
            {currentStep === ONBOARDING_STEPS.length - 1 ? 'Complete' : 'Next'}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingGuide;
