import { render, act } from '@testing-library/react';
import { afterEach, describe, it, expect } from 'vitest';
import { useToastStore, pushToast } from '../store/toastStore';
import { ToastViewport } from './ToastViewport';

describe('ToastViewport', () => {
  afterEach(() => {
    act(() => {
      useToastStore.setState({ toasts: [] });
    });
  });

  it('keeps the aria-live region mounted with no toasts so screen readers can pick up later announcements', () => {
    const { container } = render(<ToastViewport />);
    const liveRegion = container.querySelector('[aria-live]');
    expect(liveRegion).not.toBeNull();
    expect(liveRegion?.textContent).toBe('');
  });

  it('renders a pushed toast message inside the already-mounted live region', () => {
    const { container } = render(<ToastViewport />);
    const liveRegion = container.querySelector('[aria-live]');
    act(() => {
      pushToast({ message: 'Order filled' });
    });
    expect(liveRegion?.textContent).toContain('Order filled');
  });
});
