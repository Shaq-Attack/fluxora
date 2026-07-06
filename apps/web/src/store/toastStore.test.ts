import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { pushToast, useToastStore } from './toastStore';

describe('toastStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      vi.runAllTimers();
    });
    vi.useRealTimers();
    useToastStore.setState({ toasts: [] });
  });

  it('pushes a toast with the given message and variant', () => {
    pushToast({ variant: 'success', message: 'Order filled' });
    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    const toast = toasts[0];
    expect(toast?.message).toBe('Order filled');
    expect(toast?.variant).toBe('success');
  });

  it('defaults to the info variant', () => {
    pushToast({ message: 'Heads up' });
    expect(useToastStore.getState().toasts[0]?.variant).toBe('info');
  });

  it('auto-dismisses after the default duration', () => {
    pushToast({ message: 'Transient' });
    expect(useToastStore.getState().toasts).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('dismisses a toast by id', () => {
    const id = pushToast({ message: 'Dismiss me' });
    useToastStore.getState().dismissToast(id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('caps the stack at four toasts, dropping the oldest', () => {
    for (let i = 1; i <= 5; i += 1) pushToast({ message: `Toast ${i}` });
    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(4);
    expect(toasts[0]?.message).toBe('Toast 2');
    expect(toasts[3]?.message).toBe('Toast 5');
  });
});
