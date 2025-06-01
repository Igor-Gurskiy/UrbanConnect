import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  // addons: [
  //   '@storybook/addon-links',
  //   '@storybook/addon-essentials',
  //   '@storybook/addon-onboarding',
  //   '@storybook/addon-interactions',
  // ],
  framework: '@storybook/react-vite',
  viteFinal: async (config) => {
    config.css = {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "bootstrap/scss/bootstrap";`,
        },
      },
    };
    return config;
  },
};

export default config;