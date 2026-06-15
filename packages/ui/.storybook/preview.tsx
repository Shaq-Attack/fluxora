import type { Preview } from '@storybook/react';
import '../src/storybook.css';

const preview: Preview = {
  decorators: [
    (Story, context) => {
      document.documentElement.className = (context.globals['theme'] as string) ?? 'dark';
      return <Story />;
    },
  ],
  globalTypes: {
    theme: {
      name: 'Theme',
      defaultValue: 'dark',
      toolbar: {
        icon: 'sun',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
      },
    },
  },
};

export default preview;
