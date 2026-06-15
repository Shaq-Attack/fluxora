import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../components/Badge';

const meta: Meta<typeof Badge> = {
  title: 'Design System/Badge',
  component: Badge,
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Connected: Story = { args: { variant: 'green', label: 'Live' } };
export const Connecting: Story = { args: { variant: 'amber', label: 'Connecting', pulse: true } };
export const Disconnected: Story = { args: { variant: 'red', label: 'Disconnected' } };
export const Neutral: Story = { args: { variant: 'gray', label: 'Inactive' } };
