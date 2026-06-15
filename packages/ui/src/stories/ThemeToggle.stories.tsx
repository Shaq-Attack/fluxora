import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ThemeToggle } from '../components/ThemeToggle';

const meta: Meta<typeof ThemeToggle> = {
  title: 'Design System/ThemeToggle',
  component: ThemeToggle,
};

export default meta;

type Story = StoryObj<typeof ThemeToggle>;

export const ShowingMoon: Story = { args: { isDark: true, onToggle: () => {} } };
export const ShowingSun: Story = { args: { isDark: false, onToggle: () => {} } };
function InteractiveTemplate(): JSX.Element {
  const [isDark, setIsDark] = useState(true);
  return <ThemeToggle isDark={isDark} onToggle={() => setIsDark((d) => !d)} />;
}

export const Interactive: Story = {
  render: () => <InteractiveTemplate />,
};
