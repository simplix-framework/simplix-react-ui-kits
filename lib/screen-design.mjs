// The readers and checks behind checks/screen-design.mjs. Every function takes the text or the
// lookup it needs and touches no file, so each is proved on its own hit and miss cases in
// screen-design.test.mjs.

const FACETS = ["description", "cards", "notices"];

/** How a list draws its rows: a table, a grid of cards, or not at all (a screen with no list). */
const PRESENTATIONS = ["table", "cards", "none"];

// The words a page states a facet with, in the code it draws: `description,` in the page's spec,
// `tiles:` for figures, `notices` for the notice cards.
const FACET_WORDS = { description: /\bdescription\b/, cards: /\btiles\b/, notices: /\bnotices\b/ };

/** The text with its comments removed, so a header comment naming a facet does not draw one. */
export function withoutComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
}

/**
 * True when a page laid down whole from its template draws the facet itself: the template writes
 * the description its catalog states and, where the entity's Meta counts, the figure row and the
 * time range. A facet it does not draw (the notices) takes the screen's own code.
 */
export function pageDrawsFacet(text, facet) {
  return FACET_WORDS[facet].test(withoutComments(text));
}

/** The path a TanStack file route declares, or undefined for a file that declares none. */
export function readRoutePath(text) {
  const match = /createFileRoute\(\s*(["'`])([^"'`]+)\1\s*\)/.exec(text);
  return match ? match[2] : undefined;
}

/**
 * True when a blocks file states nothing: it has at least one `return` and every `return` hands
 * back an empty object literal, which is what a generated blocks stub does.
 */
export function blocksAreEmpty(text) {
  const returns = text.match(/\breturn\b/g) ?? [];
  const empty = text.match(/\breturn\s*\(?\s*\{\s*\}\s*\)?\s*;?/g) ?? [];
  return returns.length > 0 && returns.length === empty.length;
}

/** The primary key a pattern such as `{entity}Id` names for a kebab-case entity. */
export function primaryKeyOf(entity, pattern) {
  const camel = entity.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
  return pattern.replace("{entity}", camel);
}

const keyOf = (app, route) => `${app} ${route}`;
const hasText = (value) => typeof value === "string" && value.trim() !== "";
const hasReason = (decision) => typeof decision?.reason === "string" && decision.reason.trim() !== "";

/**
 * What is wrong with the detail's sections. A section is prose (a string), or an object carrying
 * the title the detail draws for it as data, `{ title, fields?, reason? }`, which a check can set
 * against the screen and its board frame without a browser.
 */
function sectionProblems(name, sections) {
  const problems = [];
  const seen = new Set();
  sections.forEach((section, index) => {
    if (typeof section === "string") return;
    const at = `${name}: detail section ${index + 1}`;
    if (section === null || typeof section !== "object" || Array.isArray(section)) {
      problems.push(`${at} is neither a sentence nor { title, fields }`);
      return;
    }
    if (typeof section.title !== "string" || section.title.trim() === "") {
      problems.push(`${at} has no title`);
    } else if (seen.has(section.title)) {
      problems.push(`${at} repeats the title "${section.title}"`);
    } else {
      seen.add(section.title);
    }
    if (section.fields !== undefined && !(Array.isArray(section.fields) && section.fields.every((field) => typeof field === "string" && field !== ""))) {
      problems.push(`${at} fields are not a list of labels`);
    }
    if (section.reason !== undefined && !hasReason(section)) problems.push(`${at} reason is empty`);
  });
  return problems;
}

/**
 * The titles an entry states for its detail's sections, in reading order: the `title` of each
 * section declared as an object. A section declared as prose states none.
 */
export function detailSectionTitles(entry) {
  const sections = Array.isArray(entry.detail?.sections) ? entry.detail.sections : [];
  return sections.filter((section) => section !== null && typeof section === "object" && typeof section.title === "string").map((section) => section.title);
}

/** What is wrong with one decided entry's decisions, as sentences naming the entry. */
export function entryProblems(entry, { primaryKey = "{entity}Id" } = {}) {
  const name = keyOf(entry.app, entry.route);
  const problems = [];
  if (entry.decided === false) return [`${name}: undecided ("decided": false); design it before it is made`];
  for (const field of ["persona", "question"]) {
    if (typeof entry[field] !== "string" || entry[field].trim() === "") problems.push(`${name}: no ${field}`);
  }
  for (const facet of FACETS) {
    const decision = entry[facet];
    if (!decision || typeof decision.shown !== "boolean") {
      problems.push(`${name}: ${facet} is not decided (shown true or false)`);
      continue;
    }
    if (!hasReason(decision)) problems.push(`${name}: ${facet} ${decision.shown ? "shown" : "none"} has no reason`);
    if (decision.shown && facet !== "description" && !(Array.isArray(decision.items) && decision.items.length > 0)) {
      problems.push(`${name}: ${facet} shown with no items`);
    }
  }
  const list = entry.list;
  if (!list || typeof list.presentation !== "string") {
    problems.push(`${name}: list presentation is not decided`);
  } else if (!PRESENTATIONS.includes(list.presentation)) {
    problems.push(`${name}: list presentation "${list.presentation}" is not one of ${PRESENTATIONS.join(", ")}`);
  } else if (list.presentation === "none") {
    if (!hasReason(list)) problems.push(`${name}: list none has no reason`);
    for (const field of ["viewToggle", "cardTitle", "toggleReason"]) if (list[field] !== undefined) problems.push(`${name}: list none has no ${field}`);
  } else {
    if (list.viewToggle !== undefined && typeof list.viewToggle !== "boolean") problems.push(`${name}: list viewToggle is not true or false`);
    // One standard for every list: cards always offer the switch to the table, and a table offers the
    // switch to cards only with the reason its rows are also read as units.
    if (list.presentation === "cards" && list.viewToggle !== true) problems.push(`${name}: a cards list offers the switch to the table (viewToggle true)`);
    if (list.presentation === "table" && list.viewToggle === true && !hasText(list.toggleReason)) problems.push(`${name}: a table list that offers the switch to cards has no toggleReason`);
    if (list.toggleReason !== undefined && !hasText(list.toggleReason)) problems.push(`${name}: list toggleReason is empty`);
    if (list.toggleReason !== undefined && !(list.presentation === "table" && list.viewToggle === true)) problems.push(`${name}: list toggleReason belongs to a table list that offers the switch`);
    if (list.cardTitle !== undefined && (typeof list.cardTitle !== "string" || list.cardTitle === "")) problems.push(`${name}: list cardTitle is not the key of a column`);
    if (typeof list.leading !== "string" || list.leading === "") problems.push(`${name}: list has no leading column`);
    const field = list.sort?.field;
    if (typeof field !== "string" || field === "") {
      problems.push(`${name}: list has no default sort`);
    } else if (entry.entity && field === primaryKeyOf(entry.entity, primaryKey)) {
      problems.push(`${name}: list sorts by its primary key ${field}, which orders nothing a reader knows`);
    }
    if (!Array.isArray(list.filters)) problems.push(`${name}: list filters are not decided`);
  }
  // The reasons are optional: an entry that states one has it read, an entry that states none is left alone.
  if (list && list.presentation !== "none" && list.reason !== undefined && !hasReason(list)) problems.push(`${name}: list reason is empty`);
  if (entry.detail?.reason !== undefined && !hasReason(entry.detail)) problems.push(`${name}: detail reason is empty`);
  if (!Array.isArray(entry.detail?.sections)) {
    problems.push(`${name}: detail sections are not decided`);
  } else {
    problems.push(...sectionProblems(name, entry.detail.sections));
  }
  if (entry.menu !== undefined) {
    for (const field of ["group", "icon"]) {
      if (typeof entry.menu?.[field] !== "string" || entry.menu[field].trim() === "") {
        problems.push(`${name}: menu has no ${field}`);
      }
    }
  }
  if (entry.body !== undefined) problems.push(...bodyProblems(name, entry.body));
  if (entry.search !== undefined) {
    if (entry.search === null || typeof entry.search !== "object" || typeof entry.search.shown !== "boolean") problems.push(`${name}: search is not decided (shown true or false)`);
    else if (!hasReason(entry.search)) problems.push(`${name}: search ${entry.search.shown ? "shown" : "none"} has no reason`);
  }
  return problems;
}

const kebab = (pascal) => pascal.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/**
 * What a SimpliX Meta document says each entity's list search offers: the fields its keyword
 * search matches (empty when it takes none) and its default sort, by kebab-case entity name. An
 * entity takes a keyword when the search DTO of one of its operations marks a field `keyword`.
 *
 * @param meta the parsed Meta document (`{ entities, operations, types }`)
 * @returns Map kebab entity -> `{ keyword: string[], sort }`
 */
export function entitySearchOffers(meta) {
  const offers = new Map();
  const types = meta?.types ?? {};
  for (const [name, entity] of Object.entries(meta?.entities ?? {})) offers.set(kebab(name), { keyword: [], sort: entity?.defaultSort });
  for (const operation of Object.values(meta?.operations ?? {})) {
    const dto = operation?.request?.searchDto;
    if (!operation?.entity || !dto) continue;
    const offer = offers.get(kebab(operation.entity));
    if (!offer) continue;
    for (const field of types[dto]?.fields ?? []) {
      if (field?.searchable?.keyword === true && !offer.keyword.includes(field.name)) offer.keyword.push(field.name);
    }
  }
  return offers;
}

/**
 * What is wrong between the routed list screens and the console search's sources: a list whose
 * entity offers keyword search is a source of the search, or its entry decides `search.shown`
 * false with the reason. A source names a list that takes a keyword (a list that takes none
 * ignores the text and answers every row), sits at its entry's route, and sorts as Meta's default.
 *
 * @param manifest the design manifest
 * @param offers what {@link entitySearchOffers} read from Meta
 * @param sources the search's sources, `[{ entity, route, sort }]`
 * @param settings `{ app, sourcesPath }`: the app the search belongs to and where its sources live, for the messages
 */
export function searchProblems(manifest, offers, sources, { app, sourcesPath }) {
  const problems = [];
  const entries = (Array.isArray(manifest.screens) ? manifest.screens : []).filter((entry) => entry.app === app && entry.entity && entry.list && entry.list.presentation !== "none");
  const byEntity = new Map();
  for (const source of Array.isArray(sources) ? sources : []) {
    if (byEntity.has(source.entity)) problems.push(`${sourcesPath}: ${source.entity} is a source twice`);
    byEntity.set(source.entity, source);
  }
  for (const entry of entries) {
    const name = keyOf(entry.app, entry.route);
    const keyword = offers.get(entry.entity)?.keyword ?? [];
    const source = byEntity.get(entry.entity);
    if (entry.search?.shown === false) {
      if (source) problems.push(`${name}: the design leaves the list out of the console search and ${sourcesPath} lists ${entry.entity}`);
      continue;
    }
    if (keyword.length > 0 && !source) {
      problems.push(`${name}: ${entry.entity} offers keyword search (${keyword.join(", ")}) and is not a source of the console search; add { "entity": "${entry.entity}", "route": "${entry.route}", "sort": ${JSON.stringify(offers.get(entry.entity)?.sort ?? {})} } to ${sourcesPath}, or decide "search": { "shown": false, "reason": "..." } in its entry`);
    }
    if (entry.search?.shown === true && !source) problems.push(`${name}: the design shows the list in the console search and ${sourcesPath} does not list ${entry.entity}`);
  }
  for (const [entity, source] of byEntity) {
    const at = `${sourcesPath}: ${entity}`;
    const offer = offers.get(entity);
    if (!offer) {
      problems.push(`${at} is no entity of the Meta document`);
      continue;
    }
    if (offer.keyword.length === 0) problems.push(`${at} offers no keyword search, so its list would answer every row to any text; ask the backend for keyword fields or remove the source`);
    const listed = entries.filter((entry) => entry.entity === entity);
    if (listed.length === 0) problems.push(`${at} has no routed list screen in ${app}`);
    else if (!listed.some((entry) => entry.route === source.route)) problems.push(`${at} sits at ${source.route} and its list screen is at ${listed.map((entry) => entry.route).join(", ")}`);
    const sort = offer.sort;
    if (sort && (source.sort?.field !== sort.field || source.sort?.direction !== sort.direction)) problems.push(`${at} sorts by ${source.sort?.field} ${source.sort?.direction} and Meta's default sort is ${sort.field} ${sort.direction}`);
  }
  return problems;
}

/**
 * What is wrong with a drawn panel's empty state: `{ text, action }` or `{ text, reason }`, the
 * sentence the panel says when its read answers with nothing and the next step it offers there, or
 * why it offers none; `{ never: true, reason }` for a panel that always has something to draw. A
 * panel whose empty state is undecided draws whatever its part defaults to for a new account, which is
 * the first screen that account sees.
 */
function panelEmptyProblems(at, empty) {
  if (empty === undefined) return [`${at} is shown with no empty state (empty: { text, action } or { text, reason })`];
  if (empty === null || typeof empty !== "object" || Array.isArray(empty)) return [`${at} empty is not { text, action } or { text, reason }`];
  if (empty.never === true) return hasReason(empty) ? [] : [`${at} empty never has no reason`];
  const problems = [];
  if (!hasText(empty.text)) problems.push(`${at} empty has no text (the sentence the panel says with nothing to draw)`);
  if (empty.action !== undefined && !hasText(empty.action)) problems.push(`${at} empty action is empty`);
  if (empty.action === undefined && !hasReason(empty)) problems.push(`${at} empty offers no action and gives no reason`);
  return problems;
}

/**
 * What is wrong with the body decision of a page that is not a list (a dashboard): `{ shown, reason,
 * panels }`, each panel `{ title, shown, reason, source, span, empty }`. A panel left out is decided as
 * much as one drawn, so every panel carries its reason, and a drawn panel names the read its figures
 * come from and what it says when that read answers with nothing.
 */
function bodyProblems(name, body) {
  if (body === null || typeof body !== "object" || typeof body.shown !== "boolean") return [`${name}: body is not decided (shown true or false)`];
  const problems = [];
  if (!hasReason(body)) problems.push(`${name}: body ${body.shown ? "shown" : "none"} has no reason`);
  if (body.panels === undefined) {
    if (body.shown) problems.push(`${name}: body shown with no panels`);
    return problems;
  }
  if (!Array.isArray(body.panels)) return [...problems, `${name}: body panels are not a list`];
  if (body.shown && !body.panels.some((panel) => panel?.shown === true)) problems.push(`${name}: body shown with no panel shown`);
  const seen = new Set();
  body.panels.forEach((panel, index) => {
    const at = `${name}: body panel ${index + 1}`;
    if (panel === null || typeof panel !== "object" || Array.isArray(panel)) {
      problems.push(`${at} is not { title, shown, reason }`);
      return;
    }
    if (!hasText(panel.title)) problems.push(`${at} has no title`);
    else if (seen.has(panel.title)) problems.push(`${at} repeats the title "${panel.title}"`);
    else seen.add(panel.title);
    if (typeof panel.shown !== "boolean") problems.push(`${at} is not decided (shown true or false)`);
    if (!hasReason(panel)) problems.push(`${at} has no reason`);
    if (panel.shown === true && !hasText(panel.source)) problems.push(`${at} is shown with no source (the read its figures come from)`);
    if (panel.shown === true) problems.push(...panelEmptyProblems(at, panel.empty));
    // A span names the columns the panel takes in a span grid; there is no 3, which has no half to fold into.
    if (panel.span !== undefined && ![1, 2, 4].includes(panel.span)) problems.push(`${at} has span ${panel.span}, not 1, 2 or 4`);
  });
  return problems;
}

/**
 * Every problem of a design manifest against the routed screens.
 *
 * @param manifest  `{ screens, acknowledged }`
 * @param routed    `[{ app, route }]` read from the product's route files
 * @param blocks    path -> the blocks file's text, or undefined when it does not exist
 * @param base      path -> the render the file was generated as, or undefined when it has none; a
 *                  generated page still equal to its render is the template's own, which draws
 *                  the description (and the figures where the Meta counts) without any edit
 */
export function manifestProblems(manifest, routed, blocks, options = {}, base = () => undefined) {
  const problems = [];
  const screens = Array.isArray(manifest.screens) ? manifest.screens : [];
  const byKey = new Map();
  for (const entry of screens) {
    const key = keyOf(entry.app, entry.route);
    if (byKey.has(key)) problems.push(`${key}: two design entries`);
    byKey.set(key, entry);
  }
  const routedKeys = new Set(routed.map((r) => keyOf(r.app, r.route)));
  for (const key of routedKeys) if (!byKey.has(key)) problems.push(`${key}: routed screen with no design entry`);
  for (const key of byKey.keys()) if (!routedKeys.has(key)) problems.push(`${key}: design entry for no routed screen`);

  const acknowledged = new Map();
  for (const ack of Array.isArray(manifest.acknowledged) ? manifest.acknowledged : []) {
    const key = keyOf(ack.app, ack.route);
    if (!hasReason(ack)) problems.push(`${key}: acknowledged without a reason`);
    acknowledged.set(key, ack);
  }
  for (const [key, entry] of byKey) {
    problems.push(...entryProblems(entry, options));
    const asks = FACETS.filter((facet) => entry[facet]?.shown === true);
    const text = entry.blocks ? blocks(entry.blocks) : undefined;
    if (entry.blocks && text === undefined) problems.push(`${key}: blocks file ${entry.blocks} does not exist`);
    const render = entry.blocks ? base(entry.blocks) : undefined;
    const stub = text !== undefined && blocksAreEmpty(text);
    const untouched = text !== undefined && render !== undefined && render === text;
    // A stub states nothing. A page still equal to its render states what its template draws.
    const unmet = stub ? asks : untouched ? asks.filter((facet) => !pageDrawsFacet(text, facet)) : [];
    if (acknowledged.has(key)) {
      if (!stub && !untouched) problems.push(`${key}: acknowledged as "${acknowledged.get(key).reason}" but its blocks are customised; remove the acknowledgement`);
    } else if (unmet.length > 0) {
      problems.push(`${key}: the design asks for ${unmet.join(", ")} and ${entry.blocks} draws none of it; draw it there, or list the screen under "acknowledged" with a reason until it is customised`);
    }
  }
  for (const key of acknowledged.keys()) if (!byKey.has(key)) problems.push(`${key}: acknowledged with no design entry`);
  return problems;
}

/** The module a blocks file belongs to: the directory above the `src` it sits in. */
export function moduleRootOf(blocksPath) {
  const parts = blocksPath.split("/");
  const at = parts.lastIndexOf("src");
  return at < 0 ? undefined : parts.slice(0, at).join("/");
}

const camel = (kebab) => kebab.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

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

const code = (text) => withoutComments(text);

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
