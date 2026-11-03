import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// The site stylesheet against what it draws and what it reads: every slot site-core declares is
// drawn, every site variable a rule reads is defined in the tokens file, and every variable the
// tokens file defines is documented in the README a product's token script is written from.
// @ts-expect-error: a plain ES module without declarations
import { declaredSlots } from "../scripts/check-site-regions.mjs";

const root = join(import.meta.dirname, "..");
const read = (path: string) => readFileSync(join(root, path), "utf8");

/**
 * Slots a stylesheet draws: every `[data-slot="..."]` its rules name, and every `[data-part="..."]`,
 * the mark a site part puts on a framework part it draws (a checkbox, a select).
 */
const drawnSlots = (css: string) => new Set([...css.matchAll(/\[data-(?:slot|part)="([^"]+)"\]/g)].map((m) => m[1] ?? ""));
/** Site variables a text reads with `var(--site-...)` or Tailwind's `(--site-...)` shorthand. */
const readVariables = (text: string) => new Set([...text.matchAll(/(?:var\(|\()(?:[a-z-]+:)?(--site-[a-z0-9-]+)/g)].map((m) => m[1] ?? ""));
/** Site variables a stylesheet defines. */
const definedVariables = (css: string) => new Set([...css.matchAll(/(--site-[a-z0-9-]+)\s*:/g)].map((m) => m[1] ?? ""));
/** Site variables a README lists in a table row (`| \`--site-x\` |`). */
const documentedVariables = (markdown: string) => new Set([...markdown.matchAll(/^\|\s*`(--site-[a-z0-9-]+)`/gm)].map((m) => m[1] ?? ""));
const without = (a: Set<string>, b: Set<string>) => [...a].filter((x) => !b.has(x)).sort();

describe("the site app stylesheet", () => {
  it("draws thin scrollbars without a track on the document and inside the site, as the design does", () => {
    const app = read("src/styles/app.css");
    expect(app).toMatch(/:root,\s*:where\(\[data-slot="site-window"\], \[data-slot="site-auth"\]\) \* \{\s*scrollbar-width: thin;\s*scrollbar-color: var\(--site-ink-faint\) transparent;/);
  });
});

describe("the site stylesheet", () => {
  const css = read("src/styles/designs/clarity.css");
  const tokens = read("src/styles/site-tokens.css");
  const readme = read("README.md");
  const slots: Set<string> = declaredSlots();

  it("draws every slot site-core declares and no slot it does not", () => {
    expect(slots.size).toBeGreaterThan(0);
    expect(without(slots, drawnSlots(css))).toEqual([]);
    expect(without(drawnSlots(css), slots)).toEqual([]);
  });

  it("reads only site variables the tokens file defines", () => {
    const defined = definedVariables(tokens);
    expect(without(readVariables(css), defined)).toEqual([]);
    expect(without(readVariables(tokens), defined)).toEqual([]);
  });

  it("documents every variable the tokens file defines, and only those", () => {
    const defined = definedVariables(tokens);
    expect(without(defined, documentedVariables(readme))).toEqual([]);
    expect(without(documentedVariables(readme), defined)).toEqual([]);
  });

  it("names the page tiers the container variants reflow on", () => {
    for (const tier of ["page-narrow", "page-medium", "page-wide"]) expect(tokens).toMatch(new RegExp(`--container-${tier}:`));
  });
});

describe("the readers the checks use", () => {
  it("find a slot a stylesheet leaves out and a variable nobody defines", () => {
    const css = '[data-slot="site-bar"][data-s-site-bar] { @apply bg-(--site-surface) text-(length:--site-fs-base); color: var(--site-ink); }';
    expect(without(new Set(["site-bar", "site-footer"]), drawnSlots(css))).toEqual(["site-footer"]);
    expect([...drawnSlots(':where([data-part="site-checkbox"])[data-part][data-p-site-checkbox] { @apply size-4; }')]).toEqual(["site-checkbox"]);
    expect([...readVariables(css)].sort()).toEqual(["--site-fs-base", "--site-ink", "--site-surface"]);
    expect(without(readVariables(css), definedVariables(":root { --site-ink: #000; --site-surface: #fff; }"))).toEqual(["--site-fs-base"]);
  });

  it("read a documented variable only from a table row", () => {
    const markdown = "| `--site-ink` | text |\nThe `--site-line` in prose is not a row.\n";
    expect([...documentedVariables(markdown)]).toEqual(["--site-ink"]);
  });
});

describe("the site window against a host's base layer", () => {
  const app = read("src/styles/app.css");
  const reset = /@layer base\s*{\s*:where\(\[data-slot="site-window"\]\)\s*:is\(h1, h2, h3, h4, h5, h6\)\s*{([^}]*)}/.exec(app);

  it("puts every heading inside the window back to full opacity and the inherited family", () => {
    expect(reset?.[1]).toMatch(/opacity:\s*1;/);
    expect(reset?.[1]).toMatch(/font-family:\s*inherit;/);
  });

  it("matches a heading with an element's weight, so it wins over a host's bare h1 rule that comes before it", () => {
    // `:where(...)` alone would weigh nothing and lose to the host's `h1 { opacity: 0.8 }`.
    expect(app).not.toMatch(/:where\([^)]*\)\s*:where\(h1/);
    expect(app.indexOf("@layer base")).toBeGreaterThan(app.indexOf('@import "./designs/clarity.css"'));
  });
});

