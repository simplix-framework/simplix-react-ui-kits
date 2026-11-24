// Storybook for this mockup: one story file per screen under screens/, one story per state.
// mockup.config.json names the framework, the design and the directories that hold the designs;
// the mockup preset reads it.
import tailwindcss from "@tailwindcss/vite";
import type { StorybookConfig } from "@storybook/react-vite";

const storybook: StorybookConfig = {
  stories: ["../screens/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-a11y", "storybook-addon-pseudo-states", "@simplix-react-ui-kits/mockup/preset"],
  framework: "@storybook/react-vite",
  viteFinal(viteConfig) {
    viteConfig.plugins ??= [];
    viteConfig.plugins.push(tailwindcss());
    return viteConfig;
  },
};

export default storybook;
