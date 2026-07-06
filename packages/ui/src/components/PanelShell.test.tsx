import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PanelShell } from './PanelShell';

describe('PanelShell', () => {
  it('is content-sized by default (no flex fill classes)', () => {
    const { container } = render(
      <PanelShell title="T">
        <p>body</p>
      </PanelShell>,
    );
    const root = container.firstElementChild;
    expect(root).not.toBeNull();
    expect(root?.className).not.toContain('flex-1');
  });

  it('fill mode makes the root a min-h-0 flex column so it fills its grid share', () => {
    const { container } = render(
      <PanelShell fill title="T">
        <p>body</p>
      </PanelShell>,
    );
    const root = container.firstElementChild;
    expect(root?.className).toContain('flex-1');
    expect(root?.className).toContain('min-h-0');
    expect(root?.className).toContain('flex-col');
  });

  it('pins the title bar with shrink-0 so scrolling content cannot crush it', () => {
    const { getByText } = render(
      <PanelShell fill title="Order Book">
        <p>body</p>
      </PanelShell>,
    );
    const titleBar = getByText('Order Book').parentElement;
    expect(titleBar?.className).toContain('shrink-0');
  });
});
