import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FocusTrapWrapper } from '../components/FocusTrapWrapper';

describe('FocusTrapWrapper', () => {
  it('renders children', () => {
    render(
      <FocusTrapWrapper active={true}>
        <button>Inside</button>
      </FocusTrapWrapper>
    );
    expect(screen.getByText('Inside')).toBeInTheDocument();
  });

  it('passes className to wrapper div', () => {
    const { container } = render(
      <FocusTrapWrapper active={false} className="my-trap">
        <span>child</span>
      </FocusTrapWrapper>
    );
    expect(container.querySelector('.my-trap')).toBeInTheDocument();
  });

  it('wrapper div has tabIndex=-1 for fallback focus', () => {
    const { container } = render(
      <FocusTrapWrapper active={false}>
        <span>child</span>
      </FocusTrapWrapper>
    );
    expect(container.firstElementChild?.getAttribute('tabindex')).toBe('-1');
  });

  it('focuses first button when activated', () => {
    render(
      <FocusTrapWrapper active={true}>
        <button data-testid="first">First</button>
        <button data-testid="second">Second</button>
      </FocusTrapWrapper>
    );
    expect(document.activeElement).toBe(screen.getByTestId('first'));
  });

  it('calls onEscape when Escape is pressed while active', () => {
    const onEscape = jest.fn();
    render(
      <FocusTrapWrapper active={true} onEscape={onEscape}>
        <button>btn</button>
      </FocusTrapWrapper>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('does not call onEscape when inactive', () => {
    const onEscape = jest.fn();
    render(
      <FocusTrapWrapper active={false} onEscape={onEscape}>
        <button>btn</button>
      </FocusTrapWrapper>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscape).not.toHaveBeenCalled();
  });
});
