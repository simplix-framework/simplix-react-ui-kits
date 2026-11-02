// Readers of server-rendered markup the segment tests share. The tests render with
// `renderToStaticMarkup`, as console-core's do, so they read the HTML text rather than a DOM.

/** One opening tag of the markup: its name and its attributes. */
export interface MarkupTag {
  readonly name: string;
  readonly attributes: Readonly<Record<string, string>>;
}

/** Every opening tag of `html`, in document order. */
export function tagsOf(html: string): MarkupTag[] {
  const tags: MarkupTag[] = [];
  for (const match of html.matchAll(/<([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^\s=>/]+(?:="[^"]*")?)*)\s*\/?>/g)) {
    const attributes: Record<string, string> = {};
    for (const attribute of (match[2] ?? "").matchAll(/([^\s=]+)(?:="([^"]*)")?/g)) {
      attributes[attribute[1] ?? ""] = attribute[2] ?? "";
    }
    tags.push({ name: (match[1] ?? "").toLowerCase(), attributes });
  }
  return tags;
}

/** Tags that carry no look of their own: a table's row groups, a line break and the shapes inside a glyph. */
const STRUCTURAL = new Set(["thead", "tbody", "br", "path", "circle"]);

/** The tags that should carry a `data-slot` and do not. */
export function unmarked(html: string): string[] {
  return tagsOf(html)
    .filter((tag) => !STRUCTURAL.has(tag.name) && tag.attributes["data-slot"] === undefined)
    .map((tag) => `<${tag.name}>`);
}

/** The tags whose `data-slot` is `slot`. */
export function bySlot(html: string, slot: string): MarkupTag[] {
  return tagsOf(html).filter((tag) => tag.attributes["data-slot"] === slot);
}

/**
 * The elements a keyboard reaches with Tab: links with an address and buttons, minus those taken
 * out of the order (`tabindex="-1"`) or disabled.
 */
export function tabStops(html: string): MarkupTag[] {
  return tagsOf(html).filter((tag) => {
    const focusable = (tag.name === "a" && tag.attributes.href !== undefined) || tag.name === "button";
    return focusable && tag.attributes.tabindex !== "-1" && tag.attributes.disabled === undefined;
  });
}

/**
 * The disabled site actions refused in silence: a disabled `site-action` whose `aria-describedby` is
 * missing or names no element of the markup. `except` lists action ids whose label already is the
 * statement (a plan card's "Your plan").
 */
export function silentRefusals(html: string, except: readonly string[] = []): string[] {
  const tags = tagsOf(html);
  const ids = new Set(tags.map((tag) => tag.attributes.id).filter((id): id is string => id !== undefined));
  return tags
    .filter((tag) => tag.attributes["data-slot"] === "site-action" && tag.attributes.disabled !== undefined)
    .filter((tag) => !except.includes(tag.attributes["data-action"] ?? ""))
    .filter((tag) => {
      const described = (tag.attributes["aria-describedby"] ?? "").split(/\s+/).filter(Boolean);
      return described.length === 0 || !described.every((id) => ids.has(id));
    })
    .map((tag) => tag.attributes["data-action"] ?? "?");
}
