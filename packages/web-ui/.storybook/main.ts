import type { StorybookConfig } from '@storybook/react-vite';

// Storybook configuration for the Ria design system. This configuration tells
// Storybook where to find stories, which addons to use, and which framework
// integration to load. We target the Vite+React builder for fast refreshes.

const config: StorybookConfig = {
  // Globs pointing to your component stories. Adjust paths when you add
  // new components or move files. We only search within the src tree.
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  // Common addons for documentation, controls and accessibility. Add
  // additional addons here as your design system grows (e.g. interactions).
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  // Define the framework we are using. Storybook will pick up the
  // appropriate presets for React with Vite. Options may be extended in
  // the future as needed.
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // You can customise the final Vite configuration here. For now we
  // simply return the config unchanged.
  async viteFinal(config) {
    return config;
  },
};

export default config;