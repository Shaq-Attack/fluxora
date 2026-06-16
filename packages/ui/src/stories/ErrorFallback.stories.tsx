import type { Meta, StoryObj } from '@storybook/react';
import { ErrorFallback } from '../components/ErrorFallback';

const meta: Meta<typeof ErrorFallback> = {
  title: 'Design System/ErrorFallback',
  component: ErrorFallback,
};

export default meta;

type Story = StoryObj<typeof ErrorFallback>;

export const Default: Story = {};

export const WithRetry: Story = {
  args: {
    message: 'The Order Book panel failed to render.',
    onRetry: () => {},
  },
};

export const CustomTitle: Story = {
  args: {
    title: 'Chart unavailable',
    message: 'Could not load chart data.',
    onRetry: () => {},
  },
};
