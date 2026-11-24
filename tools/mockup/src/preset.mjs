// Storybook preset: adds this package's Vite plugin to a Storybook that uses @storybook/react-vite.
//   addons: ["@simplix-react-ui-kits/mockup/preset"]
// The framework, the design and the design directories are the mockup root's own, read from its
// mockup.config.json; SIMPLIX_FRAMEWORK, KIT_DESIGN and KIT_DESIGN_DIRS (colon-separated) name
// another for one run.
import { designDirsOf, frameworkOf, readMockupConfig } from "../lib/mockup-root.mjs";
import { simplixMockupKit } from "../lib/vite-plugin.mjs";

export async function viteFinal(config) {
  const root = process.cwd();
  const design = process.env.KIT_DESIGN ?? readMockupConfig(root).design ?? "framework";
  config.plugins ??= [];
  config.plugins.unshift(simplixMockupKit({ libraryRoot: root, framework: frameworkOf(root), design, designDirs: designDirsOf(root) }));
  return config;
}
