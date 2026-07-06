import type { Meta, StoryObj } from '@storybook/react';
import { Toast } from '../components/Toast';

const meta: Meta<typeof Toast> = {
  title: 'Design System/Toast',
  component: Toast,
};

export default meta;

type Story = StoryObj<typeof Toast>;

export const Success: Story = {
  args: { variant: 'success', message: 'Bought 0.500000 BTC/USD @ $108,000.00', onDismiss: () => {} },
};
export const Error: Story = {
  args: { variant: 'error', message: 'Market feed disconnected — reconnecting…', onDismiss: () => {} },
};
export const Info: Story = {
  args: { variant: 'info', message: 'Limit sell placed: 0.250000 ETH/USD @ $4,200.00' },
};
