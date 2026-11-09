#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { overrideBreaches, planTemplates } from "./lib/plan.mjs";
import { fenceBreaches, typecheckProject } from "./lib/typecheck.mjs";

/**
 * Generates a project from every template a kit ships, through the simplix CLI itself, and checks
 * what was generated.
 *
 * Usage: node testing/template-harness/harness.mjs <kit package directory>
 *
 * The kit's templates are read the way the generator reads them (the kit, then each kit it
 * extends). Each template is assigned the command that renders it, and a template no command
 * renders fails the run. The CLI then generates a domain from the fixture's SimpliX Meta snapshot,
 * a module, the CRUD screen with its route and menu entry, and one page of every kind and variant
 * with its board frame. The run fails on any command that fails, on a kit template that replaces a
 * base kit's without a declared reason, on an import of the generated code that the kit's
 * `simplix.fence` refuses, on any compiler message over the generated project, and on a generated
 * board frame, page or shell that throws or reports an error while it mounts in a DOM.
 *
 * The project is written to `.out/<kit>` and kept, so a failure can be read where it happened.
 */

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../..");
const cliDir = join(repoRoot, "node_modules", "@simplix-react", "cli");
const cliBin = join(cliDir, "dist", "bin.js");

function fail(lines) {
  for (const line of lines) process.stderr.write(`✖ ${line}\n`);
  process.exit(1);
}

