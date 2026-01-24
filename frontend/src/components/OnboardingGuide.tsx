import React, { useState } from 'react';

interface OnboardingStep {
  title: string;
  description: string;
  icon: string;
}

const STEPS: OnboardingStep[] = [
  {
    title: 'What is a wallet?',
    description: 'A digital wallet allows you to securely store, send, and receive digital assets like STX and Bitcoin.',
    icon: '👛'
  },
  {
    title: 'Why connect?',
    description: 'Connecting your wallet allows RenVault to interact with your funds securely without ever knowing your private keys.',
    icon: '🔗'
  },
  {
    title: 'Is it safe?',
    description: 'Yes! RenVault is non-custodial. We never have access to your funds; only the smart contract does.',
    icon: '🛡️'
  }
];

const OnboardingGuide: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="onboarding-guide" style={{
      padding: '20px',
      backgroundColor: '#f8fafc',
      borderRadius: '16px',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span style={{ fontSize: '24px' }}>{STEPS[currentStep].icon}</span>
        <h4 style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>{STEPS[currentStep].title}</h4>
      </div>
      
      <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
        {STEPS[currentStep].description}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {STEPS.map((_, index) => (
            <div 
              key={index}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: index === currentStep ? '#4a80f5' : '#cbd5e1'
              }}
            />
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(prev => prev - 1)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: 'white',
              fontSize: '12px',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              color: '#64748b'
            }}
          >
            Back
          </button>
          <button 
            onClick={() => currentStep === STEPS.length - 1 ? setCurrentStep(0) : setCurrentStep(prev => prev + 1)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#4a80f5',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {currentStep === STEPS.length - 1 ? 'Start Over' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingGuide;
