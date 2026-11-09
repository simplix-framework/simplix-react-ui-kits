/**
 * Which CLI command renders each template a kit ships.
 *
 * A template name decides its command: the CRUD screen's templates are rendered by `simplix scaffold`,
 * a route template and the menu entry beside it by the scaffold of a project that routes its lists,
 * and `<kind>[.<variant>][.stories]` by `simplix add-page`. A name no command renders is returned in
 * `unrendered`, so a template nobody can generate fails the harness instead of passing untested.
 */

/** The templates a CRUD scaffold renders: the page, its blocks, its widgets and their index, its board frame. */
export const SCAFFOLD_TEMPLATES = new Set(["crud-page", "crud-page.stories", "page.blocks", "list", "detail", "form", "feature-index"]);

/** The page kinds `simplix add-page` takes, as the CLI's `PAGE_KINDS` lists them. */
export const PAGE_KINDS = ["record-page", "dashboard-page", "static-page", "error-page", "auth-page", "app-shell"];

const PAGE = new RegExp(`^(${PAGE_KINDS.join("|")})(?:\\.([a-z][a-z0-9-]*))?$`);

/**
 * @param {Iterable<string>} names every template name in force for the kit
 * @returns {{
 *   scaffold: boolean,
 *   route: string | undefined,
 *   pages: { kind: string, variant: string | undefined, story: boolean }[],
 *   unrendered: string[],
 * }}
 */
export function planTemplates(names) {
  const all = new Set(names);
  const pages = new Map();
  const unrendered = [];
  let scaffold = false;
  let route;
  for (const name of [...all].sort()) {
    if (SCAFFOLD_TEMPLATES.has(name)) {
      scaffold = true;
      continue;
    }
    if (name.startsWith("route.")) {
      // A module group routes its lists through one route template, so the fixture renders one.
      if (route === undefined) route = name;
      else unrendered.push(name);
      continue;
    }
    if (name.startsWith("menu-entry.")) {
      // Rendered beside the route template of the same suffix, and by nothing else.
      if (!all.has(name.replace(/^menu-entry/, "route"))) unrendered.push(name);
      continue;
    }
    const story = name.endsWith(".stories");
    const match = PAGE.exec(story ? name.slice(0, -".stories".length) : name);
    if (!match) {
      unrendered.push(name);
      continue;
    }
    const key = match[0];
    // A board frame is drawn from the page it stands beside, so a frame with no page renders nothing.
    if (story && !all.has(key)) {
      unrendered.push(name);
      continue;
    }
    const page = pages.get(key) ?? { kind: match[1], variant: match[2], story: false };
    if (story) page.story = true;
    pages.set(key, page);
  }
  if (route && !scaffold) unrendered.push(route);
  return { scaffold: scaffold || route !== undefined, route, pages: [...pages.values()], unrendered };
}

/**
 * The templates of the kit itself that replace a base kit's, and the ones it ships that no base
 * has. Every replacement must be declared in the kit's `simplix.overrides` with its reason, and a
 * template only the kit has belongs in the base, so every kit of the family has it.
 *
 * @param {Set<string>} base the names the base kits ship
 * @param {Set<string>} own the names the kit ships itself
 * @param {Record<string, string>} declared the kit's `simplix.overrides`
 * @returns {string[]} one line per breach
 */
export function overrideBreaches(base, own, declared) {
  const breaches = [];
  if (base.size === 0) return breaches;
  for (const name of [...own].sort()) {
    if (!base.has(name)) breaches.push(`${name}.hbs is the kit's alone; add it to the base kit, so every kit of the family has it`);
    else if (!(name in declared)) breaches.push(`${name}.hbs replaces the base kit's without a reason in simplix.overrides`);
    else if (typeof declared[name] !== "string" || declared[name].trim() === "") breaches.push(`simplix.overrides.${name} gives no reason`);
  }
  for (const name of Object.keys(declared).sort()) {
    if (!own.has(name)) breaches.push(`simplix.overrides names ${name}, and the kit ships no ${name}.hbs`);
  }
  return breaches;
}
