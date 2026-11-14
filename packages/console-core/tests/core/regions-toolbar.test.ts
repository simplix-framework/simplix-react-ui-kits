import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

// The toolbar region is the filter bar the framework draws over a list. Every control that bar draws
// inline, outside its popover, is a control of the toolbar region: a control missing from the contract is
// reported on any list that reaches the state which draws it (`crud-filter-bar-chip-remove` stands in
// every active filter chip). The probe runs here against markup in the framework checkout's `jsdom`,
// which this package does not install.

// @ts-expect-error the script is plain JavaScript that a product's runner imports
import { compare, contract, probe, regionsOf } from "../../scripts/regions-rendered.mjs";
import { installedFramework } from "../installed-framework";

const framework = installedFramework();
const { JSDOM } = createRequire(join(framework, "package.json"))("jsdom") as { JSDOM: new (html: string) => { window: Window & typeof globalThis } };

/**
 * The slots the framework's filter bar draws on a pressable element inline in the bar, in the order
 * of its markup (`crud/filters/filter-bar.tsx`, `chip-filter.tsx`, `choice-chips.tsx`,
 * `view-mode-toggle.tsx`). A control inside the filter popover is portalled out of the bar and is not
 * listed.
 */
const INLINE_CONTROL_SLOTS = [
  "crud-filter-bar-trigger",
  "crud-filter-bar-chip-remove",
  "crud-filter-bar-clear-button",
  "crud-filter-bar-columns-button",
  "crud-filter-bar-view-button",
  "crud-chip-filter-chip",
] as const;

const toolbar = (buttons: readonly string[]) =>
  `<main><div data-slot="console-record-list"><div data-part="crud-filter-bar">${buttons.map((slot) => `<button data-slot="${slot}"></button>`).join("")}</div></div></main>`;

function problemsOf(html: string): string[] {
  const { window } = new JSDOM(`<body>${html}</body>`);
  Object.assign(globalThis, { document: window.document, getComputedStyle: window.getComputedStyle.bind(window) });
  return compare({ ...probe(regionsOf("list-detail"), "main"), rows: 0 }, "list-detail");
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, "document");
  Reflect.deleteProperty(globalThis, "getComputedStyle");
});

describe("the toolbar region's controls", () => {
  it("name every control the filter bar draws inline, including the remove button inside an active chip", () => {
    const toolbarControls: readonly string[] = contract.regions.toolbar.controls;
    expect(INLINE_CONTROL_SLOTS.filter((slot) => !toolbarControls.includes(slot))).toEqual([]);
  });

  it("draw each of those controls without a problem on a list with an active filter", () => {
    expect(problemsOf(toolbar(INLINE_CONTROL_SLOTS)).filter((problem) => problem.startsWith("toolbar:"))).toEqual([]);
  });

  it("still report a control the filter bar does not draw in its toolbar", () => {
    const problems = problemsOf(toolbar([...INLINE_CONTROL_SLOTS, "crud-filter-bar-dropdown-trigger"]));
    expect(problems.some((problem) => problem.startsWith("toolbar: crud-filter-bar-dropdown-trigger not allowed"))).toBe(true);
  });

  it("keep the listed slots in the framework's filter bar sources, so a rename there fails here", () => {
    const sources = ["filter-bar.tsx", "filter-bar.style.ts", "chip-filter.style.ts", "view-mode-toggle.tsx"]
      .map((file) => readFileSync(join(framework, "src/crud/filters", file), "utf8"))
      .join("\n");
    expect(INLINE_CONTROL_SLOTS.filter((slot) => !sources.includes(`"${slot}"`))).toEqual([]);
  });
});
