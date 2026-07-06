import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PriceChange } from './PriceChange';

describe('PriceChange', () => {
  it('renders the value without a flash class initially', () => {
    const { container } = render(<PriceChange value="100.00" />);
    const span = container.querySelector('span');
    expect(span).not.toBeNull();
    expect(span?.textContent).toBe('100.00');
    expect(span?.className).not.toContain('animate-flash');
  });

  it('flashes up when the numeric value increases', () => {
    const { container, rerender } = render(<PriceChange value="100.00" />);
    rerender(<PriceChange value="101.00" />);
    expect(container.querySelector('span')?.className).toContain('animate-flash-up');
  });

  it('flashes down when the numeric value decreases', () => {
    const { container, rerender } = render(<PriceChange value="$1,250.00" />);
    rerender(<PriceChange value="$1,249.50" />);
    expect(container.querySelector('span')?.className).toContain('animate-flash-down');
  });

  it('does not flash when flash is disabled', () => {
    const { container, rerender } = render(<PriceChange flash={false} value="100.00" />);
    rerender(<PriceChange flash={false} value="101.00" />);
    expect(container.querySelector('span')?.className).not.toContain('animate-flash');
  });

  it('does not flash on non-numeric values', () => {
    const { container, rerender } = render(<PriceChange value="—" />);
    rerender(<PriceChange value="100.00" />);
    expect(container.querySelector('span')?.className).not.toContain('animate-flash');
  });

  it('applies the static direction colour', () => {
    const { container } = render(<PriceChange direction="up" value="100.00" />);
    expect(container.querySelector('span')?.className).toContain('text-green-400');
  });
});
