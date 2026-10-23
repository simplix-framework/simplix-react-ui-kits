// The kit's Storybook: every framework story, rendered with the design named by KIT_DESIGN.
import tailwindcss from "@tailwindcss/vite";
import type { StorybookConfig } from "@storybook/react-vite";
import { join } from "node:path";

const framework = process.env.SIMPLIX_FRAMEWORK;
if (!framework) throw new Error("set SIMPLIX_FRAMEWORK to a simplix-react checkout");

const config: StorybookConfig = {
  stories: [{ directory: join(framework, "apps/storybook/src/stories"), files: "**/*.stories.@(ts|tsx)" }],
  addons: [
    "@storybook/addon-a11y",
    "@storybook/addon-themes",
    "@storybook/addon-designs",
    "storybook-addon-pseudo-states",
    join(import.meta.dirname, "../storybook/preset.mjs"),
  ],
  framework: "@storybook/react-vite",
  viteFinal(viteConfig) {
    viteConfig.plugins ??= [];
    viteConfig.plugins.push(tailwindcss());
    return viteConfig;
  },
};

export default config;
