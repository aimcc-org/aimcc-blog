import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  staticDirs: ["../public"],
  stories: ["../src/**/*.stories.tsx"],
  addons: ["@storybook/addon-docs"],
  framework: "@storybook/react-vite",
  core: { disableTelemetry: true },
};
export default config;
