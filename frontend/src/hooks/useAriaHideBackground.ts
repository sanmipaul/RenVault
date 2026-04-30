import { useEffect } from 'react';

/**
 * When `active` is true, sets aria-hidden="true" on every direct child of
 * `document.body` except the modal container itself. This prevents screen
 * readers from announcing background content while a modal is open.
 *
 * Cleans up on deactivation by removing the attributes.
 */
export function useAriaHideBackground(active: boolean, modalSelector = '.modal-overlay'): void {
  useEffect(() => {
    if (!active) return;

    const siblings = Array.from(document.body.children).filter(
      el => !el.matches(modalSelector) && el.getAttribute('aria-hidden') !== 'true'
    ) as HTMLElement[];

    siblings.forEach(el => el.setAttribute('aria-hidden', 'true'));

    return () => {
      siblings.forEach(el => el.removeAttribute('aria-hidden'));
    };
  }, [active, modalSelector]);
}
