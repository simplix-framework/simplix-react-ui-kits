import { readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// The account section's heading is level 1 where it names the page (My account has no page head, so the
// section's h1 is the page's h1) and level 2 under a page head; the part `head` of the `accountSection`
// region must find either, and never a part's title (level 3). The check runs the contract's own
// selector against markup shaped like the parts' output, through a real selector engine: the
// framework checkout's `jsdom`, which this package does not install.

const root = join(import.meta.dirname, "../..");
const contract = JSON.parse(readFileSync(join(root, "regions.json"), "utf8")) as { regions: Record<string, { parts: Record<string, string> }> };
const uiDir = realpathSync(join(root, "../../node_modules/@simplix-react/ui"));
const { JSDOM } = createRequire(join(uiDir, "package.json"))("jsdom") as { JSDOM: new (html: string) => { window: { document: Document } } };

/** The CSS a part mark stands for, as the rendered probe writes it (`site-regions-rendered.mjs`): a slot, optionally qualified, on either the slot or the part attribute. */
function selectorOf(mark: string): string {
  const at = mark.search(/[[:]/);
  const slot = at < 0 ? mark : mark.slice(0, at);
  const rest = at < 0 ? "" : mark.slice(at);
  return `[data-slot="${slot}"]${rest}, [data-part="${slot}"]${rest}`;
}

/** The heads of the section part, in document order: level, then text. */
function found(mark: string, html: string): string[] {
  const { document } = new JSDOM(`<body>${html}</body>`).window;
  return [...document.querySelectorAll(selectorOf(mark))].map((element) => `${element.getAttribute("data-level")}:${element.textContent}`);
}

const head = (level: number, text: string) => `<h${level} data-slot="site-section-head" data-s-site-section-head="" data-level="${level}">${text}</h${level}>`;
const section = (...heads: string[]) => `<section data-slot="site-account-section">${heads.join("")}</section>`;

describe("the account section's head part", () => {
  const mark = contract.regions.accountSection?.parts.head ?? "";

  it("finds the section's heading at level 1, where it names the page", () => {
    expect(found(mark, section(head(1, "Subscription"), head(3, "Payment method")))).toEqual(["1:Subscription"]);
  });

  it("finds it at level 2, under a page head", () => {
    expect(found(mark, section(head(2, "Subscription"), head(3, "Payment method")))).toEqual(["2:Subscription"]);
  });

  it("never takes a part's title (level 3), which is the subhead part", () => {
    expect(found(mark, section(head(3, "Payment method")))).toEqual([]);
    expect(found(contract.regions.accountSection?.parts.subhead ?? "", section(head(1, "Subscription"), head(3, "Payment method")))).toEqual(["3:Payment method"]);
  });

  it("is a selector that matches at the level the portal draws, which a level-2-only selector misses", () => {
    const old = 'site-section-head[data-level="2"]';
    expect(found(old, section(head(1, "Subscription")))).toEqual([]);
    expect(found(mark, section(head(1, "Subscription")))).toEqual(["1:Subscription"]);
  });
});
