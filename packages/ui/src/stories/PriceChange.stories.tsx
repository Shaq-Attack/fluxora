import type { Meta, StoryObj } from '@storybook/react';
import { PriceChange } from '../components/PriceChange';

const meta: Meta<typeof PriceChange> = {
  title: 'Design System/PriceChange',
  component: PriceChange,
};

export default meta;

type Story = StoryObj<typeof PriceChange>;

export const Up: Story = { args: { value: '+2.34%', direction: 'up' } };
export const Down: Story = { args: { value: '-1.12%', direction: 'down' } };
export const Neutral: Story = { args: { value: '0.00%', direction: 'neutral' } };
