import { renderHook } from '@testing-library/react';
import { useAriaHideBackground } from '../hooks/useAriaHideBackground';

function createBodyChild(tag = 'div'): HTMLElement {
  const el = document.createElement(tag);
  document.body.appendChild(el);
  return el;
}

describe('useAriaHideBackground', () => {
  let sibling: HTMLElement;

  beforeEach(() => {
    sibling = createBodyChild();
  });

  afterEach(() => {
    document.body.removeChild(sibling);
  });

  it('sets aria-hidden on body siblings when active', () => {
    renderHook(() => useAriaHideBackground(true));
    expect(sibling.getAttribute('aria-hidden')).toBe('true');
  });

  it('does not set aria-hidden when inactive', () => {
    renderHook(() => useAriaHideBackground(false));
    expect(sibling.getAttribute('aria-hidden')).toBeNull();
  });

  it('removes aria-hidden on cleanup when active becomes false', () => {
    const { rerender } = renderHook(({ active }: { active: boolean }) => useAriaHideBackground(active), {
      initialProps: { active: true },
    });
    expect(sibling.getAttribute('aria-hidden')).toBe('true');
    rerender({ active: false });
    expect(sibling.getAttribute('aria-hidden')).toBeNull();
  });

  it('does not override already aria-hidden elements', () => {
    sibling.setAttribute('aria-hidden', 'true');
    renderHook(() => useAriaHideBackground(true));
    // It skips already-hidden siblings
    expect(sibling.getAttribute('aria-hidden')).toBe('true');
  });

  it('removes aria-hidden on unmount', () => {
    const { unmount } = renderHook(() => useAriaHideBackground(true));
    expect(sibling.getAttribute('aria-hidden')).toBe('true');
    unmount();
    expect(sibling.getAttribute('aria-hidden')).toBeNull();
  });
});
