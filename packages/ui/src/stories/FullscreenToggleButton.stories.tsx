import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FullscreenToggleButton } from '../components/FullscreenToggleButton';

const meta: Meta<typeof FullscreenToggleButton> = {
  title: 'Design System/FullscreenToggleButton',
  component: FullscreenToggleButton,
};

export default meta;

type Story = StoryObj<typeof FullscreenToggleButton>;

export const Collapsed: Story = { args: { isFullscreen: false, onToggle: () => {} } };
export const Expanded: Story = { args: { isFullscreen: true, onToggle: () => {} } };

function InteractiveTemplate(): JSX.Element {
  const [isFullscreen, setIsFullscreen] = useState(false);
  return (
    <FullscreenToggleButton
      isFullscreen={isFullscreen}
      onToggle={() => setIsFullscreen((value) => !value)}
    />
  );
}

export const Interactive: Story = {
  render: () => <InteractiveTemplate />,
};
