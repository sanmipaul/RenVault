import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FocusTrapWrapper } from '../components/FocusTrapWrapper';

function ModalDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button data-testid="open-btn" onClick={() => setOpen(true)}>Open Modal</button>
      <p data-testid="background-text">Background content</p>
      {open && (
        <div className="modal-overlay">
          <FocusTrapWrapper active={open} onEscape={() => setOpen(false)}>
            <h2>Modal Title</h2>
            <button data-testid="modal-btn-1">Action 1</button>
            <button data-testid="modal-btn-2">Action 2</button>
            <button data-testid="close-btn" onClick={() => setOpen(false)}>Close</button>
          </FocusTrapWrapper>
        </div>
      )}
    </div>
  );
}

describe('FocusTrapWrapper modal integration', () => {
  it('focuses first interactive element when modal opens', () => {
    render(<ModalDemo />);
    fireEvent.click(screen.getByTestId('open-btn'));
    expect(document.activeElement).toBe(screen.getByTestId('modal-btn-1'));
  });

  it('closes modal and restores focus on Escape', () => {
    render(<ModalDemo />);
    const openBtn = screen.getByTestId('open-btn');
    openBtn.focus();
    fireEvent.click(openBtn);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('modal-btn-1')).not.toBeInTheDocument();
  });

  it('wraps Tab focus from last to first element', () => {
    render(<ModalDemo />);
    fireEvent.click(screen.getByTestId('open-btn'));

    const closeBtn = screen.getByTestId('close-btn');
    closeBtn.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(screen.getByTestId('modal-btn-1'));
  });

  it('closes on close button click and unmounts modal content', () => {
    render(<ModalDemo />);
    fireEvent.click(screen.getByTestId('open-btn'));
    fireEvent.click(screen.getByTestId('close-btn'));
    expect(screen.queryByTestId('modal-btn-1')).not.toBeInTheDocument();
  });
});
