#!/usr/bin/env node
// Checks that every routed screen of the product was designed for its purpose before it was made.
// The design lives in a manifest beside the mockup, one entry per routed screen: the persona and
// the question they bring, whether the screen shows a description, cards and notices (each with
// its reason; none is a decision too), the list presentation, leading column, default sort and
// filters, and the detail sections. A frame generated from the same template as the screen is not
// a design, so agreement against it proves nothing; this manifest is what the frame is drawn from.
//
// The run fails when a routed screen has no entry, an entry is undecided, a decision has no reason,
// a list sorts by its primary key, or a screen's blocks file is still an empty stub while its entry
// asks for a description, cards or notices. A screen not yet customised is listed under
// `acknowledged` with its reason; an acknowledgement whose blocks have since been customised fails
// as stale.
//   screen-design [--root <mockup root>]
//
// Everything specific to a product is the root's `mockup.config.json`, key `screenDesign`, with
// paths relative to the root. A root without the key is left alone.
//   manifest    the design manifest (`{ screens, acknowledged }`)
//   routes      `[{ app, dir }]`: each app's directory of TanStack route files; a file whose name
//               starts with `__` is a layout, not a screen
//   primaryKey  how an entity's primary key is named, `{entity}` in camel case (default {entity}Id)
//   listFiles   the paths of the files that draw a screen's list, relative to the root, with `{entity}` for
//               the entry's entity and `{module}` for the directory above the `src` its blocks file sits in.
//               The entry's list presentation, view switch and card title must equal what the
//               `<RecordList>` element in each declares (`presentation`, `viewToggle`, `cardTitle`).
//   descriptionCatalog  `{ file, key, locales }`: where a screen's description sentence lives. `file` is
//               the catalog path inside the screen's module (the directory above the `src` its blocks
//               file sits in) with `{locale}`, `key` the dotted path with `{entity}` in camel case. An
//               entry that shows a description must have the sentence in every locale.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { parseArgs } from "../lib/fs-util.mjs";
import { descriptionCatalogProblems, listViewProblems, manifestProblems, placeholderFrameProblems, placeholderRowProblems, readRoutePath } from "../lib/screen-design.mjs";

const args = parseArgs(process.argv.slice(2));
const root = resolve(args.root ?? process.cwd());
const configPath = join(root, "mockup.config.json");
if (!existsSync(configPath)) {
  console.error(`no mockup.config.json in ${root}`);
  process.exit(2);
}
const settings = JSON.parse(readFileSync(configPath, "utf8")).screenDesign;
if (!settings) {
  console.log('screen design: mockup.config.json has no "screenDesign" settings, nothing to do');
  process.exit(0);
}
if (typeof settings.manifest !== "string" || !Array.isArray(settings.routes) || settings.routes.length === 0) {
  console.error(`${configPath}: "screenDesign" needs manifest and routes`);
  process.exit(2);
}
const at = (path) => resolve(root, path);

const routed = [];
for (const { app, dir } of settings.routes) {
  for (const file of readdirSync(at(dir)).filter((name) => /\.tsx?$/.test(name) && !name.startsWith("__")).sort()) {
    const route = readRoutePath(readFileSync(join(at(dir), file), "utf8"));
    if (route !== undefined) routed.push({ app, route });
  }
}
const manifest = JSON.parse(readFileSync(at(settings.manifest), "utf8"));
const blocks = (path) => (existsSync(at(path)) ? readFileSync(at(path), "utf8") : undefined);
// The render a generated file was laid down as, kept by the generator under the nearest
// `.simplix/generated/` above it.
const base = (path) => {
  const file = at(path);
  for (let dir = dirname(file); dir !== dirname(dir); dir = dirname(dir)) {
    const kept = join(dir, ".simplix", "generated", relative(dir, file));
    if (existsSync(kept)) return readFileSync(kept, "utf8");
  }
  return undefined;
};
const problems = manifestProblems(manifest, routed, blocks, { primaryKey: settings.primaryKey }, base);
if (settings.descriptionCatalog) problems.push(...descriptionCatalogProblems(manifest, settings.descriptionCatalog, (path) => (existsSync(at(path)) ? JSON.parse(readFileSync(at(path), "utf8")) : undefined), blocks));
// The list decision (table or cards, the view switch, the card title) is compared with every file that
// draws the list: the screen's list widget and its board frame.
if (settings.listFiles) {
  const textOf = (path) => (existsSync(at(path)) ? readFileSync(at(path), "utf8") : undefined);
  const placeholders = placeholderRowProblems(manifest, settings.listFiles, textOf);
  problems.push(...listViewProblems(manifest, settings.listFiles, textOf), ...placeholders);
  // Every frame in the frame directory is read, not only those a routed screen's entry names, so a
  // frame with no entry (a holder tab's table) cannot keep the generated rows either.
  if (settings.frameDir) {
    const dir = at(settings.frameDir);
    const frames = existsSync(dir) ? readdirSync(dir).filter((name) => name.endsWith(".stories.tsx")).sort().map((name) => join(settings.frameDir, name)) : [];
    const unreported = frames.filter((path) => !placeholders.some((reported) => reported.includes(`: ${path} still draws`)));
    problems.push(...placeholderFrameProblems(unreported, textOf));
  }
}
if (problems.length > 0) {
  console.error(`screen design is not complete:\n${problems.map((problem) => `  ${problem}`).join("\n")}`);
  process.exit(1);
}
const acknowledged = (manifest.acknowledged ?? []).length;
console.log(`screen design: ${routed.length} routed screens designed, ${acknowledged} acknowledged as pending`);
