// Storybook for this mockup: one story file per screen under screens/, one story per state.
// mockup.config.json names the framework, the kit design and extra design directories.
import tailwindcss from "@tailwindcss/vite";
import type { StorybookConfig } from "@storybook/react-vite";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const config = JSON.parse(readFileSync(join(root, "mockup.config.json"), "utf8"));
// The kit preset reads these; an environment value set by the caller wins.
if (config.framework) process.env.SIMPLIX_FRAMEWORK ??= resolve(root, config.framework);
process.env.KIT_DESIGN ??= config.design ?? "framework";
process.env.KIT_DESIGN_DIRS ??= (config.designDirs ?? []).map((dir: string) => resolve(root, dir)).join(":");

const storybook: StorybookConfig = {
  stories: ["../screens/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-a11y", "storybook-addon-pseudo-states", join(root, "kit/storybook/preset.mjs")],
  framework: "@storybook/react-vite",
  viteFinal(viteConfig) {
    viteConfig.plugins ??= [];
    viteConfig.plugins.push(tailwindcss());
    return viteConfig;
  },
};

export default storybook;
