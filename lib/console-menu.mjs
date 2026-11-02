// The readers, the resolver, the renderer and the checks behind checks/console-menu.mjs. Every
// function takes the text or the lookup it needs and touches no file, so each is proved on its own
// hit and miss cases in console-menu.test.mjs.
import ts from "typescript";

const LINE_WIDTH = 100;

// ---------------------------------------------------------------------------------------------
// Readers

/** Parses TypeScript source into a syntax tree, without type information. */
function parse(text, name) {
  return ts.createSourceFile(name, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

/** A readable `file:line` for a node, for the error naming what could not be read. */
function where(node, name) {
  const { line } = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart());
  return `${name}:${line + 1}`;
}

/** The expression under any `as` / `satisfies` / parentheses wrapper. */
function unwrap(node) {
  let current = node;
  while (
    current &&
    (ts.isAsExpression(current) ||
      ts.isSatisfiesExpression(current) ||
      ts.isParenthesizedExpression(current))
  ) {
    current = current.expression;
  }
  return current;
}

/** The name an object property is written under, or undefined for a computed one. */
function propertyName(property) {
  const name = property.name;
  return name && (ts.isIdentifier(name) || ts.isStringLiteral(name)) ? name.text : undefined;
}

/** The properties of an object literal by name; throws on a spread or a computed name. */
function propertiesOf(node, name) {
  const object = unwrap(node);
  if (!object || !ts.isObjectLiteralExpression(object)) {
    throw new Error(`${where(node, name)}: expected an object literal`);
  }
  const found = new Map();
  for (const property of object.properties) {
    const key = ts.isPropertyAssignment(property) ? propertyName(property) : undefined;
    if (key === undefined) {
      throw new Error(`${where(property, name)}: only plain \`name: value\` properties are read`);
    }
    found.set(key, property.initializer);
  }
  return found;
}

/** A string literal property, or undefined when absent; throws when it is not a literal. */
function stringProperty(properties, key, node, name) {
  const value = properties.get(key);
  if (value === undefined) return undefined;
  const literal = unwrap(value);
  if (!ts.isStringLiteralLike(literal)) {
    throw new Error(`${where(value, name)}: \`${key}\` must be a string literal`);
  }
  return literal.text;
}

/** An identifier property (an icon), or undefined when absent. */
function identifierProperty(properties, key, name) {
  const value = properties.get(key);
  if (value === undefined) return undefined;
  const identifier = unwrap(value);
  if (!ts.isIdentifier(identifier)) {
    throw new Error(`${where(value, name)}: \`${key}\` must be an identifier`);
  }
  return identifier.text;
}

/** The initializer of a top-level `const <variable>`. */
function constInitializer(source, variable, name) {
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === variable &&
        declaration.initializer
      ) {
        return declaration.initializer;
      }
    }
  }
  throw new Error(`${name}: no \`const ${variable}\``);
}

/**
 * The app's menu: its groups with their entries, and the account entry drawn after them.
 *
 * @param {string} text the menu module's source
 * @param {string} name the file name, for messages
 * @param {{ menu: string, account: string }} variables the names of the two constants
 */
export function readMenu(text, name, variables = { menu: "ADMIN_MENU", account: "ACCOUNT_ENTRY" }) {
  const source = parse(text, name);
  const list = unwrap(constInitializer(source, variables.menu, name));
  if (!ts.isArrayLiteralExpression(list)) {
    throw new Error(`${where(list, name)}: \`${variables.menu}\` must be an array literal`);
  }
  const groups = list.elements.map((groupNode) => {
    const group = propertiesOf(groupNode, name);
    const entries = unwrap(group.get("entries") ?? groupNode);
    if (!ts.isArrayLiteralExpression(entries)) {
      throw new Error(`${where(groupNode, name)}: a group needs an \`entries\` array literal`);
    }
    return {
      key:
        stringProperty(group, "key", groupNode, name) ??
        fail(groupNode, name, "a group needs a `key`"),
      icon:
        identifierProperty(group, "icon", name) ?? fail(groupNode, name, "a group needs an `icon`"),
      entries: entries.elements.map((entryNode) => {
        const entry = propertiesOf(entryNode, name);
        return {
          key:
            stringProperty(entry, "key", entryNode, name) ??
            fail(entryNode, name, "an entry needs a `key`"),
          icon:
            identifierProperty(entry, "icon", name) ??
            fail(entryNode, name, "an entry needs an `icon`"),
          href: stringProperty(entry, "href", entryNode, name),
        };
      }),
    };
  });
  const account = propertiesOf(constInitializer(source, variables.account, name), name);
  return {
    groups,
    account: {
      key:
        stringProperty(account, "key", undefined, name) ??
        fail(list, name, "the account entry needs a `key`"),
      icon:
        identifierProperty(account, "icon", name) ??
        fail(list, name, "the account entry needs an `icon`"),
    },
  };
}

