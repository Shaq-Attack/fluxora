import type { Meta, StoryObj } from '@storybook/react';
import { StatDisplay } from '../components/StatDisplay';

const meta: Meta<typeof StatDisplay> = {
  title: 'Design System/StatDisplay',
  component: StatDisplay,
};

export default meta;

type Story = StoryObj<typeof StatDisplay>;

export const Bid: Story = { args: { label: 'Bid', value: '67,234.10' } };
export const Ask: Story = { args: { label: 'Ask', value: '67,235.00' } };
export const PnL: Story = {
  args: { label: 'Unrealised PnL', value: '+$1,203.45', valueClassName: 'text-green-400' },
};
