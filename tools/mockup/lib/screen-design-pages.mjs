// What a screen's own files draw, read as text: the description words of its catalog, the view its
// list declares, and the placeholder rows of a page or a frame. The checks behind
// commands/screen-design.mjs that compare those with the design entry.

/** How a list draws its rows: a table, a grid of cards, or not at all (a screen with no list). */
export const PRESENTATIONS = ["table", "cards", "none"];

/** The text with its comments removed, so a header comment naming a facet does not draw one. */
export function withoutComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
}

export const keyOf = (app, route) => `${app} ${route}`;

export const kebab = (pascal) => pascal.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/** The module a blocks file belongs to: the directory above the `src` it sits in. */
export function moduleRootOf(blocksPath) {
  const parts = blocksPath.split("/");
  const at = parts.lastIndexOf("src");
  return at < 0 ? undefined : parts.slice(0, at).join("/");
}

export const camel = (kebab) => kebab.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

/**
 * The entries that show a description whose sentence is missing from the module catalog in some
 * locale. The scaffold lays down no description key: a screen states its line by adding the entry,
 * and a page whose catalog lacks it draws no line at all, with every other check green.
 *
 * @param manifest the design manifest
 * @param catalog `{ file, key, locales }` from the root's `screenDesign.descriptionCatalog`
 * @param catalogOf path (relative to the mockup root) -> the catalog's parsed JSON, or undefined when
 *   the file does not exist
 * @param blocks path -> the blocks file's text; only a page that reads the key is judged
 */
export function descriptionCatalogProblems(manifest, catalog, catalogOf, blocks) {
  const problems = [];
  for (const entry of Array.isArray(manifest.screens) ? manifest.screens : []) {
    if (entry.description?.shown !== true || !entry.blocks || !entry.entity) continue;
    const root = moduleRootOf(entry.blocks);
    if (root === undefined) continue;
    const key = catalog.key.replace("{entity}", camel(entry.entity));
    // A page that states its description another way (a static page) is not read from this key.
    if (!blocks(entry.blocks)?.includes(key)) continue;
    for (const locale of catalog.locales) {
      const value = key.split(".").reduce((node, part) => node?.[part], catalogOf(`${root}/${catalog.file.replace("{locale}", locale)}`));
      if (typeof value !== "string" || value.trim() === "") {
        problems.push(`${entry.app}${entry.route}: the design shows a description and ${root}/${catalog.file.replace("{locale}", locale)} has no "${key}"`);
      }
    }
  }
  return problems;
}

export const code = (text) => withoutComments(text);

/**
 * The attributes of the first `<RecordList` element in a source text, by name, each as its raw
 * value: the string for `name="value"`, the expression text for `name={...}`, `true` for a bare
 * `name`. Braces and quotes inside a value are matched, so an arrow function's `>` does not end
 * the tag. Returns undefined when the text draws no RecordList.
 */
export function recordListAttributes(text) {
  const source = code(text);
  const start = source.search(/<RecordList\b/);
  if (start < 0) return undefined;
  const attributes = {};
  let at = start + "<RecordList".length;
  const skipSpace = () => {
    while (at < source.length && /\s/.test(source[at])) at++;
  };
  // A generic argument list (`<RecordList<Row>`) sits before the first attribute.
  if (source[at] === "<") {
    let depth = 0;
    do {
      if (source[at] === "<") depth++;
      if (source[at] === ">") depth--;
      at++;
    } while (at < source.length && depth > 0);
  }
  for (;;) {
    skipSpace();
    if (at >= source.length || source[at] === ">" || (source[at] === "/" && source[at + 1] === ">")) break;
    if (source[at] === "{") {
      // A spread: `{...props}` names no attribute.
      at = closingBrace(source, at) + 1;
      continue;
    }
    const nameMatch = /^[A-Za-z_][\w-]*/.exec(source.slice(at));
    if (!nameMatch) break;
    const name = nameMatch[0];
    at += name.length;
    skipSpace();
    if (source[at] !== "=") {
      attributes[name] = "true";
      continue;
    }
    at++;
    skipSpace();
    if (source[at] === '"' || source[at] === "'") {
      const quote = source[at];
      const end = source.indexOf(quote, at + 1);
      attributes[name] = source.slice(at + 1, end);
      at = end + 1;
    } else if (source[at] === "{") {
      const end = closingBrace(source, at);
      attributes[name] = source.slice(at + 1, end).trim();
      at = end + 1;
    } else {
      break;
    }
  }
  return attributes;
}

/** The index of the brace that closes the one at `open`, skipping strings and template literals. */
function closingBrace(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (c === '"' || c === "'" || c === "`") {
      i = text.indexOf(c, i + 1);
      if (i < 0) return text.length;
    } else if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return text.length;
}

