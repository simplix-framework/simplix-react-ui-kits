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

/** Tags that carry no look of their own: a table's row groups and the shapes inside a glyph. */
const STRUCTURAL = new Set(["thead", "tbody", "path", "circle"]);

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