const kitArg = process.argv[2];
if (!kitArg) fail(["usage: harness.mjs <kit package directory>"]);
const kitDir = resolve(kitArg);
const kitManifest = JSON.parse(readFileSync(join(kitDir, "package.json"), "utf-8"));
const kitLabel = kitManifest.name.replace(/^@[^/]+\//, "");
const out = join(here, ".out", kitLabel);

const { loadProjectTemplates, resolveKitChain } = await import(pathToFileURL(join(cliDir, "dist", "index.js")).href);
if (typeof resolveKitChain !== "function") {
  const { version } = JSON.parse(readFileSync(join(cliDir, "package.json"), "utf-8"));
  fail([`@simplix-react/cli ${version} reads no kit chain (simplix.extends); the templates need 0.3.12 or later. Run pnpm local:link to use a framework checkout until it is released.`]);
}

// The project the CLI writes into: the fixture, and the dependencies an app holds, which the CLI
// loads its plugins from and the compiler resolves generated code through.
rmSync(out, { recursive: true, force: true });
mkdirSync(dirname(out), { recursive: true });
cpSync(join(here, "fixture"), out, { recursive: true });
linkDependencies(join(out, "node_modules"), [join(repoRoot, "node_modules"), join(here, "node_modules")]);

const chain = await resolveKitChain(out, kitDir);
const own = new Set(templateNames(chain.kit?.templates));
const base = new Set(chain.layers.slice(0, -1).flatMap((layer) => templateNames(layer.templates)));
const breaches = overrideBreaches(base, own, kitManifest.simplix?.overrides ?? {});

const templates = await loadProjectTemplates(out, kitDir);
const plan = planTemplates(templates.keys());
const problems = [...breaches, ...plan.unrendered.map((name) => `${name}.hbs: no CLI command renders it`)];
if (problems.length > 0) fail(problems);

writeConfig(plan);
const commands = commandsFor(plan);
for (const args of commands) run(args);
if (plan.route) await writeRouteTree();

const fenced = fenceBreaches(out, kitManifest.simplix?.fence ?? []);
if (fenced.length > 0) fail([`${fenced.length} import(s) in the generated code that ${kitManifest.name} fences:`, ...fenced]);

const messages = typecheckProject(out, join(out, "config", "typescript", "react.json"), [kitDir]);
if (messages.length > 0) fail([`${messages.length} compiler message(s) over the code generated from ${kitManifest.name}:`, ...messages]);

mountGenerated();

process.stdout.write(
  `✔ ${kitManifest.name}: ${templates.size} template(s), ${commands.length} command(s), ` +
    `${plan.pages.length} page(s), no fenced import, the generated project compiles and mounts (${relative(repoRoot, out)})\n`,
);

/** Mounts every generated board frame, page and shell in a DOM (`mount/mount.test.tsx`). */
function mountGenerated() {
  const vitest = join(here, "node_modules", ".bin", "vitest");
  try {
    execFileSync(vitest, ["run", "--config", join(here, "mount", "vitest.config.mjs")], {
      cwd: here,
      stdio: "pipe",
      encoding: "utf-8",
      env: { ...process.env, HARNESS_OUT: out, HARNESS_KIT: kitDir },
    });
  } catch (error) {
    const output = `${error.stdout ?? ""}${error.stderr ?? ""}`.split("\n").filter((line) => /FAIL|Error|Received|^\s*[+-]\s/.test(line)).slice(0, 30);
    fail([`the code generated from ${kitManifest.name} does not mount:`, ...output]);
  }
}

/**
 * A `node_modules` holding a link to every package of each source directory, later sources winning:
 * the workspace's hoisted framework packages and plugins, and the harness's own dependencies, which
 * are the libraries a generated app declares (React, the router, the query client, Zod, MSW, Storybook).
 */
function linkDependencies(target, sources) {
  mkdirSync(target, { recursive: true });
  for (const source of sources) {
    for (const entry of readdirSync(source)) {
      if (entry.startsWith(".")) continue;
      if (entry.startsWith("@")) {
        mkdirSync(join(target, entry), { recursive: true });
        for (const scoped of readdirSync(join(source, entry))) replaceLink(join(source, entry, scoped), join(target, entry, scoped));
      } else {
        replaceLink(join(source, entry), join(target, entry));
      }
    }
  }
}

function replaceLink(from, to) {
  rmSync(to, { recursive: true, force: true });
  symlinkSync(from, to);
}

function templateNames(dir) {
  if (!dir || !existsSync(dir)) return [];
  return readdirSync(dir).filter((file) => file.endsWith(".hbs")).map((file) => file.slice(0, -".hbs".length));
}

function writeConfig({ route }) {
  const routes = route
    ? `
  routes: {
    admin: {
      dir: "apps/admin/src/routes",
      template: ${JSON.stringify(route)},
      menu: { file: "apps/admin/src/menu.ts", marker: "@simplix-menu admin", icon: "FileTextIcon" },
    },
  },`
    : "";
  writeFileSync(
    join(out, "simplix.config.ts"),
    `import { defineConfig } from "@simplix-react/cli";

export default defineConfig({
  plugins: ["@simplix-react-ext/simplix-boot-cli-plugin"],
  templates: { from: ${JSON.stringify(kitDir)}, storiesDir: "stories" },
  modules: { groups: ["admin"] },
  packages: { prefix: "" },
  api: { baseUrl: "/api" },
  i18n: { locales: ["en", "ko"], defaultLocale: "en" },
  scaffold: {
    defaultSortFields: ["createdAt"],
    referencePickers: {
      userAccount: { hook: "useUserAccountSearch", from: "@fixture/pickers", facetFor: "createUserFacet" },
    },
  },${routes}
  openapi: [
    {
      profile: "simplix-boot",
      domains: { note: ["user.admin.UserNote"] },
      meta: { source: "openapi/meta.json", snapshot: "openapi/meta.json" },
    },
  ],
});
`,
  );
}

function commandsFor(plan) {
  const commands = [];
  if (plan.scaffold) {
    commands.push(["add-domain", "note", "-y"], ["meta", "--offline"]);
  }
  commands.push(["add-module", "admin/note", "-y"]);
  if (plan.scaffold) commands.push(["scaffold", "UserNote", "--module", "admin/note"]);
  for (const page of plan.pages) {
    const name = `${page.kind}-${page.variant ?? "default"}`;
    const variant = page.variant ? ["--variant", page.variant] : [];
    if (page.kind === "app-shell") {
      // A shell is the app's root layout, so each variant is drawn into an app of its own.
      const app = `shell-${page.variant ?? "default"}`;
      mkdirSync(join(out, "apps", app, "src"), { recursive: true });
      writeFileSync(join(out, "apps", app, "package.json"), JSON.stringify({ name: `@fixture/${app}`, private: true, type: "module" }));
      commands.push(["add-page", "app-shell", "shell", "--app", app, ...variant]);
    } else {
      commands.push(["add-page", page.kind, name, "--module", "admin/note", ...variant]);
    }
  }
  return commands;
}

function run(args) {
  try {
    execFileSync(process.execPath, [cliBin, ...args], { cwd: out, stdio: "pipe", encoding: "utf-8" });
  } catch (error) {
    const output = `${error.stdout ?? ""}${error.stderr ?? ""}`.trim().split("\n").slice(-12);
    fail([`simplix ${args.join(" ")} exited ${error.status}:`, ...output]);
  }
}

/** The route tree the router generator writes for the admin app, so its routes compile against their real types. */
async function writeRouteTree() {
  const appSrc = join(out, "apps", "admin", "src");
  const { Generator, getConfig } = await import("@tanstack/router-generator");
  const config = getConfig(
    {
      target: "react",
      routesDirectory: join(appSrc, "routes"),
      generatedRouteTree: join(appSrc, "routeTree.gen.ts"),
      disableLogging: true,
    },
    join(out, "apps", "admin"),
  );
  await new Generator({ config, root: join(out, "apps", "admin") }).run();
}