/** What a list file declares about how its rows are drawn, read from its RecordList element. */
export function declaredListView(attributes) {
  const literal = (raw) => (raw === undefined ? undefined : raw.replace(/^["'`]|["'`]$/g, ""));
  return {
    presentation: literal(attributes.presentation) ?? "table",
    viewToggle: attributes.viewToggle !== undefined && attributes.viewToggle !== "false",
    cardTitle: literal(attributes.cardTitle),
  };
}

/** The list decision of an entry as the same three values, defaults filled in. */
export function decidedListView(list) {
  return { presentation: list.presentation, viewToggle: list.viewToggle === true, cardTitle: list.cardTitle };
}

/**
 * The entries whose list decision (presentation, view switch, card title) differs from what a file
 * that draws the list declares. A file that does not exist, or draws no RecordList, is left alone
 * for a table without a switch, which makes no claim a list file could break, and refused for a
 * decision that needs the file to carry it.
 *
 * @param manifest the design manifest
 * @param patterns paths of the files that draw a list, relative to the mockup root; `{entity}` is the
 *   entry's entity and `{module}` the directory above the `src` its blocks file sits in
 * @param textOf path -> the file's text, or undefined when it does not exist
 */
export function listViewProblems(manifest, patterns, textOf) {
  const problems = [];
  for (const entry of Array.isArray(manifest.screens) ? manifest.screens : []) {
    const list = entry.list;
    if (!list || !PRESENTATIONS.includes(list.presentation) || list.presentation === "none" || !entry.entity) continue;
    const decided = decidedListView(list);
    const claims = decided.presentation !== "table" || decided.viewToggle || decided.cardTitle !== undefined;
    const root = entry.blocks ? moduleRootOf(entry.blocks) : undefined;
    const name = keyOf(entry.app, entry.route);
    for (const pattern of patterns) {
      if (pattern.includes("{module}") && root === undefined) continue;
      const path = pattern.replace("{module}", root ?? "").replace("{entity}", entry.entity);
      const text = textOf(path);
      const attributes = text === undefined ? undefined : recordListAttributes(text);
      if (attributes === undefined) {
        if (claims) problems.push(`${name}: the design decides ${describeListView(decided)} and ${path} ${text === undefined ? "does not exist" : "draws no RecordList"}`);
        continue;
      }
      const declared = declaredListView(attributes);
      for (const field of ["presentation", "viewToggle", "cardTitle"]) {
        if (declared[field] !== decided[field]) {
          problems.push(`${name}: the design decides ${describeListView(decided)} and ${path} declares ${describeListView(declared)}`);
          break;
        }
      }
    }
  }
  return problems;
}

/**
 * The fields a file declares as `name: "<field>"` whose sample rows are still the generated
 * placeholder: a property holding its own name and a number (`roleName: "roleName 1"`). The frame
 * generated from a story template cannot know sample data, so it writes this for every text field;
 * a frame drawn as the design replaces them with rows that say something.
 *
 * @param text the frame's source
 * @returns the declared fields whose rows are placeholders, with how many cells hold one
 */
export function placeholderFields(text) {
  const source = withoutComments(text);
  const declared = new Set([...source.matchAll(/\bname:\s*"([A-Za-z][A-Za-z0-9]*)"/g)].map((match) => match[1]));
  const counts = new Map();
  for (const match of source.matchAll(/\b([A-Za-z][A-Za-z0-9]*):\s*"\1 \d+"/g)) {
    if (declared.has(match[1])) counts.set(match[1], (counts.get(match[1]) ?? 0) + 1);
  }
  return [...counts].map(([field, cells]) => ({ field, cells }));
}

/**
 * The entries whose list file or frame still holds the generated placeholder rows (`roleName 1`).
 *
 * @param manifest the design manifest
 * @param patterns paths of the files that draw a list, as for {@link listViewProblems}
 * @param textOf path -> the file's text, or undefined when it does not exist
 */
export function placeholderRowProblems(manifest, patterns, textOf) {
  const problems = [];
  for (const entry of Array.isArray(manifest.screens) ? manifest.screens : []) {
    const list = entry.list;
    if (!list || list.presentation === "none" || !entry.entity) continue;
    const root = entry.blocks ? moduleRootOf(entry.blocks) : undefined;
    for (const pattern of patterns) {
      if (pattern.includes("{module}") && root === undefined) continue;
      const path = pattern.replace("{module}", root ?? "").replace("{entity}", entry.entity);
      const text = textOf(path);
      if (text === undefined) continue;
      const found = placeholderFields(text);
      if (found.length > 0) problems.push(`${keyOf(entry.app, entry.route)}: ${path} still draws the generated placeholder rows for ${found.map((one) => `${one.field} ("${one.field} 1", ${one.cells} cells)`).join(", ")}; draw sample rows that say something`);
    }
  }
  return problems;
}

/**
 * The frame files that still hold the generated placeholder rows, whether or not a routed screen's
 * entry names them: a holder tab's table or a dialog's list has a frame and no entry.
 *
 * @param paths the frame files to read, relative to the mockup root
 * @param textOf path -> the file's text, or undefined when it does not exist
 * @returns one problem per file
 */
export function placeholderFrameProblems(paths, textOf) {
  const problems = [];
  for (const path of paths) {
    const text = textOf(path);
    if (text === undefined) continue;
    const found = placeholderFields(text);
    if (found.length > 0) problems.push(`${path} still draws the generated placeholder rows for ${found.map((one) => `${one.field} ("${one.field} 1", ${one.cells} cells)`).join(", ")}; draw sample rows that say something`);
  }
  return problems;
}

/** A list decision in words: `cards with a view switch, titled by name`. */
function describeListView(view) {
  return `${view.presentation === "cards" ? "cards" : "a table"}${view.viewToggle ? " with a view switch" : ""}${view.cardTitle ? `, titled by ${view.cardTitle}` : ""}`;
}
