import type { Meta, StoryObj } from '@storybook/react';
import { PanelShell } from '../components/PanelShell';

const meta: Meta<typeof PanelShell> = {
  title: 'Design System/PanelShell',
  component: PanelShell,
};

export default meta;

type Story = StoryObj<typeof PanelShell>;

export const WithTitle: Story = {
  args: {
    title: 'BTC/USD',
    children: <p className="p-3 text-sm text-dim">Panel content goes here.</p>,
  },
};

export const WithoutTitle: Story = {
  args: {
    children: <p className="p-3 text-sm text-dim">No title panel.</p>,
  },
};
