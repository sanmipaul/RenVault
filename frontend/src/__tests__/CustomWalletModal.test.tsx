import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the AppKit hook
jest.mock('@reown/appkit/react', () => ({
  useAppKit: () => ({
    open: jest.fn(),
    close: jest.fn(),
  }),
}));

// Import components after mocking
import CustomWalletModal from '../components/CustomWalletModal';
import WalletRecommendations from '../components/WalletRecommendations';
import OnboardingGuide from '../components/OnboardingGuide';
import {
  ModalHeader,
  ModalFooter,
  SecurityBadges,
  NetworkStatus,
  FeatureHighlights,
  FAQSection,
} from '../components/modal';

describe('CustomWalletModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  it('renders when isOpen is true', () => {
    render(<CustomWalletModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<CustomWalletModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<CustomWalletModal {...defaultProps} />);
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when overlay is clicked', () => {
    render(<CustomWalletModal {...defaultProps} />);
    const overlay = screen.getByRole('dialog');
    fireEvent.click(overlay);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('does not close when modal content is clicked', () => {
    render(<CustomWalletModal {...defaultProps} />);
    const content = screen.getByText('Choose Your Wallet');
    fireEvent.click(content);
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('renders sidebar by default', () => {
    render(<CustomWalletModal {...defaultProps} />);
    expect(screen.getByText('Why RenVault?')).toBeInTheDocument();
  });

  it('hides sidebar when showSidebar is false', () => {
    render(<CustomWalletModal {...defaultProps} showSidebar={false} />);
    expect(screen.queryByText('Why RenVault?')).not.toBeInTheDocument();
  });
});

describe('ModalHeader', () => {
  const defaultProps = {
    onClose: jest.fn(),
  };

  it('renders RenVault branding', () => {
    render(<ModalHeader {...defaultProps} />);
    expect(screen.getByText('RenVault')).toBeInTheDocument();
    expect(screen.getByText('Connect to Your Vault')).toBeInTheDocument();
  });

  it('renders network indicator when enabled', () => {
    render(<ModalHeader {...defaultProps} showNetworkIndicator networkStatus="online" />);
    expect(screen.getByText(/Stacks: Connected/i)).toBeInTheDocument();
  });

  it('shows different status colors based on network status', () => {
    const { rerender } = render(
      <ModalHeader {...defaultProps} showNetworkIndicator networkStatus="online" />
    );
    expect(screen.getByText(/Connected/i)).toBeInTheDocument();

    rerender(<ModalHeader {...defaultProps} showNetworkIndicator networkStatus="congested" />);
    expect(screen.getByText(/Congested/i)).toBeInTheDocument();

    rerender(<ModalHeader {...defaultProps} showNetworkIndicator networkStatus="offline" />);
    expect(screen.getByText(/Offline/i)).toBeInTheDocument();
  });
});

describe('ModalFooter', () => {
  it('renders legal links', () => {
    render(<ModalFooter />);
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  it('renders guide link when enabled', () => {
    const onGuideClick = jest.fn();
    render(<ModalFooter showGuideLink onGuideClick={onGuideClick} />);
    const guideLink = screen.getByText(/New to wallets/i);
    fireEvent.click(guideLink);
    expect(onGuideClick).toHaveBeenCalled();
  });
});

describe('WalletRecommendations', () => {
  const defaultProps = {
    onSelect: jest.fn(),
  };

  it('renders wallet list', () => {
    render(<WalletRecommendations {...defaultProps} />);
    expect(screen.getByText('Hiro Wallet')).toBeInTheDocument();
    expect(screen.getByText('Leather')).toBeInTheDocument();
    expect(screen.getByText('Xverse')).toBeInTheDocument();
  });

  it('shows recommended badge for recommended wallets', () => {
    render(<WalletRecommendations {...defaultProps} />);
    expect(screen.getAllByText('Recommended').length).toBeGreaterThan(0);
  });

  it('calls onSelect when wallet is clicked', () => {
    render(<WalletRecommendations {...defaultProps} />);
    const hiroWallet = screen.getByText('Hiro Wallet');
    fireEvent.click(hiroWallet.closest('[role="button"]')!);
    expect(defaultProps.onSelect).toHaveBeenCalledWith('hiro');
  });

  it('shows help section for new users', () => {
    render(<WalletRecommendations {...defaultProps} showGetWalletLinks />);
    expect(screen.getByText(/New to Stacks wallets/i)).toBeInTheDocument();
  });
});

describe('OnboardingGuide', () => {
  it('renders first step by default', () => {
    render(<OnboardingGuide variant="compact" />);
    expect(screen.getByText('What is a wallet?')).toBeInTheDocument();
  });

  it('navigates to next step when next button is clicked', () => {
    render(<OnboardingGuide variant="compact" />);
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    expect(screen.getByText('Why connect?')).toBeInTheDocument();
  });

  it('navigates to previous step when back button is clicked', () => {
    render(<OnboardingGuide variant="compact" />);
    // Go to step 2
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Why connect?')).toBeInTheDocument();
    // Go back
    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByText('What is a wallet?')).toBeInTheDocument();
  });

  it('calls onComplete when completing all steps', () => {
    const onComplete = jest.fn();
    render(<OnboardingGuide variant="compact" onComplete={onComplete} />);
    // Navigate through all steps
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Start Over'));
    expect(onComplete).toHaveBeenCalled();
  });

  it('renders full variant with sidebar', () => {
    render(<OnboardingGuide variant="full" />);
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
  });
});

describe('SecurityBadges', () => {
  it('renders security badges', () => {
    render(<SecurityBadges />);
    expect(screen.getByText('Smart Contract Audited')).toBeInTheDocument();
    expect(screen.getByText('Non-Custodial')).toBeInTheDocument();
    expect(screen.getByText('Multi-Sig Security')).toBeInTheDocument();
  });

  it('shows verified indicators', () => {
    render(<SecurityBadges />);
    const verifiedIcons = document.querySelectorAll('.renvault-security-badge__verified');
    expect(verifiedIcons.length).toBeGreaterThan(0);
  });
});

describe('NetworkStatus', () => {
  it('renders network status', () => {
    render(<NetworkStatus />);
    expect(screen.getByText(/Stacks Mainnet/i)).toBeInTheDocument();
  });

  it('shows operational status by default', () => {
    render(<NetworkStatus />);
    expect(screen.getByText('Operational')).toBeInTheDocument();
  });

  it('shows refresh button', () => {
    const onRefresh = jest.fn();
    render(<NetworkStatus onRefresh={onRefresh} />);
    expect(screen.getByText('Refresh')).toBeInTheDocument();
  });

  it('shows details when enabled', () => {
    render(<NetworkStatus showDetails />);
    expect(screen.getByText('Block Height')).toBeInTheDocument();
    expect(screen.getByText('Avg Gas')).toBeInTheDocument();
  });
});

describe('FeatureHighlights', () => {
  it('renders feature list', () => {
    render(<FeatureHighlights />);
    expect(screen.getByText('Secure Micro-Savings')).toBeInTheDocument();
    expect(screen.getByText('Earn Commitment Points')).toBeInTheDocument();
    expect(screen.getByText('Withdraw Anytime')).toBeInTheDocument();
  });

  it('shows stats when enabled', () => {
    render(<FeatureHighlights showStats />);
    expect(screen.getByText('$2.4M TVL')).toBeInTheDocument();
  });
});

describe('FAQSection', () => {
  it('renders FAQ list', () => {
    render(<FAQSection />);
    expect(screen.getByText('What is a crypto wallet?')).toBeInTheDocument();
    expect(screen.getByText('Why do I need to connect my wallet?')).toBeInTheDocument();
  });

  it('expands answer when question is clicked', () => {
    render(<FAQSection />);
    const question = screen.getByText('What is a crypto wallet?');
    fireEvent.click(question);
    expect(
      screen.getByText(/A crypto wallet is software that stores your private keys/i)
    ).toBeInTheDocument();
  });

  it('shows category filters when enabled', () => {
    render(<FAQSection showCategories />);
    expect(screen.getByText('Wallets')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('calls onContactSupport when support button is clicked', () => {
    const onContactSupport = jest.fn();
    render(<FAQSection onContactSupport={onContactSupport} />);
    const supportButton = screen.getByText('Contact Support');
    fireEvent.click(supportButton);
    expect(onContactSupport).toHaveBeenCalled();
  });
});

describe('Accessibility', () => {
  it('modal has correct ARIA attributes', () => {
    render(<CustomWalletModal isOpen onClose={jest.fn()} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('close button has accessible label', () => {
    render(<ModalHeader onClose={jest.fn()} />);
    expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
  });

  it('wallet items are keyboard accessible', () => {
    render(<WalletRecommendations onSelect={jest.fn()} />);
    const walletItem = screen.getByText('Hiro Wallet').closest('[role="button"]');
    expect(walletItem).toHaveAttribute('tabIndex', '0');
  });

  it('FAQ items have correct ARIA expanded state', () => {
    render(<FAQSection />);
    const question = screen.getByText('What is a crypto wallet?').closest('button');
    expect(question).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(question!);
    expect(question).toHaveAttribute('aria-expanded', 'true');
  });
});