function fail(node, name, message) {
  throw new Error(`${where(node, name)}: ${message}`);
}

/** `BackgroundJob` -> `background-job`. */
export function kebab(pascal) {
  return pascal.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/** `background-job` -> `backgroundJob`. */
export function camel(kebabName) {
  return kebabName.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

/**
 * The entity each route's page lists, by route path: a route file declares its path in
 * `createFileRoute("<path>")` and its page as the `<Entity>CrudPage` it imports.
 *
 * @param {readonly string[]} texts the route files' sources
 * @returns {Map<string, string>} route path -> entity in kebab case
 */
export function readRoutes(texts) {
  const routes = new Map();
  for (const text of texts) {
    const path = /createFileRoute\(\s*"([^"]+)"\s*,?\s*\)/.exec(text)?.[1];
    const page = /import\s*\{\s*(\w+)CrudPage\s*\}/.exec(text)?.[1];
    if (path !== undefined && page !== undefined) routes.set(path, kebab(page));
  }
  return routes;
}

/**
 * The frame files the scaffold config points an entity at (`templates.story.files`), for a board
 * frame that predates its entity's scaffold.
 */
export function readClaimedFrames(text, name) {
  const source = parse(text, name);
  const root = unwrap(findProperty(source, ["templates", "story", "files"]));
  if (!root) return {};
  const files = {};
  for (const [entity, value] of propertiesOf(root, name)) {
    const literal = unwrap(value);
    if (ts.isStringLiteralLike(literal)) files[entity] = literal.text;
  }
  return files;
}

/** Finds the value at `a: { b: { c: <value> } }` in any object literal of the file. */
function findProperty(source, path) {
  const resolvePath = (object) => {
    let current = object;
    for (const key of path) {
      const literal = unwrap(current);
      if (!literal || !ts.isObjectLiteralExpression(literal)) return undefined;
      const property = literal.properties.find(
        (p) => ts.isPropertyAssignment(p) && propertyName(p) === key,
      );
      if (!property) return undefined;
      current = property.initializer;
    }
    return current;
  };
  let found;
  const visit = (node) => {
    if (found) return;
    if (ts.isObjectLiteralExpression(node)) {
      const value = resolvePath(node);
      if (value) {
        found = value;
        return;
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

/**
 * The frame's story id with the board's prefix removed, or undefined when the frame names none.
 * Only an `id` that starts with the prefix counts, so a fixture row's own `id` field is not read.
 */
export function frameScreen(frameText, prefix) {
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^\\s*id:\\s*"${escaped}([^"]+)"`, "m").exec(frameText)?.[1];
}

// ---------------------------------------------------------------------------------------------
// The board menu

/**
 * Gives each entry the board screen it opens.
 *
 * @param {ReturnType<typeof readMenu>} menu the app's menu
 * @param {object} inputs
 * @param {ReadonlyMap<string, string>} inputs.routes route path -> entity
 * @param {Readonly<Record<string, string>>} inputs.claimed entity -> frame file name
 * @param {(file: string) => string | undefined} inputs.frame the frame file's source, or undefined
 * @param {string} inputs.prefix the board's story id prefix
 * @returns {{ groups: Array, account: object, unframed: string[] }} the board menu, and the keys of
 * entries that have an app route and no board frame
 */
export function resolveMenu(menu, { routes, claimed, frame, prefix }) {
  const unframed = [];
  const groups = menu.groups.map((group) => ({
    ...group,
    entries: group.entries.map((entry) => {
      const entity = entry.href === undefined ? undefined : routes.get(entry.href);
      const candidate = entity ?? kebab(entry.key.replace(/^./, (c) => c.toUpperCase()));
      const file = claimed[candidate] ?? `${candidate}.stories.tsx`;
      const text = frame(file);
      const screen = text === undefined ? undefined : frameScreen(text, prefix);
      if (entity !== undefined && screen === undefined) unframed.push(entry.key);
      return { key: entry.key, icon: entry.icon, href: entry.href, entity, screen };
    }),
  }));
  return { groups, account: menu.account, unframed };
}

/**
 * The generated module's source, in the layout the board's formatter keeps.
 *
 * @param {ReturnType<typeof resolveMenu>} menu the board menu
 * @param {{ iconModule?: string, iconType?: string }} options the module the icons are imported from
 * and the type its icon components share
 */
export function renderMenu(menu, { iconModule = "lucide-react", iconType = "LucideIcon" } = {}) {
  const icons = new Set([menu.account.icon]);
  for (const group of menu.groups) {
    icons.add(group.icon);
    for (const entry of group.entries) icons.add(entry.icon);
  }
  const lines = [
    "// Generated by the mockup kit's checks/console-menu.mjs from the app's menu. Do not edit: run it again.",
    `import type { ${iconType} } from ${JSON.stringify(iconModule)};`,
    "import {",
    ...[...icons].sort().map((icon) => `  ${icon},`),
    `} from ${JSON.stringify(iconModule)};`,
    "",
    "/** One destination of the board's console menu. */",
    "export interface BoardMenuEntry {",
    "  /** The catalogue key under `shell.menu`. */",
    "  readonly key: string;",
    `  readonly icon: ${iconType};`,
    "  /** The board screen the entry opens (story id `<prefix><screen>`); absent where none is drawn. */",
    "  readonly screen?: string;",
    "}",
    "",
    "/** One group of the board's console menu. */",
    "export interface BoardMenuGroup {",
    "  /** The catalogue key under `shell.groups`. */",
    "  readonly group: string;",
    `  readonly icon: ${iconType};`,
    "  readonly entries: readonly BoardMenuEntry[];",
    "}",
    "",
    "/** The back office menu as the app groups it. */",
    "export const MENU: readonly BoardMenuGroup[] = [",
  ];
  for (const group of menu.groups) {
    lines.push("  {", `    group: ${JSON.stringify(group.key)},`, `    icon: ${group.icon},`);
    const entries = group.entries.map((entry) => entryLiteral(entry));
    const oneLine = `    entries: [${entries.join(", ")}],`;
    if (entries.length === 1 && oneLine.length <= LINE_WIDTH) {
      lines.push(oneLine);
    } else {
      lines.push("    entries: [", ...entries.map((entry) => `      ${entry},`), "    ],");
    }
    lines.push("  },");
  }
  lines.push(
    "];",
    "",
    "/** The account's own page, which the app draws after the groups. */",
    `export const ACCOUNT_ENTRY = { key: ${JSON.stringify(menu.account.key)}, icon: ${menu.account.icon} } as const;`,
    "",
  );
  return lines.join("\n");
}

function entryLiteral(entry) {
  const screen = entry.screen === undefined ? "" : `, screen: ${JSON.stringify(entry.screen)}`;
  return `{ key: ${JSON.stringify(entry.key)}, icon: ${entry.icon}${screen} }`;
}

// ---------------------------------------------------------------------------------------------
// Checks

/**
 * What is wrong with the menu's words.
 *
 * @param {ReturnType<typeof resolveMenu>} menu the board menu
 * @param {object} inputs
 * @param {readonly string[]} inputs.locales the locales to compare
 * @param {(locale: string) => { menu: Record<string, string>, groups: Record<string, string> }} inputs.words the catalogue
 * @param {(entity: string, locale: string) => string | undefined} inputs.plural the entity's plural label
 * @param {Readonly<Record<string, string>>} inputs.exceptions entry key -> reason its words differ
 * @returns {string[]} one message per problem
 */
export function wordProblems(menu, { locales, words, plural, exceptions }) {
  const problems = [];
  const entries = [...menu.groups.flatMap((group) => group.entries), { key: menu.account.key }];
  for (const locale of locales) {
    const catalogue = words(locale);
    for (const group of menu.groups) {
      if (!catalogue.groups[group.key])
        problems.push(`${locale}: group "${group.key}" has no words`);
    }
    for (const entry of entries) {
      if (!catalogue.menu[entry.key]) problems.push(`${locale}: entry "${entry.key}" has no words`);
    }
    const used = new Set(entries.map((entry) => entry.key));
    for (const key of Object.keys(catalogue.menu)) {
      if (!used.has(key)) problems.push(`${locale}: menu words "${key}" belong to no entry`);
    }
  }
  const differs = new Set();
  for (const group of menu.groups) {
    for (const entry of group.entries) {
      if (entry.entity === undefined) continue;
      for (const locale of locales) {
        const label = words(locale).menu[entry.key];
        const entityLabel = plural(entry.entity, locale);
        if (entityLabel === undefined) {
          problems.push(
            `${locale}: entity "${entry.entity}" of entry "${entry.key}" has no plural label`,
          );
        } else if (label !== undefined && label !== entityLabel) {
          differs.add(entry.key);
          if (!(entry.key in exceptions)) {
            problems.push(
              `${locale}: entry "${entry.key}" says "${label}" but its entity says "${entityLabel}"; ` +
                `name one object once, or list the entry under menu.labelExceptions with the reason`,
            );
          }
        }
      }
    }
  }
  const built = new Set(
    menu.groups.flatMap((group) =>
      group.entries.filter((e) => e.entity !== undefined).map((e) => e.key),
    ),
  );
  for (const [key, reason] of Object.entries(exceptions)) {
    if (typeof reason !== "string" || reason.trim() === "") {
      problems.push(`menu.labelExceptions "${key}" states no reason`);
    } else if (!built.has(key)) {
      problems.push(`menu.labelExceptions "${key}" names no entry that opens an entity list`);
    } else if (!differs.has(key)) {
      problems.push(`menu.labelExceptions "${key}" is stale: its words now equal the entity's`);
    }
  }
  return problems;
}

/**
 * What is wrong with the agreement between the menu and the screens' design entries. Placement is a
 * design decision (`menu: { group, icon }` in the screen's entry), so every entry that opens an
 * entity list has the decision, and the product's menu keeps it.
 *
 * @param {ReturnType<typeof resolveMenu>} menu the board menu
 * @param {readonly object[]} screens the design manifest's entries
 * @param {{ app?: string }} options the app the menu belongs to; absent, an entry matches by route alone
 * @returns {string[]} one message per problem
 */
export function menuDecisionProblems(menu, screens, { app } = {}) {
  const problems = [];
  for (const group of menu.groups) {
    for (const entry of group.entries) {
      if (entry.entity === undefined || entry.href === undefined) continue;
      const design = screens.find((one) => one.route === entry.href && (app === undefined || one.app === app));
      if (design === undefined) continue;
      const name = `${design.app} ${design.route}`;
      if (design.menu === undefined) {
        problems.push(`${name}: the design entry has no menu decision (menu: { group, icon }); the menu puts it in "${group.key}" with ${entry.icon}`);
        continue;
      }
      if (design.menu.group !== group.key) {
        problems.push(`${name}: the design puts it in the menu group "${design.menu.group}" but the menu puts it in "${group.key}"`);
      }
      if (design.menu.icon !== entry.icon) {
        problems.push(`${name}: the design names the menu icon ${design.menu.icon} but the menu draws ${entry.icon}`);
      }
    }
  }
  return problems;
}
