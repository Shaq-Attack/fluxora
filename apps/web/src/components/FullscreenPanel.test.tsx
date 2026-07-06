import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FullscreenPanel } from './FullscreenPanel';

describe('FullscreenPanel', () => {
  it('applies sizing className to the non-fullscreen wrapper', () => {
    const { container } = render(
      <FullscreenPanel className="lg:flex-1" id="test-panel">
        <p>content</p>
      </FullscreenPanel>,
    );
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain('lg:flex-1');
  });

  it('non-fullscreen wrapper is a min-h-0 flex column so height flows to the panel', () => {
    const { container } = render(
      <FullscreenPanel id="test-panel">
        <p>content</p>
      </FullscreenPanel>,
    );
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain('flex-col');
    expect(wrapper?.className).toContain('min-h-0');
  });
});
