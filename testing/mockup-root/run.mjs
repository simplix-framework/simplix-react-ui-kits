#!/usr/bin/env node
// Generates a mockup root for every kit of the workspace and runs in it what a product runs: the
// install, the root's own `check` (screens, types, designs, imports, versions) and the Storybook
// build. Each kit runs in its own lane and is timed; the slowest is named, since it sets the wall time.
//   node testing/mockup-root/run.mjs [<kit directory name>...]
//
// A kit is a package under `packages/` that declares `simplix.id`. The root depends on the kit and
// on the mockup package by `link:`, as a product beside this checkout does, and renders the
// framework checkout the workspace itself is linked to (`simplix.frameworkPath` of the root
// manifest, or SIMPLIX_FRAMEWORK). The roots are written under `.out/`, one per kit.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const workspace = resolve(here, "../..");
const packagesDir = join(workspace, "packages");
const mockup = join(packagesDir, "mockup");
const framework = resolve(workspace, process.env.SIMPLIX_FRAMEWORK ?? JSON.parse(readFileSync(join(workspace, "package.json"), "utf8")).simplix.frameworkPath);

if (!existsSync(join(framework, "pnpm-lock.yaml"))) {
  process.stderr.write(`✖ no framework checkout at ${framework}; a mockup root pins its libraries from the checkout's lockfile\n`);
  process.exit(2);
}

const wanted = process.argv.slice(2);
const kits = readdirSync(packagesDir)
  .filter((name) => existsSync(join(packagesDir, name, "package.json")))
  .map((name) => ({ name, manifest: JSON.parse(readFileSync(join(packagesDir, name, "package.json"), "utf8")) }))
  .filter((kit) => kit.manifest.simplix?.id !== undefined && (wanted.length === 0 || wanted.includes(kit.name)));

if (kits.length === 0) {
  process.stderr.write("✖ no package under packages/ declares simplix.id\n");
  process.exit(2);
}

/** Runs one command in `cwd`; resolves with its exit code and everything it wrote. */
function run(command, args, cwd) {
  return new Promise((done) => {
    const child = spawn(command, args, { cwd, stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, CI: "1" } });
    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk));
    child.stderr.on("data", (chunk) => (output += chunk));
    child.on("error", (error) => done({ code: 1, output: `${output}${error.message}\n` }));
    child.on("close", (code) => done({ code: code ?? 1, output }));
  });
}

// A screen that needs nothing of one kit, so the same file proves every kit's root: the preview's
// settings reach it, and the root's stylesheet (the kit's own) is compiled around it.
const SCREEN = `import type { Meta, StoryObj } from "@storybook/react";
import { useMockupSettings } from "${JSON.parse(readFileSync(join(mockup, "package.json"), "utf8")).name}/settings";

function Screen() {
  const { locale, mode } = useMockupSettings();
  return <p>{\`\${locale} \${mode}\`}</p>;
}

const meta: Meta<typeof Screen> = { title: "Root/Settings", component: Screen };
export default meta;
export const Default: StoryObj<typeof Screen> = {};
`;

async function lane(kit) {
  const started = Date.now();
  const root = join(here, ".out", kit.name);
  rmSync(root, { recursive: true, force: true });
  mkdirSync(root, { recursive: true });
  const steps = [
    ["generate", process.execPath, [join(mockup, "bin/simplix-mockup.mjs"), "init-mockup", "--root", root, "--name", `mockup-root-${kit.name}`, "--ui-kit", kit.manifest.name, "--framework", framework, "--ui-kit-version", `link:${join(packagesDir, kit.name)}`, "--mockup-version", `link:${mockup}`]],
    ["screen", null, null],
    // The root is a project of its own, as a product's is: never a member of this workspace.
    ["install", "pnpm", ["install", "--ignore-workspace", "--prefer-offline"]],
    ["check", "pnpm", ["check"]],
    ["build-storybook", "pnpm", ["build-storybook"]],
  ];
  for (const [label, command, args] of steps) {
    if (label === "screen") {
      writeFileSync(join(root, "screens", "settings.stories.tsx"), SCREEN);
      continue;
    }
    const result = await run(command, args, root);
    if (result.code !== 0) return { kit: kit.name, failed: label, output: result.output, seconds: (Date.now() - started) / 1000 };
  }
  return { kit: kit.name, seconds: (Date.now() - started) / 1000 };
}

const results = await Promise.all(kits.map(lane));
for (const result of results) {
  if (result.failed) process.stdout.write(`✖ ${result.kit}: ${result.failed} failed (${result.seconds.toFixed(1)}s)\n${result.output.trimEnd().split("\n").slice(-40).join("\n")}\n`);
  else process.stdout.write(`✔ ${result.kit}: a generated mockup root installs, passes its check and builds its Storybook (${result.seconds.toFixed(1)}s)\n`);
}
const slowest = results.reduce((a, b) => (b.seconds > a.seconds ? b : a));
process.stdout.write(`slowest: ${slowest.kit}, ${slowest.seconds.toFixed(1)}s\n`);
process.exit(results.every((result) => !result.failed) ? 0 : 1);
