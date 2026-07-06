import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from '../components/Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Design System/Skeleton',
  component: Skeleton,
};

export default meta;

type Story = StoryObj<typeof Skeleton>;

export const StatValue: Story = { args: { className: 'h-4 w-20' } };
export const TableRow: Story = { args: { className: 'h-3 w-64' } };
export const ChartBlock: Story = { args: { className: 'h-40 w-96' } };
