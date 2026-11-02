#!/usr/bin/env node
// Writes a mockup's console menu from the product's own menu, so a menu entry added to the product
// reaches the mockup without a second hand edit. The product's menu constant (groups, entries,
// marks, keys) is read as syntax, never executed; each entry is then given the mockup screen it
// opens:
//
//   entry href -> the route that declares it -> the entity of that route's CrudPage
//   -> the frame the scaffold wrote for that entity (`templates.story.files` of the scaffold config
//   names a frame that predates its scaffold) -> the frame's story id.
//
// An entry with no route falls back to the frame named after its catalogue key. An entry whose
// frame does not exist is drawn inactive, as the product draws a destination that is not built.
//
// The menu words are not written here: the mockup reads them from the product's own catalogue, under
// the keys the entries carry. With --check nothing is written, and the run fails when
//   - the generated file differs from what the product's menu gives,
//   - an entry that has a product route has no frame,
//   - an entry or group has no words in a locale, or the catalogue holds menu words no entry uses,
//   - an entry's words differ from the plural label of its entity in a locale, unless the root
//     lists the entry under `menu.labelExceptions` with the reason.
// The agreement with the screen design holds in both modes (it is not something a write can fix):
// an entry that opens an entity list has a design entry whose `menu: { group, icon }` names the
// group the menu puts it in and the icon it draws.
//   console-menu [--root <mockup root>] [--check]
//
// Everything specific to a product is the root's `mockup.config.json`, key `menu`, with paths
// relative to the root. A root without the key is left alone.
//   source           the module holding the menu constant
//   routes           the directory of the product's route files
//   scaffoldConfig   the scaffold config (`simplix.config.ts`), read for `templates.story.files`
//   catalog          the product's shell catalogue, `locales/<catalog>/<locale>.json`, whose
//                    `shell.menu` and `shell.groups` hold the words
//   storyIdPrefix    what a frame's story id starts with, before its screen name
//   output           the file to write
//   designApp        the app (as the design manifest names it) whose screens this menu opens; the
//                    screens are read from `screenDesign.manifest`. Absent, an entry matches by route
//   labelExceptions  entry key -> why its words differ from its entity's, on purpose
//   menuConstant     the menu constant's name (default ADMIN_MENU)
//   accountConstant  the account entry constant's name (default ACCOUNT_ENTRY)
//   iconModule       where the marks are imported from (default lucide-react)
//   iconType         the type of one mark (default LucideIcon)
//   entityCatalog    where an entity's words live under locales/, `{entity}` in camel case
//                    (default entity/{entity})
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "../lib/fs-util.mjs";
import {
  camel,
  menuDecisionProblems,
  readClaimedFrames,
  readMenu,
  readRoutes,
  renderMenu,
  resolveMenu,
  wordProblems,
} from "../lib/console-menu.mjs";

const args = parseArgs(process.argv.slice(2));
const root = resolve(args.root ?? process.cwd());
const check = args.check === true;
const configPath = join(root, "mockup.config.json");
if (!existsSync(configPath)) {
  console.error(`no mockup.config.json in ${root}`);
  process.exit(2);
}
const config = readJson(configPath);
const settings = config.menu;
if (!settings) {
  console.log('console menu: mockup.config.json has no "menu" settings, nothing to do');
  process.exit(0);
}
const missing = ["source", "routes", "scaffoldConfig", "catalog", "storyIdPrefix", "output"].filter(
  (key) => typeof settings[key] !== "string" || settings[key] === "",
);
if (missing.length > 0) {
  console.error(`${configPath}: "menu" lacks ${missing.join(", ")}`);
  process.exit(2);
}
const at = (path) => resolve(root, path);

const menu = readMenu(readFileSync(at(settings.source), "utf8"), settings.source, {
  menu: settings.menuConstant ?? "ADMIN_MENU",
  account: settings.accountConstant ?? "ACCOUNT_ENTRY",
});
const routeDir = at(settings.routes);
const routes = readRoutes(
  readdirSync(routeDir)
    .filter((file) => /\.tsx?$/.test(file))
    .sort()
    .map((file) => readFileSync(join(routeDir, file), "utf8")),
);
const claimed = readClaimedFrames(readFileSync(at(settings.scaffoldConfig), "utf8"), settings.scaffoldConfig);
const screens = join(root, "screens");
const frame = (file) => (existsSync(join(screens, file)) ? readFileSync(join(screens, file), "utf8") : undefined);
const resolved = resolveMenu(menu, { routes, claimed, frame, prefix: settings.storyIdPrefix });
const entryCount = resolved.groups.flatMap((group) => group.entries).length;

// The menu's placement is a decision of the screen's design entry; it is checked in either mode.
const designProblems = [];
if (config.screenDesign?.manifest) {
  const manifest = readJson(at(config.screenDesign.manifest));
  designProblems.push(...menuDecisionProblems(resolved, manifest.screens ?? [], { app: settings.designApp }));
}

const output = at(settings.output);
const text = renderMenu(resolved, { iconModule: settings.iconModule, iconType: settings.iconType });
const current = existsSync(output) ? readFileSync(output, "utf8") : undefined;
if (!check) {
  if (current !== text) writeFileSync(output, text);
  const open = resolved.groups.flatMap((group) => group.entries).filter((entry) => entry.screen !== undefined).length;
  console.log(`console menu: ${entryCount} entries, ${open} open a screen, ${current === text ? "unchanged" : "written"}`);
  if (designProblems.length > 0) {
    console.error(`console menu does not follow the screen design:\n${designProblems.map((problem) => `  ${problem}`).join("\n")}`);
    process.exit(1);
  }
  process.exit(0);
}

const problems = [...designProblems];
if (current !== text) problems.push(`${settings.output} differs from the product's menu (run console-menu without --check)`);
for (const key of resolved.unframed) {
  problems.push(`entry "${key}" has a product route and no frame (scaffold one, or claim an existing frame under templates.story.files)`);
}
const catalogueOf = (locale) => {
  const shell = readJson(join(root, "locales", settings.catalog, `${locale}.json`)).shell ?? {};
  return { menu: shell.menu ?? {}, groups: shell.groups ?? {} };
};
const entityCatalog = settings.entityCatalog ?? "entity/{entity}";
const pluralOf = (entity, locale) => {
  const file = join(root, "locales", entityCatalog.replace("{entity}", camel(entity)), `${locale}.json`);
  return existsSync(file) ? readJson(file)._plural || undefined : undefined;
};
problems.push(
  ...wordProblems(resolved, {
    locales: config.locales,
    words: catalogueOf,
    plural: pluralOf,
    exceptions: settings.labelExceptions ?? {},
  }),
);
if (problems.length > 0) {
  console.error(`console menu is not in agreement with the product:\n${problems.map((problem) => `  ${problem}`).join("\n")}`);
  process.exit(1);
}
console.log(`console menu: ${entryCount} entries checked`);

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}
