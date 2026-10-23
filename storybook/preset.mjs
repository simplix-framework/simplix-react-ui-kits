// Storybook preset: adds the kit's Vite plugin to a Storybook that uses @storybook/react-vite.
//   addons: ["<kit>/storybook/preset.mjs"]  with KIT_DESIGN, SIMPLIX_FRAMEWORK and
//   KIT_DESIGN_DIRS (colon-separated) read from the environment.
import { simplixMockupKit } from "../lib/vite-plugin.mjs";

export async function viteFinal(config) {
  const designDirs = (process.env.KIT_DESIGN_DIRS ?? "").split(":").filter(Boolean);
  config.plugins ??= [];
  config.plugins.unshift(simplixMockupKit({ libraryRoot: process.cwd(), designDirs }));
  return config;
}
