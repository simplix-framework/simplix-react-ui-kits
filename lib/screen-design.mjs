// The readers and checks behind checks/screen-design.mjs. Every function takes the text or the
// lookup it needs and touches no file, so each is proved on its own hit and miss cases in
// screen-design.test.mjs.

const FACETS = ["description", "cards", "notices"];

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
const hasReason = (decision) => typeof decision?.reason === "string" && decision.reason.trim() !== "";

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
  } else if (list.presentation === "none") {
    if (!hasReason(list)) problems.push(`${name}: list none has no reason`);
  } else {
    if (typeof list.leading !== "string" || list.leading === "") problems.push(`${name}: list has no leading column`);
    const field = list.sort?.field;
    if (typeof field !== "string" || field === "") {
      problems.push(`${name}: list has no default sort`);
    } else if (entry.entity && field === primaryKeyOf(entry.entity, primaryKey)) {
      problems.push(`${name}: list sorts by its primary key ${field}, which orders nothing a reader knows`);
    }
    if (!Array.isArray(list.filters)) problems.push(`${name}: list filters are not decided`);
  }
  if (!Array.isArray(entry.detail?.sections)) problems.push(`${name}: detail sections are not decided`);
  if (entry.menu !== undefined) {
    for (const field of ["group", "icon"]) {
      if (typeof entry.menu?.[field] !== "string" || entry.menu[field].trim() === "") {
        problems.push(`${name}: menu has no ${field}`);
      }
    }
  }
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
